/* Thermal Lab · presentación para todo el mundo.
   Todo sale de /control/data/terra-thermal-summary.json (sección "story" + medidas).
   Si cambian los datos, cambian solas la presentación, las fases y los siguientes pasos. */
(function(){
  const NS='http://www.w3.org/2000/svg';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const num=(value,digits=0)=>Number(value).toLocaleString('es-ES',{minimumFractionDigits:digits,maximumFractionDigits:digits});
  const deg=(value,digits=0)=>`${num(value,digits)} °C`;
  const dateEs=(iso,opts={day:'numeric',month:'long',year:'numeric'})=>new Date(`${iso.slice(0,10)}T12:00:00`).toLocaleDateString('es-ES',opts);

  function el(tag,className,html){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(html!==undefined)node.innerHTML=html;
    return node;
  }

  // ---------- Numbers derived from the measurements (never typed by hand) ----------
  function metricsFrom(data){
    const story=data.story||{};
    const head=data.headline_metrics;
    const models=data.model_lineage||[];
    const screening=data.configuration_screening||[];
    const cfd=data.cfd_inputs||{heat_sources:[],air:{density_kg_m3:1.16,cp_J_kgK:1005},grille_derating:.6};
    const fans=data.configuration.fans||[];
    const baseline=screening.find(row=>row.configuration_id==='CFG-000');
    const ideas=screening.filter(row=>row.configuration_id!=='CFG-000'&&row.gpu_peak_model_low_C!=null&&row.stage!=='measured')
      .map(row=>({...row,mid:(row.gpu_peak_model_low_C+row.gpu_peak_model_high_C)/2}))
      .sort((a,b)=>a.mid-b.mid);
    const best=ideas[0];
    const accepted=models.filter(model=>model.decision.startsWith('ACCEPTED'));
    const rejected=models.filter(model=>model.decision.startsWith('REJECTED'));
    const gpuModel=accepted.find(model=>model.id.startsWith('MDL-GPU'))||accepted[0];
    const cpuModel=models.find(model=>model.id.startsWith('MDL-CPU'));
    const rho=cfd.air.density_kg_m3,cp=cfd.air.cp_J_kgK;
    const heatTotal=cfd.heat_sources.reduce((sum,source)=>sum+source.W,0);
    const heatInCase=cfd.heat_sources.filter(source=>source.into_case_air).reduce((sum,source)=>sum+source.W,0);
    const exhaust=fans.filter(fan=>fan.orientation==='exhaust').reduce((sum,fan)=>sum+(fan.max_flow_m3h||0),0);
    const realistic=exhaust*cfd.grille_derating;
    const rise=flow=>heatInCase/(rho*cp*flow/3600);
    const phases=story.phases||[];
    const current=phases.findIndex(phase=>phase.status==='next');
    const gate=story.cfd_gate||[];
    return {
      story,ambient:data.project.ambient_C,volume:data.configuration.case.nominal_internal_volume_L,
      cpuPeak:Math.max(head.cpu_only.peak_temperature_C,head.full_combined.cpu_peak_temperature_C),
      gpuPeak:Math.max(head.gpu_only.peak_temperature_C,head.full_combined.gpu_peak_temperature_C),
      cpuPower:head.cpu_only.mean_power_W,gpuPower:head.gpu_only.mean_power_W,
      combinedCpu:head.full_combined.cpu_peak_temperature_C,combinedGpu:head.full_combined.gpu_peak_temperature_C,
      combinedPower:head.full_combined.mean_chip_power_W,
      cpuLimit:story.limits?.cpu_C,
      tests:(data.experimental_campaign||[]).length,models,accepted,rejected,gpuModel,cpuModel,
      baseline:baseline?baseline.gpu_peak_model_low_C:head.gpu_only.peak_temperature_C,ideas,best,
      heatSources:cfd.heat_sources,heatTotal,heatInCase,exhaust,realistic,rise,wPerM3h:rho*cp/3600,
      phases,current,gate,gateDone:gate.filter(item=>item.done).length,
      updated:story.updated||data.generated_at.slice(0,10)
    };
  }

  function metricChip(key,m){
    switch(key){
      case 'cpu_margin':return m.cpuLimit?`CPU ${deg(m.cpuPeak)} · límite ${deg(m.cpuLimit)}`:`CPU ${deg(m.cpuPeak)}`;
      case 'gpu_error':return m.gpuModel?`error típico ±${deg(m.gpuModel.validation_rmse_C,1)}`:'';
      case 'shared_air':return m.cpuModel?`CPU con carga doble: ±${deg(Array.isArray(m.cpuModel.validation_rmse_C)?m.cpuModel.validation_rmse_C[0]:m.cpuModel.validation_rmse_C,1)}`:'';
      case 'best_saving':return m.best?`la mejor: −${num(m.baseline-m.best.gpu_peak_model_high_C,0)} a −${deg(m.baseline-m.best.gpu_peak_model_low_C)}`:'';
      case 'air_rise':return `${num(m.heatInCase)} W · aire +${deg(m.rise(m.realistic))}`;
      case 'models_rejected':return `${m.rejected.length} de ${m.models.length} modelos suspendidos`;
      default:return '';
    }
  }

  // ---------- Small SVG pieces ----------
  function caseArt(){
    return `<svg viewBox="0 0 320 260" class="dk-case" aria-hidden="true">
      <defs><radialGradient id="dk-glow" cx="50%" cy="55%" r="55%"><stop offset="0" stop-color="var(--tl-hot)" stop-opacity=".75"/><stop offset=".55" stop-color="var(--tl-amber)" stop-opacity=".25"/><stop offset="1" stop-color="var(--tl-hot)" stop-opacity="0"/></radialGradient></defs>
      <rect x="70" y="40" width="180" height="190" rx="18" class="dk-case-box"/>
      <ellipse cx="160" cy="140" rx="120" ry="110" fill="url(#dk-glow)" class="dk-pulse"/>
      <g class="dk-slots">${Array.from({length:9},(_,i)=>`<line x1="86" y1="${66+i*17}" x2="104" y2="${66+i*17}"/><line x1="216" y1="${66+i*17}" x2="234" y2="${66+i*17}"/>`).join('')}</g>
      <g class="dk-air-in"><path d="M10 110H58"/><path d="M10 160H58"/><path d="M310 110H262"/><path d="M310 160H262"/></g>
      <g class="dk-air-out"><path d="M160 34V0"/><path d="M160 236V258"/></g>
      <text x="160" y="146" text-anchor="middle" class="dk-case-label">10,4 L</text>
    </svg>`;
  }

  function thermometer(label,value,max,limit,room,sub){
    const top=24,bottom=228,height=bottom-top;
    const y=t=>bottom-(Math.min(t,max)-0)/max*height;
    const limitLine=limit?`<line x1="22" x2="92" y1="${y(limit)}" y2="${y(limit)}" class="dk-th-limit"/><text x="98" y="${y(limit)+4}" class="dk-th-tag dk-th-limit-t">límite ${deg(limit)}</text>`:'';
    return `<figure class="dk-th">
      <svg viewBox="0 0 230 280" role="img" aria-label="${esc(label)}: ${deg(value,1)}">
        <rect x="43" y="${top-6}" width="28" height="${height+6}" rx="14" class="dk-th-tube"/>
        <rect x="49" y="${y(value)}" width="16" height="${bottom-y(value)}" rx="8" class="dk-th-fill"/>
        <circle cx="57" cy="246" r="24" class="dk-th-bulb"/>
        ${limitLine}
        <line x1="22" x2="92" y1="${y(room)}" y2="${y(room)}" class="dk-th-room"/>
        <text x="98" y="${y(room)+4}" class="dk-th-tag">cuarto ${deg(room,1)}</text>
      </svg>
      <figcaption><strong>${esc(label)} <em>${deg(value)}</em></strong><span>${sub}</span></figcaption>
    </figure>`;
  }

  const ICONS={
    pc:'<rect x="6" y="4" width="20" height="24" rx="3"/><path d="M11 9h10M11 13h10"/><circle cx="16" cy="21" r="3"/>',
    fan:'<circle cx="16" cy="16" r="12"/><path d="M16 16c0-6 3-9 6-8M16 16c6 0 9 3 8 6M16 16c0 6-3 9-6 8M16 16c-6 0-9-3-8-6"/><circle cx="16" cy="16" r="2"/>',
    print:'<path d="M6 26h20M9 26V14h14v12M12 14V6h8v8"/><path d="M16 18v4"/>',
    calc:'<rect x="7" y="4" width="18" height="24" rx="3"/><path d="M11 9h10M11 15h2M15 15h2M19 15h2M11 20h2M15 20h2M19 20h2"/>',
    job:'<rect x="5" y="10" width="22" height="16" rx="3"/><path d="M12 10V7h8v3M5 17h22"/>',
    teach:'<path d="M3 12l13-6 13 6-13 6z"/><path d="M9 15v6c4 3 10 3 14 0v-6"/>',
    ok:'<circle cx="16" cy="16" r="12"/><path d="M10 16l4 4 8-8"/>',
    warn:'<path d="M16 4l13 23H3z"/><path d="M16 13v6M16 23v.5"/>',
    info:'<circle cx="16" cy="16" r="12"/><path d="M16 14v8M16 10v.5"/>',
    build:'<path d="M6 26l10-10M19 6l7 7-4 4-7-7z"/>',
    test:'<path d="M4 24l7-8 5 5 6-9 6 6"/><path d="M4 28h24"/>',
    model:'<circle cx="8" cy="16" r="4"/><circle cx="24" cy="16" r="4"/><path d="M12 16h8"/>',
    rank:'<path d="M6 8h20M6 16h14M6 24h8"/>',
    page:'<rect x="6" y="4" width="20" height="24" rx="3"/><path d="M10 10h12M10 15h12M10 20h7"/>',
    parts:'<rect x="5" y="5" width="9" height="9" rx="2"/><rect x="18" y="5" width="9" height="9" rx="2"/><rect x="5" y="18" width="9" height="9" rx="2"/><rect x="18" y="18" width="9" height="9" rx="2"/>'
  };
  const icon=name=>`<svg viewBox="0 0 32 32" class="dk-icon" aria-hidden="true">${ICONS[name]||ICONS.info}</svg>`;

  // ---------- A/B tests of the printed ducts (deck and page share it) ----------
  function abChart(ab,lang='es'){
    if(!ab||!ab.rows?.length)return '';
    const es=lang==='es';
    const T=es?{alone:'solo',both:'con la gráfica',fan:'ventilador gráfica',pending:'pendiente',room:'cuarto',ref:'referencia',power:'Potencia que aguanta el procesador (W, más = mejor)',fanHead:'vent. gráfica'}
             :{alone:'alone',both:'with GPU load',fan:'GPU fan',pending:'pending',room:'room',ref:'reference',power:'Power the CPU sustains (W, more = better)',fanHead:'GPU fan'};
    const fmt=(v,dg=0)=>Number(v).toLocaleString(es?'es-ES':'en-GB',{minimumFractionDigits:dg,maximumFractionDigits:dg});
    const done=ab.rows.filter(r=>r.status==='done');
    const ref=ab.rows.find(r=>r.id===ab.reference)||done[0];
    const max=Math.max(...done.map(r=>Math.max(r.cpu_alone_W,r.cpu_combined_W)))*1.06;
    const pct=(v,base)=>{const d=(v/base-1)*100;return Math.abs(d)<0.5?'=':`${d>0?'+':'−'}${fmt(Math.abs(d))} %`};
    const best=done.reduce((a,b)=>b.cpu_combined_W>a.cpu_combined_W?b:a,done[0]);
    const rows=ab.rows.map(r=>{
      const name=`<span class="ab-name"><b>${esc(es?r.title_es:r.title_en)}</b><small>${esc(r.id)}${r.ambient_C!=null?` · ${T.room} ${fmt(r.ambient_C,r.ambient_C%1?1:0)} °C`:''}${r===ref?` · ${T.ref}`:''}</small></span>`;
      if(r.status!=='done')return `<li class="ab-row todo">${name}<span class="ab-bars"><i class="ab-pending">${T.pending} · ${esc(es?r.detail_es:r.detail_en)}</i></span><span class="ab-fan">—</span></li>`;
      const bar=(v,cls,label)=>`<span class="ab-bar ${cls}"><i style="width:${(v/max*100).toFixed(1)}%"></i><em>${fmt(v)} W <small>${label}${r!==ref?` · ${pct(v,cls==='alone'?ref.cpu_alone_W:ref.cpu_combined_W)}`:''}</small></em></span>`;
      const fd=r.gpu_fan_pct-ref.gpu_fan_pct;
      return `<li class="ab-row${r===best?' best':''}${r===ref?' ref':''}">${name}<span class="ab-bars">${bar(r.cpu_alone_W,'alone',T.alone)}${bar(r.cpu_combined_W,'both',T.both)}</span><span class="ab-fan"><i class="ab-fan-l">${T.fan}</i><b>${fmt(r.gpu_fan_pct)} %</b>${r!==ref&&Math.abs(fd)>=0.5?`<small class="${fd<0?'good':'bad'}">${fd>0?'+':'−'}${fmt(Math.abs(fd),1)}</small>`:''}</span></li>`;
    }).join('');
    const gain=(best.cpu_combined_W/ref.cpu_combined_W-1)*100;
    const callout=es
      ? `<b>${esc(best.title_es)}</b> es lo mejor hasta ahora: el procesador aguanta un <b>${fmt(gain)} % más de potencia</b> con la gráfica trabajando a la vez (${fmt(best.cpu_combined_W)} W frente a ${fmt(ref.cpu_combined_W)} W sin nada).`
      : `<b>${esc(best.title_en)}</b> is the best so far: the CPU sustains <b>${fmt(gain)} % more power</b> while the GPU is also loaded (${fmt(best.cpu_combined_W)} W vs ${fmt(ref.cpu_combined_W)} W with nothing fitted).`;
    return `<div class="ab-wrap"><div class="ab">
      <div class="ab-head"><span></span><span>${T.power}</span><span>${T.fanHead}</span></div>
      <ol>${rows}</ol>
      <p class="ab-legend"><span><i class="alone"></i>${es?'procesador solo':'CPU alone'}</span><span><i class="both"></i>${es?'procesador + gráfica a la vez':'CPU + GPU together'}</span><span>${es?'% = cambio frente a la referencia':'% = change vs the reference'}</span></p>
      ${best!==ref?`<p class="dk-callout ab-callout">${callout}</p>`:''}
      <p class="dk-muted ab-note">${esc(es?ab.note_es:ab.note_en)}</p>
    </div></div>`;
  }

  // ---------- Slides ----------
  function slides(m,data){
    const s=m.story;
    const list=[];
    const add=(id,label,html,extra='')=>list.push({id,label,html,extra});
    const phaseStrip=m.phases.map((phase,index)=>`<li class="${phase.status}"><i>${phase.status==='done'?'✓':index+1}</i><span>${esc(phase.title.es)}</span></li>`).join('');
    const currentPhase=m.phases[m.current];

    add('portada','Portada',`
      <div class="dk-cover">
        <div>
          <p class="dk-kicker">Thermal Lab · Fractal Terra</p>
          <h2 class="dk-title">${esc(s.question_es)}</h2>
          <p class="dk-lead">${esc(s.one_liner_es)}</p>
          <ol class="dk-phases">${phaseStrip}</ol>
          <p class="dk-meta">${currentPhase?`Ahora: <b>fase ${m.current+1} de ${m.phases.length} · ${esc(currentPhase.title.es)}</b> · `:''}actualizado el ${dateEs(m.updated)}</p>
        </div>
        ${caseArt()}
      </div>`,'dk-s-cover');

    const timeline=(s.timeline||[]).map((item,index,all)=>{
      const newDate=index===0||all[index-1].date!==item.date;
      return `<li class="${index===all.length-1?'last':''}">
        <time ${newDate?'':'class="same"'}>${newDate?dateEs(item.date,{day:'numeric',month:'short'}):''}</time>
        <i>${icon(item.kind)}</i>
        <div><strong>${esc(item.title)}</strong><p>${esc(item.detail)}</p></div>
      </li>`;
    }).join('');
    add('camino','Lo que hemos hecho',`
      <p class="dk-kicker">El camino hasta hoy</p>
      <h2 class="dk-h">Lo que hemos ido haciendo</h2>
      <ol class="dk-timeline">${timeline}</ol>`);

    const HEAT_ES={GPU:'Gráfica',CPU:'Procesador',PSU:'Fuente',BOARD:'Placa y resto'};
    const bulbs=Math.round(m.heatTotal/100);
    const segs=m.heatSources.map(source=>`<span class="dk-heat-${source.id.toLowerCase()}" style="--w:${source.W/m.heatTotal*100}%"><b>${esc(HEAT_ES[source.id]||source.label)}</b>${num(source.W)} W</span>`).join('');
    add('reto','El reto',`
      <p class="dk-kicker">El reto</p>
      <h2 class="dk-h">Mucho calor en muy poco sitio</h2>
      <div class="dk-split">
        <div class="dk-big">
          <strong>${num(m.heatTotal)}<small> W</small></strong>
          <p>de calor a plena carga, dentro de una caja de <b>${num(m.volume,1)} litros</b> (como una caja de zapatos).</p>
          <div class="dk-bulbs" aria-label="${bulbs} bombillas">${Array.from({length:bulbs},()=>'<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 2a9 9 0 0 0-5 16.5V23h10v-4.5A9 9 0 0 0 12 2z"/><path d="M8 26h8M9 29h6"/></svg>').join('')}</div>
          <p class="dk-muted">Es como tener <b>${bulbs} bombillas antiguas de 100 W</b> encendidas ahí dentro. Todo ese calor tiene que salir por unas rejillas.</p>
        </div>
        <div>
          <p class="dk-label">¿Quién calienta?</p>
          <div class="dk-heatbar">${segs}</div>
          <ul class="dk-heat-legend">${m.heatSources.map(source=>`<li><i class="dk-heat-${source.id.toLowerCase()}"></i>${esc(HEAT_ES[source.id]||source.label)} <b>${num(source.W)} W</b></li>`).join('')}</ul>
          <p class="dk-muted">La tarjeta gráfica pone dos de cada tres vatios. Por eso casi todo el estudio gira alrededor de ella.</p>
        </div>
      </div>`);

    add('medido','Lo que hemos medido',`
      <p class="dk-kicker">Lo que hemos medido · ${m.tests} pruebas</p>
      <h2 class="dk-h">¿Cuánto se calienta de verdad?</h2>
      <div class="dk-thermos">
        ${thermometer('Procesador',m.cpuPeak,100,m.cpuLimit,m.ambient,m.cpuLimit?`Pico con esfuerzo máximo. Le quedan <b>${deg(m.cpuLimit-m.cpuPeak)}</b> hasta su límite.`:'Pico con esfuerzo máximo.')}
        ${thermometer('Tarjeta gráfica',m.gpuPeak,100,null,m.ambient,`Pico gastando unos <b>${num(m.gpuPower)} W</b> durante minuto y medio.`)}
        <div class="dk-howtest">
          <p class="dk-label">Así es cada prueba</p>
          <svg viewBox="0 0 260 120" class="dk-step" aria-label="Reposo, esfuerzo y enfriado">
            <path d="M10 96H70C95 96 100 30 130 26S170 24 180 24C200 24 205 92 250 94" class="dk-step-line"/>
            <line x1="70" y1="10" x2="70" y2="108" class="dk-step-mark"/><line x1="180" y1="10" x2="180" y2="108" class="dk-step-mark"/>
            <text x="40" y="116" text-anchor="middle">reposo</text><text x="125" y="116" text-anchor="middle">esfuerzo</text><text x="215" y="116" text-anchor="middle">enfriado</text>
          </svg>
          <p class="dk-muted">Se apunta cada segundo la temperatura, el consumo y la velocidad de los ventiladores. Con las dos a la vez (${num(m.combinedPower)} W): procesador ${deg(m.combinedCpu)}, gráfica ${deg(m.combinedGpu)}.</p>
        </div>
      </div>`);

    add('metodo','Cómo lo estudiamos',`
      <p class="dk-kicker">El método</p>
      <h2 class="dk-h">Primero entender, luego tocar</h2>
      <div class="dk-split">
        <figure class="dk-loop">
          <svg viewBox="0 0 300 300" role="img" aria-label="Ciclo: medir, entender, predecir, comprobar">
            <circle cx="150" cy="150" r="104" class="dk-loop-ring"/>
            ${[['Medir',150,46],['Entender',254,150],['Predecir',150,254],['Comprobar',46,150]].map(([t,x,y],i)=>`<g class="dk-loop-node n${i}"><circle cx="${x}" cy="${y}" r="42"/><text x="${x}" y="${y+5}" text-anchor="middle">${t}</text></g>`).join('')}
            <text x="150" y="146" text-anchor="middle" class="dk-loop-c">y vuelta</text><text x="150" y="166" text-anchor="middle" class="dk-loop-c">a empezar</text>
          </svg>
        </figure>
        <div>
          <p class="dk-label">El modelo, explicado con agua</p>
          <svg viewBox="0 0 420 170" class="dk-water" role="img" aria-label="El calor es como agua: un grifo llena el depósito del chip, pasa al del disipador y sale por un desagüe que abre el ventilador">
            <path d="M14 30h46v16" class="dk-w-pipe"/><path d="M60 46v14" class="dk-w-drop"/>
            <rect x="30" y="66" width="80" height="80" rx="8" class="dk-w-tank"/><rect x="33" y="96" width="74" height="47" rx="5" class="dk-w-water hot"/>
            <path d="M110 128h90" class="dk-w-pipe"/>
            <rect x="200" y="66" width="80" height="80" rx="8" class="dk-w-tank"/><rect x="203" y="110" width="74" height="33" rx="5" class="dk-w-water"/>
            <path d="M280 136h50v24" class="dk-w-pipe wide"/>
            <circle cx="305" cy="136" r="12" class="dk-w-valve"/>
            <text x="37" y="22" class="dk-w-t">grifo = consumo (W)</text>
            <text x="70" y="164" text-anchor="middle" class="dk-w-t">chip</text>
            <text x="240" y="164" text-anchor="middle" class="dk-w-t">disipador + aire</text>
            <text x="305" y="106" text-anchor="middle" class="dk-w-t cool">ventilador</text>
            <text x="418" y="140" text-anchor="end" class="dk-w-t">al cuarto</text>
            <path d="M350 152h20" class="dk-w-arrow"/>
          </svg>
          <p class="dk-muted">El consumo es un grifo que llena de calor el chip. El calor pasa al disipador y sale a la habitación; el ventilador abre más o menos el desagüe. Con solo <b>cuatro números</b> (lo grandes que son los depósitos y lo anchas que son las tuberías) se predice la temperatura.</p>
        </div>
      </div>`);

    const grade=model=>{
      const plain=model.plain_es||{title:model.name,verdict:model.decision,tone:'old',why:model.authority};
      const rmse=Array.isArray(model.validation_rmse_C)?Math.max(...model.validation_rmse_C):model.validation_rmse_C;
      return `<article class="dk-grade ${plain.tone}"><span class="dk-stamp">${esc(plain.verdict)}</span><strong>${esc(plain.title)}</strong><p>${esc(plain.why)}</p>${rmse!=null?`<small>error en el examen: ±${deg(rmse,1)}</small>`:''}</article>`;
    };
    const order={ok:0,old:1,no:2};
    const gradeList=[...m.models].sort((a,b)=>(order[a.plain_es?.tone]??3)-(order[b.plain_es?.tone]??3)).map(grade).join('');
    const plot=m.gpuModel?.validation_plot;
    add('modelos','¿Acierta?',`
      <p class="dk-kicker">El examen</p>
      <h2 class="dk-h">Cada modelo se examina con una prueba que no ha visto</h2>
      <div class="dk-exam">
        <div class="dk-grades">${gradeList}</div>
        ${plot?`<figure class="dk-plot"><img src="${esc(plot)}" alt="Prueba de la gráfica: la temperatura medida y la predicha casi se superponen" loading="lazy"><figcaption><b>El aprobado:</b> línea continua = medido, discontinua = lo que predijo el modelo sin haber visto esta prueba.</figcaption></figure>`:''}
      </div>`);

    const lo=Math.min(m.baseline,...m.ideas.map(i=>i.gpu_peak_model_low_C))-1;
    const hi=Math.max(m.baseline,...m.ideas.map(i=>i.gpu_peak_model_high_C))+0.5;
    const pos=t=>(t-lo)/(hi-lo)*100;
    const signed=delta=>Math.abs(delta)<0.05?'0':`${delta>0?'+':'−'}${num(Math.abs(delta),1)}`;
    const conf=c=>c.startsWith('medium-low')?'low':c.startsWith('low')?'low':c.startsWith('medium')?'mid':'high';
    const rows=m.ideas.map(idea=>`<li class="c-${conf(idea.evidence_confidence)}">
      <span class="dk-idea-name">${esc(idea.plain_es?.title||idea.physical_change)}<small>${esc(idea.plain_es?.detail||idea.hypothesis)}</small></span>
      <span class="dk-idea-track"><i style="left:${pos(idea.gpu_peak_model_low_C)}%;width:${Math.max(1.5,pos(idea.gpu_peak_model_high_C)-pos(idea.gpu_peak_model_low_C))}%"></i></span>
      <b>${signed(idea.gpu_peak_model_high_C-m.baseline)} a ${signed(idea.gpu_peak_model_low_C-m.baseline)}</b>
    </li>`).join('');
    add('ideas','Qué cambio vale',`
      <p class="dk-kicker">Ideas ordenadas por el modelo</p>
      <h2 class="dk-h">¿Qué cambio merece la pena?</h2>
      <div class="dk-ideas" style="--base:${pos(m.baseline)}%">
        <div class="dk-ideas-head"><span>Idea</span><span>temperatura máxima de la gráfica (más a la izquierda = mejor)</span><span>cambio, °C</span></div>
        <div class="dk-ideas-today"><span></span><span class="dk-idea-track"><em>hoy ${deg(m.baseline,1)}</em></span><span></span></div>
        <ol>${rows}</ol>
      </div>
      ${m.best?`<p class="dk-callout">La candidata es <b>${esc(m.best.plain_es?.title||m.best.physical_change)}</b>: podría bajar entre ${deg(Math.max(0,m.baseline-m.best.gpu_peak_model_high_C),0)} y ${deg(m.baseline-m.best.gpu_peak_model_low_C,0)}. Son rangos, no promesas: hasta medirlo no se sabe.</p>`:''}`);

    const width=520,height=220,left=40,right=14,top=14,bottom=34,xMax=200,yMax=40;
    const x=flow=>left+flow/xMax*(width-left-right);
    const y=delta=>top+(1-Math.min(delta,yMax)/yMax)*(height-top-bottom);
    const pts=[];for(let flow=m.heatInCase/(m.wPerM3h*yMax);flow<=xMax;flow+=2)pts.push(`${x(flow).toFixed(1)},${y(m.rise(flow)).toFixed(1)}`);
    const dot=(flow,label,cls)=>`<line x1="${x(flow)}" y1="${y(m.rise(flow))}" x2="${x(flow)}" y2="${height-bottom}" class="dk-b-mark"/><circle cx="${x(flow)}" cy="${y(m.rise(flow))}" r="6" class="dk-b-dot ${cls}"/><text x="${x(flow)+10}" y="${y(m.rise(flow))-10}" class="dk-b-label">${label}</text>`;
    add('aire','El verdadero límite',`
      <p class="dk-kicker">El verdadero límite</p>
      <h2 class="dk-h">El límite real: cuánto aire puede pasar</h2>
      <div class="dk-split">
        <div class="dk-air">
          <div class="dk-air-row"><span>Habitación</span><strong>${deg(m.ambient,1)}</strong></div>
          <div class="dk-air-arrow">+${deg(m.rise(m.realistic))}</div>
          <div class="dk-air-row hot"><span>Aire dentro de la caja</span><strong>≈ ${deg(m.ambient+m.rise(m.realistic))}</strong></div>
          <p class="dk-muted">Cada metro cúbico de aire por hora solo se lleva ${num(m.wPerM3h,2)} W por grado. Para sacar ${num(m.heatInCase)} W, los dos ventiladores de salida (${num(m.exhaust)} m³/h como mucho) dejan el aire al menos <b>${deg(m.rise(m.exhaust))}</b> más caliente que la habitación; con las rejillas, más cerca de <b>${deg(m.rise(m.realistic))}</b>.</p>
        </div>
        <figure class="dk-balance">
          <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Cuanto más aire pasa, menos se calienta">
            ${[0,50,100,150,200].map(f=>`<text x="${x(f)}" y="${height-bottom+18}" text-anchor="middle" class="dk-b-axis">${f}</text>`).join('')}
            ${[0,10,20,30,40].map(d=>`<line x1="${left}" x2="${width-right}" y1="${y(d)}" y2="${y(d)}" class="dk-b-grid"/><text x="${left-8}" y="${y(d)+4}" text-anchor="end" class="dk-b-axis">+${d}</text>`).join('')}
            <polyline points="${pts.join(' ')}" class="dk-b-curve"/>
            ${dot(m.realistic,'con rejillas','hot')}${dot(m.exhaust,'ventiladores a tope','cool')}
          </svg>
          <figcaption>Cuánto se calienta el aire (°C, vertical) según el aire que pasa por la caja (m³/h, horizontal).</figcaption>
        </figure>
      </div>`);

    if(s.ab_tests){
      const doneN=s.ab_tests.rows.filter(r=>r.status==='done').length;
      add('canales','Antes y después',`
        <p class="dk-kicker">Pruebas de los canales impresos · ${doneN} de ${s.ab_tests.rows.length} hechas</p>
        <h2 class="dk-h">¿Qué ha funcionado de verdad?</h2>
        ${abChart(s.ab_tests,'es')}`);
    }


    const conclusions=(s.conclusions||[]).map(item=>{
      const chip=metricChip(item.metric,m);
      return `<article class="dk-card ${item.tone}">${icon(item.tone)}<strong>${esc(item.title)}</strong><p>${esc(item.detail)}</p>${chip?`<small>${esc(chip)}</small>`:''}</article>`;
    }).join('');
    add('conclusiones','Conclusiones',`
      <p class="dk-kicker">Lo que sabemos hasta hoy</p>
      <h2 class="dk-h">Conclusiones</h2>
      <div class="dk-cards">${conclusions}</div>`);

    const uses=(s.uses||[]).map(item=>`<article class="dk-card use">${icon(item.icon)}<small>${esc(item.who)}</small><strong>${esc(item.title)}</strong><p>${esc(item.detail)}</p></article>`).join('');
    add('usos','Para qué sirve',`
      <p class="dk-kicker">Más allá del estudio</p>
      <h2 class="dk-h">¿Para qué puede servir?</h2>
      <div class="dk-cards">${uses}</div>`);

    if(s.research){
      const r=s.research;
      add('tesis','¿Una tesis?',`
        <p class="dk-kicker">¿Daría para una tesis?</p>
        <h2 class="dk-h">Sí como semilla, no tal cual</h2>
        <div class="dk-scale" aria-label="Nivel actual: TFM o artículo">
          <span>Proyecto personal</span><span class="on">TFM · artículo</span><span>Tesis doctoral</span>
          <i></i>
        </div>
        <p class="dk-lead small">${esc(r.verdict)}</p>
        <div class="dk-split">
          <div><p class="dk-label">Tres líneas que sí podrían ser una tesis</p><div class="dk-angles">${r.angles.map(a=>`<article><strong>${esc(a.title)}</strong><p>${esc(a.detail)}</p></article>`).join('')}</div></div>
          <div><p class="dk-label">El camino</p><ol class="dk-path">${r.path.map(p=>`<li>${esc(p)}</li>`).join('')}</ol></div>
        </div>`);
    }

    const label={done:'Hecho',next:'Siguiente',todo:'Después',later:'Más adelante'};
    const steps=(s.next_steps||[]).map((step,index)=>`<li class="${step.status}"><b>${step.status==='done'?'✓':index+1}</b><div><small>${label[step.status]||''}${step.date?` · ${dateEs(step.date,{day:'numeric',month:'short'})}`:''}</small><strong>${esc(step.title.es)}</strong><p>${esc(step.detail.es)}</p></div></li>`).join('');
    const ring=m.gate.length?m.gateDone/m.gate.length:0;
    add('pasos','Siguientes pasos',`
      <p class="dk-kicker">Siguientes pasos</p>
      <h2 class="dk-h">Qué viene ahora</h2>
      <div class="dk-next">
        <ol class="dk-steps">${steps}</ol>
        <aside class="dk-gate">
          <svg viewBox="0 0 120 120" class="dk-ring" aria-hidden="true"><circle cx="60" cy="60" r="50" class="bg"/><circle cx="60" cy="60" r="50" class="fg" style="stroke-dasharray:${(ring*314).toFixed(1)} 314"/><text x="60" y="58" text-anchor="middle">${m.gateDone}/${m.gate.length}</text><text x="60" y="78" text-anchor="middle" class="sub">listo</text></svg>
          <p class="dk-label">Para simular el aire (CFD) hace falta</p>
          <ul>${m.gate.map(item=>`<li class="${item.done?'done':''}">${esc(item.es)}</li>`).join('')}</ul>
        </aside>
      </div>`);
    return list;
  }

  // ---------- Deck player ----------
  let deck=null,index=0,items=[],lastFocus=null;
  function go(next){
    if(!deck||!items.length)return;
    index=Math.max(0,Math.min(items.length-1,next));
    deck.querySelectorAll('.dk-slide').forEach((slide,i)=>{
      slide.classList.toggle('active',i===index);
      slide.classList.toggle('before',i<index);
      slide.setAttribute('aria-hidden',String(i!==index));
      slide.inert=i!==index;
    });
    deck.querySelectorAll('.dk-dots button').forEach((dot,i)=>dot.setAttribute('aria-current',i===index?'step':'false'));
    deck.querySelector('.dk-count').textContent=`${index+1} / ${items.length} · ${items[index].label}`;
    deck.querySelector('[data-dk-prev]').disabled=index===0;
    deck.querySelector('[data-dk-next]').textContent=index===items.length-1?'Volver al inicio ↺':'Siguiente →';
    deck.querySelector('.dk-progress i').style.width=`${(index+1)/items.length*100}%`;
    deck.querySelector('.dk-slide.active .dk-slide-in')?.scrollTo(0,0);
  }
  function open(at=0){
    if(!deck)return;
    lastFocus=document.activeElement;
    if(typeof deck.showModal==='function')deck.showModal();else deck.setAttribute('open','');
    document.documentElement.classList.add('dk-open');
    go(at);
    deck.querySelector('[data-dk-next]').focus();
  }
  function close(){
    if(!deck)return;
    if(deck.open&&typeof deck.close==='function')deck.close();else deck.removeAttribute('open');
  }
  function bind(){
    deck.addEventListener('close',()=>{document.documentElement.classList.remove('dk-open');lastFocus?.focus?.()});
    deck.querySelector('[data-dk-close]').addEventListener('click',close);
    deck.querySelector('[data-dk-prev]').addEventListener('click',()=>go(index-1));
    deck.querySelector('[data-dk-next]').addEventListener('click',()=>go(index===items.length-1?0:index+1));
    deck.addEventListener('keydown',event=>{
      if(event.target.closest('a'))return;
      if(['ArrowRight','PageDown'].includes(event.key)||(event.key===' '&&!event.target.closest('button'))){event.preventDefault();go(index+1)}
      else if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();go(index-1)}
      else if(event.key==='Home'){event.preventDefault();go(0)}
      else if(event.key==='End'){event.preventDefault();go(items.length-1)}
    });
    let startX=null,startY=null;
    deck.addEventListener('touchstart',event=>{startX=event.touches[0].clientX;startY=event.touches[0].clientY},{passive:true});
    deck.addEventListener('touchend',event=>{
      if(startX===null)return;
      const dx=event.changedTouches[0].clientX-startX,dy=event.changedTouches[0].clientY-startY;
      if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.4)go(index+(dx<0?1:-1));
      startX=null;
    },{passive:true});
    document.querySelectorAll('[data-open-deck]').forEach(button=>button.addEventListener('click',()=>open(Number(button.dataset.openDeck)||0)));
  }

  function buildDeck(m,data){
    deck=document.getElementById('tl-deck');
    if(!deck)return;
    items=slides(m,data);
    deck.innerHTML=`
      <header class="dk-bar">
        <span class="dk-brand">Thermal Lab · presentación</span>
        <span class="dk-count" aria-live="polite"></span>
        <button type="button" class="dk-close" data-dk-close aria-label="Cerrar la presentación">✕</button>
      </header>
      <div class="dk-progress" aria-hidden="true"><i></i></div>
      <div class="dk-stage">${items.map((item,i)=>`<section class="dk-slide ${item.extra}" aria-roledescription="diapositiva" aria-label="${i+1} de ${items.length}: ${esc(item.label)}"><div class="dk-slide-in">${item.html}</div></section>`).join('')}</div>
      <footer class="dk-nav">
        <button type="button" data-dk-prev>← Anterior</button>
        <nav class="dk-dots" aria-label="Ir a una diapositiva">${items.map((item,i)=>`<button type="button" aria-label="${i+1}: ${esc(item.label)}" data-go="${i}"></button>`).join('')}</nav>
        <button type="button" class="primary" data-dk-next>Siguiente →</button>
      </footer>`;
    deck.querySelectorAll('[data-go]').forEach(dot=>dot.addEventListener('click',()=>go(Number(dot.dataset.go))));
    if(!deck.dataset.bound){bind();deck.dataset.bound='1'}
    else if(deck.open)go(index);
  }

  // ---------- The English page reads the same phases and next steps ----------
  function renderPage(m){
    const steps=document.getElementById('tl-steps');
    if(steps&&m.phases.length){
      steps.replaceChildren(...m.phases.map((phase,i)=>{
        const li=el('li',phase.status==='todo'?'':phase.status);
        li.append(el('i',null,phase.status==='done'?'✓':String(i+1)),el('strong'),el('p'));
        li.querySelector('i').setAttribute('aria-hidden','true');
        li.querySelector('strong').textContent=phase.title.en;
        li.querySelector('p').textContent=phase.detail.en;
        return li;
      }));
    }
    const roadmap=document.getElementById('tl-roadmap');
    if(roadmap&&m.story.next_steps){
      roadmap.replaceChildren(...m.story.next_steps.map((step,i)=>{
        const li=el('li',step.status==='done'?'done':step.status==='next'?'next':'');
        const body=el('div');
        body.append(el('strong'),el('p'));
        body.querySelector('strong').textContent=step.title.en;
        body.querySelector('p').textContent=step.detail.en;
        li.append(el('b',null,step.status==='done'?'✓':String(i+1)),body);
        return li;
      }));
    }
    const gate=document.getElementById('tl-gate-list');
    if(gate&&m.gate.length){
      gate.replaceChildren(...m.gate.map(item=>{const li=el('li',item.done?'done':'');li.textContent=item.en;return li}));
    }
    const abBox=document.getElementById('tl-ab');
    if(abBox&&m.story.ab_tests)abBox.innerHTML=abChart(m.story.ab_tests,'en');
    const updated=document.getElementById('tl-deck-updated');
    if(updated)updated.textContent=`Actualizada el ${dateEs(m.updated)} · ${items.length} diapositivas · ${m.current>=0?`fase ${m.current+1} de ${m.phases.length}`:''}`;
    const nextName=document.getElementById('tl-deck-next');
    const next=(m.story.next_steps||[]).find(step=>step.status==='next');
    if(nextName)nextName.textContent=next?next.title.es:'—';
  }

  function render(data){
    if(!data||!data.story)return;
    const m=metricsFrom(data);
    buildDeck(m,data);
    renderPage(m);
    document.querySelectorAll('[data-open-deck]').forEach(button=>{button.disabled=false});
  }

  window.ThermalDeck={render,open,close};
})();
