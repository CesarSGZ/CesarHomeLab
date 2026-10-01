// Shared, deterministic analysis. Measurements are supplied only by the private API.
export const muscleReferences = [
  { id:'chest', label:'Pecho', reference:'Bench Press', aliases:['bench press','bench','bp'] },
  { id:'back', label:'Espalda', reference:'Lat Pulldown TGD', aliases:['lat pulldown tgd'] },
  { id:'shoulders', label:'Hombros', reference:'Overhead Press', aliases:['overhead press','overhead','op'] },
  { id:'biceps', label:'Bíceps', reference:'Biceps Curl Barra', aliases:['biceps curl barra'] },
  { id:'triceps', label:'Tríceps', reference:'Tríceps Polea Cuerda Alta', aliases:['triceps polea cuerda alta'] },
  { id:'quads', label:'Cuádriceps', reference:'Squat / Sentadilla', aliases:['squat','sq','sentadilla'] },
  { id:'hamstrings', label:'Isquios / cadena posterior', reference:'Deadlift', aliases:['deadlift','dl'] },
  { id:'glutes', label:'Glúteos', reference:'Hip Thrust', aliases:['hip thrust'] },
  { id:'calves', label:'Gemelos', reference:'Gemelos TGD Individual', aliases:['gemelos tgd individual'] },
  { id:'abs', label:'Abdominales', reference:'Weighted Crunch Abs', aliases:['weighted crunch abs'] },
  { id:'abductors', label:'Abductores', reference:'Abductores HS Discos', aliases:['abductores hs discos'] }
];
export const key = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
export function muscleFor(name, group='') {
  const n=key(name), g=key(group);
  if (/thrust|glute/.test(n)) return 'glutes';
  if (/crunch|\babs\b|abdominal|wood chopper|leg raise/.test(n)) return 'abs';
  if (/deadlift|leg curl/.test(n)) return 'hamstrings';
  if (/abductor/.test(n)) return 'abductors';
  if (/bicep|ballesyan|curl scott|hammer curl/.test(n+g)) return 'biceps';
  if (/tricep|french press|pjr/.test(n+g)) return 'triceps';
  if (/bench|chest|pecho/.test(n+g)) return 'chest';
  if (/gemelo|calf/.test(n+g)) return 'calves';
  if (/squat|sentadilla|hacka|leg extension|step down|quad/.test(n+g)) return 'quads';
  if (/pulldown|remo|\brow\b|dominada|espalda/.test(n+g)) return 'back';
  if (/face pull|hombro|lateral|delts|overhead|aperturas|shoulder/.test(n+g)) return 'shoulders';
  if (/isquio|ham/.test(g)) return 'hamstrings';
  if (/glut/.test(g)) return 'glutes';
  if (/^abs$/.test(g)) return 'abs';
  return null;
}
export function estimated1RM(load,reps) {
  if (!Number.isFinite(load)||!Number.isFinite(reps)||load<=0||reps<1||reps>15||!Number.isInteger(reps)) return null;
  return reps===1 ? load : load*(1+reps/30); // Epley, not a measured maximum.
}
export function strengthPrescription(raw, settings={}) {
  const text=String(raw||'').trim();
  if (/segundos|minutos|\bseg\b|\bsec\b/i.test(text)) return { reason:'Registro de tiempo, no de carga' };
  if (/\bfallo\b/i.test(text)) return { reason:'Nota de fallo: no se confirma cuántas repeticiones se completaron' };
  const match=text.match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)(?:\s*[x×]\s*(\d+(?:[.,]\d+)?))?/i);
  if (!match) return { reason:'No hay repeticiones y carga inequívocas' };
  let reps=Number(match[1].replace(',','.')),load=Number(match[2].replace(',','.'));
  if (match[3]) {
    if (!settings.doubleSidedNotation) return { reason:'Notación de tres números pendiente de confirmar' };
    const third=Number(match[3].replace(',','.'));
    if (reps===2 && load>2) { reps=load; load=third*2; }
    else if (load===2) load=third*2;
    else return { reason:'Notación de tres números no reconocida' };
  }
  const e1rm=estimated1RM(load,reps);
  return e1rm===null?{reason:'Solo se estima con 1–15 repeticiones y carga positiva'}:{load,reps,e1rm,highReps:reps>10};
}
export function snapshotRecords(history, settings={},bodyWeight=[]) {
  const result=[];
  for (const snapshot of history||[]) for (const exercise of snapshot.exercises||[]) {
    const muscle=muscleFor(exercise.name,exercise.group);
    for (const [mode,raw,cell] of [['principal',exercise.raw,exercise.cell],['heavy-light',exercise.secondaryRaw,exercise.secondaryCell]]) {
      if (!raw) continue;
      const variant=`${muscle||'other'}:${key(exercise.name)}`;
      const date=snapshot.observedAt?.slice(0,10)||null,prescription=strengthPrescription(raw,settings);
      if(/dominadas lastradas|weighted pull.?up|fondos lastrados/.test(key(exercise.name))&&prescription.e1rm) {
        const mass=bodyWeightAt(bodyWeight,date);
        prescription.recordedLoad=prescription.load;
        if(mass){prescription.load+=mass.weight;prescription.e1rm=estimated1RM(prescription.load,prescription.reps);prescription.bodyWeightIncluded=mass.weight;}
        else{delete prescription.e1rm;prescription.reason='Ejercicio lastrado: falta un peso corporal cercano para estimar la carga total';}
      }
      result.push({id:`${snapshot.id}:${cell}:${mode}`,name:exercise.name,muscle,variant,raw,
        ...prescription, date,dateKind:snapshot.origin==='revision'?'revision':'capture',
        source:snapshot.title,cell,kind:exercise.kind,mode,sourceKey:'current',sequence:null});
    }
  }
  return result;
}
const median = values => { const sorted=values.slice().sort((a,b)=>a-b), mid=Math.floor(sorted.length/2); return sorted.length?sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2:null; };
export function calibrationFor(records,muscle,settings={}) {
  const definition=muscleReferences.find(m=>m.id===muscle);
  if (!definition) return [];
  const eligible=records.filter(r=>r.muscle===muscle&&r.e1rm>0), direct=r=>definition.aliases.includes(key(r.name));
  const anchors=eligible.filter(direct), variants=new Map();
  for (const record of records.filter(r=>r.muscle===muscle)) if(!variants.has(record.variant)) variants.set(record.variant,record.name);
  return [...variants].map(([variant,name])=>{
    if (definition.aliases.includes(key(name))) return {variant,name,factor:1,method:'direct',pairs:0};
    const override=settings.factors?.[variant];
    if (Number.isFinite(override)&&override>0) return {variant,name,factor:override,method:'manual',pairs:0};
    const ratios=[],seen=new Set(),variantRecords=eligible.filter(r=>r.variant===variant);
    const samePeriod=(record,anchor)=>record.date&&anchor.date?record.date===anchor.date:
      !record.date&&!anchor.date&&record.sourceKey===anchor.sourceKey&&record.block===anchor.block&&record.sequence===anchor.sequence;
    const hasExact=variantRecords.some(record=>anchors.some(anchor=>samePeriod(record,anchor)));
    for (const record of variantRecords) {
      // Compare references in the same snapshot/date or the same undated week,
      // never assume that an old routine tab represents a historical session.
      const candidates=anchors.filter(anchor=>hasExact?samePeriod(record,anchor):record.date&&anchor.date?Math.abs(Date.parse(anchor.date)-Date.parse(record.date))<=21*864e5:samePeriod(record,anchor));
      candidates.sort((a,b)=>Math.abs(Date.parse(a.date||'1970-01-01')-Date.parse(record.date||'1970-01-01'))-Math.abs(Date.parse(b.date||'1970-01-01')-Date.parse(record.date||'1970-01-01'))||b.e1rm-a.e1rm);
      const anchor=candidates[0]; if(!anchor) continue;
      const signature=`${record.load}/${record.reps}/${anchor.load}/${anchor.reps}`;
      if(seen.has(signature)) continue; seen.add(signature);
      ratios.push(anchor.e1rm/record.e1rm);
    }
    return {variant,name,factor:median(ratios),method:ratios.length?'personal':'unavailable',pairs:ratios.length,matching:hasExact?'same-period':'near-period'};
  });
}
export function datedArchiveRecords(archives,settings={}) {
  const records=(archives||[]).flatMap(archive=>archive.records);
  const sessionDates=new Map();
  for(const [block,config] of Object.entries(settings.legacyBlocks||{})) {
    if(!config.startDate)continue;
    const start=new Date(config.startDate+'T12:00:00Z'),sessions=[...new Map(records.filter(r=>r.sourceKey==='legacy'&&r.block===block).map(r=>[r.sequence,r])).values()].sort((a,b)=>a.sequence-b.sequence);
    let monthCursor=start.getUTCMonth(),previousDay=null;
    const candidates=sessions.map(r=>{
      let month=r.month,year=start.getUTCFullYear();
      if(month===null||month===undefined){
        if(previousDay!==null&&r.dayOfMonth<previousDay)monthCursor++;
        previousDay=r.dayOfMonth;month=monthCursor;year+=Math.floor(month/12);month%=12;
      }else year+=month<start.getUTCMonth()?1:0;
      const d=new Date(Date.UTC(year,month,r.dayOfMonth,12));
      return {sequence:r.sequence,date:r.dayOfMonth&&d.getUTCMonth()===month&&d.getUTCDate()===r.dayOfMonth?d.toISOString().slice(0,10):null};
    });
    candidates.forEach((candidate,i)=>{
      const previous=candidates[i-1]?.date,next=candidates[i+1]?.date;
      const inconsistent=previous&&next&&previous<=next&&(candidate.date<previous||candidate.date>next);
      sessionDates.set(`${block}:${candidate.sequence}`,inconsistent?{date:null,warning:'Fecha original fuera de orden; pendiente de confirmar'}:{date:candidate.date});
    });
  }
  return records.map(record=>{
    const r={...record};
    if(r.sourceKey==='cvlpp'&&settings.cvlppStart&&r.sequence) {
      r.date=new Date(Date.parse(settings.cvlppStart)+(r.sequence-1)*7*864e5).toISOString().slice(0,10);r.dateKind='aligned-week';
    }
    const config=settings.legacyBlocks?.[r.block];
    if(r.sourceKey==='legacy'&&config?.startDate) {
      const aligned=sessionDates.get(`${r.block}:${r.sequence}`);
      r.date=aligned?.date||null;r.dateWarning=aligned?.warning;
      if(r.date)r.dateKind='aligned-session';
    }
    if(!r.reps&&config?.defaultReps&&r.load>0) {r.reps=config.defaultReps;r.repsAssumed=true;}
    r.e1rm=r.failed?null:estimated1RM(r.load,r.reps);r.highReps=r.reps>10;
    if(!r.e1rm)r.reason=r.failed?'La hoja marca fallo; faltan las repeticiones completadas':'Faltan repeticiones o la carga no es interpretable';
    return r;
  });
}
export function allStrengthRecords(dataset) {
  return [...snapshotRecords(dataset.history,dataset.settings,dataset.bodyWeight?.measurements),...datedArchiveRecords(dataset.archives,dataset.settings)];
}
export function bodyWeightAt(measurements,date,maxDays=14) {
  if(!date||!measurements?.length) return null;
  const timestamp=Date.parse(date),candidates=measurements.filter(m=>Math.abs(Date.parse(m.date)-timestamp)<=maxDays*864e5);
  candidates.sort((a,b)=>Math.abs(Date.parse(a.date)-timestamp)-Math.abs(Date.parse(b.date)-timestamp));
  return candidates[0]||null;
}
export function muscleEvolution(records,muscle,{scope='timeline',directOnly=false,settings={},bodyWeight=[],relative=false}={}) {
  const calibration=calibrationFor(records,muscle,settings), factors=new Map(calibration.map(c=>[c.variant,c]));
  const [sourceKey,block]=scope.split(':');
  const selected=records.filter(r=>r.muscle===muscle&&(scope==='timeline'?Boolean(r.date):r.sourceKey===sourceKey&&(!block||r.block===block)));
  const groups=new Map(),excluded=[];
  for(const record of selected){
    const c=factors.get(record.variant);
    if(!record.e1rm||!c?.factor||(directOnly&&c.method!=='direct')) {excluded.push(record);continue;}
    const pointKey=scope==='timeline'?record.date:String(record.sequence);
    if(!groups.has(pointKey))groups.set(pointKey,[]);
    groups.get(pointKey).push({...record,factor:c.factor,calibration:c,equivalent:record.e1rm*c.factor});
  }
  const points=[...groups].map(([pointKey,contributions])=>{
    const direct=contributions.filter(r=>r.calibration.method==='direct');
    const perVariant=new Map();
    for(const r of contributions)perVariant.set(r.variant,Math.max(perVariant.get(r.variant)||0,r.equivalent));
    const value=direct.length?Math.max(...direct.map(r=>r.equivalent)):median([...perVariant.values()]);
    const mass=bodyWeightAt(bodyWeight,contributions[0].date);
    return {date:contributions[0].date,sequence:contributions[0].sequence,label:scope==='timeline'?pointKey:`${scope==='cvlpp'?'Semana':'Registro'} ${pointKey}`,
      x:scope==='timeline'?Date.parse(pointKey):Number(pointKey),value:relative?(mass?value/mass.weight:null):value,
      absolute:value,derived:!direct.length,contributions,bodyWeight:mass};
  }).filter(p=>p.value!==null).sort((a,b)=>a.x-b.x);
  return {points,calibration,excluded,total:selected.length,undated:records.filter(r=>r.muscle===muscle&&!r.date).length};
}
