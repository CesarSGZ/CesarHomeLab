import { userCan, validCsrf } from '../../../_lib/auth.js';
import { json, methodNotAllowed } from '../../../_lib/http.js';
import { snapshotFromCsv, parseCsv } from '../../../_lib/training.js';
import { parseCvlpp, parseLegacy, validateTrainingSettings } from '../../../_lib/training-archives.js';

export async function onRequest(context) {
  const { request, env, data } = context;
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST']);
  if (!data.session) return json({ ok: false, error: 'not_authenticated' }, { status: 401 });
  if (!userCan(data.session.user, 'training:read')) return json({ ok: false, error: 'not_authorised' }, { status: 403 });
  if (request.method === 'POST' && !validCsrf(request, data.session)) return json({ ok: false, error: 'invalid_csrf' }, { status: 403 });
  try {
    const stored = await env.CONTROL_DB.prepare('SELECT payload, updated_at FROM personal_datasets WHERE name = ?').bind('training').first();
    if (!stored) return json({ ok: false, error: 'training_not_configured' }, { status: 503 });
    const dataset = JSON.parse(stored.payload);
    let refreshError = null;
    if (request.method === 'POST') {
      const body = await request.text();
      if (body.length > 40_000) return json({ok:false,error:'request_too_large'},{status:413});
      let action;
      try { action = body ? JSON.parse(body) : null; } catch { return json({ok:false,error:'invalid_request'},{status:400}); }
      if (action?.action === 'settings') {
        try { dataset.settings = validateTrainingSettings(action.settings); }
        catch { return json({ok:false,error:'invalid_settings'},{status:400}); }
        const now = new Date().toISOString();
        await env.CONTROL_DB.prepare('UPDATE personal_datasets SET payload = ?, updated_at = ? WHERE name = ?').bind(JSON.stringify(dataset),now,'training').run();
        return json({ok:true,dataset,saved:true,updatedAt:now});
      }
      if(action && action.action !== 'refresh') return json({ok:false,error:'unknown_action'},{status:400});
      const lastCheck = Date.parse(dataset.checkedAt || '') || 0;
      if (Date.now() - lastCheck < 60_000) return json({ ok: true, dataset, refresh: 'recent', updatedAt: stored.updated_at });
      const now = new Date().toISOString();
      const results = await Promise.allSettled(dataset.source.tabs.map(async tab => {
        const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(dataset.source.id)}/export?format=csv&gid=${tab.gid}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { accept: 'text/csv' } });
        if (!response.ok || !/text\/csv/i.test(response.headers.get('content-type') || '')) throw new Error('sheet_access_unavailable');
        const csv = await response.text();
        if (csv.length > 500_000) throw new Error('sheet_too_large');
        const snapshot = snapshotFromCsv(csv, { id: `live-${tab.gid}`, title: tab.title, gid: tab.gid, planDate: tab.date || null, observedAt: now, origin: 'live' });
        if (!snapshot.exercises.some(exercise => exercise.kind === 'main')) throw new Error('sheet_structure_changed');
        return snapshot;
      }));
      // Do not silently drop a plan when one tab is inaccessible.
      if (results.some(result => result.status === 'rejected')) refreshError = 'No se ha podido actualizar toda la hoja. Se conserva la última lectura completa.';
      else {
        const phases = results.map(result => result.value);
        const current = phases[0];
        const old = dataset.phases[0];
        if (JSON.stringify(current.exercises) !== JSON.stringify(old.exercises)) {
          dataset.history.push({ ...current, id: `capture-${now}`, origin: 'capture', observedAt: now });
        }
        dataset.phases = phases;
        dataset.checkedAt = now;
        dataset.history = dataset.history.slice(-300);
        // Refresh each archive independently; an unavailable older book must not
        // destroy its imported records or prevent updating the current routine.
        const archiveErrors=[];
        for(const source of dataset.source.extra || []) {
          try {
            const tabs=await Promise.all(source.tabs.map(async tab=>{
              const response=await fetch(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(source.id)}/export?format=csv&gid=${tab.gid}`,{signal:AbortSignal.timeout(15_000),headers:{accept:'text/csv'}});
              if(!response.ok||!/text\/csv/i.test(response.headers.get('content-type')||''))throw new Error('unavailable');
              const csv=await response.text();if(csv.length>500_000)throw new Error('too_large');
              return {name:tab.title,rows:parseCsv(csv)};
            }));
            const records=source.kind==='cvlpp'?parseCvlpp(tabs):parseLegacy(tabs[0].rows);
            if(!records.length)throw new Error('structure_changed');
            const index=(dataset.archives||[]).findIndex(archive=>archive.id===source.kind);
            const archive={id:source.kind,title:source.title,checkedAt:now,records};
            if(index<0)(dataset.archives ||= []).push(archive);else dataset.archives[index]=archive;
          } catch { archiveErrors.push(source.title); }
        }
        if(archiveErrors.length)refreshError=`Rutina actualizada. Se conserva la última importación de: ${archiveErrors.join(', ')}.`;
        await env.CONTROL_DB.prepare('UPDATE personal_datasets SET payload = ?, updated_at = ? WHERE name = ?').bind(JSON.stringify(dataset), now, 'training').run();
      }
    }
    // Source IDs/configuration remain behind owner authentication, as do all measurements.
    return json({ ok: true, dataset, refreshError, updatedAt: dataset.checkedAt || stored.updated_at });
  } catch {
    return json({ ok: false, error: 'training_unavailable' }, { status: 503 });
  }
}
