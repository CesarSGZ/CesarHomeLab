import {key,muscleFor,estimated1RM} from '../../control/training-model.js';
import {parseCsv} from './training.js';
const numeric=value=>/^\s*\d+(?:[.,]\d+)?\s*$/.test(String(value||''))?Number(String(value).replace(',','.')):null;
const cell=(column,row)=>{let letters='';for(let n=column+1;n>0;n=Math.floor((n-1)/26))letters=String.fromCharCode(65+(n-1)%26)+letters;return letters+(row+1);};
const aliases={BP:'Bench Press',OP:'Overhead Press',SQ:'Squat',DL:'Deadlift','Cable Row':'Cable Row'};
export function parseCvlpp(tabs) {
  const records=[];
  for(const tab of tabs)for(let row=0;row<tab.rows.length;row++)for(let column=0;column<tab.rows[row].length;column++) {
    if(key(tab.rows[row][column])!=='stage'||key(tab.rows[row][column+1])!=='peso')continue;
    const code=String(tab.rows[row][column-1]||'').trim(),name=aliases[code]||code;
    for(let index=row+1;index<tab.rows.length;index++) {
      const sequence=String(tab.rows[index][column-1]||'').match(/^S(\d+)$/i);
      if(!sequence)break;
      const load=numeric(tab.rows[index][column+1]),stage=String(tab.rows[index][column]||''),raw=String(tab.rows[index][column+1]||'');
      if(!raw&&!stage)continue;
      const stageMatch=stage.match(/^(\d+)\s*x\s*(\d+)/i),reps=stageMatch?Number(stageMatch[2]):null;
      const fail=String(tab.rows[index][column+2]||'').trim(),failed=fail!==''&&fail!=='0';
      const muscle=muscleFor(name);
      records.push({id:`cvlpp:${tab.name}:${cell(column+1,index)}`,sourceKey:'cvlpp',source:`CVLPP · ${tab.name}`,name,muscle,variant:`${muscle||'other'}:${key(name)}`,sequence:Number(sequence[1]),date:null,dateKind:'undated-week',load,reps,sets:stageMatch?Number(stageMatch[1]):null,
        failed,completion:fail==='0'?'no-failure-marked':'unknown',raw:`${stage||'Sin Stage'} · Peso: ${raw} · Fallo: ${fail||'sin anotación'}`,cell:cell(column+1,index),e1rm:failed?null:estimated1RM(load,reps)});
    }
  }
  return records;
}
const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
export function parseLegacy(rows) {
  const blocks=[{id:'cycle1',start:1,end:6,label:'Ciclo 1'},{id:'cycle2',start:8,end:13,label:'Ciclo 2 A'},{id:'cycle2b',start:15,end:25,label:'Ciclo 2 B'},{id:'cycle3',start:43,end:63,label:'Ciclo 3'}];
  const records=[],header=rows[2]||[];
  for(const block of blocks) {
    let firstDay=null,previousDay=null,offset=0;
    for(let index=3;index<rows.length;index++) {
      const row=rows[index];if(!numeric(row[block.start]))continue;
      const dateRaw=String(row[block.end]||''),match=key(dateRaw).match(/^(\d+) de (\w+)/),day=match?Number(match[1]):numeric(dateRaw),month=match?months.indexOf(match[2]):null;
      if(!match&&day){if(firstDay===null)firstDay=day;if(previousDay!==null)offset+=day>previousDay?day-previousDay:1;previousDay=day;}
      for(let col=block.start+1;col<block.end;col++) {
        const raw=String(row[col]||''),load=numeric(raw),title=String(header[col]||'');
        if(!title||!raw||load===null||/abs|flex|plank/i.test(title))continue;
        const name=title.replace(/\s+1x5$/i,''),reps=/1x5$/i.test(title)?5:null,muscle=muscleFor(name);
        records.push({id:`legacy:${cell(col,index)}`,sourceKey:'legacy',source:`Entrenamientos · ${block.label}`,block:block.id,name,muscle,variant:`${muscle||'other'}:${key(name)}`,sequence:Number(row[block.start]),date:null,dateKind:'undated-session',dateRaw,dayOfMonth:day,month:month>=0?month:null,dayOffset:match?null:offset,load,reps,
          raw:`${title}: ${raw} · Día: ${dateRaw||'sin fecha'}`,cell:cell(col,index),e1rm:estimated1RM(load,reps)});
      }
    }
  }
  return records;
}
export function parseLibra(text) {
  if(!/^#Units:\s*kg\s*$/m.test(text))throw new Error('body_weight_units_not_kg');
  return parseCsv(text,';').filter(row=>!String(row[0]||'').startsWith('#')).map(row=>({date:row[0],weight:numeric(row[1]),trend:numeric(row[2])}))
    .filter(row=>row.weight>0&&Number.isFinite(Date.parse(row.date))).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
}
export function validateTrainingSettings(input) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('invalid_settings');
  const result={factors:{},legacyBlocks:{},doubleSidedNotation:input.doubleSidedNotation===true};
  const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
  if(input.cvlppStart){if(!validDate(input.cvlppStart))throw new Error('invalid_date');result.cvlppStart=input.cvlppStart;}
  if(Object.keys(input.factors||{}).length>200)throw new Error('too_many_factors');
  for(const [variant,value] of Object.entries(input.factors||{})){if(variant.length>180||!Number.isFinite(value)||value<.02||value>25)throw new Error('invalid_factor');result.factors[variant]=value;}
  for(const block of ['cycle1','cycle2','cycle2b','cycle3']) {
    const config=input.legacyBlocks?.[block];if(!config)continue;const checked={};
    if(config.startDate){if(!validDate(config.startDate))throw new Error('invalid_date');checked.startDate=config.startDate;}
    if(config.defaultReps!==undefined&&config.defaultReps!==null&&config.defaultReps!==''){if(!Number.isInteger(config.defaultReps)||config.defaultReps<1||config.defaultReps>15)throw new Error('invalid_reps');checked.defaultReps=config.defaultReps;}
    result.legacyBlocks[block]=checked;
  }
  return result;
}
