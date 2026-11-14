(()=>{var Bs="185",en={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},tn={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Lh=0,Qo=1,Dh=2;var Jr=1,Nh=2,cr=3,nn=0,Ut=1,Dt=2,gi=0,Kr=1,el=2,tl=3,il=4,Uh=5;var hr=100,Oh=101,Fh=102,Bh=103,zh=104,Gh=200,Vh=201,kh=202,Hh=203,Wh=204,Xh=205,jh=206,qh=207,Yh=208,Zh=209,Jh=210,Kh=211,$h=212,Qh=213,eu=214,nl=0,rl=1,sl=2,Ca=3,al=4,ol=5,ll=6,cl=7,tu=0,iu=1,nu=2,ai=0,hl=1,ul=2,dl=3,pl=4,ml=5,fl=6,gl=7;var _l=300,ur=301,xn=302,Ra=303,Pa=304,$r=306,zs=1e3,Zi=1001,Gs=1002,Zt=1003,ru=1004;var Qr=1005;var wt=1006,Ia=1007;var Mn=1008;var Wt=1009,vl=1010,yl=1011,dr=1012,La=1013,Bi=1014,oi=1015,_i=1016,Da=1017,Na=1018,pr=1020,xl=35902,Ml=35899,su=1021,au=1022,li=1023,rn=1026,Sn=1027,Sl=1028,Ua=1029,bn=1030,bl=1031;var Tl=1033,Oa=33776,Fa=33777,Ba=33778,za=33779,El=35840,wl=35841,Al=35842,Cl=35843,Rl=36196,Pl=37492,Il=37496,Ll=37488,Dl=37489,Ga=37490,Nl=37491,Ul=37808,Ol=37809,Fl=37810,Bl=37811,zl=37812,Gl=37813,Vl=37814,kl=37815,Hl=37816,Wl=37817,Xl=37818,jl=37819,ql=37820,Yl=37821,Zl=36492,Jl=36494,Kl=36495,$l=36283,Ql=36284,Va=36285,ec=36286;var Ar=2300,Vs=2301,Fs=2302,zo=2303,Go=2400,Vo=2401,ko=2402;var tc=0,ou=1,Tn="",Pt="srgb",Cr="srgb-linear",Rr="linear",je="srgb";var pn=7680;var lu=512,cu=513,hu=514,ka=515,uu=516,du=517,Ha=518,pu=519,Ho=35044;var ic="300 es",Ci=2e3,jn=2001;function cd(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function Pr(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function mu(){let r=Pr("canvas");return r.style.display="block",r}var Jc={},qn=null;function nc(...r){let e="THREE."+r.shift();qn?qn("log",e,...r):console.log(e,...r)}function fu(r){let e=r[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=r[1];t&&t.isStackTrace?r[0]+=" "+t.getLocation():r[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return r}function be(...r){let e="THREE."+(r=fu(r)).shift();if(qn)qn("warn",e,...r);else{let t=r[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...r)}}function Te(...r){let e="THREE."+(r=fu(r)).shift();if(qn)qn("error",e,...r);else{let t=r[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...r)}}function mn(...r){let e=r.join(" ");e in Jc||(Jc[e]=!0,be(...r))}function gu(r,e,t){return new Promise(function(i,n){setTimeout(function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:n();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}},t)})}var _u={[nl]:1,[sl]:6,[al]:7,[Ca]:5,[rl]:0,[ll]:2,[cl]:4,[ol]:3},ni=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i!==void 0&&i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let n=i[e];if(n!==void 0){let s=n.indexOf(t);s!==-1&&n.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let n=i.slice(0);for(let s=0,a=n.length;s<a;s++)n[s].call(this,e);e.target=null}}},bt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Kc=1234567,Wn=Math.PI/180,Yn=180/Math.PI;function En(){let r=4294967295*Math.random()|0,e=4294967295*Math.random()|0,t=4294967295*Math.random()|0,i=4294967295*Math.random()|0;return(bt[255&r]+bt[r>>8&255]+bt[r>>16&255]+bt[r>>24&255]+"-"+bt[255&e]+bt[e>>8&255]+"-"+bt[e>>16&15|64]+bt[e>>24&255]+"-"+bt[63&t|128]+bt[t>>8&255]+"-"+bt[t>>16&255]+bt[t>>24&255]+bt[255&i]+bt[i>>8&255]+bt[i>>16&255]+bt[i>>24&255]).toLowerCase()}function Ue(r,e,t){return Math.max(e,Math.min(t,r))}function Wo(r,e){return(r%e+e)%e}function Tr(r,e,t){return(1-t)*r+t*e}function Hn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Rt(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(4294967295*r);case Uint16Array:return Math.round(65535*r);case Uint8Array:return Math.round(255*r);case Int32Array:return Math.round(2147483647*r);case Int16Array:return Math.round(32767*r);case Int8Array:return Math.round(127*r);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var rc={DEG2RAD:Wn,RAD2DEG:Yn,generateUUID:En,clamp:Ue,euclideanModulo:Wo,mapLinear:function(r,e,t,i,n){return i+(r-e)*(n-i)/(t-e)},inverseLerp:function(r,e,t){return r!==e?(t-r)/(e-r):0},lerp:Tr,damp:function(r,e,t,i){return Tr(r,e,1-Math.exp(-t*i))},pingpong:function(r,e=1){return e-Math.abs(Wo(r,2*e)-e)},smoothstep:function(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e))*r*(3-2*r)},smootherstep:function(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e))*r*r*(r*(6*r-15)+10)},randInt:function(r,e){return r+Math.floor(Math.random()*(e-r+1))},randFloat:function(r,e){return r+Math.random()*(e-r)},randFloatSpread:function(r){return r*(.5-Math.random())},seededRandom:function(r){r!==void 0&&(Kc=r);let e=Kc+=1831565813;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296},degToRad:function(r){return r*Wn},radToDeg:function(r){return r*Yn},isPowerOfTwo:function(r){return!(r&r-1)&&r!==0},ceilPowerOfTwo:function(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))},floorPowerOfTwo:function(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))},setQuaternionFromProperEuler:function(r,e,t,i,n){let s=Math.cos,a=Math.sin,o=s(t/2),c=a(t/2),l=s((e+i)/2),h=a((e+i)/2),d=s((e-i)/2),p=a((e-i)/2),u=s((i-e)/2),g=a((i-e)/2);switch(n){case"XYX":r.set(o*h,c*d,c*p,o*l);break;case"YZY":r.set(c*p,o*h,c*d,o*l);break;case"ZXZ":r.set(c*d,c*p,o*h,o*l);break;case"XZX":r.set(o*h,c*g,c*u,o*l);break;case"YXY":r.set(c*u,o*h,c*g,o*l);break;case"ZYZ":r.set(c*g,c*u,o*h,o*l);break;default:be("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}},normalize:Rt,denormalize:Hn},cc=class cc{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,n=e.elements;return this.x=n[0]*t+n[3]*i+n[6],this.y=n[1]*t+n[4]*i+n[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ue(this.x,e.x,t.x),this.y=Ue(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ue(this.x,e,t),this.y=Ue(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Ue(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Ue(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),n=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*n+e.x,this.y=s*n+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};cc.prototype.isVector2=!0;var Q=cc,Lt=class{constructor(e=0,t=0,i=0,n=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=n}static slerpFlat(e,t,i,n,s,a,o){let c=i[n+0],l=i[n+1],h=i[n+2],d=i[n+3],p=s[a+0],u=s[a+1],g=s[a+2],m=s[a+3];if(d!==m||c!==p||l!==u||h!==g){let v=c*p+l*u+h*g+d*m;v<0&&(p=-p,u=-u,g=-g,m=-m,v=-v);let f=1-o;if(v<.9995){let _=Math.acos(v),x=Math.sin(_);f=Math.sin(f*_)/x,c=c*f+p*(o=Math.sin(o*_)/x),l=l*f+u*o,h=h*f+g*o,d=d*f+m*o}else{c=c*f+p*o,l=l*f+u*o,h=h*f+g*o,d=d*f+m*o;let _=1/Math.sqrt(c*c+l*l+h*h+d*d);c*=_,l*=_,h*=_,d*=_}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,n,s,a){let o=i[n],c=i[n+1],l=i[n+2],h=i[n+3],d=s[a],p=s[a+1],u=s[a+2],g=s[a+3];return e[t]=o*g+h*d+c*u-l*p,e[t+1]=c*g+h*p+l*d-o*u,e[t+2]=l*g+h*u+o*p-c*d,e[t+3]=h*g-o*d-c*p-l*u,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,n){return this._x=e,this._y=t,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,n=e._y,s=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(i/2),h=o(n/2),d=o(s/2),p=c(i/2),u=c(n/2),g=c(s/2);switch(a){case"XYZ":this._x=p*h*d+l*u*g,this._y=l*u*d-p*h*g,this._z=l*h*g+p*u*d,this._w=l*h*d-p*u*g;break;case"YXZ":this._x=p*h*d+l*u*g,this._y=l*u*d-p*h*g,this._z=l*h*g-p*u*d,this._w=l*h*d+p*u*g;break;case"ZXY":this._x=p*h*d-l*u*g,this._y=l*u*d+p*h*g,this._z=l*h*g+p*u*d,this._w=l*h*d-p*u*g;break;case"ZYX":this._x=p*h*d-l*u*g,this._y=l*u*d+p*h*g,this._z=l*h*g-p*u*d,this._w=l*h*d+p*u*g;break;case"YZX":this._x=p*h*d+l*u*g,this._y=l*u*d+p*h*g,this._z=l*h*g-p*u*d,this._w=l*h*d-p*u*g;break;case"XZY":this._x=p*h*d-l*u*g,this._y=l*u*d-p*h*g,this._z=l*h*g+p*u*d,this._w=l*h*d+p*u*g;break;default:be("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,n=Math.sin(i);return this._x=e.x*n,this._y=e.y*n,this._z=e.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],n=t[4],s=t[8],a=t[1],o=t[5],c=t[9],l=t[2],h=t[6],d=t[10],p=i+o+d;if(p>0){let u=.5/Math.sqrt(p+1);this._w=.25/u,this._x=(h-c)*u,this._y=(s-l)*u,this._z=(a-n)*u}else if(i>o&&i>d){let u=2*Math.sqrt(1+i-o-d);this._w=(h-c)/u,this._x=.25*u,this._y=(n+a)/u,this._z=(s+l)/u}else if(o>d){let u=2*Math.sqrt(1+o-i-d);this._w=(s-l)/u,this._x=(n+a)/u,this._y=.25*u,this._z=(c+h)/u}else{let u=2*Math.sqrt(1+d-i-o);this._w=(a-n)/u,this._x=(s+l)/u,this._y=(c+h)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ue(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let n=Math.min(1,t/i);return this.slerp(e,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,n=e._y,s=e._z,a=e._w,o=t._x,c=t._y,l=t._z,h=t._w;return this._x=i*h+a*o+n*l-s*c,this._y=n*h+a*c+s*o-i*l,this._z=s*h+a*l+i*c-n*o,this._w=a*h-i*o-n*c-s*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,n=e._y,s=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,n=-n,s=-s,a=-a,o=-o);let c=1-t;if(o<.9995){let l=Math.acos(o),h=Math.sin(l);c=Math.sin(c*l)/h,t=Math.sin(t*l)/h,this._x=this._x*c+i*t,this._y=this._y*c+n*t,this._z=this._z*c+s*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+n*t,this._z=this._z*c+s*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(n*Math.sin(e),n*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},hc=class hc{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion($c.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion($c.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,n=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*n,this.y=s[1]*t+s[4]*i+s[7]*n,this.z=s[2]*t+s[5]*i+s[8]*n,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,n=this.z,s=e.elements,a=1/(s[3]*t+s[7]*i+s[11]*n+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*n+s[12])*a,this.y=(s[1]*t+s[5]*i+s[9]*n+s[13])*a,this.z=(s[2]*t+s[6]*i+s[10]*n+s[14])*a,this}applyQuaternion(e){let t=this.x,i=this.y,n=this.z,s=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*n-o*i),h=2*(o*t-s*n),d=2*(s*i-a*t);return this.x=t+c*l+a*d-o*h,this.y=i+c*h+o*l-s*d,this.z=n+c*d+s*h-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,n=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*n,this.y=s[1]*t+s[5]*i+s[9]*n,this.z=s[2]*t+s[6]*i+s[10]*n,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ue(this.x,e.x,t.x),this.y=Ue(this.y,e.y,t.y),this.z=Ue(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ue(this.x,e,t),this.y=Ue(this.y,e,t),this.z=Ue(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Ue(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,n=e.y,s=e.z,a=t.x,o=t.y,c=t.z;return this.x=n*c-s*o,this.y=s*a-i*c,this.z=i*o-n*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return ho.copy(this).projectOnVector(e),this.sub(ho)}reflect(e){return this.sub(ho.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Ue(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,n=this.z-e.z;return t*t+i*i+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let n=Math.sin(t)*e;return this.x=n*Math.sin(i),this.y=Math.cos(t)*e,this.z=n*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),n=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=n,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,4*t)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,3*t)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=2*Math.random()-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};hc.prototype.isVector3=!0;var w=hc,ho=new w,$c=new Lt,uc=class uc{constructor(e,t,i,n,s,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,n,s,a,o,c,l)}set(e,t,i,n,s,a,o,c,l){let h=this.elements;return h[0]=e,h[1]=n,h[2]=o,h[3]=t,h[4]=s,h[5]=c,h[6]=i,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,n=t.elements,s=this.elements,a=i[0],o=i[3],c=i[6],l=i[1],h=i[4],d=i[7],p=i[2],u=i[5],g=i[8],m=n[0],v=n[3],f=n[6],_=n[1],x=n[4],S=n[7],E=n[2],M=n[5],P=n[8];return s[0]=a*m+o*_+c*E,s[3]=a*v+o*x+c*M,s[6]=a*f+o*S+c*P,s[1]=l*m+h*_+d*E,s[4]=l*v+h*x+d*M,s[7]=l*f+h*S+d*P,s[2]=p*m+u*_+g*E,s[5]=p*v+u*x+g*M,s[8]=p*f+u*S+g*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8];return t*a*h-t*o*l-i*s*h+i*o*c+n*s*l-n*a*c}invert(){let e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],d=h*a-o*l,p=o*c-h*s,u=l*s-a*c,g=t*d+i*p+n*u;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/g;return e[0]=d*m,e[1]=(n*l-h*i)*m,e[2]=(o*i-n*a)*m,e[3]=p*m,e[4]=(h*t-n*c)*m,e[5]=(n*s-o*t)*m,e[6]=u*m,e[7]=(i*c-l*t)*m,e[8]=(a*t-i*s)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,n,s,a,o){let c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*a+l*o)+a+e,-n*l,n*c,-n*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return mn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(uo.makeScale(e,t)),this}rotate(e){return mn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(uo.makeRotation(-e)),this}translate(e,t){return mn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(uo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let n=0;n<9;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};uc.prototype.isMatrix3=!0;var Ie=uc,uo=new Ie,Qc=new Ie().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),eh=new Ie().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function hd(){let r={enabled:!0,workingColorSpace:Cr,spaces:{},convert:function(n,s,a){return this.enabled!==!1&&s!==a&&s&&a&&(this.spaces[s].transfer===je&&(n.r=Ai(n.r),n.g=Ai(n.g),n.b=Ai(n.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(n.applyMatrix3(this.spaces[s].toXYZ),n.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===je&&(n.r=Xn(n.r),n.g=Xn(n.g),n.b=Xn(n.b))),n},workingToColorSpace:function(n,s){return this.convert(n,this.workingColorSpace,s)},colorSpaceToWorking:function(n,s){return this.convert(n,s,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===""?Rr:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,s=this.workingColorSpace){return n.fromArray(this.spaces[s].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,s,a){return n.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,s){return mn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(n,s)},toWorkingColorSpace:function(n,s){return mn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(n,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return r.define({[Cr]:{primaries:e,whitePoint:i,transfer:Rr,toXYZ:Qc,fromXYZ:eh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Pt},outputColorSpaceConfig:{drawingBufferColorSpace:Pt}},[Pt]:{primaries:e,whitePoint:i,transfer:je,toXYZ:Qc,fromXYZ:eh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Pt}}}),r}var Ve=hd();function Ai(r){return r<.04045?.0773993808*r:Math.pow(.9478672986*r+.0521327014,2.4)}function Xn(r){return r<.0031308?12.92*r:1.055*Math.pow(r,.41666)-.055}var Ln,ks=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Ln===void 0&&(Ln=Pr("canvas")),Ln.width=e.width,Ln.height=e.height;let n=Ln.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),i=Ln}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Pr("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let n=i.getImageData(0,0,e.width,e.height),s=n.data;for(let a=0;a<s.length;a++)s[a]=255*Ai(s[a]/255);return i.putImageData(n,0,0),t}if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(255*Ai(t[i]/255)):t[i]=Ai(t[i]);return{data:t,width:e.width,height:e.height}}return be("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},ud=0,Zn=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:ud++}),this.uuid=En(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let s;if(Array.isArray(n)){s=[];for(let a=0,o=n.length;a<o;a++)n[a].isDataTexture?s.push(po(n[a].image)):s.push(po(n[a]))}else s=po(n);i.url=s}return t||(e.images[this.uuid]=i),i}};function po(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?ks.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(be("Texture: Unable to serialize Texture."),{})}var dd=0,mo=new w,Nt=class r extends ni{constructor(e=r.DEFAULT_IMAGE,t=r.DEFAULT_MAPPING,i=1001,n=1001,s=1006,a=1008,o=1023,c=1009,l=r.DEFAULT_ANISOTROPY,h=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:dd++}),this.uuid=En(),this.name="",this.source=new Zn(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=s,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Q(0,0),this.repeat=new Q(1,1),this.center=new Q(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ie,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(mo).x}get height(){return this.source.getSize(mo).y}get depth(){return this.source.getSize(mo).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){be(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let n=this[t];n!==void 0?n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[t]=i:be(`Texture.setValues(): property '${t}' does not exist.`)}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==_l)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case zs:e.x=e.x-Math.floor(e.x);break;case Zi:e.x=e.x<0?0:1;break;case Gs:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case zs:e.y=e.y-Math.floor(e.y);break;case Zi:e.y=e.y<0?0:1;break;case Gs:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Nt.DEFAULT_IMAGE=null,Nt.DEFAULT_MAPPING=_l,Nt.DEFAULT_ANISOTROPY=1;var dc=class dc{constructor(e=0,t=0,i=0,n=1){this.x=e,this.y=t,this.z=i,this.w=n}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,n){return this.x=e,this.y=t,this.z=i,this.w=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,n=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*n+a[12]*s,this.y=a[1]*t+a[5]*i+a[9]*n+a[13]*s,this.z=a[2]*t+a[6]*i+a[10]*n+a[14]*s,this.w=a[3]*t+a[7]*i+a[11]*n+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,n,s,c=e.elements,l=c[0],h=c[4],d=c[8],p=c[1],u=c[5],g=c[9],m=c[2],v=c[6],f=c[10];if(Math.abs(h-p)<.01&&Math.abs(d-m)<.01&&Math.abs(g-v)<.01){if(Math.abs(h+p)<.1&&Math.abs(d+m)<.1&&Math.abs(g+v)<.1&&Math.abs(l+u+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(l+1)/2,S=(u+1)/2,E=(f+1)/2,M=(h+p)/4,P=(d+m)/4,F=(g+v)/4;return x>S&&x>E?x<.01?(i=0,n=.707106781,s=.707106781):(i=Math.sqrt(x),n=M/i,s=P/i):S>E?S<.01?(i=.707106781,n=0,s=.707106781):(n=Math.sqrt(S),i=M/n,s=F/n):E<.01?(i=.707106781,n=.707106781,s=0):(s=Math.sqrt(E),i=P/s,n=F/s),this.set(i,n,s,t),this}let _=Math.sqrt((v-g)*(v-g)+(d-m)*(d-m)+(p-h)*(p-h));return Math.abs(_)<.001&&(_=1),this.x=(v-g)/_,this.y=(d-m)/_,this.z=(p-h)/_,this.w=Math.acos((l+u+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ue(this.x,e.x,t.x),this.y=Ue(this.y,e.y,t.y),this.z=Ue(this.z,e.z,t.z),this.w=Ue(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ue(this.x,e,t),this.y=Ue(this.y,e,t),this.z=Ue(this.z,e,t),this.w=Ue(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Ue(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};dc.prototype.isVector4=!0;var Ze=dc,Hs=class extends ni{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:wt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Ze(0,0,e,t),this.scissorTest=!1,this.viewport=new Ze(0,0,e,t),this.textures=[];let n={width:e,height:t,depth:i.depth},s=new Nt(n),a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:wt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let n=0,s=this.textures.length;n<s;n++)this.textures[n].image.width=e,this.textures[n].image.height=t,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Zn(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Vt=class extends Hs{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Ir=class extends Nt{constructor(e=null,t=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=Zi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ws=class extends Nt{constructor(e=null,t=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=Zi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Aa=class Aa{constructor(e,t,i,n,s,a,o,c,l,h,d,p,u,g,m,v){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,n,s,a,o,c,l,h,d,p,u,g,m,v)}set(e,t,i,n,s,a,o,c,l,h,d,p,u,g,m,v){let f=this.elements;return f[0]=e,f[4]=t,f[8]=i,f[12]=n,f[1]=s,f[5]=a,f[9]=o,f[13]=c,f[2]=l,f[6]=h,f[10]=d,f[14]=p,f[3]=u,f[7]=g,f[11]=m,f[15]=v,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Aa().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,n=1/Dn.setFromMatrixColumn(e,0).length(),s=1/Dn.setFromMatrixColumn(e,1).length(),a=1/Dn.setFromMatrixColumn(e,2).length();return t[0]=i[0]*n,t[1]=i[1]*n,t[2]=i[2]*n,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,n=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(n),l=Math.sin(n),h=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){let p=a*h,u=a*d,g=o*h,m=o*d;t[0]=c*h,t[4]=-c*d,t[8]=l,t[1]=u+g*l,t[5]=p-m*l,t[9]=-o*c,t[2]=m-p*l,t[6]=g+u*l,t[10]=a*c}else if(e.order==="YXZ"){let p=c*h,u=c*d,g=l*h,m=l*d;t[0]=p+m*o,t[4]=g*o-u,t[8]=a*l,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=u*o-g,t[6]=m+p*o,t[10]=a*c}else if(e.order==="ZXY"){let p=c*h,u=c*d,g=l*h,m=l*d;t[0]=p-m*o,t[4]=-a*d,t[8]=g+u*o,t[1]=u+g*o,t[5]=a*h,t[9]=m-p*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let p=a*h,u=a*d,g=o*h,m=o*d;t[0]=c*h,t[4]=g*l-u,t[8]=p*l+m,t[1]=c*d,t[5]=m*l+p,t[9]=u*l-g,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let p=a*c,u=a*l,g=o*c,m=o*l;t[0]=c*h,t[4]=m-p*d,t[8]=g*d+u,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-l*h,t[6]=u*d+g,t[10]=p-m*d}else if(e.order==="XZY"){let p=a*c,u=a*l,g=o*c,m=o*l;t[0]=c*h,t[4]=-d,t[8]=l*h,t[1]=p*d+m,t[5]=a*h,t[9]=u*d-g,t[2]=g*d-u,t[6]=o*h,t[10]=m*d+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(pd,e,md)}lookAt(e,t,i){let n=this.elements;return Ft.subVectors(e,t),Ft.lengthSq()===0&&(Ft.z=1),Ft.normalize(),Vi.crossVectors(i,Ft),Vi.lengthSq()===0&&(Math.abs(i.z)===1?Ft.x+=1e-4:Ft.z+=1e-4,Ft.normalize(),Vi.crossVectors(i,Ft)),Vi.normalize(),hs.crossVectors(Ft,Vi),n[0]=Vi.x,n[4]=hs.x,n[8]=Ft.x,n[1]=Vi.y,n[5]=hs.y,n[9]=Ft.y,n[2]=Vi.z,n[6]=hs.z,n[10]=Ft.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,n=t.elements,s=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],h=i[1],d=i[5],p=i[9],u=i[13],g=i[2],m=i[6],v=i[10],f=i[14],_=i[3],x=i[7],S=i[11],E=i[15],M=n[0],P=n[4],F=n[8],L=n[12],N=n[1],H=n[5],B=n[9],Z=n[13],X=n[2],V=n[6],q=n[10],U=n[14],W=n[3],re=n[7],Me=n[11],ge=n[15];return s[0]=a*M+o*N+c*X+l*W,s[4]=a*P+o*H+c*V+l*re,s[8]=a*F+o*B+c*q+l*Me,s[12]=a*L+o*Z+c*U+l*ge,s[1]=h*M+d*N+p*X+u*W,s[5]=h*P+d*H+p*V+u*re,s[9]=h*F+d*B+p*q+u*Me,s[13]=h*L+d*Z+p*U+u*ge,s[2]=g*M+m*N+v*X+f*W,s[6]=g*P+m*H+v*V+f*re,s[10]=g*F+m*B+v*q+f*Me,s[14]=g*L+m*Z+v*U+f*ge,s[3]=_*M+x*N+S*X+E*W,s[7]=_*P+x*H+S*V+E*re,s[11]=_*F+x*B+S*q+E*Me,s[15]=_*L+x*Z+S*U+E*ge,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],n=e[8],s=e[12],a=e[1],o=e[5],c=e[9],l=e[13],h=e[2],d=e[6],p=e[10],u=e[14],g=e[3],m=e[7],v=e[11],f=e[15],_=c*u-l*p,x=o*u-l*d,S=o*p-c*d,E=a*u-l*h,M=a*p-c*h,P=a*d-o*h;return t*(m*_-v*x+f*S)-i*(g*_-v*E+f*M)+n*(g*x-m*E+f*P)-s*(g*S-m*M+v*P)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],n=e[8],s=e[1],a=e[5],o=e[9],c=e[2],l=e[6],h=e[10];return t*(a*h-o*l)-i*(s*h-o*c)+n*(s*l-a*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let n=this.elements;return e.isVector3?(n[12]=e.x,n[13]=e.y,n[14]=e.z):(n[12]=e,n[13]=t,n[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],d=e[9],p=e[10],u=e[11],g=e[12],m=e[13],v=e[14],f=e[15],_=t*o-i*a,x=t*c-n*a,S=t*l-s*a,E=i*c-n*o,M=i*l-s*o,P=n*l-s*c,F=h*m-d*g,L=h*v-p*g,N=h*f-u*g,H=d*v-p*m,B=d*f-u*m,Z=p*f-u*v,X=_*Z-x*B+S*H+E*N-M*L+P*F;if(X===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let V=1/X;return e[0]=(o*Z-c*B+l*H)*V,e[1]=(n*B-i*Z-s*H)*V,e[2]=(m*P-v*M+f*E)*V,e[3]=(p*M-d*P-u*E)*V,e[4]=(c*N-a*Z-l*L)*V,e[5]=(t*Z-n*N+s*L)*V,e[6]=(v*S-g*P-f*x)*V,e[7]=(h*P-p*S+u*x)*V,e[8]=(a*B-o*N+l*F)*V,e[9]=(i*N-t*B-s*F)*V,e[10]=(g*M-m*S+f*_)*V,e[11]=(d*S-h*M-u*_)*V,e[12]=(o*L-a*H-c*F)*V,e[13]=(t*H-i*L+n*F)*V,e[14]=(m*x-g*E-v*_)*V,e[15]=(h*E-d*x+p*_)*V,this}scale(e){let t=this.elements,i=e.x,n=e.y,s=e.z;return t[0]*=i,t[4]*=n,t[8]*=s,t[1]*=i,t[5]*=n,t[9]*=s,t[2]*=i,t[6]*=n,t[10]*=s,t[3]*=i,t[7]*=n,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],n=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,n))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),n=Math.sin(t),s=1-i,a=e.x,o=e.y,c=e.z,l=s*a,h=s*o;return this.set(l*a+i,l*o-n*c,l*c+n*o,0,l*o+n*c,h*o+i,h*c-n*a,0,l*c-n*o,h*c+n*a,s*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,n,s,a){return this.set(1,i,s,0,e,1,a,0,t,n,1,0,0,0,0,1),this}compose(e,t,i){let n=this.elements,s=t._x,a=t._y,o=t._z,c=t._w,l=s+s,h=a+a,d=o+o,p=s*l,u=s*h,g=s*d,m=a*h,v=a*d,f=o*d,_=c*l,x=c*h,S=c*d,E=i.x,M=i.y,P=i.z;return n[0]=(1-(m+f))*E,n[1]=(u+S)*E,n[2]=(g-x)*E,n[3]=0,n[4]=(u-S)*M,n[5]=(1-(p+f))*M,n[6]=(v+_)*M,n[7]=0,n[8]=(g+x)*P,n[9]=(v-_)*P,n[10]=(1-(p+m))*P,n[11]=0,n[12]=e.x,n[13]=e.y,n[14]=e.z,n[15]=1,this}decompose(e,t,i){let n=this.elements;e.x=n[12],e.y=n[13],e.z=n[14];let s=this.determinantAffine();if(s===0)return i.set(1,1,1),t.identity(),this;let a=Dn.set(n[0],n[1],n[2]).length(),o=Dn.set(n[4],n[5],n[6]).length(),c=Dn.set(n[8],n[9],n[10]).length();s<0&&(a=-a),ei.copy(this);let l=1/a,h=1/o,d=1/c;return ei.elements[0]*=l,ei.elements[1]*=l,ei.elements[2]*=l,ei.elements[4]*=h,ei.elements[5]*=h,ei.elements[6]*=h,ei.elements[8]*=d,ei.elements[9]*=d,ei.elements[10]*=d,t.setFromRotationMatrix(ei),i.x=a,i.y=o,i.z=c,this}makePerspective(e,t,i,n,s,a,o=2e3,c=!1){let l=this.elements,h=2*s/(t-e),d=2*s/(i-n),p=(t+e)/(t-e),u=(i+n)/(i-n),g,m;if(c)g=s/(a-s),m=a*s/(a-s);else if(o===Ci)g=-(a+s)/(a-s),m=-2*a*s/(a-s);else{if(o!==jn)throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);g=-a/(a-s),m=-a*s/(a-s)}return l[0]=h,l[4]=0,l[8]=p,l[12]=0,l[1]=0,l[5]=d,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,n,s,a,o=2e3,c=!1){let l=this.elements,h=2/(t-e),d=2/(i-n),p=-(t+e)/(t-e),u=-(i+n)/(i-n),g,m;if(c)g=1/(a-s),m=a/(a-s);else if(o===Ci)g=-2/(a-s),m=-(a+s)/(a-s);else{if(o!==jn)throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);g=-1/(a-s),m=-s/(a-s)}return l[0]=h,l[4]=0,l[8]=0,l[12]=p,l[1]=0,l[5]=d,l[9]=0,l[13]=u,l[2]=0,l[6]=0,l[10]=g,l[14]=m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let n=0;n<16;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};Aa.prototype.isMatrix4=!0;var Ne=Aa,Dn=new w,ei=new Ne,pd=new w(0,0,0),md=new w(1,1,1),Vi=new w,hs=new w,Ft=new w,th=new Ne,ih=new Lt,Ri=class r{constructor(e=0,t=0,i=0,n=r.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=n}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,n=this._order){return this._x=e,this._y=t,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let n=e.elements,s=n[0],a=n[4],o=n[8],c=n[1],l=n[5],h=n[9],d=n[2],p=n[6],u=n[10];switch(t){case"XYZ":this._y=Math.asin(Ue(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,u),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(p,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Ue(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,u),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(Ue(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-d,u),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-Ue(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(p,u),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Ue(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(o,u));break;case"XZY":this._z=Math.asin(-Ue(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(p,l),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,u),this._y=0);break;default:be("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return th.makeRotationFromQuaternion(e),this.setFromRotationMatrix(th,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return ih.setFromEuler(this),this.setFromQuaternion(ih,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ri.DEFAULT_ORDER="XYZ";var Jn=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},fd=0,nh=new w,Nn=new Lt,Mi=new Ne,us=new w,vr=new w,gd=new w,_d=new Lt,rh=new w(1,0,0),sh=new w(0,1,0),ah=new w(0,0,1),oh={type:"added"},vd={type:"removed"},Un={type:"childadded",child:null},fo={type:"childremoved",child:null},Mt=class r extends ni{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:fd++}),this.uuid=En(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=r.DEFAULT_UP.clone();let e=new w,t=new Ri,i=new Lt,n=new w(1,1,1);t._onChange(function(){i.setFromEuler(t,!1)}),i._onChange(function(){t.setFromQuaternion(i,void 0,!1)}),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new Ne},normalMatrix:{value:new Ie}}),this.matrix=new Ne,this.matrixWorld=new Ne,this.matrixAutoUpdate=r.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=r.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Jn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Nn.setFromAxisAngle(e,t),this.quaternion.multiply(Nn),this}rotateOnWorldAxis(e,t){return Nn.setFromAxisAngle(e,t),this.quaternion.premultiply(Nn),this}rotateX(e){return this.rotateOnAxis(rh,e)}rotateY(e){return this.rotateOnAxis(sh,e)}rotateZ(e){return this.rotateOnAxis(ah,e)}translateOnAxis(e,t){return nh.copy(e).applyQuaternion(this.quaternion),this.position.add(nh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(rh,e)}translateY(e){return this.translateOnAxis(sh,e)}translateZ(e){return this.translateOnAxis(ah,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Mi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?us.copy(e):us.set(e,t,i);let n=this.parent;this.updateWorldMatrix(!0,!1),vr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Mi.lookAt(vr,us,this.up):Mi.lookAt(us,vr,this.up),this.quaternion.setFromRotationMatrix(Mi),n&&(Mi.extractRotation(n.matrixWorld),Nn.setFromRotationMatrix(Mi),this.quaternion.premultiply(Nn.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Te("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(oh),Un.child=e,this.dispatchEvent(Un),Un.child=null):Te("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(vd),fo.child=e,this.dispatchEvent(fo),fo.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Mi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Mi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Mi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(oh),Un.child=e,this.dispatchEvent(Un),Un.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,n=this.children.length;i<n;i++){let s=this.children[i].getObjectByProperty(e,t);if(s!==void 0)return s}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let n=this.children;for(let s=0,a=n.length;s<a;s++)n[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vr,e,gd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vr,_d,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,n=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*i-s[8]*n,s[13]+=i-s[1]*t-s[5]*i-s[9]*n,s[14]+=n-s[2]*t-s[6]*i-s[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let s=this.children;for(let a=0,o=s.length;a<o;a++)s[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.castShadow===!0&&(n.castShadow=!0),this.receiveShadow===!0&&(n.receiveShadow=!0),this.visible===!1&&(n.visible=!1),this.frustumCulled===!1&&(n.frustumCulled=!1),this.renderOrder!==0&&(n.renderOrder=this.renderOrder),this.static!==!1&&(n.static=this.static),Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(n.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(o=>({...o})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(e),n.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON())),this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=s(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let d=c[l];s(e.shapes,d)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(s(e.materials,this.material[c]));n.material=o}else n.material=s(e.materials,this.material);if(this.children.length>0){n.children=[];for(let o=0;o<this.children.length;o++)n.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){n.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];n.animations.push(s(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),l=a(e.textures),h=a(e.images),d=a(e.shapes),p=a(e.skeletons),u=a(e.animations),g=a(e.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),p.length>0&&(i.skeletons=p),u.length>0&&(i.animations=u),g.length>0&&(i.nodes=g)}return i.object=n,i;function a(o){let c=[];for(let l in o){let h=o[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let n=e.children[i];this.add(n.clone())}return this}};Mt.DEFAULT_UP=new w(0,1,0),Mt.DEFAULT_MATRIX_AUTO_UPDATE=!0,Mt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var It=class extends Mt{constructor(){super(),this.isGroup=!0,this.type="Group"}},yd={type:"move"},Kn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new It,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new It,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new w,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new w),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new It,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new w,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new w,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let n=null,s=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(let m of e.hand.values()){let v=t.getJointPose(m,i),f=this._getHandJoint(l,m);v!==null&&(f.matrix.fromArray(v.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=v.radius),f.visible=v!==null}let h=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],p=h.position.distanceTo(d.position),u=.02,g=.005;l.inputState.pinching&&p>u+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&p<=u-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(n=t.getPose(e.targetRaySpace,i),n===null&&s!==null&&(n=s),n!==null&&(o.matrix.fromArray(n.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,n.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(n.linearVelocity)):o.hasLinearVelocity=!1,n.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(n.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(yd)))}return o!==null&&(o.visible=n!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new It;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},vu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ki={h:0,s:0,l:0},ds={h:0,s:0,l:0};function go(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+6*(e-r)*t:t<.5?e:t<2/3?r+6*(e-r)*(2/3-t):r}var Oe=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let n=e;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Pt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(255&e)/255,Ve.colorSpaceToWorking(this,t),this}setRGB(e,t,i,n=Ve.workingColorSpace){return this.r=e,this.g=t,this.b=i,Ve.colorSpaceToWorking(this,n),this}setHSL(e,t,i,n=Ve.workingColorSpace){if(e=Wo(e,1),t=Ue(t,0,1),i=Ue(i,0,1),t===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+t):i+t-i*t,a=2*i-s;this.r=go(a,s,e+1/3),this.g=go(a,s,e),this.b=go(a,s,e-1/3)}return Ve.colorSpaceToWorking(this,n),this}setStyle(e,t=Pt){function i(s){s!==void 0&&parseFloat(s)<1&&be("Color: Alpha component of "+e+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,a=n[1],o=n[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:be("Color: Unknown color model "+e)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=n[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);be("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Pt){let i=vu[e.toLowerCase()];return i!==void 0?this.setHex(i,t):be("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ai(e.r),this.g=Ai(e.g),this.b=Ai(e.b),this}copyLinearToSRGB(e){return this.r=Xn(e.r),this.g=Xn(e.g),this.b=Xn(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Pt){return Ve.workingToColorSpace(Tt.copy(this),e),65536*Math.round(Ue(255*Tt.r,0,255))+256*Math.round(Ue(255*Tt.g,0,255))+Math.round(Ue(255*Tt.b,0,255))}getHexString(e=Pt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ve.workingColorSpace){Ve.workingToColorSpace(Tt.copy(this),t);let i=Tt.r,n=Tt.g,s=Tt.b,a=Math.max(i,n,s),o=Math.min(i,n,s),c,l,h=(o+a)/2;if(o===a)c=0,l=0;else{let d=a-o;switch(l=h<=.5?d/(a+o):d/(2-a-o),a){case i:c=(n-s)/d+(n<s?6:0);break;case n:c=(s-i)/d+2;break;case s:c=(i-n)/d+4}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=Ve.workingColorSpace){return Ve.workingToColorSpace(Tt.copy(this),t),e.r=Tt.r,e.g=Tt.g,e.b=Tt.b,e}getStyle(e=Pt){Ve.workingToColorSpace(Tt.copy(this),e);let t=Tt.r,i=Tt.g,n=Tt.b;return e!==Pt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(255*t)},${Math.round(255*i)},${Math.round(255*n)})`}offsetHSL(e,t,i){return this.getHSL(ki),this.setHSL(ki.h+e,ki.s+t,ki.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(ki),e.getHSL(ds);let i=Tr(ki.h,ds.h,t),n=Tr(ki.s,ds.s,t),s=Tr(ki.l,ds.l,t);return this.setHSL(i,n,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,n=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*n,this.g=s[1]*t+s[4]*i+s[7]*n,this.b=s[2]*t+s[5]*i+s[8]*n,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Tt=new Oe;Oe.NAMES=vu;var Lr=class extends Mt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ri,this.environmentIntensity=1,this.environmentRotation=new Ri,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},ti=new w,Si=new w,_o=new w,bi=new w,On=new w,Fn=new w,lh=new w,vo=new w,yo=new w,xo=new w,Mo=new Ze,So=new Ze,bo=new Ze,wi=class r{constructor(e=new w,t=new w,i=new w){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,n){n.subVectors(i,t),ti.subVectors(e,t),n.cross(ti);let s=n.lengthSq();return s>0?n.multiplyScalar(1/Math.sqrt(s)):n.set(0,0,0)}static getBarycoord(e,t,i,n,s){ti.subVectors(n,t),Si.subVectors(i,t),_o.subVectors(e,t);let a=ti.dot(ti),o=ti.dot(Si),c=ti.dot(_o),l=Si.dot(Si),h=Si.dot(_o),d=a*l-o*o;if(d===0)return s.set(0,0,0),null;let p=1/d,u=(l*c-o*h)*p,g=(a*h-o*c)*p;return s.set(1-u-g,g,u)}static containsPoint(e,t,i,n){return this.getBarycoord(e,t,i,n,bi)!==null&&bi.x>=0&&bi.y>=0&&bi.x+bi.y<=1}static getInterpolation(e,t,i,n,s,a,o,c){return this.getBarycoord(e,t,i,n,bi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,bi.x),c.addScaledVector(a,bi.y),c.addScaledVector(o,bi.z),c)}static getInterpolatedAttribute(e,t,i,n,s,a){return Mo.setScalar(0),So.setScalar(0),bo.setScalar(0),Mo.fromBufferAttribute(e,t),So.fromBufferAttribute(e,i),bo.fromBufferAttribute(e,n),a.setScalar(0),a.addScaledVector(Mo,s.x),a.addScaledVector(So,s.y),a.addScaledVector(bo,s.z),a}static isFrontFacing(e,t,i,n){return ti.subVectors(i,t),Si.subVectors(e,t),ti.cross(Si).dot(n)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,n){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[n]),this}setFromAttributeAndIndices(e,t,i,n){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ti.subVectors(this.c,this.b),Si.subVectors(this.a,this.b),.5*ti.cross(Si).length()}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return r.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return r.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,n,s){return r.getInterpolation(e,this.a,this.b,this.c,t,i,n,s)}containsPoint(e){return r.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return r.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,n=this.b,s=this.c,a,o;On.subVectors(n,i),Fn.subVectors(s,i),vo.subVectors(e,i);let c=On.dot(vo),l=Fn.dot(vo);if(c<=0&&l<=0)return t.copy(i);yo.subVectors(e,n);let h=On.dot(yo),d=Fn.dot(yo);if(h>=0&&d<=h)return t.copy(n);let p=c*d-h*l;if(p<=0&&c>=0&&h<=0)return a=c/(c-h),t.copy(i).addScaledVector(On,a);xo.subVectors(e,s);let u=On.dot(xo),g=Fn.dot(xo);if(g>=0&&u<=g)return t.copy(s);let m=u*l-c*g;if(m<=0&&l>=0&&g<=0)return o=l/(l-g),t.copy(i).addScaledVector(Fn,o);let v=h*g-u*d;if(v<=0&&d-h>=0&&u-g>=0)return lh.subVectors(s,n),o=(d-h)/(d-h+(u-g)),t.copy(n).addScaledVector(lh,o);let f=1/(v+m+p);return a=m*f,o=p*f,t.copy(i).addScaledVector(On,a).addScaledVector(Fn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ri=class{constructor(e=new w(1/0,1/0,1/0),t=new w(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(ii.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(ii.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=ii.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,ii):ii.fromBufferAttribute(s,a),ii.applyMatrix4(e.matrixWorld),this.expandByPoint(ii);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ps.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ps.copy(i.boundingBox)),ps.applyMatrix4(e.matrixWorld),this.union(ps)}let n=e.children;for(let s=0,a=n.length;s<a;s++)this.expandByObject(n[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ii),ii.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(yr),ms.subVectors(this.max,yr),Bn.subVectors(e.a,yr),zn.subVectors(e.b,yr),Gn.subVectors(e.c,yr),Hi.subVectors(zn,Bn),Wi.subVectors(Gn,zn),cn.subVectors(Bn,Gn);let t=[0,-Hi.z,Hi.y,0,-Wi.z,Wi.y,0,-cn.z,cn.y,Hi.z,0,-Hi.x,Wi.z,0,-Wi.x,cn.z,0,-cn.x,-Hi.y,Hi.x,0,-Wi.y,Wi.x,0,-cn.y,cn.x,0];return!!To(t,Bn,zn,Gn,ms)&&(t=[1,0,0,0,1,0,0,0,1],!!To(t,Bn,zn,Gn,ms)&&(fs.crossVectors(Hi,Wi),t=[fs.x,fs.y,fs.z],To(t,Bn,zn,Gn,ms)))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ii).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=.5*this.getSize(ii).length()),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(Ti[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ti[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ti[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ti[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ti[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ti[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ti[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ti[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ti)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ti=[new w,new w,new w,new w,new w,new w,new w,new w],ii=new w,ps=new ri,Bn=new w,zn=new w,Gn=new w,Hi=new w,Wi=new w,cn=new w,yr=new w,ms=new w,fs=new w,hn=new w;function To(r,e,t,i,n){for(let s=0,a=r.length-3;s<=a;s+=3){hn.fromArray(r,s);let o=n.x*Math.abs(hn.x)+n.y*Math.abs(hn.y)+n.z*Math.abs(hn.z),c=e.dot(hn),l=t.dot(hn),h=i.dot(hn);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}var hf=xd();function xd(){let r=new ArrayBuffer(4),e=new Float32Array(r),t=new Uint32Array(r),i=new Uint32Array(512),n=new Uint32Array(512);for(let c=0;c<256;++c){let l=c-127;l<-27?(i[c]=0,i[256|c]=32768,n[c]=24,n[256|c]=24):l<-14?(i[c]=1024>>-l-14,i[256|c]=1024>>-l-14|32768,n[c]=-l-1,n[256|c]=-l-1):l<=15?(i[c]=l+15<<10,i[256|c]=l+15<<10|32768,n[c]=13,n[256|c]=13):l<128?(i[c]=31744,i[256|c]=64512,n[c]=24,n[256|c]=24):(i[c]=31744,i[256|c]=64512,n[c]=13,n[256|c]=13)}let s=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let c=1;c<1024;++c){let l=c<<13,h=0;for(;!(8388608&l);)l<<=1,h-=8388608;l&=-8388609,h+=947912704,s[c]=l|h}for(let c=1024;c<2048;++c)s[c]=939524096+(c-1024<<13);for(let c=1;c<31;++c)a[c]=c<<23;a[31]=1199570944,a[32]=2147483648;for(let c=33;c<63;++c)a[c]=2147483648+(c-32<<23);a[63]=3347054592;for(let c=1;c<64;++c)c!==32&&(o[c]=1024);return{floatView:e,uint32View:t,baseTable:i,shiftTable:n,mantissaTable:s,exponentTable:a,offsetTable:o}}var ut=new w,gs=new Q,Md=0,Gt=class extends ni{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Md++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Ho,this.updateRanges=[],this.gpuType=oi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let n=0,s=this.itemSize;n<s;n++)this.array[e+n]=t.array[i+n];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)gs.fromBufferAttribute(this,t),gs.applyMatrix3(e),this.setXY(t,gs.x,gs.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)ut.fromBufferAttribute(this,t),ut.applyMatrix3(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)ut.fromBufferAttribute(this,t),ut.applyMatrix4(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)ut.fromBufferAttribute(this,t),ut.applyNormalMatrix(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)ut.fromBufferAttribute(this,t),ut.transformDirection(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Hn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Rt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Hn(t,this.array)),t}setX(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Hn(t,this.array)),t}setY(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Hn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Hn(t,this.array)),t}setW(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Rt(t,this.array),i=Rt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,n){return e*=this.itemSize,this.normalized&&(t=Rt(t,this.array),i=Rt(i,this.array),n=Rt(n,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this}setXYZW(e,t,i,n,s){return e*=this.itemSize,this.normalized&&(t=Rt(t,this.array),i=Rt(i,this.array),n=Rt(n,this.array),s=Rt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Ho&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}};var Dr=class extends Gt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var Nr=class extends Gt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var Ee=class extends Gt{constructor(e,t,i){super(new Float32Array(e),t,i)}},Sd=new ri,xr=new w,Eo=new w,si=class{constructor(e=new w,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):Sd.setFromPoints(e).getCenter(i);let n=0;for(let s=0,a=e.length;s<a;s++)n=Math.max(n,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(n),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;xr.subVectors(e,this.center);let t=xr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),n=.5*(i-this.radius);this.center.addScaledVector(xr,n/i),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Eo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(xr.copy(e.center).add(Eo)),this.expandByPoint(xr.copy(e.center).sub(Eo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},bd=0,qt=new Ne,wo=new Mt,Vn=new w,Bt=new ri,Mr=new ri,vt=new w,et=class r extends ni{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:bd++}),this.uuid=En(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(function(t){for(let i=t.length-1;i>=0;--i)if(t[i]>=65535)return!0;return!1}(e)?Nr:Dr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new Ie().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return qt.makeRotationFromQuaternion(e),this.applyMatrix4(qt),this}rotateX(e){return qt.makeRotationX(e),this.applyMatrix4(qt),this}rotateY(e){return qt.makeRotationY(e),this.applyMatrix4(qt),this}rotateZ(e){return qt.makeRotationZ(e),this.applyMatrix4(qt),this}translate(e,t,i){return qt.makeTranslation(e,t,i),this.applyMatrix4(qt),this}scale(e,t,i){return qt.makeScale(e,t,i),this.applyMatrix4(qt),this}lookAt(e){return wo.lookAt(e),wo.updateMatrix(),this.applyMatrix4(wo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Vn).negate(),this.translate(Vn.x,Vn.y,Vn.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let n=0,s=e.length;n<s;n++){let a=e[n];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Ee(i,3))}else{let i=Math.min(e.length,t.count);for(let n=0;n<i;n++){let s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&be("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ri);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return Te("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),void this.boundingBox.set(new w(-1/0,-1/0,-1/0),new w(1/0,1/0,1/0));if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,n=t.length;i<n;i++){let s=t[i];Bt.setFromBufferAttribute(s),this.morphTargetsRelative?(vt.addVectors(this.boundingBox.min,Bt.min),this.boundingBox.expandByPoint(vt),vt.addVectors(this.boundingBox.max,Bt.max),this.boundingBox.expandByPoint(vt)):(this.boundingBox.expandByPoint(Bt.min),this.boundingBox.expandByPoint(Bt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Te('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new si);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return Te("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),void this.boundingSphere.set(new w,1/0);if(e){let i=this.boundingSphere.center;if(Bt.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){let o=t[s];Mr.setFromBufferAttribute(o),this.morphTargetsRelative?(vt.addVectors(Bt.min,Mr.min),Bt.expandByPoint(vt),vt.addVectors(Bt.max,Mr.max),Bt.expandByPoint(vt)):(Bt.expandByPoint(Mr.min),Bt.expandByPoint(Mr.max))}Bt.getCenter(i);let n=0;for(let s=0,a=e.count;s<a;s++)vt.fromBufferAttribute(e,s),n=Math.max(n,i.distanceToSquared(vt));if(t)for(let s=0,a=t.length;s<a;s++){let o=t[s],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)vt.fromBufferAttribute(o,l),c&&(Vn.fromBufferAttribute(e,l),vt.add(Vn)),n=Math.max(n,i.distanceToSquared(vt))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&Te('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0)return void Te("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");let i=t.position,n=t.normal,s=t.uv,a=this.getAttribute("tangent");a!==void 0&&a.count===i.count||(a=new Gt(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],c=[];for(let F=0;F<i.count;F++)o[F]=new w,c[F]=new w;let l=new w,h=new w,d=new w,p=new Q,u=new Q,g=new Q,m=new w,v=new w;function f(F,L,N){l.fromBufferAttribute(i,F),h.fromBufferAttribute(i,L),d.fromBufferAttribute(i,N),p.fromBufferAttribute(s,F),u.fromBufferAttribute(s,L),g.fromBufferAttribute(s,N),h.sub(l),d.sub(l),u.sub(p),g.sub(p);let H=1/(u.x*g.y-g.x*u.y);isFinite(H)&&(m.copy(h).multiplyScalar(g.y).addScaledVector(d,-u.y).multiplyScalar(H),v.copy(d).multiplyScalar(u.x).addScaledVector(h,-g.x).multiplyScalar(H),o[F].add(m),o[L].add(m),o[N].add(m),c[F].add(v),c[L].add(v),c[N].add(v))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let F=0,L=_.length;F<L;++F){let N=_[F],H=N.start;for(let B=H,Z=H+N.count;B<Z;B+=3)f(e.getX(B+0),e.getX(B+1),e.getX(B+2))}let x=new w,S=new w,E=new w,M=new w;function P(F){E.fromBufferAttribute(n,F),M.copy(E);let L=o[F];x.copy(L),x.sub(E.multiplyScalar(E.dot(L))).normalize(),S.crossVectors(M,L);let N=S.dot(c[F])<0?-1:1;a.setXYZW(F,x.x,x.y,x.z,N)}for(let F=0,L=_.length;F<L;++F){let N=_[F],H=N.start;for(let B=H,Z=H+N.count;B<Z;B+=3)P(e.getX(B+0)),P(e.getX(B+1)),P(e.getX(B+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new Gt(new Float32Array(3*t.count),3),this.setAttribute("normal",i);else for(let p=0,u=i.count;p<u;p++)i.setXYZ(p,0,0,0);let n=new w,s=new w,a=new w,o=new w,c=new w,l=new w,h=new w,d=new w;if(e)for(let p=0,u=e.count;p<u;p+=3){let g=e.getX(p+0),m=e.getX(p+1),v=e.getX(p+2);n.fromBufferAttribute(t,g),s.fromBufferAttribute(t,m),a.fromBufferAttribute(t,v),h.subVectors(a,s),d.subVectors(n,s),h.cross(d),o.fromBufferAttribute(i,g),c.fromBufferAttribute(i,m),l.fromBufferAttribute(i,v),o.add(h),c.add(h),l.add(h),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(m,c.x,c.y,c.z),i.setXYZ(v,l.x,l.y,l.z)}else for(let p=0,u=t.count;p<u;p+=3)n.fromBufferAttribute(t,p+0),s.fromBufferAttribute(t,p+1),a.fromBufferAttribute(t,p+2),h.subVectors(a,s),d.subVectors(n,s),h.cross(d),i.setXYZ(p+0,h.x,h.y,h.z),i.setXYZ(p+1,h.x,h.y,h.z),i.setXYZ(p+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)vt.fromBufferAttribute(e,t),vt.normalize(),e.setXYZ(t,vt.x,vt.y,vt.z)}toNonIndexed(){function e(o,c){let l=o.array,h=o.itemSize,d=o.normalized,p=new l.constructor(c.length*h),u=0,g=0;for(let m=0,v=c.length;m<v;m++){u=o.isInterleavedBufferAttribute?c[m]*o.data.stride+o.offset:c[m]*h;for(let f=0;f<h;f++)p[g++]=l[u++]}return new Gt(p,h,d)}if(this.index===null)return be("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new r,i=this.index.array,n=this.attributes;for(let o in n){let c=e(n[o],i);t.setAttribute(o,c)}let s=this.morphAttributes;for(let o in s){let c=[],l=s[o];for(let h=0,d=l.length;h<d;h++){let p=e(l[h],i);c.push(p)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let n={},s=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let d=0,p=l.length;d<p;d++){let u=l[d];h.push(u.toJSON(e.data))}h.length>0&&(n[c]=h,s=!0)}s&&(e.data.morphAttributes=n,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let n=e.attributes;for(let l in n){let h=n[l];this.setAttribute(l,h.clone(t))}let s=e.morphAttributes;for(let l in s){let h=[],d=s[l];for(let p=0,u=d.length;p<u;p++)h.push(d[p].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let l=0,h=a.length;l<h;l++){let d=a[l];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var uf=new w;var Td=0,Pi=class extends ni{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Td++}),this.uuid=En(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Oe(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=pn,this.stencilZFail=pn,this.stencilZPass=pn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){be(`Material: parameter '${t}' has value of undefined.`);continue}let n=this[t];n!==void 0?n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[t]=i:be(`Material: '${t}' is not a property of THREE.${this.type}.`)}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};function n(s){let a=[];for(let o in s){let c=s[o];delete c.metadata,a.push(c)}return a}if(i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(i.blending=this.blending),this.side!==0&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==204&&(i.blendSrc=this.blendSrc),this.blendDst!==205&&(i.blendDst=this.blendDst),this.blendEquation!==100&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==pn&&(i.stencilFail=this.stencilFail),this.stencilZFail!==pn&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==pn&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData),t){let s=n(e.textures),a=n(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Oe().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Q().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Q().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let n=t.length;i=new Array(n);for(let s=0;s!==n;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var df=new w,pf=new w,mf=new w,ff=new Q,gf=new Q,_f=new Ne,vf=new w,yf=new w,xf=new w,Mf=new Q,Sf=new Q,bf=new Q;var Tf=new w,Ef=new w;var Ei=new w,Ao=new w,_s=new w,Xi=new w,Co=new w,vs=new w,Ro=new w,fi=class{constructor(e=new w,t=new w(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ei)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ei.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ei.copy(this.origin).addScaledVector(this.direction,t),Ei.distanceToSquared(e))}distanceSqToSegment(e,t,i,n){Ao.copy(e).add(t).multiplyScalar(.5),_s.copy(t).sub(e).normalize(),Xi.copy(this.origin).sub(Ao);let s=.5*e.distanceTo(t),a=-this.direction.dot(_s),o=Xi.dot(this.direction),c=-Xi.dot(_s),l=Xi.lengthSq(),h=Math.abs(1-a*a),d,p,u,g;if(h>0)if(d=a*c-o,p=a*o-c,g=s*h,d>=0)if(p>=-g)if(p<=g){let m=1/h;d*=m,p*=m,u=d*(d+a*p+2*o)+p*(a*d+p+2*c)+l}else p=s,d=Math.max(0,-(a*p+o)),u=-d*d+p*(p+2*c)+l;else p=-s,d=Math.max(0,-(a*p+o)),u=-d*d+p*(p+2*c)+l;else p<=-g?(d=Math.max(0,-(-a*s+o)),p=d>0?-s:Math.min(Math.max(-s,-c),s),u=-d*d+p*(p+2*c)+l):p<=g?(d=0,p=Math.min(Math.max(-s,-c),s),u=p*(p+2*c)+l):(d=Math.max(0,-(a*s+o)),p=d>0?s:Math.min(Math.max(-s,-c),s),u=-d*d+p*(p+2*c)+l);else p=a>0?-s:s,d=Math.max(0,-(a*p+o)),u=-d*d+p*(p+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,d),n&&n.copy(Ao).addScaledVector(_s,p),u}intersectSphere(e,t){Ei.subVectors(e.center,this.origin);let i=Ei.dot(this.direction),n=Ei.dot(Ei)-i*i,s=e.radius*e.radius;if(n>s)return null;let a=Math.sqrt(s-n),o=i-a,c=i+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return!(e.radius<0)&&this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0?!0:e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,n,s,a,o,c,l=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,p=this.origin;return l>=0?(i=(e.min.x-p.x)*l,n=(e.max.x-p.x)*l):(i=(e.max.x-p.x)*l,n=(e.min.x-p.x)*l),h>=0?(s=(e.min.y-p.y)*h,a=(e.max.y-p.y)*h):(s=(e.max.y-p.y)*h,a=(e.min.y-p.y)*h),i>a||s>n?null:((s>i||isNaN(i))&&(i=s),(a<n||isNaN(n))&&(n=a),d>=0?(o=(e.min.z-p.z)*d,c=(e.max.z-p.z)*d):(o=(e.max.z-p.z)*d,c=(e.min.z-p.z)*d),i>c||o>n?null:((o>i||i!=i)&&(i=o),(c<n||n!=n)&&(n=c),n<0?null:this.at(i>=0?i:n,t)))}intersectsBox(e){return this.intersectBox(e,Ei)!==null}intersectTriangle(e,t,i,n,s){Co.subVectors(t,e),vs.subVectors(i,e),Ro.crossVectors(Co,vs);let a,o=this.direction.dot(Ro);if(o>0){if(n)return null;a=1}else{if(!(o<0))return null;a=-1,o=-o}Xi.subVectors(this.origin,e);let c=a*this.direction.dot(vs.crossVectors(Xi,vs));if(c<0)return null;let l=a*this.direction.dot(Co.cross(Xi));if(l<0||c+l>o)return null;let h=-a*Xi.dot(Ro);return h<0?null:this.at(h/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},fn=class extends Pi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ri,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ch=new Ne,un=new fi,ys=new si,hh=new w,xs=new w,Ms=new w,Ss=new w,Po=new w,bs=new w,uh=new w,Ts=new w,ze=class extends Mt{constructor(e=new et,t=new fn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let i=e[t[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let n=0,s=i.length;n<s;n++){let a=i[n].name||String(n);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=n}}}}getVertexPosition(e,t){let i=this.geometry,n=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(n,e);let o=this.morphTargetInfluences;if(s&&o){bs.set(0,0,0);for(let c=0,l=s.length;c<l;c++){let h=o[c],d=s[c];h!==0&&(Po.fromBufferAttribute(d,e),a?bs.addScaledVector(Po,h):bs.addScaledVector(Po.sub(t),h))}t.add(bs)}return t}raycast(e,t){let i=this.geometry,n=this.material,s=this.matrixWorld;if(n!==void 0){if(i.boundingSphere===null&&i.computeBoundingSphere(),ys.copy(i.boundingSphere),ys.applyMatrix4(s),un.copy(e.ray).recast(e.near),ys.containsPoint(un.origin)===!1&&(un.intersectSphere(ys,hh)===null||un.origin.distanceToSquared(hh)>(e.far-e.near)**2))return;ch.copy(s).invert(),un.copy(e.ray).applyMatrix4(ch),i.boundingBox!==null&&un.intersectsBox(i.boundingBox)===!1||this._computeIntersections(e,t,un)}}_computeIntersections(e,t,i){let n,s=this.geometry,a=this.material,o=s.index,c=s.attributes.position,l=s.attributes.uv,h=s.attributes.uv1,d=s.attributes.normal,p=s.groups,u=s.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,m=p.length;g<m;g++){let v=p[g],f=a[v.materialIndex];for(let _=Math.max(v.start,u.start),x=Math.min(o.count,Math.min(v.start+v.count,u.start+u.count));_<x;_+=3)n=Es(this,f,e,i,l,h,d,o.getX(_),o.getX(_+1),o.getX(_+2)),n&&(n.faceIndex=Math.floor(_/3),n.face.materialIndex=v.materialIndex,t.push(n))}else for(let g=Math.max(0,u.start),m=Math.min(o.count,u.start+u.count);g<m;g+=3)n=Es(this,a,e,i,l,h,d,o.getX(g),o.getX(g+1),o.getX(g+2)),n&&(n.faceIndex=Math.floor(g/3),t.push(n));else if(c!==void 0)if(Array.isArray(a))for(let g=0,m=p.length;g<m;g++){let v=p[g],f=a[v.materialIndex];for(let _=Math.max(v.start,u.start),x=Math.min(c.count,Math.min(v.start+v.count,u.start+u.count));_<x;_+=3)n=Es(this,f,e,i,l,h,d,_,_+1,_+2),n&&(n.faceIndex=Math.floor(_/3),n.face.materialIndex=v.materialIndex,t.push(n))}else for(let g=Math.max(0,u.start),m=Math.min(c.count,u.start+u.count);g<m;g+=3)n=Es(this,a,e,i,l,h,d,g,g+1,g+2),n&&(n.faceIndex=Math.floor(g/3),t.push(n))}};function Es(r,e,t,i,n,s,a,o,c,l){r.getVertexPosition(o,xs),r.getVertexPosition(c,Ms),r.getVertexPosition(l,Ss);let h=function(d,p,u,g,m,v,f,_){let x;if(x=p.side===1?g.intersectTriangle(f,v,m,!0,_):g.intersectTriangle(m,v,f,p.side===0,_),x===null)return null;Ts.copy(_),Ts.applyMatrix4(d.matrixWorld);let S=u.ray.origin.distanceTo(Ts);return S<u.near||S>u.far?null:{distance:S,point:Ts.clone(),object:d}}(r,e,t,i,xs,Ms,Ss,uh);if(h){let d=new w;wi.getBarycoord(uh,xs,Ms,Ss,d),n&&(h.uv=wi.getInterpolatedAttribute(n,o,c,l,d,new Q)),s&&(h.uv1=wi.getInterpolatedAttribute(s,o,c,l,d,new Q)),a&&(h.normal=wi.getInterpolatedAttribute(a,o,c,l,d,new w),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let p={a:o,b:c,c:l,normal:new w,materialIndex:0};wi.getNormal(xs,Ms,Ss,p.normal),h.face=p,h.barycoord=d}return h}var wf=new Ze,Af=new Ze,Cf=new Ze,Rf=new Ze,Pf=new Ne,If=new w,Lf=new si,Df=new Ne,Nf=new fi;var Xs=class extends Nt{constructor(e=null,t=1,i=1,n,s,a,o,c,l=1003,h=1003,d,p){super(null,a,o,c,l,h,n,s,d,p),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Uf=new Ne,Of=new Ne;var Ff=new Ne,Bf=new Ne;var zf=new ri,Gf=new Ne,Vf=new ze,kf=new si;var Io=new w,Ed=new w,wd=new Ie,Yt=class{constructor(e=new w(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,n){return this.normal.set(e,t,i),this.constant=n,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let n=Io.subVectors(i,t).cross(Ed.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(n,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let n=e.delta(Io),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/s;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(n,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||wd.getNormalMatrix(e),n=this.coplanarPoint(Io).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},dn=new si,Ad=new Q(.5,.5),ws=new w,Ii=class{constructor(e=new Yt,t=new Yt,i=new Yt,n=new Yt,s=new Yt,a=new Yt){this.planes=[e,t,i,n,s,a]}set(e,t,i,n,s,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(n),o[4].copy(s),o[5].copy(a),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=2e3,i=!1){let n=this.planes,s=e.elements,a=s[0],o=s[1],c=s[2],l=s[3],h=s[4],d=s[5],p=s[6],u=s[7],g=s[8],m=s[9],v=s[10],f=s[11],_=s[12],x=s[13],S=s[14],E=s[15];if(n[0].setComponents(l-a,u-h,f-g,E-_).normalize(),n[1].setComponents(l+a,u+h,f+g,E+_).normalize(),n[2].setComponents(l+o,u+d,f+m,E+x).normalize(),n[3].setComponents(l-o,u-d,f-m,E-x).normalize(),i)n[4].setComponents(c,p,v,S).normalize(),n[5].setComponents(l-c,u-p,f-v,E-S).normalize();else if(n[4].setComponents(l-c,u-p,f-v,E-S).normalize(),t===Ci)n[5].setComponents(l+c,u+p,f+v,E+S).normalize();else{if(t!==jn)throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);n[5].setComponents(c,p,v,S).normalize()}return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),dn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),dn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(dn)}intersectsSprite(e){dn.center.set(0,0,0);let t=Ad.distanceTo(e.center);return dn.radius=.7071067811865476+t,dn.applyMatrix4(e.matrixWorld),this.intersectsSphere(dn)}intersectsSphere(e){let t=this.planes,i=e.center,n=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<n)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let n=t[i];if(ws.x=n.normal.x>0?e.max.x:e.min.x,ws.y=n.normal.y>0?e.max.y:e.min.y,ws.z=n.normal.z>0?e.max.z:e.min.z,n.distanceToPoint(ws)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},dh=new Ne,js=class r{constructor(){this.coordinateSystem=Ci,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,i=this._frustums;for(let n=0;n<t.length;n++){let s=t[n];dh.multiplyMatrices(s.projectionMatrix,s.matrixWorldInverse),i[n]===void 0&&(i[n]=new Ii),i[n].setFromProjectionMatrix(dh,s.coordinateSystem,s.reversedDepth)}return this._count=t.length,this}intersectsObject(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,i=e._frustums;for(let n=0;n<e._count;n++)t[n]===void 0&&(t[n]=new Ii),t[n].copy(i[n]);return this._count=e._count,this}clone(){return new r().copy(this)}};var Xo=class{constructor(){this.index=0,this.pool=[],this.list=[]}push(e,t,i,n){let s=this.pool,a=this.list;this.index>=s.length&&s.push({start:-1,count:-1,z:-1,index:-1});let o=s[this.index];a.push(o),this.index++,o.start=e,o.count=t,o.z=i,o.index=n}reset(){this.list.length=0,this.index=0}},Hf=new Ne,Wf=new Oe(1,1,1),Xf=new Ii,jf=new js,qf=new ri,Yf=new si,Zf=new w,Jf=new w,Kf=new w,$f=new Xo,Qf=new ze;var gn=class extends Pi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Oe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},qs=new w,Ys=new w,ph=new Ne,Sr=new fi,As=new si,Lo=new w,mh=new w,Zs=class extends Mt{constructor(e=new et,t=new gn){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[0];for(let n=1,s=t.count;n<s;n++)qs.fromBufferAttribute(t,n-1),Ys.fromBufferAttribute(t,n),i[n]=i[n-1],i[n]+=qs.distanceTo(Ys);e.setAttribute("lineDistance",new Ee(i,1))}else be("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let i=this.geometry,n=this.matrixWorld,s=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),As.copy(i.boundingSphere),As.applyMatrix4(n),As.radius+=s,e.ray.intersectsSphere(As)===!1)return;ph.copy(n).invert(),Sr.copy(e.ray).applyMatrix4(ph);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,h=i.index,d=i.attributes.position;if(h!==null){let p=Math.max(0,a.start),u=Math.min(h.count,a.start+a.count);for(let g=p,m=u-1;g<m;g+=l){let v=h.getX(g),f=h.getX(g+1),_=Cs(this,e,Sr,c,v,f,g);_&&t.push(_)}if(this.isLineLoop){let g=h.getX(u-1),m=h.getX(p),v=Cs(this,e,Sr,c,g,m,u-1);v&&t.push(v)}}else{let p=Math.max(0,a.start),u=Math.min(d.count,a.start+a.count);for(let g=p,m=u-1;g<m;g+=l){let v=Cs(this,e,Sr,c,g,g+1,g);v&&t.push(v)}if(this.isLineLoop){let g=Cs(this,e,Sr,c,u-1,p,u-1);g&&t.push(g)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let i=e[t[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let n=0,s=i.length;n<s;n++){let a=i[n].name||String(n);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=n}}}}};function Cs(r,e,t,i,n,s,a){let o=r.geometry.attributes.position;if(qs.fromBufferAttribute(o,n),Ys.fromBufferAttribute(o,s),t.distanceSqToSegment(qs,Ys,Lo,mh)>i)return;Lo.applyMatrix4(r.matrixWorld);let c=e.ray.origin.distanceTo(Lo);return c<e.near||c>e.far?void 0:{distance:c,point:mh.clone().applyMatrix4(r.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:r}}var fh=new w,gh=new w,_n=class extends Zs{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[];for(let n=0,s=t.count;n<s;n+=2)fh.fromBufferAttribute(t,n),gh.fromBufferAttribute(t,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+fh.distanceTo(gh);e.setAttribute("lineDistance",new Ee(i,1))}else be("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var eg=new Ne,tg=new fi,ig=new si,ng=new w;var Ur=class extends Nt{constructor(e=[],t=301,i,n,s,a,o,c,l,h){super(e,t,i,n,s,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var Li=class extends Nt{constructor(e,t,i=1014,n,s,a,o=1003,c=1003,l,h=1026,d=1){if(h!==rn&&h!==1027)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");super({width:e,height:t,depth:d},n,s,a,o,c,h,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Zn(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Js=class extends Li{constructor(e,t=1014,i=301,n,s,a=1003,o=1003,c,l=1026){let h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,i,n,s,a,o,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Or=class extends Nt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},St=class r extends et{constructor(e=1,t=1,i=1,n=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:n,heightSegments:s,depthSegments:a};let o=this;n=Math.floor(n),s=Math.floor(s),a=Math.floor(a);let c=[],l=[],h=[],d=[],p=0,u=0;function g(m,v,f,_,x,S,E,M,P,F,L){let N=S/P,H=E/F,B=S/2,Z=E/2,X=M/2,V=P+1,q=F+1,U=0,W=0,re=new w;for(let Me=0;Me<q;Me++){let ge=Me*H-Z;for(let _e=0;_e<V;_e++){let ie=_e*N-B;re[m]=ie*_,re[v]=ge*x,re[f]=X,l.push(re.x,re.y,re.z),re[m]=0,re[v]=0,re[f]=M>0?1:-1,h.push(re.x,re.y,re.z),d.push(_e/P),d.push(1-Me/F),U+=1}}for(let Me=0;Me<F;Me++)for(let ge=0;ge<P;ge++){let _e=p+ge+V*Me,ie=p+ge+V*(Me+1),he=p+(ge+1)+V*(Me+1),le=p+(ge+1)+V*Me;c.push(_e,ie,le),c.push(ie,he,le),W+=6}o.addGroup(u,W,L),u+=W,p+=U}g("z","y","x",-1,-1,i,t,e,a,s,0),g("z","y","x",1,-1,i,t,-e,a,s,1),g("x","z","y",1,1,e,i,t,n,a,2),g("x","z","y",1,-1,e,i,-t,n,a,3),g("x","y","z",1,-1,e,t,i,n,s,4),g("x","y","z",-1,-1,e,t,-i,n,s,5),this.setIndex(c),this.setAttribute("position",new Ee(l,3)),this.setAttribute("normal",new Ee(h,3)),this.setAttribute("uv",new Ee(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}},Ks=class r extends et{constructor(e=1,t=1,i=4,n=8,s=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:i,radialSegments:n,heightSegments:s},t=Math.max(0,t),i=Math.max(1,Math.floor(i)),n=Math.max(3,Math.floor(n)),s=Math.max(1,Math.floor(s));let a=[],o=[],c=[],l=[],h=t/2,d=Math.PI/2*e,p=t,u=2*d+p,g=2*i+s,m=n+1,v=new w,f=new w;for(let _=0;_<=g;_++){let x=0,S=0,E=0,M=0;if(_<=i){let L=_/i,N=L*Math.PI/2;S=-h-e*Math.cos(N),E=e*Math.sin(N),M=-e*Math.cos(N),x=L*d}else if(_<=i+s){let L=(_-i)/s;S=L*t-h,E=e,M=0,x=d+L*p}else{let L=(_-i-s)/i,N=L*Math.PI/2;S=h+e*Math.sin(N),E=e*Math.cos(N),M=e*Math.sin(N),x=d+p+L*d}let P=Math.max(0,Math.min(1,x/u)),F=0;_===0?F=.5/n:_===g&&(F=-.5/n);for(let L=0;L<=n;L++){let N=L/n,H=N*Math.PI*2,B=Math.sin(H),Z=Math.cos(H);f.x=-E*Z,f.y=S,f.z=E*B,o.push(f.x,f.y,f.z),v.set(-E*Z,M,E*B),v.normalize(),c.push(v.x,v.y,v.z),l.push(N+F,P)}if(_>0){let L=(_-1)*m;for(let N=0;N<n;N++){let H=L+N,B=L+N+1,Z=_*m+N,X=_*m+N+1;a.push(H,B,Z),a.push(B,X,Z)}}}this.setIndex(a),this.setAttribute("position",new Ee(o,3)),this.setAttribute("normal",new Ee(c,3)),this.setAttribute("uv",new Ee(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}},$n=class r extends et{constructor(e=1,t=32,i=0,n=2*Math.PI){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:n},t=Math.max(3,t);let s=[],a=[],o=[],c=[],l=new w,h=new Q;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let d=0,p=3;d<=t;d++,p+=3){let u=i+d/t*n;l.x=e*Math.cos(u),l.y=e*Math.sin(u),a.push(l.x,l.y,l.z),o.push(0,0,1),h.x=(a[p]/e+1)/2,h.y=(a[p+1]/e+1)/2,c.push(h.x,h.y)}for(let d=1;d<=t;d++)s.push(d,d+1,0);this.setIndex(s),this.setAttribute("position",new Ee(a,3)),this.setAttribute("normal",new Ee(o,3)),this.setAttribute("uv",new Ee(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Di=class r extends et{constructor(e=1,t=1,i=1,n=32,s=1,a=!1,o=0,c=2*Math.PI){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:n,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:c};let l=this;n=Math.floor(n),s=Math.floor(s);let h=[],d=[],p=[],u=[],g=0,m=[],v=i/2,f=0;function _(x){let S=g,E=new Q,M=new w,P=0,F=x===!0?e:t,L=x===!0?1:-1;for(let H=1;H<=n;H++)d.push(0,v*L,0),p.push(0,L,0),u.push(.5,.5),g++;let N=g;for(let H=0;H<=n;H++){let B=H/n*c+o,Z=Math.cos(B),X=Math.sin(B);M.x=F*X,M.y=v*L,M.z=F*Z,d.push(M.x,M.y,M.z),p.push(0,L,0),E.x=.5*Z+.5,E.y=.5*X*L+.5,u.push(E.x,E.y),g++}for(let H=0;H<n;H++){let B=S+H,Z=N+H;x===!0?h.push(Z,Z+1,B):h.push(Z+1,Z,B),P+=3}l.addGroup(f,P,x===!0?1:2),f+=P}(function(){let x=new w,S=new w,E=0,M=(t-e)/i;for(let P=0;P<=s;P++){let F=[],L=P/s,N=L*(t-e)+e;for(let H=0;H<=n;H++){let B=H/n,Z=B*c+o,X=Math.sin(Z),V=Math.cos(Z);S.x=N*X,S.y=-L*i+v,S.z=N*V,d.push(S.x,S.y,S.z),x.set(X,M,V).normalize(),p.push(x.x,x.y,x.z),u.push(B,1-L),F.push(g++)}m.push(F)}for(let P=0;P<n;P++)for(let F=0;F<s;F++){let L=m[F][P],N=m[F+1][P],H=m[F+1][P+1],B=m[F][P+1];(e>0||F!==0)&&(h.push(L,N,B),E+=3),(t>0||F!==s-1)&&(h.push(N,H,B),E+=3)}l.addGroup(f,E,0),f+=E})(),a===!1&&(e>0&&_(!0),t>0&&_(!1)),this.setIndex(h),this.setAttribute("position",new Ee(d,3)),this.setAttribute("normal",new Ee(p,3)),this.setAttribute("uv",new Ee(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Qn=class r extends Di{constructor(e=1,t=1,i=32,n=1,s=!1,a=0,o=2*Math.PI){super(0,e,t,i,n,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:n,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new r(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Ji=class r extends et{constructor(e=[],t=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:n};let s=[],a=[];function o(u,g,m,v){let f=v+1,_=[];for(let x=0;x<=f;x++){_[x]=[];let S=u.clone().lerp(m,x/f),E=g.clone().lerp(m,x/f),M=f-x;for(let P=0;P<=M;P++)_[x][P]=P===0&&x===f?S:S.clone().lerp(E,P/M)}for(let x=0;x<f;x++)for(let S=0;S<2*(f-x)-1;S++){let E=Math.floor(S/2);S%2==0?(c(_[x][E+1]),c(_[x+1][E]),c(_[x][E])):(c(_[x][E+1]),c(_[x+1][E+1]),c(_[x+1][E]))}}function c(u){s.push(u.x,u.y,u.z)}function l(u,g){let m=3*u;g.x=e[m+0],g.y=e[m+1],g.z=e[m+2]}function h(u,g,m,v){v<0&&u.x===1&&(a[g]=u.x-1),m.x===0&&m.z===0&&(a[g]=v/2/Math.PI+.5)}function d(u){return Math.atan2(u.z,-u.x)}function p(u){return Math.atan2(-u.y,Math.sqrt(u.x*u.x+u.z*u.z))}(function(u){let g=new w,m=new w,v=new w;for(let f=0;f<t.length;f+=3)l(t[f+0],g),l(t[f+1],m),l(t[f+2],v),o(g,m,v,u)})(n),function(u){let g=new w;for(let m=0;m<s.length;m+=3)g.x=s[m+0],g.y=s[m+1],g.z=s[m+2],g.normalize().multiplyScalar(u),s[m+0]=g.x,s[m+1]=g.y,s[m+2]=g.z}(i),function(){let u=new w;for(let g=0;g<s.length;g+=3){u.x=s[g+0],u.y=s[g+1],u.z=s[g+2];let m=d(u)/2/Math.PI+.5,v=p(u)/Math.PI+.5;a.push(m,1-v)}(function(){let g=new w,m=new w,v=new w,f=new w,_=new Q,x=new Q,S=new Q;for(let E=0,M=0;E<s.length;E+=9,M+=6){g.set(s[E+0],s[E+1],s[E+2]),m.set(s[E+3],s[E+4],s[E+5]),v.set(s[E+6],s[E+7],s[E+8]),_.set(a[M+0],a[M+1]),x.set(a[M+2],a[M+3]),S.set(a[M+4],a[M+5]),f.copy(g).add(m).add(v).divideScalar(3);let P=d(f);h(_,M+0,g,P),h(x,M+2,m,P),h(S,M+4,v,P)}})(),function(){for(let g=0;g<a.length;g+=6){let m=a[g+0],v=a[g+2],f=a[g+4],_=Math.max(m,v,f),x=Math.min(m,v,f);_>.9&&x<.1&&(m<.2&&(a[g+0]+=1),v<.2&&(a[g+2]+=1),f<.2&&(a[g+4]+=1))}}()}(),this.setAttribute("position",new Ee(s,3)),this.setAttribute("normal",new Ee(s.slice(),3)),this.setAttribute("uv",new Ee(a,2)),n===0?this.computeVertexNormals():this.normalizeNormals()}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.vertices,e.indices,e.radius,e.detail)}},$s=class r extends Ji{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,n=1/i;super([-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-n,-i,0,-n,i,0,n,-i,0,n,i,-n,-i,0,-n,i,0,n,-i,0,n,i,0,-i,0,-n,i,0,-n,-i,0,n,i,0,n],[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},Rs=new w,Ps=new w,Do=new w,Is=new wi,Ki=class extends et{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let n=Math.pow(10,4),s=Math.cos(Wn*t),a=e.getIndex(),o=e.getAttribute("position"),c=a?a.count:o.count,l=[0,0,0],h=["a","b","c"],d=new Array(3),p={},u=[];for(let g=0;g<c;g+=3){a?(l[0]=a.getX(g),l[1]=a.getX(g+1),l[2]=a.getX(g+2)):(l[0]=g,l[1]=g+1,l[2]=g+2);let{a:m,b:v,c:f}=Is;if(m.fromBufferAttribute(o,l[0]),v.fromBufferAttribute(o,l[1]),f.fromBufferAttribute(o,l[2]),Is.getNormal(Do),d[0]=`${Math.round(m.x*n)},${Math.round(m.y*n)},${Math.round(m.z*n)}`,d[1]=`${Math.round(v.x*n)},${Math.round(v.y*n)},${Math.round(v.z*n)}`,d[2]=`${Math.round(f.x*n)},${Math.round(f.y*n)},${Math.round(f.z*n)}`,d[0]!==d[1]&&d[1]!==d[2]&&d[2]!==d[0])for(let _=0;_<3;_++){let x=(_+1)%3,S=d[_],E=d[x],M=Is[h[_]],P=Is[h[x]],F=`${S}_${E}`,L=`${E}_${S}`;L in p&&p[L]?(Do.dot(p[L].normal)<=s&&(u.push(M.x,M.y,M.z),u.push(P.x,P.y,P.z)),p[L]=null):F in p||(p[F]={index0:l[_],index1:l[x],normal:Do.clone()})}}for(let g in p)if(p[g]){let{index0:m,index1:v}=p[g];Rs.fromBufferAttribute(o,m),Ps.fromBufferAttribute(o,v),u.push(Rs.x,Rs.y,Rs.z),u.push(Ps.x,Ps.y,Ps.z)}this.setAttribute("position",new Ee(u,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},kt=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){be("Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,n=this.getPoint(0),s=0;t.push(0);for(let a=1;a<=e;a++)i=this.getPoint(a/e),s+=i.distanceTo(n),t.push(s),n=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),n=0,s=i.length,a;a=t||e*i[s-1];let o,c=0,l=s-1;for(;c<=l;)if(n=Math.floor(c+(l-c)/2),o=i[n]-a,o<0)c=n+1;else{if(!(o>0)){l=n;break}l=n-1}if(n=l,i[n]===a)return n/(s-1);let h=i[n];return(n+(a-h)/(i[n+1]-h))/(s-1)}getTangent(e,t){let n=e-1e-4,s=e+1e-4;n<0&&(n=0),s>1&&(s=1);let a=this.getPoint(n),o=this.getPoint(s),c=t||(a.isVector2?new Q:new w);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new w,n=[],s=[],a=[],o=new w,c=new Ne;for(let u=0;u<=e;u++){let g=u/e;n[u]=this.getTangentAt(g,new w)}s[0]=new w,a[0]=new w;let l=Number.MAX_VALUE,h=Math.abs(n[0].x),d=Math.abs(n[0].y),p=Math.abs(n[0].z);h<=l&&(l=h,i.set(1,0,0)),d<=l&&(l=d,i.set(0,1,0)),p<=l&&i.set(0,0,1),o.crossVectors(n[0],i).normalize(),s[0].crossVectors(n[0],o),a[0].crossVectors(n[0],s[0]);for(let u=1;u<=e;u++){if(s[u]=s[u-1].clone(),a[u]=a[u-1].clone(),o.crossVectors(n[u-1],n[u]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(Ue(n[u-1].dot(n[u]),-1,1));s[u].applyMatrix4(c.makeRotationAxis(o,g))}a[u].crossVectors(n[u],s[u])}if(t===!0){let u=Math.acos(Ue(s[0].dot(s[e]),-1,1));u/=e,n[0].dot(o.crossVectors(s[0],s[e]))>0&&(u=-u);for(let g=1;g<=e;g++)s[g].applyMatrix4(c.makeRotationAxis(n[g],u*g)),a[g].crossVectors(n[g],s[g])}return{tangents:n,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},er=class extends kt{constructor(e=0,t=0,i=1,n=1,s=0,a=2*Math.PI,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=n,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new Q){let i=t,n=2*Math.PI,s=this.aEndAngle-this.aStartAngle,a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=n;for(;s>n;)s-=n;s<Number.EPSILON&&(s=a?0:n),this.aClockwise!==!0||a||(s===n?s=-n:s-=n);let o=this.aStartAngle+e*s,c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),p=c-this.aX,u=l-this.aY;c=p*h-u*d+this.aX,l=p*d+u*h+this.aY}return i.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Qs=class extends er{constructor(e,t,i,n,s,a){super(e,t,i,i,n,s,a),this.isArcCurve=!0,this.type="ArcCurve"}};function sc(){let r=0,e=0,t=0,i=0;function n(s,a,o,c){r=s,e=o,t=-3*s+3*a-2*o-c,i=2*s-2*a+o+c}return{initCatmullRom:function(s,a,o,c,l){n(a,o,l*(o-s),l*(c-a))},initNonuniformCatmullRom:function(s,a,o,c,l,h,d){let p=(a-s)/l-(o-s)/(l+h)+(o-a)/h,u=(o-a)/h-(c-a)/(h+d)+(c-o)/d;p*=h,u*=h,n(a,o,p,u)},calc:function(s){let a=s*s;return r+e*s+t*a+i*(a*s)}}}var _h=new w,vh=new w,No=new sc,Uo=new sc,Oo=new sc,tr=class extends kt{constructor(e=[],t=!1,i="centripetal",n=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=n}getPoint(e,t=new w){let i=t,n=this.points,s=n.length,a=(s-(this.closed?0:1))*e,o,c,l=Math.floor(a),h=a-l;this.closed?l+=l>0?0:(Math.floor(Math.abs(l)/s)+1)*s:h===0&&l===s-1&&(l=s-2,h=1),this.closed||l>0?o=n[(l-1)%s]:(vh.subVectors(n[0],n[1]).add(n[0]),o=vh);let d=n[l%s],p=n[(l+1)%s];if(this.closed||l+2<s?c=n[(l+2)%s]:(_h.subVectors(n[s-1],n[s-2]).add(n[s-1]),c=_h),this.curveType==="centripetal"||this.curveType==="chordal"){let u=this.curveType==="chordal"?.5:.25,g=Math.pow(o.distanceToSquared(d),u),m=Math.pow(d.distanceToSquared(p),u),v=Math.pow(p.distanceToSquared(c),u);m<1e-4&&(m=1),g<1e-4&&(g=m),v<1e-4&&(v=m),No.initNonuniformCatmullRom(o.x,d.x,p.x,c.x,g,m,v),Uo.initNonuniformCatmullRom(o.y,d.y,p.y,c.y,g,m,v),Oo.initNonuniformCatmullRom(o.z,d.z,p.z,c.z,g,m,v)}else this.curveType==="catmullrom"&&(No.initCatmullRom(o.x,d.x,p.x,c.x,this.tension),Uo.initCatmullRom(o.y,d.y,p.y,c.y,this.tension),Oo.initCatmullRom(o.z,d.z,p.z,c.z,this.tension));return i.set(No.calc(h),Uo.calc(h),Oo.calc(h)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let n=e.points[t];this.points.push(new w().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function yh(r,e,t,i,n){let s=.5*(i-e),a=.5*(n-t),o=r*r;return(2*t-2*i+s+a)*(r*o)+(-3*t+3*i-2*s-a)*o+s*r+t}function Er(r,e,t,i){return function(n,s){let a=1-n;return a*a*s}(r,e)+function(n,s){return 2*(1-n)*n*s}(r,t)+function(n,s){return n*n*s}(r,i)}function wr(r,e,t,i,n){return function(s,a){let o=1-s;return o*o*o*a}(r,e)+function(s,a){let o=1-s;return 3*o*o*s*a}(r,t)+function(s,a){return 3*(1-s)*s*s*a}(r,i)+function(s,a){return s*s*s*a}(r,n)}var Fr=class extends kt{constructor(e=new Q,t=new Q,i=new Q,n=new Q){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=n}getPoint(e,t=new Q){let i=t,n=this.v0,s=this.v1,a=this.v2,o=this.v3;return i.set(wr(e,n.x,s.x,a.x,o.x),wr(e,n.y,s.y,a.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ea=class extends kt{constructor(e=new w,t=new w,i=new w,n=new w){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=n}getPoint(e,t=new w){let i=t,n=this.v0,s=this.v1,a=this.v2,o=this.v3;return i.set(wr(e,n.x,s.x,a.x,o.x),wr(e,n.y,s.y,a.y,o.y),wr(e,n.z,s.z,a.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Br=class extends kt{constructor(e=new Q,t=new Q){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Q){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Q){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ta=class extends kt{constructor(e=new w,t=new w){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new w){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new w){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},zr=class extends kt{constructor(e=new Q,t=new Q,i=new Q){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new Q){let i=t,n=this.v0,s=this.v1,a=this.v2;return i.set(Er(e,n.x,s.x,a.x),Er(e,n.y,s.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Gr=class extends kt{constructor(e=new w,t=new w,i=new w){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new w){let i=t,n=this.v0,s=this.v1,a=this.v2;return i.set(Er(e,n.x,s.x,a.x),Er(e,n.y,s.y,a.y),Er(e,n.z,s.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Vr=class extends kt{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Q){let i=t,n=this.points,s=(n.length-1)*e,a=Math.floor(s),o=s-a,c=n[a===0?a:a-1],l=n[a],h=n[a>n.length-2?n.length-1:a+1],d=n[a>n.length-3?n.length-1:a+2];return i.set(yh(o,c.x,l.x,h.x,d.x),yh(o,c.y,l.y,h.y,d.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let n=e.points[t];this.points.push(new Q().fromArray(n))}return this}},ia=Object.freeze({__proto__:null,ArcCurve:Qs,CatmullRomCurve3:tr,CubicBezierCurve:Fr,CubicBezierCurve3:ea,EllipseCurve:er,LineCurve:Br,LineCurve3:ta,QuadraticBezierCurve:zr,QuadraticBezierCurve3:Gr,SplineCurve:Vr}),na=class extends kt{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new ia[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),n=this.getCurveLengths(),s=0;for(;s<n.length;){if(n[s]>=i){let a=n[s]-i,o=this.curves[s],c=o.getLength(),l=c===0?0:1-a/c;return o.getPointAt(l,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,n=this.curves.length;i<n;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let n=0,s=this.curves;n<s.length;n++){let a=s[n],o=a.isEllipseCurve?2*e:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,c=a.getPoints(o);for(let l=0;l<c.length;l++){let h=c[l];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let n=e.curves[t];this.curves.push(new ia[n.type]().fromJSON(n))}return this}},Ni=class extends na{constructor(e){super(),this.type="Path",this.currentPoint=new Q,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new Br(this.currentPoint.clone(),new Q(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,n){let s=new zr(this.currentPoint.clone(),new Q(e,t),new Q(i,n));return this.curves.push(s),this.currentPoint.set(i,n),this}bezierCurveTo(e,t,i,n,s,a){let o=new Fr(this.currentPoint.clone(),new Q(e,t),new Q(i,n),new Q(s,a));return this.curves.push(o),this.currentPoint.set(s,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new Vr(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,n,s,a){let o=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+o,t+c,i,n,s,a),this}absarc(e,t,i,n,s,a){return this.absellipse(e,t,i,i,n,s,a),this}ellipse(e,t,i,n,s,a,o,c){let l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+l,t+h,i,n,s,a,o,c),this}absellipse(e,t,i,n,s,a,o,c){let l=new er(e,t,i,n,s,a,o,c);if(this.curves.length>0){let d=l.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(l);let h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Ui=class extends Ni{constructor(e){super(e),this.uuid=En(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,n=this.holes.length;i<n;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let n=e.holes[t];this.holes.push(new Ni().fromJSON(n))}return this}};function Cd(r,e,t=2){let i=e&&e.length,n=i?e[0]*t:r.length,s=xh(r,0,n,t,!0),a=[];if(!s||s.next===s.prev)return a;let o,c,l;if(i&&(s=function(h,d,p,u){let g=[];for(let m=0,v=d.length;m<v;m++){let f=xh(h,d[m]*u,m<v-1?d[m+1]*u:h.length,u,!1);f===f.next&&(f.steiner=!0),g.push(Od(f))}g.sort(Dd);for(let m=0;m<g.length;m++)p=Nd(g[m],p);return p}(r,e,s,t)),r.length>80*t){o=r[0],c=r[1];let h=o,d=c;for(let p=t;p<n;p+=t){let u=r[p],g=r[p+1];u<o&&(o=u),g<c&&(c=g),u>h&&(h=u),g>d&&(d=g)}l=Math.max(h-o,d-c),l=l!==0?32767/l:0}return kr(s,a,t,o,c,l,0),a}function xh(r,e,t,i,n){let s;if(n===function(a,o,c,l){let h=0;for(let d=o,p=c-l;d<c;d+=l)h+=(a[p]-a[d])*(a[d+1]+a[p+1]),p=d;return h}(r,e,t,i)>0)for(let a=e;a<t;a+=i)s=Mh(a/i|0,r[a],r[a+1],s);else for(let a=t-i;a>=e;a-=i)s=Mh(a/i|0,r[a],r[a+1],s);return s&&ir(s,s.next)&&(Wr(s),s=s.next),s}function vn(r,e){if(!r)return r;e||(e=r);let t,i=r;do if(t=!1,i.steiner||!ir(i,i.next)&&rt(i.prev,i,i.next)!==0)i=i.next;else{if(Wr(i),i=e=i.prev,i===i.next)break;t=!0}while(t||i!==e);return e}function kr(r,e,t,i,n,s,a){if(!r)return;!a&&s&&function(c,l,h,d){let p=c;do p.z===0&&(p.z=jo(p.x,p.y,l,h,d)),p.prevZ=p.prev,p.nextZ=p.next,p=p.next;while(p!==c);p.prevZ.nextZ=null,p.prevZ=null,function(u){let g,m=1;do{let v,f=u;u=null;let _=null;for(g=0;f;){g++;let x=f,S=0;for(let M=0;M<m&&(S++,x=x.nextZ,x);M++);let E=m;for(;S>0||E>0&&x;)S!==0&&(E===0||!x||f.z<=x.z)?(v=f,f=f.nextZ,S--):(v=x,x=x.nextZ,E--),_?_.nextZ=v:u=v,v.prevZ=_,_=v;f=x}_.nextZ=null,m*=2}while(g>1)}(p)}(r,i,n,s);let o=r;for(;r.prev!==r.next;){let c=r.prev,l=r.next;if(s?Pd(r,i,n,s):Rd(r))e.push(c.i,r.i,l.i),Wr(r),r=l.next,o=l.next;else if((r=l)===o){a?a===1?kr(r=Id(vn(r),e),e,t,i,n,s,2):a===2&&Ld(r,e,t,i,n,s):kr(vn(r),e,t,i,n,s,1);break}}}function Rd(r){let e=r.prev,t=r,i=r.next;if(rt(e,t,i)>=0)return!1;let n=e.x,s=t.x,a=i.x,o=e.y,c=t.y,l=i.y,h=Math.min(n,s,a),d=Math.min(o,c,l),p=Math.max(n,s,a),u=Math.max(o,c,l),g=i.next;for(;g!==e;){if(g.x>=h&&g.x<=p&&g.y>=d&&g.y<=u&&br(n,o,s,c,a,l,g.x,g.y)&&rt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Pd(r,e,t,i){let n=r.prev,s=r,a=r.next;if(rt(n,s,a)>=0)return!1;let o=n.x,c=s.x,l=a.x,h=n.y,d=s.y,p=a.y,u=Math.min(o,c,l),g=Math.min(h,d,p),m=Math.max(o,c,l),v=Math.max(h,d,p),f=jo(u,g,e,t,i),_=jo(m,v,e,t,i),x=r.prevZ,S=r.nextZ;for(;x&&x.z>=f&&S&&S.z<=_;){if(x.x>=u&&x.x<=m&&x.y>=g&&x.y<=v&&x!==n&&x!==a&&br(o,h,c,d,l,p,x.x,x.y)&&rt(x.prev,x,x.next)>=0||(x=x.prevZ,S.x>=u&&S.x<=m&&S.y>=g&&S.y<=v&&S!==n&&S!==a&&br(o,h,c,d,l,p,S.x,S.y)&&rt(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;x&&x.z>=f;){if(x.x>=u&&x.x<=m&&x.y>=g&&x.y<=v&&x!==n&&x!==a&&br(o,h,c,d,l,p,x.x,x.y)&&rt(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;S&&S.z<=_;){if(S.x>=u&&S.x<=m&&S.y>=g&&S.y<=v&&S!==n&&S!==a&&br(o,h,c,d,l,p,S.x,S.y)&&rt(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function Id(r,e){let t=r;do{let i=t.prev,n=t.next.next;!ir(i,n)&&xu(i,t,t.next,n)&&Hr(i,n)&&Hr(n,i)&&(e.push(i.i,t.i,n.i),Wr(t),Wr(t.next),t=r=n),t=t.next}while(t!==r);return vn(t)}function Ld(r,e,t,i,n,s){let a=r;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Fd(a,o)){let c=Mu(a,o);return a=vn(a,a.next),c=vn(c,c.next),kr(a,e,t,i,n,s,0),void kr(c,e,t,i,n,s,0)}o=o.next}a=a.next}while(a!==r)}function Dd(r,e){let t=r.x-e.x;return t===0&&(t=r.y-e.y,t===0)&&(t=(r.next.y-r.y)/(r.next.x-r.x)-(e.next.y-e.y)/(e.next.x-e.x)),t}function Nd(r,e){let t=function(n,s){let a=s,o=n.x,c=n.y,l,h=-1/0;if(ir(n,a))return a;do{if(ir(n,a.next))return a.next;if(c<=a.y&&c>=a.next.y&&a.next.y!==a.y){let m=a.x+(c-a.y)*(a.next.x-a.x)/(a.next.y-a.y);if(m<=o&&m>h&&(h=m,l=a.x<a.next.x?a:a.next,m===o))return l}a=a.next}while(a!==s);if(!l)return null;let d=l,p=l.x,u=l.y,g=1/0;a=l;do{if(o>=a.x&&a.x>=p&&o!==a.x&&yu(c<u?o:h,c,p,u,c<u?h:o,c,a.x,a.y)){let m=Math.abs(c-a.y)/(o-a.x);Hr(a,n)&&(m<g||m===g&&(a.x>l.x||a.x===l.x&&Ud(l,a)))&&(l=a,g=m)}a=a.next}while(a!==d);return l}(r,e);if(!t)return e;let i=Mu(t,r);return vn(i,i.next),vn(t,t.next)}function Ud(r,e){return rt(r.prev,r,e.prev)<0&&rt(e.next,r,r.next)<0}function jo(r,e,t,i,n){return(r=1431655765&((r=858993459&((r=252645135&((r=16711935&((r=(r-t)*n|0)|r<<8))|r<<4))|r<<2))|r<<1))|(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=(e-i)*n|0)|e<<8))|e<<4))|e<<2))|e<<1))<<1}function Od(r){let e=r,t=r;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==r);return t}function yu(r,e,t,i,n,s,a,o){return(n-a)*(e-o)>=(r-a)*(s-o)&&(r-a)*(i-o)>=(t-a)*(e-o)&&(t-a)*(s-o)>=(n-a)*(i-o)}function br(r,e,t,i,n,s,a,o){return!(r===a&&e===o)&&yu(r,e,t,i,n,s,a,o)}function Fd(r,e){return r.next.i!==e.i&&r.prev.i!==e.i&&!function(t,i){let n=t;do{if(n.i!==t.i&&n.next.i!==t.i&&n.i!==i.i&&n.next.i!==i.i&&xu(n,n.next,t,i))return!0;n=n.next}while(n!==t);return!1}(r,e)&&(Hr(r,e)&&Hr(e,r)&&function(t,i){let n=t,s=!1,a=(t.x+i.x)/2,o=(t.y+i.y)/2;do n.y>o!=n.next.y>o&&n.next.y!==n.y&&a<(n.next.x-n.x)*(o-n.y)/(n.next.y-n.y)+n.x&&(s=!s),n=n.next;while(n!==t);return s}(r,e)&&(rt(r.prev,r,e.prev)||rt(r,e.prev,e))||ir(r,e)&&rt(r.prev,r,r.next)>0&&rt(e.prev,e,e.next)>0)}function rt(r,e,t){return(e.y-r.y)*(t.x-e.x)-(e.x-r.x)*(t.y-e.y)}function ir(r,e){return r.x===e.x&&r.y===e.y}function xu(r,e,t,i){let n=Ds(rt(r,e,t)),s=Ds(rt(r,e,i)),a=Ds(rt(t,i,r)),o=Ds(rt(t,i,e));return n!==s&&a!==o||!(n!==0||!Ls(r,t,e))||!(s!==0||!Ls(r,i,e))||!(a!==0||!Ls(t,r,i))||!(o!==0||!Ls(t,e,i))}function Ls(r,e,t){return e.x<=Math.max(r.x,t.x)&&e.x>=Math.min(r.x,t.x)&&e.y<=Math.max(r.y,t.y)&&e.y>=Math.min(r.y,t.y)}function Ds(r){return r>0?1:r<0?-1:0}function Hr(r,e){return rt(r.prev,r,r.next)<0?rt(r,e,r.next)>=0&&rt(r,r.prev,e)>=0:rt(r,e,r.prev)<0||rt(r,r.next,e)<0}function Mu(r,e){let t=qo(r.i,r.x,r.y),i=qo(e.i,e.x,e.y),n=r.next,s=e.prev;return r.next=e,e.prev=r,t.next=n,n.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function Mh(r,e,t,i){let n=qo(r,e,t);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function Wr(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function qo(r,e,t){return{i:r,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}var Yo=class{static triangulate(e,t,i=2){return Cd(e,t,i)}},mi=class r{static area(e){let t=e.length,i=0;for(let n=t-1,s=0;s<t;n=s++)i+=e[n].x*e[s].y-e[s].x*e[n].y;return .5*i}static isClockWise(e){return r.area(e)<0}static triangulateShape(e,t){let i=[],n=[],s=[];Sh(e),bh(i,e);let a=e.length;t.forEach(Sh);for(let c=0;c<t.length;c++)n.push(a),a+=t[c].length,bh(i,t[c]);let o=Yo.triangulate(i,n);for(let c=0;c<o.length;c+=3)s.push(o.slice(c,c+3));return s}};function Sh(r){let e=r.length;e>2&&r[e-1].equals(r[0])&&r.pop()}function bh(r,e){for(let t=0;t<e.length;t++)r.push(e[t].x),r.push(e[t].y)}var nr=class r extends et{constructor(e=new Ui([new Q(.5,.5),new Q(-.5,.5),new Q(-.5,-.5),new Q(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,n=[],s=[];for(let o=0,c=e.length;o<c;o++)a(e[o]);function a(o){let c=[],l=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1,p=t.bevelEnabled===void 0||t.bevelEnabled,u=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:u-.1,m=t.bevelOffset!==void 0?t.bevelOffset:0,v=t.bevelSegments!==void 0?t.bevelSegments:3,f=t.extrudePath,_=t.UVGenerator!==void 0?t.UVGenerator:Bd,x,S,E,M,P,F=!1;if(f){x=f.getSpacedPoints(h),F=!0,p=!1;let C=!!f.isCatmullRomCurve3&&f.closed;S=f.computeFrenetFrames(h,C),E=new w,M=new w,P=new w}p||(v=0,u=0,g=0,m=0);let L=o.extractPoints(l),N=L.shape,H=L.holes;if(!mi.isClockWise(N)){N=N.reverse();for(let C=0,O=H.length;C<O;C++){let y=H[C];mi.isClockWise(y)&&(H[C]=y.reverse())}}function B(C){let O=10000000000000001e-36,y=C[0];for(let D=1;D<=C.length;D++){let I=D%C.length,A=C[I],k=A.x-y.x,j=A.y-y.y,J=k*k+j*j,se=Math.max(Math.abs(A.x),Math.abs(A.y),Math.abs(y.x),Math.abs(y.y));J<=O*se*se?(C.splice(I,1),D--):y=A}}B(N),H.forEach(B);let Z=H.length,X=N;for(let C=0;C<Z;C++){let O=H[C];N=N.concat(O)}function V(C,O,y){return O||Te("ExtrudeGeometry: vec does not exist"),C.clone().addScaledVector(O,y)}let q=N.length;function U(C,O,y){let D,I,A,k=C.x-O.x,j=C.y-O.y,J=y.x-C.x,se=y.y-C.y,ve=k*k+j*j,ye=k*se-j*J;if(Math.abs(ye)>Number.EPSILON){let ue=Math.sqrt(ve),Ae=Math.sqrt(J*J+se*se),te=O.x-j/ue,ae=O.y+k/ue,ne=((y.x-se/Ae-te)*se-(y.y+J/Ae-ae)*J)/(k*se-j*J);D=te+k*ne-C.x,I=ae+j*ne-C.y;let pe=D*D+I*I;if(pe<=2)return new Q(D,I);A=Math.sqrt(pe/2)}else{let ue=!1;k>Number.EPSILON?J>Number.EPSILON&&(ue=!0):k<-Number.EPSILON?J<-Number.EPSILON&&(ue=!0):Math.sign(j)===Math.sign(se)&&(ue=!0),ue?(D=-j,I=k,A=Math.sqrt(ve)):(D=k,I=j,A=Math.sqrt(ve/2))}return new Q(D/A,I/A)}let W=[];for(let C=0,O=X.length,y=O-1,D=C+1;C<O;C++,y++,D++)y===O&&(y=0),D===O&&(D=0),W[C]=U(X[C],X[y],X[D]);let re=[],Me,ge,_e=W.concat();for(let C=0,O=Z;C<O;C++){let y=H[C];Me=[];for(let D=0,I=y.length,A=I-1,k=D+1;D<I;D++,A++,k++)A===I&&(A=0),k===I&&(k=0),Me[D]=U(y[D],y[A],y[k]);re.push(Me),_e=_e.concat(Me)}if(v===0)ge=mi.triangulateShape(X,H);else{let C=[],O=[];for(let y=0;y<v;y++){let D=y/v,I=u*Math.cos(D*Math.PI/2),A=g*Math.sin(D*Math.PI/2)+m;for(let k=0,j=X.length;k<j;k++){let J=V(X[k],W[k],A);me(J.x,J.y,-I),D===0&&C.push(J)}for(let k=0,j=Z;k<j;k++){let J=H[k];Me=re[k];let se=[];for(let ve=0,ye=J.length;ve<ye;ve++){let ue=V(J[ve],Me[ve],A);me(ue.x,ue.y,-I),D===0&&se.push(ue)}D===0&&O.push(se)}}ge=mi.triangulateShape(C,O)}let ie=ge.length,he=g+m;for(let C=0;C<q;C++){let O=p?V(N[C],_e[C],he):N[C];F?(M.copy(S.normals[0]).multiplyScalar(O.x),E.copy(S.binormals[0]).multiplyScalar(O.y),P.copy(x[0]).add(M).add(E),me(P.x,P.y,P.z)):me(O.x,O.y,0)}for(let C=1;C<=h;C++)for(let O=0;O<q;O++){let y=p?V(N[O],_e[O],he):N[O];F?(M.copy(S.normals[C]).multiplyScalar(y.x),E.copy(S.binormals[C]).multiplyScalar(y.y),P.copy(x[C]).add(M).add(E),me(P.x,P.y,P.z)):me(y.x,y.y,d/h*C)}for(let C=v-1;C>=0;C--){let O=C/v,y=u*Math.cos(O*Math.PI/2),D=g*Math.sin(O*Math.PI/2)+m;for(let I=0,A=X.length;I<A;I++){let k=V(X[I],W[I],D);me(k.x,k.y,d+y)}for(let I=0,A=H.length;I<A;I++){let k=H[I];Me=re[I];for(let j=0,J=k.length;j<J;j++){let se=V(k[j],Me[j],D);F?me(se.x,se.y+x[h-1].y,x[h-1].x+y):me(se.x,se.y,d+y)}}}function le(C,O){let y=C.length;for(;--y>=0;){let D=y,I=y-1;I<0&&(I=C.length-1);for(let A=0,k=h+2*v;A<k;A++){let j=q*A,J=q*(A+1);ee(O+D+j,O+I+j,O+I+J,O+D+J)}}}function me(C,O,y){c.push(C),c.push(O),c.push(y)}function De(C,O,y){R(C),R(O),R(y);let D=n.length/3,I=_.generateTopUV(i,n,D-3,D-2,D-1);b(I[0]),b(I[1]),b(I[2])}function ee(C,O,y,D){R(C),R(O),R(D),R(O),R(y),R(D);let I=n.length/3,A=_.generateSideWallUV(i,n,I-6,I-3,I-2,I-1);b(A[0]),b(A[1]),b(A[3]),b(A[1]),b(A[2]),b(A[3])}function R(C){n.push(c[3*C+0]),n.push(c[3*C+1]),n.push(c[3*C+2])}function b(C){s.push(C.x),s.push(C.y)}(function(){let C=n.length/3;if(p){let O=0,y=q*O;for(let D=0;D<ie;D++){let I=ge[D];De(I[2]+y,I[1]+y,I[0]+y)}O=h+2*v,y=q*O;for(let D=0;D<ie;D++){let I=ge[D];De(I[0]+y,I[1]+y,I[2]+y)}}else{for(let O=0;O<ie;O++){let y=ge[O];De(y[2],y[1],y[0])}for(let O=0;O<ie;O++){let y=ge[O];De(y[0]+q*h,y[1]+q*h,y[2]+q*h)}}i.addGroup(C,n.length/3-C,0)})(),function(){let C=n.length/3,O=0;le(X,O),O+=X.length;for(let y=0,D=H.length;y<D;y++){let I=H[y];le(I,O),O+=I.length}i.addGroup(C,n.length/3-C,1)}()}this.setAttribute("position",new Ee(n,3)),this.setAttribute("uv",new Ee(s,2)),this.computeVertexNormals()}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return function(t,i,n){if(n.shapes=[],Array.isArray(t))for(let s=0,a=t.length;s<a;s++){let o=t[s];n.shapes.push(o.uuid)}else n.shapes.push(t.uuid);return n.options=Object.assign({},i),i.extrudePath!==void 0&&(n.options.extrudePath=i.extrudePath.toJSON()),n}(this.parameters.shapes,this.parameters.options,e)}static fromJSON(e,t){let i=[];for(let s=0,a=e.shapes.length;s<a;s++){let o=t[e.shapes[s]];i.push(o)}let n=e.options.extrudePath;return n!==void 0&&(e.options.extrudePath=new ia[n.type]().fromJSON(n)),new r(i,e.options)}},Bd={generateTopUV:function(r,e,t,i,n){let s=e[3*t],a=e[3*t+1],o=e[3*i],c=e[3*i+1],l=e[3*n],h=e[3*n+1];return[new Q(s,a),new Q(o,c),new Q(l,h)]},generateSideWallUV:function(r,e,t,i,n,s){let a=e[3*t],o=e[3*t+1],c=e[3*t+2],l=e[3*i],h=e[3*i+1],d=e[3*i+2],p=e[3*n],u=e[3*n+1],g=e[3*n+2],m=e[3*s],v=e[3*s+1],f=e[3*s+2];return Math.abs(o-h)<Math.abs(a-l)?[new Q(a,1-c),new Q(l,1-d),new Q(p,1-g),new Q(m,1-f)]:[new Q(o,1-c),new Q(h,1-d),new Q(u,1-g),new Q(v,1-f)]}},ra=class r extends Ji{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2;super([-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},sa=class r extends et{constructor(e=[new Q(0,-.5),new Q(.5,0),new Q(0,.5)],t=12,i=0,n=2*Math.PI){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:n},t=Math.floor(t),n=Ue(n,0,2*Math.PI);let s=[],a=[],o=[],c=[],l=[],h=1/t,d=new w,p=new Q,u=new w,g=new w,m=new w,v=0,f=0;for(let _=0;_<=e.length-1;_++)switch(_){case 0:v=e[_+1].x-e[_].x,f=e[_+1].y-e[_].y,u.x=1*f,u.y=-v,u.z=0*f,m.copy(u),u.normalize(),c.push(u.x,u.y,u.z);break;case e.length-1:c.push(m.x,m.y,m.z);break;default:v=e[_+1].x-e[_].x,f=e[_+1].y-e[_].y,u.x=1*f,u.y=-v,u.z=0*f,g.copy(u),u.x+=m.x,u.y+=m.y,u.z+=m.z,u.normalize(),c.push(u.x,u.y,u.z),m.copy(g)}for(let _=0;_<=t;_++){let x=i+_*h*n,S=Math.sin(x),E=Math.cos(x);for(let M=0;M<=e.length-1;M++){d.x=e[M].x*S,d.y=e[M].y,d.z=e[M].x*E,a.push(d.x,d.y,d.z),p.x=_/t,p.y=M/(e.length-1),o.push(p.x,p.y);let P=c[3*M+0]*S,F=c[3*M+1],L=c[3*M+0]*E;l.push(P,F,L)}}for(let _=0;_<t;_++)for(let x=0;x<e.length-1;x++){let S=x+_*e.length,E=S,M=S+e.length,P=S+e.length+1,F=S+1;s.push(E,M,F),s.push(P,F,M)}this.setIndex(s),this.setAttribute("position",new Ee(a,3)),this.setAttribute("uv",new Ee(o,2)),this.setAttribute("normal",new Ee(l,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.points,e.segments,e.phiStart,e.phiLength)}},aa=class r extends Ji{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},Oi=class r extends et{constructor(e=1,t=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:n};let s=e/2,a=t/2,o=Math.floor(i),c=Math.floor(n),l=o+1,h=c+1,d=e/o,p=t/c,u=[],g=[],m=[],v=[];for(let f=0;f<h;f++){let _=f*p-a;for(let x=0;x<l;x++){let S=x*d-s;g.push(S,-_,0),m.push(0,0,1),v.push(x/o),v.push(1-f/c)}}for(let f=0;f<c;f++)for(let _=0;_<o;_++){let x=_+l*f,S=_+l*(f+1),E=_+1+l*(f+1),M=_+1+l*f;u.push(x,S,M),u.push(S,E,M)}this.setIndex(u),this.setAttribute("position",new Ee(g,3)),this.setAttribute("normal",new Ee(m,3)),this.setAttribute("uv",new Ee(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.width,e.height,e.widthSegments,e.heightSegments)}},oa=class r extends et{constructor(e=.5,t=1,i=32,n=1,s=0,a=2*Math.PI){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:n,thetaStart:s,thetaLength:a},i=Math.max(3,i);let o=[],c=[],l=[],h=[],d=e,p=(t-e)/(n=Math.max(1,n)),u=new w,g=new Q;for(let m=0;m<=n;m++){for(let v=0;v<=i;v++){let f=s+v/i*a;u.x=d*Math.cos(f),u.y=d*Math.sin(f),c.push(u.x,u.y,u.z),l.push(0,0,1),g.x=(u.x/t+1)/2,g.y=(u.y/t+1)/2,h.push(g.x,g.y)}d+=p}for(let m=0;m<n;m++){let v=m*(i+1);for(let f=0;f<i;f++){let _=f+v,x=_,S=_+i+1,E=_+i+2,M=_+1;o.push(x,S,M),o.push(S,E,M)}}this.setIndex(o),this.setAttribute("position",new Ee(c,3)),this.setAttribute("normal",new Ee(l,3)),this.setAttribute("uv",new Ee(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},$i=class r extends et{constructor(e=new Ui([new Q(0,.5),new Q(-.5,-.5),new Q(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],n=[],s=[],a=[],o=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let h=0;h<e.length;h++)l(e[h]),this.addGroup(o,c,h),o+=c,c=0;function l(h){let d=n.length/3,p=h.extractPoints(t),u=p.shape,g=p.holes;mi.isClockWise(u)===!1&&(u=u.reverse());for(let v=0,f=g.length;v<f;v++){let _=g[v];mi.isClockWise(_)===!0&&(g[v]=_.reverse())}let m=mi.triangulateShape(u,g);for(let v=0,f=g.length;v<f;v++){let _=g[v];u=u.concat(_)}for(let v=0,f=u.length;v<f;v++){let _=u[v];n.push(_.x,_.y,0),s.push(0,0,1),a.push(_.x,_.y)}for(let v=0,f=m.length;v<f;v++){let _=m[v],x=_[0]+d,S=_[1]+d,E=_[2]+d;i.push(x,S,E),c+=3}}this.setIndex(i),this.setAttribute("position",new Ee(n,3)),this.setAttribute("normal",new Ee(s,3)),this.setAttribute("uv",new Ee(a,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return function(t,i){if(i.shapes=[],Array.isArray(t))for(let n=0,s=t.length;n<s;n++){let a=t[n];i.shapes.push(a.uuid)}else i.shapes.push(t.uuid);return i}(this.parameters.shapes,e)}static fromJSON(e,t){let i=[];for(let n=0,s=e.shapes.length;n<s;n++){let a=t[e.shapes[n]];i.push(a)}return new r(i,e.curveSegments)}},la=class r extends et{constructor(e=1,t=32,i=16,n=0,s=2*Math.PI,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:n,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let c=Math.min(a+o,Math.PI),l=0,h=[],d=new w,p=new w,u=[],g=[],m=[],v=[];for(let f=0;f<=i;f++){let _=[],x=f/i,S=a+x*o,E=e*Math.cos(S),M=Math.sqrt(e*e-E*E),P=0;f===0&&a===0?P=.5/t:f===i&&c===Math.PI&&(P=-.5/t);for(let F=0;F<=t;F++){let L=F/t,N=n+L*s;d.x=-M*Math.cos(N),d.y=E,d.z=M*Math.sin(N),g.push(d.x,d.y,d.z),p.copy(d).normalize(),m.push(p.x,p.y,p.z),v.push(L+P,1-x),_.push(l++)}h.push(_)}for(let f=0;f<i;f++)for(let _=0;_<t;_++){let x=h[f][_+1],S=h[f][_],E=h[f+1][_],M=h[f+1][_+1];(f!==0||a>0)&&u.push(x,S,M),(f!==i-1||c<Math.PI)&&u.push(S,E,M)}this.setIndex(u),this.setAttribute("position",new Ee(g,3)),this.setAttribute("normal",new Ee(m,3)),this.setAttribute("uv",new Ee(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}},ca=class r extends Ji{constructor(e=1,t=0){super([1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],[2,1,0,0,3,2,1,3,0,2,3,1],e,t),this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},yn=class r extends et{constructor(e=1,t=.4,i=12,n=48,s=2*Math.PI,a=0,o=2*Math.PI){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:n,arc:s,thetaStart:a,thetaLength:o},i=Math.floor(i),n=Math.floor(n);let c=[],l=[],h=[],d=[],p=new w,u=new w,g=new w;for(let m=0;m<=i;m++){let v=a+m/i*o;for(let f=0;f<=n;f++){let _=f/n*s;u.x=(e+t*Math.cos(v))*Math.cos(_),u.y=(e+t*Math.cos(v))*Math.sin(_),u.z=t*Math.sin(v),l.push(u.x,u.y,u.z),p.x=e*Math.cos(_),p.y=e*Math.sin(_),g.subVectors(u,p).normalize(),h.push(g.x,g.y,g.z),d.push(f/n),d.push(m/i)}}for(let m=1;m<=i;m++)for(let v=1;v<=n;v++){let f=(n+1)*m+v-1,_=(n+1)*(m-1)+v-1,x=(n+1)*(m-1)+v,S=(n+1)*m+v;c.push(f,_,S),c.push(_,x,S)}this.setIndex(c),this.setAttribute("position",new Ee(l,3)),this.setAttribute("normal",new Ee(h,3)),this.setAttribute("uv",new Ee(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}},ha=class r extends et{constructor(e=1,t=.4,i=64,n=8,s=2,a=3){super(),this.type="TorusKnotGeometry",this.parameters={radius:e,tube:t,tubularSegments:i,radialSegments:n,p:s,q:a},i=Math.floor(i),n=Math.floor(n);let o=[],c=[],l=[],h=[],d=new w,p=new w,u=new w,g=new w,m=new w,v=new w,f=new w;for(let x=0;x<=i;++x){let S=x/i*s*Math.PI*2;_(S,s,a,e,u),_(S+.01,s,a,e,g),v.subVectors(g,u),f.addVectors(g,u),m.crossVectors(v,f),f.crossVectors(m,v),m.normalize(),f.normalize();for(let E=0;E<=n;++E){let M=E/n*Math.PI*2,P=-t*Math.cos(M),F=t*Math.sin(M);d.x=u.x+(P*f.x+F*m.x),d.y=u.y+(P*f.y+F*m.y),d.z=u.z+(P*f.z+F*m.z),c.push(d.x,d.y,d.z),p.subVectors(d,u).normalize(),l.push(p.x,p.y,p.z),h.push(x/i),h.push(E/n)}}for(let x=1;x<=i;x++)for(let S=1;S<=n;S++){let E=(n+1)*(x-1)+(S-1),M=(n+1)*x+(S-1),P=(n+1)*x+S,F=(n+1)*(x-1)+S;o.push(E,M,F),o.push(M,P,F)}function _(x,S,E,M,P){let F=Math.cos(x),L=Math.sin(x),N=E/S*x,H=Math.cos(N);P.x=M*(2+H)*.5*F,P.y=M*(2+H)*L*.5,P.z=M*Math.sin(N)*.5}this.setIndex(o),this.setAttribute("position",new Ee(c,3)),this.setAttribute("normal",new Ee(l,3)),this.setAttribute("uv",new Ee(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.tube,e.tubularSegments,e.radialSegments,e.p,e.q)}},rr=class r extends et{constructor(e=new Gr(new w(-1,-1,0),new w(-1,1,0),new w(1,1,0)),t=64,i=1,n=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:n,closed:s};let a=e.computeFrenetFrames(t,s);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new w,c=new w,l=new Q,h=new w,d=[],p=[],u=[],g=[];function m(v){h=e.getPointAt(v/t,h);let f=a.normals[v],_=a.binormals[v];for(let x=0;x<=n;x++){let S=x/n*Math.PI*2,E=Math.sin(S),M=-Math.cos(S);c.x=M*f.x+E*_.x,c.y=M*f.y+E*_.y,c.z=M*f.z+E*_.z,c.normalize(),p.push(c.x,c.y,c.z),o.x=h.x+i*c.x,o.y=h.y+i*c.y,o.z=h.z+i*c.z,d.push(o.x,o.y,o.z)}}(function(){for(let v=0;v<t;v++)m(v);m(s===!1?t:0),function(){for(let v=0;v<=t;v++)for(let f=0;f<=n;f++)l.x=v/t,l.y=f/n,u.push(l.x,l.y)}(),function(){for(let v=1;v<=t;v++)for(let f=1;f<=n;f++){let _=(n+1)*(v-1)+(f-1),x=(n+1)*v+(f-1),S=(n+1)*v+f,E=(n+1)*(v-1)+f;g.push(_,x,E),g.push(x,S,E)}}()})(),this.setIndex(g),this.setAttribute("position",new Ee(d,3)),this.setAttribute("normal",new Ee(p,3)),this.setAttribute("uv",new Ee(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new r(new ia[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}},ua=class extends et{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],i=new Set,n=new w,s=new w;if(e.index!==null){let a=e.attributes.position,o=e.index,c=e.groups;c.length===0&&(c=[{start:0,count:o.count,materialIndex:0}]);for(let l=0,h=c.length;l<h;++l){let d=c[l],p=d.start;for(let u=p,g=p+d.count;u<g;u+=3)for(let m=0;m<3;m++){let v=o.getX(u+m),f=o.getX(u+(m+1)%3);n.fromBufferAttribute(a,v),s.fromBufferAttribute(a,f),Th(n,s,i)===!0&&(t.push(n.x,n.y,n.z),t.push(s.x,s.y,s.z))}}}else{let a=e.attributes.position;for(let o=0,c=a.count/3;o<c;o++)for(let l=0;l<3;l++){let h=3*o+l,d=3*o+(l+1)%3;n.fromBufferAttribute(a,h),s.fromBufferAttribute(a,d),Th(n,s,i)===!0&&(t.push(n.x,n.y,n.z),t.push(s.x,s.y,s.z))}}this.setAttribute("position",new Ee(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function Th(r,e,t){let i=`${r.x},${r.y},${r.z}-${e.x},${e.y},${e.z}`,n=`${e.x},${e.y},${e.z}-${r.x},${r.y},${r.z}`;return t.has(i)!==!0&&t.has(n)!==!0&&(t.add(i),t.add(n),!0)}var rg=Object.freeze({__proto__:null,BoxGeometry:St,CapsuleGeometry:Ks,CircleGeometry:$n,ConeGeometry:Qn,CylinderGeometry:Di,DodecahedronGeometry:$s,EdgesGeometry:Ki,ExtrudeGeometry:nr,IcosahedronGeometry:ra,LatheGeometry:sa,OctahedronGeometry:aa,PlaneGeometry:Oi,PolyhedronGeometry:Ji,RingGeometry:oa,ShapeGeometry:$i,SphereGeometry:la,TetrahedronGeometry:ca,TorusGeometry:yn,TorusKnotGeometry:ha,TubeGeometry:rr,WireframeGeometry:ua});function wn(r){let e={};for(let t in r){e[t]={};for(let i in r[t]){let n=r[t][i];if(Eh(n))n.isRenderTargetTexture?(be("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=n.clone();else if(Array.isArray(n))if(Eh(n[0])){let s=[];for(let a=0,o=n.length;a<o;a++)s[a]=n[a].clone();e[t][i]=s}else e[t][i]=n.slice();else e[t][i]=n}}return e}function At(r){let e={};for(let t=0;t<r.length;t++){let i=wn(r[t]);for(let n in i)e[n]=i[n]}return e}function Eh(r){return r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)}function ac(r){let e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ve.workingColorSpace}var Su={clone:wn,merge:At},Ht=class extends Pi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,this.fragmentShader=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=wn(e.uniforms),this.uniformsGroups=function(t){let i=[];for(let n=0;n<t.length;n++)i.push(t[n].clone());return i}(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let s=this.uniforms[n].value;s&&s.isTexture?t.uniforms[n]={type:"t",value:s.toJSON(e).uuid}:s&&s.isColor?t.uniforms[n]={type:"c",value:s.getHex()}:s&&s.isVector2?t.uniforms[n]={type:"v2",value:s.toArray()}:s&&s.isVector3?t.uniforms[n]={type:"v3",value:s.toArray()}:s&&s.isVector4?t.uniforms[n]={type:"v4",value:s.toArray()}:s&&s.isMatrix3?t.uniforms[n]={type:"m3",value:s.toArray()}:s&&s.isMatrix4?t.uniforms[n]={type:"m4",value:s.toArray()}:t.uniforms[n]={value:s}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let n=e.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=t[n.value]||null;break;case"c":this.uniforms[i].value=new Oe().setHex(n.value);break;case"v2":this.uniforms[i].value=new Q().fromArray(n.value);break;case"v3":this.uniforms[i].value=new w().fromArray(n.value);break;case"v4":this.uniforms[i].value=new Ze().fromArray(n.value);break;case"m3":this.uniforms[i].value=new Ie().fromArray(n.value);break;case"m4":this.uniforms[i].value=new Ne().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},da=class extends Ht{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Fi=class extends Pi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Oe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Oe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ri,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var pa=class extends Pi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ma=class extends Pi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ns(r,e){return r&&r.constructor!==e?typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r):r}var Qi=class{constructor(e,t,i,n){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,n=t[i],s=t[i-1];i:{e:{let a;t:{n:if(!(e<n)){for(let o=i+2;;){if(n===void 0){if(e<s)break n;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(s=n,n=t[++i],e<n)break e}a=t.length;break t}if(!(e>=s)){let o=t[1];e<o&&(i=2,s=o);for(let c=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(n=s,s=t[--i-1],e>=s)break e}a=i,i=0;break t}break i}for(;i<a;){let o=i+a>>>1;e<t[o]?a=o:i=o+1}if(n=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,n)}return this.interpolate_(i,s,e,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,n=this.valueSize,s=e*n;for(let a=0;a!==n;++a)t[a]=i[s+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},fa=class extends Qi{constructor(e,t,i,n){super(e,t,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Go,endingEnd:Go}}intervalChanged_(e,t,i){let n=this.parameterPositions,s=e-2,a=e+1,o=n[s],c=n[a];if(o===void 0)switch(this.getSettings_().endingStart){case Vo:s=e,o=2*t-i;break;case ko:s=n.length-2,o=t+n[s]-n[s+1];break;default:s=e,o=i}if(c===void 0)switch(this.getSettings_().endingEnd){case Vo:a=e,c=2*i-t;break;case ko:a=1,c=i+n[1]-n[0];break;default:a=e-1,c=t}let l=.5*(i-t),h=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-i),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(e,t,i,n){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this._offsetPrev,d=this._offsetNext,p=this._weightPrev,u=this._weightNext,g=(i-t)/(n-t),m=g*g,v=m*g,f=-p*v+2*p*m-p*g,_=(1+p)*v+(-1.5-2*p)*m+(-.5+p)*g+1,x=(-1-u)*v+(1.5+u)*m+.5*g,S=u*v-u*m;for(let E=0;E!==o;++E)s[E]=f*a[h+E]+_*a[l+E]+x*a[c+E]+S*a[d+E];return s}},ga=class extends Qi{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=(i-t)/(n-t),d=1-h;for(let p=0;p!==o;++p)s[p]=a[l+p]*d+a[c+p]*h;return s}},_a=class extends Qi{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e){return this.copySampleValue_(e-1)}},va=class extends Qi{interpolate_(e,t,i,n){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let g=(i-t)/(n-t),m=1-g;for(let v=0;v!==o;++v)s[v]=a[l+v]*m+a[c+v]*g;return s}let p=2*o,u=e-1;for(let g=0;g!==o;++g){let m=a[l+g],v=a[c+g],f=u*p+2*g,_=d[f],x=d[f+1],S=e*p+2*g,E=h[S],M=h[S+1],P,F,L,N,H,B=(i-t)/(n-t);for(let Z=0;Z<8;Z++){P=B*B,F=P*B,L=1-B,N=L*L,H=N*L;let X=H*t+3*N*B*_+3*L*P*E+F*n-i;if(Math.abs(X)<1e-10)break;let V=3*N*(_-t)+6*L*B*(E-_)+3*P*(n-E);if(Math.abs(V)<1e-10)break;B-=X/V,B=Math.max(0,Math.min(1,B))}s[g]=H*m+3*N*B*x+3*L*P*M+F*v}return s}},zt=class{constructor(e,t,i,n){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ns(t,this.TimeBufferType),this.values=Ns(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Ns(e.times,Array),values:Ns(e.values,Array)};let n=e.getInterpolation();n!==e.DefaultInterpolation&&(i.interpolation=n)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new _a(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ga(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new fa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new va(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Ar:t=this.InterpolantFactoryMethodDiscrete;break;case Vs:t=this.InterpolantFactoryMethodLinear;break;case Fs:t=this.InterpolantFactoryMethodSmooth;break;case zo:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0){if(e===this.DefaultInterpolation)throw new Error(i);this.setInterpolation(this.DefaultInterpolation)}return be("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ar;case this.InterpolantFactoryMethodLinear:return Vs;case this.InterpolantFactoryMethodSmooth:return Fs;case this.InterpolantFactoryMethodBezier:return zo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]*=e}return this}trim(e,t){let i=this.times,n=i.length,s=0,a=n-1;for(;s!==n&&i[s]<e;)++s;for(;a!==-1&&i[a]>t;)--a;if(++a,s!==0||a!==n){s>=a&&(a=Math.max(a,1),s=a-1);let o=this.getValueSize();this.times=i.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Te("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,n=this.values,s=i.length;s===0&&(Te("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){let c=i[o];if(typeof c=="number"&&isNaN(c)){Te("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){Te("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(n!==void 0&&cd(n))for(let o=0,c=n.length;o!==c;++o){let l=n[o];if(isNaN(l)){Te("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===Fs,s=e.length-1,a=1;for(let o=1;o<s;++o){let c=!1,l=e[o];if(l!==e[o+1]&&(o!==1||l!==e[0]))if(n)c=!0;else{let h=o*i,d=h-i,p=h+i;for(let u=0;u!==i;++u){let g=t[h+u];if(g!==t[d+u]||g!==t[p+u]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let h=o*i,d=a*i;for(let p=0;p!==i;++p)t[d+p]=t[h+p]}++a}}if(s>0){e[a]=e[s];for(let o=s*i,c=a*i,l=0;l!==i;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=new this.constructor(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}};zt.prototype.ValueTypeName="",zt.prototype.TimeBufferType=Float32Array,zt.prototype.ValueBufferType=Float32Array,zt.prototype.DefaultInterpolation=Vs;var qi=class extends zt{constructor(e,t,i){super(e,t,i)}};qi.prototype.ValueTypeName="bool",qi.prototype.ValueBufferType=Array,qi.prototype.DefaultInterpolation=Ar,qi.prototype.InterpolantFactoryMethodLinear=void 0,qi.prototype.InterpolantFactoryMethodSmooth=void 0;var ya=class extends zt{constructor(e,t,i,n){super(e,t,i,n)}};ya.prototype.ValueTypeName="color";var xa=class extends zt{constructor(e,t,i,n){super(e,t,i,n)}};xa.prototype.ValueTypeName="number";var Ma=class extends Qi{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(i-t)/(n-t),l=e*o;for(let h=l+o;l!==h;l+=4)Lt.slerpFlat(s,0,a,l-o,a,l,c);return s}},Xr=class extends zt{constructor(e,t,i,n){super(e,t,i,n)}InterpolantFactoryMethodLinear(e){return new Ma(this.times,this.values,this.getValueSize(),e)}};Xr.prototype.ValueTypeName="quaternion",Xr.prototype.InterpolantFactoryMethodSmooth=void 0;var Yi=class extends zt{constructor(e,t,i){super(e,t,i)}};Yi.prototype.ValueTypeName="string",Yi.prototype.ValueBufferType=Array,Yi.prototype.DefaultInterpolation=Ar,Yi.prototype.InterpolantFactoryMethodLinear=void 0,Yi.prototype.InterpolantFactoryMethodSmooth=void 0;var Sa=class extends zt{constructor(e,t,i,n){super(e,t,i,n)}};Sa.prototype.ValueTypeName="vector";var ba=class{constructor(e,t,i){let n=this,s,a=!1,o=0,c=0,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){c++,a===!1&&n.onStart!==void 0&&n.onStart(h,o,c),a=!0},this.itemEnd=function(h){o++,n.onProgress!==void 0&&n.onProgress(h,o,c),o===c&&(a=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),s?s(h):h},this.setURLModifier=function(h){return s=h,this},this.addHandler=function(h,d){return l.push(h,d),this},this.removeHandler=function(h){let d=l.indexOf(h);return d!==-1&&l.splice(d,2),this},this.getHandler=function(h){for(let d=0,p=l.length;d<p;d+=2){let u=l[d],g=l[d+1];if(u.global&&(u.lastIndex=0),u.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},bu=new ba,Ta=class{constructor(e){this.manager=e!==void 0?e:bu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(n,s){i.load(e,n,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Ta.DEFAULT_MATERIAL_NAME="__DEFAULT";var jr=class extends Mt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Oe(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},qr=class extends jr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Mt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Oe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Fo=new Ne,wh=new w,Ah=new w,Zo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Q(512,512),this.mapType=Wt,this.map=null,this.mapPass=null,this.matrix=new Ne,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ii,this._frameExtents=new Q(1,1),this._viewportCount=1,this._viewports=[new Ze(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;wh.setFromMatrixPosition(e.matrixWorld),t.position.copy(wh),Ah.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ah),t.updateMatrixWorld(),Fo.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Fo,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===jn||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Fo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),this.mapSize.x===512&&this.mapSize.y===512||(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Us=new w,Os=new Lt,pi=new w,sr=class extends Mt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ne,this.projectionMatrix=new Ne,this.projectionMatrixInverse=new Ne,this.coordinateSystem=Ci,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Us,Os,pi),pi.x===1&&pi.y===1&&pi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Us,Os,pi.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(Us,Os,pi),pi.x===1&&pi.y===1&&pi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Us,Os,pi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ji=new w,Ch=new Q,Rh=new Q,Et=class extends sr{constructor(e=50,t=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=2*Yn*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(.5*Wn*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return 2*Yn*Math.atan(Math.tan(.5*Wn*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){ji.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ji.x,ji.y).multiplyScalar(-e/ji.z),ji.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(ji.x,ji.y).multiplyScalar(-e/ji.z)}getViewSize(e,t){return this.getViewBounds(e,Ch,Rh),t.subVectors(Rh,Ch)}setViewOffset(e,t,i,n,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(.5*Wn*this.fov)/this.zoom,i=2*t,n=this.aspect*i,s=-.5*n,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;s+=a.offsetX*n/c,t-=a.offsetY*i/l,n*=a.width/c,i*=a.height/l}let o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+n,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var ar=class extends sr{constructor(e=-1,t=1,i=1,n=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=n,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,n,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,s=i-e,a=i+e,o=n+t,c=n-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,a=s+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Jo=class extends Zo{constructor(){super(new ar(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},or=class extends jr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Mt.DEFAULT_UP),this.updateMatrix(),this.target=new Mt,this.shadow=new Jo}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var sg=new Ne,ag=new Ne,og=new Ne;var kn=-90,Ea=class extends Mt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new Et(kn,1,e,t);n.layers=this.layers,this.add(n);let s=new Et(kn,1,e,t);s.layers=this.layers,this.add(s);let a=new Et(kn,1,e,t);a.layers=this.layers,this.add(a);let o=new Et(kn,1,e,t);o.layers=this.layers,this.add(o);let c=new Et(kn,1,e,t);c.layers=this.layers,this.add(c);let l=new Et(kn,1,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,n,s,a,o,c]=t;for(let l of t)this.remove(l);if(e===Ci)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else{if(e!==jn)throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1)}for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,a,o,c,l,h]=this.children,d=e.getRenderTarget(),p=e.getActiveCubeFace(),u=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let m=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let v=!1;v=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(i,0,n),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(i,1,n),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,n),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,n),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,n),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.generateMipmaps=m,e.setRenderTarget(i,5,n),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,p,u),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},wa=class extends Et{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var lg=new w,cg=new Lt,hg=new w,ug=new w,dg=new w;var pg=new w,mg=new Lt,fg=new w,gg=new w;var oc="\\[\\]\\.:\\/",zd=new RegExp("["+oc+"]","g"),Bo="[^"+oc+"]",Gd="[^"+oc.replace("\\.","")+"]",Vd=new RegExp("^"+/((?:WC+[\/:])*)/.source.replace("WC",Bo)+/(WCOD+)?/.source.replace("WCOD",Gd)+/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Bo)+/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Bo)+"$"),kd=["material","materials","bones","map"],Qe=class r{constructor(e,t,i){this.path=t,this.parsedPath=i||r.parseTrackName(t),this.node=r.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new r.Composite(e,t,i):new r(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(zd,"")}static parseTrackName(e){let t=Vd.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let s=i.nodeName.substring(n+1);kd.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(s){for(let a=0;a<s.length;a++){let o=s[a];if(o.name===t||o.uuid===t)return o;let c=i(o.children);if(c)return c}return null},n=i(e.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)e[t++]=i[n]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,n=t.propertyName,s=t.propertyIndex;if(e||(e=r.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e)return void be("PropertyBinding: No target node found for track: "+this.path+".");if(i){let l=t.objectIndex;switch(i){case"materials":if(!e.material)return void Te("PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.materials)return void Te("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);e=e.material.materials;break;case"bones":if(!e.skeleton)return void Te("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material)return void Te("PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.map)return void Te("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);e=e.material.map;break;default:if(e[i]===void 0)return void Te("PropertyBinding: Can not bind to objectName of node undefined.",this);e=e[i]}if(l!==void 0){if(e[l]===void 0)return void Te("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);e=e[l]}}let a=e[n];if(a===void 0)return void Te("PropertyBinding: Trying to update property for track: "+t.nodeName+"."+n+" but it wasn't found.",e);let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(n==="morphTargetInfluences"){if(!e.geometry)return void Te("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);if(!e.geometry.morphAttributes)return void Te("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=n;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Qe.Composite=class{constructor(r,e,t){let i=t||Qe.parseTrackName(e);this._targetGroup=r,this._bindings=r.subscribe_(e,i)}getValue(r,e){this.bind();let t=this._targetGroup.nCachedObjects_,i=this._bindings[t];i!==void 0&&i.getValue(r,e)}setValue(r,e){let t=this._bindings;for(let i=this._targetGroup.nCachedObjects_,n=t.length;i!==n;++i)t[i].setValue(r,e)}bind(){let r=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=r.length;e!==t;++e)r[e].bind()}unbind(){let r=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=r.length;e!==t;++e)r[e].unbind()}},Qe.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Qe.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Qe.prototype.GetterByBindingType=[Qe.prototype._getValue_direct,Qe.prototype._getValue_array,Qe.prototype._getValue_arrayElement,Qe.prototype._getValue_toArray],Qe.prototype.SetterByBindingTypeAndVersioning=[[Qe.prototype._setValue_direct,Qe.prototype._setValue_direct_setNeedsUpdate,Qe.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Qe.prototype._setValue_array,Qe.prototype._setValue_array_setNeedsUpdate,Qe.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Qe.prototype._setValue_arrayElement,Qe.prototype._setValue_arrayElement_setNeedsUpdate,Qe.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Qe.prototype._setValue_fromArray,Qe.prototype._setValue_fromArray_setNeedsUpdate,Qe.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var _g=new Float32Array(1);var Ph=new Ne,Yr=class{constructor(e,t,i=0,n=1/0){this.ray=new fi(e,t),this.near=i,this.far=n,this.camera=null,this.layers=new Jn,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Te("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Ph.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Ph),this}intersectObject(e,t=!0,i=[]){return Ko(e,this,i,t),i.sort(Ih),i}intersectObjects(e,t=!0,i=[]){for(let n=0,s=e.length;n<s;n++)Ko(e[n],this,i,t);return i.sort(Ih),i}};function Ih(r,e){return r.distance-e.distance}function Ko(r,e,t,i){let n=!0;if(r.layers.test(e.layers)&&r.raycast(e,t)===!1&&(n=!1),n===!0&&i===!0){let s=r.children;for(let a=0,o=s.length;a<o;a++)Ko(s[a],e,t,!0)}}var lr=class{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Ue(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(Ue(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var pc=class pc{constructor(e,t,i,n){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,n){let s=this.elements;return s[0]=e,s[2]=t,s[1]=i,s[3]=n,this}};pc.prototype.isMatrix2=!0;var $o=pc,vg=new Q;var yg=new w,xg=new w,Mg=new w,Sg=new w,bg=new w,Tg=new w,Eg=new w;var wg=new w;var Ag=new w,Cg=new Ne,Rg=new Ne;var Pg=new w,Ig=new Oe,Lg=new Oe;var Dg=new w,Ng=new w,Ug=new w;var Og=new w,Fg=new sr;var Bg=new ri;var zg=new w;var Zr=class extends ni{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){e!==void 0?(this.domElement!==null&&this.disconnect(),this.domElement=e):be("Controls: connect() now requires an element.")}disconnect(){}dispose(){}update(){}};function lc(r,e,t,i){let n=function(s){switch(s){case Wt:case vl:return{byteLength:1,components:1};case dr:case yl:case _i:return{byteLength:2,components:1};case Da:case Na:return{byteLength:2,components:4};case Bi:case La:case oi:return{byteLength:4,components:1};case xl:case Ml:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}(i);switch(t){case 1021:return r*e;case Sl:case Ua:return r*e/n.components*n.byteLength;case 1030:case 1031:return r*e*2/n.components*n.byteLength;case 1022:return r*e*3/n.components*n.byteLength;case li:case 1033:return r*e*4/n.components*n.byteLength;case 33776:case 33777:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case 33778:case 33779:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case 35841:case 35843:return Math.max(r,16)*Math.max(e,8)/4;case 35840:case 35842:return Math.max(r,8)*Math.max(e,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case 37496:case 37490:case 37491:case 37808:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case 37809:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case 37810:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case 37811:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case 37812:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case 37813:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case 37814:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case 37815:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case 37816:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case 37817:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case 37818:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case 37819:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case 37820:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case 37821:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(r/4)*Math.ceil(e/4)*16;case 36283:case 36284:return Math.ceil(r/4)*Math.ceil(e/4)*8;case 36285:case 36286:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Bs}})),typeof window<"u"&&(window.__THREE__?be("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Bs);function ju(){let r=null,e=!1,t=null,i=null;function n(s,a){t(s,a),i=r.requestAnimationFrame(n)}return{start:function(){e!==!0&&t!==null&&r!==null&&(i=r.requestAnimationFrame(n),e=!0)},stop:function(){r!==null&&r.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function Hd(r){let e=new WeakMap;return{get:function(t){return t.isInterleavedBufferAttribute&&(t=t.data),e.get(t)},remove:function(t){t.isInterleavedBufferAttribute&&(t=t.data);let i=e.get(t);i&&(r.deleteBuffer(i.buffer),e.delete(t))},update:function(t,i){if(t.isInterleavedBufferAttribute&&(t=t.data),t.isGLBufferAttribute){let s=e.get(t);return void((!s||s.version<t.version)&&e.set(t,{buffer:t.buffer,type:t.type,bytesPerElement:t.elementSize,version:t.version}))}let n=e.get(t);if(n===void 0)e.set(t,function(s,a){let o=s.array,c=s.usage,l=o.byteLength,h=r.createBuffer(),d;if(r.bindBuffer(a,h),r.bufferData(a,o,c),s.onUploadCallback(),o instanceof Float32Array)d=r.FLOAT;else if(typeof Float16Array<"u"&&o instanceof Float16Array)d=r.HALF_FLOAT;else if(o instanceof Uint16Array)d=s.isFloat16BufferAttribute?r.HALF_FLOAT:r.UNSIGNED_SHORT;else if(o instanceof Int16Array)d=r.SHORT;else if(o instanceof Uint32Array)d=r.UNSIGNED_INT;else if(o instanceof Int32Array)d=r.INT;else if(o instanceof Int8Array)d=r.BYTE;else if(o instanceof Uint8Array)d=r.UNSIGNED_BYTE;else{if(!(o instanceof Uint8ClampedArray))throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+o);d=r.UNSIGNED_BYTE}return{buffer:h,type:d,bytesPerElement:o.BYTES_PER_ELEMENT,version:s.version,size:l}}(t,i));else if(n.version<t.version){if(n.size!==t.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");(function(s,a,o){let c=a.array,l=a.updateRanges;if(r.bindBuffer(o,s),l.length===0)r.bufferSubData(o,0,c);else{l.sort((d,p)=>d.start-p.start);let h=0;for(let d=1;d<l.length;d++){let p=l[h],u=l[d];u.start<=p.start+p.count+1?p.count=Math.max(p.count,u.start+u.count-p.start):(++h,l[h]=u)}l.length=h+1;for(let d=0,p=l.length;d<p;d++){let u=l[d];r.bufferSubData(o,u.start*c.BYTES_PER_ELEMENT,c,u.start,u.count)}a.clearUpdateRanges()}a.onUploadCallback()})(n.buffer,t,i),n.version=t.version}}}}var Fe={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:"gl_FragColor = linearToOutputTexel( gl_FragColor );",colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},ce={common:{diffuse:{value:new Oe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ie},alphaMap:{value:null},alphaMapTransform:{value:new Ie},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ie}},envmap:{envMap:{value:null},envMapRotation:{value:new Ie},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ie}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ie}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ie},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ie},normalScale:{value:new Q(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ie},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ie}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ie}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ie}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Oe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new w},probesMax:{value:new w},probesResolution:{value:new w}},points:{diffuse:{value:new Oe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ie},alphaTest:{value:0},uvTransform:{value:new Ie}},sprite:{diffuse:{value:new Oe(16777215)},opacity:{value:1},center:{value:new Q(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ie},alphaMap:{value:null},alphaMapTransform:{value:new Ie},alphaTest:{value:0}}},yi={basic:{uniforms:At([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.fog]),vertexShader:Fe.meshbasic_vert,fragmentShader:Fe.meshbasic_frag},lambert:{uniforms:At([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new Oe(0)},envMapIntensity:{value:1}}]),vertexShader:Fe.meshlambert_vert,fragmentShader:Fe.meshlambert_frag},phong:{uniforms:At([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new Oe(0)},specular:{value:new Oe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Fe.meshphong_vert,fragmentShader:Fe.meshphong_frag},standard:{uniforms:At([ce.common,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.roughnessmap,ce.metalnessmap,ce.fog,ce.lights,{emissive:{value:new Oe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag},toon:{uniforms:At([ce.common,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.gradientmap,ce.fog,ce.lights,{emissive:{value:new Oe(0)}}]),vertexShader:Fe.meshtoon_vert,fragmentShader:Fe.meshtoon_frag},matcap:{uniforms:At([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,{matcap:{value:null}}]),vertexShader:Fe.meshmatcap_vert,fragmentShader:Fe.meshmatcap_frag},points:{uniforms:At([ce.points,ce.fog]),vertexShader:Fe.points_vert,fragmentShader:Fe.points_frag},dashed:{uniforms:At([ce.common,ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Fe.linedashed_vert,fragmentShader:Fe.linedashed_frag},depth:{uniforms:At([ce.common,ce.displacementmap]),vertexShader:Fe.depth_vert,fragmentShader:Fe.depth_frag},normal:{uniforms:At([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,{opacity:{value:1}}]),vertexShader:Fe.meshnormal_vert,fragmentShader:Fe.meshnormal_frag},sprite:{uniforms:At([ce.sprite,ce.fog]),vertexShader:Fe.sprite_vert,fragmentShader:Fe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ie},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Fe.background_vert,fragmentShader:Fe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ie}},vertexShader:Fe.backgroundCube_vert,fragmentShader:Fe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Fe.cube_vert,fragmentShader:Fe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Fe.equirect_vert,fragmentShader:Fe.equirect_frag},distance:{uniforms:At([ce.common,ce.displacementmap,{referencePosition:{value:new w},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Fe.distance_vert,fragmentShader:Fe.distance_frag},shadow:{uniforms:At([ce.lights,ce.fog,{color:{value:new Oe(0)},opacity:{value:1}}]),vertexShader:Fe.shadow_vert,fragmentShader:Fe.shadow_frag}};yi.physical={uniforms:At([yi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ie},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ie},clearcoatNormalScale:{value:new Q(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ie},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ie},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ie},sheen:{value:0},sheenColor:{value:new Oe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ie},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ie},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ie},transmissionSamplerSize:{value:new Q},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ie},attenuationDistance:{value:0},attenuationColor:{value:new Oe(0)},specularColor:{value:new Oe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ie},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ie},anisotropyVector:{value:new Q},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ie}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag};var Wa={r:0,b:0,g:0},Wd=new Ne,qu=new Ie;function Xd(r,e,t,i,n,s){let a=new Oe(0),o,c,l=n===!0?0:1,h=null,d=0,p=null;function u(m){let v=m.isScene===!0?m.background:null;if(v&&v.isTexture){let f=m.backgroundBlurriness>0;v=e.get(v,f)}return v}function g(m,v){m.getRGB(Wa,ac(r)),t.buffers.color.setClear(Wa.r,Wa.g,Wa.b,v,s)}return{getClearColor:function(){return a},setClearColor:function(m,v=1){a.set(m),l=v,g(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(m){l=m,g(a,l)},render:function(m){let v=!1,f=u(m);f===null?g(a,l):f&&f.isColor&&(g(f,1),v=!0);let _=r.xr.getEnvironmentBlendMode();_==="additive"?t.buffers.color.setClear(0,0,0,1,s):_==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(r.autoClear||v)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))},addToRenderList:function(m,v){let f=u(v);f&&(f.isCubeTexture||f.mapping===$r)?(c===void 0&&(c=new ze(new St(1,1,1),new Ht({name:"BackgroundCubeMaterial",uniforms:wn(yi.backgroundCube.uniforms),vertexShader:yi.backgroundCube.vertexShader,fragmentShader:yi.backgroundCube.fragmentShader,side:Ut,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(_,x,S){this.matrixWorld.copyPosition(S.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=f,c.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Wd.makeRotationFromEuler(v.backgroundRotation)).transpose(),f.isCubeTexture&&f.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(qu),c.material.toneMapped=Ve.getTransfer(f.colorSpace)!==je,h===f&&d===f.version&&p===r.toneMapping||(c.material.needsUpdate=!0,h=f,d=f.version,p=r.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null)):f&&f.isTexture&&(o===void 0&&(o=new ze(new Oi(2,2),new Ht({name:"BackgroundMaterial",uniforms:wn(yi.background.uniforms),vertexShader:yi.background.vertexShader,fragmentShader:yi.background.fragmentShader,side:nn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),o.geometry.deleteAttribute("normal"),Object.defineProperty(o.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(o)),o.material.uniforms.t2D.value=f,o.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,o.material.toneMapped=Ve.getTransfer(f.colorSpace)!==je,f.matrixAutoUpdate===!0&&f.updateMatrix(),o.material.uniforms.uvTransform.value.copy(f.matrix),h===f&&d===f.version&&p===r.toneMapping||(o.material.needsUpdate=!0,h=f,d=f.version,p=r.toneMapping),o.layers.enableAll(),m.unshift(o,o.geometry,o.material,0,0,null))},dispose:function(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),o!==void 0&&(o.geometry.dispose(),o.material.dispose(),o=void 0)}}}function jd(r,e){let t=r.getParameter(r.MAX_VERTEX_ATTRIBS),i={},n=l(null),s=n,a=!1;function o(f){return r.bindVertexArray(f)}function c(f){return r.deleteVertexArray(f)}function l(f){let _=[],x=[],S=[];for(let E=0;E<t;E++)_[E]=0,x[E]=0,S[E]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:_,enabledAttributes:x,attributeDivisors:S,object:f,attributes:{},index:null}}function h(){let f=s.newAttributes;for(let _=0,x=f.length;_<x;_++)f[_]=0}function d(f){p(f,0)}function p(f,_){let x=s.newAttributes,S=s.enabledAttributes,E=s.attributeDivisors;x[f]=1,S[f]===0&&(r.enableVertexAttribArray(f),S[f]=1),E[f]!==_&&(r.vertexAttribDivisor(f,_),E[f]=_)}function u(){let f=s.newAttributes,_=s.enabledAttributes;for(let x=0,S=_.length;x<S;x++)_[x]!==f[x]&&(r.disableVertexAttribArray(x),_[x]=0)}function g(f,_,x,S,E,M,P){P===!0?r.vertexAttribIPointer(f,_,x,E,M):r.vertexAttribPointer(f,_,x,S,E,M)}function m(){v(),a=!0,s!==n&&(s=n,o(s.object))}function v(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:function(f,_,x,S,E){let M=!1,P=function(F,L,N,H){let B=H.wireframe===!0,Z=i[L.id];Z===void 0&&(Z={},i[L.id]=Z);let X=F.isInstancedMesh===!0?F.id:0,V=Z[X];V===void 0&&(V={},Z[X]=V);let q=V[N.id];q===void 0&&(q={},V[N.id]=q);let U=q[B];return U===void 0&&(U=l(r.createVertexArray()),q[B]=U),U}(f,S,x,_);s!==P&&(s=P,o(s.object)),M=function(F,L,N,H){let B=s.attributes,Z=L.attributes,X=0,V=N.getAttributes();for(let q in V)if(V[q].location>=0){let U=B[q],W=Z[q];if(W===void 0&&(q==="instanceMatrix"&&F.instanceMatrix&&(W=F.instanceMatrix),q==="instanceColor"&&F.instanceColor&&(W=F.instanceColor)),U===void 0||U.attribute!==W||W&&U.data!==W.data)return!0;X++}return s.attributesNum!==X||s.index!==H}(f,S,x,E),M&&function(F,L,N,H){let B={},Z=L.attributes,X=0,V=N.getAttributes();for(let q in V)if(V[q].location>=0){let U=Z[q];U===void 0&&(q==="instanceMatrix"&&F.instanceMatrix&&(U=F.instanceMatrix),q==="instanceColor"&&F.instanceColor&&(U=F.instanceColor));let W={};W.attribute=U,U&&U.data&&(W.data=U.data),B[q]=W,X++}s.attributes=B,s.attributesNum=X,s.index=H}(f,S,x,E),E!==null&&e.update(E,r.ELEMENT_ARRAY_BUFFER),(M||a)&&(a=!1,function(F,L,N,H){h();let B=H.attributes,Z=N.getAttributes(),X=L.defaultAttributeValues;for(let V in Z){let q=Z[V];if(q.location>=0){let U=B[V];if(U===void 0&&(V==="instanceMatrix"&&F.instanceMatrix&&(U=F.instanceMatrix),V==="instanceColor"&&F.instanceColor&&(U=F.instanceColor)),U!==void 0){let W=U.normalized,re=U.itemSize,Me=e.get(U);if(Me===void 0)continue;let ge=Me.buffer,_e=Me.type,ie=Me.bytesPerElement,he=_e===r.INT||_e===r.UNSIGNED_INT||U.gpuType===La;if(U.isInterleavedBufferAttribute){let le=U.data,me=le.stride,De=U.offset;if(le.isInstancedInterleavedBuffer){for(let ee=0;ee<q.locationSize;ee++)p(q.location+ee,le.meshPerAttribute);F.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let ee=0;ee<q.locationSize;ee++)d(q.location+ee);r.bindBuffer(r.ARRAY_BUFFER,ge);for(let ee=0;ee<q.locationSize;ee++)g(q.location+ee,re/q.locationSize,_e,W,me*ie,(De+re/q.locationSize*ee)*ie,he)}else{if(U.isInstancedBufferAttribute){for(let le=0;le<q.locationSize;le++)p(q.location+le,U.meshPerAttribute);F.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=U.meshPerAttribute*U.count)}else for(let le=0;le<q.locationSize;le++)d(q.location+le);r.bindBuffer(r.ARRAY_BUFFER,ge);for(let le=0;le<q.locationSize;le++)g(q.location+le,re/q.locationSize,_e,W,re*ie,re/q.locationSize*le*ie,he)}}else if(X!==void 0){let W=X[V];if(W!==void 0)switch(W.length){case 2:r.vertexAttrib2fv(q.location,W);break;case 3:r.vertexAttrib3fv(q.location,W);break;case 4:r.vertexAttrib4fv(q.location,W);break;default:r.vertexAttrib1fv(q.location,W)}}}}u()}(f,_,x,S),E!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(E).buffer))},reset:m,resetDefaultState:v,dispose:function(){m();for(let f in i){let _=i[f];for(let x in _){let S=_[x];for(let E in S){let M=S[E];for(let P in M)c(M[P].object),delete M[P];delete S[E]}}delete i[f]}},releaseStatesOfGeometry:function(f){if(i[f.id]===void 0)return;let _=i[f.id];for(let x in _){let S=_[x];for(let E in S){let M=S[E];for(let P in M)c(M[P].object),delete M[P];delete S[E]}}delete i[f.id]},releaseStatesOfObject:function(f){for(let _ in i){let x=i[_],S=f.isInstancedMesh===!0?f.id:0,E=x[S];if(E!==void 0){for(let M in E){let P=E[M];for(let F in P)c(P[F].object),delete P[F];delete E[M]}delete x[S],Object.keys(x).length===0&&delete i[_]}}},releaseStatesOfProgram:function(f){for(let _ in i){let x=i[_];for(let S in x){let E=x[S];if(E[f.id]===void 0)continue;let M=E[f.id];for(let P in M)c(M[P].object),delete M[P];delete E[f.id]}}},initAttributes:h,enableAttribute:d,disableUnusedAttributes:u}}function qd(r,e,t){let i;this.setMode=function(n){i=n},this.render=function(n,s){r.drawArrays(i,n,s),t.update(s,i,1)},this.renderInstances=function(n,s,a){a!==0&&(r.drawArraysInstanced(i,n,s,a),t.update(s,i,a))},this.renderMultiDraw=function(n,s,a){if(a===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,n,0,s,0,a);let o=0;for(let c=0;c<a;c++)o+=s[c];t.update(o,i,1)}}function Yd(r,e,t,i){let n;function s(h){if(h==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";h="mediump"}return h==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let a=t.precision!==void 0?t.precision:"highp",o=s(a);o!==a&&(be("WebGLRenderer:",a,"not supported, using",o,"instead."),a=o);let c=t.logarithmicDepthBuffer===!0,l=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");return t.reversedDepthBuffer===!0&&l===!1&&be("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),{isWebGL2:!0,getMaxAnisotropy:function(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){let h=e.get("EXT_texture_filter_anisotropic");n=r.getParameter(h.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n},getMaxPrecision:s,textureFormatReadable:function(h){return h===li||i.convert(h)===r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT)},textureTypeReadable:function(h){let d=h===_i&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(h!==Wt&&i.convert(h)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&h!==oi&&!d)},precision:a,logarithmicDepthBuffer:c,reversedDepthBuffer:l,maxTextures:r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),maxVertexTextures:r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),maxTextureSize:r.getParameter(r.MAX_TEXTURE_SIZE),maxCubemapSize:r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),maxAttributes:r.getParameter(r.MAX_VERTEX_ATTRIBS),maxVertexUniforms:r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),maxVaryings:r.getParameter(r.MAX_VARYING_VECTORS),maxFragmentUniforms:r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),maxSamples:r.getParameter(r.MAX_SAMPLES),samples:r.getParameter(r.SAMPLES)}}function Zd(r){let e=this,t=null,i=0,n=!1,s=!1,a=new Yt,o=new Ie,c={value:null,needsUpdate:!1};function l(h,d,p,u){let g=h!==null?h.length:0,m=null;if(g!==0){if(m=c.value,u!==!0||m===null){let v=p+4*g,f=d.matrixWorldInverse;o.getNormalMatrix(f),(m===null||m.length<v)&&(m=new Float32Array(v));for(let _=0,x=p;_!==g;++_,x+=4)a.copy(h[_]).applyMatrix4(f,o),a.normal.toArray(m,x),m[x+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=g,e.numIntersection=0,m}this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let p=h.length!==0||d||i!==0||n;return n=d,i=h.length,p},this.beginShadows=function(){s=!0,l(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){t=l(h,d,0)},this.setState=function(h,d,p){let u=h.clippingPlanes,g=h.clipIntersection,m=h.clipShadows,v=r.get(h);if(!n||u===null||u.length===0||s&&!m)s?l(null):function(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}();else{let f=s?0:i,_=4*f,x=v.clippingState||null;c.value=x,x=l(u,d,_,p);for(let S=0;S!==_;++S)x[S]=t[S];v.clippingState=x,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=f}}}qu.set(-1,0,0,0,1,0,0,0,1);var Tu=[.125,.215,.35,.446,.526,.582],es=20,ts=new ar,Eu=new Oe,mc=null,fc=0,gc=0,_c=!1,Jd=new w,ja=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,n=100,s={}){let{size:a=256,position:o=Jd}=s;mc=this._renderer.getRenderTarget(),fc=this._renderer.getActiveCubeFace(),gc=this._renderer.getActiveMipmapLevel(),_c=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,n,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Cu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Au(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(mc,fc,gc),this._renderer.xr.enabled=_c,e.scissorTest=!1,mr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ur||e.mapping===xn?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),mc=this._renderer.getRenderTarget(),fc=this._renderer.getActiveCubeFace(),gc=this._renderer.getActiveMipmapLevel(),_c=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:wt,minFilter:wt,generateMipmaps:!1,type:_i,format:li,colorSpace:Cr,depthBuffer:!1},n=wu(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=wu(e,t,i);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=function(a){let o=[],c=[],l=[],h=a,d=a-4+1+Tu.length;for(let p=0;p<d;p++){let u=Math.pow(2,h);o.push(u);let g=1/u;p>a-4?g=Tu[p-a+4-1]:p===0&&(g=0),c.push(g);let m=1/(u-2),v=-m,f=1+m,_=[v,v,f,v,f,f,v,v,f,f,v,f],x=6,S=6,E=3,M=2,P=1,F=new Float32Array(E*S*x),L=new Float32Array(M*S*x),N=new Float32Array(P*S*x);for(let B=0;B<x;B++){let Z=B%3*2/3-1,X=B>2?0:-1,V=[Z,X,0,Z+2/3,X,0,Z+2/3,X+1,0,Z,X,0,Z+2/3,X+1,0,Z,X+1,0];F.set(V,E*S*B),L.set(_,M*S*B);let q=[B,B,B,B,B,B];N.set(q,P*S*B)}let H=new et;H.setAttribute("position",new Gt(F,E)),H.setAttribute("uv",new Gt(L,M)),H.setAttribute("faceIndex",new Gt(N,P)),l.push(new ze(H,null)),h>4&&h--}return{lodMeshes:l,sizeLods:o,sigmas:c}}(s)),this._blurMaterial=function(a,o,c){let l=new Float32Array(es),h=new w(0,1,0);return new Ht({name:"SphericalGaussianBlur",defines:{n:es,CUBEUV_TEXEL_WIDTH:1/o,CUBEUV_TEXEL_HEIGHT:1/c,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:l},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:h}},vertexShader:qa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:gi,depthTest:!1,depthWrite:!1})}(s,e,t),this._ggxMaterial=function(a,o,c){return new Ht({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:256,CUBEUV_TEXEL_WIDTH:1/o,CUBEUV_TEXEL_HEIGHT:1/c,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:qa(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:gi,depthTest:!1,depthWrite:!1})}(s,e,t)}return n}_compileMaterial(e){let t=new ze(new et,e);this._renderer.compile(t,ts)}_sceneToCubeUV(e,t,i,n,s){let a=new Et(90,1,t,i),o=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],l=this._renderer,h=l.autoClear,d=l.toneMapping;l.getClearColor(Eu),l.toneMapping=ai,l.autoClear=!1,l.state.buffers.depth.getReversed()&&(l.setRenderTarget(n),l.clearDepth(),l.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ze(new St,new fn({name:"PMREM.Background",side:Ut,depthWrite:!1,depthTest:!1})));let p=this._backgroundBox,u=p.material,g=!1,m=e.background;m?m.isColor&&(u.color.copy(m),e.background=null,g=!0):(u.color.copy(Eu),g=!0);for(let v=0;v<6;v++){let f=v%3;f===0?(a.up.set(0,o[v],0),a.position.set(s.x,s.y,s.z),a.lookAt(s.x+c[v],s.y,s.z)):f===1?(a.up.set(0,0,o[v]),a.position.set(s.x,s.y,s.z),a.lookAt(s.x,s.y+c[v],s.z)):(a.up.set(0,o[v],0),a.position.set(s.x,s.y,s.z),a.lookAt(s.x,s.y,s.z+c[v]));let _=this._cubeSize;mr(n,f*_,v>2?_:0,_,_),l.setRenderTarget(n),g&&l.render(p,a),l.render(e,a)}l.toneMapping=d,l.autoClear=h,e.background=m}_textureToCubeUV(e,t){let i=this._renderer,n=e.mapping===ur||e.mapping===xn;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=Cu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Au());let s=n?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=s,s.uniforms.envMap.value=e;let o=this._cubeSize;mr(t,0,0,3*o,2*o),i.setRenderTarget(t),i.render(a,ts)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let n=this._lodMeshes.length;for(let s=1;s<n;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=i}_applyGGXFilter(e,t,i){let n=this._renderer,s=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let c=a.uniforms,l=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(l*l-h*h)*(0+1.25*l),{_lodMax:p}=this,u=this._sizeLods[i],g=3*u*(i>p-4?i-p+4:0),m=4*(this._cubeSize-u);c.envMap.value=e.texture,c.roughness.value=d,c.mipInt.value=p-t,mr(s,g,m,3*u,2*u),n.setRenderTarget(s),n.render(o,ts),c.envMap.value=s.texture,c.roughness.value=0,c.mipInt.value=p-i,mr(e,g,m,3*u,2*u),n.setRenderTarget(e),n.render(o,ts)}_blur(e,t,i,n,s){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,n,"latitudinal",s),this._halfBlur(a,e,i,i,n,"longitudinal",s)}_halfBlur(e,t,i,n,s,a,o){let c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&Te("blur direction must be either latitudinal or longitudinal!");let h=this._lodMeshes[n];h.material=l;let d=l.uniforms,p=this._sizeLods[i]-1,u=isFinite(s)?Math.PI/(2*p):2*Math.PI/39,g=s/u,m=isFinite(s)?1+Math.floor(3*g):es;m>es&&be(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to 20`);let v=[],f=0;for(let S=0;S<es;++S){let E=S/g,M=Math.exp(-E*E/2);v.push(M),S===0?f+=M:S<m&&(f+=2*M)}for(let S=0;S<v.length;S++)v[S]=v[S]/f;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=v,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);let{_lodMax:_}=this;d.dTheta.value=u,d.mipInt.value=_-i;let x=this._sizeLods[n];mr(t,3*x*(n>_-4?n-_+4:0),4*(this._cubeSize-x),3*x,2*x),c.setRenderTarget(t),c.render(h,ts)}};function wu(r,e,t){let i=new Vt(r,e,t);return i.texture.mapping=$r,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function mr(r,e,t,i,n){r.viewport.set(e,t,i,n),r.scissor.set(e,t,i,n)}function Au(){return new Ht({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:qa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:gi,depthTest:!1,depthWrite:!1})}function Cu(){return new Ht({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:qa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:gi,depthTest:!1,depthWrite:!1})}function qa(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ya=class extends Vt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},n=[i,i,i,i,i,i];this.texture=new Ur(n),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},n=new St(5,5,5),s=new Ht({name:"CubemapFromEquirect",uniforms:wn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ut,blending:gi});s.uniforms.tEquirect.value=t;let a=new ze(n,s),o=t.minFilter;return t.minFilter===Mn&&(t.minFilter=wt),new Ea(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,n=!0){let s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,n);e.setRenderTarget(s)}};function Kd(r){let e=new WeakMap,t=new WeakMap,i=null;function n(o,c){return c===Ra?o.mapping=ur:c===Pa&&(o.mapping=xn),o}function s(o){let c=o.target;c.removeEventListener("dispose",s);let l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function a(o){let c=o.target;c.removeEventListener("dispose",a);let l=t.get(c);l!==void 0&&(t.delete(c),l.dispose())}return{get:function(o,c=!1){return o==null?null:c?function(l){if(l&&l.isTexture){let h=l.mapping,d=h===Ra||h===Pa,p=h===ur||h===xn;if(d||p){let u=t.get(l),g=u!==void 0?u.texture.pmremVersion:0;if(l.isRenderTargetTexture&&l.pmremVersion!==g)return i===null&&(i=new ja(r)),u=d?i.fromEquirectangular(l,u):i.fromCubemap(l,u),u.texture.pmremVersion=l.pmremVersion,t.set(l,u),u.texture;if(u!==void 0)return u.texture;{let m=l.image;return d&&m&&m.height>0||p&&m&&function(v){let f=0,_=6;for(let x=0;x<_;x++)v[x]!==void 0&&f++;return f===_}(m)?(i===null&&(i=new ja(r)),u=d?i.fromEquirectangular(l):i.fromCubemap(l),u.texture.pmremVersion=l.pmremVersion,t.set(l,u),l.addEventListener("dispose",a),u.texture):null}}}return l}(o):function(l){if(l&&l.isTexture){let h=l.mapping;if(h===Ra||h===Pa){if(e.has(l))return n(e.get(l).texture,l.mapping);{let d=l.image;if(d&&d.height>0){let p=new Ya(d.height);return p.fromEquirectangularTexture(r,l),e.set(l,p),l.addEventListener("dispose",s),n(p.texture,l.mapping)}return null}}}return l}(o)},dispose:function(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}}}function $d(r){let e={};function t(i){if(e[i]!==void 0)return e[i];let n=r.getExtension(i);return e[i]=n,n}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let n=t(i);return n===null&&mn("WebGLRenderer: "+i+" extension not supported."),n}}}function Qd(r,e,t,i){let n={},s=new WeakMap;function a(c){let l=c.target;l.index!==null&&e.remove(l.index);for(let d in l.attributes)e.remove(l.attributes[d]);l.removeEventListener("dispose",a),delete n[l.id];let h=s.get(l);h&&(e.remove(h),s.delete(l)),i.releaseStatesOfGeometry(l),l.isInstancedBufferGeometry===!0&&delete l._maxInstanceCount,t.memory.geometries--}function o(c){let l=[],h=c.index,d=c.attributes.position,p=0;if(d===void 0)return;if(h!==null){let m=h.array;p=h.version;for(let v=0,f=m.length;v<f;v+=3){let _=m[v+0],x=m[v+1],S=m[v+2];l.push(_,x,x,S,S,_)}}else{let m=d.array;p=d.version;for(let v=0,f=m.length/3-1;v<f;v+=3){let _=v+0,x=v+1,S=v+2;l.push(_,x,x,S,S,_)}}let u=new(d.count>=65535?Nr:Dr)(l,1);u.version=p;let g=s.get(c);g&&e.remove(g),s.set(c,u)}return{get:function(c,l){return n[l.id]===!0||(l.addEventListener("dispose",a),n[l.id]=!0,t.memory.geometries++),l},update:function(c){let l=c.attributes;for(let h in l)e.update(l[h],r.ARRAY_BUFFER)},getWireframeAttribute:function(c){let l=s.get(c);if(l){let h=c.index;h!==null&&l.version<h.version&&o(c)}else o(c);return s.get(c)}}}function ep(r,e,t){let i,n,s;this.setMode=function(a){i=a},this.setIndex=function(a){n=a.type,s=a.bytesPerElement},this.render=function(a,o){r.drawElements(i,o,n,a*s),t.update(o,i,1)},this.renderInstances=function(a,o,c){c!==0&&(r.drawElementsInstanced(i,o,n,a*s,c),t.update(o,i,c))},this.renderMultiDraw=function(a,o,c){if(c===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,o,0,n,a,0,c);let l=0;for(let h=0;h<c;h++)l+=o[h];t.update(l,i,1)}}function tp(r){let e={frame:0,calls:0,triangles:0,points:0,lines:0};return{memory:{geometries:0,textures:0},render:e,programs:null,autoReset:!0,reset:function(){e.calls=0,e.triangles=0,e.points=0,e.lines=0},update:function(t,i,n){switch(e.calls++,i){case r.TRIANGLES:e.triangles+=n*(t/3);break;case r.LINES:e.lines+=n*(t/2);break;case r.LINE_STRIP:e.lines+=n*(t-1);break;case r.LINE_LOOP:e.lines+=n*t;break;case r.POINTS:e.points+=n*t;break;default:Te("WebGLInfo: Unknown draw mode:",i)}}}}function ip(r,e,t){let i=new WeakMap,n=new Ze;return{update:function(s,a,o){let c=s.morphTargetInfluences,l=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=l!==void 0?l.length:0,d=i.get(a);if(d===void 0||d.count!==h){let F=function(){M.dispose(),i.delete(a),a.removeEventListener("dispose",F)};d!==void 0&&d.texture.dispose();let p=a.morphAttributes.position!==void 0,u=a.morphAttributes.normal!==void 0,g=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],v=a.morphAttributes.normal||[],f=a.morphAttributes.color||[],_=0;p===!0&&(_=1),u===!0&&(_=2),g===!0&&(_=3);let x=a.attributes.position.count*_,S=1;x>e.maxTextureSize&&(S=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize);let E=new Float32Array(x*S*4*h),M=new Ir(E,x,S,h);M.type=oi,M.needsUpdate=!0;let P=4*_;for(let L=0;L<h;L++){let N=m[L],H=v[L],B=f[L],Z=x*S*4*L;for(let X=0;X<N.count;X++){let V=X*P;p===!0&&(n.fromBufferAttribute(N,X),E[Z+V+0]=n.x,E[Z+V+1]=n.y,E[Z+V+2]=n.z,E[Z+V+3]=0),u===!0&&(n.fromBufferAttribute(H,X),E[Z+V+4]=n.x,E[Z+V+5]=n.y,E[Z+V+6]=n.z,E[Z+V+7]=0),g===!0&&(n.fromBufferAttribute(B,X),E[Z+V+8]=n.x,E[Z+V+9]=n.y,E[Z+V+10]=n.z,E[Z+V+11]=B.itemSize===4?n.w:1)}}d={count:h,texture:M,size:new Q(x,S)},i.set(a,d),a.addEventListener("dispose",F)}if(s.isInstancedMesh===!0&&s.morphTexture!==null)o.getUniforms().setValue(r,"morphTexture",s.morphTexture,t);else{let p=0;for(let g=0;g<c.length;g++)p+=c[g];let u=a.morphTargetsRelative?1:1-p;o.getUniforms().setValue(r,"morphTargetBaseInfluence",u),o.getUniforms().setValue(r,"morphTargetInfluences",c)}o.getUniforms().setValue(r,"morphTargetsTexture",d.texture,t),o.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}}}function np(r,e,t,i,n){let s=new WeakMap;function a(o){let c=o.target;c.removeEventListener("dispose",a),i.releaseStatesOfObject(c),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:function(o){let c=n.render.frame,l=o.geometry,h=e.get(o,l);if(s.get(h)!==c&&(e.update(h),s.set(h,c)),o.isInstancedMesh&&(o.hasEventListener("dispose",a)===!1&&o.addEventListener("dispose",a),s.get(o)!==c&&(t.update(o.instanceMatrix,r.ARRAY_BUFFER),o.instanceColor!==null&&t.update(o.instanceColor,r.ARRAY_BUFFER),s.set(o,c))),o.isSkinnedMesh){let d=o.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h},dispose:function(){s=new WeakMap}}}var rp={[hl]:"LINEAR_TONE_MAPPING",[ul]:"REINHARD_TONE_MAPPING",[dl]:"CINEON_TONE_MAPPING",[pl]:"ACES_FILMIC_TONE_MAPPING",[fl]:"AGX_TONE_MAPPING",[gl]:"NEUTRAL_TONE_MAPPING",[ml]:"CUSTOM_TONE_MAPPING"};function sp(r,e,t,i,n,s){let a=new Vt(e,t,{type:r,depthBuffer:n,stencilBuffer:s,samples:i?4:0,depthTexture:n?new Li(e,t):void 0}),o=new Vt(e,t,{type:_i,depthBuffer:!1,stencilBuffer:!1}),c=new et;c.setAttribute("position",new Ee([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Ee([0,2,0,0,2,0],2));let l=new da({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),h=new ze(c,l),d=new ar(-1,1,1,-1,0,1),p,u=null,g=null,m=!1,v=null,f=[],_=!1;this.setSize=function(x,S){a.setSize(x,S),o.setSize(x,S);for(let E=0;E<f.length;E++){let M=f[E];M.setSize&&M.setSize(x,S)}},this.setEffects=function(x){f=x,_=f.length>0&&f[0].isRenderPass===!0;let S=a.width,E=a.height;for(let M=0;M<f.length;M++){let P=f[M];P.setSize&&P.setSize(S,E)}},this.begin=function(x,S){if(m||x.toneMapping===ai&&f.length===0)return!1;if(v=S,S!==null){let E=S.width,M=S.height;a.width===E&&a.height===M||this.setSize(E,M)}return _===!1&&x.setRenderTarget(a),p=x.toneMapping,x.toneMapping=ai,!0},this.hasRenderPass=function(){return _},this.end=function(x,S){x.toneMapping=p,m=!0;let E=a,M=o;for(let P=0;P<f.length;P++){let F=f[P];if(F.enabled!==!1&&(F.render(x,M,E,S),F.needsSwap!==!1)){let L=E;E=M,M=L}}if(u!==x.outputColorSpace||g!==x.toneMapping){u=x.outputColorSpace,g=x.toneMapping,l.defines={},Ve.getTransfer(u)===je&&(l.defines.SRGB_TRANSFER="");let P=rp[g];P&&(l.defines[P]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=E.texture,x.setRenderTarget(v),x.render(h,d),v=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),c.dispose(),l.dispose()}}var Yu=new Nt,xc=new Li(1,1),Zu=new Ir,Ju=new Ws,Ku=new Ur,Ru=[],Pu=[],Iu=new Float32Array(16),Lu=new Float32Array(9),Du=new Float32Array(4);function gr(r,e,t){let i=r[0];if(i<=0||i>0)return r;let n=e*t,s=Ru[n];if(s===void 0&&(s=new Float32Array(n),Ru[n]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function mt(r,e){if(r.length!==e.length)return!1;for(let t=0,i=r.length;t<i;t++)if(r[t]!==e[t])return!1;return!0}function ft(r,e){for(let t=0,i=e.length;t<i;t++)r[t]=e[t]}function Ja(r,e){let t=Pu[e];t===void 0&&(t=new Int32Array(e),Pu[e]=t);for(let i=0;i!==e;++i)t[i]=r.allocateTextureUnit();return t}function ap(r,e){let t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function op(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(mt(t,e))return;r.uniform2fv(this.addr,e),ft(t,e)}}function lp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)t[0]===e.r&&t[1]===e.g&&t[2]===e.b||(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(mt(t,e))return;r.uniform3fv(this.addr,e),ft(t,e)}}function cp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(mt(t,e))return;r.uniform4fv(this.addr,e),ft(t,e)}}function hp(r,e){let t=this.cache,i=e.elements;if(i===void 0){if(mt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),ft(t,e)}else{if(mt(t,i))return;Du.set(i),r.uniformMatrix2fv(this.addr,!1,Du),ft(t,i)}}function up(r,e){let t=this.cache,i=e.elements;if(i===void 0){if(mt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),ft(t,e)}else{if(mt(t,i))return;Lu.set(i),r.uniformMatrix3fv(this.addr,!1,Lu),ft(t,i)}}function dp(r,e){let t=this.cache,i=e.elements;if(i===void 0){if(mt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),ft(t,e)}else{if(mt(t,i))return;Iu.set(i),r.uniformMatrix4fv(this.addr,!1,Iu),ft(t,i)}}function pp(r,e){let t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function mp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(mt(t,e))return;r.uniform2iv(this.addr,e),ft(t,e)}}function fp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(mt(t,e))return;r.uniform3iv(this.addr,e),ft(t,e)}}function gp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(mt(t,e))return;r.uniform4iv(this.addr,e),ft(t,e)}}function _p(r,e){let t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function vp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(mt(t,e))return;r.uniform2uiv(this.addr,e),ft(t,e)}}function yp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(mt(t,e))return;r.uniform3uiv(this.addr,e),ft(t,e)}}function xp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(mt(t,e))return;r.uniform4uiv(this.addr,e),ft(t,e)}}function Mp(r,e,t){let i=this.cache,n=t.allocateTextureUnit(),s;i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),this.type===r.SAMPLER_2D_SHADOW?(xc.compareFunction=t.isReversedDepthBuffer()?Ha:ka,s=xc):s=Yu,t.setTexture2D(e||s,n)}function Sp(r,e,t){let i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),t.setTexture3D(e||Ju,n)}function bp(r,e,t){let i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),t.setTextureCube(e||Ku,n)}function Tp(r,e,t){let i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),t.setTexture2DArray(e||Zu,n)}function Ep(r,e){r.uniform1fv(this.addr,e)}function wp(r,e){let t=gr(e,this.size,2);r.uniform2fv(this.addr,t)}function Ap(r,e){let t=gr(e,this.size,3);r.uniform3fv(this.addr,t)}function Cp(r,e){let t=gr(e,this.size,4);r.uniform4fv(this.addr,t)}function Rp(r,e){let t=gr(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function Pp(r,e){let t=gr(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function Ip(r,e){let t=gr(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function Lp(r,e){r.uniform1iv(this.addr,e)}function Dp(r,e){r.uniform2iv(this.addr,e)}function Np(r,e){r.uniform3iv(this.addr,e)}function Up(r,e){r.uniform4iv(this.addr,e)}function Op(r,e){r.uniform1uiv(this.addr,e)}function Fp(r,e){r.uniform2uiv(this.addr,e)}function Bp(r,e){r.uniform3uiv(this.addr,e)}function zp(r,e){r.uniform4uiv(this.addr,e)}function Gp(r,e,t){let i=this.cache,n=e.length,s=Ja(t,n),a;mt(i,s)||(r.uniform1iv(this.addr,s),ft(i,s)),a=this.type===r.SAMPLER_2D_SHADOW?xc:Yu;for(let o=0;o!==n;++o)t.setTexture2D(e[o]||a,s[o])}function Vp(r,e,t){let i=this.cache,n=e.length,s=Ja(t,n);mt(i,s)||(r.uniform1iv(this.addr,s),ft(i,s));for(let a=0;a!==n;++a)t.setTexture3D(e[a]||Ju,s[a])}function kp(r,e,t){let i=this.cache,n=e.length,s=Ja(t,n);mt(i,s)||(r.uniform1iv(this.addr,s),ft(i,s));for(let a=0;a!==n;++a)t.setTextureCube(e[a]||Ku,s[a])}function Hp(r,e,t){let i=this.cache,n=e.length,s=Ja(t,n);mt(i,s)||(r.uniform1iv(this.addr,s),ft(i,s));for(let a=0;a!==n;++a)t.setTexture2DArray(e[a]||Zu,s[a])}var Mc=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=function(n){switch(n){case 5126:return ap;case 35664:return op;case 35665:return lp;case 35666:return cp;case 35674:return hp;case 35675:return up;case 35676:return dp;case 5124:case 35670:return pp;case 35667:case 35671:return mp;case 35668:case 35672:return fp;case 35669:case 35673:return gp;case 5125:return _p;case 36294:return vp;case 36295:return yp;case 36296:return xp;case 35678:case 36198:case 36298:case 36306:case 35682:return Mp;case 35679:case 36299:case 36307:return Sp;case 35680:case 36300:case 36308:case 36293:return bp;case 36289:case 36303:case 36311:case 36292:return Tp}}(t.type)}},Sc=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=function(n){switch(n){case 5126:return Ep;case 35664:return wp;case 35665:return Ap;case 35666:return Cp;case 35674:return Rp;case 35675:return Pp;case 35676:return Ip;case 5124:case 35670:return Lp;case 35667:case 35671:return Dp;case 35668:case 35672:return Np;case 35669:case 35673:return Up;case 5125:return Op;case 36294:return Fp;case 36295:return Bp;case 36296:return zp;case 35678:case 36198:case 36298:case 36306:case 35682:return Gp;case 35679:case 36299:case 36307:return Vp;case 35680:case 36300:case 36308:case 36293:return kp;case 36289:case 36303:case 36311:case 36292:return Hp}}(t.type)}},bc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let n=this.seq;for(let s=0,a=n.length;s!==a;++s){let o=n[s];o.setValue(e,t[o.id],i)}}},vc=/(\w+)(\])?(\[|\.)?/g;function Nu(r,e){r.seq.push(e),r.map[e.id]=e}function Wp(r,e,t){let i=r.name,n=i.length;for(vc.lastIndex=0;;){let s=vc.exec(i),a=vc.lastIndex,o=s[1],c=s[2]==="]",l=s[3];if(c&&(o|=0),l===void 0||l==="["&&a+2===n){Nu(t,l===void 0?new Mc(o,r,e):new Sc(o,r,e));break}{let h=t.map[o];h===void 0&&(h=new bc(o),Nu(t,h)),t=h}}}var fr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=e.getActiveUniform(t,a);Wp(o,e.getUniformLocation(t,o.name),this)}let n=[],s=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?n.push(a):s.push(a);n.length>0&&(this.seq=n.concat(s))}setValue(e,t,i,n){let s=this.map[t];s!==void 0&&s.setValue(e,i,n)}setOptional(e,t,i){let n=t[i];n!==void 0&&this.setValue(e,i,n)}static upload(e,t,i,n){for(let s=0,a=t.length;s!==a;++s){let o=t[s],c=i[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,n)}}static seqWithValue(e,t){let i=[];for(let n=0,s=e.length;n!==s;++n){let a=e[n];a.id in t&&i.push(a)}return i}};function Uu(r,e,t){let i=r.createShader(e);return r.shaderSource(i,t),r.compileShader(i),i}var Xp=0,Ou=new Ie;function Fu(r,e,t){let i=r.getShaderParameter(e,r.COMPILE_STATUS),n=(r.getShaderInfoLog(e)||"").trim();if(i&&n==="")return"";let s=/ERROR: 0:(\d+)/.exec(n);if(s){let a=parseInt(s[1]);return t.toUpperCase()+`

`+n+`

`+function(o,c){let l=o.split(`
`),h=[],d=Math.max(c-6,0),p=Math.min(c+6,l.length);for(let u=d;u<p;u++){let g=u+1;h.push(`${g===c?">":" "} ${g}: ${l[u]}`)}return h.join(`
`)}(r.getShaderSource(e),a)}return n}function jp(r,e){let t=function(i){Ve._getMatrix(Ou,Ve.workingColorSpace,i);let n=`mat3( ${Ou.elements.map(s=>s.toFixed(4))} )`;switch(Ve.getTransfer(i)){case Rr:return[n,"LinearTransferOETF"];case je:return[n,"sRGBTransferOETF"];default:return be("WebGLProgram: Unsupported color space: ",i),[n,"LinearTransferOETF"]}}(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var qp={[hl]:"Linear",[ul]:"Reinhard",[dl]:"Cineon",[pl]:"ACESFilmic",[fl]:"AgX",[gl]:"Neutral",[ml]:"Custom"};function Yp(r,e){let t=qp[e];return t===void 0?(be("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+r+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Xa=new w;function Zp(){return Ve.getLuminanceCoefficients(Xa),["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${Xa.x.toFixed(4)}, ${Xa.y.toFixed(4)}, ${Xa.z.toFixed(4)} );`,"	return dot( weights, rgb );","}"].join(`
`)}function is(r){return r!==""}function Bu(r,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function zu(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Jp=/^[ \t]*#include +<([\w\d./]+)>/gm;function Tc(r){return r.replace(Jp,$p)}var Kp=new Map;function $p(r,e){let t=Fe[e];if(t===void 0){let i=Kp.get(e);if(i===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");t=Fe[i],be('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i)}return Tc(t)}var Qp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Gu(r){return r.replace(Qp,em)}function em(r,e,t,i){let n="";for(let s=parseInt(e);s<parseInt(t);s++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return n}function Vu(r){let e=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var tm={[Jr]:"SHADOWMAP_TYPE_PCF",[cr]:"SHADOWMAP_TYPE_VSM"},im={[ur]:"ENVMAP_TYPE_CUBE",[xn]:"ENVMAP_TYPE_CUBE",[$r]:"ENVMAP_TYPE_CUBE_UV"},nm={[xn]:"ENVMAP_MODE_REFRACTION"},rm={[tu]:"ENVMAP_BLENDING_MULTIPLY",[iu]:"ENVMAP_BLENDING_MIX",[nu]:"ENVMAP_BLENDING_ADD"};function sm(r,e,t,i){let n=r.getContext(),s=t.defines,a=t.vertexShader,o=t.fragmentShader,c=function(H){return tm[H.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}(t),l=function(H){return H.envMap===!1?"ENVMAP_TYPE_CUBE":im[H.envMapMode]||"ENVMAP_TYPE_CUBE"}(t),h=function(H){return H.envMap===!1?"ENVMAP_MODE_REFLECTION":nm[H.envMapMode]||"ENVMAP_MODE_REFLECTION"}(t),d=function(H){return H.envMap===!1?"ENVMAP_BLENDING_NONE":rm[H.combine]||"ENVMAP_BLENDING_NONE"}(t),p=function(H){let B=H.envMapCubeUVHeight;if(B===null)return null;let Z=Math.log2(B)-2,X=1/B;return{texelWidth:1/(3*Math.max(Math.pow(2,Z),112)),texelHeight:X,maxMip:Z}}(t),u=function(H){return[H.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",H.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(is).join(`
`)}(t),g=function(H){let B=[];for(let Z in H){let X=H[Z];X!==!1&&B.push("#define "+Z+" "+X)}return B.join(`
`)}(s),m=n.createProgram(),v,f,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(is).join(`
`),v.length>0&&(v+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(is).join(`
`),f.length>0&&(f+=`
`)):(v=[Vu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(is).join(`
`),f=[Vu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ai?"#define TONE_MAPPING":"",t.toneMapping!==ai?Fe.tonemapping_pars_fragment:"",t.toneMapping!==ai?Yp("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Fe.colorspace_pars_fragment,jp("linearToOutputTexel",t.outputColorSpace),Zp(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(is).join(`
`)),a=Tc(a),a=Bu(a,t),a=zu(a,t),o=Tc(o),o=Bu(o,t),o=zu(o,t),a=Gu(a),o=Gu(o),t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,v=[u,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,f=["#define varying in",t.glslVersion===ic?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ic?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let x=_+v+a,S=_+f+o,E=Uu(n,n.VERTEX_SHADER,x),M=Uu(n,n.FRAGMENT_SHADER,S);function P(H){if(r.debug.checkShaderErrors){let B=n.getProgramInfoLog(m)||"",Z=n.getShaderInfoLog(E)||"",X=n.getShaderInfoLog(M)||"",V=B.trim(),q=Z.trim(),U=X.trim(),W=!0,re=!0;if(n.getProgramParameter(m,n.LINK_STATUS)===!1)if(W=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(n,m,E,M);else{let Me=Fu(n,E,"vertex"),ge=Fu(n,M,"fragment");Te("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(m,n.VALIDATE_STATUS)+`

Material Name: `+H.name+`
Material Type: `+H.type+`

Program Info Log: `+V+`
`+Me+`
`+ge)}else V!==""?be("WebGLProgram: Program Info Log:",V):q!==""&&U!==""||(re=!1);re&&(H.diagnostics={runnable:W,programLog:V,vertexShader:{log:q,prefix:v},fragmentShader:{log:U,prefix:f}})}n.deleteShader(E),n.deleteShader(M),F=new fr(n,m),L=function(B,Z){let X={},V=B.getProgramParameter(Z,B.ACTIVE_ATTRIBUTES);for(let q=0;q<V;q++){let U=B.getActiveAttrib(Z,q),W=U.name,re=1;U.type===B.FLOAT_MAT2&&(re=2),U.type===B.FLOAT_MAT3&&(re=3),U.type===B.FLOAT_MAT4&&(re=4),X[W]={type:U.type,location:B.getAttribLocation(Z,W),locationSize:re}}return X}(n,m)}let F,L;n.attachShader(m,E),n.attachShader(m,M),t.index0AttributeName!==void 0?n.bindAttribLocation(m,0,t.index0AttributeName):t.hasPositionAttribute===!0&&n.bindAttribLocation(m,0,"position"),n.linkProgram(m),this.getUniforms=function(){return F===void 0&&P(this),F},this.getAttributes=function(){return L===void 0&&P(this),L};let N=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return N===!1&&(N=n.getProgramParameter(m,37297)),N},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(m),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Xp++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=E,this.fragmentShader=M,this}var am=0,Ec=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let n=this._getShaderCacheForMaterial(e);return n.has(t)===!1&&(n.add(t),t.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new wc(e),t.set(e,i)),i}},wc=class{constructor(e){this.id=am++,this.code=e,this.usedTimes=0}};function om(r,e,t,i,n,s){let a=new Jn,o=new Ec,c=new Set,l=[],h=new Map,d=i.logarithmicDepthBuffer,p=i.precision,u={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(m){return c.add(m),m===0?"uv":`uv${m}`}return{getParameters:function(m,v,f,_,x,S){let E=_.fog,M=x.geometry,P=m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial?_.environment:null,F=m.isMeshStandardMaterial||m.isMeshLambertMaterial&&!m.envMap||m.isMeshPhongMaterial&&!m.envMap,L=e.get(m.envMap||P,F),N=L&&L.mapping===$r?L.image.height:null,H=u[m.type];m.precision!==null&&(p=i.getMaxPrecision(m.precision),p!==m.precision&&be("WebGLProgram.getParameters:",m.precision,"not supported, using",p,"instead."));let B=M.morphAttributes.position||M.morphAttributes.normal||M.morphAttributes.color,Z=B!==void 0?B.length:0,X,V,q,U,W=0;if(M.morphAttributes.position!==void 0&&(W=1),M.morphAttributes.normal!==void 0&&(W=2),M.morphAttributes.color!==void 0&&(W=3),H){let Jt=yi[H];X=Jt.vertexShader,V=Jt.fragmentShader}else{X=m.vertexShader,V=m.fragmentShader;let Jt=o.getVertexShaderStage(m),an=o.getFragmentShaderStage(m);o.update(m,Jt,an),q=Jt.id,U=an.id}let re=r.getRenderTarget(),Me=r.state.buffers.depth.getReversed(),ge=x.isInstancedMesh===!0,_e=x.isBatchedMesh===!0,ie=!!m.map,he=!!m.matcap,le=!!L,me=!!m.aoMap,De=!!m.lightMap,ee=!!m.bumpMap&&m.wireframe===!1,R=!!m.normalMap,b=!!m.displacementMap,C=!!m.emissiveMap,O=!!m.metalnessMap,y=!!m.roughnessMap,D=m.anisotropy>0,I=m.clearcoat>0,A=m.dispersion>0,k=m.iridescence>0,j=m.sheen>0,J=m.transmission>0,se=D&&!!m.anisotropyMap,ve=I&&!!m.clearcoatMap,ye=I&&!!m.clearcoatNormalMap,ue=I&&!!m.clearcoatRoughnessMap,Ae=k&&!!m.iridescenceMap,te=k&&!!m.iridescenceThicknessMap,ae=j&&!!m.sheenColorMap,ne=j&&!!m.sheenRoughnessMap,pe=!!m.specularMap,Ke=!!m.specularColorMap,Xe=!!m.specularIntensityMap,ot=J&&!!m.transmissionMap,Ct=J&&!!m.thicknessMap,Se=!!m.gradientMap,Ye=!!m.alphaMap,Be=m.alphaTest>0,yt=!!m.alphaHash,$e=!!m.extensions,dt=ai;m.toneMapped&&(re!==null&&re.isXRRenderTarget!==!0||(dt=r.toneMapping));let at={shaderID:H,shaderType:m.type,shaderName:m.name,vertexShader:X,fragmentShader:V,defines:m.defines,customVertexShaderID:q,customFragmentShaderID:U,isRawShaderMaterial:m.isRawShaderMaterial===!0,glslVersion:m.glslVersion,precision:p,batching:_e,batchingColor:_e&&x._colorsTexture!==null,instancing:ge,instancingColor:ge&&x.instanceColor!==null,instancingMorph:ge&&x.morphTexture!==null,outputColorSpace:re===null?r.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:Ve.workingColorSpace,alphaToCoverage:!!m.alphaToCoverage,map:ie,matcap:he,envMap:le,envMapMode:le&&L.mapping,envMapCubeUVHeight:N,aoMap:me,lightMap:De,bumpMap:ee,normalMap:R,displacementMap:b,emissiveMap:C,normalMapObjectSpace:R&&m.normalMapType===ou,normalMapTangentSpace:R&&m.normalMapType===tc,packedNormalMap:R&&m.normalMapType===tc&&(Xt=m.normalMap.format,Xt===bn||Xt===Ga||Xt===Va),metalnessMap:O,roughnessMap:y,anisotropy:D,anisotropyMap:se,clearcoat:I,clearcoatMap:ve,clearcoatNormalMap:ye,clearcoatRoughnessMap:ue,dispersion:A,iridescence:k,iridescenceMap:Ae,iridescenceThicknessMap:te,sheen:j,sheenColorMap:ae,sheenRoughnessMap:ne,specularMap:pe,specularColorMap:Ke,specularIntensityMap:Xe,transmission:J,transmissionMap:ot,thicknessMap:Ct,gradientMap:Se,opaque:m.transparent===!1&&m.blending===Kr&&m.alphaToCoverage===!1,alphaMap:Ye,alphaTest:Be,alphaHash:yt,combine:m.combine,mapUv:ie&&g(m.map.channel),aoMapUv:me&&g(m.aoMap.channel),lightMapUv:De&&g(m.lightMap.channel),bumpMapUv:ee&&g(m.bumpMap.channel),normalMapUv:R&&g(m.normalMap.channel),displacementMapUv:b&&g(m.displacementMap.channel),emissiveMapUv:C&&g(m.emissiveMap.channel),metalnessMapUv:O&&g(m.metalnessMap.channel),roughnessMapUv:y&&g(m.roughnessMap.channel),anisotropyMapUv:se&&g(m.anisotropyMap.channel),clearcoatMapUv:ve&&g(m.clearcoatMap.channel),clearcoatNormalMapUv:ye&&g(m.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ue&&g(m.clearcoatRoughnessMap.channel),iridescenceMapUv:Ae&&g(m.iridescenceMap.channel),iridescenceThicknessMapUv:te&&g(m.iridescenceThicknessMap.channel),sheenColorMapUv:ae&&g(m.sheenColorMap.channel),sheenRoughnessMapUv:ne&&g(m.sheenRoughnessMap.channel),specularMapUv:pe&&g(m.specularMap.channel),specularColorMapUv:Ke&&g(m.specularColorMap.channel),specularIntensityMapUv:Xe&&g(m.specularIntensityMap.channel),transmissionMapUv:ot&&g(m.transmissionMap.channel),thicknessMapUv:Ct&&g(m.thicknessMap.channel),alphaMapUv:Ye&&g(m.alphaMap.channel),vertexTangents:!!M.attributes.tangent&&(R||D),vertexNormals:!!M.attributes.normal,vertexColors:m.vertexColors,vertexAlphas:m.vertexColors===!0&&!!M.attributes.color&&M.attributes.color.itemSize===4,pointsUvs:x.isPoints===!0&&!!M.attributes.uv&&(ie||Ye),fog:!!E,useFog:m.fog===!0,fogExp2:!!E&&E.isFogExp2,flatShading:m.wireframe===!1&&(m.flatShading===!0||M.attributes.normal===void 0&&R===!1&&(m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshStandardMaterial||m.isMeshPhysicalMaterial)),sizeAttenuation:m.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Me,skinning:x.isSkinnedMesh===!0,hasPositionAttribute:M.attributes.position!==void 0,morphTargets:M.morphAttributes.position!==void 0,morphNormals:M.morphAttributes.normal!==void 0,morphColors:M.morphAttributes.color!==void 0,morphTargetsCount:Z,morphTextureStride:W,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numLightProbeGrids:S.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:m.dithering,shadowMapEnabled:r.shadowMap.enabled&&f.length>0,shadowMapType:r.shadowMap.type,toneMapping:dt,decodeVideoTexture:ie&&m.map.isVideoTexture===!0&&Ve.getTransfer(m.map.colorSpace)===je,decodeVideoTextureEmissive:C&&m.emissiveMap.isVideoTexture===!0&&Ve.getTransfer(m.emissiveMap.colorSpace)===je,premultipliedAlpha:m.premultipliedAlpha,doubleSided:m.side===Dt,flipSided:m.side===Ut,useDepthPacking:m.depthPacking>=0,depthPacking:m.depthPacking||0,index0AttributeName:m.index0AttributeName,extensionClipCullDistance:$e&&m.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:($e&&m.extensions.multiDraw===!0||_e)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:m.customProgramCacheKey()};var Xt;return at.vertexUv1s=c.has(1),at.vertexUv2s=c.has(2),at.vertexUv3s=c.has(3),c.clear(),at},getProgramCacheKey:function(m){let v=[];if(m.shaderID?v.push(m.shaderID):(v.push(m.customVertexShaderID),v.push(m.customFragmentShaderID)),m.defines!==void 0)for(let f in m.defines)v.push(f),v.push(m.defines[f]);return m.isRawShaderMaterial===!1&&(function(f,_){f.push(_.precision),f.push(_.outputColorSpace),f.push(_.envMapMode),f.push(_.envMapCubeUVHeight),f.push(_.mapUv),f.push(_.alphaMapUv),f.push(_.lightMapUv),f.push(_.aoMapUv),f.push(_.bumpMapUv),f.push(_.normalMapUv),f.push(_.displacementMapUv),f.push(_.emissiveMapUv),f.push(_.metalnessMapUv),f.push(_.roughnessMapUv),f.push(_.anisotropyMapUv),f.push(_.clearcoatMapUv),f.push(_.clearcoatNormalMapUv),f.push(_.clearcoatRoughnessMapUv),f.push(_.iridescenceMapUv),f.push(_.iridescenceThicknessMapUv),f.push(_.sheenColorMapUv),f.push(_.sheenRoughnessMapUv),f.push(_.specularMapUv),f.push(_.specularColorMapUv),f.push(_.specularIntensityMapUv),f.push(_.transmissionMapUv),f.push(_.thicknessMapUv),f.push(_.combine),f.push(_.fogExp2),f.push(_.sizeAttenuation),f.push(_.morphTargetsCount),f.push(_.morphAttributeCount),f.push(_.numDirLights),f.push(_.numPointLights),f.push(_.numSpotLights),f.push(_.numSpotLightMaps),f.push(_.numHemiLights),f.push(_.numRectAreaLights),f.push(_.numDirLightShadows),f.push(_.numPointLightShadows),f.push(_.numSpotLightShadows),f.push(_.numSpotLightShadowsWithMaps),f.push(_.numLightProbes),f.push(_.shadowMapType),f.push(_.toneMapping),f.push(_.numClippingPlanes),f.push(_.numClipIntersection),f.push(_.depthPacking)}(v,m),function(f,_){a.disableAll(),_.instancing&&a.enable(0),_.instancingColor&&a.enable(1),_.instancingMorph&&a.enable(2),_.matcap&&a.enable(3),_.envMap&&a.enable(4),_.normalMapObjectSpace&&a.enable(5),_.normalMapTangentSpace&&a.enable(6),_.clearcoat&&a.enable(7),_.iridescence&&a.enable(8),_.alphaTest&&a.enable(9),_.vertexColors&&a.enable(10),_.vertexAlphas&&a.enable(11),_.vertexUv1s&&a.enable(12),_.vertexUv2s&&a.enable(13),_.vertexUv3s&&a.enable(14),_.vertexTangents&&a.enable(15),_.anisotropy&&a.enable(16),_.alphaHash&&a.enable(17),_.batching&&a.enable(18),_.dispersion&&a.enable(19),_.batchingColor&&a.enable(20),_.gradientMap&&a.enable(21),_.packedNormalMap&&a.enable(22),_.vertexNormals&&a.enable(23),f.push(a.mask),a.disableAll(),_.fog&&a.enable(0),_.useFog&&a.enable(1),_.flatShading&&a.enable(2),_.logarithmicDepthBuffer&&a.enable(3),_.reversedDepthBuffer&&a.enable(4),_.skinning&&a.enable(5),_.morphTargets&&a.enable(6),_.morphNormals&&a.enable(7),_.morphColors&&a.enable(8),_.premultipliedAlpha&&a.enable(9),_.shadowMapEnabled&&a.enable(10),_.doubleSided&&a.enable(11),_.flipSided&&a.enable(12),_.useDepthPacking&&a.enable(13),_.dithering&&a.enable(14),_.transmission&&a.enable(15),_.sheen&&a.enable(16),_.opaque&&a.enable(17),_.pointsUvs&&a.enable(18),_.decodeVideoTexture&&a.enable(19),_.decodeVideoTextureEmissive&&a.enable(20),_.alphaToCoverage&&a.enable(21),_.numLightProbeGrids>0&&a.enable(22),_.hasPositionAttribute&&a.enable(23),f.push(a.mask)}(v,m),v.push(r.outputColorSpace)),v.push(m.customProgramCacheKey),v.join()},getUniforms:function(m){let v=u[m.type],f;if(v){let _=yi[v];f=Su.clone(_.uniforms)}else f=m.uniforms;return f},acquireProgram:function(m,v){let f=h.get(v);return f!==void 0?++f.usedTimes:(f=new sm(r,v,m,n),l.push(f),h.set(v,f)),f},releaseProgram:function(m){if(--m.usedTimes===0){let v=l.indexOf(m);l[v]=l[l.length-1],l.pop(),h.delete(m.cacheKey),m.destroy()}},releaseShaderCache:function(m){o.remove(m)},programs:l,dispose:function(){o.dispose()}}}function lm(){let r=new WeakMap;return{has:function(e){return r.has(e)},get:function(e){let t=r.get(e);return t===void 0&&(t={},r.set(e,t)),t},remove:function(e){r.delete(e)},update:function(e,t,i){r.get(e)[t]=i},dispose:function(){r=new WeakMap}}}function cm(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.materialVariant!==e.materialVariant?r.materialVariant-e.materialVariant:r.z!==e.z?r.z-e.z:r.id-e.id}function ku(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function Hu(){let r=[],e=0,t=[],i=[],n=[];function s(o){let c=0;return o.isInstancedMesh&&(c+=2),o.isSkinnedMesh&&(c+=1),c}function a(o,c,l,h,d,p){let u=r[e];return u===void 0?(u={id:o.id,object:o,geometry:c,material:l,materialVariant:s(o),groupOrder:h,renderOrder:o.renderOrder,z:d,group:p},r[e]=u):(u.id=o.id,u.object=o,u.geometry=c,u.material=l,u.materialVariant=s(o),u.groupOrder=h,u.renderOrder=o.renderOrder,u.z=d,u.group=p),e++,u}return{opaque:t,transmissive:i,transparent:n,init:function(){e=0,t.length=0,i.length=0,n.length=0},push:function(o,c,l,h,d,p){let u=a(o,c,l,h,d,p);l.transmission>0?i.push(u):l.transparent===!0?n.push(u):t.push(u)},unshift:function(o,c,l,h,d,p){let u=a(o,c,l,h,d,p);l.transmission>0?i.unshift(u):l.transparent===!0?n.unshift(u):t.unshift(u)},finish:function(){for(let o=e,c=r.length;o<c;o++){let l=r[o];if(l.id===null)break;l.id=null,l.object=null,l.geometry=null,l.material=null,l.group=null}},sort:function(o,c,l){t.length>1&&t.sort(o||cm),i.length>1&&i.sort(c||ku),n.length>1&&n.sort(c||ku),l&&(t.reverse(),i.reverse(),n.reverse())}}}function hm(){let r=new WeakMap;return{get:function(e,t){let i=r.get(e),n;return i===void 0?(n=new Hu,r.set(e,[n])):t>=i.length?(n=new Hu,i.push(n)):n=i[t],n},dispose:function(){r=new WeakMap}}}function um(){let r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new w,color:new Oe};break;case"SpotLight":t={position:new w,direction:new w,color:new Oe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new w,color:new Oe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new w,skyColor:new Oe,groundColor:new Oe};break;case"RectAreaLight":t={color:new Oe,position:new w,halfWidth:new w,halfHeight:new w}}return r[e.id]=t,t}}}var dm=0;function pm(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function mm(r){let e=new um,t=function(){let o={};return{get:function(c){if(o[c.id]!==void 0)return o[c.id];let l;switch(c.type){case"DirectionalLight":case"SpotLight":l={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q};break;case"PointLight":l={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q,shadowCameraNear:1,shadowCameraFar:1e3}}return o[c.id]=l,l}}}(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let o=0;o<9;o++)i.probe.push(new w);let n=new w,s=new Ne,a=new Ne;return{setup:function(o){let c=0,l=0,h=0;for(let P=0;P<9;P++)i.probe[P].set(0,0,0);let d=0,p=0,u=0,g=0,m=0,v=0,f=0,_=0,x=0,S=0,E=0;o.sort(pm);for(let P=0,F=o.length;P<F;P++){let L=o[P],N=L.color,H=L.intensity,B=L.distance,Z=null;if(L.shadow&&L.shadow.map&&(Z=L.shadow.map.texture.format===bn?L.shadow.map.texture:L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)c+=N.r*H,l+=N.g*H,h+=N.b*H;else if(L.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(L.sh.coefficients[X],H);E++}else if(L.isDirectionalLight){let X=e.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let V=L.shadow,q=t.get(L);q.shadowIntensity=V.intensity,q.shadowBias=V.bias,q.shadowNormalBias=V.normalBias,q.shadowRadius=V.radius,q.shadowMapSize=V.mapSize,i.directionalShadow[d]=q,i.directionalShadowMap[d]=Z,i.directionalShadowMatrix[d]=L.shadow.matrix,v++}i.directional[d]=X,d++}else if(L.isSpotLight){let X=e.get(L);X.position.setFromMatrixPosition(L.matrixWorld),X.color.copy(N).multiplyScalar(H),X.distance=B,X.coneCos=Math.cos(L.angle),X.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),X.decay=L.decay,i.spot[u]=X;let V=L.shadow;if(L.map&&(i.spotLightMap[x]=L.map,x++,V.updateMatrices(L),L.castShadow&&S++),i.spotLightMatrix[u]=V.matrix,L.castShadow){let q=t.get(L);q.shadowIntensity=V.intensity,q.shadowBias=V.bias,q.shadowNormalBias=V.normalBias,q.shadowRadius=V.radius,q.shadowMapSize=V.mapSize,i.spotShadow[u]=q,i.spotShadowMap[u]=Z,_++}u++}else if(L.isRectAreaLight){let X=e.get(L);X.color.copy(N).multiplyScalar(H),X.halfWidth.set(.5*L.width,0,0),X.halfHeight.set(0,.5*L.height,0),i.rectArea[g]=X,g++}else if(L.isPointLight){let X=e.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity),X.distance=L.distance,X.decay=L.decay,L.castShadow){let V=L.shadow,q=t.get(L);q.shadowIntensity=V.intensity,q.shadowBias=V.bias,q.shadowNormalBias=V.normalBias,q.shadowRadius=V.radius,q.shadowMapSize=V.mapSize,q.shadowCameraNear=V.camera.near,q.shadowCameraFar=V.camera.far,i.pointShadow[p]=q,i.pointShadowMap[p]=Z,i.pointShadowMatrix[p]=L.shadow.matrix,f++}i.point[p]=X,p++}else if(L.isHemisphereLight){let X=e.get(L);X.skyColor.copy(L.color).multiplyScalar(H),X.groundColor.copy(L.groundColor).multiplyScalar(H),i.hemi[m]=X,m++}}g>0&&(r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ce.LTC_FLOAT_1,i.rectAreaLTC2=ce.LTC_FLOAT_2):(i.rectAreaLTC1=ce.LTC_HALF_1,i.rectAreaLTC2=ce.LTC_HALF_2)),i.ambient[0]=c,i.ambient[1]=l,i.ambient[2]=h;let M=i.hash;M.directionalLength===d&&M.pointLength===p&&M.spotLength===u&&M.rectAreaLength===g&&M.hemiLength===m&&M.numDirectionalShadows===v&&M.numPointShadows===f&&M.numSpotShadows===_&&M.numSpotMaps===x&&M.numLightProbes===E||(i.directional.length=d,i.spot.length=u,i.rectArea.length=g,i.point.length=p,i.hemi.length=m,i.directionalShadow.length=v,i.directionalShadowMap.length=v,i.pointShadow.length=f,i.pointShadowMap.length=f,i.spotShadow.length=_,i.spotShadowMap.length=_,i.directionalShadowMatrix.length=v,i.pointShadowMatrix.length=f,i.spotLightMatrix.length=_+x-S,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=S,i.numLightProbes=E,M.directionalLength=d,M.pointLength=p,M.spotLength=u,M.rectAreaLength=g,M.hemiLength=m,M.numDirectionalShadows=v,M.numPointShadows=f,M.numSpotShadows=_,M.numSpotMaps=x,M.numLightProbes=E,i.version=dm++)},setupView:function(o,c){let l=0,h=0,d=0,p=0,u=0,g=c.matrixWorldInverse;for(let m=0,v=o.length;m<v;m++){let f=o[m];if(f.isDirectionalLight){let _=i.directional[l];_.direction.setFromMatrixPosition(f.matrixWorld),n.setFromMatrixPosition(f.target.matrixWorld),_.direction.sub(n),_.direction.transformDirection(g),l++}else if(f.isSpotLight){let _=i.spot[d];_.position.setFromMatrixPosition(f.matrixWorld),_.position.applyMatrix4(g),_.direction.setFromMatrixPosition(f.matrixWorld),n.setFromMatrixPosition(f.target.matrixWorld),_.direction.sub(n),_.direction.transformDirection(g),d++}else if(f.isRectAreaLight){let _=i.rectArea[p];_.position.setFromMatrixPosition(f.matrixWorld),_.position.applyMatrix4(g),a.identity(),s.copy(f.matrixWorld),s.premultiply(g),a.extractRotation(s),_.halfWidth.set(.5*f.width,0,0),_.halfHeight.set(0,.5*f.height,0),_.halfWidth.applyMatrix4(a),_.halfHeight.applyMatrix4(a),p++}else if(f.isPointLight){let _=i.point[h];_.position.setFromMatrixPosition(f.matrixWorld),_.position.applyMatrix4(g),h++}else if(f.isHemisphereLight){let _=i.hemi[u];_.direction.setFromMatrixPosition(f.matrixWorld),_.direction.transformDirection(g),u++}}},state:i}}function Wu(r){let e=new mm(r),t=[],i=[],n=[],s={lightsArray:t,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:function(a){s.camera=a,t.length=0,i.length=0,n.length=0},state:s,setupLights:function(){e.setup(t)},setupLightsView:function(a){e.setupView(t,a)},pushLight:function(a){t.push(a)},pushShadow:function(a){i.push(a)},pushLightProbeGrid:function(a){n.push(a)}}}function fm(r){let e=new WeakMap;return{get:function(t,i=0){let n=e.get(t),s;return n===void 0?(s=new Wu(r),e.set(t,[s])):i>=n.length?(s=new Wu(r),n.push(s)):s=n[i],s},dispose:function(){e=new WeakMap}}}var gm=[new w(1,0,0),new w(-1,0,0),new w(0,1,0),new w(0,-1,0),new w(0,0,1),new w(0,0,-1)],_m=[new w(0,-1,0),new w(0,-1,0),new w(0,0,1),new w(0,0,-1),new w(0,-1,0),new w(0,-1,0)],Xu=new Ne,ns=new w,yc=new w;function vm(r,e,t){let i=new Ii,n=new Q,s=new Q,a=new Ze,o=new pa,c=new ma,l={},h=t.maxTextureSize,d={[nn]:Ut,[Ut]:nn,[Dt]:Dt},p=new Ht({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Q},radius:{value:4}},vertexShader:`void main() {
	gl_Position = vec4( position, 1.0 );
}`,fragmentShader:`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`}),u=p.clone();u.defines.HORIZONTAL_PASS=1;let g=new et;g.setAttribute("position",new Gt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let m=new ze(g,p),v=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Jr;let f=this.type;function _(M,P){let F=e.update(m);p.defines.VSM_SAMPLES!==M.blurSamples&&(p.defines.VSM_SAMPLES=M.blurSamples,u.defines.VSM_SAMPLES=M.blurSamples,p.needsUpdate=!0,u.needsUpdate=!0),M.mapPass===null&&(M.mapPass=new Vt(n.x,n.y,{format:bn,type:_i})),p.uniforms.shadow_pass.value=M.map.depthTexture,p.uniforms.resolution.value=M.mapSize,p.uniforms.radius.value=M.radius,r.setRenderTarget(M.mapPass),r.clear(),r.renderBufferDirect(P,null,F,p,m,null),u.uniforms.shadow_pass.value=M.mapPass.texture,u.uniforms.resolution.value=M.mapSize,u.uniforms.radius.value=M.radius,r.setRenderTarget(M.map),r.clear(),r.renderBufferDirect(P,null,F,u,m,null)}function x(M,P,F,L){let N=null,H=F.isPointLight===!0?M.customDistanceMaterial:M.customDepthMaterial;if(H!==void 0)N=H;else if(N=F.isPointLight===!0?c:o,r.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){let B=N.uuid,Z=P.uuid,X=l[B];X===void 0&&(X={},l[B]=X);let V=X[Z];V===void 0&&(V=N.clone(),X[Z]=V,P.addEventListener("dispose",E)),N=V}return N.visible=P.visible,N.wireframe=P.wireframe,N.side=L===cr?P.shadowSide!==null?P.shadowSide:P.side:P.shadowSide!==null?P.shadowSide:d[P.side],N.alphaMap=P.alphaMap,N.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,N.map=P.map,N.clipShadows=P.clipShadows,N.clippingPlanes=P.clippingPlanes,N.clipIntersection=P.clipIntersection,N.displacementMap=P.displacementMap,N.displacementScale=P.displacementScale,N.displacementBias=P.displacementBias,N.wireframeLinewidth=P.wireframeLinewidth,N.linewidth=P.linewidth,F.isPointLight===!0&&N.isMeshDistanceMaterial===!0&&(r.properties.get(N).light=F),N}function S(M,P,F,L,N){if(M.visible===!1)return;if(M.layers.test(P.layers)&&(M.isMesh||M.isLine||M.isPoints)&&(M.castShadow||M.receiveShadow&&N===cr)&&(!M.frustumCulled||i.intersectsObject(M))){M.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse,M.matrixWorld);let B=e.update(M),Z=M.material;if(Array.isArray(Z)){let X=B.groups;for(let V=0,q=X.length;V<q;V++){let U=X[V],W=Z[U.materialIndex];if(W&&W.visible){let re=x(M,W,L,N);M.onBeforeShadow(r,M,P,F,B,re,U),r.renderBufferDirect(F,null,B,re,M,U),M.onAfterShadow(r,M,P,F,B,re,U)}}}else if(Z.visible){let X=x(M,Z,L,N);M.onBeforeShadow(r,M,P,F,B,X,null),r.renderBufferDirect(F,null,B,X,M,null),M.onAfterShadow(r,M,P,F,B,X,null)}}let H=M.children;for(let B=0,Z=H.length;B<Z;B++)S(H[B],P,F,L,N)}function E(M){M.target.removeEventListener("dispose",E);for(let P in l){let F=l[P],L=M.target.uuid;L in F&&(F[L].dispose(),delete F[L])}}this.render=function(M,P,F){if(v.enabled===!1||v.autoUpdate===!1&&v.needsUpdate===!1||M.length===0)return;this.type===Nh&&(be("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Jr);let L=r.getRenderTarget(),N=r.getActiveCubeFace(),H=r.getActiveMipmapLevel(),B=r.state;B.setBlending(gi),B.buffers.depth.getReversed()===!0?B.buffers.color.setClear(0,0,0,0):B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);let Z=f!==this.type;Z&&P.traverse(function(X){X.material&&(Array.isArray(X.material)?X.material.forEach(V=>V.needsUpdate=!0):X.material.needsUpdate=!0)});for(let X=0,V=M.length;X<V;X++){let q=M[X],U=q.shadow;if(U===void 0){be("WebGLShadowMap:",q,"has no shadow.");continue}if(U.autoUpdate===!1&&U.needsUpdate===!1)continue;n.copy(U.mapSize);let W=U.getFrameExtents();n.multiply(W),s.copy(U.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(s.x=Math.floor(h/W.x),n.x=s.x*W.x,U.mapSize.x=s.x),n.y>h&&(s.y=Math.floor(h/W.y),n.y=s.y*W.y,U.mapSize.y=s.y));let re=r.state.buffers.depth.getReversed();if(U.camera._reversedDepth=re,U.map===null||Z===!0){if(U.map!==null&&(U.map.depthTexture!==null&&(U.map.depthTexture.dispose(),U.map.depthTexture=null),U.map.dispose()),this.type===cr){if(q.isPointLight){be("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}U.map=new Vt(n.x,n.y,{format:bn,type:_i,minFilter:wt,magFilter:wt,generateMipmaps:!1}),U.map.texture.name=q.name+".shadowMap",U.map.depthTexture=new Li(n.x,n.y,oi),U.map.depthTexture.name=q.name+".shadowMapDepth",U.map.depthTexture.format=rn,U.map.depthTexture.compareFunction=null,U.map.depthTexture.minFilter=Zt,U.map.depthTexture.magFilter=Zt}else q.isPointLight?(U.map=new Ya(n.x),U.map.depthTexture=new Js(n.x,Bi)):(U.map=new Vt(n.x,n.y),U.map.depthTexture=new Li(n.x,n.y,Bi)),U.map.depthTexture.name=q.name+".shadowMap",U.map.depthTexture.format=rn,this.type===Jr?(U.map.depthTexture.compareFunction=re?Ha:ka,U.map.depthTexture.minFilter=wt,U.map.depthTexture.magFilter=wt):(U.map.depthTexture.compareFunction=null,U.map.depthTexture.minFilter=Zt,U.map.depthTexture.magFilter=Zt);U.camera.updateProjectionMatrix()}let Me=U.map.isWebGLCubeRenderTarget?6:1;for(let ge=0;ge<Me;ge++){if(U.map.isWebGLCubeRenderTarget)r.setRenderTarget(U.map,ge),r.clear();else{ge===0&&(r.setRenderTarget(U.map),r.clear());let _e=U.getViewport(ge);a.set(s.x*_e.x,s.y*_e.y,s.x*_e.z,s.y*_e.w),B.viewport(a)}if(q.isPointLight){let _e=U.camera,ie=U.matrix,he=q.distance||_e.far;he!==_e.far&&(_e.far=he,_e.updateProjectionMatrix()),ns.setFromMatrixPosition(q.matrixWorld),_e.position.copy(ns),yc.copy(_e.position),yc.add(gm[ge]),_e.up.copy(_m[ge]),_e.lookAt(yc),_e.updateMatrixWorld(),ie.makeTranslation(-ns.x,-ns.y,-ns.z),Xu.multiplyMatrices(_e.projectionMatrix,_e.matrixWorldInverse),U._frustum.setFromProjectionMatrix(Xu,_e.coordinateSystem,_e.reversedDepth)}else U.updateMatrices(q);i=U.getFrustum(),S(P,F,U.camera,q,this.type)}U.isPointLightShadow!==!0&&this.type===cr&&_(U,F),U.needsUpdate=!1}f=this.type,v.needsUpdate=!1,r.setRenderTarget(L,N,H)}}function ym(r,e){let t=new function(){let y=!1,D=new Ze,I=null,A=new Ze(0,0,0,0);return{setMask:function(k){I===k||y||(r.colorMask(k,k,k,k),I=k)},setLocked:function(k){y=k},setClear:function(k,j,J,se,ve){ve===!0&&(k*=se,j*=se,J*=se),D.set(k,j,J,se),A.equals(D)===!1&&(r.clearColor(k,j,J,se),A.copy(D))},reset:function(){y=!1,I=null,A.set(-1,0,0,0)}}},i=new function(){let y=!1,D=!1,I=null,A=null,k=null;return{setReversed:function(j){if(D!==j){let J=e.get("EXT_clip_control");j?J.clipControlEXT(J.LOWER_LEFT_EXT,J.ZERO_TO_ONE_EXT):J.clipControlEXT(J.LOWER_LEFT_EXT,J.NEGATIVE_ONE_TO_ONE_EXT),D=j;let se=k;k=null,this.setClear(se)}},getReversed:function(){return D},setTest:function(j){j?le(r.DEPTH_TEST):me(r.DEPTH_TEST)},setMask:function(j){I===j||y||(r.depthMask(j),I=j)},setFunc:function(j){if(D&&(j=_u[j]),A!==j){switch(j){case nl:r.depthFunc(r.NEVER);break;case rl:r.depthFunc(r.ALWAYS);break;case sl:r.depthFunc(r.LESS);break;case Ca:r.depthFunc(r.LEQUAL);break;case al:r.depthFunc(r.EQUAL);break;case ol:r.depthFunc(r.GEQUAL);break;case ll:r.depthFunc(r.GREATER);break;case cl:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}A=j}},setLocked:function(j){y=j},setClear:function(j){k!==j&&(k=j,D&&(j=1-j),r.clearDepth(j))},reset:function(){y=!1,I=null,A=null,k=null,D=!1}}},n=new function(){let y=!1,D=null,I=null,A=null,k=null,j=null,J=null,se=null,ve=null;return{setTest:function(ye){y||(ye?le(r.STENCIL_TEST):me(r.STENCIL_TEST))},setMask:function(ye){D===ye||y||(r.stencilMask(ye),D=ye)},setFunc:function(ye,ue,Ae){I===ye&&A===ue&&k===Ae||(r.stencilFunc(ye,ue,Ae),I=ye,A=ue,k=Ae)},setOp:function(ye,ue,Ae){j===ye&&J===ue&&se===Ae||(r.stencilOp(ye,ue,Ae),j=ye,J=ue,se=Ae)},setLocked:function(ye){y=ye},setClear:function(ye){ve!==ye&&(r.clearStencil(ye),ve=ye)},reset:function(){y=!1,D=null,I=null,A=null,k=null,j=null,J=null,se=null,ve=null}}},s=new WeakMap,a=new WeakMap,o={},c={},l={},h=new WeakMap,d=[],p=null,u=!1,g=null,m=null,v=null,f=null,_=null,x=null,S=null,E=new Oe(0,0,0),M=0,P=!1,F=null,L=null,N=null,H=null,B=null,Z=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS),X=!1,V=0,q=r.getParameter(r.VERSION);q.indexOf("WebGL")!==-1?(V=parseFloat(/^WebGL (\d)/.exec(q)[1]),X=V>=1):q.indexOf("OpenGL ES")!==-1&&(V=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),X=V>=2);let U=null,W={},re=r.getParameter(r.SCISSOR_BOX),Me=r.getParameter(r.VIEWPORT),ge=new Ze().fromArray(re),_e=new Ze().fromArray(Me);function ie(y,D,I,A){let k=new Uint8Array(4),j=r.createTexture();r.bindTexture(y,j),r.texParameteri(y,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(y,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let J=0;J<I;J++)y===r.TEXTURE_3D||y===r.TEXTURE_2D_ARRAY?r.texImage3D(D,0,r.RGBA,1,1,A,0,r.RGBA,r.UNSIGNED_BYTE,k):r.texImage2D(D+J,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,k);return j}let he={};function le(y){o[y]!==!0&&(r.enable(y),o[y]=!0)}function me(y){o[y]!==!1&&(r.disable(y),o[y]=!1)}he[r.TEXTURE_2D]=ie(r.TEXTURE_2D,r.TEXTURE_2D,1),he[r.TEXTURE_CUBE_MAP]=ie(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),he[r.TEXTURE_2D_ARRAY]=ie(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),he[r.TEXTURE_3D]=ie(r.TEXTURE_3D,r.TEXTURE_3D,1,1),t.setClear(0,0,0,1),i.setClear(1),n.setClear(0),le(r.DEPTH_TEST),i.setFunc(Ca),b(!1),C(Qo),le(r.CULL_FACE),R(gi);let De={[hr]:r.FUNC_ADD,[Oh]:r.FUNC_SUBTRACT,[Fh]:r.FUNC_REVERSE_SUBTRACT};De[Bh]=r.MIN,De[zh]=r.MAX;let ee={[Gh]:r.ZERO,[Vh]:r.ONE,[kh]:r.SRC_COLOR,[Wh]:r.SRC_ALPHA,[Jh]:r.SRC_ALPHA_SATURATE,[Yh]:r.DST_COLOR,[jh]:r.DST_ALPHA,[Hh]:r.ONE_MINUS_SRC_COLOR,[Xh]:r.ONE_MINUS_SRC_ALPHA,[Zh]:r.ONE_MINUS_DST_COLOR,[qh]:r.ONE_MINUS_DST_ALPHA,[Kh]:r.CONSTANT_COLOR,[$h]:r.ONE_MINUS_CONSTANT_COLOR,[Qh]:r.CONSTANT_ALPHA,[eu]:r.ONE_MINUS_CONSTANT_ALPHA};function R(y,D,I,A,k,j,J,se,ve,ye){if(y!==gi){if(u===!1&&(le(r.BLEND),u=!0),y===Uh)k=k||D,j=j||I,J=J||A,D===m&&k===_||(r.blendEquationSeparate(De[D],De[k]),m=D,_=k),I===v&&A===f&&j===x&&J===S||(r.blendFuncSeparate(ee[I],ee[A],ee[j],ee[J]),v=I,f=A,x=j,S=J),se.equals(E)!==!1&&ve===M||(r.blendColor(se.r,se.g,se.b,ve),E.copy(se),M=ve),g=y,P=!1;else if(y!==g||ye!==P){if(m===hr&&_===hr||(r.blendEquation(r.FUNC_ADD),m=hr,_=hr),ye)switch(y){case Kr:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case el:r.blendFunc(r.ONE,r.ONE);break;case tl:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case il:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:Te("WebGLState: Invalid blending: ",y)}else switch(y){case Kr:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case el:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case tl:Te("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case il:Te("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Te("WebGLState: Invalid blending: ",y)}v=null,f=null,x=null,S=null,E.set(0,0,0),M=0,g=y,P=ye}}else u===!0&&(me(r.BLEND),u=!1)}function b(y){F!==y&&(y?r.frontFace(r.CW):r.frontFace(r.CCW),F=y)}function C(y){y!==Lh?(le(r.CULL_FACE),y!==L&&(y===Qo?r.cullFace(r.BACK):y===Dh?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):me(r.CULL_FACE),L=y}function O(y,D,I){y?(le(r.POLYGON_OFFSET_FILL),H===D&&B===I||(H=D,B=I,i.getReversed()&&(D=-D),r.polygonOffset(D,I))):me(r.POLYGON_OFFSET_FILL)}return{buffers:{color:t,depth:i,stencil:n},enable:le,disable:me,bindFramebuffer:function(y,D){return l[y]!==D&&(r.bindFramebuffer(y,D),l[y]=D,y===r.DRAW_FRAMEBUFFER&&(l[r.FRAMEBUFFER]=D),y===r.FRAMEBUFFER&&(l[r.DRAW_FRAMEBUFFER]=D),!0)},drawBuffers:function(y,D){let I=d,A=!1;if(y){I=h.get(D),I===void 0&&(I=[],h.set(D,I));let k=y.textures;if(I.length!==k.length||I[0]!==r.COLOR_ATTACHMENT0){for(let j=0,J=k.length;j<J;j++)I[j]=r.COLOR_ATTACHMENT0+j;I.length=k.length,A=!0}}else I[0]!==r.BACK&&(I[0]=r.BACK,A=!0);A&&r.drawBuffers(I)},useProgram:function(y){return p!==y&&(r.useProgram(y),p=y,!0)},setBlending:R,setMaterial:function(y,D){y.side===Dt?me(r.CULL_FACE):le(r.CULL_FACE);let I=y.side===Ut;D&&(I=!I),b(I),y.blending===Kr&&y.transparent===!1?R(gi):R(y.blending,y.blendEquation,y.blendSrc,y.blendDst,y.blendEquationAlpha,y.blendSrcAlpha,y.blendDstAlpha,y.blendColor,y.blendAlpha,y.premultipliedAlpha),i.setFunc(y.depthFunc),i.setTest(y.depthTest),i.setMask(y.depthWrite),t.setMask(y.colorWrite);let A=y.stencilWrite;n.setTest(A),A&&(n.setMask(y.stencilWriteMask),n.setFunc(y.stencilFunc,y.stencilRef,y.stencilFuncMask),n.setOp(y.stencilFail,y.stencilZFail,y.stencilZPass)),O(y.polygonOffset,y.polygonOffsetFactor,y.polygonOffsetUnits),y.alphaToCoverage===!0?le(r.SAMPLE_ALPHA_TO_COVERAGE):me(r.SAMPLE_ALPHA_TO_COVERAGE)},setFlipSided:b,setCullFace:C,setLineWidth:function(y){y!==N&&(X&&r.lineWidth(y),N=y)},setPolygonOffset:O,setScissorTest:function(y){y?le(r.SCISSOR_TEST):me(r.SCISSOR_TEST)},activeTexture:function(y){y===void 0&&(y=r.TEXTURE0+Z-1),U!==y&&(r.activeTexture(y),U=y)},bindTexture:function(y,D,I){I===void 0&&(I=U===null?r.TEXTURE0+Z-1:U);let A=W[I];A===void 0&&(A={type:void 0,texture:void 0},W[I]=A),A.type===y&&A.texture===D||(U!==I&&(r.activeTexture(I),U=I),r.bindTexture(y,D||he[y]),A.type=y,A.texture=D)},unbindTexture:function(){let y=W[U];y!==void 0&&y.type!==void 0&&(r.bindTexture(y.type,null),y.type=void 0,y.texture=void 0)},compressedTexImage2D:function(){try{r.compressedTexImage2D(...arguments)}catch(y){Te("WebGLState:",y)}},compressedTexImage3D:function(){try{r.compressedTexImage3D(...arguments)}catch(y){Te("WebGLState:",y)}},texImage2D:function(){try{r.texImage2D(...arguments)}catch(y){Te("WebGLState:",y)}},texImage3D:function(){try{r.texImage3D(...arguments)}catch(y){Te("WebGLState:",y)}},pixelStorei:function(y,D){c[y]!==D&&(r.pixelStorei(y,D),c[y]=D)},getParameter:function(y){return c[y]!==void 0?c[y]:r.getParameter(y)},updateUBOMapping:function(y,D){let I=a.get(D);I===void 0&&(I=new WeakMap,a.set(D,I));let A=I.get(y);A===void 0&&(A=r.getUniformBlockIndex(D,y.name),I.set(y,A))},uniformBlockBinding:function(y,D){let I=a.get(D).get(y);s.get(D)!==I&&(r.uniformBlockBinding(D,I,y.__bindingPointIndex),s.set(D,I))},texStorage2D:function(){try{r.texStorage2D(...arguments)}catch(y){Te("WebGLState:",y)}},texStorage3D:function(){try{r.texStorage3D(...arguments)}catch(y){Te("WebGLState:",y)}},texSubImage2D:function(){try{r.texSubImage2D(...arguments)}catch(y){Te("WebGLState:",y)}},texSubImage3D:function(){try{r.texSubImage3D(...arguments)}catch(y){Te("WebGLState:",y)}},compressedTexSubImage2D:function(){try{r.compressedTexSubImage2D(...arguments)}catch(y){Te("WebGLState:",y)}},compressedTexSubImage3D:function(){try{r.compressedTexSubImage3D(...arguments)}catch(y){Te("WebGLState:",y)}},scissor:function(y){ge.equals(y)===!1&&(r.scissor(y.x,y.y,y.z,y.w),ge.copy(y))},viewport:function(y){_e.equals(y)===!1&&(r.viewport(y.x,y.y,y.z,y.w),_e.copy(y))},reset:function(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),i.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),r.pixelStorei(r.PACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,r.BROWSER_DEFAULT_WEBGL),r.pixelStorei(r.PACK_ROW_LENGTH,0),r.pixelStorei(r.PACK_SKIP_PIXELS,0),r.pixelStorei(r.PACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_ROW_LENGTH,0),r.pixelStorei(r.UNPACK_IMAGE_HEIGHT,0),r.pixelStorei(r.UNPACK_SKIP_PIXELS,0),r.pixelStorei(r.UNPACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_SKIP_IMAGES,0),o={},c={},U=null,W={},l={},h=new WeakMap,d=[],p=null,u=!1,g=null,m=null,v=null,f=null,_=null,x=null,S=null,E=new Oe(0,0,0),M=0,P=!1,F=null,L=null,N=null,H=null,B=null,ge.set(0,0,r.canvas.width,r.canvas.height),_e.set(0,0,r.canvas.width,r.canvas.height),t.reset(),i.reset(),n.reset()}}}function xm(r,e,t,i,n,s,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator<"u"&&/OculusBrowser/g.test(navigator.userAgent),l=new Q,h=new WeakMap,d=new Set,p,u=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(R,b){return g?new OffscreenCanvas(R,b):Pr("canvas")}function v(R,b,C){let O=1,y=ee(R);if((y.width>C||y.height>C)&&(O=C/Math.max(y.width,y.height)),O<1){if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let D=Math.floor(O*y.width),I=Math.floor(O*y.height);p===void 0&&(p=m(D,I));let A=b?m(D,I):p;return A.width=D,A.height=I,A.getContext("2d").drawImage(R,0,0,D,I),be("WebGLRenderer: Texture has been resized from ("+y.width+"x"+y.height+") to ("+D+"x"+I+")."),A}return"data"in R&&be("WebGLRenderer: Image in DataTexture is too big ("+y.width+"x"+y.height+")."),R}return R}function f(R){return R.generateMipmaps}function _(R){r.generateMipmap(R)}function x(R){return R.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?r.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function S(R,b,C,O,y,D=!1){if(R!==null){if(r[R]!==void 0)return r[R];be("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let I;O&&(I=e.get("EXT_texture_norm16"),I||be("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let A=b;if(b===r.RED&&(C===r.FLOAT&&(A=r.R32F),C===r.HALF_FLOAT&&(A=r.R16F),C===r.UNSIGNED_BYTE&&(A=r.R8),C===r.UNSIGNED_SHORT&&I&&(A=I.R16_EXT),C===r.SHORT&&I&&(A=I.R16_SNORM_EXT)),b===r.RED_INTEGER&&(C===r.UNSIGNED_BYTE&&(A=r.R8UI),C===r.UNSIGNED_SHORT&&(A=r.R16UI),C===r.UNSIGNED_INT&&(A=r.R32UI),C===r.BYTE&&(A=r.R8I),C===r.SHORT&&(A=r.R16I),C===r.INT&&(A=r.R32I)),b===r.RG&&(C===r.FLOAT&&(A=r.RG32F),C===r.HALF_FLOAT&&(A=r.RG16F),C===r.UNSIGNED_BYTE&&(A=r.RG8),C===r.UNSIGNED_SHORT&&I&&(A=I.RG16_EXT),C===r.SHORT&&I&&(A=I.RG16_SNORM_EXT)),b===r.RG_INTEGER&&(C===r.UNSIGNED_BYTE&&(A=r.RG8UI),C===r.UNSIGNED_SHORT&&(A=r.RG16UI),C===r.UNSIGNED_INT&&(A=r.RG32UI),C===r.BYTE&&(A=r.RG8I),C===r.SHORT&&(A=r.RG16I),C===r.INT&&(A=r.RG32I)),b===r.RGB_INTEGER&&(C===r.UNSIGNED_BYTE&&(A=r.RGB8UI),C===r.UNSIGNED_SHORT&&(A=r.RGB16UI),C===r.UNSIGNED_INT&&(A=r.RGB32UI),C===r.BYTE&&(A=r.RGB8I),C===r.SHORT&&(A=r.RGB16I),C===r.INT&&(A=r.RGB32I)),b===r.RGBA_INTEGER&&(C===r.UNSIGNED_BYTE&&(A=r.RGBA8UI),C===r.UNSIGNED_SHORT&&(A=r.RGBA16UI),C===r.UNSIGNED_INT&&(A=r.RGBA32UI),C===r.BYTE&&(A=r.RGBA8I),C===r.SHORT&&(A=r.RGBA16I),C===r.INT&&(A=r.RGBA32I)),b===r.RGB&&(C===r.UNSIGNED_SHORT&&I&&(A=I.RGB16_EXT),C===r.SHORT&&I&&(A=I.RGB16_SNORM_EXT),C===r.UNSIGNED_INT_5_9_9_9_REV&&(A=r.RGB9_E5),C===r.UNSIGNED_INT_10F_11F_11F_REV&&(A=r.R11F_G11F_B10F)),b===r.RGBA){let k=D?Rr:Ve.getTransfer(y);C===r.FLOAT&&(A=r.RGBA32F),C===r.HALF_FLOAT&&(A=r.RGBA16F),C===r.UNSIGNED_BYTE&&(A=k===je?r.SRGB8_ALPHA8:r.RGBA8),C===r.UNSIGNED_SHORT&&I&&(A=I.RGBA16_EXT),C===r.SHORT&&I&&(A=I.RGBA16_SNORM_EXT),C===r.UNSIGNED_SHORT_4_4_4_4&&(A=r.RGBA4),C===r.UNSIGNED_SHORT_5_5_5_1&&(A=r.RGB5_A1)}return A!==r.R16F&&A!==r.R32F&&A!==r.RG16F&&A!==r.RG32F&&A!==r.RGBA16F&&A!==r.RGBA32F||e.get("EXT_color_buffer_float"),A}function E(R,b){let C;return R?b===null||b===Bi||b===pr?C=r.DEPTH24_STENCIL8:b===oi?C=r.DEPTH32F_STENCIL8:b===dr&&(C=r.DEPTH24_STENCIL8,be("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Bi||b===pr?C=r.DEPTH_COMPONENT24:b===oi?C=r.DEPTH_COMPONENT32F:b===dr&&(C=r.DEPTH_COMPONENT16),C}function M(R,b){return f(R)===!0||R.isFramebufferTexture&&R.minFilter!==Zt&&R.minFilter!==wt?Math.log2(Math.max(b.width,b.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?b.mipmaps.length:1}function P(R){let b=R.target;b.removeEventListener("dispose",P),function(C){let O=i.get(C);if(O.__webglInit===void 0)return;let y=C.source,D=u.get(y);if(D){let I=D[O.__cacheKey];I.usedTimes--,I.usedTimes===0&&L(C),Object.keys(D).length===0&&u.delete(y)}i.remove(C)}(b),b.isVideoTexture&&h.delete(b),b.isHTMLTexture&&d.delete(b)}function F(R){let b=R.target;b.removeEventListener("dispose",F),function(C){let O=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let D=0;D<6;D++){if(Array.isArray(O.__webglFramebuffer[D]))for(let I=0;I<O.__webglFramebuffer[D].length;I++)r.deleteFramebuffer(O.__webglFramebuffer[D][I]);else r.deleteFramebuffer(O.__webglFramebuffer[D]);O.__webglDepthbuffer&&r.deleteRenderbuffer(O.__webglDepthbuffer[D])}else{if(Array.isArray(O.__webglFramebuffer))for(let D=0;D<O.__webglFramebuffer.length;D++)r.deleteFramebuffer(O.__webglFramebuffer[D]);else r.deleteFramebuffer(O.__webglFramebuffer);if(O.__webglDepthbuffer&&r.deleteRenderbuffer(O.__webglDepthbuffer),O.__webglMultisampledFramebuffer&&r.deleteFramebuffer(O.__webglMultisampledFramebuffer),O.__webglColorRenderbuffer)for(let D=0;D<O.__webglColorRenderbuffer.length;D++)O.__webglColorRenderbuffer[D]&&r.deleteRenderbuffer(O.__webglColorRenderbuffer[D]);O.__webglDepthRenderbuffer&&r.deleteRenderbuffer(O.__webglDepthRenderbuffer)}let y=C.textures;for(let D=0,I=y.length;D<I;D++){let A=i.get(y[D]);A.__webglTexture&&(r.deleteTexture(A.__webglTexture),a.memory.textures--),i.remove(y[D])}i.remove(C)}(b)}function L(R){let b=i.get(R);r.deleteTexture(b.__webglTexture);let C=R.source;delete u.get(C)[b.__cacheKey],a.memory.textures--}let N=0;function H(R,b){let C=i.get(R);if(R.isVideoTexture&&function(O){let y=a.render.frame;h.get(O)!==y&&(h.set(O,y),O.update())}(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&C.__version!==R.version){let O=R.image;if(O===null)be("WebGLRenderer: Texture marked for update but no image data found.");else{if(O.complete!==!1)return void W(C,R,b);be("WebGLRenderer: Texture marked for update but image is incomplete")}}else R.isExternalTexture&&(C.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(r.TEXTURE_2D,C.__webglTexture,r.TEXTURE0+b)}let B={[zs]:r.REPEAT,[Zi]:r.CLAMP_TO_EDGE,[Gs]:r.MIRRORED_REPEAT},Z={[Zt]:r.NEAREST,[ru]:r.NEAREST_MIPMAP_NEAREST,[Qr]:r.NEAREST_MIPMAP_LINEAR,[wt]:r.LINEAR,[Ia]:r.LINEAR_MIPMAP_NEAREST,[Mn]:r.LINEAR_MIPMAP_LINEAR},X={[lu]:r.NEVER,[pu]:r.ALWAYS,[cu]:r.LESS,[ka]:r.LEQUAL,[hu]:r.EQUAL,[Ha]:r.GEQUAL,[uu]:r.GREATER,[du]:r.NOTEQUAL};function V(R,b){if(b.type!==oi||e.has("OES_texture_float_linear")!==!1||b.magFilter!==wt&&b.magFilter!==Ia&&b.magFilter!==Qr&&b.magFilter!==Mn&&b.minFilter!==wt&&b.minFilter!==Ia&&b.minFilter!==Qr&&b.minFilter!==Mn||be("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(R,r.TEXTURE_WRAP_S,B[b.wrapS]),r.texParameteri(R,r.TEXTURE_WRAP_T,B[b.wrapT]),R!==r.TEXTURE_3D&&R!==r.TEXTURE_2D_ARRAY||r.texParameteri(R,r.TEXTURE_WRAP_R,B[b.wrapR]),r.texParameteri(R,r.TEXTURE_MAG_FILTER,Z[b.magFilter]),r.texParameteri(R,r.TEXTURE_MIN_FILTER,Z[b.minFilter]),b.compareFunction&&(r.texParameteri(R,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(R,r.TEXTURE_COMPARE_FUNC,X[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Zt||b.minFilter!==Qr&&b.minFilter!==Mn||b.type===oi&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||i.get(b).__currentAnisotropy){let C=e.get("EXT_texture_filter_anisotropic");r.texParameterf(R,C.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,n.getMaxAnisotropy())),i.get(b).__currentAnisotropy=b.anisotropy}}}function q(R,b){let C=!1;R.__webglInit===void 0&&(R.__webglInit=!0,b.addEventListener("dispose",P));let O=b.source,y=u.get(O);y===void 0&&(y={},u.set(O,y));let D=function(I){let A=[];return A.push(I.wrapS),A.push(I.wrapT),A.push(I.wrapR||0),A.push(I.magFilter),A.push(I.minFilter),A.push(I.anisotropy),A.push(I.internalFormat),A.push(I.format),A.push(I.type),A.push(I.generateMipmaps),A.push(I.premultiplyAlpha),A.push(I.flipY),A.push(I.unpackAlignment),A.push(I.colorSpace),A.join()}(b);if(D!==R.__cacheKey){y[D]===void 0&&(y[D]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,C=!0),y[D].usedTimes++;let I=y[R.__cacheKey];I!==void 0&&(y[R.__cacheKey].usedTimes--,I.usedTimes===0&&L(b)),R.__cacheKey=D,R.__webglTexture=y[D].texture}return C}function U(R,b,C){return Math.floor(Math.floor(R/C)/b)}function W(R,b,C){let O=r.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(O=r.TEXTURE_2D_ARRAY),b.isData3DTexture&&(O=r.TEXTURE_3D);let y=q(R,b),D=b.source;t.bindTexture(O,R.__webglTexture,r.TEXTURE0+C);let I=i.get(D);if(D.version!==I.__version||y===!0){if(t.activeTexture(r.TEXTURE0+C),!(typeof ImageBitmap<"u"&&b.image instanceof ImageBitmap)){let ae=Ve.getPrimaries(Ve.workingColorSpace),ne=b.colorSpace===Tn?null:Ve.getPrimaries(b.colorSpace),pe=b.colorSpace===Tn||ae===ne?r.NONE:r.BROWSER_DEFAULT_WEBGL;t.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),t.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),t.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,pe)}t.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment);let A=v(b.image,!1,n.maxTextureSize);A=De(b,A);let k=s.convert(b.format,b.colorSpace),j=s.convert(b.type),J,se=S(b.internalFormat,k,j,b.normalized,b.colorSpace,b.isVideoTexture);V(O,b);let ve=b.mipmaps,ye=b.isVideoTexture!==!0,ue=I.__version===void 0||y===!0,Ae=D.dataReady,te=M(b,A);if(b.isDepthTexture)se=E(b.format===Sn,b.type),ue&&(ye?t.texStorage2D(r.TEXTURE_2D,1,se,A.width,A.height):t.texImage2D(r.TEXTURE_2D,0,se,A.width,A.height,0,k,j,null));else if(b.isDataTexture)if(ve.length>0){ye&&ue&&t.texStorage2D(r.TEXTURE_2D,te,se,ve[0].width,ve[0].height);for(let ae=0,ne=ve.length;ae<ne;ae++)J=ve[ae],ye?Ae&&t.texSubImage2D(r.TEXTURE_2D,ae,0,0,J.width,J.height,k,j,J.data):t.texImage2D(r.TEXTURE_2D,ae,se,J.width,J.height,0,k,j,J.data);b.generateMipmaps=!1}else ye?(ue&&t.texStorage2D(r.TEXTURE_2D,te,se,A.width,A.height),Ae&&function(ae,ne,pe,Ke){let Xe=ae.updateRanges;if(Xe.length===0)t.texSubImage2D(r.TEXTURE_2D,0,0,0,ne.width,ne.height,pe,Ke,ne.data);else{Xe.sort((Be,yt)=>Be.start-yt.start);let ot=0;for(let Be=1;Be<Xe.length;Be++){let yt=Xe[ot],$e=Xe[Be],dt=yt.start+yt.count,at=U($e.start,ne.width,4),Xt=U(yt.start,ne.width,4);$e.start<=dt+1&&at===Xt&&U($e.start+$e.count-1,ne.width,4)===at?yt.count=Math.max(yt.count,$e.start+$e.count-yt.start):(++ot,Xe[ot]=$e)}Xe.length=ot+1;let Ct=t.getParameter(r.UNPACK_ROW_LENGTH),Se=t.getParameter(r.UNPACK_SKIP_PIXELS),Ye=t.getParameter(r.UNPACK_SKIP_ROWS);t.pixelStorei(r.UNPACK_ROW_LENGTH,ne.width);for(let Be=0,yt=Xe.length;Be<yt;Be++){let $e=Xe[Be],dt=Math.floor($e.start/4),at=Math.ceil($e.count/4),Xt=dt%ne.width,Jt=Math.floor(dt/ne.width),an=at;t.pixelStorei(r.UNPACK_SKIP_PIXELS,Xt),t.pixelStorei(r.UNPACK_SKIP_ROWS,Jt),t.texSubImage2D(r.TEXTURE_2D,0,Xt,Jt,an,1,pe,Ke,ne.data)}ae.clearUpdateRanges(),t.pixelStorei(r.UNPACK_ROW_LENGTH,Ct),t.pixelStorei(r.UNPACK_SKIP_PIXELS,Se),t.pixelStorei(r.UNPACK_SKIP_ROWS,Ye)}}(b,A,k,j)):t.texImage2D(r.TEXTURE_2D,0,se,A.width,A.height,0,k,j,A.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){ye&&ue&&t.texStorage3D(r.TEXTURE_2D_ARRAY,te,se,ve[0].width,ve[0].height,A.depth);for(let ae=0,ne=ve.length;ae<ne;ae++)if(J=ve[ae],b.format!==li)if(k!==null)if(ye){if(Ae)if(b.layerUpdates.size>0){let pe=lc(J.width,J.height,b.format,b.type);for(let Ke of b.layerUpdates){let Xe=J.data.subarray(Ke*pe/J.data.BYTES_PER_ELEMENT,(Ke+1)*pe/J.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,ae,0,0,Ke,J.width,J.height,1,k,Xe)}b.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,ae,0,0,0,J.width,J.height,A.depth,k,J.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,ae,se,J.width,J.height,A.depth,0,J.data,0,0);else be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ye?Ae&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,ae,0,0,0,J.width,J.height,A.depth,k,j,J.data):t.texImage3D(r.TEXTURE_2D_ARRAY,ae,se,J.width,J.height,A.depth,0,k,j,J.data)}else{ye&&ue&&t.texStorage2D(r.TEXTURE_2D,te,se,ve[0].width,ve[0].height);for(let ae=0,ne=ve.length;ae<ne;ae++)J=ve[ae],b.format!==li?k!==null?ye?Ae&&t.compressedTexSubImage2D(r.TEXTURE_2D,ae,0,0,J.width,J.height,k,J.data):t.compressedTexImage2D(r.TEXTURE_2D,ae,se,J.width,J.height,0,J.data):be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ye?Ae&&t.texSubImage2D(r.TEXTURE_2D,ae,0,0,J.width,J.height,k,j,J.data):t.texImage2D(r.TEXTURE_2D,ae,se,J.width,J.height,0,k,j,J.data)}else if(b.isDataArrayTexture)if(ye){if(ue&&t.texStorage3D(r.TEXTURE_2D_ARRAY,te,se,A.width,A.height,A.depth),Ae)if(b.layerUpdates.size>0){let ae=lc(A.width,A.height,b.format,b.type);for(let ne of b.layerUpdates){let pe=A.data.subarray(ne*ae/A.data.BYTES_PER_ELEMENT,(ne+1)*ae/A.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,ne,A.width,A.height,1,k,j,pe)}b.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,A.width,A.height,A.depth,k,j,A.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,se,A.width,A.height,A.depth,0,k,j,A.data);else if(b.isData3DTexture)ye?(ue&&t.texStorage3D(r.TEXTURE_3D,te,se,A.width,A.height,A.depth),Ae&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,A.width,A.height,A.depth,k,j,A.data)):t.texImage3D(r.TEXTURE_3D,0,se,A.width,A.height,A.depth,0,k,j,A.data);else if(b.isFramebufferTexture){if(ue)if(ye)t.texStorage2D(r.TEXTURE_2D,te,se,A.width,A.height);else{let ae=A.width,ne=A.height;for(let pe=0;pe<te;pe++)t.texImage2D(r.TEXTURE_2D,pe,se,ae,ne,0,k,j,null),ae>>=1,ne>>=1}}else if(b.isHTMLTexture){if("texElementImage2D"in r){let ae=r.canvas;if(ae.hasAttribute("layoutsubtree")||ae.setAttribute("layoutsubtree","true"),A.parentNode!==ae)return ae.appendChild(A),d.add(b),ae.onpaint=ne=>{let pe=ne.changedElements;for(let Ke of d)pe.includes(Ke.image)&&(Ke.needsUpdate=!0)},void ae.requestPaint();if(r.texElementImage2D.length===3)r.texElementImage2D(r.TEXTURE_2D,r.RGBA8,A);else{let pe=r.RGBA,Ke=r.RGBA,Xe=r.UNSIGNED_BYTE;r.texElementImage2D(r.TEXTURE_2D,0,pe,Ke,Xe,A)}r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)}}else if(ve.length>0){if(ye&&ue){let ae=ee(ve[0]);t.texStorage2D(r.TEXTURE_2D,te,se,ae.width,ae.height)}for(let ae=0,ne=ve.length;ae<ne;ae++)J=ve[ae],ye?Ae&&t.texSubImage2D(r.TEXTURE_2D,ae,0,0,k,j,J):t.texImage2D(r.TEXTURE_2D,ae,se,k,j,J);b.generateMipmaps=!1}else if(ye){if(ue){let ae=ee(A);t.texStorage2D(r.TEXTURE_2D,te,se,ae.width,ae.height)}Ae&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,k,j,A)}else t.texImage2D(r.TEXTURE_2D,0,se,k,j,A);f(b)&&_(O),I.__version=D.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function re(R,b,C,O,y,D){let I=s.convert(C.format,C.colorSpace),A=s.convert(C.type),k=S(C.internalFormat,I,A,C.normalized,C.colorSpace),j=i.get(b),J=i.get(C);if(J.__renderTarget=b,!j.__hasExternalTextures){let se=Math.max(1,b.width>>D),ve=Math.max(1,b.height>>D);y===r.TEXTURE_3D||y===r.TEXTURE_2D_ARRAY?t.texImage3D(y,D,k,se,ve,b.depth,0,I,A,null):t.texImage2D(y,D,k,se,ve,0,I,A,null)}t.bindFramebuffer(r.FRAMEBUFFER,R),me(b)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,O,y,J.__webglTexture,0,le(b)):(y===r.TEXTURE_2D||y>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&y<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,O,y,J.__webglTexture,D),t.bindFramebuffer(r.FRAMEBUFFER,null)}function Me(R,b,C){if(r.bindRenderbuffer(r.RENDERBUFFER,R),b.depthBuffer){let O=b.depthTexture,y=O&&O.isDepthTexture?O.type:null,D=E(b.stencilBuffer,y),I=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;me(b)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,le(b),D,b.width,b.height):C?r.renderbufferStorageMultisample(r.RENDERBUFFER,le(b),D,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,D,b.width,b.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,I,r.RENDERBUFFER,R)}else{let O=b.textures;for(let y=0;y<O.length;y++){let D=O[y],I=s.convert(D.format,D.colorSpace),A=s.convert(D.type),k=S(D.internalFormat,I,A,D.normalized,D.colorSpace);me(b)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,le(b),k,b.width,b.height):C?r.renderbufferStorageMultisample(r.RENDERBUFFER,le(b),k,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,k,b.width,b.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function ge(R,b,C){let O=b.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(r.FRAMEBUFFER,R),!b.depthTexture||!b.depthTexture.isDepthTexture)throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let y=i.get(b.depthTexture);if(y.__renderTarget=b,y.__webglTexture&&b.depthTexture.image.width===b.width&&b.depthTexture.image.height===b.height||(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),O){if(y.__webglInit===void 0&&(y.__webglInit=!0,b.depthTexture.addEventListener("dispose",P)),y.__webglTexture===void 0){y.__webglTexture=r.createTexture(),t.bindTexture(r.TEXTURE_CUBE_MAP,y.__webglTexture),V(r.TEXTURE_CUBE_MAP,b.depthTexture);let j=s.convert(b.depthTexture.format),J=s.convert(b.depthTexture.type),se;b.depthTexture.format===rn?se=r.DEPTH_COMPONENT24:b.depthTexture.format===Sn&&(se=r.DEPTH24_STENCIL8);for(let ve=0;ve<6;ve++)r.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,se,b.width,b.height,0,j,J,null)}}else H(b.depthTexture,0);let D=y.__webglTexture,I=le(b),A=O?r.TEXTURE_CUBE_MAP_POSITIVE_X+C:r.TEXTURE_2D,k=b.depthTexture.format===Sn?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;if(b.depthTexture.format===rn)me(b)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,k,A,D,0,I):r.framebufferTexture2D(r.FRAMEBUFFER,k,A,D,0);else{if(b.depthTexture.format!==Sn)throw new Error("THREE.WebGLTextures: Unknown depthTexture format.");me(b)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,k,A,D,0,I):r.framebufferTexture2D(r.FRAMEBUFFER,k,A,D,0)}}function _e(R){let b=i.get(R),C=R.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==R.depthTexture){let O=R.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),O){let y=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,O.removeEventListener("dispose",y)};O.addEventListener("dispose",y),b.__depthDisposeCallback=y}b.__boundDepthTexture=O}if(R.depthTexture&&!b.__autoAllocateDepthBuffer)if(C)for(let O=0;O<6;O++)ge(b.__webglFramebuffer[O],R,O);else{let O=R.texture.mipmaps;O&&O.length>0?ge(b.__webglFramebuffer[0],R,0):ge(b.__webglFramebuffer,R,0)}else if(C){b.__webglDepthbuffer=[];for(let O=0;O<6;O++)if(t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[O]),b.__webglDepthbuffer[O]===void 0)b.__webglDepthbuffer[O]=r.createRenderbuffer(),Me(b.__webglDepthbuffer[O],R,!1);else{let y=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,D=b.__webglDepthbuffer[O];r.bindRenderbuffer(r.RENDERBUFFER,D),r.framebufferRenderbuffer(r.FRAMEBUFFER,y,r.RENDERBUFFER,D)}}else{let O=R.texture.mipmaps;if(O&&O.length>0?t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[0]):t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=r.createRenderbuffer(),Me(b.__webglDepthbuffer,R,!1);else{let y=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,D=b.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,D),r.framebufferRenderbuffer(r.FRAMEBUFFER,y,r.RENDERBUFFER,D)}}t.bindFramebuffer(r.FRAMEBUFFER,null)}let ie=[],he=[];function le(R){return Math.min(n.maxSamples,R.samples)}function me(R){let b=i.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function De(R,b){let C=R.colorSpace,O=R.format,y=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||C!==Cr&&C!==Tn&&(Ve.getTransfer(C)===je?O===li&&y===Wt||be("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Te("WebGLTextures: Unsupported texture color space:",C)),b}function ee(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(l.width=R.naturalWidth||R.width,l.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(l.width=R.displayWidth,l.height=R.displayHeight):(l.width=R.width,l.height=R.height),l}this.allocateTextureUnit=function(){let R=N;return R>=n.maxTextures&&be("WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+n.maxTextures),N+=1,R},this.resetTextureUnits=function(){N=0},this.getTextureUnits=function(){return N},this.setTextureUnits=function(R){N=R},this.setTexture2D=H,this.setTexture2DArray=function(R,b){let C=i.get(R);R.isRenderTargetTexture===!1&&R.version>0&&C.__version!==R.version?W(C,R,b):(R.isExternalTexture&&(C.__webglTexture=R.sourceTexture?R.sourceTexture:null),t.bindTexture(r.TEXTURE_2D_ARRAY,C.__webglTexture,r.TEXTURE0+b))},this.setTexture3D=function(R,b){let C=i.get(R);R.isRenderTargetTexture===!1&&R.version>0&&C.__version!==R.version?W(C,R,b):t.bindTexture(r.TEXTURE_3D,C.__webglTexture,r.TEXTURE0+b)},this.setTextureCube=function(R,b){let C=i.get(R);R.isCubeDepthTexture!==!0&&R.version>0&&C.__version!==R.version?function(O,y,D){if(y.image.length!==6)return;let I=q(O,y),A=y.source;t.bindTexture(r.TEXTURE_CUBE_MAP,O.__webglTexture,r.TEXTURE0+D);let k=i.get(A);if(A.version!==k.__version||I===!0){t.activeTexture(r.TEXTURE0+D);let j=Ve.getPrimaries(Ve.workingColorSpace),J=y.colorSpace===Tn?null:Ve.getPrimaries(y.colorSpace),se=y.colorSpace===Tn||j===J?r.NONE:r.BROWSER_DEFAULT_WEBGL;t.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(r.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,se);let ve=y.isCompressedTexture||y.image[0].isCompressedTexture,ye=y.image[0]&&y.image[0].isDataTexture,ue=[];for(let Se=0;Se<6;Se++)ue[Se]=ve||ye?ye?y.image[Se].image:y.image[Se]:v(y.image[Se],!0,n.maxCubemapSize),ue[Se]=De(y,ue[Se]);let Ae=ue[0],te=s.convert(y.format,y.colorSpace),ae=s.convert(y.type),ne=S(y.internalFormat,te,ae,y.normalized,y.colorSpace),pe=y.isVideoTexture!==!0,Ke=k.__version===void 0||I===!0,Xe=A.dataReady,ot,Ct=M(y,Ae);if(V(r.TEXTURE_CUBE_MAP,y),ve){pe&&Ke&&t.texStorage2D(r.TEXTURE_CUBE_MAP,Ct,ne,Ae.width,Ae.height);for(let Se=0;Se<6;Se++){ot=ue[Se].mipmaps;for(let Ye=0;Ye<ot.length;Ye++){let Be=ot[Ye];y.format!==li?te!==null?pe?Xe&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ye,0,0,Be.width,Be.height,te,Be.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ye,ne,Be.width,Be.height,0,Be.data):be("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):pe?Xe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ye,0,0,Be.width,Be.height,te,ae,Be.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ye,ne,Be.width,Be.height,0,te,ae,Be.data)}}}else{if(ot=y.mipmaps,pe&&Ke){ot.length>0&&Ct++;let Se=ee(ue[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,Ct,ne,Se.width,Se.height)}for(let Se=0;Se<6;Se++)if(ye){pe?Xe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,0,0,ue[Se].width,ue[Se].height,te,ae,ue[Se].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,ne,ue[Se].width,ue[Se].height,0,te,ae,ue[Se].data);for(let Ye=0;Ye<ot.length;Ye++){let Be=ot[Ye].image[Se].image;pe?Xe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ye+1,0,0,Be.width,Be.height,te,ae,Be.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ye+1,ne,Be.width,Be.height,0,te,ae,Be.data)}}else{pe?Xe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,0,0,te,ae,ue[Se]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,ne,te,ae,ue[Se]);for(let Ye=0;Ye<ot.length;Ye++){let Be=ot[Ye];pe?Xe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ye+1,0,0,te,ae,Be.image[Se]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ye+1,ne,te,ae,Be.image[Se])}}}f(y)&&_(r.TEXTURE_CUBE_MAP),k.__version=A.version,y.onUpdate&&y.onUpdate(y)}O.__version=y.version}(C,R,b):t.bindTexture(r.TEXTURE_CUBE_MAP,C.__webglTexture,r.TEXTURE0+b)},this.rebindTextures=function(R,b,C){let O=i.get(R);b!==void 0&&re(O.__webglFramebuffer,R,R.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),C!==void 0&&_e(R)},this.setupRenderTarget=function(R){let b=R.texture,C=i.get(R),O=i.get(b);R.addEventListener("dispose",F);let y=R.textures,D=R.isWebGLCubeRenderTarget===!0,I=y.length>1;if(I||(O.__webglTexture===void 0&&(O.__webglTexture=r.createTexture()),O.__version=b.version,a.memory.textures++),D){C.__webglFramebuffer=[];for(let A=0;A<6;A++)if(b.mipmaps&&b.mipmaps.length>0){C.__webglFramebuffer[A]=[];for(let k=0;k<b.mipmaps.length;k++)C.__webglFramebuffer[A][k]=r.createFramebuffer()}else C.__webglFramebuffer[A]=r.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){C.__webglFramebuffer=[];for(let A=0;A<b.mipmaps.length;A++)C.__webglFramebuffer[A]=r.createFramebuffer()}else C.__webglFramebuffer=r.createFramebuffer();if(I)for(let A=0,k=y.length;A<k;A++){let j=i.get(y[A]);j.__webglTexture===void 0&&(j.__webglTexture=r.createTexture(),a.memory.textures++)}if(R.samples>0&&me(R)===!1){C.__webglMultisampledFramebuffer=r.createFramebuffer(),C.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,C.__webglMultisampledFramebuffer);for(let A=0;A<y.length;A++){let k=y[A];C.__webglColorRenderbuffer[A]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,C.__webglColorRenderbuffer[A]);let j=s.convert(k.format,k.colorSpace),J=s.convert(k.type),se=S(k.internalFormat,j,J,k.normalized,k.colorSpace,R.isXRRenderTarget===!0),ve=le(R);r.renderbufferStorageMultisample(r.RENDERBUFFER,ve,se,R.width,R.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+A,r.RENDERBUFFER,C.__webglColorRenderbuffer[A])}r.bindRenderbuffer(r.RENDERBUFFER,null),R.depthBuffer&&(C.__webglDepthRenderbuffer=r.createRenderbuffer(),Me(C.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(D){t.bindTexture(r.TEXTURE_CUBE_MAP,O.__webglTexture),V(r.TEXTURE_CUBE_MAP,b);for(let A=0;A<6;A++)if(b.mipmaps&&b.mipmaps.length>0)for(let k=0;k<b.mipmaps.length;k++)re(C.__webglFramebuffer[A][k],R,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+A,k);else re(C.__webglFramebuffer[A],R,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+A,0);f(b)&&_(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(I){for(let A=0,k=y.length;A<k;A++){let j=y[A],J=i.get(j),se=r.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(se=R.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(se,J.__webglTexture),V(se,j),re(C.__webglFramebuffer,R,j,r.COLOR_ATTACHMENT0+A,se,0),f(j)&&_(se)}t.unbindTexture()}else{let A=r.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(A=R.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(A,O.__webglTexture),V(A,b),b.mipmaps&&b.mipmaps.length>0)for(let k=0;k<b.mipmaps.length;k++)re(C.__webglFramebuffer[k],R,b,r.COLOR_ATTACHMENT0,A,k);else re(C.__webglFramebuffer,R,b,r.COLOR_ATTACHMENT0,A,0);f(b)&&_(A),t.unbindTexture()}R.depthBuffer&&_e(R)},this.updateRenderTargetMipmap=function(R){let b=R.textures;for(let C=0,O=b.length;C<O;C++){let y=b[C];if(f(y)){let D=x(R),I=i.get(y).__webglTexture;t.bindTexture(D,I),_(D),t.unbindTexture()}}},this.updateMultisampleRenderTarget=function(R){if(R.samples>0){if(me(R)===!1){let b=R.textures,C=R.width,O=R.height,y=r.COLOR_BUFFER_BIT,D=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,I=i.get(R),A=b.length>1;if(A)for(let j=0;j<b.length;j++)t.bindFramebuffer(r.FRAMEBUFFER,I.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+j,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,I.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+j,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,I.__webglMultisampledFramebuffer);let k=R.texture.mipmaps;k&&k.length>0?t.bindFramebuffer(r.DRAW_FRAMEBUFFER,I.__webglFramebuffer[0]):t.bindFramebuffer(r.DRAW_FRAMEBUFFER,I.__webglFramebuffer);for(let j=0;j<b.length;j++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(y|=r.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(y|=r.STENCIL_BUFFER_BIT)),A){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,I.__webglColorRenderbuffer[j]);let J=i.get(b[j]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,J,0)}r.blitFramebuffer(0,0,C,O,0,0,C,O,y,r.NEAREST),c===!0&&(ie.length=0,he.length=0,ie.push(r.COLOR_ATTACHMENT0+j),R.depthBuffer&&R.resolveDepthBuffer===!1&&(ie.push(D),he.push(D),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,he)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,ie))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),A)for(let j=0;j<b.length;j++){t.bindFramebuffer(r.FRAMEBUFFER,I.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+j,r.RENDERBUFFER,I.__webglColorRenderbuffer[j]);let J=i.get(b[j]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,I.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+j,r.TEXTURE_2D,J,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,I.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&c){let b=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[b])}}},this.setupDepthRenderbuffer=_e,this.setupFrameBufferTexture=re,this.useMultisampledRTT=me,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Mm(r,e){return{convert:function(t,i=Tn){let n,s=Ve.getTransfer(i);if(t===Wt)return r.UNSIGNED_BYTE;if(t===Da)return r.UNSIGNED_SHORT_4_4_4_4;if(t===Na)return r.UNSIGNED_SHORT_5_5_5_1;if(t===xl)return r.UNSIGNED_INT_5_9_9_9_REV;if(t===Ml)return r.UNSIGNED_INT_10F_11F_11F_REV;if(t===vl)return r.BYTE;if(t===yl)return r.SHORT;if(t===dr)return r.UNSIGNED_SHORT;if(t===La)return r.INT;if(t===Bi)return r.UNSIGNED_INT;if(t===oi)return r.FLOAT;if(t===_i)return r.HALF_FLOAT;if(t===su)return r.ALPHA;if(t===au)return r.RGB;if(t===li)return r.RGBA;if(t===rn)return r.DEPTH_COMPONENT;if(t===Sn)return r.DEPTH_STENCIL;if(t===Sl)return r.RED;if(t===Ua)return r.RED_INTEGER;if(t===bn)return r.RG;if(t===bl)return r.RG_INTEGER;if(t===Tl)return r.RGBA_INTEGER;if(t===Oa||t===Fa||t===Ba||t===za)if(s===je){if(n=e.get("WEBGL_compressed_texture_s3tc_srgb"),n===null)return null;if(t===Oa)return n.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(t===Fa)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(t===Ba)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(t===za)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else{if(n=e.get("WEBGL_compressed_texture_s3tc"),n===null)return null;if(t===Oa)return n.COMPRESSED_RGB_S3TC_DXT1_EXT;if(t===Fa)return n.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(t===Ba)return n.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(t===za)return n.COMPRESSED_RGBA_S3TC_DXT5_EXT}if(t===El||t===wl||t===Al||t===Cl){if(n=e.get("WEBGL_compressed_texture_pvrtc"),n===null)return null;if(t===El)return n.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(t===wl)return n.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(t===Al)return n.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(t===Cl)return n.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}if(t===Rl||t===Pl||t===Il||t===Ll||t===Dl||t===Ga||t===Nl){if(n=e.get("WEBGL_compressed_texture_etc"),n===null)return null;if(t===Rl||t===Pl)return s===je?n.COMPRESSED_SRGB8_ETC2:n.COMPRESSED_RGB8_ETC2;if(t===Il)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:n.COMPRESSED_RGBA8_ETC2_EAC;if(t===Ll)return n.COMPRESSED_R11_EAC;if(t===Dl)return n.COMPRESSED_SIGNED_R11_EAC;if(t===Ga)return n.COMPRESSED_RG11_EAC;if(t===Nl)return n.COMPRESSED_SIGNED_RG11_EAC}if(t===Ul||t===Ol||t===Fl||t===Bl||t===zl||t===Gl||t===Vl||t===kl||t===Hl||t===Wl||t===Xl||t===jl||t===ql||t===Yl){if(n=e.get("WEBGL_compressed_texture_astc"),n===null)return null;if(t===Ul)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:n.COMPRESSED_RGBA_ASTC_4x4_KHR;if(t===Ol)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:n.COMPRESSED_RGBA_ASTC_5x4_KHR;if(t===Fl)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:n.COMPRESSED_RGBA_ASTC_5x5_KHR;if(t===Bl)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:n.COMPRESSED_RGBA_ASTC_6x5_KHR;if(t===zl)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:n.COMPRESSED_RGBA_ASTC_6x6_KHR;if(t===Gl)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:n.COMPRESSED_RGBA_ASTC_8x5_KHR;if(t===Vl)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:n.COMPRESSED_RGBA_ASTC_8x6_KHR;if(t===kl)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:n.COMPRESSED_RGBA_ASTC_8x8_KHR;if(t===Hl)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:n.COMPRESSED_RGBA_ASTC_10x5_KHR;if(t===Wl)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:n.COMPRESSED_RGBA_ASTC_10x6_KHR;if(t===Xl)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:n.COMPRESSED_RGBA_ASTC_10x8_KHR;if(t===jl)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:n.COMPRESSED_RGBA_ASTC_10x10_KHR;if(t===ql)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:n.COMPRESSED_RGBA_ASTC_12x10_KHR;if(t===Yl)return s===je?n.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:n.COMPRESSED_RGBA_ASTC_12x12_KHR}if(t===Zl||t===Jl||t===Kl){if(n=e.get("EXT_texture_compression_bptc"),n===null)return null;if(t===Zl)return s===je?n.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:n.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(t===Jl)return n.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(t===Kl)return n.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}if(t===$l||t===Ql||t===Va||t===ec){if(n=e.get("EXT_texture_compression_rgtc"),n===null)return null;if(t===$l)return n.COMPRESSED_RED_RGTC1_EXT;if(t===Ql)return n.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(t===Va)return n.COMPRESSED_RED_GREEN_RGTC2_EXT;if(t===ec)return n.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}return t===pr?r.UNSIGNED_INT_24_8:r[t]!==void 0?r[t]:null}}}var Ac=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new Or(e.texture);e.depthNear===t.depthNear&&e.depthFar===t.depthFar||(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Ht({vertexShader:`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,fragmentShader:`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ze(new Oi(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Cc=class extends ni{constructor(e,t){super();let i=this,n=null,s=1,a=null,o="local-floor",c=1,l=null,h=null,d=null,p=null,u=null,g=null,m=typeof XRWebGLBinding<"u",v=new Ac,f={},_=t.getContextAttributes(),x=null,S=null,E=[],M=[],P=new Q,F=null,L=new Et;L.viewport=new Ze;let N=new Et;N.viewport=new Ze;let H=[L,N],B=new wa,Z=null,X=null;function V(ie){let he=M.indexOf(ie.inputSource);if(he===-1)return;let le=E[he];le!==void 0&&(le.update(ie.inputSource,ie.frame,l||a),le.dispatchEvent({type:ie.type,data:ie.inputSource}))}function q(){n.removeEventListener("select",V),n.removeEventListener("selectstart",V),n.removeEventListener("selectend",V),n.removeEventListener("squeeze",V),n.removeEventListener("squeezestart",V),n.removeEventListener("squeezeend",V),n.removeEventListener("end",q),n.removeEventListener("inputsourceschange",U);for(let ie=0;ie<E.length;ie++){let he=M[ie];he!==null&&(M[ie]=null,E[ie].disconnect(he))}Z=null,X=null,v.reset();for(let ie in f)delete f[ie];e.setRenderTarget(x),u=null,p=null,d=null,n=null,S=null,_e.stop(),i.isPresenting=!1,e.setPixelRatio(F),e.setSize(P.width,P.height,!1),i.dispatchEvent({type:"sessionend"})}function U(ie){for(let he=0;he<ie.removed.length;he++){let le=ie.removed[he],me=M.indexOf(le);me>=0&&(M[me]=null,E[me].disconnect(le))}for(let he=0;he<ie.added.length;he++){let le=ie.added[he],me=M.indexOf(le);if(me===-1){for(let ee=0;ee<E.length;ee++){if(ee>=M.length){M.push(le),me=ee;break}if(M[ee]===null){M[ee]=le,me=ee;break}}if(me===-1)break}let De=E[me];De&&De.connect(le)}}this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ie){let he=E[ie];return he===void 0&&(he=new Kn,E[ie]=he),he.getTargetRaySpace()},this.getControllerGrip=function(ie){let he=E[ie];return he===void 0&&(he=new Kn,E[ie]=he),he.getGripSpace()},this.getHand=function(ie){let he=E[ie];return he===void 0&&(he=new Kn,E[ie]=he),he.getHandSpace()},this.setFramebufferScaleFactor=function(ie){s=ie,i.isPresenting===!0&&be("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ie){o=ie,i.isPresenting===!0&&be("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(ie){l=ie},this.getBaseLayer=function(){return p!==null?p:u},this.getBinding=function(){return d===null&&m&&(d=new XRWebGLBinding(n,t)),d},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function(ie){if(n=ie,n!==null){if(x=e.getRenderTarget(),n.addEventListener("select",V),n.addEventListener("selectstart",V),n.addEventListener("selectend",V),n.addEventListener("squeeze",V),n.addEventListener("squeezestart",V),n.addEventListener("squeezeend",V),n.addEventListener("end",q),n.addEventListener("inputsourceschange",U),_.xrCompatible!==!0&&await t.makeXRCompatible(),F=e.getPixelRatio(),e.getSize(P),m&&"createProjectionLayer"in XRWebGLBinding.prototype){let he=null,le=null,me=null;_.depth&&(me=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,he=_.stencil?Sn:rn,le=_.stencil?pr:Bi);let De={colorFormat:t.RGBA8,depthFormat:me,scaleFactor:s};d=this.getBinding(),p=d.createProjectionLayer(De),n.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),S=new Vt(p.textureWidth,p.textureHeight,{format:li,type:Wt,depthTexture:new Li(p.textureWidth,p.textureHeight,le,void 0,void 0,void 0,void 0,void 0,void 0,he),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{let he={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:s};u=new XRWebGLLayer(n,t,he),n.updateRenderState({baseLayer:u}),e.setPixelRatio(1),e.setSize(u.framebufferWidth,u.framebufferHeight,!1),S=new Vt(u.framebufferWidth,u.framebufferHeight,{format:li,type:Wt,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await n.requestReferenceSpace(o),_e.setContext(n),_e.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};let W=new w,re=new w;function Me(ie,he){he===null?ie.matrixWorld.copy(ie.matrix):ie.matrixWorld.multiplyMatrices(he.matrixWorld,ie.matrix),ie.matrixWorldInverse.copy(ie.matrixWorld).invert()}this.updateCamera=function(ie){if(n===null)return;let he=ie.near,le=ie.far;v.texture!==null&&(v.depthNear>0&&(he=v.depthNear),v.depthFar>0&&(le=v.depthFar)),B.near=N.near=L.near=he,B.far=N.far=L.far=le,Z===B.near&&X===B.far||(n.updateRenderState({depthNear:B.near,depthFar:B.far}),Z=B.near,X=B.far),B.layers.mask=6|ie.layers.mask,L.layers.mask=-5&B.layers.mask,N.layers.mask=-3&B.layers.mask;let me=ie.parent,De=B.cameras;Me(B,me);for(let ee=0;ee<De.length;ee++)Me(De[ee],me);De.length===2?function(ee,R,b){W.setFromMatrixPosition(R.matrixWorld),re.setFromMatrixPosition(b.matrixWorld);let C=W.distanceTo(re),O=R.projectionMatrix.elements,y=b.projectionMatrix.elements,D=O[14]/(O[10]-1),I=O[14]/(O[10]+1),A=(O[9]+1)/O[5],k=(O[9]-1)/O[5],j=(O[8]-1)/O[0],J=(y[8]+1)/y[0],se=D*j,ve=D*J,ye=C/(-j+J),ue=ye*-j;if(R.matrixWorld.decompose(ee.position,ee.quaternion,ee.scale),ee.translateX(ue),ee.translateZ(ye),ee.matrixWorld.compose(ee.position,ee.quaternion,ee.scale),ee.matrixWorldInverse.copy(ee.matrixWorld).invert(),O[10]===-1)ee.projectionMatrix.copy(R.projectionMatrix),ee.projectionMatrixInverse.copy(R.projectionMatrixInverse);else{let Ae=D+ye,te=I+ye,ae=se-ue,ne=ve+(C-ue),pe=A*I/te*Ae,Ke=k*I/te*Ae;ee.projectionMatrix.makePerspective(ae,ne,pe,Ke,Ae,te),ee.projectionMatrixInverse.copy(ee.projectionMatrix).invert()}}(B,L,N):B.projectionMatrix.copy(L.projectionMatrix),function(ee,R,b){b===null?ee.matrix.copy(R.matrixWorld):(ee.matrix.copy(b.matrixWorld),ee.matrix.invert(),ee.matrix.multiply(R.matrixWorld)),ee.matrix.decompose(ee.position,ee.quaternion,ee.scale),ee.updateMatrixWorld(!0),ee.projectionMatrix.copy(R.projectionMatrix),ee.projectionMatrixInverse.copy(R.projectionMatrixInverse),ee.isPerspectiveCamera&&(ee.fov=2*Yn*Math.atan(1/ee.projectionMatrix.elements[5]),ee.zoom=1)}(ie,B,me)},this.getCamera=function(){return B},this.getFoveation=function(){if(p!==null||u!==null)return c},this.setFoveation=function(ie){c=ie,p!==null&&(p.fixedFoveation=ie),u!==null&&u.fixedFoveation!==void 0&&(u.fixedFoveation=ie)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(B)},this.getCameraTexture=function(ie){return f[ie]};let ge=null,_e=new ju;_e.setAnimationLoop(function(ie,he){if(h=he.getViewerPose(l||a),g=he,h!==null){let le=h.views;u!==null&&(e.setRenderTargetFramebuffer(S,u.framebuffer),e.setRenderTarget(S));let me=!1;le.length!==B.cameras.length&&(B.cameras.length=0,me=!0);for(let ee=0;ee<le.length;ee++){let R=le[ee],b=null;if(u!==null)b=u.getViewport(R);else{let O=d.getViewSubImage(p,R);b=O.viewport,ee===0&&(e.setRenderTargetTextures(S,O.colorTexture,O.depthStencilTexture),e.setRenderTarget(S))}let C=H[ee];C===void 0&&(C=new Et,C.layers.enable(ee),C.viewport=new Ze,H[ee]=C),C.matrix.fromArray(R.transform.matrix),C.matrix.decompose(C.position,C.quaternion,C.scale),C.projectionMatrix.fromArray(R.projectionMatrix),C.projectionMatrixInverse.copy(C.projectionMatrix).invert(),C.viewport.set(b.x,b.y,b.width,b.height),ee===0&&(B.matrix.copy(C.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),me===!0&&B.cameras.push(C)}let De=n.enabledFeatures;if(De&&De.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&m){d=i.getBinding();let ee=d.getDepthInformation(le[0]);ee&&ee.isValid&&ee.texture&&v.init(ee,n.renderState)}if(De&&De.includes("camera-access")&&m){e.state.unbindTexture(),d=i.getBinding();for(let ee=0;ee<le.length;ee++){let R=le[ee].camera;if(R){let b=f[R];b||(b=new Or,f[R]=b);let C=d.getCameraImage(R);b.sourceTexture=C}}}}for(let le=0;le<E.length;le++){let me=M[le],De=E[le];me!==null&&De!==void 0&&De.update(me,he,l||a)}ge&&ge(ie,he),he.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:he}),g=null}),this.setAnimationLoop=function(ie){ge=ie},this.dispose=function(){}}},Sm=new Ne,$u=new Ie;function bm(r,e){function t(n,s){n.matrixAutoUpdate===!0&&n.updateMatrix(),s.value.copy(n.matrix)}function i(n,s){n.opacity.value=s.opacity,s.color&&n.diffuse.value.copy(s.color),s.emissive&&n.emissive.value.copy(s.emissive).multiplyScalar(s.emissiveIntensity),s.map&&(n.map.value=s.map,t(s.map,n.mapTransform)),s.alphaMap&&(n.alphaMap.value=s.alphaMap,t(s.alphaMap,n.alphaMapTransform)),s.bumpMap&&(n.bumpMap.value=s.bumpMap,t(s.bumpMap,n.bumpMapTransform),n.bumpScale.value=s.bumpScale,s.side===Ut&&(n.bumpScale.value*=-1)),s.normalMap&&(n.normalMap.value=s.normalMap,t(s.normalMap,n.normalMapTransform),n.normalScale.value.copy(s.normalScale),s.side===Ut&&n.normalScale.value.negate()),s.displacementMap&&(n.displacementMap.value=s.displacementMap,t(s.displacementMap,n.displacementMapTransform),n.displacementScale.value=s.displacementScale,n.displacementBias.value=s.displacementBias),s.emissiveMap&&(n.emissiveMap.value=s.emissiveMap,t(s.emissiveMap,n.emissiveMapTransform)),s.specularMap&&(n.specularMap.value=s.specularMap,t(s.specularMap,n.specularMapTransform)),s.alphaTest>0&&(n.alphaTest.value=s.alphaTest);let a=e.get(s),o=a.envMap,c=a.envMapRotation;o&&(n.envMap.value=o,n.envMapRotation.value.setFromMatrix4(Sm.makeRotationFromEuler(c)).transpose(),o.isCubeTexture&&o.isRenderTargetTexture===!1&&n.envMapRotation.value.premultiply($u),n.reflectivity.value=s.reflectivity,n.ior.value=s.ior,n.refractionRatio.value=s.refractionRatio),s.lightMap&&(n.lightMap.value=s.lightMap,n.lightMapIntensity.value=s.lightMapIntensity,t(s.lightMap,n.lightMapTransform)),s.aoMap&&(n.aoMap.value=s.aoMap,n.aoMapIntensity.value=s.aoMapIntensity,t(s.aoMap,n.aoMapTransform))}return{refreshFogUniforms:function(n,s){s.color.getRGB(n.fogColor.value,ac(r)),s.isFog?(n.fogNear.value=s.near,n.fogFar.value=s.far):s.isFogExp2&&(n.fogDensity.value=s.density)},refreshMaterialUniforms:function(n,s,a,o,c){s.isNodeMaterial?s.uniformsNeedUpdate=!1:s.isMeshBasicMaterial?i(n,s):s.isMeshLambertMaterial?(i(n,s),s.envMap&&(n.envMapIntensity.value=s.envMapIntensity)):s.isMeshToonMaterial?(i(n,s),function(l,h){h.gradientMap&&(l.gradientMap.value=h.gradientMap)}(n,s)):s.isMeshPhongMaterial?(i(n,s),function(l,h){l.specular.value.copy(h.specular),l.shininess.value=Math.max(h.shininess,1e-4)}(n,s),s.envMap&&(n.envMapIntensity.value=s.envMapIntensity)):s.isMeshStandardMaterial?(i(n,s),function(l,h){l.metalness.value=h.metalness,h.metalnessMap&&(l.metalnessMap.value=h.metalnessMap,t(h.metalnessMap,l.metalnessMapTransform)),l.roughness.value=h.roughness,h.roughnessMap&&(l.roughnessMap.value=h.roughnessMap,t(h.roughnessMap,l.roughnessMapTransform)),h.envMap&&(l.envMapIntensity.value=h.envMapIntensity)}(n,s),s.isMeshPhysicalMaterial&&function(l,h,d){l.ior.value=h.ior,h.sheen>0&&(l.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),l.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(l.sheenColorMap.value=h.sheenColorMap,t(h.sheenColorMap,l.sheenColorMapTransform)),h.sheenRoughnessMap&&(l.sheenRoughnessMap.value=h.sheenRoughnessMap,t(h.sheenRoughnessMap,l.sheenRoughnessMapTransform))),h.clearcoat>0&&(l.clearcoat.value=h.clearcoat,l.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(l.clearcoatMap.value=h.clearcoatMap,t(h.clearcoatMap,l.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(l.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,t(h.clearcoatRoughnessMap,l.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(l.clearcoatNormalMap.value=h.clearcoatNormalMap,t(h.clearcoatNormalMap,l.clearcoatNormalMapTransform),l.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===Ut&&l.clearcoatNormalScale.value.negate())),h.dispersion>0&&(l.dispersion.value=h.dispersion),h.iridescence>0&&(l.iridescence.value=h.iridescence,l.iridescenceIOR.value=h.iridescenceIOR,l.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],l.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(l.iridescenceMap.value=h.iridescenceMap,t(h.iridescenceMap,l.iridescenceMapTransform)),h.iridescenceThicknessMap&&(l.iridescenceThicknessMap.value=h.iridescenceThicknessMap,t(h.iridescenceThicknessMap,l.iridescenceThicknessMapTransform))),h.transmission>0&&(l.transmission.value=h.transmission,l.transmissionSamplerMap.value=d.texture,l.transmissionSamplerSize.value.set(d.width,d.height),h.transmissionMap&&(l.transmissionMap.value=h.transmissionMap,t(h.transmissionMap,l.transmissionMapTransform)),l.thickness.value=h.thickness,h.thicknessMap&&(l.thicknessMap.value=h.thicknessMap,t(h.thicknessMap,l.thicknessMapTransform)),l.attenuationDistance.value=h.attenuationDistance,l.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(l.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(l.anisotropyMap.value=h.anisotropyMap,t(h.anisotropyMap,l.anisotropyMapTransform))),l.specularIntensity.value=h.specularIntensity,l.specularColor.value.copy(h.specularColor),h.specularColorMap&&(l.specularColorMap.value=h.specularColorMap,t(h.specularColorMap,l.specularColorMapTransform)),h.specularIntensityMap&&(l.specularIntensityMap.value=h.specularIntensityMap,t(h.specularIntensityMap,l.specularIntensityMapTransform))}(n,s,c)):s.isMeshMatcapMaterial?(i(n,s),function(l,h){h.matcap&&(l.matcap.value=h.matcap)}(n,s)):s.isMeshDepthMaterial?i(n,s):s.isMeshDistanceMaterial?(i(n,s),function(l,h){let d=e.get(h).light;l.referencePosition.value.setFromMatrixPosition(d.matrixWorld),l.nearDistance.value=d.shadow.camera.near,l.farDistance.value=d.shadow.camera.far}(n,s)):s.isMeshNormalMaterial?i(n,s):s.isLineBasicMaterial?(function(l,h){l.diffuse.value.copy(h.color),l.opacity.value=h.opacity,h.map&&(l.map.value=h.map,t(h.map,l.mapTransform))}(n,s),s.isLineDashedMaterial&&function(l,h){l.dashSize.value=h.dashSize,l.totalSize.value=h.dashSize+h.gapSize,l.scale.value=h.scale}(n,s)):s.isPointsMaterial?function(l,h,d,p){l.diffuse.value.copy(h.color),l.opacity.value=h.opacity,l.size.value=h.size*d,l.scale.value=.5*p,h.map&&(l.map.value=h.map,t(h.map,l.uvTransform)),h.alphaMap&&(l.alphaMap.value=h.alphaMap,t(h.alphaMap,l.alphaMapTransform)),h.alphaTest>0&&(l.alphaTest.value=h.alphaTest)}(n,s,a,o):s.isSpriteMaterial?function(l,h){l.diffuse.value.copy(h.color),l.opacity.value=h.opacity,l.rotation.value=h.rotation,h.map&&(l.map.value=h.map,t(h.map,l.mapTransform)),h.alphaMap&&(l.alphaMap.value=h.alphaMap,t(h.alphaMap,l.alphaMapTransform)),h.alphaTest>0&&(l.alphaTest.value=h.alphaTest)}(n,s):s.isShadowMaterial?(n.color.value.copy(s.color),n.opacity.value=s.opacity):s.isShaderMaterial&&(s.uniformsNeedUpdate=!1)}}}function Tm(r,e,t,i){let n={},s={},a=[],o=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function c(p,u,g,m){if(function(v,f,_,x){let S=v.value,E=f+"_"+_;if(x[E]===void 0)return typeof S=="number"||typeof S=="boolean"?x[E]=S:ArrayBuffer.isView(S)?x[E]=S.slice():x[E]=S.clone(),!0;{let M=x[E];if(typeof S=="number"||typeof S=="boolean"){if(M!==S)return x[E]=S,!0}else{if(ArrayBuffer.isView(S))return!0;if(M.equals(S)===!1)return M.copy(S),!0}}return!1}(p,u,g,m)===!0){let v=p.__offset,f=p.value;if(Array.isArray(f)){let _=0;for(let x=0;x<f.length;x++){let S=f[x],E=h(S);l(S,p.__data,_),typeof S=="number"||typeof S=="boolean"||S.isMatrix3||ArrayBuffer.isView(S)||(_+=E.storage/Float32Array.BYTES_PER_ELEMENT)}}else l(f,p.__data,0);r.bufferSubData(r.UNIFORM_BUFFER,v,p.__data)}}function l(p,u,g){typeof p=="number"||typeof p=="boolean"?u[0]=p:p.isMatrix3?(u[0]=p.elements[0],u[1]=p.elements[1],u[2]=p.elements[2],u[3]=0,u[4]=p.elements[3],u[5]=p.elements[4],u[6]=p.elements[5],u[7]=0,u[8]=p.elements[6],u[9]=p.elements[7],u[10]=p.elements[8],u[11]=0):ArrayBuffer.isView(p)?u.set(new p.constructor(p.buffer,p.byteOffset,u.length)):p.toArray(u,g)}function h(p){let u={boundary:0,storage:0};return typeof p=="number"||typeof p=="boolean"?(u.boundary=4,u.storage=4):p.isVector2?(u.boundary=8,u.storage=8):p.isVector3||p.isColor?(u.boundary=16,u.storage=12):p.isVector4?(u.boundary=16,u.storage=16):p.isMatrix3?(u.boundary=48,u.storage=48):p.isMatrix4?(u.boundary=64,u.storage=64):p.isTexture?be("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(p)?(u.boundary=16,u.storage=p.byteLength):be("WebGLRenderer: Unsupported uniform value type.",p),u}function d(p){let u=p.target;u.removeEventListener("dispose",d);let g=a.indexOf(u.__bindingPointIndex);a.splice(g,1),r.deleteBuffer(n[u.id]),delete n[u.id],delete s[u.id]}return{bind:function(p,u){let g=u.program;i.uniformBlockBinding(p,g)},update:function(p,u){let g=n[p.id];g===void 0&&(function(f){let _=f.uniforms,x=0,S=16;for(let M=0,P=_.length;M<P;M++){let F=Array.isArray(_[M])?_[M]:[_[M]];for(let L=0,N=F.length;L<N;L++){let H=F[L],B=Array.isArray(H.value)?H.value:[H.value];for(let Z=0,X=B.length;Z<X;Z++){let V=h(B[Z]),q=x%S,U=q%V.boundary,W=q+U;x+=U,W!==0&&S-W<V.storage&&(x+=S-W),H.__data=new Float32Array(V.storage/Float32Array.BYTES_PER_ELEMENT),H.__offset=x,x+=V.storage}}}let E=x%S;E>0&&(x+=S-E),f.__size=x,f.__cache={}}(p),g=function(f){let _=function(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return Te("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}();f.__bindingPointIndex=_;let x=r.createBuffer(),S=f.__size,E=f.usage;return r.bindBuffer(r.UNIFORM_BUFFER,x),r.bufferData(r.UNIFORM_BUFFER,S,E),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,_,x),x}(p),n[p.id]=g,p.addEventListener("dispose",d));let m=u.program;i.updateUBOMapping(p,m);let v=e.render.frame;s[p.id]!==v&&(function(f){let _=n[f.id],x=f.uniforms,S=f.__cache;r.bindBuffer(r.UNIFORM_BUFFER,_);for(let E=0,M=x.length;E<M;E++){let P=x[E];if(Array.isArray(P))for(let F=0,L=P.length;F<L;F++)c(P[F],E,F,S);else c(P,E,0,S)}r.bindBuffer(r.UNIFORM_BUFFER,null)}(p),s[p.id]=v)},dispose:function(){for(let p in n)r.deleteBuffer(n[p]);a=[],n={},s={}}}}$u.set(-1,0,0,0,1,0,0,0,1);var Em=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),vi=null,Za=class{constructor(e={}){let{canvas:t=mu(),context:i=null,depth:n=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:p=!1,outputBufferType:u=Wt}=e,g;if(this.isWebGLRenderer=!0,i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=a;let m=u,v=new Set([Tl,bl,Ua]),f=new Set([Wt,Bi,dr,pr,Da,Na]),_=new Uint32Array(4),x=new Int32Array(4),S=new w,E=null,M=null,P=[],F=[],L=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ai,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let N=this,H=!1,B=null,Z=null,X=null,V=null;this._outputColorSpace=Pt;let q=0,U=0,W=null,re=-1,Me=null,ge=new Ze,_e=new Ze,ie=null,he=new Oe(0),le=0,me=t.width,De=t.height,ee=1,R=null,b=null,C=new Ze(0,0,me,De),O=new Ze(0,0,me,De),y=!1,D=new Ii,I=!1,A=!1,k=new Ne,j=new w,J=new Ze,se={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ve=!1;function ye(){return W===null?ee:1}let ue,Ae,te,ae,ne,pe,Ke,Xe,ot,Ct,Se,Ye,Be,yt,$e,dt,at,Xt,Jt,an,ci,zi,as,z=i;function Dc(T,G){return t.getContext(T,G)}try{let T={alpha:!0,depth:n,stencil:s,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Bs}`),t.addEventListener("webglcontextlost",Uc,!1),t.addEventListener("webglcontextrestored",Oc,!1),t.addEventListener("webglcontextcreationerror",Fc,!1),z===null){let G="webgl2";if(z=Dc(G,T),z===null)throw Dc(G)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(T){throw Te("WebGLRenderer: "+T.message),T}function Nc(){ue=new $d(z),ue.init(),ci=new Mm(z,ue),Ae=new Yd(z,ue,e,ci),te=new ym(z,ue),Ae.reversedDepthBuffer&&p&&te.buffers.depth.setReversed(!0),Z=z.createFramebuffer(),X=z.createFramebuffer(),V=z.createFramebuffer(),ae=new tp(z),ne=new lm,pe=new xm(z,ue,te,ne,Ae,ci,ae),Ke=new Kd(N),Xe=new Hd(z),zi=new jd(z,Xe),ot=new Qd(z,Xe,ae,zi),Ct=new np(z,ot,Xe,zi,ae),Xt=new ip(z,Ae,pe),$e=new Zd(ne),Se=new om(N,Ke,ue,Ae,zi,$e),Ye=new bm(N,ne),Be=new hm,yt=new fm(ue),at=new Xd(N,Ke,te,Ct,g,c),dt=new vm(N,Ct,Ae),as=new Tm(z,ae,Ae,te),Jt=new qd(z,ue,ae),an=new ep(z,ue,ae),ae.programs=Se.programs,N.capabilities=Ae,N.extensions=ue,N.properties=ne,N.renderLists=Be,N.shadowMap=dt,N.state=te,N.info=ae}Nc(),m!==Wt&&(L=new sp(m,t.width,t.height,o,n,s));let lt=new Cc(N,z);function Uc(T){T.preventDefault(),nc("WebGLRenderer: Context Lost."),H=!0}function Oc(){nc("WebGLRenderer: Context Restored."),H=!1;let T=ae.autoReset,G=dt.enabled,Y=dt.autoUpdate,$=dt.needsUpdate,K=dt.type;Nc(),ae.autoReset=T,dt.enabled=G,dt.autoUpdate=Y,dt.needsUpdate=$,dt.type=K}function Fc(T){Te("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function Bc(T){let G=T.target;G.removeEventListener("dispose",Bc),function(Y){(function($){let K=ne.get($).programs;K!==void 0&&(K.forEach(function(oe){Se.releaseProgram(oe)}),$.isShaderMaterial&&Se.releaseShaderCache($))})(Y),ne.remove(Y)}(G)}function zc(T,G,Y){T.transparent===!0&&T.side===Dt&&T.forceSinglePass===!1?(T.side=Ut,T.needsUpdate=!0,ls(T,G,Y),T.side=nn,T.needsUpdate=!0,ls(T,G,Y),T.side=Dt):ls(T,G,Y)}this.xr=lt,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let T=ue.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=ue.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return ee},this.setPixelRatio=function(T){T!==void 0&&(ee=T,this.setSize(me,De,!1))},this.getSize=function(T){return T.set(me,De)},this.setSize=function(T,G,Y=!0){lt.isPresenting?be("WebGLRenderer: Can't change size while VR device is presenting."):(me=T,De=G,t.width=Math.floor(T*ee),t.height=Math.floor(G*ee),Y===!0&&(t.style.width=T+"px",t.style.height=G+"px"),L!==null&&L.setSize(t.width,t.height),this.setViewport(0,0,T,G))},this.getDrawingBufferSize=function(T){return T.set(me*ee,De*ee).floor()},this.setDrawingBufferSize=function(T,G,Y){me=T,De=G,ee=Y,t.width=Math.floor(T*Y),t.height=Math.floor(G*Y),this.setViewport(0,0,T,G)},this.setEffects=function(T){if(m!==Wt){if(T){for(let G=0;G<T.length;G++)if(T[G].isOutputPass===!0){be("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}L.setEffects(T||[])}else Te("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.")},this.getCurrentViewport=function(T){return T.copy(ge)},this.getViewport=function(T){return T.copy(C)},this.setViewport=function(T,G,Y,$){T.isVector4?C.set(T.x,T.y,T.z,T.w):C.set(T,G,Y,$),te.viewport(ge.copy(C).multiplyScalar(ee).round())},this.getScissor=function(T){return T.copy(O)},this.setScissor=function(T,G,Y,$){T.isVector4?O.set(T.x,T.y,T.z,T.w):O.set(T,G,Y,$),te.scissor(_e.copy(O).multiplyScalar(ee).round())},this.getScissorTest=function(){return y},this.setScissorTest=function(T){te.setScissorTest(y=T)},this.setOpaqueSort=function(T){R=T},this.setTransparentSort=function(T){b=T},this.getClearColor=function(T){return T.copy(at.getClearColor())},this.setClearColor=function(){at.setClearColor(...arguments)},this.getClearAlpha=function(){return at.getClearAlpha()},this.setClearAlpha=function(){at.setClearAlpha(...arguments)},this.clear=function(T=!0,G=!0,Y=!0){let $=0;if(T){let K=!1;if(W!==null){let oe=W.texture.format;K=v.has(oe)}if(K){let oe=W.texture.type,de=f.has(oe),fe=at.getClearColor(),xe=at.getClearAlpha(),Ce=fe.r,ke=fe.g,He=fe.b;de?(_[0]=Ce,_[1]=ke,_[2]=He,_[3]=xe,z.clearBufferuiv(z.COLOR,0,_)):(x[0]=Ce,x[1]=ke,x[2]=He,x[3]=xe,z.clearBufferiv(z.COLOR,0,x))}else $|=z.COLOR_BUFFER_BIT}G&&($|=z.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&($|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),$!==0&&z.clear($)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),B=T},this.dispose=function(){t.removeEventListener("webglcontextlost",Uc,!1),t.removeEventListener("webglcontextrestored",Oc,!1),t.removeEventListener("webglcontextcreationerror",Fc,!1),at.dispose(),Be.dispose(),yt.dispose(),ne.dispose(),Ke.dispose(),Ct.dispose(),zi.dispose(),as.dispose(),Se.dispose(),lt.dispose(),lt.removeEventListener("sessionstart",Gc),lt.removeEventListener("sessionend",Vc),on.stop()},this.renderBufferDirect=function(T,G,Y,$,K,oe){G===null&&(G=se);let de=K.isMesh&&K.matrixWorld.determinantAffine()<0,fe=function(Ge,it,xt,Re,Le){it.isScene!==!0&&(it=se),pe.resetTextureUnits();let Kt=it.fog,ro=Re.isMeshStandardMaterial||Re.isMeshLambertMaterial||Re.isMeshPhongMaterial?it.environment:null,cs=W===null?N.outputColorSpace:W.isXRRenderTarget===!0?W.texture.colorSpace:Ve.workingColorSpace,_r=Re.isMeshStandardMaterial||Re.isMeshLambertMaterial&&!Re.envMap||Re.isMeshPhongMaterial&&!Re.envMap,hi=Ke.get(Re.envMap||ro,_r),Cn=Re.vertexColors===!0&&!!xt.attributes.color&&xt.attributes.color.itemSize===4,xi=!!xt.attributes.tangent&&(!!Re.normalMap||Re.anisotropy>0),so=!!xt.morphAttributes.position,Rn=!!xt.morphAttributes.normal,ad=!!xt.morphAttributes.color,qc=ai;Re.toneMapped&&(W!==null&&W.isXRRenderTarget!==!0||(qc=N.toneMapping));let Yc=xt.morphAttributes.position||xt.morphAttributes.normal||xt.morphAttributes.color,od=Yc!==void 0?Yc.length:0,Pe=ne.get(Re),ln=M.state.lights;if(I===!0&&(A===!0||Ge!==Me)){let ht=Ge===Me&&Re.id===re;$e.setState(Re,Ge,ht)}let $t=!1;Re.version===Pe.__version?Pe.needsLights&&Pe.lightsStateVersion!==ln.state.version||Pe.outputColorSpace!==cs||Le.isBatchedMesh&&Pe.batching===!1?$t=!0:Le.isBatchedMesh||Pe.batching!==!0?Le.isBatchedMesh&&Pe.batchingColor===!0&&Le.colorTexture===null||Le.isBatchedMesh&&Pe.batchingColor===!1&&Le.colorTexture!==null||Le.isInstancedMesh&&Pe.instancing===!1?$t=!0:Le.isInstancedMesh||Pe.instancing!==!0?Le.isSkinnedMesh&&Pe.skinning===!1?$t=!0:Le.isSkinnedMesh||Pe.skinning!==!0?Le.isInstancedMesh&&Pe.instancingColor===!0&&Le.instanceColor===null||Le.isInstancedMesh&&Pe.instancingColor===!1&&Le.instanceColor!==null||Le.isInstancedMesh&&Pe.instancingMorph===!0&&Le.morphTexture===null||Le.isInstancedMesh&&Pe.instancingMorph===!1&&Le.morphTexture!==null||Pe.envMap!==hi||Re.fog===!0&&Pe.fog!==Kt?$t=!0:Pe.numClippingPlanes===void 0||Pe.numClippingPlanes===$e.numPlanes&&Pe.numIntersection===$e.numIntersection?(Pe.vertexAlphas!==Cn||Pe.vertexTangents!==xi||Pe.morphTargets!==so||Pe.morphNormals!==Rn||Pe.morphColors!==ad||Pe.toneMapping!==qc||Pe.morphTargetsCount!==od||!!Pe.lightProbeGrid!=M.state.lightProbeGridArray.length>0)&&($t=!0):$t=!0:$t=!0:$t=!0:$t=!0:($t=!0,Pe.__version=Re.version);let Gi=Pe.currentProgram;$t===!0&&(Gi=ls(Re,it,Le),B&&Re.isNodeMaterial&&B.onUpdateProgram(Re,Gi,Pe));let Zc=!1,Pn=!1,ao=!1,nt=Gi.getUniforms(),jt=Pe.uniforms;if(te.useProgram(Gi.program)&&(Zc=!0,Pn=!0,ao=!0),Re.id!==re&&(re=Re.id,Pn=!0),Pe.needsLights){let ht=function(di,lo){if(di.length===0)return null;if(di.length===1)return di[0].texture!==null?di[0]:null;S.setFromMatrixPosition(lo.matrixWorld);for(let In=0,ld=di.length;In<ld;In++){let co=di[In];if(co.texture!==null&&co.boundingBox.containsPoint(S))return co}return null}(M.state.lightProbeGridArray,Le);Pe.lightProbeGrid!==ht&&(Pe.lightProbeGrid=ht,Pn=!0)}if(Zc||Me!==Ge){te.buffers.depth.getReversed()&&Ge.reversedDepth!==!0&&(Ge._reversedDepth=!0,Ge.updateProjectionMatrix()),nt.setValue(z,"projectionMatrix",Ge.projectionMatrix),nt.setValue(z,"viewMatrix",Ge.matrixWorldInverse);let ht=nt.map.cameraPosition;ht!==void 0&&ht.setValue(z,j.setFromMatrixPosition(Ge.matrixWorld)),Ae.logarithmicDepthBuffer&&nt.setValue(z,"logDepthBufFC",2/(Math.log(Ge.far+1)/Math.LN2)),(Re.isMeshPhongMaterial||Re.isMeshToonMaterial||Re.isMeshLambertMaterial||Re.isMeshBasicMaterial||Re.isMeshStandardMaterial||Re.isShaderMaterial)&&nt.setValue(z,"isOrthographic",Ge.isOrthographicCamera===!0),Me!==Ge&&(Me=Ge,Pn=!0,ao=!0)}if(Pe.needsLights&&(ln.state.directionalShadowMap.length>0&&nt.setValue(z,"directionalShadowMap",ln.state.directionalShadowMap,pe),ln.state.spotShadowMap.length>0&&nt.setValue(z,"spotShadowMap",ln.state.spotShadowMap,pe),ln.state.pointShadowMap.length>0&&nt.setValue(z,"pointShadowMap",ln.state.pointShadowMap,pe)),Le.isSkinnedMesh){nt.setOptional(z,Le,"bindMatrix"),nt.setOptional(z,Le,"bindMatrixInverse");let ht=Le.skeleton;ht&&(ht.boneTexture===null&&ht.computeBoneTexture(),nt.setValue(z,"boneTexture",ht.boneTexture,pe))}Le.isBatchedMesh&&(nt.setOptional(z,Le,"batchingTexture"),nt.setValue(z,"batchingTexture",Le._matricesTexture,pe),nt.setOptional(z,Le,"batchingIdTexture"),nt.setValue(z,"batchingIdTexture",Le._indirectTexture,pe),nt.setOptional(z,Le,"batchingColorTexture"),Le._colorsTexture!==null&&nt.setValue(z,"batchingColorTexture",Le._colorsTexture,pe));let oo=xt.morphAttributes;if(oo.position===void 0&&oo.normal===void 0&&oo.color===void 0||Xt.update(Le,xt,Gi),(Pn||Pe.receiveShadow!==Le.receiveShadow)&&(Pe.receiveShadow=Le.receiveShadow,nt.setValue(z,"receiveShadow",Le.receiveShadow)),(Re.isMeshStandardMaterial||Re.isMeshLambertMaterial||Re.isMeshPhongMaterial)&&Re.envMap===null&&it.environment!==null&&(jt.envMapIntensity.value=it.environmentIntensity),jt.dfgLUT!==void 0&&(jt.dfgLUT.value=(vi===null&&(vi=new Xs(Em,16,16,bn,_i),vi.name="DFG_LUT",vi.minFilter=wt,vi.magFilter=wt,vi.wrapS=Zi,vi.wrapT=Zi,vi.generateMipmaps=!1,vi.needsUpdate=!0),vi)),Pn){if(nt.setValue(z,"toneMappingExposure",N.toneMappingExposure),Pe.needsLights&&(Qt=ao,(ui=jt).ambientLightColor.needsUpdate=Qt,ui.lightProbe.needsUpdate=Qt,ui.directionalLights.needsUpdate=Qt,ui.directionalLightShadows.needsUpdate=Qt,ui.pointLights.needsUpdate=Qt,ui.pointLightShadows.needsUpdate=Qt,ui.spotLights.needsUpdate=Qt,ui.spotLightShadows.needsUpdate=Qt,ui.rectAreaLights.needsUpdate=Qt,ui.hemisphereLights.needsUpdate=Qt),Kt&&Re.fog===!0&&Ye.refreshFogUniforms(jt,Kt),Ye.refreshMaterialUniforms(jt,Re,ee,De,M.state.transmissionRenderTarget[Ge.id]),Pe.needsLights&&Pe.lightProbeGrid){let ht=Pe.lightProbeGrid;jt.probesSH.value=ht.texture,jt.probesMin.value.copy(ht.boundingBox.min),jt.probesMax.value.copy(ht.boundingBox.max),jt.probesResolution.value.copy(ht.resolution)}fr.upload(z,Xc(Pe),jt,pe)}var ui,Qt;if(Re.isShaderMaterial&&Re.uniformsNeedUpdate===!0&&(fr.upload(z,Xc(Pe),jt,pe),Re.uniformsNeedUpdate=!1),Re.isSpriteMaterial&&nt.setValue(z,"center",Le.center),nt.setValue(z,"modelViewMatrix",Le.modelViewMatrix),nt.setValue(z,"normalMatrix",Le.normalMatrix),nt.setValue(z,"modelMatrix",Le.matrixWorld),Re.uniformsGroups!==void 0){let ht=Re.uniformsGroups;for(let di=0,lo=ht.length;di<lo;di++){let In=ht[di];as.update(In,Gi),as.bind(In,Gi)}}return Gi}(T,G,Y,$,K);te.setMaterial($,de);let xe=Y.index,Ce=1;if($.wireframe===!0){if(xe=ot.getWireframeAttribute(Y),xe===void 0)return;Ce=2}let ke=Y.drawRange,He=Y.attributes.position,we=ke.start*Ce,We=(ke.start+ke.count)*Ce;oe!==null&&(we=Math.max(we,oe.start*Ce),We=Math.min(We,(oe.start+oe.count)*Ce)),xe!==null?(we=Math.max(we,0),We=Math.min(We,xe.count)):He!=null&&(we=Math.max(we,0),We=Math.min(We,He.count));let pt=We-we;if(pt<0||pt===1/0)return;let ct;zi.setup(K,$,fe,Y,xe);let tt=Jt;if(xe!==null&&(ct=Xe.get(xe),tt=an,tt.setIndex(ct)),K.isMesh)$.wireframe===!0?(te.setLineWidth($.wireframeLinewidth*ye()),tt.setMode(z.LINES)):tt.setMode(z.TRIANGLES);else if(K.isLine){let Ge=$.linewidth;Ge===void 0&&(Ge=1),te.setLineWidth(Ge*ye()),K.isLineSegments?tt.setMode(z.LINES):K.isLineLoop?tt.setMode(z.LINE_LOOP):tt.setMode(z.LINE_STRIP)}else K.isPoints?tt.setMode(z.POINTS):K.isSprite&&tt.setMode(z.TRIANGLES);if(K.isBatchedMesh)if(ue.get("WEBGL_multi_draw"))tt.renderMultiDraw(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount);else{let Ge=K._multiDrawStarts,it=K._multiDrawCounts,xt=K._multiDrawCount,Re=xe?Xe.get(xe).bytesPerElement:1,Le=ne.get($).currentProgram.getUniforms();for(let Kt=0;Kt<xt;Kt++)Le.setValue(z,"_gl_DrawID",Kt),tt.render(Ge[Kt]/Re,it[Kt])}else if(K.isInstancedMesh)tt.renderInstances(we,pt,K.count);else if(Y.isInstancedBufferGeometry){let Ge=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,it=Math.min(Y.instanceCount,Ge);tt.renderInstances(we,pt,it)}else tt.render(we,pt)},this.compile=function(T,G,Y=null){Y===null&&(Y=T),M=yt.get(Y),M.init(G),F.push(M),Y.traverseVisible(function(K){K.isLight&&K.layers.test(G.layers)&&(M.pushLight(K),K.castShadow&&M.pushShadow(K))}),T!==Y&&T.traverseVisible(function(K){K.isLight&&K.layers.test(G.layers)&&(M.pushLight(K),K.castShadow&&M.pushShadow(K))}),M.setupLights();let $=new Set;return T.traverse(function(K){if(!(K.isMesh||K.isPoints||K.isLine||K.isSprite))return;let oe=K.material;if(oe)if(Array.isArray(oe))for(let de=0;de<oe.length;de++){let fe=oe[de];zc(fe,Y,K),$.add(fe)}else zc(oe,Y,K),$.add(oe)}),M=F.pop(),$},this.compileAsync=function(T,G,Y=null){let $=this.compile(T,G,Y);return new Promise(K=>{function oe(){$.forEach(function(de){ne.get(de).currentProgram.isReady()&&$.delete(de)}),$.size!==0?setTimeout(oe,10):K(T)}ue.get("KHR_parallel_shader_compile")!==null?oe():setTimeout(oe,10)})};let io=null;function Gc(){on.stop()}function Vc(){on.start()}let on=new ju;function no(T,G,Y,$){if(T.visible===!1)return;if(T.layers.test(G.layers)){if(T.isGroup)Y=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(G);else if(T.isLightProbeGrid)M.pushLightProbeGrid(T);else if(T.isLight)M.pushLight(T),T.castShadow&&M.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||D.intersectsSprite(T)){$&&J.setFromMatrixPosition(T.matrixWorld).applyMatrix4(k);let oe=Ct.update(T),de=T.material;de.visible&&E.push(T,oe,de,Y,J.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||D.intersectsObject(T))){let oe=Ct.update(T),de=T.material;if($&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),J.copy(T.boundingSphere.center)):(oe.boundingSphere===null&&oe.computeBoundingSphere(),J.copy(oe.boundingSphere.center)),J.applyMatrix4(T.matrixWorld).applyMatrix4(k)),Array.isArray(de)){let fe=oe.groups;for(let xe=0,Ce=fe.length;xe<Ce;xe++){let ke=fe[xe],He=de[ke.materialIndex];He&&He.visible&&E.push(T,oe,He,Y,J.z,ke)}}else de.visible&&E.push(T,oe,de,Y,J.z,null)}}let K=T.children;for(let oe=0,de=K.length;oe<de;oe++)no(K[oe],G,Y,$)}function kc(T,G,Y,$){let{opaque:K,transmissive:oe,transparent:de}=T;M.setupLightsView(Y),I===!0&&$e.setGlobalState(N.clippingPlanes,Y),$&&te.viewport(ge.copy($)),K.length>0&&os(K,G,Y),oe.length>0&&os(oe,G,Y),de.length>0&&os(de,G,Y),te.buffers.depth.setTest(!0),te.buffers.depth.setMask(!0),te.buffers.color.setMask(!0),te.setPolygonOffset(!1)}function Hc(T,G,Y,$){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[$.id]===void 0){let He=ue.has("EXT_color_buffer_half_float")||ue.has("EXT_color_buffer_float");M.state.transmissionRenderTarget[$.id]=new Vt(1,1,{generateMipmaps:!0,type:He?_i:Wt,minFilter:Mn,samples:Math.max(4,Ae.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ve.workingColorSpace})}let K=M.state.transmissionRenderTarget[$.id],oe=$.viewport||ge;K.setSize(oe.z*N.transmissionResolutionScale,oe.w*N.transmissionResolutionScale);let de=N.getRenderTarget(),fe=N.getActiveCubeFace(),xe=N.getActiveMipmapLevel();N.setRenderTarget(K),N.getClearColor(he),le=N.getClearAlpha(),le<1&&N.setClearColor(16777215,.5),N.clear(),ve&&at.render(Y);let Ce=N.toneMapping;N.toneMapping=ai;let ke=$.viewport;if($.viewport!==void 0&&($.viewport=void 0),M.setupLightsView($),I===!0&&$e.setGlobalState(N.clippingPlanes,$),os(T,Y,$),pe.updateMultisampleRenderTarget(K),pe.updateRenderTargetMipmap(K),ue.has("WEBGL_multisampled_render_to_texture")===!1){let He=!1;for(let we=0,We=G.length;we<We;we++){let pt=G[we],{object:ct,geometry:tt,material:Ge,group:it}=pt;if(Ge.side===Dt&&ct.layers.test($.layers)){let xt=Ge.side;Ge.side=Ut,Ge.needsUpdate=!0,Wc(ct,Y,$,tt,Ge,it),Ge.side=xt,Ge.needsUpdate=!0,He=!0}}He===!0&&(pe.updateMultisampleRenderTarget(K),pe.updateRenderTargetMipmap(K))}N.setRenderTarget(de,fe,xe),N.setClearColor(he,le),ke!==void 0&&($.viewport=ke),N.toneMapping=Ce}function os(T,G,Y){let $=G.isScene===!0?G.overrideMaterial:null;for(let K=0,oe=T.length;K<oe;K++){let de=T[K],{object:fe,geometry:xe,group:Ce}=de,ke=de.material;ke.allowOverride===!0&&$!==null&&(ke=$),fe.layers.test(Y.layers)&&Wc(fe,G,Y,xe,ke,Ce)}}function Wc(T,G,Y,$,K,oe){T.onBeforeRender(N,G,Y,$,K,oe),T.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),K.onBeforeRender(N,G,Y,$,T,oe),K.transparent===!0&&K.side===Dt&&K.forceSinglePass===!1?(K.side=Ut,K.needsUpdate=!0,N.renderBufferDirect(Y,G,$,K,T,oe),K.side=nn,K.needsUpdate=!0,N.renderBufferDirect(Y,G,$,K,T,oe),K.side=Dt):N.renderBufferDirect(Y,G,$,K,T,oe),T.onAfterRender(N,G,Y,$,K,oe)}function ls(T,G,Y){G.isScene!==!0&&(G=se);let $=ne.get(T),K=M.state.lights,oe=M.state.shadowsArray,de=K.state.version,fe=Se.getParameters(T,K.state,oe,G,Y,M.state.lightProbeGridArray),xe=Se.getProgramCacheKey(fe),Ce=$.programs;$.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?G.environment:null,$.fog=G.fog;let ke=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;$.envMap=Ke.get(T.envMap||$.environment,ke),$.envMapRotation=$.environment!==null&&T.envMap===null?G.environmentRotation:T.envMapRotation,Ce===void 0&&(T.addEventListener("dispose",Bc),Ce=new Map,$.programs=Ce);let He=Ce.get(xe);if(He!==void 0){if($.currentProgram===He&&$.lightsStateVersion===de)return jc(T,fe),He}else fe.uniforms=Se.getUniforms(T),B!==null&&T.isNodeMaterial&&B.build(T,Y,fe),T.onBeforeCompile(fe,N),He=Se.acquireProgram(fe,xe),Ce.set(xe,He),$.uniforms=fe.uniforms;let we=$.uniforms;return(T.isShaderMaterial||T.isRawShaderMaterial)&&T.clipping!==!0||(we.clippingPlanes=$e.uniform),jc(T,fe),$.needsLights=function(We){return We.isMeshLambertMaterial||We.isMeshToonMaterial||We.isMeshPhongMaterial||We.isMeshStandardMaterial||We.isShadowMaterial||We.isShaderMaterial&&We.lights===!0}(T),$.lightsStateVersion=de,$.needsLights&&(we.ambientLightColor.value=K.state.ambient,we.lightProbe.value=K.state.probe,we.directionalLights.value=K.state.directional,we.directionalLightShadows.value=K.state.directionalShadow,we.spotLights.value=K.state.spot,we.spotLightShadows.value=K.state.spotShadow,we.rectAreaLights.value=K.state.rectArea,we.ltc_1.value=K.state.rectAreaLTC1,we.ltc_2.value=K.state.rectAreaLTC2,we.pointLights.value=K.state.point,we.pointLightShadows.value=K.state.pointShadow,we.hemisphereLights.value=K.state.hemi,we.directionalShadowMatrix.value=K.state.directionalShadowMatrix,we.spotLightMatrix.value=K.state.spotLightMatrix,we.spotLightMap.value=K.state.spotLightMap,we.pointShadowMatrix.value=K.state.pointShadowMatrix),$.lightProbeGrid=M.state.lightProbeGridArray.length>0,$.currentProgram=He,$.uniformsList=null,He}function Xc(T){if(T.uniformsList===null){let G=T.currentProgram.getUniforms();T.uniformsList=fr.seqWithValue(G.seq,T.uniforms)}return T.uniformsList}function jc(T,G){let Y=ne.get(T);Y.outputColorSpace=G.outputColorSpace,Y.batching=G.batching,Y.batchingColor=G.batchingColor,Y.instancing=G.instancing,Y.instancingColor=G.instancingColor,Y.instancingMorph=G.instancingMorph,Y.skinning=G.skinning,Y.morphTargets=G.morphTargets,Y.morphNormals=G.morphNormals,Y.morphColors=G.morphColors,Y.morphTargetsCount=G.morphTargetsCount,Y.numClippingPlanes=G.numClippingPlanes,Y.numIntersection=G.numClipIntersection,Y.vertexAlphas=G.vertexAlphas,Y.vertexTangents=G.vertexTangents,Y.toneMapping=G.toneMapping}on.setAnimationLoop(function(T){io&&io(T)}),typeof self<"u"&&on.setContext(self),this.setAnimationLoop=function(T){io=T,lt.setAnimationLoop(T),T===null?on.stop():on.start()},lt.addEventListener("sessionstart",Gc),lt.addEventListener("sessionend",Vc),this.render=function(T,G){if(G!==void 0&&G.isCamera!==!0)return void Te("WebGLRenderer.render: camera is not an instance of THREE.Camera.");if(H===!0)return;B!==null&&B.renderStart(T,G);let Y=lt.enabled===!0&&lt.isPresenting===!0,$=L!==null&&(W===null||Y)&&L.begin(N,W);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),lt.enabled!==!0||lt.isPresenting!==!0||L!==null&&L.isCompositing()!==!1||(lt.cameraAutoUpdate===!0&&lt.updateCamera(G),G=lt.getCamera()),T.isScene===!0&&T.onBeforeRender(N,T,G,W),M=yt.get(T,F.length),M.init(G),M.state.textureUnits=pe.getTextureUnits(),F.push(M),k.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),D.setFromProjectionMatrix(k,Ci,G.reversedDepth),A=this.localClippingEnabled,I=$e.init(this.clippingPlanes,A),E=Be.get(T,P.length),E.init(),P.push(E),lt.enabled===!0&&lt.isPresenting===!0){let oe=N.xr.getDepthSensingMesh();oe!==null&&no(oe,G,-1/0,N.sortObjects)}no(T,G,0,N.sortObjects),E.finish(),N.sortObjects===!0&&E.sort(R,b,G.reversedDepth),ve=lt.enabled===!1||lt.isPresenting===!1||lt.hasDepthSensing()===!1,ve&&at.addToRenderList(E,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),I===!0&&$e.beginShadows();let K=M.state.shadowsArray;if(dt.render(K,T,G),I===!0&&$e.endShadows(),($&&L.hasRenderPass())===!1){let oe=E.opaque,de=E.transmissive;if(M.setupLights(),G.isArrayCamera){let fe=G.cameras;if(de.length>0)for(let xe=0,Ce=fe.length;xe<Ce;xe++)Hc(oe,de,T,fe[xe]);ve&&at.render(T);for(let xe=0,Ce=fe.length;xe<Ce;xe++){let ke=fe[xe];kc(E,T,ke,ke.viewport)}}else de.length>0&&Hc(oe,de,T,G),ve&&at.render(T),kc(E,T,G)}W!==null&&U===0&&(pe.updateMultisampleRenderTarget(W),pe.updateRenderTargetMipmap(W)),$&&L.end(N),T.isScene===!0&&T.onAfterRender(N,T,G),zi.resetDefaultState(),re=-1,Me=null,F.pop(),F.length>0?(M=F[F.length-1],pe.setTextureUnits(M.state.textureUnits),I===!0&&$e.setGlobalState(N.clippingPlanes,M.state.camera)):M=null,P.pop(),E=P.length>0?P[P.length-1]:null,B!==null&&B.renderEnd()},this.getActiveCubeFace=function(){return q},this.getActiveMipmapLevel=function(){return U},this.getRenderTarget=function(){return W},this.setRenderTargetTextures=function(T,G,Y){let $=ne.get(T);$.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,$.__autoAllocateDepthBuffer===!1&&($.__useRenderToTexture=!1),ne.get(T.texture).__webglTexture=G,ne.get(T.depthTexture).__webglTexture=$.__autoAllocateDepthBuffer?void 0:Y,$.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,G){let Y=ne.get(T);Y.__webglFramebuffer=G,Y.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(T,G=0,Y=0){W=T,q=G,U=Y;let $=null,K=!1,oe=!1;if(T){let de=ne.get(T);if(de.__useDefaultFramebuffer!==void 0)return te.bindFramebuffer(z.FRAMEBUFFER,de.__webglFramebuffer),ge.copy(T.viewport),_e.copy(T.scissor),ie=T.scissorTest,te.viewport(ge),te.scissor(_e),te.setScissorTest(ie),void(re=-1);if(de.__webglFramebuffer===void 0)pe.setupRenderTarget(T);else if(de.__hasExternalTextures)pe.rebindTextures(T,ne.get(T.texture).__webglTexture,ne.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let Ce=T.depthTexture;if(de.__boundDepthTexture!==Ce){if(Ce!==null&&ne.has(Ce)&&(T.width!==Ce.image.width||T.height!==Ce.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");pe.setupDepthRenderbuffer(T)}}let fe=T.texture;(fe.isData3DTexture||fe.isDataArrayTexture||fe.isCompressedArrayTexture)&&(oe=!0);let xe=ne.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?($=Array.isArray(xe[G])?xe[G][Y]:xe[G],K=!0):$=T.samples>0&&pe.useMultisampledRTT(T)===!1?ne.get(T).__webglMultisampledFramebuffer:Array.isArray(xe)?xe[Y]:xe,ge.copy(T.viewport),_e.copy(T.scissor),ie=T.scissorTest}else ge.copy(C).multiplyScalar(ee).floor(),_e.copy(O).multiplyScalar(ee).floor(),ie=y;if(Y!==0&&($=Z),te.bindFramebuffer(z.FRAMEBUFFER,$)&&te.drawBuffers(T,$),te.viewport(ge),te.scissor(_e),te.setScissorTest(ie),K){let de=ne.get(T.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+G,de.__webglTexture,Y)}else if(oe){let de=G;for(let fe=0;fe<T.textures.length;fe++){let xe=ne.get(T.textures[fe]);z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0+fe,xe.__webglTexture,Y,de)}}else if(T!==null&&Y!==0){let de=ne.get(T.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,de.__webglTexture,Y)}re=-1},this.readRenderTargetPixels=function(T,G,Y,$,K,oe,de,fe=0){if(!T||!T.isWebGLRenderTarget)return void Te("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=ne.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&de!==void 0&&(xe=xe[de]),xe){te.bindFramebuffer(z.FRAMEBUFFER,xe);try{let Ce=T.textures[fe],ke=Ce.format,He=Ce.type;if(T.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+fe),!Ae.textureFormatReadable(ke))return void Te("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");if(!Ae.textureTypeReadable(He))return void Te("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");G>=0&&G<=T.width-$&&Y>=0&&Y<=T.height-K&&z.readPixels(G,Y,$,K,ci.convert(ke),ci.convert(He),oe)}finally{let Ce=W!==null?ne.get(W).__webglFramebuffer:null;te.bindFramebuffer(z.FRAMEBUFFER,Ce)}}},this.readRenderTargetPixelsAsync=async function(T,G,Y,$,K,oe,de,fe=0){if(!T||!T.isWebGLRenderTarget)throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=ne.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&de!==void 0&&(xe=xe[de]),xe){if(G>=0&&G<=T.width-$&&Y>=0&&Y<=T.height-K){te.bindFramebuffer(z.FRAMEBUFFER,xe);let Ce=T.textures[fe],ke=Ce.format,He=Ce.type;if(T.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+fe),!Ae.textureFormatReadable(ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ae.textureTypeReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let we=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,we),z.bufferData(z.PIXEL_PACK_BUFFER,oe.byteLength,z.STREAM_READ),z.readPixels(G,Y,$,K,ci.convert(ke),ci.convert(He),0);let We=W!==null?ne.get(W).__webglFramebuffer:null;te.bindFramebuffer(z.FRAMEBUFFER,We);let pt=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await gu(z,pt,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,we),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,oe),z.deleteBuffer(we),z.deleteSync(pt),oe}throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(T,G=null,Y=0){let $=Math.pow(2,-Y),K=Math.floor(T.image.width*$),oe=Math.floor(T.image.height*$),de=G!==null?G.x:0,fe=G!==null?G.y:0;pe.setTexture2D(T,0),z.copyTexSubImage2D(z.TEXTURE_2D,Y,0,0,de,fe,K,oe),te.unbindTexture()},this.copyTextureToTexture=function(T,G,Y=null,$=null,K=0,oe=0){let de,fe,xe,Ce,ke,He,we,We,pt,ct=T.isCompressedTexture?T.mipmaps[oe]:T.image;if(Y!==null)de=Y.max.x-Y.min.x,fe=Y.max.y-Y.min.y,xe=Y.isBox3?Y.max.z-Y.min.z:1,Ce=Y.min.x,ke=Y.min.y,He=Y.isBox3?Y.min.z:0;else{let hi=Math.pow(2,-K);de=Math.floor(ct.width*hi),fe=Math.floor(ct.height*hi),xe=T.isDataArrayTexture?ct.depth:T.isData3DTexture?Math.floor(ct.depth*hi):1,Ce=0,ke=0,He=0}$!==null?(we=$.x,We=$.y,pt=$.z):(we=0,We=0,pt=0);let tt=ci.convert(G.format),Ge=ci.convert(G.type),it;G.isData3DTexture?(pe.setTexture3D(G,0),it=z.TEXTURE_3D):G.isDataArrayTexture||G.isCompressedArrayTexture?(pe.setTexture2DArray(G,0),it=z.TEXTURE_2D_ARRAY):(pe.setTexture2D(G,0),it=z.TEXTURE_2D),te.activeTexture(z.TEXTURE0),te.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,G.flipY),te.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),te.pixelStorei(z.UNPACK_ALIGNMENT,G.unpackAlignment);let xt=te.getParameter(z.UNPACK_ROW_LENGTH),Re=te.getParameter(z.UNPACK_IMAGE_HEIGHT),Le=te.getParameter(z.UNPACK_SKIP_PIXELS),Kt=te.getParameter(z.UNPACK_SKIP_ROWS),ro=te.getParameter(z.UNPACK_SKIP_IMAGES);te.pixelStorei(z.UNPACK_ROW_LENGTH,ct.width),te.pixelStorei(z.UNPACK_IMAGE_HEIGHT,ct.height),te.pixelStorei(z.UNPACK_SKIP_PIXELS,Ce),te.pixelStorei(z.UNPACK_SKIP_ROWS,ke),te.pixelStorei(z.UNPACK_SKIP_IMAGES,He);let cs=T.isDataArrayTexture||T.isData3DTexture,_r=G.isDataArrayTexture||G.isData3DTexture;if(T.isDepthTexture){let hi=ne.get(T),Cn=ne.get(G),xi=ne.get(hi.__renderTarget),so=ne.get(Cn.__renderTarget);te.bindFramebuffer(z.READ_FRAMEBUFFER,xi.__webglFramebuffer),te.bindFramebuffer(z.DRAW_FRAMEBUFFER,so.__webglFramebuffer);for(let Rn=0;Rn<xe;Rn++)cs&&(z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,ne.get(T).__webglTexture,K,He+Rn),z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,ne.get(G).__webglTexture,oe,pt+Rn)),z.blitFramebuffer(Ce,ke,de,fe,we,We,de,fe,z.DEPTH_BUFFER_BIT,z.NEAREST);te.bindFramebuffer(z.READ_FRAMEBUFFER,null),te.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if(K!==0||T.isRenderTargetTexture||ne.has(T)){let hi=ne.get(T),Cn=ne.get(G);te.bindFramebuffer(z.READ_FRAMEBUFFER,X),te.bindFramebuffer(z.DRAW_FRAMEBUFFER,V);for(let xi=0;xi<xe;xi++)cs?z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,hi.__webglTexture,K,He+xi):z.framebufferTexture2D(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,hi.__webglTexture,K),_r?z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Cn.__webglTexture,oe,pt+xi):z.framebufferTexture2D(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,Cn.__webglTexture,oe),K!==0?z.blitFramebuffer(Ce,ke,de,fe,we,We,de,fe,z.COLOR_BUFFER_BIT,z.NEAREST):_r?z.copyTexSubImage3D(it,oe,we,We,pt+xi,Ce,ke,de,fe):z.copyTexSubImage2D(it,oe,we,We,Ce,ke,de,fe);te.bindFramebuffer(z.READ_FRAMEBUFFER,null),te.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else _r?T.isDataTexture||T.isData3DTexture?z.texSubImage3D(it,oe,we,We,pt,de,fe,xe,tt,Ge,ct.data):G.isCompressedArrayTexture?z.compressedTexSubImage3D(it,oe,we,We,pt,de,fe,xe,tt,ct.data):z.texSubImage3D(it,oe,we,We,pt,de,fe,xe,tt,Ge,ct):T.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,oe,we,We,de,fe,tt,Ge,ct.data):T.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,oe,we,We,ct.width,ct.height,tt,ct.data):z.texSubImage2D(z.TEXTURE_2D,oe,we,We,de,fe,tt,Ge,ct);te.pixelStorei(z.UNPACK_ROW_LENGTH,xt),te.pixelStorei(z.UNPACK_IMAGE_HEIGHT,Re),te.pixelStorei(z.UNPACK_SKIP_PIXELS,Le),te.pixelStorei(z.UNPACK_SKIP_ROWS,Kt),te.pixelStorei(z.UNPACK_SKIP_IMAGES,ro),oe===0&&G.generateMipmaps&&z.generateMipmap(it),te.unbindTexture()},this.initRenderTarget=function(T){ne.get(T).__webglFramebuffer===void 0&&pe.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?pe.setTextureCube(T,0):T.isData3DTexture?pe.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?pe.setTexture2DArray(T,0):pe.setTexture2D(T,0),te.unbindTexture()},this.resetState=function(){q=0,U=0,W=null,te.reset(),zi.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ci}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ve._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ve._getUnpackColorSpace()}};var Qu={type:"change"},Pc={type:"start"},td={type:"end"},Ka=new fi,ed=new Yt,Am=Math.cos(70*rc.DEG2RAD),gt=new w,Ot=2*Math.PI,Je={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Rc=1e-6,$a=class extends Zr{constructor(e,t=null){super(e,t),this.state=Je.NONE,this.target=new w,this.cursor=new w,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:en.ROTATE,MIDDLE:en.DOLLY,RIGHT:en.PAN},this.touches={ONE:tn.ROTATE,TWO:tn.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new w,this._lastQuaternion=new Lt,this._lastTargetPosition=new w,this._quat=new Lt().setFromUnitVectors(e.up,new w(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new lr,this._sphericalDelta=new lr,this._scale=1,this._panOffset=new w,this._rotateStart=new Q,this._rotateEnd=new Q,this._rotateDelta=new Q,this._panStart=new Q,this._panEnd=new Q,this._panDelta=new Q,this._dollyStart=new Q,this._dollyEnd=new Q,this._dollyDelta=new Q,this._dollyDirection=new w,this._mouse=new Q,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Rm.bind(this),this._onPointerDown=Cm.bind(this),this._onPointerUp=Pm.bind(this),this._onContextMenu=Fm.bind(this),this._onMouseWheel=Dm.bind(this),this._onKeyDown=Nm.bind(this),this._onTouchStart=Um.bind(this),this._onTouchMove=Om.bind(this),this._onMouseDown=Im.bind(this),this._onMouseMove=Lm.bind(this),this._interceptControlDown=Bm.bind(this),this._interceptControlUp=zm.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Qu),this.update(),this.state=Je.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;gt.copy(t).sub(this.target),gt.applyQuaternion(this._quat),this._spherical.setFromVector3(gt),this.autoRotate&&this.state===Je.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,n=this.maxAzimuthAngle;isFinite(i)&&isFinite(n)&&(i<-Math.PI?i+=Ot:i>Math.PI&&(i-=Ot),n<-Math.PI?n+=Ot:n>Math.PI&&(n-=Ot),i<=n?this._spherical.theta=Math.max(i,Math.min(n,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+n)/2?Math.max(i,this._spherical.theta):Math.min(n,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let s=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),s=a!=this._spherical.radius}if(gt.setFromSpherical(this._spherical),gt.applyQuaternion(this._quatInverse),t.copy(this.target).add(gt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=gt.length();a=this._clampDistance(o*this._scale);let c=o-a;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),s=!!c}else if(this.object.isOrthographicCamera){let o=new w(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),s=c!==this.object.zoom;let l=new w(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(o),this.object.updateMatrixWorld(),a=gt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Ka.origin.copy(this.object.position),Ka.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ka.direction))<Am?this.object.lookAt(this.target):(ed.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ka.intersectPlane(ed,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),s=!0)}return this._scale=1,this._performCursorZoom=!1,s||this._lastPosition.distanceToSquared(this.object.position)>Rc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Rc||this._lastTargetPosition.distanceToSquared(this.target)>Rc?(this.dispatchEvent(Qu),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Ot/60*this.autoRotateSpeed*e:Ot/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){gt.setFromMatrixColumn(t,0),gt.multiplyScalar(-e),this._panOffset.add(gt)}_panUp(e,t){this.screenSpacePanning===!0?gt.setFromMatrixColumn(t,1):(gt.setFromMatrixColumn(t,0),gt.crossVectors(this.object.up,gt)),gt.multiplyScalar(e),this._panOffset.add(gt)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let n=this.object.position;gt.copy(n).sub(this.target);let s=gt.length();s*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*s/i.clientHeight,this.object.matrix),this._panUp(2*t*s/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),n=e-i.left,s=t-i.top,a=i.width,o=i.height;this._mouse.x=n/a*2-1,this._mouse.y=-(s/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Ot*this._rotateDelta.x/t.clientHeight),this._rotateUp(Ot*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Ot*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Ot*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Ot*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Ot*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._rotateStart.set(i,n)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._panStart.set(i,n)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,n=e.pageY-t.y,s=Math.sqrt(i*i+n*n);this._dollyStart.set(0,s)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),n=.5*(e.pageX+i.x),s=.5*(e.pageY+i.y);this._rotateEnd.set(n,s)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Ot*this._rotateDelta.x/t.clientHeight),this._rotateUp(Ot*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._panEnd.set(i,n)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,n=e.pageY-t.y,s=Math.sqrt(i*i+n*n);this._dollyEnd.set(0,s),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Q,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function Cm(r){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(r.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(r)&&(this._addPointer(r),r.pointerType==="touch"?this._onTouchStart(r):this._onMouseDown(r),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Rm(r){this.enabled!==!1&&(r.pointerType==="touch"?this._onTouchMove(r):this._onMouseMove(r))}function Pm(r){switch(this._removePointer(r),this._pointers.length){case 0:this.domElement.releasePointerCapture(r.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(td),this.state=Je.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Im(r){let e;switch(r.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case en.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(r),this.state=Je.DOLLY;break;case en.ROTATE:if(r.ctrlKey||r.metaKey||r.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(r),this.state=Je.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(r),this.state=Je.ROTATE}break;case en.PAN:if(r.ctrlKey||r.metaKey||r.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(r),this.state=Je.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(r),this.state=Je.PAN}break;default:this.state=Je.NONE}this.state!==Je.NONE&&this.dispatchEvent(Pc)}function Lm(r){switch(this.state){case Je.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(r);break;case Je.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(r);break;case Je.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(r);break}}function Dm(r){this.enabled===!1||this.enableZoom===!1||this.state!==Je.NONE||(r.preventDefault(),this.dispatchEvent(Pc),this._handleMouseWheel(this._customWheelEvent(r)),this.dispatchEvent(td))}function Nm(r){this.enabled!==!1&&this._handleKeyDown(r)}function Um(r){switch(this._trackPointer(r),this._pointers.length){case 1:switch(this.touches.ONE){case tn.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(r),this.state=Je.TOUCH_ROTATE;break;case tn.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(r),this.state=Je.TOUCH_PAN;break;default:this.state=Je.NONE}break;case 2:switch(this.touches.TWO){case tn.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(r),this.state=Je.TOUCH_DOLLY_PAN;break;case tn.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(r),this.state=Je.TOUCH_DOLLY_ROTATE;break;default:this.state=Je.NONE}break;default:this.state=Je.NONE}this.state!==Je.NONE&&this.dispatchEvent(Pc)}function Om(r){switch(this._trackPointer(r),this.state){case Je.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(r),this.update();break;case Je.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(r),this.update();break;case Je.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(r),this.update();break;case Je.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(r),this.update();break;default:this.state=Je.NONE}}function Fm(r){this.enabled!==!1&&r.preventDefault()}function Bm(r){r.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function zm(r){r.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var ss=document.getElementById("thermal-3d-shell"),An=document.getElementById("thermal-3d-canvas"),Gm=document.getElementById("thermal-3d-fallback"),Vm=document.getElementById("thermal-component-readout"),Ic=document.getElementById("thermal-3d-legend"),qe=.01,st={x:343,y:153,z:198},sn={heat:{color:16748390,label:"Heat source"},fan:{color:5429759,label:"Fan"},duct:{color:3064998,label:"Printed duct"},structure:{color:10465979,label:"Structure"},porous:{color:9082524,label:"Cables / grille"}},rs={measured:{color:13238077,label:"Measured / official"},official:{color:13238077,label:"Measured / official"},photo:{color:5429759,label:"From photos"},assumed:{color:11111392,label:"Assumed"}},km={GPU:16748390,CPU_COOLER:16740175,RAM:15909198,PSU:16757611},Hm=5429759,Wm=16748390;if(ss&&An){let r=!1,e=new IntersectionObserver(t=>{t.some(i=>i.isIntersecting)&&!r&&(r=!0,e.disconnect(),Xm().catch(i=>{console.error("Terra 3D viewer:",i),An.hidden=!0,Gm.hidden=!1}))},{rootMargin:"120px"});e.observe(ss)}var _t=(r,e,t)=>new w((r-st.x/2)*qe,(t-st.z/2)*qe,(e-st.y/2)*qe),nd=r=>_t(r.min[0]+r.size[0]/2,r.min[1]+r.size[1]/2,r.min[2]+r.size[2]/2),rd=r=>[r.size[0]*qe,r.size[2]*qe,r.size[1]*qe];async function Xm(){let r=await fetch("/control/data/terra-thermal-summary.json",{credentials:"same-origin",headers:{accept:"application/json"}});if(!r.ok)throw new Error(`Geometry request failed: ${r.status}`);let e=(await r.json()).geometry,[t,i,n]=e.case.outer_body_mm;st={x:t,y:i,z:n};let s=new Za({canvas:An,antialias:!0,alpha:!0,powerPreference:"low-power"});s.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)),s.outputColorSpace=Pt;let a=new Lr,o=new Et(32,1,.05,60),c=new $a(o,An);c.enableDamping=!1,c.minDistance=2.2,c.maxDistance=11,c.addEventListener("change",q),a.add(new qr(15137791,1054490,1.7));let l=new or(16777215,2);l.position.set(-3,5,4),a.add(l);let h=new or(11111392,.9);h.position.set(4,1,-3),a.add(h);let d=new It;a.add(d);let p=[],u=[],g=[],m=new It;d.add(m);let v=(U,W)=>W==="certainty"?(rs[U.certainty]||rs.assumed).color:U.role==="heat"?km[U.id]??sn.heat.color:(sn[U.role]||sn.structure).color,f=(U,W={})=>{let re=W.opacity??.35,Me=W.line?new gn({transparent:!0,opacity:re}):new Fi({transparent:re<1,opacity:re,roughness:.55,metalness:.15,depthWrite:re>.7,side:W.side??nn});return Me.color.setHex(v(U,"role")),u.push({material:Me,part:U}),Me},_=(U,W)=>(U.userData.part=W,p.push(U),U);qm(d,e.case),Ym(d);for(let U of e.panels||[])Zm(m,U);let x={GPU:[0,0,-1.2],GPU_FAN_1:[0,0,-1.2],GPU_FAN_2:[0,0,-1.2],GPU_FAN_3:[0,0,-1.2],GPU_DUCT:[0,0,-2.05],SPINE:[0,0,-.35],RISER:[0,-.35,-.9],MOTHERBOARD:[0,0,.45],RAM:[0,.15,1],CPU_COOLER:[0,0,1.2],CPU_FAN:[0,0,1.2],CPU_DUCT:[0,0,2.05],PSU:[-.35,0,1.3],PSU_FAN:[-.35,0,1.3],BOTTOM_FAN:[0,-.9,0],BOTTOM_GRILLE:[0,-.55,0],TOP_FAN:[0,.9,0],CABLES_GPU:[-.5,0,-.85],CABLES_MAIN:[0,.1,.75],CABLES_BOTTOM:[0,-.45,.75]};for(let U of e.components){let W=new It;W.userData.offset=new w(...x[U.id]||[0,0,0]),d.add(W),g.push(W),U.fan?Qm(W,U,f,_):U.shape?.type==="rings"?ef(W,U,f,_):U.shape?.type==="tube"?tf(W,U,f,_):U.shape?.type==="disc_grille"?nf(W,U,f,_):U.role==="porous"?rf(W,U,f,_):U.id==="RAM"?Km(W,U,f,_):U.id==="SPINE"?$m(W,U,f,_):U.id==="CPU_COOLER"?Jm(W,U,f,_):Lc(W,U,f,_)}let S=new It;d.add(S),sf(S,e);let E="role";function M(){if(!Ic)return;let U=E==="certainty"?[rs.measured,rs.photo,rs.assumed]:[sn.heat,sn.fan,sn.duct,sn.structure,sn.porous];Ic.setAttribute("aria-label",E==="certainty"?"How sure each position is":"What each part does"),Ic.innerHTML=U.map(({label:W,color:re})=>`<span><i style="background:#${re.toString(16).padStart(6,"0")}"></i>${W}</span>`).join("")}let P=(U,W)=>document.querySelectorAll(U).forEach(re=>re.addEventListener("click",()=>W(re))),F=(U,W)=>{U.setAttribute("aria-pressed",String(W)),U.classList.toggle("active",W)};P("[data-thermal-colour]",U=>{document.querySelectorAll("[data-thermal-colour]").forEach(W=>F(W,W===U)),E=U.dataset.thermalColour;for(let{material:W,part:re}of u)W.color.setHex(v(re,E));M(),q()});let L=document.querySelector("[data-thermal-panels]");m.visible=L?L.getAttribute("aria-pressed")==="true":!0,P("[data-thermal-panels]",U=>{let W=U.getAttribute("aria-pressed")!=="true";F(U,W),m.visible=W,q()}),P("[data-thermal-flow]",U=>{let W=U.getAttribute("aria-pressed")!=="true";F(U,W),S.visible=W,q()}),P("[data-thermal-explode]",U=>{let W=U.getAttribute("aria-pressed")!=="true";F(U,W);for(let re of g)re.position.copy(W?re.userData.offset:new w);S.visible=!W&&(document.querySelector("[data-thermal-flow]")?.getAttribute("aria-pressed")??"true")!=="false",q()});let N={iso:[4.6,3.1,4.3],gpu:[0,.3,-5.6],board:[0,.3,5.6],top:[0,6.4,.01]};P("[data-thermal-camera]",U=>{document.querySelectorAll("[data-thermal-camera]").forEach(W=>F(W,W===U)),X(N[U.dataset.thermalCamera])});let H=new Yr,B=new Q,Z=null;An.addEventListener("pointerdown",U=>{Z=[U.clientX,U.clientY]}),An.addEventListener("pointerup",U=>{if(!Z||Math.hypot(U.clientX-Z[0],U.clientY-Z[1])>5)return;let W=An.getBoundingClientRect();B.x=(U.clientX-W.left)/W.width*2-1,B.y=-((U.clientY-W.top)/W.height)*2+1,H.setFromCamera(B,o);let re=H.intersectObjects(p,!1).find(Me=>jm(Me.object));re&&cf(re.object.userData.part)});function X(U){o.position.fromArray(U),c.target.set(0,0,0),c.update(),q()}function V(){let U=Math.max(ss.clientWidth,1),W=Math.max(ss.clientHeight,1);s.setSize(U,W,!1),o.aspect=U/W,o.updateProjectionMatrix(),q()}function q(){s.render(a,o)}M(),new ResizeObserver(V).observe(ss),X(N.iso),V(),window.__terraViewer={scene:a,camera:o,render:q,setCamera:X}}function jm(r){for(let e=r;e;e=e.parent)if(!e.visible)return!1;return!0}function qm(r,e){let t=e.feet_mm||20,i=new ze(new Oi(5.4,3.4),new Fi({color:1712934,roughness:.95}));i.rotation.x=-Math.PI/2,i.position.copy(_t(st.x/2,st.y/2,-t)),r.add(i);let n=new Fi({color:2765621,roughness:.8});for(let s of[22,st.x-22])for(let a of[18,st.y-18]){let o=new ze(new Di(.11,.13,t*qe,20),n);o.position.copy(_t(s,a,-t/2)),r.add(o)}}function Ym(r){let e=new St(st.x*qe,st.z*qe,st.y*qe);r.add(new _n(new Ki(e),new gn({color:10469272,transparent:!0,opacity:.85})));let t=new ze(new St(.03,st.z*qe*.98,st.y*qe*.98),new Fi({color:8015146,roughness:.7,transparent:!0,opacity:.6}));t.position.copy(_t(-1.5,st.y/2,st.z/2)),r.add(t)}function Zm(r,e){let t=e.grille;if(!t)return;let i=new Fi({color:8824202,transparent:!0,opacity:.22,roughness:.8,metalness:.3,side:Dt,depthWrite:!1}),n=(a,o)=>{let c=new Ui;return c.moveTo(0,0),c.lineTo(a,0),c.lineTo(a,o),c.lineTo(0,o),c.lineTo(0,0),c},s;if(e.face==="y-"||e.face==="y+"){let a=n(st.x,st.z);t.rows_x.forEach((o,c)=>{let l=c%2===0?t.gap_z.even:t.gap_z.odd;for(let[h,d]of[[t.slot_z[0],l[0]],[l[1],t.slot_z[1]]])a.holes.push(id(o,h,d,t.slot_w))}),s=new ze(new $i(a,4),i),s.position.copy(_t(0,e.face==="y-"?-.5:st.y+.5,0))}else if(e.face==="z+"){let a=n(st.x,st.y);for(let o=t.x_range[0];o<=t.x_range[1];o+=t.pitch)a.holes.push(id(o,t.y_range[0],t.y_range[1],t.slot_w));s=new ze(new $i(a,4),i),s.rotation.x=Math.PI/2,s.position.copy(_t(0,0,st.z+.5))}s&&(s.scale.setScalar(qe),r.add(s))}function id(r,e,t,i){let n=i/2,s=new Ni;return s.moveTo(r-n,e+n),s.lineTo(r-n,t-n),s.absarc(r,t-n,n,Math.PI,0,!0),s.lineTo(r+n,e+n),s.absarc(r,e+n,n,0,Math.PI,!0),s}function Lc(r,e,t,i,n=.32){let s=new St(...rd(e.box)),a=i(new ze(s,t(e,{opacity:n})),e);a.position.copy(nd(e.box)),r.add(a);let o=new _n(new Ki(s),t(e,{line:!0,opacity:.9}));o.position.copy(a.position),r.add(o)}function Jm(r,e,t,i){Lc(r,e,t,i,.18);let n=e.box,s=18,a=n.size[1]-18,o=new St(.006,n.size[2]*qe*.94,a*qe),c=t(e,{opacity:.6});for(let l=0;l<s;l+=1){let h=i(new ze(o,c),e);h.position.copy(_t(n.min[0]+4+l*(n.size[0]-8)/(s-1),n.min[1]+3+a/2,n.min[2]+n.size[2]/2)),r.add(h)}}function Km(r,e,t,i){let n=e.box;for(let s of[1.5,9.5])Lc(r,{...e,box:{min:[n.min[0]+s,n.min[1],n.min[2]],size:[6,n.size[1],n.size[2]]}},t,i,.6)}function $m(r,e,t,i){let n=e.box,s=new Ui;s.moveTo(0,0),s.lineTo(n.size[0],0),s.lineTo(n.size[0],n.size[2]),s.lineTo(0,n.size[2]),s.lineTo(0,0);for(let[o,c,l,h]of[[150,22,332,180],[14,28,132,176]]){let d=new Ni;d.moveTo(o,c),d.lineTo(l,c),d.lineTo(l,h),d.lineTo(o,h),d.lineTo(o,c),s.holes.push(d)}let a=i(new ze(new $i(s),t(e,{opacity:.18,side:Dt})),e);a.scale.setScalar(qe),a.position.copy(_t(n.min[0],n.min[1]+n.size[1]/2,n.min[2])),r.add(a)}function Qm(r,e,t,i){let n=e.fan,s=n.diameter/2*qe,a=new It;a.add(i(new ze(new yn(s,.02,8,48),t(e,{opacity:.95})),e)),a.add(i(new ze(new $n(s,40),t(e,{opacity:.07,side:Dt})),e));let o=i(new ze(new Di(s*n.hub_ratio,s*n.hub_ratio,Math.max(n.thickness*qe,.03),20),t(e,{opacity:.85})),e);o.rotation.x=Math.PI/2,a.add(o);let c=t(e,{opacity:.5,side:Dt});for(let l=0;l<7;l+=1){let h=new It;h.rotation.z=l*Math.PI*2/7;let d=new ze(new Oi(s*(.95-n.hub_ratio),s*.22),c);d.position.x=s*(n.hub_ratio+.95)/2,d.rotation.x=.55,h.add(i(d,e)),a.add(h)}a.quaternion.setFromUnitVectors(new w(0,0,1),sd(n.axis)),a.position.copy(_t(...n.centre)),r.add(a)}var sd=r=>new w(r[0],r[2],r[1]).normalize();function eo(r,e,t){let i=new Ui;i.absarc(0,0,r,0,Math.PI*2,!1);let n=new Ni;return n.absarc(0,0,e,0,Math.PI*2,!0),i.holes.push(n),new nr(i,{depth:t,bevelEnabled:!1,curveSegments:48})}function to(r,e,t,i,n){let s=new ze(r,e);return s.scale.setScalar(qe),s.position.copy(_t(t,i,n)),s}function ef(r,e,t,i){let n=e.shape,s=e.box.min[1],a=t(e,{opacity:.9}),o=eo(n.r_out,n.r_in,n.height),c=eo(n.flange_r,n.r_in,n.flange_t);for(let l of n.centres_x){r.add(i(to(o,a,l,s,n.centre_z),e)),r.add(i(to(c,a,l,s,n.centre_z),e));for(let h of n.ears_z){let d=new ze(new St(16*qe,13*qe,2*qe),a);d.position.copy(_t(l,s+1,n.centre_z+h)),r.add(i(d,e))}}for(let l=0;l<n.centres_x.length-1;l+=1){let h=new ze(new St((n.centres_x[l+1]-n.centres_x[l]-2*n.r_in+3)*qe,30*qe,n.height*qe),a);h.position.copy(_t((n.centres_x[l]+n.centres_x[l+1])/2,s+n.height/2,n.centre_z)),r.add(i(h,e))}}function tf(r,e,t,i){let n=e.shape,s=t(e,{opacity:.9}),a=e.box.min[1]+e.box.size[1];r.add(i(to(eo(n.r_out,n.r_in,n.height),s,n.centre_x,e.box.min[1],n.centre_z),e)),r.add(i(to(eo(n.flange_r,n.r_in,n.flange_t),s,n.centre_x,a-n.flange_t,n.centre_z),e));for(let o of n.ears_x){let c=Math.abs(o)-n.r_out+8,l=new ze(new St(c*qe,16*qe,2*qe),s);l.position.copy(_t(n.centre_x+Math.sign(o)*(n.r_out+c/2-4),a-1,n.centre_z)),r.add(i(l,e))}}function nf(r,e,t,i){let n=e.shape,s=t(e,{opacity:.9}),a=_t(...n.centre);for(let o=1;o<=n.rings;o+=1){let c=new ze(new yn(n.diameter/2*(o/n.rings)*qe,.006,6,48),s);c.rotation.x=Math.PI/2,c.position.copy(a),r.add(i(c,e))}for(let o=0;o<4;o+=1){let c=new ze(new St(n.diameter*qe,.008,.008),s);c.rotation.y=o*Math.PI/4,c.position.copy(a),r.add(i(c,e))}}function rf(r,e,t,i){let n=e.box,s=new ze(new St(...rd(n)),t(e,{opacity:.05}));s.position.copy(nd(n)),r.add(i(s,e));let a=new _n(new Ki(s.geometry),t(e,{line:!0,opacity:.35}));a.position.copy(s.position),r.add(a);let o=[...e.id].reduce((u,g)=>u*31+g.charCodeAt(0)>>>0,7),c=()=>(o=o*1664525+1013904223>>>0,o/4294967296),l=t(e,{opacity:.8}),h=n.size.indexOf(Math.max(...n.size)),d=[0,1,2].filter(u=>u!==h),p=7;for(let u=0;u<p;u+=1){let g=d.map(()=>.3+.4*c()),m=c()*Math.PI*2,v=[];for(let f=0;f<=8;f+=1){let _=f/8,x=[0,0,0];x[h]=n.min[h]+(.04+.92*_)*n.size[h],d.forEach((S,E)=>{let M=.12*Math.sin(m+_*Math.PI*(2+E));x[S]=n.min[S]+Math.min(.92,Math.max(.08,g[E]+M))*n.size[S]}),v.push(_t(...x))}r.add(i(new ze(new rr(new tr(v),48,.03,8,!1),l),e))}}function sf(r,e){for(let t of e.components){if(!t.fan)continue;let i=t.fan,n=sd(i.axis),s;t.id.startsWith("GPU_FAN")?s=_t(i.centre[0],-45,i.centre[2]):t.id==="CPU_FAN"?s=_t(i.centre[0],st.y+45,i.centre[2]):t.id==="PSU_FAN"?s=_t(i.centre[0],st.y+35,i.centre[2]):s=_t(...i.centre).add(n.clone().multiplyScalar(.18)),r.add(af(s,n,.45,i.flow==="intake"?Hm:Wm))}}function af(r,e,t,i){let n=new It,s=.13,a=new fn({color:i,transparent:!0,opacity:.95}),o=new ze(new Di(.016,.016,t-s,10),a);o.position.y=(t-s)/2;let c=new ze(new Qn(.06,s,14),a);return c.position.y=t-s/2,n.add(o,c),n.position.copy(r),n.quaternion.setFromUnitVectors(new w(0,1,0),e.clone().normalize()),n}var of={measured:"Measured",official:"Official spec",photo:"From photos",assumed:"Assumed \xB7 to measure"},lf={heat:"Heat source",fan:"Fan",duct:"Printed duct",structure:"Structure",porous:"Porous \xB7 cables / grille"};function cf(r){let e=r.box?.size?.map(i=>Number.isInteger(i)?i:i.toFixed(1)).join(" \xD7 "),t=r.heat_W?` \xB7 ~${r.heat_W} W`:"";Vm.innerHTML=`<small>${Qa(lf[r.role]||"")} \xB7 ${Qa(of[r.certainty]||"")}</small><strong>${Qa(r.label)}</strong><span>${e?`${e} mm${t} \xB7 `:""}${Qa(r.basis||"")}</span>`}function Qa(r){return String(r).replace(/[&<>'"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[e])}})();
/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
