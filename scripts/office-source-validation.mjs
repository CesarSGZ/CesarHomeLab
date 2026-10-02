export function validateSource(path,source){
  if(path.endsWith('.js')){
   // No host execution, credential access, reflection, dynamic evaluation or protected imports.
   if(/\b(?:process|globalThis|eval|Function|require|constructor|__proto__|prototype|Reflect|WebSocket|getOwnPropertyDescriptors?|getPrototypeOf|defineProperty|setPrototypeOf)\b|\bimport\s*\(|node:|javascript:|crypto-store|engine\.js|market-data\.js|index\.js|office-boundary\.js.*(?:set|write)/.test(source))throw Error('Acceso fuera del entorno autónomo');
   const imports=[...source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)].map(m=>m[1]);const permitted=['./core.js','./company.js','./governance.js','./fundamentals.js','./development.js','./office-boundary.js','./trading-office.js?v=20261002office9','./vendor/three.module.js'];if(imports.some(i=>!permitted.includes(i)&&!/^\.\/trading-office\.js\?v=[a-zA-Z0-9._-]+$/.test(i)))throw Error('Dependencia fuera de la oficina');
  }else{const clean=source.replace(/\/\*[\s\S]*?\*\//g,'');for(const match of clean.matchAll(/([^{}]+){/g)){const selector=match[1].trim();if(selector.startsWith('@')||/^(?:from|to|[\d.% ,]+)$/.test(selector))continue;if(selector.split(',').some(part=>!/(?:\.ao-|#ao-|\.trading-view|#trading-app)/.test(part)))throw Error('CSS fuera de Agent Office');}}
}
