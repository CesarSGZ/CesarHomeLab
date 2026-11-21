(()=>{var Bs="185",nn={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},rn={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Nh=0,il=1,Uh=2;var Kr=1,Oh=2,hr=3,sn=0,Bt=1,Tt=2,Si=0,$r=1,nl=2,rl=3,sl=4,Fh=5;var ur=100,Bh=101,zh=102,Gh=103,Vh=104,Hh=200,kh=201,Wh=202,Xh=203,jh=204,qh=205,Yh=206,Zh=207,Jh=208,Kh=209,$h=210,Qh=211,eu=212,tu=213,iu=214,al=0,ol=1,ll=2,Ca=3,cl=4,hl=5,ul=6,dl=7,nu=0,ru=1,su=2,hi=0,pl=1,ml=2,fl=3,gl=4,_l=5,vl=6,yl=7;var xl=300,dr=301,Mn=302,Ra=303,Pa=304,Qr=306,zs=1e3,Ji=1001,Gs=1002,Jt=1003,au=1004;var es=1005;var Ct=1006,Ia=1007;var Sn=1008;var Xt=1009,Ml=1010,Sl=1011,pr=1012,La=1013,zi=1014,ui=1015,bi=1016,Da=1017,Na=1018,mr=1020,bl=35902,Tl=35899,ou=1021,lu=1022,di=1023,an=1026,bn=1027,El=1028,Ua=1029,Tn=1030,wl=1031;var Al=1033,Oa=33776,Fa=33777,Ba=33778,za=33779,Cl=35840,Rl=35841,Pl=35842,Il=35843,Ll=36196,Dl=37492,Nl=37496,Ul=37488,Ol=37489,Ga=37490,Fl=37491,Bl=37808,zl=37809,Gl=37810,Vl=37811,Hl=37812,kl=37813,Wl=37814,Xl=37815,jl=37816,ql=37817,Yl=37818,Zl=37819,Jl=37820,Kl=37821,$l=36492,Ql=36494,ec=36495,tc=36283,ic=36284,Va=36285,nc=36286;var Cr=2300,Vs=2301,Fs=2302,Ho=2303,ko=2400,Wo=2401,Xo=2402;var rc=0,cu=1,En="",Dt="srgb",Rr="srgb-linear",Pr="linear",Ye="srgb";var fn=7680;var hu=512,uu=513,du=514,Ha=515,pu=516,mu=517,ka=518,fu=519,jo=35044;var sc="300 es",Ni=2e3,Yn=2001;function md(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function Ir(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function gu(){let r=Ir("canvas");return r.style.display="block",r}var $c={},Zn=null;function ac(...r){let e="THREE."+r.shift();Zn?Zn("log",e,...r):console.log(e,...r)}function _u(r){let e=r[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=r[1];t&&t.isStackTrace?r[0]+=" "+t.getLocation():r[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return r}function be(...r){let e="THREE."+(r=_u(r)).shift();if(Zn)Zn("warn",e,...r);else{let t=r[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...r)}}function Ee(...r){let e="THREE."+(r=_u(r)).shift();if(Zn)Zn("error",e,...r);else{let t=r[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...r)}}function gn(...r){let e=r.join(" ");e in $c||($c[e]=!0,be(...r))}function vu(r,e,t){return new Promise(function(i,n){setTimeout(function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:n();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}},t)})}var yu={[al]:1,[ll]:6,[cl]:7,[Ca]:5,[ol]:0,[ul]:2,[dl]:4,[hl]:3},si=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i!==void 0&&i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let n=i[e];if(n!==void 0){let s=n.indexOf(t);s!==-1&&n.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let n=i.slice(0);for(let s=0,a=n.length;s<a;s++)n[s].call(this,e);e.target=null}}},Et=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Qc=1234567,jn=Math.PI/180,Jn=180/Math.PI;function wn(){let r=4294967295*Math.random()|0,e=4294967295*Math.random()|0,t=4294967295*Math.random()|0,i=4294967295*Math.random()|0;return(Et[255&r]+Et[r>>8&255]+Et[r>>16&255]+Et[r>>24&255]+"-"+Et[255&e]+Et[e>>8&255]+"-"+Et[e>>16&15|64]+Et[e>>24&255]+"-"+Et[63&t|128]+Et[t>>8&255]+"-"+Et[t>>16&255]+Et[t>>24&255]+Et[255&i]+Et[i>>8&255]+Et[i>>16&255]+Et[i>>24&255]).toLowerCase()}function Be(r,e,t){return Math.max(e,Math.min(t,r))}function qo(r,e){return(r%e+e)%e}function Er(r,e,t){return(1-t)*r+t*e}function Xn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Lt(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(4294967295*r);case Uint16Array:return Math.round(65535*r);case Uint8Array:return Math.round(255*r);case Int32Array:return Math.round(2147483647*r);case Int16Array:return Math.round(32767*r);case Int8Array:return Math.round(127*r);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var oc={DEG2RAD:jn,RAD2DEG:Jn,generateUUID:wn,clamp:Be,euclideanModulo:qo,mapLinear:function(r,e,t,i,n){return i+(r-e)*(n-i)/(t-e)},inverseLerp:function(r,e,t){return r!==e?(t-r)/(e-r):0},lerp:Er,damp:function(r,e,t,i){return Er(r,e,1-Math.exp(-t*i))},pingpong:function(r,e=1){return e-Math.abs(qo(r,2*e)-e)},smoothstep:function(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e))*r*(3-2*r)},smootherstep:function(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e))*r*r*(r*(6*r-15)+10)},randInt:function(r,e){return r+Math.floor(Math.random()*(e-r+1))},randFloat:function(r,e){return r+Math.random()*(e-r)},randFloatSpread:function(r){return r*(.5-Math.random())},seededRandom:function(r){r!==void 0&&(Qc=r);let e=Qc+=1831565813;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296},degToRad:function(r){return r*jn},radToDeg:function(r){return r*Jn},isPowerOfTwo:function(r){return!(r&r-1)&&r!==0},ceilPowerOfTwo:function(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))},floorPowerOfTwo:function(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))},setQuaternionFromProperEuler:function(r,e,t,i,n){let s=Math.cos,a=Math.sin,o=s(t/2),c=a(t/2),l=s((e+i)/2),h=a((e+i)/2),d=s((e-i)/2),p=a((e-i)/2),u=s((i-e)/2),f=a((i-e)/2);switch(n){case"XYX":r.set(o*h,c*d,c*p,o*l);break;case"YZY":r.set(c*p,o*h,c*d,o*l);break;case"ZXZ":r.set(c*d,c*p,o*h,o*l);break;case"XZX":r.set(o*h,c*f,c*u,o*l);break;case"YXY":r.set(c*u,o*h,c*f,o*l);break;case"ZYZ":r.set(c*f,c*u,o*h,o*l);break;default:be("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}},normalize:Lt,denormalize:Xn},dc=class dc{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,n=e.elements;return this.x=n[0]*t+n[3]*i+n[6],this.y=n[1]*t+n[4]*i+n[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Be(this.x,e.x,t.x),this.y=Be(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Be(this.x,e,t),this.y=Be(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Be(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Be(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),n=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*n+e.x,this.y=s*n+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};dc.prototype.isVector2=!0;var Q=dc,Nt=class{constructor(e=0,t=0,i=0,n=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=n}static slerpFlat(e,t,i,n,s,a,o){let c=i[n+0],l=i[n+1],h=i[n+2],d=i[n+3],p=s[a+0],u=s[a+1],f=s[a+2],m=s[a+3];if(d!==m||c!==p||l!==u||h!==f){let y=c*p+l*u+h*f+d*m;y<0&&(p=-p,u=-u,f=-f,m=-m,y=-y);let g=1-o;if(y<.9995){let _=Math.acos(y),x=Math.sin(_);g=Math.sin(g*_)/x,c=c*g+p*(o=Math.sin(o*_)/x),l=l*g+u*o,h=h*g+f*o,d=d*g+m*o}else{c=c*g+p*o,l=l*g+u*o,h=h*g+f*o,d=d*g+m*o;let _=1/Math.sqrt(c*c+l*l+h*h+d*d);c*=_,l*=_,h*=_,d*=_}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,n,s,a){let o=i[n],c=i[n+1],l=i[n+2],h=i[n+3],d=s[a],p=s[a+1],u=s[a+2],f=s[a+3];return e[t]=o*f+h*d+c*u-l*p,e[t+1]=c*f+h*p+l*d-o*u,e[t+2]=l*f+h*u+o*p-c*d,e[t+3]=h*f-o*d-c*p-l*u,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,n){return this._x=e,this._y=t,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,n=e._y,s=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(i/2),h=o(n/2),d=o(s/2),p=c(i/2),u=c(n/2),f=c(s/2);switch(a){case"XYZ":this._x=p*h*d+l*u*f,this._y=l*u*d-p*h*f,this._z=l*h*f+p*u*d,this._w=l*h*d-p*u*f;break;case"YXZ":this._x=p*h*d+l*u*f,this._y=l*u*d-p*h*f,this._z=l*h*f-p*u*d,this._w=l*h*d+p*u*f;break;case"ZXY":this._x=p*h*d-l*u*f,this._y=l*u*d+p*h*f,this._z=l*h*f+p*u*d,this._w=l*h*d-p*u*f;break;case"ZYX":this._x=p*h*d-l*u*f,this._y=l*u*d+p*h*f,this._z=l*h*f-p*u*d,this._w=l*h*d+p*u*f;break;case"YZX":this._x=p*h*d+l*u*f,this._y=l*u*d+p*h*f,this._z=l*h*f-p*u*d,this._w=l*h*d-p*u*f;break;case"XZY":this._x=p*h*d-l*u*f,this._y=l*u*d-p*h*f,this._z=l*h*f+p*u*d,this._w=l*h*d+p*u*f;break;default:be("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,n=Math.sin(i);return this._x=e.x*n,this._y=e.y*n,this._z=e.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],n=t[4],s=t[8],a=t[1],o=t[5],c=t[9],l=t[2],h=t[6],d=t[10],p=i+o+d;if(p>0){let u=.5/Math.sqrt(p+1);this._w=.25/u,this._x=(h-c)*u,this._y=(s-l)*u,this._z=(a-n)*u}else if(i>o&&i>d){let u=2*Math.sqrt(1+i-o-d);this._w=(h-c)/u,this._x=.25*u,this._y=(n+a)/u,this._z=(s+l)/u}else if(o>d){let u=2*Math.sqrt(1+o-i-d);this._w=(s-l)/u,this._x=(n+a)/u,this._y=.25*u,this._z=(c+h)/u}else{let u=2*Math.sqrt(1+d-i-o);this._w=(a-n)/u,this._x=(s+l)/u,this._y=(c+h)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Be(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let n=Math.min(1,t/i);return this.slerp(e,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,n=e._y,s=e._z,a=e._w,o=t._x,c=t._y,l=t._z,h=t._w;return this._x=i*h+a*o+n*l-s*c,this._y=n*h+a*c+s*o-i*l,this._z=s*h+a*l+i*c-n*o,this._w=a*h-i*o-n*c-s*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,n=e._y,s=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,n=-n,s=-s,a=-a,o=-o);let c=1-t;if(o<.9995){let l=Math.acos(o),h=Math.sin(l);c=Math.sin(c*l)/h,t=Math.sin(t*l)/h,this._x=this._x*c+i*t,this._y=this._y*c+n*t,this._z=this._z*c+s*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+n*t,this._z=this._z*c+s*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(n*Math.sin(e),n*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},pc=class pc{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(eh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(eh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,n=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*n,this.y=s[1]*t+s[4]*i+s[7]*n,this.z=s[2]*t+s[5]*i+s[8]*n,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,n=this.z,s=e.elements,a=1/(s[3]*t+s[7]*i+s[11]*n+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*n+s[12])*a,this.y=(s[1]*t+s[5]*i+s[9]*n+s[13])*a,this.z=(s[2]*t+s[6]*i+s[10]*n+s[14])*a,this}applyQuaternion(e){let t=this.x,i=this.y,n=this.z,s=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*n-o*i),h=2*(o*t-s*n),d=2*(s*i-a*t);return this.x=t+c*l+a*d-o*h,this.y=i+c*h+o*l-s*d,this.z=n+c*d+s*h-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,n=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*n,this.y=s[1]*t+s[5]*i+s[9]*n,this.z=s[2]*t+s[6]*i+s[10]*n,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Be(this.x,e.x,t.x),this.y=Be(this.y,e.y,t.y),this.z=Be(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Be(this.x,e,t),this.y=Be(this.y,e,t),this.z=Be(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Be(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,n=e.y,s=e.z,a=t.x,o=t.y,c=t.z;return this.x=n*c-s*o,this.y=s*a-i*c,this.z=i*o-n*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return mo.copy(this).projectOnVector(e),this.sub(mo)}reflect(e){return this.sub(mo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Be(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,n=this.z-e.z;return t*t+i*i+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let n=Math.sin(t)*e;return this.x=n*Math.sin(i),this.y=Math.cos(t)*e,this.z=n*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),n=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=n,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,4*t)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,3*t)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=2*Math.random()-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};pc.prototype.isVector3=!0;var A=pc,mo=new A,eh=new Nt,mc=class mc{constructor(e,t,i,n,s,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,n,s,a,o,c,l)}set(e,t,i,n,s,a,o,c,l){let h=this.elements;return h[0]=e,h[1]=n,h[2]=o,h[3]=t,h[4]=s,h[5]=c,h[6]=i,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,n=t.elements,s=this.elements,a=i[0],o=i[3],c=i[6],l=i[1],h=i[4],d=i[7],p=i[2],u=i[5],f=i[8],m=n[0],y=n[3],g=n[6],_=n[1],x=n[4],S=n[7],w=n[2],M=n[5],D=n[8];return s[0]=a*m+o*_+c*w,s[3]=a*y+o*x+c*M,s[6]=a*g+o*S+c*D,s[1]=l*m+h*_+d*w,s[4]=l*y+h*x+d*M,s[7]=l*g+h*S+d*D,s[2]=p*m+u*_+f*w,s[5]=p*y+u*x+f*M,s[8]=p*g+u*S+f*D,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8];return t*a*h-t*o*l-i*s*h+i*o*c+n*s*l-n*a*c}invert(){let e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],d=h*a-o*l,p=o*c-h*s,u=l*s-a*c,f=t*d+i*p+n*u;if(f===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/f;return e[0]=d*m,e[1]=(n*l-h*i)*m,e[2]=(o*i-n*a)*m,e[3]=p*m,e[4]=(h*t-n*c)*m,e[5]=(n*s-o*t)*m,e[6]=u*m,e[7]=(i*c-l*t)*m,e[8]=(a*t-i*s)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,n,s,a,o){let c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*a+l*o)+a+e,-n*l,n*c,-n*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return gn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(fo.makeScale(e,t)),this}rotate(e){return gn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(fo.makeRotation(-e)),this}translate(e,t){return gn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(fo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let n=0;n<9;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};mc.prototype.isMatrix3=!0;var Le=mc,fo=new Le,th=new Le().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ih=new Le().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function fd(){let r={enabled:!0,workingColorSpace:Rr,spaces:{},convert:function(n,s,a){return this.enabled!==!1&&s!==a&&s&&a&&(this.spaces[s].transfer===Ye&&(n.r=Di(n.r),n.g=Di(n.g),n.b=Di(n.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(n.applyMatrix3(this.spaces[s].toXYZ),n.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Ye&&(n.r=qn(n.r),n.g=qn(n.g),n.b=qn(n.b))),n},workingToColorSpace:function(n,s){return this.convert(n,this.workingColorSpace,s)},colorSpaceToWorking:function(n,s){return this.convert(n,s,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===""?Pr:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,s=this.workingColorSpace){return n.fromArray(this.spaces[s].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,s,a){return n.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,s){return gn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(n,s)},toWorkingColorSpace:function(n,s){return gn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(n,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return r.define({[Rr]:{primaries:e,whitePoint:i,transfer:Pr,toXYZ:th,fromXYZ:ih,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Dt},outputColorSpaceConfig:{drawingBufferColorSpace:Dt}},[Dt]:{primaries:e,whitePoint:i,transfer:Ye,toXYZ:th,fromXYZ:ih,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Dt}}}),r}var ke=fd();function Di(r){return r<.04045?.0773993808*r:Math.pow(.9478672986*r+.0521327014,2.4)}function qn(r){return r<.0031308?12.92*r:1.055*Math.pow(r,.41666)-.055}var Nn,Hs=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Nn===void 0&&(Nn=Ir("canvas")),Nn.width=e.width,Nn.height=e.height;let n=Nn.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),i=Nn}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ir("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let n=i.getImageData(0,0,e.width,e.height),s=n.data;for(let a=0;a<s.length;a++)s[a]=255*Di(s[a]/255);return i.putImageData(n,0,0),t}if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(255*Di(t[i]/255)):t[i]=Di(t[i]);return{data:t,width:e.width,height:e.height}}return be("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},gd=0,Kn=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:gd++}),this.uuid=wn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let s;if(Array.isArray(n)){s=[];for(let a=0,o=n.length;a<o;a++)n[a].isDataTexture?s.push(go(n[a].image)):s.push(go(n[a]))}else s=go(n);i.url=s}return t||(e.images[this.uuid]=i),i}};function go(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?Hs.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(be("Texture: Unable to serialize Texture."),{})}var _d=0,_o=new A,Ot=class r extends si{constructor(e=r.DEFAULT_IMAGE,t=r.DEFAULT_MAPPING,i=1001,n=1001,s=1006,a=1008,o=1023,c=1009,l=r.DEFAULT_ANISOTROPY,h=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:_d++}),this.uuid=wn(),this.name="",this.source=new Kn(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=s,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Q(0,0),this.repeat=new Q(1,1),this.center=new Q(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Le,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(_o).x}get height(){return this.source.getSize(_o).y}get depth(){return this.source.getSize(_o).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){be(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let n=this[t];n!==void 0?n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[t]=i:be(`Texture.setValues(): property '${t}' does not exist.`)}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==xl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case zs:e.x=e.x-Math.floor(e.x);break;case Ji:e.x=e.x<0?0:1;break;case Gs:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case zs:e.y=e.y-Math.floor(e.y);break;case Ji:e.y=e.y<0?0:1;break;case Gs:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ot.DEFAULT_IMAGE=null,Ot.DEFAULT_MAPPING=xl,Ot.DEFAULT_ANISOTROPY=1;var fc=class fc{constructor(e=0,t=0,i=0,n=1){this.x=e,this.y=t,this.z=i,this.w=n}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,n){return this.x=e,this.y=t,this.z=i,this.w=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,n=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*n+a[12]*s,this.y=a[1]*t+a[5]*i+a[9]*n+a[13]*s,this.z=a[2]*t+a[6]*i+a[10]*n+a[14]*s,this.w=a[3]*t+a[7]*i+a[11]*n+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,n,s,c=e.elements,l=c[0],h=c[4],d=c[8],p=c[1],u=c[5],f=c[9],m=c[2],y=c[6],g=c[10];if(Math.abs(h-p)<.01&&Math.abs(d-m)<.01&&Math.abs(f-y)<.01){if(Math.abs(h+p)<.1&&Math.abs(d+m)<.1&&Math.abs(f+y)<.1&&Math.abs(l+u+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(l+1)/2,S=(u+1)/2,w=(g+1)/2,M=(h+p)/4,D=(d+m)/4,O=(f+y)/4;return x>S&&x>w?x<.01?(i=0,n=.707106781,s=.707106781):(i=Math.sqrt(x),n=M/i,s=D/i):S>w?S<.01?(i=.707106781,n=0,s=.707106781):(n=Math.sqrt(S),i=M/n,s=O/n):w<.01?(i=.707106781,n=.707106781,s=0):(s=Math.sqrt(w),i=D/s,n=O/s),this.set(i,n,s,t),this}let _=Math.sqrt((y-f)*(y-f)+(d-m)*(d-m)+(p-h)*(p-h));return Math.abs(_)<.001&&(_=1),this.x=(y-f)/_,this.y=(d-m)/_,this.z=(p-h)/_,this.w=Math.acos((l+u+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Be(this.x,e.x,t.x),this.y=Be(this.y,e.y,t.y),this.z=Be(this.z,e.z,t.z),this.w=Be(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Be(this.x,e,t),this.y=Be(this.y,e,t),this.z=Be(this.z,e,t),this.w=Be(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Be(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};fc.prototype.isVector4=!0;var Je=fc,ks=class extends si{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ct,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Je(0,0,e,t),this.scissorTest=!1,this.viewport=new Je(0,0,e,t),this.textures=[];let n={width:e,height:t,depth:i.depth},s=new Ot(n),a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Ct,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let n=0,s=this.textures.length;n<s;n++)this.textures[n].image.width=e,this.textures[n].image.height=t,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Kn(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},kt=class extends ks{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Lr=class extends Ot{constructor(e=null,t=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=Ji,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ws=class extends Ot{constructor(e=null,t=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=Ji,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Aa=class Aa{constructor(e,t,i,n,s,a,o,c,l,h,d,p,u,f,m,y){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,n,s,a,o,c,l,h,d,p,u,f,m,y)}set(e,t,i,n,s,a,o,c,l,h,d,p,u,f,m,y){let g=this.elements;return g[0]=e,g[4]=t,g[8]=i,g[12]=n,g[1]=s,g[5]=a,g[9]=o,g[13]=c,g[2]=l,g[6]=h,g[10]=d,g[14]=p,g[3]=u,g[7]=f,g[11]=m,g[15]=y,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Aa().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,n=1/Un.setFromMatrixColumn(e,0).length(),s=1/Un.setFromMatrixColumn(e,1).length(),a=1/Un.setFromMatrixColumn(e,2).length();return t[0]=i[0]*n,t[1]=i[1]*n,t[2]=i[2]*n,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,n=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(n),l=Math.sin(n),h=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){let p=a*h,u=a*d,f=o*h,m=o*d;t[0]=c*h,t[4]=-c*d,t[8]=l,t[1]=u+f*l,t[5]=p-m*l,t[9]=-o*c,t[2]=m-p*l,t[6]=f+u*l,t[10]=a*c}else if(e.order==="YXZ"){let p=c*h,u=c*d,f=l*h,m=l*d;t[0]=p+m*o,t[4]=f*o-u,t[8]=a*l,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=u*o-f,t[6]=m+p*o,t[10]=a*c}else if(e.order==="ZXY"){let p=c*h,u=c*d,f=l*h,m=l*d;t[0]=p-m*o,t[4]=-a*d,t[8]=f+u*o,t[1]=u+f*o,t[5]=a*h,t[9]=m-p*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let p=a*h,u=a*d,f=o*h,m=o*d;t[0]=c*h,t[4]=f*l-u,t[8]=p*l+m,t[1]=c*d,t[5]=m*l+p,t[9]=u*l-f,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let p=a*c,u=a*l,f=o*c,m=o*l;t[0]=c*h,t[4]=m-p*d,t[8]=f*d+u,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-l*h,t[6]=u*d+f,t[10]=p-m*d}else if(e.order==="XZY"){let p=a*c,u=a*l,f=o*c,m=o*l;t[0]=c*h,t[4]=-d,t[8]=l*h,t[1]=p*d+m,t[5]=a*h,t[9]=u*d-f,t[2]=f*d-u,t[6]=o*h,t[10]=m*d+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(vd,e,yd)}lookAt(e,t,i){let n=this.elements;return Gt.subVectors(e,t),Gt.lengthSq()===0&&(Gt.z=1),Gt.normalize(),Hi.crossVectors(i,Gt),Hi.lengthSq()===0&&(Math.abs(i.z)===1?Gt.x+=1e-4:Gt.z+=1e-4,Gt.normalize(),Hi.crossVectors(i,Gt)),Hi.normalize(),hs.crossVectors(Gt,Hi),n[0]=Hi.x,n[4]=hs.x,n[8]=Gt.x,n[1]=Hi.y,n[5]=hs.y,n[9]=Gt.y,n[2]=Hi.z,n[6]=hs.z,n[10]=Gt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,n=t.elements,s=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],h=i[1],d=i[5],p=i[9],u=i[13],f=i[2],m=i[6],y=i[10],g=i[14],_=i[3],x=i[7],S=i[11],w=i[15],M=n[0],D=n[4],O=n[8],N=n[12],U=n[1],V=n[5],F=n[9],Y=n[13],k=n[2],z=n[6],q=n[10],W=n[14],ie=n[3],he=n[7],Me=n[11],pe=n[15];return s[0]=a*M+o*U+c*k+l*ie,s[4]=a*D+o*V+c*z+l*he,s[8]=a*O+o*F+c*q+l*Me,s[12]=a*N+o*Y+c*W+l*pe,s[1]=h*M+d*U+p*k+u*ie,s[5]=h*D+d*V+p*z+u*he,s[9]=h*O+d*F+p*q+u*Me,s[13]=h*N+d*Y+p*W+u*pe,s[2]=f*M+m*U+y*k+g*ie,s[6]=f*D+m*V+y*z+g*he,s[10]=f*O+m*F+y*q+g*Me,s[14]=f*N+m*Y+y*W+g*pe,s[3]=_*M+x*U+S*k+w*ie,s[7]=_*D+x*V+S*z+w*he,s[11]=_*O+x*F+S*q+w*Me,s[15]=_*N+x*Y+S*W+w*pe,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],n=e[8],s=e[12],a=e[1],o=e[5],c=e[9],l=e[13],h=e[2],d=e[6],p=e[10],u=e[14],f=e[3],m=e[7],y=e[11],g=e[15],_=c*u-l*p,x=o*u-l*d,S=o*p-c*d,w=a*u-l*h,M=a*p-c*h,D=a*d-o*h;return t*(m*_-y*x+g*S)-i*(f*_-y*w+g*M)+n*(f*x-m*w+g*D)-s*(f*S-m*M+y*D)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],n=e[8],s=e[1],a=e[5],o=e[9],c=e[2],l=e[6],h=e[10];return t*(a*h-o*l)-i*(s*h-o*c)+n*(s*l-a*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let n=this.elements;return e.isVector3?(n[12]=e.x,n[13]=e.y,n[14]=e.z):(n[12]=e,n[13]=t,n[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],d=e[9],p=e[10],u=e[11],f=e[12],m=e[13],y=e[14],g=e[15],_=t*o-i*a,x=t*c-n*a,S=t*l-s*a,w=i*c-n*o,M=i*l-s*o,D=n*l-s*c,O=h*m-d*f,N=h*y-p*f,U=h*g-u*f,V=d*y-p*m,F=d*g-u*m,Y=p*g-u*y,k=_*Y-x*F+S*V+w*U-M*N+D*O;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let z=1/k;return e[0]=(o*Y-c*F+l*V)*z,e[1]=(n*F-i*Y-s*V)*z,e[2]=(m*D-y*M+g*w)*z,e[3]=(p*M-d*D-u*w)*z,e[4]=(c*U-a*Y-l*N)*z,e[5]=(t*Y-n*U+s*N)*z,e[6]=(y*S-f*D-g*x)*z,e[7]=(h*D-p*S+u*x)*z,e[8]=(a*F-o*U+l*O)*z,e[9]=(i*U-t*F-s*O)*z,e[10]=(f*M-m*S+g*_)*z,e[11]=(d*S-h*M-u*_)*z,e[12]=(o*N-a*V-c*O)*z,e[13]=(t*V-i*N+n*O)*z,e[14]=(m*x-f*w-y*_)*z,e[15]=(h*w-d*x+p*_)*z,this}scale(e){let t=this.elements,i=e.x,n=e.y,s=e.z;return t[0]*=i,t[4]*=n,t[8]*=s,t[1]*=i,t[5]*=n,t[9]*=s,t[2]*=i,t[6]*=n,t[10]*=s,t[3]*=i,t[7]*=n,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],n=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,n))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),n=Math.sin(t),s=1-i,a=e.x,o=e.y,c=e.z,l=s*a,h=s*o;return this.set(l*a+i,l*o-n*c,l*c+n*o,0,l*o+n*c,h*o+i,h*c-n*a,0,l*c-n*o,h*c+n*a,s*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,n,s,a){return this.set(1,i,s,0,e,1,a,0,t,n,1,0,0,0,0,1),this}compose(e,t,i){let n=this.elements,s=t._x,a=t._y,o=t._z,c=t._w,l=s+s,h=a+a,d=o+o,p=s*l,u=s*h,f=s*d,m=a*h,y=a*d,g=o*d,_=c*l,x=c*h,S=c*d,w=i.x,M=i.y,D=i.z;return n[0]=(1-(m+g))*w,n[1]=(u+S)*w,n[2]=(f-x)*w,n[3]=0,n[4]=(u-S)*M,n[5]=(1-(p+g))*M,n[6]=(y+_)*M,n[7]=0,n[8]=(f+x)*D,n[9]=(y-_)*D,n[10]=(1-(p+m))*D,n[11]=0,n[12]=e.x,n[13]=e.y,n[14]=e.z,n[15]=1,this}decompose(e,t,i){let n=this.elements;e.x=n[12],e.y=n[13],e.z=n[14];let s=this.determinantAffine();if(s===0)return i.set(1,1,1),t.identity(),this;let a=Un.set(n[0],n[1],n[2]).length(),o=Un.set(n[4],n[5],n[6]).length(),c=Un.set(n[8],n[9],n[10]).length();s<0&&(a=-a),ii.copy(this);let l=1/a,h=1/o,d=1/c;return ii.elements[0]*=l,ii.elements[1]*=l,ii.elements[2]*=l,ii.elements[4]*=h,ii.elements[5]*=h,ii.elements[6]*=h,ii.elements[8]*=d,ii.elements[9]*=d,ii.elements[10]*=d,t.setFromRotationMatrix(ii),i.x=a,i.y=o,i.z=c,this}makePerspective(e,t,i,n,s,a,o=2e3,c=!1){let l=this.elements,h=2*s/(t-e),d=2*s/(i-n),p=(t+e)/(t-e),u=(i+n)/(i-n),f,m;if(c)f=s/(a-s),m=a*s/(a-s);else if(o===Ni)f=-(a+s)/(a-s),m=-2*a*s/(a-s);else{if(o!==Yn)throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);f=-a/(a-s),m=-a*s/(a-s)}return l[0]=h,l[4]=0,l[8]=p,l[12]=0,l[1]=0,l[5]=d,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,n,s,a,o=2e3,c=!1){let l=this.elements,h=2/(t-e),d=2/(i-n),p=-(t+e)/(t-e),u=-(i+n)/(i-n),f,m;if(c)f=1/(a-s),m=a/(a-s);else if(o===Ni)f=-2/(a-s),m=-(a+s)/(a-s);else{if(o!==Yn)throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);f=-1/(a-s),m=-s/(a-s)}return l[0]=h,l[4]=0,l[8]=0,l[12]=p,l[1]=0,l[5]=d,l[9]=0,l[13]=u,l[2]=0,l[6]=0,l[10]=f,l[14]=m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let n=0;n<16;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};Aa.prototype.isMatrix4=!0;var Fe=Aa,Un=new A,ii=new Fe,vd=new A(0,0,0),yd=new A(1,1,1),Hi=new A,hs=new A,Gt=new A,nh=new Fe,rh=new Nt,Ui=class r{constructor(e=0,t=0,i=0,n=r.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=n}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,n=this._order){return this._x=e,this._y=t,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let n=e.elements,s=n[0],a=n[4],o=n[8],c=n[1],l=n[5],h=n[9],d=n[2],p=n[6],u=n[10];switch(t){case"XYZ":this._y=Math.asin(Be(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,u),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(p,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Be(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,u),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(Be(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-d,u),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-Be(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(p,u),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Be(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(o,u));break;case"XZY":this._z=Math.asin(-Be(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(p,l),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,u),this._y=0);break;default:be("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return nh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(nh,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return rh.setFromEuler(this),this.setFromQuaternion(rh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ui.DEFAULT_ORDER="XYZ";var $n=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},xd=0,sh=new A,On=new Nt,Ai=new Fe,us=new A,yr=new A,Md=new A,Sd=new Nt,ah=new A(1,0,0),oh=new A(0,1,0),lh=new A(0,0,1),ch={type:"added"},bd={type:"removed"},Fn={type:"childadded",child:null},vo={type:"childremoved",child:null},St=class r extends si{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xd++}),this.uuid=wn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=r.DEFAULT_UP.clone();let e=new A,t=new Ui,i=new Nt,n=new A(1,1,1);t._onChange(function(){i.setFromEuler(t,!1)}),i._onChange(function(){t.setFromQuaternion(i,void 0,!1)}),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new Fe},normalMatrix:{value:new Le}}),this.matrix=new Fe,this.matrixWorld=new Fe,this.matrixAutoUpdate=r.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=r.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new $n,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return On.setFromAxisAngle(e,t),this.quaternion.multiply(On),this}rotateOnWorldAxis(e,t){return On.setFromAxisAngle(e,t),this.quaternion.premultiply(On),this}rotateX(e){return this.rotateOnAxis(ah,e)}rotateY(e){return this.rotateOnAxis(oh,e)}rotateZ(e){return this.rotateOnAxis(lh,e)}translateOnAxis(e,t){return sh.copy(e).applyQuaternion(this.quaternion),this.position.add(sh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ah,e)}translateY(e){return this.translateOnAxis(oh,e)}translateZ(e){return this.translateOnAxis(lh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ai.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?us.copy(e):us.set(e,t,i);let n=this.parent;this.updateWorldMatrix(!0,!1),yr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ai.lookAt(yr,us,this.up):Ai.lookAt(us,yr,this.up),this.quaternion.setFromRotationMatrix(Ai),n&&(Ai.extractRotation(n.matrixWorld),On.setFromRotationMatrix(Ai),this.quaternion.premultiply(On.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ee("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ch),Fn.child=e,this.dispatchEvent(Fn),Fn.child=null):Ee("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(bd),vo.child=e,this.dispatchEvent(vo),vo.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ai.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ai.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ai),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ch),Fn.child=e,this.dispatchEvent(Fn),Fn.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,n=this.children.length;i<n;i++){let s=this.children[i].getObjectByProperty(e,t);if(s!==void 0)return s}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let n=this.children;for(let s=0,a=n.length;s<a;s++)n[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(yr,e,Md),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(yr,Sd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,n=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*i-s[8]*n,s[13]+=i-s[1]*t-s[5]*i-s[9]*n,s[14]+=n-s[2]*t-s[6]*i-s[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let s=this.children;for(let a=0,o=s.length;a<o;a++)s[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.castShadow===!0&&(n.castShadow=!0),this.receiveShadow===!0&&(n.receiveShadow=!0),this.visible===!1&&(n.visible=!1),this.frustumCulled===!1&&(n.frustumCulled=!1),this.renderOrder!==0&&(n.renderOrder=this.renderOrder),this.static!==!1&&(n.static=this.static),Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(n.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(o=>({...o})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(e),n.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON())),this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=s(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let d=c[l];s(e.shapes,d)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(s(e.materials,this.material[c]));n.material=o}else n.material=s(e.materials,this.material);if(this.children.length>0){n.children=[];for(let o=0;o<this.children.length;o++)n.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){n.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];n.animations.push(s(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),l=a(e.textures),h=a(e.images),d=a(e.shapes),p=a(e.skeletons),u=a(e.animations),f=a(e.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),p.length>0&&(i.skeletons=p),u.length>0&&(i.animations=u),f.length>0&&(i.nodes=f)}return i.object=n,i;function a(o){let c=[];for(let l in o){let h=o[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let n=e.children[i];this.add(n.clone())}return this}};St.DEFAULT_UP=new A(0,1,0),St.DEFAULT_MATRIX_AUTO_UPDATE=!0,St.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Mt=class extends St{constructor(){super(),this.isGroup=!0,this.type="Group"}},Td={type:"move"},Qn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Mt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Mt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new A,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new A),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Mt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new A,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new A,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let n=null,s=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(let m of e.hand.values()){let y=t.getJointPose(m,i),g=this._getHandJoint(l,m);y!==null&&(g.matrix.fromArray(y.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=y.radius),g.visible=y!==null}let h=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],p=h.position.distanceTo(d.position),u=.02,f=.005;l.inputState.pinching&&p>u+f?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&p<=u-f&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(n=t.getPose(e.targetRaySpace,i),n===null&&s!==null&&(n=s),n!==null&&(o.matrix.fromArray(n.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,n.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(n.linearVelocity)):o.hasLinearVelocity=!1,n.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(n.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Td)))}return o!==null&&(o.visible=n!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Mt;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},xu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ki={h:0,s:0,l:0},ds={h:0,s:0,l:0};function yo(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+6*(e-r)*t:t<.5?e:t<2/3?r+6*(e-r)*(2/3-t):r}var Ue=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let n=e;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Dt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(255&e)/255,ke.colorSpaceToWorking(this,t),this}setRGB(e,t,i,n=ke.workingColorSpace){return this.r=e,this.g=t,this.b=i,ke.colorSpaceToWorking(this,n),this}setHSL(e,t,i,n=ke.workingColorSpace){if(e=qo(e,1),t=Be(t,0,1),i=Be(i,0,1),t===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+t):i+t-i*t,a=2*i-s;this.r=yo(a,s,e+1/3),this.g=yo(a,s,e),this.b=yo(a,s,e-1/3)}return ke.colorSpaceToWorking(this,n),this}setStyle(e,t=Dt){function i(s){s!==void 0&&parseFloat(s)<1&&be("Color: Alpha component of "+e+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,a=n[1],o=n[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:be("Color: Unknown color model "+e)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=n[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);be("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Dt){let i=xu[e.toLowerCase()];return i!==void 0?this.setHex(i,t):be("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Di(e.r),this.g=Di(e.g),this.b=Di(e.b),this}copyLinearToSRGB(e){return this.r=qn(e.r),this.g=qn(e.g),this.b=qn(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Dt){return ke.workingToColorSpace(wt.copy(this),e),65536*Math.round(Be(255*wt.r,0,255))+256*Math.round(Be(255*wt.g,0,255))+Math.round(Be(255*wt.b,0,255))}getHexString(e=Dt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ke.workingColorSpace){ke.workingToColorSpace(wt.copy(this),t);let i=wt.r,n=wt.g,s=wt.b,a=Math.max(i,n,s),o=Math.min(i,n,s),c,l,h=(o+a)/2;if(o===a)c=0,l=0;else{let d=a-o;switch(l=h<=.5?d/(a+o):d/(2-a-o),a){case i:c=(n-s)/d+(n<s?6:0);break;case n:c=(s-i)/d+2;break;case s:c=(i-n)/d+4}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=ke.workingColorSpace){return ke.workingToColorSpace(wt.copy(this),t),e.r=wt.r,e.g=wt.g,e.b=wt.b,e}getStyle(e=Dt){ke.workingToColorSpace(wt.copy(this),e);let t=wt.r,i=wt.g,n=wt.b;return e!==Dt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(255*t)},${Math.round(255*i)},${Math.round(255*n)})`}offsetHSL(e,t,i){return this.getHSL(ki),this.setHSL(ki.h+e,ki.s+t,ki.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(ki),e.getHSL(ds);let i=Er(ki.h,ds.h,t),n=Er(ki.s,ds.s,t),s=Er(ki.l,ds.l,t);return this.setHSL(i,n,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,n=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*n,this.g=s[1]*t+s[4]*i+s[7]*n,this.b=s[2]*t+s[5]*i+s[8]*n,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},wt=new Ue;Ue.NAMES=xu;var Dr=class extends St{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ui,this.environmentIntensity=1,this.environmentRotation=new Ui,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},ni=new A,Ci=new A,xo=new A,Ri=new A,Bn=new A,zn=new A,hh=new A,Mo=new A,So=new A,bo=new A,To=new Je,Eo=new Je,wo=new Je,Li=class r{constructor(e=new A,t=new A,i=new A){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,n){n.subVectors(i,t),ni.subVectors(e,t),n.cross(ni);let s=n.lengthSq();return s>0?n.multiplyScalar(1/Math.sqrt(s)):n.set(0,0,0)}static getBarycoord(e,t,i,n,s){ni.subVectors(n,t),Ci.subVectors(i,t),xo.subVectors(e,t);let a=ni.dot(ni),o=ni.dot(Ci),c=ni.dot(xo),l=Ci.dot(Ci),h=Ci.dot(xo),d=a*l-o*o;if(d===0)return s.set(0,0,0),null;let p=1/d,u=(l*c-o*h)*p,f=(a*h-o*c)*p;return s.set(1-u-f,f,u)}static containsPoint(e,t,i,n){return this.getBarycoord(e,t,i,n,Ri)!==null&&Ri.x>=0&&Ri.y>=0&&Ri.x+Ri.y<=1}static getInterpolation(e,t,i,n,s,a,o,c){return this.getBarycoord(e,t,i,n,Ri)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,Ri.x),c.addScaledVector(a,Ri.y),c.addScaledVector(o,Ri.z),c)}static getInterpolatedAttribute(e,t,i,n,s,a){return To.setScalar(0),Eo.setScalar(0),wo.setScalar(0),To.fromBufferAttribute(e,t),Eo.fromBufferAttribute(e,i),wo.fromBufferAttribute(e,n),a.setScalar(0),a.addScaledVector(To,s.x),a.addScaledVector(Eo,s.y),a.addScaledVector(wo,s.z),a}static isFrontFacing(e,t,i,n){return ni.subVectors(i,t),Ci.subVectors(e,t),ni.cross(Ci).dot(n)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,n){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[n]),this}setFromAttributeAndIndices(e,t,i,n){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ni.subVectors(this.c,this.b),Ci.subVectors(this.a,this.b),.5*ni.cross(Ci).length()}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return r.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return r.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,n,s){return r.getInterpolation(e,this.a,this.b,this.c,t,i,n,s)}containsPoint(e){return r.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return r.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,n=this.b,s=this.c,a,o;Bn.subVectors(n,i),zn.subVectors(s,i),Mo.subVectors(e,i);let c=Bn.dot(Mo),l=zn.dot(Mo);if(c<=0&&l<=0)return t.copy(i);So.subVectors(e,n);let h=Bn.dot(So),d=zn.dot(So);if(h>=0&&d<=h)return t.copy(n);let p=c*d-h*l;if(p<=0&&c>=0&&h<=0)return a=c/(c-h),t.copy(i).addScaledVector(Bn,a);bo.subVectors(e,s);let u=Bn.dot(bo),f=zn.dot(bo);if(f>=0&&u<=f)return t.copy(s);let m=u*l-c*f;if(m<=0&&l>=0&&f<=0)return o=l/(l-f),t.copy(i).addScaledVector(zn,o);let y=h*f-u*d;if(y<=0&&d-h>=0&&u-f>=0)return hh.subVectors(s,n),o=(d-h)/(d-h+(u-f)),t.copy(n).addScaledVector(hh,o);let g=1/(y+m+p);return a=m*g,o=p*g,t.copy(i).addScaledVector(Bn,a).addScaledVector(zn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ai=class{constructor(e=new A(1/0,1/0,1/0),t=new A(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(ri.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(ri.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=ri.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,ri):ri.fromBufferAttribute(s,a),ri.applyMatrix4(e.matrixWorld),this.expandByPoint(ri);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ps.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ps.copy(i.boundingBox)),ps.applyMatrix4(e.matrixWorld),this.union(ps)}let n=e.children;for(let s=0,a=n.length;s<a;s++)this.expandByObject(n[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ri),ri.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(xr),ms.subVectors(this.max,xr),Gn.subVectors(e.a,xr),Vn.subVectors(e.b,xr),Hn.subVectors(e.c,xr),Wi.subVectors(Vn,Gn),Xi.subVectors(Hn,Vn),un.subVectors(Gn,Hn);let t=[0,-Wi.z,Wi.y,0,-Xi.z,Xi.y,0,-un.z,un.y,Wi.z,0,-Wi.x,Xi.z,0,-Xi.x,un.z,0,-un.x,-Wi.y,Wi.x,0,-Xi.y,Xi.x,0,-un.y,un.x,0];return!!Ao(t,Gn,Vn,Hn,ms)&&(t=[1,0,0,0,1,0,0,0,1],!!Ao(t,Gn,Vn,Hn,ms)&&(fs.crossVectors(Wi,Xi),t=[fs.x,fs.y,fs.z],Ao(t,Gn,Vn,Hn,ms)))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ri).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=.5*this.getSize(ri).length()),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(Pi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Pi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Pi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Pi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Pi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Pi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Pi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Pi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Pi)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Pi=[new A,new A,new A,new A,new A,new A,new A,new A],ri=new A,ps=new ai,Gn=new A,Vn=new A,Hn=new A,Wi=new A,Xi=new A,un=new A,xr=new A,ms=new A,fs=new A,dn=new A;function Ao(r,e,t,i,n){for(let s=0,a=r.length-3;s<=a;s+=3){dn.fromArray(r,s);let o=n.x*Math.abs(dn.x)+n.y*Math.abs(dn.y)+n.z*Math.abs(dn.z),c=e.dot(dn),l=t.dot(dn),h=i.dot(dn);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}var yf=Ed();function Ed(){let r=new ArrayBuffer(4),e=new Float32Array(r),t=new Uint32Array(r),i=new Uint32Array(512),n=new Uint32Array(512);for(let c=0;c<256;++c){let l=c-127;l<-27?(i[c]=0,i[256|c]=32768,n[c]=24,n[256|c]=24):l<-14?(i[c]=1024>>-l-14,i[256|c]=1024>>-l-14|32768,n[c]=-l-1,n[256|c]=-l-1):l<=15?(i[c]=l+15<<10,i[256|c]=l+15<<10|32768,n[c]=13,n[256|c]=13):l<128?(i[c]=31744,i[256|c]=64512,n[c]=24,n[256|c]=24):(i[c]=31744,i[256|c]=64512,n[c]=13,n[256|c]=13)}let s=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let c=1;c<1024;++c){let l=c<<13,h=0;for(;!(8388608&l);)l<<=1,h-=8388608;l&=-8388609,h+=947912704,s[c]=l|h}for(let c=1024;c<2048;++c)s[c]=939524096+(c-1024<<13);for(let c=1;c<31;++c)a[c]=c<<23;a[31]=1199570944,a[32]=2147483648;for(let c=33;c<63;++c)a[c]=2147483648+(c-32<<23);a[63]=3347054592;for(let c=1;c<64;++c)c!==32&&(o[c]=1024);return{floatView:e,uint32View:t,baseTable:i,shiftTable:n,mantissaTable:s,exponentTable:a,offsetTable:o}}var dt=new A,gs=new Q,wd=0,bt=class extends si{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:wd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=jo,this.updateRanges=[],this.gpuType=ui,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let n=0,s=this.itemSize;n<s;n++)this.array[e+n]=t.array[i+n];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)gs.fromBufferAttribute(this,t),gs.applyMatrix3(e),this.setXY(t,gs.x,gs.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)dt.fromBufferAttribute(this,t),dt.applyMatrix3(e),this.setXYZ(t,dt.x,dt.y,dt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)dt.fromBufferAttribute(this,t),dt.applyMatrix4(e),this.setXYZ(t,dt.x,dt.y,dt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)dt.fromBufferAttribute(this,t),dt.applyNormalMatrix(e),this.setXYZ(t,dt.x,dt.y,dt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)dt.fromBufferAttribute(this,t),dt.transformDirection(e),this.setXYZ(t,dt.x,dt.y,dt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Xn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Lt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Xn(t,this.array)),t}setX(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Xn(t,this.array)),t}setY(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Xn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Xn(t,this.array)),t}setW(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,n){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array),n=Lt(n,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this}setXYZW(e,t,i,n,s){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array),n=Lt(n,this.array),s=Lt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==jo&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}};var Nr=class extends bt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var Ur=class extends bt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var Te=class extends bt{constructor(e,t,i){super(new Float32Array(e),t,i)}},Ad=new ai,Mr=new A,Co=new A,oi=class{constructor(e=new A,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):Ad.setFromPoints(e).getCenter(i);let n=0;for(let s=0,a=e.length;s<a;s++)n=Math.max(n,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(n),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Mr.subVectors(e,this.center);let t=Mr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),n=.5*(i-this.radius);this.center.addScaledVector(Mr,n/i),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Co.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Mr.copy(e.center).add(Co)),this.expandByPoint(Mr.copy(e.center).sub(Co))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Cd=0,Yt=new Fe,Ro=new St,kn=new A,Vt=new ai,Sr=new ai,vt=new A,Ke=class r extends si{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Cd++}),this.uuid=wn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(function(t){for(let i=t.length-1;i>=0;--i)if(t[i]>=65535)return!0;return!1}(e)?Ur:Nr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new Le().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Yt.makeRotationFromQuaternion(e),this.applyMatrix4(Yt),this}rotateX(e){return Yt.makeRotationX(e),this.applyMatrix4(Yt),this}rotateY(e){return Yt.makeRotationY(e),this.applyMatrix4(Yt),this}rotateZ(e){return Yt.makeRotationZ(e),this.applyMatrix4(Yt),this}translate(e,t,i){return Yt.makeTranslation(e,t,i),this.applyMatrix4(Yt),this}scale(e,t,i){return Yt.makeScale(e,t,i),this.applyMatrix4(Yt),this}lookAt(e){return Ro.lookAt(e),Ro.updateMatrix(),this.applyMatrix4(Ro.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(kn).negate(),this.translate(kn.x,kn.y,kn.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let n=0,s=e.length;n<s;n++){let a=e[n];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Te(i,3))}else{let i=Math.min(e.length,t.count);for(let n=0;n<i;n++){let s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&be("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ai);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return Ee("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),void this.boundingBox.set(new A(-1/0,-1/0,-1/0),new A(1/0,1/0,1/0));if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,n=t.length;i<n;i++){let s=t[i];Vt.setFromBufferAttribute(s),this.morphTargetsRelative?(vt.addVectors(this.boundingBox.min,Vt.min),this.boundingBox.expandByPoint(vt),vt.addVectors(this.boundingBox.max,Vt.max),this.boundingBox.expandByPoint(vt)):(this.boundingBox.expandByPoint(Vt.min),this.boundingBox.expandByPoint(Vt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ee('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new oi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return Ee("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),void this.boundingSphere.set(new A,1/0);if(e){let i=this.boundingSphere.center;if(Vt.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){let o=t[s];Sr.setFromBufferAttribute(o),this.morphTargetsRelative?(vt.addVectors(Vt.min,Sr.min),Vt.expandByPoint(vt),vt.addVectors(Vt.max,Sr.max),Vt.expandByPoint(vt)):(Vt.expandByPoint(Sr.min),Vt.expandByPoint(Sr.max))}Vt.getCenter(i);let n=0;for(let s=0,a=e.count;s<a;s++)vt.fromBufferAttribute(e,s),n=Math.max(n,i.distanceToSquared(vt));if(t)for(let s=0,a=t.length;s<a;s++){let o=t[s],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)vt.fromBufferAttribute(o,l),c&&(kn.fromBufferAttribute(e,l),vt.add(kn)),n=Math.max(n,i.distanceToSquared(vt))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&Ee('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0)return void Ee("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");let i=t.position,n=t.normal,s=t.uv,a=this.getAttribute("tangent");a!==void 0&&a.count===i.count||(a=new bt(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],c=[];for(let O=0;O<i.count;O++)o[O]=new A,c[O]=new A;let l=new A,h=new A,d=new A,p=new Q,u=new Q,f=new Q,m=new A,y=new A;function g(O,N,U){l.fromBufferAttribute(i,O),h.fromBufferAttribute(i,N),d.fromBufferAttribute(i,U),p.fromBufferAttribute(s,O),u.fromBufferAttribute(s,N),f.fromBufferAttribute(s,U),h.sub(l),d.sub(l),u.sub(p),f.sub(p);let V=1/(u.x*f.y-f.x*u.y);isFinite(V)&&(m.copy(h).multiplyScalar(f.y).addScaledVector(d,-u.y).multiplyScalar(V),y.copy(d).multiplyScalar(u.x).addScaledVector(h,-f.x).multiplyScalar(V),o[O].add(m),o[N].add(m),o[U].add(m),c[O].add(y),c[N].add(y),c[U].add(y))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let O=0,N=_.length;O<N;++O){let U=_[O],V=U.start;for(let F=V,Y=V+U.count;F<Y;F+=3)g(e.getX(F+0),e.getX(F+1),e.getX(F+2))}let x=new A,S=new A,w=new A,M=new A;function D(O){w.fromBufferAttribute(n,O),M.copy(w);let N=o[O];x.copy(N),x.sub(w.multiplyScalar(w.dot(N))).normalize(),S.crossVectors(M,N);let U=S.dot(c[O])<0?-1:1;a.setXYZW(O,x.x,x.y,x.z,U)}for(let O=0,N=_.length;O<N;++O){let U=_[O],V=U.start;for(let F=V,Y=V+U.count;F<Y;F+=3)D(e.getX(F+0)),D(e.getX(F+1)),D(e.getX(F+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new bt(new Float32Array(3*t.count),3),this.setAttribute("normal",i);else for(let p=0,u=i.count;p<u;p++)i.setXYZ(p,0,0,0);let n=new A,s=new A,a=new A,o=new A,c=new A,l=new A,h=new A,d=new A;if(e)for(let p=0,u=e.count;p<u;p+=3){let f=e.getX(p+0),m=e.getX(p+1),y=e.getX(p+2);n.fromBufferAttribute(t,f),s.fromBufferAttribute(t,m),a.fromBufferAttribute(t,y),h.subVectors(a,s),d.subVectors(n,s),h.cross(d),o.fromBufferAttribute(i,f),c.fromBufferAttribute(i,m),l.fromBufferAttribute(i,y),o.add(h),c.add(h),l.add(h),i.setXYZ(f,o.x,o.y,o.z),i.setXYZ(m,c.x,c.y,c.z),i.setXYZ(y,l.x,l.y,l.z)}else for(let p=0,u=t.count;p<u;p+=3)n.fromBufferAttribute(t,p+0),s.fromBufferAttribute(t,p+1),a.fromBufferAttribute(t,p+2),h.subVectors(a,s),d.subVectors(n,s),h.cross(d),i.setXYZ(p+0,h.x,h.y,h.z),i.setXYZ(p+1,h.x,h.y,h.z),i.setXYZ(p+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)vt.fromBufferAttribute(e,t),vt.normalize(),e.setXYZ(t,vt.x,vt.y,vt.z)}toNonIndexed(){function e(o,c){let l=o.array,h=o.itemSize,d=o.normalized,p=new l.constructor(c.length*h),u=0,f=0;for(let m=0,y=c.length;m<y;m++){u=o.isInterleavedBufferAttribute?c[m]*o.data.stride+o.offset:c[m]*h;for(let g=0;g<h;g++)p[f++]=l[u++]}return new bt(p,h,d)}if(this.index===null)return be("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new r,i=this.index.array,n=this.attributes;for(let o in n){let c=e(n[o],i);t.setAttribute(o,c)}let s=this.morphAttributes;for(let o in s){let c=[],l=s[o];for(let h=0,d=l.length;h<d;h++){let p=e(l[h],i);c.push(p)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let n={},s=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let d=0,p=l.length;d<p;d++){let u=l[d];h.push(u.toJSON(e.data))}h.length>0&&(n[c]=h,s=!0)}s&&(e.data.morphAttributes=n,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let n=e.attributes;for(let l in n){let h=n[l];this.setAttribute(l,h.clone(t))}let s=e.morphAttributes;for(let l in s){let h=[],d=s[l];for(let p=0,u=d.length;p<u;p++)h.push(d[p].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let l=0,h=a.length;l<h;l++){let d=a[l];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var xf=new A;var Rd=0,Oi=class extends si{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Rd++}),this.uuid=wn(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ue(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=fn,this.stencilZFail=fn,this.stencilZPass=fn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){be(`Material: parameter '${t}' has value of undefined.`);continue}let n=this[t];n!==void 0?n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[t]=i:be(`Material: '${t}' is not a property of THREE.${this.type}.`)}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};function n(s){let a=[];for(let o in s){let c=s[o];delete c.metadata,a.push(c)}return a}if(i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(i.blending=this.blending),this.side!==0&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==204&&(i.blendSrc=this.blendSrc),this.blendDst!==205&&(i.blendDst=this.blendDst),this.blendEquation!==100&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==fn&&(i.stencilFail=this.stencilFail),this.stencilZFail!==fn&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==fn&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData),t){let s=n(e.textures),a=n(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ue().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Q().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Q().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let n=t.length;i=new Array(n);for(let s=0;s!==n;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Mf=new A,Sf=new A,bf=new A,Tf=new Q,Ef=new Q,wf=new Fe,Af=new A,Cf=new A,Rf=new A,Pf=new Q,If=new Q,Lf=new Q;var Df=new A,Nf=new A;var Ii=new A,Po=new A,_s=new A,ji=new A,Io=new A,vs=new A,Lo=new A,yi=class{constructor(e=new A,t=new A(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ii)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ii.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ii.copy(this.origin).addScaledVector(this.direction,t),Ii.distanceToSquared(e))}distanceSqToSegment(e,t,i,n){Po.copy(e).add(t).multiplyScalar(.5),_s.copy(t).sub(e).normalize(),ji.copy(this.origin).sub(Po);let s=.5*e.distanceTo(t),a=-this.direction.dot(_s),o=ji.dot(this.direction),c=-ji.dot(_s),l=ji.lengthSq(),h=Math.abs(1-a*a),d,p,u,f;if(h>0)if(d=a*c-o,p=a*o-c,f=s*h,d>=0)if(p>=-f)if(p<=f){let m=1/h;d*=m,p*=m,u=d*(d+a*p+2*o)+p*(a*d+p+2*c)+l}else p=s,d=Math.max(0,-(a*p+o)),u=-d*d+p*(p+2*c)+l;else p=-s,d=Math.max(0,-(a*p+o)),u=-d*d+p*(p+2*c)+l;else p<=-f?(d=Math.max(0,-(-a*s+o)),p=d>0?-s:Math.min(Math.max(-s,-c),s),u=-d*d+p*(p+2*c)+l):p<=f?(d=0,p=Math.min(Math.max(-s,-c),s),u=p*(p+2*c)+l):(d=Math.max(0,-(a*s+o)),p=d>0?s:Math.min(Math.max(-s,-c),s),u=-d*d+p*(p+2*c)+l);else p=a>0?-s:s,d=Math.max(0,-(a*p+o)),u=-d*d+p*(p+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,d),n&&n.copy(Po).addScaledVector(_s,p),u}intersectSphere(e,t){Ii.subVectors(e.center,this.origin);let i=Ii.dot(this.direction),n=Ii.dot(Ii)-i*i,s=e.radius*e.radius;if(n>s)return null;let a=Math.sqrt(s-n),o=i-a,c=i+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return!(e.radius<0)&&this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0?!0:e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,n,s,a,o,c,l=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,p=this.origin;return l>=0?(i=(e.min.x-p.x)*l,n=(e.max.x-p.x)*l):(i=(e.max.x-p.x)*l,n=(e.min.x-p.x)*l),h>=0?(s=(e.min.y-p.y)*h,a=(e.max.y-p.y)*h):(s=(e.max.y-p.y)*h,a=(e.min.y-p.y)*h),i>a||s>n?null:((s>i||isNaN(i))&&(i=s),(a<n||isNaN(n))&&(n=a),d>=0?(o=(e.min.z-p.z)*d,c=(e.max.z-p.z)*d):(o=(e.max.z-p.z)*d,c=(e.min.z-p.z)*d),i>c||o>n?null:((o>i||i!=i)&&(i=o),(c<n||n!=n)&&(n=c),n<0?null:this.at(i>=0?i:n,t)))}intersectsBox(e){return this.intersectBox(e,Ii)!==null}intersectTriangle(e,t,i,n,s){Io.subVectors(t,e),vs.subVectors(i,e),Lo.crossVectors(Io,vs);let a,o=this.direction.dot(Lo);if(o>0){if(n)return null;a=1}else{if(!(o<0))return null;a=-1,o=-o}ji.subVectors(this.origin,e);let c=a*this.direction.dot(vs.crossVectors(ji,vs));if(c<0)return null;let l=a*this.direction.dot(Io.cross(ji));if(l<0||c+l>o)return null;let h=-a*ji.dot(Lo);return h<0?null:this.at(h/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},_n=class extends Oi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ui,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},uh=new Fe,pn=new yi,ys=new oi,dh=new A,xs=new A,Ms=new A,Ss=new A,Do=new A,bs=new A,ph=new A,Ts=new A,Oe=class extends St{constructor(e=new Ke,t=new _n){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let i=e[t[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let n=0,s=i.length;n<s;n++){let a=i[n].name||String(n);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=n}}}}getVertexPosition(e,t){let i=this.geometry,n=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(n,e);let o=this.morphTargetInfluences;if(s&&o){bs.set(0,0,0);for(let c=0,l=s.length;c<l;c++){let h=o[c],d=s[c];h!==0&&(Do.fromBufferAttribute(d,e),a?bs.addScaledVector(Do,h):bs.addScaledVector(Do.sub(t),h))}t.add(bs)}return t}raycast(e,t){let i=this.geometry,n=this.material,s=this.matrixWorld;if(n!==void 0){if(i.boundingSphere===null&&i.computeBoundingSphere(),ys.copy(i.boundingSphere),ys.applyMatrix4(s),pn.copy(e.ray).recast(e.near),ys.containsPoint(pn.origin)===!1&&(pn.intersectSphere(ys,dh)===null||pn.origin.distanceToSquared(dh)>(e.far-e.near)**2))return;uh.copy(s).invert(),pn.copy(e.ray).applyMatrix4(uh),i.boundingBox!==null&&pn.intersectsBox(i.boundingBox)===!1||this._computeIntersections(e,t,pn)}}_computeIntersections(e,t,i){let n,s=this.geometry,a=this.material,o=s.index,c=s.attributes.position,l=s.attributes.uv,h=s.attributes.uv1,d=s.attributes.normal,p=s.groups,u=s.drawRange;if(o!==null)if(Array.isArray(a))for(let f=0,m=p.length;f<m;f++){let y=p[f],g=a[y.materialIndex];for(let _=Math.max(y.start,u.start),x=Math.min(o.count,Math.min(y.start+y.count,u.start+u.count));_<x;_+=3)n=Es(this,g,e,i,l,h,d,o.getX(_),o.getX(_+1),o.getX(_+2)),n&&(n.faceIndex=Math.floor(_/3),n.face.materialIndex=y.materialIndex,t.push(n))}else for(let f=Math.max(0,u.start),m=Math.min(o.count,u.start+u.count);f<m;f+=3)n=Es(this,a,e,i,l,h,d,o.getX(f),o.getX(f+1),o.getX(f+2)),n&&(n.faceIndex=Math.floor(f/3),t.push(n));else if(c!==void 0)if(Array.isArray(a))for(let f=0,m=p.length;f<m;f++){let y=p[f],g=a[y.materialIndex];for(let _=Math.max(y.start,u.start),x=Math.min(c.count,Math.min(y.start+y.count,u.start+u.count));_<x;_+=3)n=Es(this,g,e,i,l,h,d,_,_+1,_+2),n&&(n.faceIndex=Math.floor(_/3),n.face.materialIndex=y.materialIndex,t.push(n))}else for(let f=Math.max(0,u.start),m=Math.min(c.count,u.start+u.count);f<m;f+=3)n=Es(this,a,e,i,l,h,d,f,f+1,f+2),n&&(n.faceIndex=Math.floor(f/3),t.push(n))}};function Es(r,e,t,i,n,s,a,o,c,l){r.getVertexPosition(o,xs),r.getVertexPosition(c,Ms),r.getVertexPosition(l,Ss);let h=function(d,p,u,f,m,y,g,_){let x;if(x=p.side===1?f.intersectTriangle(g,y,m,!0,_):f.intersectTriangle(m,y,g,p.side===0,_),x===null)return null;Ts.copy(_),Ts.applyMatrix4(d.matrixWorld);let S=u.ray.origin.distanceTo(Ts);return S<u.near||S>u.far?null:{distance:S,point:Ts.clone(),object:d}}(r,e,t,i,xs,Ms,Ss,ph);if(h){let d=new A;Li.getBarycoord(ph,xs,Ms,Ss,d),n&&(h.uv=Li.getInterpolatedAttribute(n,o,c,l,d,new Q)),s&&(h.uv1=Li.getInterpolatedAttribute(s,o,c,l,d,new Q)),a&&(h.normal=Li.getInterpolatedAttribute(a,o,c,l,d,new A),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let p={a:o,b:c,c:l,normal:new A,materialIndex:0};Li.getNormal(xs,Ms,Ss,p.normal),h.face=p,h.barycoord=d}return h}var Uf=new Je,Of=new Je,Ff=new Je,Bf=new Je,zf=new Fe,Gf=new A,Vf=new oi,Hf=new Fe,kf=new yi;var Xs=class extends Ot{constructor(e=null,t=1,i=1,n,s,a,o,c,l=1003,h=1003,d,p){super(null,a,o,c,l,h,n,s,d,p),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Wf=new Fe,Xf=new Fe;var jf=new Fe,qf=new Fe;var Yf=new ai,Zf=new Fe,Jf=new Oe,Kf=new oi;var No=new A,Pd=new A,Id=new Le,Zt=class{constructor(e=new A(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,n){return this.normal.set(e,t,i),this.constant=n,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let n=No.subVectors(i,t).cross(Pd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(n,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let n=e.delta(No),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/s;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(n,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||Id.getNormalMatrix(e),n=this.coplanarPoint(No).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},mn=new oi,Ld=new Q(.5,.5),ws=new A,Fi=class{constructor(e=new Zt,t=new Zt,i=new Zt,n=new Zt,s=new Zt,a=new Zt){this.planes=[e,t,i,n,s,a]}set(e,t,i,n,s,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(n),o[4].copy(s),o[5].copy(a),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=2e3,i=!1){let n=this.planes,s=e.elements,a=s[0],o=s[1],c=s[2],l=s[3],h=s[4],d=s[5],p=s[6],u=s[7],f=s[8],m=s[9],y=s[10],g=s[11],_=s[12],x=s[13],S=s[14],w=s[15];if(n[0].setComponents(l-a,u-h,g-f,w-_).normalize(),n[1].setComponents(l+a,u+h,g+f,w+_).normalize(),n[2].setComponents(l+o,u+d,g+m,w+x).normalize(),n[3].setComponents(l-o,u-d,g-m,w-x).normalize(),i)n[4].setComponents(c,p,y,S).normalize(),n[5].setComponents(l-c,u-p,g-y,w-S).normalize();else if(n[4].setComponents(l-c,u-p,g-y,w-S).normalize(),t===Ni)n[5].setComponents(l+c,u+p,g+y,w+S).normalize();else{if(t!==Yn)throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);n[5].setComponents(c,p,y,S).normalize()}return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),mn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),mn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(mn)}intersectsSprite(e){mn.center.set(0,0,0);let t=Ld.distanceTo(e.center);return mn.radius=.7071067811865476+t,mn.applyMatrix4(e.matrixWorld),this.intersectsSphere(mn)}intersectsSphere(e){let t=this.planes,i=e.center,n=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<n)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let n=t[i];if(ws.x=n.normal.x>0?e.max.x:e.min.x,ws.y=n.normal.y>0?e.max.y:e.min.y,ws.z=n.normal.z>0?e.max.z:e.min.z,n.distanceToPoint(ws)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},mh=new Fe,js=class r{constructor(){this.coordinateSystem=Ni,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,i=this._frustums;for(let n=0;n<t.length;n++){let s=t[n];mh.multiplyMatrices(s.projectionMatrix,s.matrixWorldInverse),i[n]===void 0&&(i[n]=new Fi),i[n].setFromProjectionMatrix(mh,s.coordinateSystem,s.reversedDepth)}return this._count=t.length,this}intersectsObject(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,i=e._frustums;for(let n=0;n<e._count;n++)t[n]===void 0&&(t[n]=new Fi),t[n].copy(i[n]);return this._count=e._count,this}clone(){return new r().copy(this)}};var Yo=class{constructor(){this.index=0,this.pool=[],this.list=[]}push(e,t,i,n){let s=this.pool,a=this.list;this.index>=s.length&&s.push({start:-1,count:-1,z:-1,index:-1});let o=s[this.index];a.push(o),this.index++,o.start=e,o.count=t,o.z=i,o.index=n}reset(){this.list.length=0,this.index=0}},$f=new Fe,Qf=new Ue(1,1,1),eg=new Fi,tg=new js,ig=new ai,ng=new oi,rg=new A,sg=new A,ag=new A,og=new Yo,lg=new Oe;var vn=class extends Oi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ue(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},qs=new A,Ys=new A,fh=new Fe,br=new yi,As=new oi,Uo=new A,gh=new A,Zs=class extends St{constructor(e=new Ke,t=new vn){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[0];for(let n=1,s=t.count;n<s;n++)qs.fromBufferAttribute(t,n-1),Ys.fromBufferAttribute(t,n),i[n]=i[n-1],i[n]+=qs.distanceTo(Ys);e.setAttribute("lineDistance",new Te(i,1))}else be("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let i=this.geometry,n=this.matrixWorld,s=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),As.copy(i.boundingSphere),As.applyMatrix4(n),As.radius+=s,e.ray.intersectsSphere(As)===!1)return;fh.copy(n).invert(),br.copy(e.ray).applyMatrix4(fh);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,h=i.index,d=i.attributes.position;if(h!==null){let p=Math.max(0,a.start),u=Math.min(h.count,a.start+a.count);for(let f=p,m=u-1;f<m;f+=l){let y=h.getX(f),g=h.getX(f+1),_=Cs(this,e,br,c,y,g,f);_&&t.push(_)}if(this.isLineLoop){let f=h.getX(u-1),m=h.getX(p),y=Cs(this,e,br,c,f,m,u-1);y&&t.push(y)}}else{let p=Math.max(0,a.start),u=Math.min(d.count,a.start+a.count);for(let f=p,m=u-1;f<m;f+=l){let y=Cs(this,e,br,c,f,f+1,f);y&&t.push(y)}if(this.isLineLoop){let f=Cs(this,e,br,c,u-1,p,u-1);f&&t.push(f)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let i=e[t[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let n=0,s=i.length;n<s;n++){let a=i[n].name||String(n);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=n}}}}};function Cs(r,e,t,i,n,s,a){let o=r.geometry.attributes.position;if(qs.fromBufferAttribute(o,n),Ys.fromBufferAttribute(o,s),t.distanceSqToSegment(qs,Ys,Uo,gh)>i)return;Uo.applyMatrix4(r.matrixWorld);let c=e.ray.origin.distanceTo(Uo);return c<e.near||c>e.far?void 0:{distance:c,point:gh.clone().applyMatrix4(r.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:r}}var _h=new A,vh=new A,Ki=class extends Zs{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[];for(let n=0,s=t.count;n<s;n+=2)_h.fromBufferAttribute(t,n),vh.fromBufferAttribute(t,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+_h.distanceTo(vh);e.setAttribute("lineDistance",new Te(i,1))}else be("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var cg=new Fe,hg=new yi,ug=new oi,dg=new A;var Or=class extends Ot{constructor(e=[],t=301,i,n,s,a,o,c,l,h){super(e,t,i,n,s,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var Bi=class extends Ot{constructor(e,t,i=1014,n,s,a,o=1003,c=1003,l,h=1026,d=1){if(h!==an&&h!==1027)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");super({width:e,height:t,depth:d},n,s,a,o,c,h,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Kn(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Js=class extends Bi{constructor(e,t=1014,i=301,n,s,a=1003,o=1003,c,l=1026){let h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,i,n,s,a,o,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Fr=class extends Ot{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Rt=class r extends Ke{constructor(e=1,t=1,i=1,n=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:n,heightSegments:s,depthSegments:a};let o=this;n=Math.floor(n),s=Math.floor(s),a=Math.floor(a);let c=[],l=[],h=[],d=[],p=0,u=0;function f(m,y,g,_,x,S,w,M,D,O,N){let U=S/D,V=w/O,F=S/2,Y=w/2,k=M/2,z=D+1,q=O+1,W=0,ie=0,he=new A;for(let Me=0;Me<q;Me++){let pe=Me*V-Y;for(let me=0;me<z;me++){let ee=me*U-F;he[m]=ee*_,he[y]=pe*x,he[g]=k,l.push(he.x,he.y,he.z),he[m]=0,he[y]=0,he[g]=M>0?1:-1,h.push(he.x,he.y,he.z),d.push(me/D),d.push(1-Me/O),W+=1}}for(let Me=0;Me<O;Me++)for(let pe=0;pe<D;pe++){let me=p+pe+z*Me,ee=p+pe+z*(Me+1),le=p+(pe+1)+z*(Me+1),se=p+(pe+1)+z*Me;c.push(me,ee,se),c.push(ee,le,se),ie+=6}o.addGroup(u,ie,N),u+=ie,p+=W}f("z","y","x",-1,-1,i,t,e,a,s,0),f("z","y","x",1,-1,i,t,-e,a,s,1),f("x","z","y",1,1,e,i,t,n,a,2),f("x","z","y",1,-1,e,i,-t,n,a,3),f("x","y","z",1,-1,e,t,i,n,s,4),f("x","y","z",-1,-1,e,t,-i,n,s,5),this.setIndex(c),this.setAttribute("position",new Te(l,3)),this.setAttribute("normal",new Te(h,3)),this.setAttribute("uv",new Te(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}},Ks=class r extends Ke{constructor(e=1,t=1,i=4,n=8,s=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:i,radialSegments:n,heightSegments:s},t=Math.max(0,t),i=Math.max(1,Math.floor(i)),n=Math.max(3,Math.floor(n)),s=Math.max(1,Math.floor(s));let a=[],o=[],c=[],l=[],h=t/2,d=Math.PI/2*e,p=t,u=2*d+p,f=2*i+s,m=n+1,y=new A,g=new A;for(let _=0;_<=f;_++){let x=0,S=0,w=0,M=0;if(_<=i){let N=_/i,U=N*Math.PI/2;S=-h-e*Math.cos(U),w=e*Math.sin(U),M=-e*Math.cos(U),x=N*d}else if(_<=i+s){let N=(_-i)/s;S=N*t-h,w=e,M=0,x=d+N*p}else{let N=(_-i-s)/i,U=N*Math.PI/2;S=h+e*Math.sin(U),w=e*Math.cos(U),M=e*Math.sin(U),x=d+p+N*d}let D=Math.max(0,Math.min(1,x/u)),O=0;_===0?O=.5/n:_===f&&(O=-.5/n);for(let N=0;N<=n;N++){let U=N/n,V=U*Math.PI*2,F=Math.sin(V),Y=Math.cos(V);g.x=-w*Y,g.y=S,g.z=w*F,o.push(g.x,g.y,g.z),y.set(-w*Y,M,w*F),y.normalize(),c.push(y.x,y.y,y.z),l.push(U+O,D)}if(_>0){let N=(_-1)*m;for(let U=0;U<n;U++){let V=N+U,F=N+U+1,Y=_*m+U,k=_*m+U+1;a.push(V,F,Y),a.push(F,k,Y)}}}this.setIndex(a),this.setAttribute("position",new Te(o,3)),this.setAttribute("normal",new Te(c,3)),this.setAttribute("uv",new Te(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}},er=class r extends Ke{constructor(e=1,t=32,i=0,n=2*Math.PI){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:n},t=Math.max(3,t);let s=[],a=[],o=[],c=[],l=new A,h=new Q;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let d=0,p=3;d<=t;d++,p+=3){let u=i+d/t*n;l.x=e*Math.cos(u),l.y=e*Math.sin(u),a.push(l.x,l.y,l.z),o.push(0,0,1),h.x=(a[p]/e+1)/2,h.y=(a[p+1]/e+1)/2,c.push(h.x,h.y)}for(let d=1;d<=t;d++)s.push(d,d+1,0);this.setIndex(s),this.setAttribute("position",new Te(a,3)),this.setAttribute("normal",new Te(o,3)),this.setAttribute("uv",new Te(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.segments,e.thetaStart,e.thetaLength)}},xi=class r extends Ke{constructor(e=1,t=1,i=1,n=32,s=1,a=!1,o=0,c=2*Math.PI){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:n,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:c};let l=this;n=Math.floor(n),s=Math.floor(s);let h=[],d=[],p=[],u=[],f=0,m=[],y=i/2,g=0;function _(x){let S=f,w=new Q,M=new A,D=0,O=x===!0?e:t,N=x===!0?1:-1;for(let V=1;V<=n;V++)d.push(0,y*N,0),p.push(0,N,0),u.push(.5,.5),f++;let U=f;for(let V=0;V<=n;V++){let F=V/n*c+o,Y=Math.cos(F),k=Math.sin(F);M.x=O*k,M.y=y*N,M.z=O*Y,d.push(M.x,M.y,M.z),p.push(0,N,0),w.x=.5*Y+.5,w.y=.5*k*N+.5,u.push(w.x,w.y),f++}for(let V=0;V<n;V++){let F=S+V,Y=U+V;x===!0?h.push(Y,Y+1,F):h.push(Y+1,Y,F),D+=3}l.addGroup(g,D,x===!0?1:2),g+=D}(function(){let x=new A,S=new A,w=0,M=(t-e)/i;for(let D=0;D<=s;D++){let O=[],N=D/s,U=N*(t-e)+e;for(let V=0;V<=n;V++){let F=V/n,Y=F*c+o,k=Math.sin(Y),z=Math.cos(Y);S.x=U*k,S.y=-N*i+y,S.z=U*z,d.push(S.x,S.y,S.z),x.set(k,M,z).normalize(),p.push(x.x,x.y,x.z),u.push(F,1-N),O.push(f++)}m.push(O)}for(let D=0;D<n;D++)for(let O=0;O<s;O++){let N=m[O][D],U=m[O+1][D],V=m[O+1][D+1],F=m[O][D+1];(e>0||O!==0)&&(h.push(N,U,F),w+=3),(t>0||O!==s-1)&&(h.push(U,V,F),w+=3)}l.addGroup(g,w,0),g+=w})(),a===!1&&(e>0&&_(!0),t>0&&_(!1)),this.setIndex(h),this.setAttribute("position",new Te(d,3)),this.setAttribute("normal",new Te(p,3)),this.setAttribute("uv",new Te(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},tr=class r extends xi{constructor(e=1,t=1,i=32,n=1,s=!1,a=0,o=2*Math.PI){super(0,e,t,i,n,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:n,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new r(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},$i=class r extends Ke{constructor(e=[],t=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:n};let s=[],a=[];function o(u,f,m,y){let g=y+1,_=[];for(let x=0;x<=g;x++){_[x]=[];let S=u.clone().lerp(m,x/g),w=f.clone().lerp(m,x/g),M=g-x;for(let D=0;D<=M;D++)_[x][D]=D===0&&x===g?S:S.clone().lerp(w,D/M)}for(let x=0;x<g;x++)for(let S=0;S<2*(g-x)-1;S++){let w=Math.floor(S/2);S%2==0?(c(_[x][w+1]),c(_[x+1][w]),c(_[x][w])):(c(_[x][w+1]),c(_[x+1][w+1]),c(_[x+1][w]))}}function c(u){s.push(u.x,u.y,u.z)}function l(u,f){let m=3*u;f.x=e[m+0],f.y=e[m+1],f.z=e[m+2]}function h(u,f,m,y){y<0&&u.x===1&&(a[f]=u.x-1),m.x===0&&m.z===0&&(a[f]=y/2/Math.PI+.5)}function d(u){return Math.atan2(u.z,-u.x)}function p(u){return Math.atan2(-u.y,Math.sqrt(u.x*u.x+u.z*u.z))}(function(u){let f=new A,m=new A,y=new A;for(let g=0;g<t.length;g+=3)l(t[g+0],f),l(t[g+1],m),l(t[g+2],y),o(f,m,y,u)})(n),function(u){let f=new A;for(let m=0;m<s.length;m+=3)f.x=s[m+0],f.y=s[m+1],f.z=s[m+2],f.normalize().multiplyScalar(u),s[m+0]=f.x,s[m+1]=f.y,s[m+2]=f.z}(i),function(){let u=new A;for(let f=0;f<s.length;f+=3){u.x=s[f+0],u.y=s[f+1],u.z=s[f+2];let m=d(u)/2/Math.PI+.5,y=p(u)/Math.PI+.5;a.push(m,1-y)}(function(){let f=new A,m=new A,y=new A,g=new A,_=new Q,x=new Q,S=new Q;for(let w=0,M=0;w<s.length;w+=9,M+=6){f.set(s[w+0],s[w+1],s[w+2]),m.set(s[w+3],s[w+4],s[w+5]),y.set(s[w+6],s[w+7],s[w+8]),_.set(a[M+0],a[M+1]),x.set(a[M+2],a[M+3]),S.set(a[M+4],a[M+5]),g.copy(f).add(m).add(y).divideScalar(3);let D=d(g);h(_,M+0,f,D),h(x,M+2,m,D),h(S,M+4,y,D)}})(),function(){for(let f=0;f<a.length;f+=6){let m=a[f+0],y=a[f+2],g=a[f+4],_=Math.max(m,y,g),x=Math.min(m,y,g);_>.9&&x<.1&&(m<.2&&(a[f+0]+=1),y<.2&&(a[f+2]+=1),g<.2&&(a[f+4]+=1))}}()}(),this.setAttribute("position",new Te(s,3)),this.setAttribute("normal",new Te(s.slice(),3)),this.setAttribute("uv",new Te(a,2)),n===0?this.computeVertexNormals():this.normalizeNormals()}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.vertices,e.indices,e.radius,e.detail)}},$s=class r extends $i{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,n=1/i;super([-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-n,-i,0,-n,i,0,n,-i,0,n,i,-n,-i,0,-n,i,0,n,-i,0,n,i,0,-i,0,-n,i,0,-n,-i,0,n,i,0,n],[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},Rs=new A,Ps=new A,Oo=new A,Is=new Li,Qi=class extends Ke{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let n=Math.pow(10,4),s=Math.cos(jn*t),a=e.getIndex(),o=e.getAttribute("position"),c=a?a.count:o.count,l=[0,0,0],h=["a","b","c"],d=new Array(3),p={},u=[];for(let f=0;f<c;f+=3){a?(l[0]=a.getX(f),l[1]=a.getX(f+1),l[2]=a.getX(f+2)):(l[0]=f,l[1]=f+1,l[2]=f+2);let{a:m,b:y,c:g}=Is;if(m.fromBufferAttribute(o,l[0]),y.fromBufferAttribute(o,l[1]),g.fromBufferAttribute(o,l[2]),Is.getNormal(Oo),d[0]=`${Math.round(m.x*n)},${Math.round(m.y*n)},${Math.round(m.z*n)}`,d[1]=`${Math.round(y.x*n)},${Math.round(y.y*n)},${Math.round(y.z*n)}`,d[2]=`${Math.round(g.x*n)},${Math.round(g.y*n)},${Math.round(g.z*n)}`,d[0]!==d[1]&&d[1]!==d[2]&&d[2]!==d[0])for(let _=0;_<3;_++){let x=(_+1)%3,S=d[_],w=d[x],M=Is[h[_]],D=Is[h[x]],O=`${S}_${w}`,N=`${w}_${S}`;N in p&&p[N]?(Oo.dot(p[N].normal)<=s&&(u.push(M.x,M.y,M.z),u.push(D.x,D.y,D.z)),p[N]=null):O in p||(p[O]={index0:l[_],index1:l[x],normal:Oo.clone()})}}for(let f in p)if(p[f]){let{index0:m,index1:y}=p[f];Rs.fromBufferAttribute(o,m),Ps.fromBufferAttribute(o,y),u.push(Rs.x,Rs.y,Rs.z),u.push(Ps.x,Ps.y,Ps.z)}this.setAttribute("position",new Te(u,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},Wt=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){be("Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,n=this.getPoint(0),s=0;t.push(0);for(let a=1;a<=e;a++)i=this.getPoint(a/e),s+=i.distanceTo(n),t.push(s),n=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),n=0,s=i.length,a;a=t||e*i[s-1];let o,c=0,l=s-1;for(;c<=l;)if(n=Math.floor(c+(l-c)/2),o=i[n]-a,o<0)c=n+1;else{if(!(o>0)){l=n;break}l=n-1}if(n=l,i[n]===a)return n/(s-1);let h=i[n];return(n+(a-h)/(i[n+1]-h))/(s-1)}getTangent(e,t){let n=e-1e-4,s=e+1e-4;n<0&&(n=0),s>1&&(s=1);let a=this.getPoint(n),o=this.getPoint(s),c=t||(a.isVector2?new Q:new A);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new A,n=[],s=[],a=[],o=new A,c=new Fe;for(let u=0;u<=e;u++){let f=u/e;n[u]=this.getTangentAt(f,new A)}s[0]=new A,a[0]=new A;let l=Number.MAX_VALUE,h=Math.abs(n[0].x),d=Math.abs(n[0].y),p=Math.abs(n[0].z);h<=l&&(l=h,i.set(1,0,0)),d<=l&&(l=d,i.set(0,1,0)),p<=l&&i.set(0,0,1),o.crossVectors(n[0],i).normalize(),s[0].crossVectors(n[0],o),a[0].crossVectors(n[0],s[0]);for(let u=1;u<=e;u++){if(s[u]=s[u-1].clone(),a[u]=a[u-1].clone(),o.crossVectors(n[u-1],n[u]),o.length()>Number.EPSILON){o.normalize();let f=Math.acos(Be(n[u-1].dot(n[u]),-1,1));s[u].applyMatrix4(c.makeRotationAxis(o,f))}a[u].crossVectors(n[u],s[u])}if(t===!0){let u=Math.acos(Be(s[0].dot(s[e]),-1,1));u/=e,n[0].dot(o.crossVectors(s[0],s[e]))>0&&(u=-u);for(let f=1;f<=e;f++)s[f].applyMatrix4(c.makeRotationAxis(n[f],u*f)),a[f].crossVectors(n[f],s[f])}return{tangents:n,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},ir=class extends Wt{constructor(e=0,t=0,i=1,n=1,s=0,a=2*Math.PI,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=n,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new Q){let i=t,n=2*Math.PI,s=this.aEndAngle-this.aStartAngle,a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=n;for(;s>n;)s-=n;s<Number.EPSILON&&(s=a?0:n),this.aClockwise!==!0||a||(s===n?s=-n:s-=n);let o=this.aStartAngle+e*s,c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),p=c-this.aX,u=l-this.aY;c=p*h-u*d+this.aX,l=p*d+u*h+this.aY}return i.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Qs=class extends ir{constructor(e,t,i,n,s,a){super(e,t,i,i,n,s,a),this.isArcCurve=!0,this.type="ArcCurve"}};function lc(){let r=0,e=0,t=0,i=0;function n(s,a,o,c){r=s,e=o,t=-3*s+3*a-2*o-c,i=2*s-2*a+o+c}return{initCatmullRom:function(s,a,o,c,l){n(a,o,l*(o-s),l*(c-a))},initNonuniformCatmullRom:function(s,a,o,c,l,h,d){let p=(a-s)/l-(o-s)/(l+h)+(o-a)/h,u=(o-a)/h-(c-a)/(h+d)+(c-o)/d;p*=h,u*=h,n(a,o,p,u)},calc:function(s){let a=s*s;return r+e*s+t*a+i*(a*s)}}}var yh=new A,xh=new A,Fo=new lc,Bo=new lc,zo=new lc,nr=class extends Wt{constructor(e=[],t=!1,i="centripetal",n=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=n}getPoint(e,t=new A){let i=t,n=this.points,s=n.length,a=(s-(this.closed?0:1))*e,o,c,l=Math.floor(a),h=a-l;this.closed?l+=l>0?0:(Math.floor(Math.abs(l)/s)+1)*s:h===0&&l===s-1&&(l=s-2,h=1),this.closed||l>0?o=n[(l-1)%s]:(xh.subVectors(n[0],n[1]).add(n[0]),o=xh);let d=n[l%s],p=n[(l+1)%s];if(this.closed||l+2<s?c=n[(l+2)%s]:(yh.subVectors(n[s-1],n[s-2]).add(n[s-1]),c=yh),this.curveType==="centripetal"||this.curveType==="chordal"){let u=this.curveType==="chordal"?.5:.25,f=Math.pow(o.distanceToSquared(d),u),m=Math.pow(d.distanceToSquared(p),u),y=Math.pow(p.distanceToSquared(c),u);m<1e-4&&(m=1),f<1e-4&&(f=m),y<1e-4&&(y=m),Fo.initNonuniformCatmullRom(o.x,d.x,p.x,c.x,f,m,y),Bo.initNonuniformCatmullRom(o.y,d.y,p.y,c.y,f,m,y),zo.initNonuniformCatmullRom(o.z,d.z,p.z,c.z,f,m,y)}else this.curveType==="catmullrom"&&(Fo.initCatmullRom(o.x,d.x,p.x,c.x,this.tension),Bo.initCatmullRom(o.y,d.y,p.y,c.y,this.tension),zo.initCatmullRom(o.z,d.z,p.z,c.z,this.tension));return i.set(Fo.calc(h),Bo.calc(h),zo.calc(h)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let n=e.points[t];this.points.push(new A().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Mh(r,e,t,i,n){let s=.5*(i-e),a=.5*(n-t),o=r*r;return(2*t-2*i+s+a)*(r*o)+(-3*t+3*i-2*s-a)*o+s*r+t}function wr(r,e,t,i){return function(n,s){let a=1-n;return a*a*s}(r,e)+function(n,s){return 2*(1-n)*n*s}(r,t)+function(n,s){return n*n*s}(r,i)}function Ar(r,e,t,i,n){return function(s,a){let o=1-s;return o*o*o*a}(r,e)+function(s,a){let o=1-s;return 3*o*o*s*a}(r,t)+function(s,a){return 3*(1-s)*s*s*a}(r,i)+function(s,a){return s*s*s*a}(r,n)}var Br=class extends Wt{constructor(e=new Q,t=new Q,i=new Q,n=new Q){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=n}getPoint(e,t=new Q){let i=t,n=this.v0,s=this.v1,a=this.v2,o=this.v3;return i.set(Ar(e,n.x,s.x,a.x,o.x),Ar(e,n.y,s.y,a.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ea=class extends Wt{constructor(e=new A,t=new A,i=new A,n=new A){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=n}getPoint(e,t=new A){let i=t,n=this.v0,s=this.v1,a=this.v2,o=this.v3;return i.set(Ar(e,n.x,s.x,a.x,o.x),Ar(e,n.y,s.y,a.y,o.y),Ar(e,n.z,s.z,a.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},zr=class extends Wt{constructor(e=new Q,t=new Q){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Q){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Q){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ta=class extends Wt{constructor(e=new A,t=new A){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new A){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new A){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Gr=class extends Wt{constructor(e=new Q,t=new Q,i=new Q){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new Q){let i=t,n=this.v0,s=this.v1,a=this.v2;return i.set(wr(e,n.x,s.x,a.x),wr(e,n.y,s.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Vr=class extends Wt{constructor(e=new A,t=new A,i=new A){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new A){let i=t,n=this.v0,s=this.v1,a=this.v2;return i.set(wr(e,n.x,s.x,a.x),wr(e,n.y,s.y,a.y),wr(e,n.z,s.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Hr=class extends Wt{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Q){let i=t,n=this.points,s=(n.length-1)*e,a=Math.floor(s),o=s-a,c=n[a===0?a:a-1],l=n[a],h=n[a>n.length-2?n.length-1:a+1],d=n[a>n.length-3?n.length-1:a+2];return i.set(Mh(o,c.x,l.x,h.x,d.x),Mh(o,c.y,l.y,h.y,d.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let n=e.points[t];this.points.push(new Q().fromArray(n))}return this}},ia=Object.freeze({__proto__:null,ArcCurve:Qs,CatmullRomCurve3:nr,CubicBezierCurve:Br,CubicBezierCurve3:ea,EllipseCurve:ir,LineCurve:zr,LineCurve3:ta,QuadraticBezierCurve:Gr,QuadraticBezierCurve3:Vr,SplineCurve:Hr}),na=class extends Wt{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new ia[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),n=this.getCurveLengths(),s=0;for(;s<n.length;){if(n[s]>=i){let a=n[s]-i,o=this.curves[s],c=o.getLength(),l=c===0?0:1-a/c;return o.getPointAt(l,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,n=this.curves.length;i<n;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let n=0,s=this.curves;n<s.length;n++){let a=s[n],o=a.isEllipseCurve?2*e:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,c=a.getPoints(o);for(let l=0;l<c.length;l++){let h=c[l];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let n=e.curves[t];this.curves.push(new ia[n.type]().fromJSON(n))}return this}},Kt=class extends na{constructor(e){super(),this.type="Path",this.currentPoint=new Q,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new zr(this.currentPoint.clone(),new Q(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,n){let s=new Gr(this.currentPoint.clone(),new Q(e,t),new Q(i,n));return this.curves.push(s),this.currentPoint.set(i,n),this}bezierCurveTo(e,t,i,n,s,a){let o=new Br(this.currentPoint.clone(),new Q(e,t),new Q(i,n),new Q(s,a));return this.curves.push(o),this.currentPoint.set(s,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new Hr(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,n,s,a){let o=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+o,t+c,i,n,s,a),this}absarc(e,t,i,n,s,a){return this.absellipse(e,t,i,i,n,s,a),this}ellipse(e,t,i,n,s,a,o,c){let l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+l,t+h,i,n,s,a,o,c),this}absellipse(e,t,i,n,s,a,o,c){let l=new ir(e,t,i,n,s,a,o,c);if(this.curves.length>0){let d=l.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(l);let h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Ft=class extends Kt{constructor(e){super(e),this.uuid=wn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,n=this.holes.length;i<n;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let n=e.holes[t];this.holes.push(new Kt().fromJSON(n))}return this}};function Dd(r,e,t=2){let i=e&&e.length,n=i?e[0]*t:r.length,s=Sh(r,0,n,t,!0),a=[];if(!s||s.next===s.prev)return a;let o,c,l;if(i&&(s=function(h,d,p,u){let f=[];for(let m=0,y=d.length;m<y;m++){let g=Sh(h,d[m]*u,m<y-1?d[m+1]*u:h.length,u,!1);g===g.next&&(g.steiner=!0),f.push(Vd(g))}f.sort(Bd);for(let m=0;m<f.length;m++)p=zd(f[m],p);return p}(r,e,s,t)),r.length>80*t){o=r[0],c=r[1];let h=o,d=c;for(let p=t;p<n;p+=t){let u=r[p],f=r[p+1];u<o&&(o=u),f<c&&(c=f),u>h&&(h=u),f>d&&(d=f)}l=Math.max(h-o,d-c),l=l!==0?32767/l:0}return kr(s,a,t,o,c,l,0),a}function Sh(r,e,t,i,n){let s;if(n===function(a,o,c,l){let h=0;for(let d=o,p=c-l;d<c;d+=l)h+=(a[p]-a[d])*(a[d+1]+a[p+1]),p=d;return h}(r,e,t,i)>0)for(let a=e;a<t;a+=i)s=bh(a/i|0,r[a],r[a+1],s);else for(let a=t-i;a>=e;a-=i)s=bh(a/i|0,r[a],r[a+1],s);return s&&rr(s,s.next)&&(Xr(s),s=s.next),s}function yn(r,e){if(!r)return r;e||(e=r);let t,i=r;do if(t=!1,i.steiner||!rr(i,i.next)&&at(i.prev,i,i.next)!==0)i=i.next;else{if(Xr(i),i=e=i.prev,i===i.next)break;t=!0}while(t||i!==e);return e}function kr(r,e,t,i,n,s,a){if(!r)return;!a&&s&&function(c,l,h,d){let p=c;do p.z===0&&(p.z=Zo(p.x,p.y,l,h,d)),p.prevZ=p.prev,p.nextZ=p.next,p=p.next;while(p!==c);p.prevZ.nextZ=null,p.prevZ=null,function(u){let f,m=1;do{let y,g=u;u=null;let _=null;for(f=0;g;){f++;let x=g,S=0;for(let M=0;M<m&&(S++,x=x.nextZ,x);M++);let w=m;for(;S>0||w>0&&x;)S!==0&&(w===0||!x||g.z<=x.z)?(y=g,g=g.nextZ,S--):(y=x,x=x.nextZ,w--),_?_.nextZ=y:u=y,y.prevZ=_,_=y;g=x}_.nextZ=null,m*=2}while(f>1)}(p)}(r,i,n,s);let o=r;for(;r.prev!==r.next;){let c=r.prev,l=r.next;if(s?Ud(r,i,n,s):Nd(r))e.push(c.i,r.i,l.i),Xr(r),r=l.next,o=l.next;else if((r=l)===o){a?a===1?kr(r=Od(yn(r),e),e,t,i,n,s,2):a===2&&Fd(r,e,t,i,n,s):kr(yn(r),e,t,i,n,s,1);break}}}function Nd(r){let e=r.prev,t=r,i=r.next;if(at(e,t,i)>=0)return!1;let n=e.x,s=t.x,a=i.x,o=e.y,c=t.y,l=i.y,h=Math.min(n,s,a),d=Math.min(o,c,l),p=Math.max(n,s,a),u=Math.max(o,c,l),f=i.next;for(;f!==e;){if(f.x>=h&&f.x<=p&&f.y>=d&&f.y<=u&&Tr(n,o,s,c,a,l,f.x,f.y)&&at(f.prev,f,f.next)>=0)return!1;f=f.next}return!0}function Ud(r,e,t,i){let n=r.prev,s=r,a=r.next;if(at(n,s,a)>=0)return!1;let o=n.x,c=s.x,l=a.x,h=n.y,d=s.y,p=a.y,u=Math.min(o,c,l),f=Math.min(h,d,p),m=Math.max(o,c,l),y=Math.max(h,d,p),g=Zo(u,f,e,t,i),_=Zo(m,y,e,t,i),x=r.prevZ,S=r.nextZ;for(;x&&x.z>=g&&S&&S.z<=_;){if(x.x>=u&&x.x<=m&&x.y>=f&&x.y<=y&&x!==n&&x!==a&&Tr(o,h,c,d,l,p,x.x,x.y)&&at(x.prev,x,x.next)>=0||(x=x.prevZ,S.x>=u&&S.x<=m&&S.y>=f&&S.y<=y&&S!==n&&S!==a&&Tr(o,h,c,d,l,p,S.x,S.y)&&at(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;x&&x.z>=g;){if(x.x>=u&&x.x<=m&&x.y>=f&&x.y<=y&&x!==n&&x!==a&&Tr(o,h,c,d,l,p,x.x,x.y)&&at(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;S&&S.z<=_;){if(S.x>=u&&S.x<=m&&S.y>=f&&S.y<=y&&S!==n&&S!==a&&Tr(o,h,c,d,l,p,S.x,S.y)&&at(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function Od(r,e){let t=r;do{let i=t.prev,n=t.next.next;!rr(i,n)&&Su(i,t,t.next,n)&&Wr(i,n)&&Wr(n,i)&&(e.push(i.i,t.i,n.i),Xr(t),Xr(t.next),t=r=n),t=t.next}while(t!==r);return yn(t)}function Fd(r,e,t,i,n,s){let a=r;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Hd(a,o)){let c=bu(a,o);return a=yn(a,a.next),c=yn(c,c.next),kr(a,e,t,i,n,s,0),void kr(c,e,t,i,n,s,0)}o=o.next}a=a.next}while(a!==r)}function Bd(r,e){let t=r.x-e.x;return t===0&&(t=r.y-e.y,t===0)&&(t=(r.next.y-r.y)/(r.next.x-r.x)-(e.next.y-e.y)/(e.next.x-e.x)),t}function zd(r,e){let t=function(n,s){let a=s,o=n.x,c=n.y,l,h=-1/0;if(rr(n,a))return a;do{if(rr(n,a.next))return a.next;if(c<=a.y&&c>=a.next.y&&a.next.y!==a.y){let m=a.x+(c-a.y)*(a.next.x-a.x)/(a.next.y-a.y);if(m<=o&&m>h&&(h=m,l=a.x<a.next.x?a:a.next,m===o))return l}a=a.next}while(a!==s);if(!l)return null;let d=l,p=l.x,u=l.y,f=1/0;a=l;do{if(o>=a.x&&a.x>=p&&o!==a.x&&Mu(c<u?o:h,c,p,u,c<u?h:o,c,a.x,a.y)){let m=Math.abs(c-a.y)/(o-a.x);Wr(a,n)&&(m<f||m===f&&(a.x>l.x||a.x===l.x&&Gd(l,a)))&&(l=a,f=m)}a=a.next}while(a!==d);return l}(r,e);if(!t)return e;let i=bu(t,r);return yn(i,i.next),yn(t,t.next)}function Gd(r,e){return at(r.prev,r,e.prev)<0&&at(e.next,r,r.next)<0}function Zo(r,e,t,i,n){return(r=1431655765&((r=858993459&((r=252645135&((r=16711935&((r=(r-t)*n|0)|r<<8))|r<<4))|r<<2))|r<<1))|(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=(e-i)*n|0)|e<<8))|e<<4))|e<<2))|e<<1))<<1}function Vd(r){let e=r,t=r;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==r);return t}function Mu(r,e,t,i,n,s,a,o){return(n-a)*(e-o)>=(r-a)*(s-o)&&(r-a)*(i-o)>=(t-a)*(e-o)&&(t-a)*(s-o)>=(n-a)*(i-o)}function Tr(r,e,t,i,n,s,a,o){return!(r===a&&e===o)&&Mu(r,e,t,i,n,s,a,o)}function Hd(r,e){return r.next.i!==e.i&&r.prev.i!==e.i&&!function(t,i){let n=t;do{if(n.i!==t.i&&n.next.i!==t.i&&n.i!==i.i&&n.next.i!==i.i&&Su(n,n.next,t,i))return!0;n=n.next}while(n!==t);return!1}(r,e)&&(Wr(r,e)&&Wr(e,r)&&function(t,i){let n=t,s=!1,a=(t.x+i.x)/2,o=(t.y+i.y)/2;do n.y>o!=n.next.y>o&&n.next.y!==n.y&&a<(n.next.x-n.x)*(o-n.y)/(n.next.y-n.y)+n.x&&(s=!s),n=n.next;while(n!==t);return s}(r,e)&&(at(r.prev,r,e.prev)||at(r,e.prev,e))||rr(r,e)&&at(r.prev,r,r.next)>0&&at(e.prev,e,e.next)>0)}function at(r,e,t){return(e.y-r.y)*(t.x-e.x)-(e.x-r.x)*(t.y-e.y)}function rr(r,e){return r.x===e.x&&r.y===e.y}function Su(r,e,t,i){let n=Ds(at(r,e,t)),s=Ds(at(r,e,i)),a=Ds(at(t,i,r)),o=Ds(at(t,i,e));return n!==s&&a!==o||!(n!==0||!Ls(r,t,e))||!(s!==0||!Ls(r,i,e))||!(a!==0||!Ls(t,r,i))||!(o!==0||!Ls(t,e,i))}function Ls(r,e,t){return e.x<=Math.max(r.x,t.x)&&e.x>=Math.min(r.x,t.x)&&e.y<=Math.max(r.y,t.y)&&e.y>=Math.min(r.y,t.y)}function Ds(r){return r>0?1:r<0?-1:0}function Wr(r,e){return at(r.prev,r,r.next)<0?at(r,e,r.next)>=0&&at(r,r.prev,e)>=0:at(r,e,r.prev)<0||at(r,r.next,e)<0}function bu(r,e){let t=Jo(r.i,r.x,r.y),i=Jo(e.i,e.x,e.y),n=r.next,s=e.prev;return r.next=e,e.prev=r,t.next=n,n.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function bh(r,e,t,i){let n=Jo(r,e,t);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function Xr(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function Jo(r,e,t){return{i:r,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}var Ko=class{static triangulate(e,t,i=2){return Dd(e,t,i)}},vi=class r{static area(e){let t=e.length,i=0;for(let n=t-1,s=0;s<t;n=s++)i+=e[n].x*e[s].y-e[s].x*e[n].y;return .5*i}static isClockWise(e){return r.area(e)<0}static triangulateShape(e,t){let i=[],n=[],s=[];Th(e),Eh(i,e);let a=e.length;t.forEach(Th);for(let c=0;c<t.length;c++)n.push(a),a+=t[c].length,Eh(i,t[c]);let o=Ko.triangulate(i,n);for(let c=0;c<o.length;c+=3)s.push(o.slice(c,c+3));return s}};function Th(r){let e=r.length;e>2&&r[e-1].equals(r[0])&&r.pop()}function Eh(r,e){for(let t=0;t<e.length;t++)r.push(e[t].x),r.push(e[t].y)}var en=class r extends Ke{constructor(e=new Ft([new Q(.5,.5),new Q(-.5,.5),new Q(-.5,-.5),new Q(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,n=[],s=[];for(let o=0,c=e.length;o<c;o++)a(e[o]);function a(o){let c=[],l=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1,p=t.bevelEnabled===void 0||t.bevelEnabled,u=t.bevelThickness!==void 0?t.bevelThickness:.2,f=t.bevelSize!==void 0?t.bevelSize:u-.1,m=t.bevelOffset!==void 0?t.bevelOffset:0,y=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,_=t.UVGenerator!==void 0?t.UVGenerator:kd,x,S,w,M,D,O=!1;if(g){x=g.getSpacedPoints(h),O=!0,p=!1;let R=!!g.isCatmullRomCurve3&&g.closed;S=g.computeFrenetFrames(h,R),w=new A,M=new A,D=new A}p||(y=0,u=0,f=0,m=0);let N=o.extractPoints(l),U=N.shape,V=N.holes;if(!vi.isClockWise(U)){U=U.reverse();for(let R=0,T=V.length;R<T;R++){let v=V[R];vi.isClockWise(v)&&(V[R]=v.reverse())}}function F(R){let T=10000000000000001e-36,v=R[0];for(let L=1;L<=R.length;L++){let I=L%R.length,C=R[I],H=C.x-v.x,X=C.y-v.y,Z=H*H+X*X,re=Math.max(Math.abs(C.x),Math.abs(C.y),Math.abs(v.x),Math.abs(v.y));Z<=T*re*re?(R.splice(I,1),L--):v=C}}F(U),V.forEach(F);let Y=V.length,k=U;for(let R=0;R<Y;R++){let T=V[R];U=U.concat(T)}function z(R,T,v){return T||Ee("ExtrudeGeometry: vec does not exist"),R.clone().addScaledVector(T,v)}let q=U.length;function W(R,T,v){let L,I,C,H=R.x-T.x,X=R.y-T.y,Z=v.x-R.x,re=v.y-R.y,ve=H*H+X*X,ye=H*re-X*Z;if(Math.abs(ye)>Number.EPSILON){let ue=Math.sqrt(ve),Ce=Math.sqrt(Z*Z+re*re),te=T.x-X/ue,ae=T.y+H/ue,ne=((v.x-re/Ce-te)*re-(v.y+Z/Ce-ae)*Z)/(H*re-X*Z);L=te+H*ne-R.x,I=ae+X*ne-R.y;let fe=L*L+I*I;if(fe<=2)return new Q(L,I);C=Math.sqrt(fe/2)}else{let ue=!1;H>Number.EPSILON?Z>Number.EPSILON&&(ue=!0):H<-Number.EPSILON?Z<-Number.EPSILON&&(ue=!0):Math.sign(X)===Math.sign(re)&&(ue=!0),ue?(L=-X,I=H,C=Math.sqrt(ve)):(L=H,I=X,C=Math.sqrt(ve/2))}return new Q(L/C,I/C)}let ie=[];for(let R=0,T=k.length,v=T-1,L=R+1;R<T;R++,v++,L++)v===T&&(v=0),L===T&&(L=0),ie[R]=W(k[R],k[v],k[L]);let he=[],Me,pe,me=ie.concat();for(let R=0,T=Y;R<T;R++){let v=V[R];Me=[];for(let L=0,I=v.length,C=I-1,H=L+1;L<I;L++,C++,H++)C===I&&(C=0),H===I&&(H=0),Me[L]=W(v[L],v[C],v[H]);he.push(Me),me=me.concat(Me)}if(y===0)pe=vi.triangulateShape(k,V);else{let R=[],T=[];for(let v=0;v<y;v++){let L=v/y,I=u*Math.cos(L*Math.PI/2),C=f*Math.sin(L*Math.PI/2)+m;for(let H=0,X=k.length;H<X;H++){let Z=z(k[H],ie[H],C);ge(Z.x,Z.y,-I),L===0&&R.push(Z)}for(let H=0,X=Y;H<X;H++){let Z=V[H];Me=he[H];let re=[];for(let ve=0,ye=Z.length;ve<ye;ve++){let ue=z(Z[ve],Me[ve],C);ge(ue.x,ue.y,-I),L===0&&re.push(ue)}L===0&&T.push(re)}}pe=vi.triangulateShape(R,T)}let ee=pe.length,le=f+m;for(let R=0;R<q;R++){let T=p?z(U[R],me[R],le):U[R];O?(M.copy(S.normals[0]).multiplyScalar(T.x),w.copy(S.binormals[0]).multiplyScalar(T.y),D.copy(x[0]).add(M).add(w),ge(D.x,D.y,D.z)):ge(T.x,T.y,0)}for(let R=1;R<=h;R++)for(let T=0;T<q;T++){let v=p?z(U[T],me[T],le):U[T];O?(M.copy(S.normals[R]).multiplyScalar(v.x),w.copy(S.binormals[R]).multiplyScalar(v.y),D.copy(x[R]).add(M).add(w),ge(D.x,D.y,D.z)):ge(v.x,v.y,d/h*R)}for(let R=y-1;R>=0;R--){let T=R/y,v=u*Math.cos(T*Math.PI/2),L=f*Math.sin(T*Math.PI/2)+m;for(let I=0,C=k.length;I<C;I++){let H=z(k[I],ie[I],L);ge(H.x,H.y,d+v)}for(let I=0,C=V.length;I<C;I++){let H=V[I];Me=he[I];for(let X=0,Z=H.length;X<Z;X++){let re=z(H[X],Me[X],L);O?ge(re.x,re.y+x[h-1].y,x[h-1].x+v):ge(re.x,re.y,d+v)}}}function se(R,T){let v=R.length;for(;--v>=0;){let L=v,I=v-1;I<0&&(I=R.length-1);for(let C=0,H=h+2*y;C<H;C++){let X=q*C,Z=q*(C+1);$(T+L+X,T+I+X,T+I+Z,T+L+Z)}}}function ge(R,T,v){c.push(R),c.push(T),c.push(v)}function Ae(R,T,v){P(R),P(T),P(v);let L=n.length/3,I=_.generateTopUV(i,n,L-3,L-2,L-1);b(I[0]),b(I[1]),b(I[2])}function $(R,T,v,L){P(R),P(T),P(L),P(T),P(v),P(L);let I=n.length/3,C=_.generateSideWallUV(i,n,I-6,I-3,I-2,I-1);b(C[0]),b(C[1]),b(C[3]),b(C[1]),b(C[2]),b(C[3])}function P(R){n.push(c[3*R+0]),n.push(c[3*R+1]),n.push(c[3*R+2])}function b(R){s.push(R.x),s.push(R.y)}(function(){let R=n.length/3;if(p){let T=0,v=q*T;for(let L=0;L<ee;L++){let I=pe[L];Ae(I[2]+v,I[1]+v,I[0]+v)}T=h+2*y,v=q*T;for(let L=0;L<ee;L++){let I=pe[L];Ae(I[0]+v,I[1]+v,I[2]+v)}}else{for(let T=0;T<ee;T++){let v=pe[T];Ae(v[2],v[1],v[0])}for(let T=0;T<ee;T++){let v=pe[T];Ae(v[0]+q*h,v[1]+q*h,v[2]+q*h)}}i.addGroup(R,n.length/3-R,0)})(),function(){let R=n.length/3,T=0;se(k,T),T+=k.length;for(let v=0,L=V.length;v<L;v++){let I=V[v];se(I,T),T+=I.length}i.addGroup(R,n.length/3-R,1)}()}this.setAttribute("position",new Te(n,3)),this.setAttribute("uv",new Te(s,2)),this.computeVertexNormals()}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return function(t,i,n){if(n.shapes=[],Array.isArray(t))for(let s=0,a=t.length;s<a;s++){let o=t[s];n.shapes.push(o.uuid)}else n.shapes.push(t.uuid);return n.options=Object.assign({},i),i.extrudePath!==void 0&&(n.options.extrudePath=i.extrudePath.toJSON()),n}(this.parameters.shapes,this.parameters.options,e)}static fromJSON(e,t){let i=[];for(let s=0,a=e.shapes.length;s<a;s++){let o=t[e.shapes[s]];i.push(o)}let n=e.options.extrudePath;return n!==void 0&&(e.options.extrudePath=new ia[n.type]().fromJSON(n)),new r(i,e.options)}},kd={generateTopUV:function(r,e,t,i,n){let s=e[3*t],a=e[3*t+1],o=e[3*i],c=e[3*i+1],l=e[3*n],h=e[3*n+1];return[new Q(s,a),new Q(o,c),new Q(l,h)]},generateSideWallUV:function(r,e,t,i,n,s){let a=e[3*t],o=e[3*t+1],c=e[3*t+2],l=e[3*i],h=e[3*i+1],d=e[3*i+2],p=e[3*n],u=e[3*n+1],f=e[3*n+2],m=e[3*s],y=e[3*s+1],g=e[3*s+2];return Math.abs(o-h)<Math.abs(a-l)?[new Q(a,1-c),new Q(l,1-d),new Q(p,1-f),new Q(m,1-g)]:[new Q(o,1-c),new Q(h,1-d),new Q(u,1-f),new Q(y,1-g)]}},ra=class r extends $i{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2;super([-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},sa=class r extends Ke{constructor(e=[new Q(0,-.5),new Q(.5,0),new Q(0,.5)],t=12,i=0,n=2*Math.PI){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:n},t=Math.floor(t),n=Be(n,0,2*Math.PI);let s=[],a=[],o=[],c=[],l=[],h=1/t,d=new A,p=new Q,u=new A,f=new A,m=new A,y=0,g=0;for(let _=0;_<=e.length-1;_++)switch(_){case 0:y=e[_+1].x-e[_].x,g=e[_+1].y-e[_].y,u.x=1*g,u.y=-y,u.z=0*g,m.copy(u),u.normalize(),c.push(u.x,u.y,u.z);break;case e.length-1:c.push(m.x,m.y,m.z);break;default:y=e[_+1].x-e[_].x,g=e[_+1].y-e[_].y,u.x=1*g,u.y=-y,u.z=0*g,f.copy(u),u.x+=m.x,u.y+=m.y,u.z+=m.z,u.normalize(),c.push(u.x,u.y,u.z),m.copy(f)}for(let _=0;_<=t;_++){let x=i+_*h*n,S=Math.sin(x),w=Math.cos(x);for(let M=0;M<=e.length-1;M++){d.x=e[M].x*S,d.y=e[M].y,d.z=e[M].x*w,a.push(d.x,d.y,d.z),p.x=_/t,p.y=M/(e.length-1),o.push(p.x,p.y);let D=c[3*M+0]*S,O=c[3*M+1],N=c[3*M+0]*w;l.push(D,O,N)}}for(let _=0;_<t;_++)for(let x=0;x<e.length-1;x++){let S=x+_*e.length,w=S,M=S+e.length,D=S+e.length+1,O=S+1;s.push(w,M,O),s.push(D,O,M)}this.setIndex(s),this.setAttribute("position",new Te(a,3)),this.setAttribute("uv",new Te(o,2)),this.setAttribute("normal",new Te(l,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.points,e.segments,e.phiStart,e.phiLength)}},aa=class r extends $i{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},Mi=class r extends Ke{constructor(e=1,t=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:n};let s=e/2,a=t/2,o=Math.floor(i),c=Math.floor(n),l=o+1,h=c+1,d=e/o,p=t/c,u=[],f=[],m=[],y=[];for(let g=0;g<h;g++){let _=g*p-a;for(let x=0;x<l;x++){let S=x*d-s;f.push(S,-_,0),m.push(0,0,1),y.push(x/o),y.push(1-g/c)}}for(let g=0;g<c;g++)for(let _=0;_<o;_++){let x=_+l*g,S=_+l*(g+1),w=_+1+l*(g+1),M=_+1+l*g;u.push(x,S,M),u.push(S,w,M)}this.setIndex(u),this.setAttribute("position",new Te(f,3)),this.setAttribute("normal",new Te(m,3)),this.setAttribute("uv",new Te(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.width,e.height,e.widthSegments,e.heightSegments)}},oa=class r extends Ke{constructor(e=.5,t=1,i=32,n=1,s=0,a=2*Math.PI){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:n,thetaStart:s,thetaLength:a},i=Math.max(3,i);let o=[],c=[],l=[],h=[],d=e,p=(t-e)/(n=Math.max(1,n)),u=new A,f=new Q;for(let m=0;m<=n;m++){for(let y=0;y<=i;y++){let g=s+y/i*a;u.x=d*Math.cos(g),u.y=d*Math.sin(g),c.push(u.x,u.y,u.z),l.push(0,0,1),f.x=(u.x/t+1)/2,f.y=(u.y/t+1)/2,h.push(f.x,f.y)}d+=p}for(let m=0;m<n;m++){let y=m*(i+1);for(let g=0;g<i;g++){let _=g+y,x=_,S=_+i+1,w=_+i+2,M=_+1;o.push(x,S,M),o.push(S,w,M)}}this.setIndex(o),this.setAttribute("position",new Te(c,3)),this.setAttribute("normal",new Te(l,3)),this.setAttribute("uv",new Te(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},li=class r extends Ke{constructor(e=new Ft([new Q(0,.5),new Q(-.5,-.5),new Q(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],n=[],s=[],a=[],o=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let h=0;h<e.length;h++)l(e[h]),this.addGroup(o,c,h),o+=c,c=0;function l(h){let d=n.length/3,p=h.extractPoints(t),u=p.shape,f=p.holes;vi.isClockWise(u)===!1&&(u=u.reverse());for(let y=0,g=f.length;y<g;y++){let _=f[y];vi.isClockWise(_)===!0&&(f[y]=_.reverse())}let m=vi.triangulateShape(u,f);for(let y=0,g=f.length;y<g;y++){let _=f[y];u=u.concat(_)}for(let y=0,g=u.length;y<g;y++){let _=u[y];n.push(_.x,_.y,0),s.push(0,0,1),a.push(_.x,_.y)}for(let y=0,g=m.length;y<g;y++){let _=m[y],x=_[0]+d,S=_[1]+d,w=_[2]+d;i.push(x,S,w),c+=3}}this.setIndex(i),this.setAttribute("position",new Te(n,3)),this.setAttribute("normal",new Te(s,3)),this.setAttribute("uv",new Te(a,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return function(t,i){if(i.shapes=[],Array.isArray(t))for(let n=0,s=t.length;n<s;n++){let a=t[n];i.shapes.push(a.uuid)}else i.shapes.push(t.uuid);return i}(this.parameters.shapes,e)}static fromJSON(e,t){let i=[];for(let n=0,s=e.shapes.length;n<s;n++){let a=t[e.shapes[n]];i.push(a)}return new r(i,e.curveSegments)}},la=class r extends Ke{constructor(e=1,t=32,i=16,n=0,s=2*Math.PI,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:n,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let c=Math.min(a+o,Math.PI),l=0,h=[],d=new A,p=new A,u=[],f=[],m=[],y=[];for(let g=0;g<=i;g++){let _=[],x=g/i,S=a+x*o,w=e*Math.cos(S),M=Math.sqrt(e*e-w*w),D=0;g===0&&a===0?D=.5/t:g===i&&c===Math.PI&&(D=-.5/t);for(let O=0;O<=t;O++){let N=O/t,U=n+N*s;d.x=-M*Math.cos(U),d.y=w,d.z=M*Math.sin(U),f.push(d.x,d.y,d.z),p.copy(d).normalize(),m.push(p.x,p.y,p.z),y.push(N+D,1-x),_.push(l++)}h.push(_)}for(let g=0;g<i;g++)for(let _=0;_<t;_++){let x=h[g][_+1],S=h[g][_],w=h[g+1][_],M=h[g+1][_+1];(g!==0||a>0)&&u.push(x,S,M),(g!==i-1||c<Math.PI)&&u.push(S,w,M)}this.setIndex(u),this.setAttribute("position",new Te(f,3)),this.setAttribute("normal",new Te(m,3)),this.setAttribute("uv",new Te(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}},ca=class r extends $i{constructor(e=1,t=0){super([1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],[2,1,0,0,3,2,1,3,0,2,3,1],e,t),this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},xn=class r extends Ke{constructor(e=1,t=.4,i=12,n=48,s=2*Math.PI,a=0,o=2*Math.PI){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:n,arc:s,thetaStart:a,thetaLength:o},i=Math.floor(i),n=Math.floor(n);let c=[],l=[],h=[],d=[],p=new A,u=new A,f=new A;for(let m=0;m<=i;m++){let y=a+m/i*o;for(let g=0;g<=n;g++){let _=g/n*s;u.x=(e+t*Math.cos(y))*Math.cos(_),u.y=(e+t*Math.cos(y))*Math.sin(_),u.z=t*Math.sin(y),l.push(u.x,u.y,u.z),p.x=e*Math.cos(_),p.y=e*Math.sin(_),f.subVectors(u,p).normalize(),h.push(f.x,f.y,f.z),d.push(g/n),d.push(m/i)}}for(let m=1;m<=i;m++)for(let y=1;y<=n;y++){let g=(n+1)*m+y-1,_=(n+1)*(m-1)+y-1,x=(n+1)*(m-1)+y,S=(n+1)*m+y;c.push(g,_,S),c.push(_,x,S)}this.setIndex(c),this.setAttribute("position",new Te(l,3)),this.setAttribute("normal",new Te(h,3)),this.setAttribute("uv",new Te(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}},ha=class r extends Ke{constructor(e=1,t=.4,i=64,n=8,s=2,a=3){super(),this.type="TorusKnotGeometry",this.parameters={radius:e,tube:t,tubularSegments:i,radialSegments:n,p:s,q:a},i=Math.floor(i),n=Math.floor(n);let o=[],c=[],l=[],h=[],d=new A,p=new A,u=new A,f=new A,m=new A,y=new A,g=new A;for(let x=0;x<=i;++x){let S=x/i*s*Math.PI*2;_(S,s,a,e,u),_(S+.01,s,a,e,f),y.subVectors(f,u),g.addVectors(f,u),m.crossVectors(y,g),g.crossVectors(m,y),m.normalize(),g.normalize();for(let w=0;w<=n;++w){let M=w/n*Math.PI*2,D=-t*Math.cos(M),O=t*Math.sin(M);d.x=u.x+(D*g.x+O*m.x),d.y=u.y+(D*g.y+O*m.y),d.z=u.z+(D*g.z+O*m.z),c.push(d.x,d.y,d.z),p.subVectors(d,u).normalize(),l.push(p.x,p.y,p.z),h.push(x/i),h.push(w/n)}}for(let x=1;x<=i;x++)for(let S=1;S<=n;S++){let w=(n+1)*(x-1)+(S-1),M=(n+1)*x+(S-1),D=(n+1)*x+S,O=(n+1)*(x-1)+S;o.push(w,M,O),o.push(M,D,O)}function _(x,S,w,M,D){let O=Math.cos(x),N=Math.sin(x),U=w/S*x,V=Math.cos(U);D.x=M*(2+V)*.5*O,D.y=M*(2+V)*N*.5,D.z=M*Math.sin(U)*.5}this.setIndex(o),this.setAttribute("position",new Te(c,3)),this.setAttribute("normal",new Te(l,3)),this.setAttribute("uv",new Te(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.tube,e.tubularSegments,e.radialSegments,e.p,e.q)}},sr=class r extends Ke{constructor(e=new Vr(new A(-1,-1,0),new A(-1,1,0),new A(1,1,0)),t=64,i=1,n=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:n,closed:s};let a=e.computeFrenetFrames(t,s);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new A,c=new A,l=new Q,h=new A,d=[],p=[],u=[],f=[];function m(y){h=e.getPointAt(y/t,h);let g=a.normals[y],_=a.binormals[y];for(let x=0;x<=n;x++){let S=x/n*Math.PI*2,w=Math.sin(S),M=-Math.cos(S);c.x=M*g.x+w*_.x,c.y=M*g.y+w*_.y,c.z=M*g.z+w*_.z,c.normalize(),p.push(c.x,c.y,c.z),o.x=h.x+i*c.x,o.y=h.y+i*c.y,o.z=h.z+i*c.z,d.push(o.x,o.y,o.z)}}(function(){for(let y=0;y<t;y++)m(y);m(s===!1?t:0),function(){for(let y=0;y<=t;y++)for(let g=0;g<=n;g++)l.x=y/t,l.y=g/n,u.push(l.x,l.y)}(),function(){for(let y=1;y<=t;y++)for(let g=1;g<=n;g++){let _=(n+1)*(y-1)+(g-1),x=(n+1)*y+(g-1),S=(n+1)*y+g,w=(n+1)*(y-1)+g;f.push(_,x,w),f.push(x,S,w)}}()})(),this.setIndex(f),this.setAttribute("position",new Te(d,3)),this.setAttribute("normal",new Te(p,3)),this.setAttribute("uv",new Te(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new r(new ia[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}},ua=class extends Ke{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],i=new Set,n=new A,s=new A;if(e.index!==null){let a=e.attributes.position,o=e.index,c=e.groups;c.length===0&&(c=[{start:0,count:o.count,materialIndex:0}]);for(let l=0,h=c.length;l<h;++l){let d=c[l],p=d.start;for(let u=p,f=p+d.count;u<f;u+=3)for(let m=0;m<3;m++){let y=o.getX(u+m),g=o.getX(u+(m+1)%3);n.fromBufferAttribute(a,y),s.fromBufferAttribute(a,g),wh(n,s,i)===!0&&(t.push(n.x,n.y,n.z),t.push(s.x,s.y,s.z))}}}else{let a=e.attributes.position;for(let o=0,c=a.count/3;o<c;o++)for(let l=0;l<3;l++){let h=3*o+l,d=3*o+(l+1)%3;n.fromBufferAttribute(a,h),s.fromBufferAttribute(a,d),wh(n,s,i)===!0&&(t.push(n.x,n.y,n.z),t.push(s.x,s.y,s.z))}}this.setAttribute("position",new Te(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function wh(r,e,t){let i=`${r.x},${r.y},${r.z}-${e.x},${e.y},${e.z}`,n=`${e.x},${e.y},${e.z}-${r.x},${r.y},${r.z}`;return t.has(i)!==!0&&t.has(n)!==!0&&(t.add(i),t.add(n),!0)}var pg=Object.freeze({__proto__:null,BoxGeometry:Rt,CapsuleGeometry:Ks,CircleGeometry:er,ConeGeometry:tr,CylinderGeometry:xi,DodecahedronGeometry:$s,EdgesGeometry:Qi,ExtrudeGeometry:en,IcosahedronGeometry:ra,LatheGeometry:sa,OctahedronGeometry:aa,PlaneGeometry:Mi,PolyhedronGeometry:$i,RingGeometry:oa,ShapeGeometry:li,SphereGeometry:la,TetrahedronGeometry:ca,TorusGeometry:xn,TorusKnotGeometry:ha,TubeGeometry:sr,WireframeGeometry:ua});function An(r){let e={};for(let t in r){e[t]={};for(let i in r[t]){let n=r[t][i];if(Ah(n))n.isRenderTargetTexture?(be("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=n.clone();else if(Array.isArray(n))if(Ah(n[0])){let s=[];for(let a=0,o=n.length;a<o;a++)s[a]=n[a].clone();e[t][i]=s}else e[t][i]=n.slice();else e[t][i]=n}}return e}function Pt(r){let e={};for(let t=0;t<r.length;t++){let i=An(r[t]);for(let n in i)e[n]=i[n]}return e}function Ah(r){return r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)}function cc(r){let e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ke.workingColorSpace}var Tu={clone:An,merge:Pt},Ut=class extends Oi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,this.fragmentShader=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=An(e.uniforms),this.uniformsGroups=function(t){let i=[];for(let n=0;n<t.length;n++)i.push(t[n].clone());return i}(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let s=this.uniforms[n].value;s&&s.isTexture?t.uniforms[n]={type:"t",value:s.toJSON(e).uuid}:s&&s.isColor?t.uniforms[n]={type:"c",value:s.getHex()}:s&&s.isVector2?t.uniforms[n]={type:"v2",value:s.toArray()}:s&&s.isVector3?t.uniforms[n]={type:"v3",value:s.toArray()}:s&&s.isVector4?t.uniforms[n]={type:"v4",value:s.toArray()}:s&&s.isMatrix3?t.uniforms[n]={type:"m3",value:s.toArray()}:s&&s.isMatrix4?t.uniforms[n]={type:"m4",value:s.toArray()}:t.uniforms[n]={value:s}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let n=e.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=t[n.value]||null;break;case"c":this.uniforms[i].value=new Ue().setHex(n.value);break;case"v2":this.uniforms[i].value=new Q().fromArray(n.value);break;case"v3":this.uniforms[i].value=new A().fromArray(n.value);break;case"v4":this.uniforms[i].value=new Je().fromArray(n.value);break;case"m3":this.uniforms[i].value=new Le().fromArray(n.value);break;case"m4":this.uniforms[i].value=new Fe().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},da=class extends Ut{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},ci=class extends Oi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ue(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ui,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var pa=class extends Oi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ma=class extends Oi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ns(r,e){return r&&r.constructor!==e?typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r):r}var tn=class{constructor(e,t,i,n){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,n=t[i],s=t[i-1];i:{e:{let a;t:{n:if(!(e<n)){for(let o=i+2;;){if(n===void 0){if(e<s)break n;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(s=n,n=t[++i],e<n)break e}a=t.length;break t}if(!(e>=s)){let o=t[1];e<o&&(i=2,s=o);for(let c=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(n=s,s=t[--i-1],e>=s)break e}a=i,i=0;break t}break i}for(;i<a;){let o=i+a>>>1;e<t[o]?a=o:i=o+1}if(n=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,n)}return this.interpolate_(i,s,e,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,n=this.valueSize,s=e*n;for(let a=0;a!==n;++a)t[a]=i[s+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},fa=class extends tn{constructor(e,t,i,n){super(e,t,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ko,endingEnd:ko}}intervalChanged_(e,t,i){let n=this.parameterPositions,s=e-2,a=e+1,o=n[s],c=n[a];if(o===void 0)switch(this.getSettings_().endingStart){case Wo:s=e,o=2*t-i;break;case Xo:s=n.length-2,o=t+n[s]-n[s+1];break;default:s=e,o=i}if(c===void 0)switch(this.getSettings_().endingEnd){case Wo:a=e,c=2*i-t;break;case Xo:a=1,c=i+n[1]-n[0];break;default:a=e-1,c=t}let l=.5*(i-t),h=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-i),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(e,t,i,n){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this._offsetPrev,d=this._offsetNext,p=this._weightPrev,u=this._weightNext,f=(i-t)/(n-t),m=f*f,y=m*f,g=-p*y+2*p*m-p*f,_=(1+p)*y+(-1.5-2*p)*m+(-.5+p)*f+1,x=(-1-u)*y+(1.5+u)*m+.5*f,S=u*y-u*m;for(let w=0;w!==o;++w)s[w]=g*a[h+w]+_*a[l+w]+x*a[c+w]+S*a[d+w];return s}},ga=class extends tn{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=(i-t)/(n-t),d=1-h;for(let p=0;p!==o;++p)s[p]=a[l+p]*d+a[c+p]*h;return s}},_a=class extends tn{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e){return this.copySampleValue_(e-1)}},va=class extends tn{interpolate_(e,t,i,n){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let f=(i-t)/(n-t),m=1-f;for(let y=0;y!==o;++y)s[y]=a[l+y]*m+a[c+y]*f;return s}let p=2*o,u=e-1;for(let f=0;f!==o;++f){let m=a[l+f],y=a[c+f],g=u*p+2*f,_=d[g],x=d[g+1],S=e*p+2*f,w=h[S],M=h[S+1],D,O,N,U,V,F=(i-t)/(n-t);for(let Y=0;Y<8;Y++){D=F*F,O=D*F,N=1-F,U=N*N,V=U*N;let k=V*t+3*U*F*_+3*N*D*w+O*n-i;if(Math.abs(k)<1e-10)break;let z=3*U*(_-t)+6*N*F*(w-_)+3*D*(n-w);if(Math.abs(z)<1e-10)break;F-=k/z,F=Math.max(0,Math.min(1,F))}s[f]=V*m+3*U*F*x+3*N*D*M+O*y}return s}},Ht=class{constructor(e,t,i,n){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ns(t,this.TimeBufferType),this.values=Ns(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Ns(e.times,Array),values:Ns(e.values,Array)};let n=e.getInterpolation();n!==e.DefaultInterpolation&&(i.interpolation=n)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new _a(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ga(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new fa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new va(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Cr:t=this.InterpolantFactoryMethodDiscrete;break;case Vs:t=this.InterpolantFactoryMethodLinear;break;case Fs:t=this.InterpolantFactoryMethodSmooth;break;case Ho:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0){if(e===this.DefaultInterpolation)throw new Error(i);this.setInterpolation(this.DefaultInterpolation)}return be("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Cr;case this.InterpolantFactoryMethodLinear:return Vs;case this.InterpolantFactoryMethodSmooth:return Fs;case this.InterpolantFactoryMethodBezier:return Ho}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]*=e}return this}trim(e,t){let i=this.times,n=i.length,s=0,a=n-1;for(;s!==n&&i[s]<e;)++s;for(;a!==-1&&i[a]>t;)--a;if(++a,s!==0||a!==n){s>=a&&(a=Math.max(a,1),s=a-1);let o=this.getValueSize();this.times=i.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ee("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,n=this.values,s=i.length;s===0&&(Ee("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){let c=i[o];if(typeof c=="number"&&isNaN(c)){Ee("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){Ee("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(n!==void 0&&md(n))for(let o=0,c=n.length;o!==c;++o){let l=n[o];if(isNaN(l)){Ee("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===Fs,s=e.length-1,a=1;for(let o=1;o<s;++o){let c=!1,l=e[o];if(l!==e[o+1]&&(o!==1||l!==e[0]))if(n)c=!0;else{let h=o*i,d=h-i,p=h+i;for(let u=0;u!==i;++u){let f=t[h+u];if(f!==t[d+u]||f!==t[p+u]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let h=o*i,d=a*i;for(let p=0;p!==i;++p)t[d+p]=t[h+p]}++a}}if(s>0){e[a]=e[s];for(let o=s*i,c=a*i,l=0;l!==i;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=new this.constructor(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}};Ht.prototype.ValueTypeName="",Ht.prototype.TimeBufferType=Float32Array,Ht.prototype.ValueBufferType=Float32Array,Ht.prototype.DefaultInterpolation=Vs;var Yi=class extends Ht{constructor(e,t,i){super(e,t,i)}};Yi.prototype.ValueTypeName="bool",Yi.prototype.ValueBufferType=Array,Yi.prototype.DefaultInterpolation=Cr,Yi.prototype.InterpolantFactoryMethodLinear=void 0,Yi.prototype.InterpolantFactoryMethodSmooth=void 0;var ya=class extends Ht{constructor(e,t,i,n){super(e,t,i,n)}};ya.prototype.ValueTypeName="color";var xa=class extends Ht{constructor(e,t,i,n){super(e,t,i,n)}};xa.prototype.ValueTypeName="number";var Ma=class extends tn{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(i-t)/(n-t),l=e*o;for(let h=l+o;l!==h;l+=4)Nt.slerpFlat(s,0,a,l-o,a,l,c);return s}},jr=class extends Ht{constructor(e,t,i,n){super(e,t,i,n)}InterpolantFactoryMethodLinear(e){return new Ma(this.times,this.values,this.getValueSize(),e)}};jr.prototype.ValueTypeName="quaternion",jr.prototype.InterpolantFactoryMethodSmooth=void 0;var Zi=class extends Ht{constructor(e,t,i){super(e,t,i)}};Zi.prototype.ValueTypeName="string",Zi.prototype.ValueBufferType=Array,Zi.prototype.DefaultInterpolation=Cr,Zi.prototype.InterpolantFactoryMethodLinear=void 0,Zi.prototype.InterpolantFactoryMethodSmooth=void 0;var Sa=class extends Ht{constructor(e,t,i,n){super(e,t,i,n)}};Sa.prototype.ValueTypeName="vector";var ba=class{constructor(e,t,i){let n=this,s,a=!1,o=0,c=0,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){c++,a===!1&&n.onStart!==void 0&&n.onStart(h,o,c),a=!0},this.itemEnd=function(h){o++,n.onProgress!==void 0&&n.onProgress(h,o,c),o===c&&(a=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),s?s(h):h},this.setURLModifier=function(h){return s=h,this},this.addHandler=function(h,d){return l.push(h,d),this},this.removeHandler=function(h){let d=l.indexOf(h);return d!==-1&&l.splice(d,2),this},this.getHandler=function(h){for(let d=0,p=l.length;d<p;d+=2){let u=l[d],f=l[d+1];if(u.global&&(u.lastIndex=0),u.test(h))return f}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Eu=new ba,Ta=class{constructor(e){this.manager=e!==void 0?e:Eu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(n,s){i.load(e,n,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Ta.DEFAULT_MATERIAL_NAME="__DEFAULT";var qr=class extends St{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ue(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Yr=class extends qr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(St.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ue(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Go=new Fe,Ch=new A,Rh=new A,$o=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Q(512,512),this.mapType=Xt,this.map=null,this.mapPass=null,this.matrix=new Fe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Fi,this._frameExtents=new Q(1,1),this._viewportCount=1,this._viewports=[new Je(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;Ch.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ch),Rh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Rh),t.updateMatrixWorld(),Go.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Go,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===Yn||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Go)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),this.mapSize.x===512&&this.mapSize.y===512||(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Us=new A,Os=new Nt,_i=new A,ar=class extends St{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Fe,this.projectionMatrix=new Fe,this.projectionMatrixInverse=new Fe,this.coordinateSystem=Ni,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Us,Os,_i),_i.x===1&&_i.y===1&&_i.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Us,Os,_i.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(Us,Os,_i),_i.x===1&&_i.y===1&&_i.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Us,Os,_i.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},qi=new A,Ph=new Q,Ih=new Q,At=class extends ar{constructor(e=50,t=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=2*Jn*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(.5*jn*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return 2*Jn*Math.atan(Math.tan(.5*jn*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){qi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(qi.x,qi.y).multiplyScalar(-e/qi.z),qi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(qi.x,qi.y).multiplyScalar(-e/qi.z)}getViewSize(e,t){return this.getViewBounds(e,Ph,Ih),t.subVectors(Ih,Ph)}setViewOffset(e,t,i,n,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(.5*jn*this.fov)/this.zoom,i=2*t,n=this.aspect*i,s=-.5*n,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;s+=a.offsetX*n/c,t-=a.offsetY*i/l,n*=a.width/c,i*=a.height/l}let o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+n,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var or=class extends ar{constructor(e=-1,t=1,i=1,n=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=n,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,n,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,s=i-e,a=i+e,o=n+t,c=n-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,a=s+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Qo=class extends $o{constructor(){super(new or(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},lr=class extends qr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(St.DEFAULT_UP),this.updateMatrix(),this.target=new St,this.shadow=new Qo}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var mg=new Fe,fg=new Fe,gg=new Fe;var Wn=-90,Ea=class extends St{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new At(Wn,1,e,t);n.layers=this.layers,this.add(n);let s=new At(Wn,1,e,t);s.layers=this.layers,this.add(s);let a=new At(Wn,1,e,t);a.layers=this.layers,this.add(a);let o=new At(Wn,1,e,t);o.layers=this.layers,this.add(o);let c=new At(Wn,1,e,t);c.layers=this.layers,this.add(c);let l=new At(Wn,1,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,n,s,a,o,c]=t;for(let l of t)this.remove(l);if(e===Ni)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else{if(e!==Yn)throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1)}for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,a,o,c,l,h]=this.children,d=e.getRenderTarget(),p=e.getActiveCubeFace(),u=e.getActiveMipmapLevel(),f=e.xr.enabled;e.xr.enabled=!1;let m=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let y=!1;y=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(i,0,n),y&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(i,1,n),y&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,n),y&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,n),y&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,n),y&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.generateMipmaps=m,e.setRenderTarget(i,5,n),y&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,p,u),e.xr.enabled=f,i.texture.needsPMREMUpdate=!0}},wa=class extends At{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var _g=new A,vg=new Nt,yg=new A,xg=new A,Mg=new A;var Sg=new A,bg=new Nt,Tg=new A,Eg=new A;var hc="\\[\\]\\.:\\/",Wd=new RegExp("["+hc+"]","g"),Vo="[^"+hc+"]",Xd="[^"+hc.replace("\\.","")+"]",jd=new RegExp("^"+/((?:WC+[\/:])*)/.source.replace("WC",Vo)+/(WCOD+)?/.source.replace("WCOD",Xd)+/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Vo)+/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Vo)+"$"),qd=["material","materials","bones","map"],it=class r{constructor(e,t,i){this.path=t,this.parsedPath=i||r.parseTrackName(t),this.node=r.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new r.Composite(e,t,i):new r(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Wd,"")}static parseTrackName(e){let t=jd.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let s=i.nodeName.substring(n+1);qd.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(s){for(let a=0;a<s.length;a++){let o=s[a];if(o.name===t||o.uuid===t)return o;let c=i(o.children);if(c)return c}return null},n=i(e.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)e[t++]=i[n]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,n=t.propertyName,s=t.propertyIndex;if(e||(e=r.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e)return void be("PropertyBinding: No target node found for track: "+this.path+".");if(i){let l=t.objectIndex;switch(i){case"materials":if(!e.material)return void Ee("PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.materials)return void Ee("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);e=e.material.materials;break;case"bones":if(!e.skeleton)return void Ee("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material)return void Ee("PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.map)return void Ee("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);e=e.material.map;break;default:if(e[i]===void 0)return void Ee("PropertyBinding: Can not bind to objectName of node undefined.",this);e=e[i]}if(l!==void 0){if(e[l]===void 0)return void Ee("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);e=e[l]}}let a=e[n];if(a===void 0)return void Ee("PropertyBinding: Trying to update property for track: "+t.nodeName+"."+n+" but it wasn't found.",e);let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(n==="morphTargetInfluences"){if(!e.geometry)return void Ee("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);if(!e.geometry.morphAttributes)return void Ee("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=n;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};it.Composite=class{constructor(r,e,t){let i=t||it.parseTrackName(e);this._targetGroup=r,this._bindings=r.subscribe_(e,i)}getValue(r,e){this.bind();let t=this._targetGroup.nCachedObjects_,i=this._bindings[t];i!==void 0&&i.getValue(r,e)}setValue(r,e){let t=this._bindings;for(let i=this._targetGroup.nCachedObjects_,n=t.length;i!==n;++i)t[i].setValue(r,e)}bind(){let r=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=r.length;e!==t;++e)r[e].bind()}unbind(){let r=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=r.length;e!==t;++e)r[e].unbind()}},it.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},it.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},it.prototype.GetterByBindingType=[it.prototype._getValue_direct,it.prototype._getValue_array,it.prototype._getValue_arrayElement,it.prototype._getValue_toArray],it.prototype.SetterByBindingTypeAndVersioning=[[it.prototype._setValue_direct,it.prototype._setValue_direct_setNeedsUpdate,it.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[it.prototype._setValue_array,it.prototype._setValue_array_setNeedsUpdate,it.prototype._setValue_array_setMatrixWorldNeedsUpdate],[it.prototype._setValue_arrayElement,it.prototype._setValue_arrayElement_setNeedsUpdate,it.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[it.prototype._setValue_fromArray,it.prototype._setValue_fromArray_setNeedsUpdate,it.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var wg=new Float32Array(1);var Lh=new Fe,Zr=class{constructor(e,t,i=0,n=1/0){this.ray=new yi(e,t),this.near=i,this.far=n,this.camera=null,this.layers=new $n,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Ee("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Lh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Lh),this}intersectObject(e,t=!0,i=[]){return el(e,this,i,t),i.sort(Dh),i}intersectObjects(e,t=!0,i=[]){for(let n=0,s=e.length;n<s;n++)el(e[n],this,i,t);return i.sort(Dh),i}};function Dh(r,e){return r.distance-e.distance}function el(r,e,t,i){let n=!0;if(r.layers.test(e.layers)&&r.raycast(e,t)===!1&&(n=!1),n===!0&&i===!0){let s=r.children;for(let a=0,o=s.length;a<o;a++)el(s[a],e,t,!0)}}var cr=class{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Be(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(Be(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var gc=class gc{constructor(e,t,i,n){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,n){let s=this.elements;return s[0]=e,s[2]=t,s[1]=i,s[3]=n,this}};gc.prototype.isMatrix2=!0;var tl=gc,Ag=new Q;var Cg=new A,Rg=new A,Pg=new A,Ig=new A,Lg=new A,Dg=new A,Ng=new A;var Ug=new A;var Og=new A,Fg=new Fe,Bg=new Fe;var zg=new A,Gg=new Ue,Vg=new Ue;var Hg=new A,kg=new A,Wg=new A;var Xg=new A,jg=new ar;var qg=new ai;var Yg=new A;var Jr=class extends si{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){e!==void 0?(this.domElement!==null&&this.disconnect(),this.domElement=e):be("Controls: connect() now requires an element.")}disconnect(){}dispose(){}update(){}};function uc(r,e,t,i){let n=function(s){switch(s){case Xt:case Ml:return{byteLength:1,components:1};case pr:case Sl:case bi:return{byteLength:2,components:1};case Da:case Na:return{byteLength:2,components:4};case zi:case La:case ui:return{byteLength:4,components:1};case bl:case Tl:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}(i);switch(t){case 1021:return r*e;case El:case Ua:return r*e/n.components*n.byteLength;case 1030:case 1031:return r*e*2/n.components*n.byteLength;case 1022:return r*e*3/n.components*n.byteLength;case di:case 1033:return r*e*4/n.components*n.byteLength;case 33776:case 33777:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case 33778:case 33779:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case 35841:case 35843:return Math.max(r,16)*Math.max(e,8)/4;case 35840:case 35842:return Math.max(r,8)*Math.max(e,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case 37496:case 37490:case 37491:case 37808:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case 37809:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case 37810:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case 37811:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case 37812:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case 37813:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case 37814:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case 37815:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case 37816:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case 37817:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case 37818:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case 37819:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case 37820:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case 37821:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(r/4)*Math.ceil(e/4)*16;case 36283:case 36284:return Math.ceil(r/4)*Math.ceil(e/4)*8;case 36285:case 36286:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Bs}})),typeof window<"u"&&(window.__THREE__?be("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Bs);function Yu(){let r=null,e=!1,t=null,i=null;function n(s,a){t(s,a),i=r.requestAnimationFrame(n)}return{start:function(){e!==!0&&t!==null&&r!==null&&(i=r.requestAnimationFrame(n),e=!0)},stop:function(){r!==null&&r.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function Yd(r){let e=new WeakMap;return{get:function(t){return t.isInterleavedBufferAttribute&&(t=t.data),e.get(t)},remove:function(t){t.isInterleavedBufferAttribute&&(t=t.data);let i=e.get(t);i&&(r.deleteBuffer(i.buffer),e.delete(t))},update:function(t,i){if(t.isInterleavedBufferAttribute&&(t=t.data),t.isGLBufferAttribute){let s=e.get(t);return void((!s||s.version<t.version)&&e.set(t,{buffer:t.buffer,type:t.type,bytesPerElement:t.elementSize,version:t.version}))}let n=e.get(t);if(n===void 0)e.set(t,function(s,a){let o=s.array,c=s.usage,l=o.byteLength,h=r.createBuffer(),d;if(r.bindBuffer(a,h),r.bufferData(a,o,c),s.onUploadCallback(),o instanceof Float32Array)d=r.FLOAT;else if(typeof Float16Array<"u"&&o instanceof Float16Array)d=r.HALF_FLOAT;else if(o instanceof Uint16Array)d=s.isFloat16BufferAttribute?r.HALF_FLOAT:r.UNSIGNED_SHORT;else if(o instanceof Int16Array)d=r.SHORT;else if(o instanceof Uint32Array)d=r.UNSIGNED_INT;else if(o instanceof Int32Array)d=r.INT;else if(o instanceof Int8Array)d=r.BYTE;else if(o instanceof Uint8Array)d=r.UNSIGNED_BYTE;else{if(!(o instanceof Uint8ClampedArray))throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+o);d=r.UNSIGNED_BYTE}return{buffer:h,type:d,bytesPerElement:o.BYTES_PER_ELEMENT,version:s.version,size:l}}(t,i));else if(n.version<t.version){if(n.size!==t.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");(function(s,a,o){let c=a.array,l=a.updateRanges;if(r.bindBuffer(o,s),l.length===0)r.bufferSubData(o,0,c);else{l.sort((d,p)=>d.start-p.start);let h=0;for(let d=1;d<l.length;d++){let p=l[h],u=l[d];u.start<=p.start+p.count+1?p.count=Math.max(p.count,u.start+u.count-p.start):(++h,l[h]=u)}l.length=h+1;for(let d=0,p=l.length;d<p;d++){let u=l[d];r.bufferSubData(o,u.start*c.BYTES_PER_ELEMENT,c,u.start,u.count)}a.clearUpdateRanges()}a.onUploadCallback()})(n.buffer,t,i),n.version=t.version}}}}var ze={alphahash_fragment:`#ifdef USE_ALPHAHASH
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
}`},ce={common:{diffuse:{value:new Ue(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Le},alphaMap:{value:null},alphaMapTransform:{value:new Le},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Le}},envmap:{envMap:{value:null},envMapRotation:{value:new Le},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Le}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Le}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Le},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Le},normalScale:{value:new Q(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Le},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Le}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Le}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Le}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ue(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new A},probesMax:{value:new A},probesResolution:{value:new A}},points:{diffuse:{value:new Ue(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Le},alphaTest:{value:0},uvTransform:{value:new Le}},sprite:{diffuse:{value:new Ue(16777215)},opacity:{value:1},center:{value:new Q(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Le},alphaMap:{value:null},alphaMapTransform:{value:new Le},alphaTest:{value:0}}},Ei={basic:{uniforms:Pt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.fog]),vertexShader:ze.meshbasic_vert,fragmentShader:ze.meshbasic_frag},lambert:{uniforms:Pt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new Ue(0)},envMapIntensity:{value:1}}]),vertexShader:ze.meshlambert_vert,fragmentShader:ze.meshlambert_frag},phong:{uniforms:Pt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new Ue(0)},specular:{value:new Ue(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ze.meshphong_vert,fragmentShader:ze.meshphong_frag},standard:{uniforms:Pt([ce.common,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.roughnessmap,ce.metalnessmap,ce.fog,ce.lights,{emissive:{value:new Ue(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag},toon:{uniforms:Pt([ce.common,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.gradientmap,ce.fog,ce.lights,{emissive:{value:new Ue(0)}}]),vertexShader:ze.meshtoon_vert,fragmentShader:ze.meshtoon_frag},matcap:{uniforms:Pt([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,{matcap:{value:null}}]),vertexShader:ze.meshmatcap_vert,fragmentShader:ze.meshmatcap_frag},points:{uniforms:Pt([ce.points,ce.fog]),vertexShader:ze.points_vert,fragmentShader:ze.points_frag},dashed:{uniforms:Pt([ce.common,ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ze.linedashed_vert,fragmentShader:ze.linedashed_frag},depth:{uniforms:Pt([ce.common,ce.displacementmap]),vertexShader:ze.depth_vert,fragmentShader:ze.depth_frag},normal:{uniforms:Pt([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,{opacity:{value:1}}]),vertexShader:ze.meshnormal_vert,fragmentShader:ze.meshnormal_frag},sprite:{uniforms:Pt([ce.sprite,ce.fog]),vertexShader:ze.sprite_vert,fragmentShader:ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Le},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ze.background_vert,fragmentShader:ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Le}},vertexShader:ze.backgroundCube_vert,fragmentShader:ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ze.cube_vert,fragmentShader:ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ze.equirect_vert,fragmentShader:ze.equirect_frag},distance:{uniforms:Pt([ce.common,ce.displacementmap,{referencePosition:{value:new A},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ze.distance_vert,fragmentShader:ze.distance_frag},shadow:{uniforms:Pt([ce.lights,ce.fog,{color:{value:new Ue(0)},opacity:{value:1}}]),vertexShader:ze.shadow_vert,fragmentShader:ze.shadow_frag}};Ei.physical={uniforms:Pt([Ei.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Le},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Le},clearcoatNormalScale:{value:new Q(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Le},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Le},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Le},sheen:{value:0},sheenColor:{value:new Ue(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Le},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Le},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Le},transmissionSamplerSize:{value:new Q},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Le},attenuationDistance:{value:0},attenuationColor:{value:new Ue(0)},specularColor:{value:new Ue(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Le},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Le},anisotropyVector:{value:new Q},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Le}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag};var Wa={r:0,b:0,g:0},Zd=new Fe,Zu=new Le;function Jd(r,e,t,i,n,s){let a=new Ue(0),o,c,l=n===!0?0:1,h=null,d=0,p=null;function u(m){let y=m.isScene===!0?m.background:null;if(y&&y.isTexture){let g=m.backgroundBlurriness>0;y=e.get(y,g)}return y}function f(m,y){m.getRGB(Wa,cc(r)),t.buffers.color.setClear(Wa.r,Wa.g,Wa.b,y,s)}return{getClearColor:function(){return a},setClearColor:function(m,y=1){a.set(m),l=y,f(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(m){l=m,f(a,l)},render:function(m){let y=!1,g=u(m);g===null?f(a,l):g&&g.isColor&&(f(g,1),y=!0);let _=r.xr.getEnvironmentBlendMode();_==="additive"?t.buffers.color.setClear(0,0,0,1,s):_==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(r.autoClear||y)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))},addToRenderList:function(m,y){let g=u(y);g&&(g.isCubeTexture||g.mapping===Qr)?(c===void 0&&(c=new Oe(new Rt(1,1,1),new Ut({name:"BackgroundCubeMaterial",uniforms:An(Ei.backgroundCube.uniforms),vertexShader:Ei.backgroundCube.vertexShader,fragmentShader:Ei.backgroundCube.fragmentShader,side:Bt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(_,x,S){this.matrixWorld.copyPosition(S.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=g,c.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Zd.makeRotationFromEuler(y.backgroundRotation)).transpose(),g.isCubeTexture&&g.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Zu),c.material.toneMapped=ke.getTransfer(g.colorSpace)!==Ye,h===g&&d===g.version&&p===r.toneMapping||(c.material.needsUpdate=!0,h=g,d=g.version,p=r.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null)):g&&g.isTexture&&(o===void 0&&(o=new Oe(new Mi(2,2),new Ut({name:"BackgroundMaterial",uniforms:An(Ei.background.uniforms),vertexShader:Ei.background.vertexShader,fragmentShader:Ei.background.fragmentShader,side:sn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),o.geometry.deleteAttribute("normal"),Object.defineProperty(o.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(o)),o.material.uniforms.t2D.value=g,o.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,o.material.toneMapped=ke.getTransfer(g.colorSpace)!==Ye,g.matrixAutoUpdate===!0&&g.updateMatrix(),o.material.uniforms.uvTransform.value.copy(g.matrix),h===g&&d===g.version&&p===r.toneMapping||(o.material.needsUpdate=!0,h=g,d=g.version,p=r.toneMapping),o.layers.enableAll(),m.unshift(o,o.geometry,o.material,0,0,null))},dispose:function(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),o!==void 0&&(o.geometry.dispose(),o.material.dispose(),o=void 0)}}}function Kd(r,e){let t=r.getParameter(r.MAX_VERTEX_ATTRIBS),i={},n=l(null),s=n,a=!1;function o(g){return r.bindVertexArray(g)}function c(g){return r.deleteVertexArray(g)}function l(g){let _=[],x=[],S=[];for(let w=0;w<t;w++)_[w]=0,x[w]=0,S[w]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:_,enabledAttributes:x,attributeDivisors:S,object:g,attributes:{},index:null}}function h(){let g=s.newAttributes;for(let _=0,x=g.length;_<x;_++)g[_]=0}function d(g){p(g,0)}function p(g,_){let x=s.newAttributes,S=s.enabledAttributes,w=s.attributeDivisors;x[g]=1,S[g]===0&&(r.enableVertexAttribArray(g),S[g]=1),w[g]!==_&&(r.vertexAttribDivisor(g,_),w[g]=_)}function u(){let g=s.newAttributes,_=s.enabledAttributes;for(let x=0,S=_.length;x<S;x++)_[x]!==g[x]&&(r.disableVertexAttribArray(x),_[x]=0)}function f(g,_,x,S,w,M,D){D===!0?r.vertexAttribIPointer(g,_,x,w,M):r.vertexAttribPointer(g,_,x,S,w,M)}function m(){y(),a=!0,s!==n&&(s=n,o(s.object))}function y(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:function(g,_,x,S,w){let M=!1,D=function(O,N,U,V){let F=V.wireframe===!0,Y=i[N.id];Y===void 0&&(Y={},i[N.id]=Y);let k=O.isInstancedMesh===!0?O.id:0,z=Y[k];z===void 0&&(z={},Y[k]=z);let q=z[U.id];q===void 0&&(q={},z[U.id]=q);let W=q[F];return W===void 0&&(W=l(r.createVertexArray()),q[F]=W),W}(g,S,x,_);s!==D&&(s=D,o(s.object)),M=function(O,N,U,V){let F=s.attributes,Y=N.attributes,k=0,z=U.getAttributes();for(let q in z)if(z[q].location>=0){let W=F[q],ie=Y[q];if(ie===void 0&&(q==="instanceMatrix"&&O.instanceMatrix&&(ie=O.instanceMatrix),q==="instanceColor"&&O.instanceColor&&(ie=O.instanceColor)),W===void 0||W.attribute!==ie||ie&&W.data!==ie.data)return!0;k++}return s.attributesNum!==k||s.index!==V}(g,S,x,w),M&&function(O,N,U,V){let F={},Y=N.attributes,k=0,z=U.getAttributes();for(let q in z)if(z[q].location>=0){let W=Y[q];W===void 0&&(q==="instanceMatrix"&&O.instanceMatrix&&(W=O.instanceMatrix),q==="instanceColor"&&O.instanceColor&&(W=O.instanceColor));let ie={};ie.attribute=W,W&&W.data&&(ie.data=W.data),F[q]=ie,k++}s.attributes=F,s.attributesNum=k,s.index=V}(g,S,x,w),w!==null&&e.update(w,r.ELEMENT_ARRAY_BUFFER),(M||a)&&(a=!1,function(O,N,U,V){h();let F=V.attributes,Y=U.getAttributes(),k=N.defaultAttributeValues;for(let z in Y){let q=Y[z];if(q.location>=0){let W=F[z];if(W===void 0&&(z==="instanceMatrix"&&O.instanceMatrix&&(W=O.instanceMatrix),z==="instanceColor"&&O.instanceColor&&(W=O.instanceColor)),W!==void 0){let ie=W.normalized,he=W.itemSize,Me=e.get(W);if(Me===void 0)continue;let pe=Me.buffer,me=Me.type,ee=Me.bytesPerElement,le=me===r.INT||me===r.UNSIGNED_INT||W.gpuType===La;if(W.isInterleavedBufferAttribute){let se=W.data,ge=se.stride,Ae=W.offset;if(se.isInstancedInterleavedBuffer){for(let $=0;$<q.locationSize;$++)p(q.location+$,se.meshPerAttribute);O.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let $=0;$<q.locationSize;$++)d(q.location+$);r.bindBuffer(r.ARRAY_BUFFER,pe);for(let $=0;$<q.locationSize;$++)f(q.location+$,he/q.locationSize,me,ie,ge*ee,(Ae+he/q.locationSize*$)*ee,le)}else{if(W.isInstancedBufferAttribute){for(let se=0;se<q.locationSize;se++)p(q.location+se,W.meshPerAttribute);O.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let se=0;se<q.locationSize;se++)d(q.location+se);r.bindBuffer(r.ARRAY_BUFFER,pe);for(let se=0;se<q.locationSize;se++)f(q.location+se,he/q.locationSize,me,ie,he*ee,he/q.locationSize*se*ee,le)}}else if(k!==void 0){let ie=k[z];if(ie!==void 0)switch(ie.length){case 2:r.vertexAttrib2fv(q.location,ie);break;case 3:r.vertexAttrib3fv(q.location,ie);break;case 4:r.vertexAttrib4fv(q.location,ie);break;default:r.vertexAttrib1fv(q.location,ie)}}}}u()}(g,_,x,S),w!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(w).buffer))},reset:m,resetDefaultState:y,dispose:function(){m();for(let g in i){let _=i[g];for(let x in _){let S=_[x];for(let w in S){let M=S[w];for(let D in M)c(M[D].object),delete M[D];delete S[w]}}delete i[g]}},releaseStatesOfGeometry:function(g){if(i[g.id]===void 0)return;let _=i[g.id];for(let x in _){let S=_[x];for(let w in S){let M=S[w];for(let D in M)c(M[D].object),delete M[D];delete S[w]}}delete i[g.id]},releaseStatesOfObject:function(g){for(let _ in i){let x=i[_],S=g.isInstancedMesh===!0?g.id:0,w=x[S];if(w!==void 0){for(let M in w){let D=w[M];for(let O in D)c(D[O].object),delete D[O];delete w[M]}delete x[S],Object.keys(x).length===0&&delete i[_]}}},releaseStatesOfProgram:function(g){for(let _ in i){let x=i[_];for(let S in x){let w=x[S];if(w[g.id]===void 0)continue;let M=w[g.id];for(let D in M)c(M[D].object),delete M[D];delete w[g.id]}}},initAttributes:h,enableAttribute:d,disableUnusedAttributes:u}}function $d(r,e,t){let i;this.setMode=function(n){i=n},this.render=function(n,s){r.drawArrays(i,n,s),t.update(s,i,1)},this.renderInstances=function(n,s,a){a!==0&&(r.drawArraysInstanced(i,n,s,a),t.update(s,i,a))},this.renderMultiDraw=function(n,s,a){if(a===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,n,0,s,0,a);let o=0;for(let c=0;c<a;c++)o+=s[c];t.update(o,i,1)}}function Qd(r,e,t,i){let n;function s(h){if(h==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";h="mediump"}return h==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let a=t.precision!==void 0?t.precision:"highp",o=s(a);o!==a&&(be("WebGLRenderer:",a,"not supported, using",o,"instead."),a=o);let c=t.logarithmicDepthBuffer===!0,l=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");return t.reversedDepthBuffer===!0&&l===!1&&be("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),{isWebGL2:!0,getMaxAnisotropy:function(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){let h=e.get("EXT_texture_filter_anisotropic");n=r.getParameter(h.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n},getMaxPrecision:s,textureFormatReadable:function(h){return h===di||i.convert(h)===r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT)},textureTypeReadable:function(h){let d=h===bi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(h!==Xt&&i.convert(h)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&h!==ui&&!d)},precision:a,logarithmicDepthBuffer:c,reversedDepthBuffer:l,maxTextures:r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),maxVertexTextures:r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),maxTextureSize:r.getParameter(r.MAX_TEXTURE_SIZE),maxCubemapSize:r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),maxAttributes:r.getParameter(r.MAX_VERTEX_ATTRIBS),maxVertexUniforms:r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),maxVaryings:r.getParameter(r.MAX_VARYING_VECTORS),maxFragmentUniforms:r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),maxSamples:r.getParameter(r.MAX_SAMPLES),samples:r.getParameter(r.SAMPLES)}}function ep(r){let e=this,t=null,i=0,n=!1,s=!1,a=new Zt,o=new Le,c={value:null,needsUpdate:!1};function l(h,d,p,u){let f=h!==null?h.length:0,m=null;if(f!==0){if(m=c.value,u!==!0||m===null){let y=p+4*f,g=d.matrixWorldInverse;o.getNormalMatrix(g),(m===null||m.length<y)&&(m=new Float32Array(y));for(let _=0,x=p;_!==f;++_,x+=4)a.copy(h[_]).applyMatrix4(g,o),a.normal.toArray(m,x),m[x+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=f,e.numIntersection=0,m}this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let p=h.length!==0||d||i!==0||n;return n=d,i=h.length,p},this.beginShadows=function(){s=!0,l(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){t=l(h,d,0)},this.setState=function(h,d,p){let u=h.clippingPlanes,f=h.clipIntersection,m=h.clipShadows,y=r.get(h);if(!n||u===null||u.length===0||s&&!m)s?l(null):function(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}();else{let g=s?0:i,_=4*g,x=y.clippingState||null;c.value=x,x=l(u,d,_,p);for(let S=0;S!==_;++S)x[S]=t[S];y.clippingState=x,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=g}}}Zu.set(-1,0,0,0,1,0,0,0,1);var wu=[.125,.215,.35,.446,.526,.582],ts=20,is=new or,Au=new Ue,_c=null,vc=0,yc=0,xc=!1,tp=new A,ja=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,n=100,s={}){let{size:a=256,position:o=tp}=s;_c=this._renderer.getRenderTarget(),vc=this._renderer.getActiveCubeFace(),yc=this._renderer.getActiveMipmapLevel(),xc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,n,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Pu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ru(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(_c,vc,yc),this._renderer.xr.enabled=xc,e.scissorTest=!1,fr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===dr||e.mapping===Mn?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),_c=this._renderer.getRenderTarget(),vc=this._renderer.getActiveCubeFace(),yc=this._renderer.getActiveMipmapLevel(),xc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Ct,minFilter:Ct,generateMipmaps:!1,type:bi,format:di,colorSpace:Rr,depthBuffer:!1},n=Cu(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Cu(e,t,i);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=function(a){let o=[],c=[],l=[],h=a,d=a-4+1+wu.length;for(let p=0;p<d;p++){let u=Math.pow(2,h);o.push(u);let f=1/u;p>a-4?f=wu[p-a+4-1]:p===0&&(f=0),c.push(f);let m=1/(u-2),y=-m,g=1+m,_=[y,y,g,y,g,g,y,y,g,g,y,g],x=6,S=6,w=3,M=2,D=1,O=new Float32Array(w*S*x),N=new Float32Array(M*S*x),U=new Float32Array(D*S*x);for(let F=0;F<x;F++){let Y=F%3*2/3-1,k=F>2?0:-1,z=[Y,k,0,Y+2/3,k,0,Y+2/3,k+1,0,Y,k,0,Y+2/3,k+1,0,Y,k+1,0];O.set(z,w*S*F),N.set(_,M*S*F);let q=[F,F,F,F,F,F];U.set(q,D*S*F)}let V=new Ke;V.setAttribute("position",new bt(O,w)),V.setAttribute("uv",new bt(N,M)),V.setAttribute("faceIndex",new bt(U,D)),l.push(new Oe(V,null)),h>4&&h--}return{lodMeshes:l,sizeLods:o,sigmas:c}}(s)),this._blurMaterial=function(a,o,c){let l=new Float32Array(ts),h=new A(0,1,0);return new Ut({name:"SphericalGaussianBlur",defines:{n:ts,CUBEUV_TEXEL_WIDTH:1/o,CUBEUV_TEXEL_HEIGHT:1/c,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:l},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:h}},vertexShader:qa(),fragmentShader:`

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
		`,blending:Si,depthTest:!1,depthWrite:!1})}(s,e,t),this._ggxMaterial=function(a,o,c){return new Ut({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:256,CUBEUV_TEXEL_WIDTH:1/o,CUBEUV_TEXEL_HEIGHT:1/c,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:qa(),fragmentShader:`

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
		`,blending:Si,depthTest:!1,depthWrite:!1})}(s,e,t)}return n}_compileMaterial(e){let t=new Oe(new Ke,e);this._renderer.compile(t,is)}_sceneToCubeUV(e,t,i,n,s){let a=new At(90,1,t,i),o=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],l=this._renderer,h=l.autoClear,d=l.toneMapping;l.getClearColor(Au),l.toneMapping=hi,l.autoClear=!1,l.state.buffers.depth.getReversed()&&(l.setRenderTarget(n),l.clearDepth(),l.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Oe(new Rt,new _n({name:"PMREM.Background",side:Bt,depthWrite:!1,depthTest:!1})));let p=this._backgroundBox,u=p.material,f=!1,m=e.background;m?m.isColor&&(u.color.copy(m),e.background=null,f=!0):(u.color.copy(Au),f=!0);for(let y=0;y<6;y++){let g=y%3;g===0?(a.up.set(0,o[y],0),a.position.set(s.x,s.y,s.z),a.lookAt(s.x+c[y],s.y,s.z)):g===1?(a.up.set(0,0,o[y]),a.position.set(s.x,s.y,s.z),a.lookAt(s.x,s.y+c[y],s.z)):(a.up.set(0,o[y],0),a.position.set(s.x,s.y,s.z),a.lookAt(s.x,s.y,s.z+c[y]));let _=this._cubeSize;fr(n,g*_,y>2?_:0,_,_),l.setRenderTarget(n),f&&l.render(p,a),l.render(e,a)}l.toneMapping=d,l.autoClear=h,e.background=m}_textureToCubeUV(e,t){let i=this._renderer,n=e.mapping===dr||e.mapping===Mn;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=Pu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ru());let s=n?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=s,s.uniforms.envMap.value=e;let o=this._cubeSize;fr(t,0,0,3*o,2*o),i.setRenderTarget(t),i.render(a,is)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let n=this._lodMeshes.length;for(let s=1;s<n;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=i}_applyGGXFilter(e,t,i){let n=this._renderer,s=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let c=a.uniforms,l=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(l*l-h*h)*(0+1.25*l),{_lodMax:p}=this,u=this._sizeLods[i],f=3*u*(i>p-4?i-p+4:0),m=4*(this._cubeSize-u);c.envMap.value=e.texture,c.roughness.value=d,c.mipInt.value=p-t,fr(s,f,m,3*u,2*u),n.setRenderTarget(s),n.render(o,is),c.envMap.value=s.texture,c.roughness.value=0,c.mipInt.value=p-i,fr(e,f,m,3*u,2*u),n.setRenderTarget(e),n.render(o,is)}_blur(e,t,i,n,s){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,n,"latitudinal",s),this._halfBlur(a,e,i,i,n,"longitudinal",s)}_halfBlur(e,t,i,n,s,a,o){let c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&Ee("blur direction must be either latitudinal or longitudinal!");let h=this._lodMeshes[n];h.material=l;let d=l.uniforms,p=this._sizeLods[i]-1,u=isFinite(s)?Math.PI/(2*p):2*Math.PI/39,f=s/u,m=isFinite(s)?1+Math.floor(3*f):ts;m>ts&&be(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to 20`);let y=[],g=0;for(let S=0;S<ts;++S){let w=S/f,M=Math.exp(-w*w/2);y.push(M),S===0?g+=M:S<m&&(g+=2*M)}for(let S=0;S<y.length;S++)y[S]=y[S]/g;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=y,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);let{_lodMax:_}=this;d.dTheta.value=u,d.mipInt.value=_-i;let x=this._sizeLods[n];fr(t,3*x*(n>_-4?n-_+4:0),4*(this._cubeSize-x),3*x,2*x),c.setRenderTarget(t),c.render(h,is)}};function Cu(r,e,t){let i=new kt(r,e,t);return i.texture.mapping=Qr,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function fr(r,e,t,i,n){r.viewport.set(e,t,i,n),r.scissor.set(e,t,i,n)}function Ru(){return new Ut({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:qa(),fragmentShader:`

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
		`,blending:Si,depthTest:!1,depthWrite:!1})}function Pu(){return new Ut({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:qa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Si,depthTest:!1,depthWrite:!1})}function qa(){return`

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
	`}var Ya=class extends kt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},n=[i,i,i,i,i,i];this.texture=new Or(n),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new Rt(5,5,5),s=new Ut({name:"CubemapFromEquirect",uniforms:An(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Bt,blending:Si});s.uniforms.tEquirect.value=t;let a=new Oe(n,s),o=t.minFilter;return t.minFilter===Sn&&(t.minFilter=Ct),new Ea(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,n=!0){let s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,n);e.setRenderTarget(s)}};function ip(r){let e=new WeakMap,t=new WeakMap,i=null;function n(o,c){return c===Ra?o.mapping=dr:c===Pa&&(o.mapping=Mn),o}function s(o){let c=o.target;c.removeEventListener("dispose",s);let l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function a(o){let c=o.target;c.removeEventListener("dispose",a);let l=t.get(c);l!==void 0&&(t.delete(c),l.dispose())}return{get:function(o,c=!1){return o==null?null:c?function(l){if(l&&l.isTexture){let h=l.mapping,d=h===Ra||h===Pa,p=h===dr||h===Mn;if(d||p){let u=t.get(l),f=u!==void 0?u.texture.pmremVersion:0;if(l.isRenderTargetTexture&&l.pmremVersion!==f)return i===null&&(i=new ja(r)),u=d?i.fromEquirectangular(l,u):i.fromCubemap(l,u),u.texture.pmremVersion=l.pmremVersion,t.set(l,u),u.texture;if(u!==void 0)return u.texture;{let m=l.image;return d&&m&&m.height>0||p&&m&&function(y){let g=0,_=6;for(let x=0;x<_;x++)y[x]!==void 0&&g++;return g===_}(m)?(i===null&&(i=new ja(r)),u=d?i.fromEquirectangular(l):i.fromCubemap(l),u.texture.pmremVersion=l.pmremVersion,t.set(l,u),l.addEventListener("dispose",a),u.texture):null}}}return l}(o):function(l){if(l&&l.isTexture){let h=l.mapping;if(h===Ra||h===Pa){if(e.has(l))return n(e.get(l).texture,l.mapping);{let d=l.image;if(d&&d.height>0){let p=new Ya(d.height);return p.fromEquirectangularTexture(r,l),e.set(l,p),l.addEventListener("dispose",s),n(p.texture,l.mapping)}return null}}}return l}(o)},dispose:function(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}}}function np(r){let e={};function t(i){if(e[i]!==void 0)return e[i];let n=r.getExtension(i);return e[i]=n,n}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let n=t(i);return n===null&&gn("WebGLRenderer: "+i+" extension not supported."),n}}}function rp(r,e,t,i){let n={},s=new WeakMap;function a(c){let l=c.target;l.index!==null&&e.remove(l.index);for(let d in l.attributes)e.remove(l.attributes[d]);l.removeEventListener("dispose",a),delete n[l.id];let h=s.get(l);h&&(e.remove(h),s.delete(l)),i.releaseStatesOfGeometry(l),l.isInstancedBufferGeometry===!0&&delete l._maxInstanceCount,t.memory.geometries--}function o(c){let l=[],h=c.index,d=c.attributes.position,p=0;if(d===void 0)return;if(h!==null){let m=h.array;p=h.version;for(let y=0,g=m.length;y<g;y+=3){let _=m[y+0],x=m[y+1],S=m[y+2];l.push(_,x,x,S,S,_)}}else{let m=d.array;p=d.version;for(let y=0,g=m.length/3-1;y<g;y+=3){let _=y+0,x=y+1,S=y+2;l.push(_,x,x,S,S,_)}}let u=new(d.count>=65535?Ur:Nr)(l,1);u.version=p;let f=s.get(c);f&&e.remove(f),s.set(c,u)}return{get:function(c,l){return n[l.id]===!0||(l.addEventListener("dispose",a),n[l.id]=!0,t.memory.geometries++),l},update:function(c){let l=c.attributes;for(let h in l)e.update(l[h],r.ARRAY_BUFFER)},getWireframeAttribute:function(c){let l=s.get(c);if(l){let h=c.index;h!==null&&l.version<h.version&&o(c)}else o(c);return s.get(c)}}}function sp(r,e,t){let i,n,s;this.setMode=function(a){i=a},this.setIndex=function(a){n=a.type,s=a.bytesPerElement},this.render=function(a,o){r.drawElements(i,o,n,a*s),t.update(o,i,1)},this.renderInstances=function(a,o,c){c!==0&&(r.drawElementsInstanced(i,o,n,a*s,c),t.update(o,i,c))},this.renderMultiDraw=function(a,o,c){if(c===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,o,0,n,a,0,c);let l=0;for(let h=0;h<c;h++)l+=o[h];t.update(l,i,1)}}function ap(r){let e={frame:0,calls:0,triangles:0,points:0,lines:0};return{memory:{geometries:0,textures:0},render:e,programs:null,autoReset:!0,reset:function(){e.calls=0,e.triangles=0,e.points=0,e.lines=0},update:function(t,i,n){switch(e.calls++,i){case r.TRIANGLES:e.triangles+=n*(t/3);break;case r.LINES:e.lines+=n*(t/2);break;case r.LINE_STRIP:e.lines+=n*(t-1);break;case r.LINE_LOOP:e.lines+=n*t;break;case r.POINTS:e.points+=n*t;break;default:Ee("WebGLInfo: Unknown draw mode:",i)}}}}function op(r,e,t){let i=new WeakMap,n=new Je;return{update:function(s,a,o){let c=s.morphTargetInfluences,l=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=l!==void 0?l.length:0,d=i.get(a);if(d===void 0||d.count!==h){let O=function(){M.dispose(),i.delete(a),a.removeEventListener("dispose",O)};d!==void 0&&d.texture.dispose();let p=a.morphAttributes.position!==void 0,u=a.morphAttributes.normal!==void 0,f=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],y=a.morphAttributes.normal||[],g=a.morphAttributes.color||[],_=0;p===!0&&(_=1),u===!0&&(_=2),f===!0&&(_=3);let x=a.attributes.position.count*_,S=1;x>e.maxTextureSize&&(S=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize);let w=new Float32Array(x*S*4*h),M=new Lr(w,x,S,h);M.type=ui,M.needsUpdate=!0;let D=4*_;for(let N=0;N<h;N++){let U=m[N],V=y[N],F=g[N],Y=x*S*4*N;for(let k=0;k<U.count;k++){let z=k*D;p===!0&&(n.fromBufferAttribute(U,k),w[Y+z+0]=n.x,w[Y+z+1]=n.y,w[Y+z+2]=n.z,w[Y+z+3]=0),u===!0&&(n.fromBufferAttribute(V,k),w[Y+z+4]=n.x,w[Y+z+5]=n.y,w[Y+z+6]=n.z,w[Y+z+7]=0),f===!0&&(n.fromBufferAttribute(F,k),w[Y+z+8]=n.x,w[Y+z+9]=n.y,w[Y+z+10]=n.z,w[Y+z+11]=F.itemSize===4?n.w:1)}}d={count:h,texture:M,size:new Q(x,S)},i.set(a,d),a.addEventListener("dispose",O)}if(s.isInstancedMesh===!0&&s.morphTexture!==null)o.getUniforms().setValue(r,"morphTexture",s.morphTexture,t);else{let p=0;for(let f=0;f<c.length;f++)p+=c[f];let u=a.morphTargetsRelative?1:1-p;o.getUniforms().setValue(r,"morphTargetBaseInfluence",u),o.getUniforms().setValue(r,"morphTargetInfluences",c)}o.getUniforms().setValue(r,"morphTargetsTexture",d.texture,t),o.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}}}function lp(r,e,t,i,n){let s=new WeakMap;function a(o){let c=o.target;c.removeEventListener("dispose",a),i.releaseStatesOfObject(c),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:function(o){let c=n.render.frame,l=o.geometry,h=e.get(o,l);if(s.get(h)!==c&&(e.update(h),s.set(h,c)),o.isInstancedMesh&&(o.hasEventListener("dispose",a)===!1&&o.addEventListener("dispose",a),s.get(o)!==c&&(t.update(o.instanceMatrix,r.ARRAY_BUFFER),o.instanceColor!==null&&t.update(o.instanceColor,r.ARRAY_BUFFER),s.set(o,c))),o.isSkinnedMesh){let d=o.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h},dispose:function(){s=new WeakMap}}}var cp={[pl]:"LINEAR_TONE_MAPPING",[ml]:"REINHARD_TONE_MAPPING",[fl]:"CINEON_TONE_MAPPING",[gl]:"ACES_FILMIC_TONE_MAPPING",[vl]:"AGX_TONE_MAPPING",[yl]:"NEUTRAL_TONE_MAPPING",[_l]:"CUSTOM_TONE_MAPPING"};function hp(r,e,t,i,n,s){let a=new kt(e,t,{type:r,depthBuffer:n,stencilBuffer:s,samples:i?4:0,depthTexture:n?new Bi(e,t):void 0}),o=new kt(e,t,{type:bi,depthBuffer:!1,stencilBuffer:!1}),c=new Ke;c.setAttribute("position",new Te([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Te([0,2,0,0,2,0],2));let l=new da({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new Oe(c,l),d=new or(-1,1,1,-1,0,1),p,u=null,f=null,m=!1,y=null,g=[],_=!1;this.setSize=function(x,S){a.setSize(x,S),o.setSize(x,S);for(let w=0;w<g.length;w++){let M=g[w];M.setSize&&M.setSize(x,S)}},this.setEffects=function(x){g=x,_=g.length>0&&g[0].isRenderPass===!0;let S=a.width,w=a.height;for(let M=0;M<g.length;M++){let D=g[M];D.setSize&&D.setSize(S,w)}},this.begin=function(x,S){if(m||x.toneMapping===hi&&g.length===0)return!1;if(y=S,S!==null){let w=S.width,M=S.height;a.width===w&&a.height===M||this.setSize(w,M)}return _===!1&&x.setRenderTarget(a),p=x.toneMapping,x.toneMapping=hi,!0},this.hasRenderPass=function(){return _},this.end=function(x,S){x.toneMapping=p,m=!0;let w=a,M=o;for(let D=0;D<g.length;D++){let O=g[D];if(O.enabled!==!1&&(O.render(x,M,w,S),O.needsSwap!==!1)){let N=w;w=M,M=N}}if(u!==x.outputColorSpace||f!==x.toneMapping){u=x.outputColorSpace,f=x.toneMapping,l.defines={},ke.getTransfer(u)===Ye&&(l.defines.SRGB_TRANSFER="");let D=cp[f];D&&(l.defines[D]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=w.texture,x.setRenderTarget(y),x.render(h,d),y=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),c.dispose(),l.dispose()}}var Ju=new Ot,bc=new Bi(1,1),Ku=new Lr,$u=new Ws,Qu=new Or,Iu=[],Lu=[],Du=new Float32Array(16),Nu=new Float32Array(9),Uu=new Float32Array(4);function _r(r,e,t){let i=r[0];if(i<=0||i>0)return r;let n=e*t,s=Iu[n];if(s===void 0&&(s=new Float32Array(n),Iu[n]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function ft(r,e){if(r.length!==e.length)return!1;for(let t=0,i=r.length;t<i;t++)if(r[t]!==e[t])return!1;return!0}function gt(r,e){for(let t=0,i=e.length;t<i;t++)r[t]=e[t]}function Ja(r,e){let t=Lu[e];t===void 0&&(t=new Int32Array(e),Lu[e]=t);for(let i=0;i!==e;++i)t[i]=r.allocateTextureUnit();return t}function up(r,e){let t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function dp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ft(t,e))return;r.uniform2fv(this.addr,e),gt(t,e)}}function pp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)t[0]===e.r&&t[1]===e.g&&t[2]===e.b||(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(ft(t,e))return;r.uniform3fv(this.addr,e),gt(t,e)}}function mp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ft(t,e))return;r.uniform4fv(this.addr,e),gt(t,e)}}function fp(r,e){let t=this.cache,i=e.elements;if(i===void 0){if(ft(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),gt(t,e)}else{if(ft(t,i))return;Uu.set(i),r.uniformMatrix2fv(this.addr,!1,Uu),gt(t,i)}}function gp(r,e){let t=this.cache,i=e.elements;if(i===void 0){if(ft(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),gt(t,e)}else{if(ft(t,i))return;Nu.set(i),r.uniformMatrix3fv(this.addr,!1,Nu),gt(t,i)}}function _p(r,e){let t=this.cache,i=e.elements;if(i===void 0){if(ft(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),gt(t,e)}else{if(ft(t,i))return;Du.set(i),r.uniformMatrix4fv(this.addr,!1,Du),gt(t,i)}}function vp(r,e){let t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function yp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ft(t,e))return;r.uniform2iv(this.addr,e),gt(t,e)}}function xp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ft(t,e))return;r.uniform3iv(this.addr,e),gt(t,e)}}function Mp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ft(t,e))return;r.uniform4iv(this.addr,e),gt(t,e)}}function Sp(r,e){let t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function bp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ft(t,e))return;r.uniform2uiv(this.addr,e),gt(t,e)}}function Tp(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ft(t,e))return;r.uniform3uiv(this.addr,e),gt(t,e)}}function Ep(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ft(t,e))return;r.uniform4uiv(this.addr,e),gt(t,e)}}function wp(r,e,t){let i=this.cache,n=t.allocateTextureUnit(),s;i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),this.type===r.SAMPLER_2D_SHADOW?(bc.compareFunction=t.isReversedDepthBuffer()?ka:Ha,s=bc):s=Ju,t.setTexture2D(e||s,n)}function Ap(r,e,t){let i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),t.setTexture3D(e||$u,n)}function Cp(r,e,t){let i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),t.setTextureCube(e||Qu,n)}function Rp(r,e,t){let i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),t.setTexture2DArray(e||Ku,n)}function Pp(r,e){r.uniform1fv(this.addr,e)}function Ip(r,e){let t=_r(e,this.size,2);r.uniform2fv(this.addr,t)}function Lp(r,e){let t=_r(e,this.size,3);r.uniform3fv(this.addr,t)}function Dp(r,e){let t=_r(e,this.size,4);r.uniform4fv(this.addr,t)}function Np(r,e){let t=_r(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function Up(r,e){let t=_r(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function Op(r,e){let t=_r(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function Fp(r,e){r.uniform1iv(this.addr,e)}function Bp(r,e){r.uniform2iv(this.addr,e)}function zp(r,e){r.uniform3iv(this.addr,e)}function Gp(r,e){r.uniform4iv(this.addr,e)}function Vp(r,e){r.uniform1uiv(this.addr,e)}function Hp(r,e){r.uniform2uiv(this.addr,e)}function kp(r,e){r.uniform3uiv(this.addr,e)}function Wp(r,e){r.uniform4uiv(this.addr,e)}function Xp(r,e,t){let i=this.cache,n=e.length,s=Ja(t,n),a;ft(i,s)||(r.uniform1iv(this.addr,s),gt(i,s)),a=this.type===r.SAMPLER_2D_SHADOW?bc:Ju;for(let o=0;o!==n;++o)t.setTexture2D(e[o]||a,s[o])}function jp(r,e,t){let i=this.cache,n=e.length,s=Ja(t,n);ft(i,s)||(r.uniform1iv(this.addr,s),gt(i,s));for(let a=0;a!==n;++a)t.setTexture3D(e[a]||$u,s[a])}function qp(r,e,t){let i=this.cache,n=e.length,s=Ja(t,n);ft(i,s)||(r.uniform1iv(this.addr,s),gt(i,s));for(let a=0;a!==n;++a)t.setTextureCube(e[a]||Qu,s[a])}function Yp(r,e,t){let i=this.cache,n=e.length,s=Ja(t,n);ft(i,s)||(r.uniform1iv(this.addr,s),gt(i,s));for(let a=0;a!==n;++a)t.setTexture2DArray(e[a]||Ku,s[a])}var Tc=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=function(n){switch(n){case 5126:return up;case 35664:return dp;case 35665:return pp;case 35666:return mp;case 35674:return fp;case 35675:return gp;case 35676:return _p;case 5124:case 35670:return vp;case 35667:case 35671:return yp;case 35668:case 35672:return xp;case 35669:case 35673:return Mp;case 5125:return Sp;case 36294:return bp;case 36295:return Tp;case 36296:return Ep;case 35678:case 36198:case 36298:case 36306:case 35682:return wp;case 35679:case 36299:case 36307:return Ap;case 35680:case 36300:case 36308:case 36293:return Cp;case 36289:case 36303:case 36311:case 36292:return Rp}}(t.type)}},Ec=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=function(n){switch(n){case 5126:return Pp;case 35664:return Ip;case 35665:return Lp;case 35666:return Dp;case 35674:return Np;case 35675:return Up;case 35676:return Op;case 5124:case 35670:return Fp;case 35667:case 35671:return Bp;case 35668:case 35672:return zp;case 35669:case 35673:return Gp;case 5125:return Vp;case 36294:return Hp;case 36295:return kp;case 36296:return Wp;case 35678:case 36198:case 36298:case 36306:case 35682:return Xp;case 35679:case 36299:case 36307:return jp;case 35680:case 36300:case 36308:case 36293:return qp;case 36289:case 36303:case 36311:case 36292:return Yp}}(t.type)}},wc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let n=this.seq;for(let s=0,a=n.length;s!==a;++s){let o=n[s];o.setValue(e,t[o.id],i)}}},Mc=/(\w+)(\])?(\[|\.)?/g;function Ou(r,e){r.seq.push(e),r.map[e.id]=e}function Zp(r,e,t){let i=r.name,n=i.length;for(Mc.lastIndex=0;;){let s=Mc.exec(i),a=Mc.lastIndex,o=s[1],c=s[2]==="]",l=s[3];if(c&&(o|=0),l===void 0||l==="["&&a+2===n){Ou(t,l===void 0?new Tc(o,r,e):new Ec(o,r,e));break}{let h=t.map[o];h===void 0&&(h=new wc(o),Ou(t,h)),t=h}}}var gr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=e.getActiveUniform(t,a);Zp(o,e.getUniformLocation(t,o.name),this)}let n=[],s=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?n.push(a):s.push(a);n.length>0&&(this.seq=n.concat(s))}setValue(e,t,i,n){let s=this.map[t];s!==void 0&&s.setValue(e,i,n)}setOptional(e,t,i){let n=t[i];n!==void 0&&this.setValue(e,i,n)}static upload(e,t,i,n){for(let s=0,a=t.length;s!==a;++s){let o=t[s],c=i[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,n)}}static seqWithValue(e,t){let i=[];for(let n=0,s=e.length;n!==s;++n){let a=e[n];a.id in t&&i.push(a)}return i}};function Fu(r,e,t){let i=r.createShader(e);return r.shaderSource(i,t),r.compileShader(i),i}var Jp=0,Bu=new Le;function zu(r,e,t){let i=r.getShaderParameter(e,r.COMPILE_STATUS),n=(r.getShaderInfoLog(e)||"").trim();if(i&&n==="")return"";let s=/ERROR: 0:(\d+)/.exec(n);if(s){let a=parseInt(s[1]);return t.toUpperCase()+`

`+n+`

`+function(o,c){let l=o.split(`
`),h=[],d=Math.max(c-6,0),p=Math.min(c+6,l.length);for(let u=d;u<p;u++){let f=u+1;h.push(`${f===c?">":" "} ${f}: ${l[u]}`)}return h.join(`
`)}(r.getShaderSource(e),a)}return n}function Kp(r,e){let t=function(i){ke._getMatrix(Bu,ke.workingColorSpace,i);let n=`mat3( ${Bu.elements.map(s=>s.toFixed(4))} )`;switch(ke.getTransfer(i)){case Pr:return[n,"LinearTransferOETF"];case Ye:return[n,"sRGBTransferOETF"];default:return be("WebGLProgram: Unsupported color space: ",i),[n,"LinearTransferOETF"]}}(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var $p={[pl]:"Linear",[ml]:"Reinhard",[fl]:"Cineon",[gl]:"ACESFilmic",[vl]:"AgX",[yl]:"Neutral",[_l]:"Custom"};function Qp(r,e){let t=$p[e];return t===void 0?(be("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+r+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Xa=new A;function em(){return ke.getLuminanceCoefficients(Xa),["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${Xa.x.toFixed(4)}, ${Xa.y.toFixed(4)}, ${Xa.z.toFixed(4)} );`,"	return dot( weights, rgb );","}"].join(`
`)}function ns(r){return r!==""}function Gu(r,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Vu(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var tm=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ac(r){return r.replace(tm,nm)}var im=new Map;function nm(r,e){let t=ze[e];if(t===void 0){let i=im.get(e);if(i===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");t=ze[i],be('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i)}return Ac(t)}var rm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Hu(r){return r.replace(rm,sm)}function sm(r,e,t,i){let n="";for(let s=parseInt(e);s<parseInt(t);s++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return n}function ku(r){let e=`precision ${r.precision} float;
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
#define LOW_PRECISION`),e}var am={[Kr]:"SHADOWMAP_TYPE_PCF",[hr]:"SHADOWMAP_TYPE_VSM"},om={[dr]:"ENVMAP_TYPE_CUBE",[Mn]:"ENVMAP_TYPE_CUBE",[Qr]:"ENVMAP_TYPE_CUBE_UV"},lm={[Mn]:"ENVMAP_MODE_REFRACTION"},cm={[nu]:"ENVMAP_BLENDING_MULTIPLY",[ru]:"ENVMAP_BLENDING_MIX",[su]:"ENVMAP_BLENDING_ADD"};function hm(r,e,t,i){let n=r.getContext(),s=t.defines,a=t.vertexShader,o=t.fragmentShader,c=function(V){return am[V.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}(t),l=function(V){return V.envMap===!1?"ENVMAP_TYPE_CUBE":om[V.envMapMode]||"ENVMAP_TYPE_CUBE"}(t),h=function(V){return V.envMap===!1?"ENVMAP_MODE_REFLECTION":lm[V.envMapMode]||"ENVMAP_MODE_REFLECTION"}(t),d=function(V){return V.envMap===!1?"ENVMAP_BLENDING_NONE":cm[V.combine]||"ENVMAP_BLENDING_NONE"}(t),p=function(V){let F=V.envMapCubeUVHeight;if(F===null)return null;let Y=Math.log2(F)-2,k=1/F;return{texelWidth:1/(3*Math.max(Math.pow(2,Y),112)),texelHeight:k,maxMip:Y}}(t),u=function(V){return[V.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",V.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ns).join(`
`)}(t),f=function(V){let F=[];for(let Y in V){let k=V[Y];k!==!1&&F.push("#define "+Y+" "+k)}return F.join(`
`)}(s),m=n.createProgram(),y,g,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(y=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(ns).join(`
`),y.length>0&&(y+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(ns).join(`
`),g.length>0&&(g+=`
`)):(y=[ku(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ns).join(`
`),g=[ku(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==hi?"#define TONE_MAPPING":"",t.toneMapping!==hi?ze.tonemapping_pars_fragment:"",t.toneMapping!==hi?Qp("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ze.colorspace_pars_fragment,Kp("linearToOutputTexel",t.outputColorSpace),em(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ns).join(`
`)),a=Ac(a),a=Gu(a,t),a=Vu(a,t),o=Ac(o),o=Gu(o,t),o=Vu(o,t),a=Hu(a),o=Hu(o),t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,y=[u,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+y,g=["#define varying in",t.glslVersion===sc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===sc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let x=_+y+a,S=_+g+o,w=Fu(n,n.VERTEX_SHADER,x),M=Fu(n,n.FRAGMENT_SHADER,S);function D(V){if(r.debug.checkShaderErrors){let F=n.getProgramInfoLog(m)||"",Y=n.getShaderInfoLog(w)||"",k=n.getShaderInfoLog(M)||"",z=F.trim(),q=Y.trim(),W=k.trim(),ie=!0,he=!0;if(n.getProgramParameter(m,n.LINK_STATUS)===!1)if(ie=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(n,m,w,M);else{let Me=zu(n,w,"vertex"),pe=zu(n,M,"fragment");Ee("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(m,n.VALIDATE_STATUS)+`

Material Name: `+V.name+`
Material Type: `+V.type+`

Program Info Log: `+z+`
`+Me+`
`+pe)}else z!==""?be("WebGLProgram: Program Info Log:",z):q!==""&&W!==""||(he=!1);he&&(V.diagnostics={runnable:ie,programLog:z,vertexShader:{log:q,prefix:y},fragmentShader:{log:W,prefix:g}})}n.deleteShader(w),n.deleteShader(M),O=new gr(n,m),N=function(F,Y){let k={},z=F.getProgramParameter(Y,F.ACTIVE_ATTRIBUTES);for(let q=0;q<z;q++){let W=F.getActiveAttrib(Y,q),ie=W.name,he=1;W.type===F.FLOAT_MAT2&&(he=2),W.type===F.FLOAT_MAT3&&(he=3),W.type===F.FLOAT_MAT4&&(he=4),k[ie]={type:W.type,location:F.getAttribLocation(Y,ie),locationSize:he}}return k}(n,m)}let O,N;n.attachShader(m,w),n.attachShader(m,M),t.index0AttributeName!==void 0?n.bindAttribLocation(m,0,t.index0AttributeName):t.hasPositionAttribute===!0&&n.bindAttribLocation(m,0,"position"),n.linkProgram(m),this.getUniforms=function(){return O===void 0&&D(this),O},this.getAttributes=function(){return N===void 0&&D(this),N};let U=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return U===!1&&(U=n.getProgramParameter(m,37297)),U},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(m),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Jp++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=w,this.fragmentShader=M,this}var um=0,Cc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let n=this._getShaderCacheForMaterial(e);return n.has(t)===!1&&(n.add(t),t.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Rc(e),t.set(e,i)),i}},Rc=class{constructor(e){this.id=um++,this.code=e,this.usedTimes=0}};function dm(r,e,t,i,n,s){let a=new $n,o=new Cc,c=new Set,l=[],h=new Map,d=i.logarithmicDepthBuffer,p=i.precision,u={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(m){return c.add(m),m===0?"uv":`uv${m}`}return{getParameters:function(m,y,g,_,x,S){let w=_.fog,M=x.geometry,D=m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial?_.environment:null,O=m.isMeshStandardMaterial||m.isMeshLambertMaterial&&!m.envMap||m.isMeshPhongMaterial&&!m.envMap,N=e.get(m.envMap||D,O),U=N&&N.mapping===Qr?N.image.height:null,V=u[m.type];m.precision!==null&&(p=i.getMaxPrecision(m.precision),p!==m.precision&&be("WebGLProgram.getParameters:",m.precision,"not supported, using",p,"instead."));let F=M.morphAttributes.position||M.morphAttributes.normal||M.morphAttributes.color,Y=F!==void 0?F.length:0,k,z,q,W,ie=0;if(M.morphAttributes.position!==void 0&&(ie=1),M.morphAttributes.normal!==void 0&&(ie=2),M.morphAttributes.color!==void 0&&(ie=3),V){let $t=Ei[V];k=$t.vertexShader,z=$t.fragmentShader}else{k=m.vertexShader,z=m.fragmentShader;let $t=o.getVertexShaderStage(m),ln=o.getFragmentShaderStage(m);o.update(m,$t,ln),q=$t.id,W=ln.id}let he=r.getRenderTarget(),Me=r.state.buffers.depth.getReversed(),pe=x.isInstancedMesh===!0,me=x.isBatchedMesh===!0,ee=!!m.map,le=!!m.matcap,se=!!N,ge=!!m.aoMap,Ae=!!m.lightMap,$=!!m.bumpMap&&m.wireframe===!1,P=!!m.normalMap,b=!!m.displacementMap,R=!!m.emissiveMap,T=!!m.metalnessMap,v=!!m.roughnessMap,L=m.anisotropy>0,I=m.clearcoat>0,C=m.dispersion>0,H=m.iridescence>0,X=m.sheen>0,Z=m.transmission>0,re=L&&!!m.anisotropyMap,ve=I&&!!m.clearcoatMap,ye=I&&!!m.clearcoatNormalMap,ue=I&&!!m.clearcoatRoughnessMap,Ce=H&&!!m.iridescenceMap,te=H&&!!m.iridescenceThicknessMap,ae=X&&!!m.sheenColorMap,ne=X&&!!m.sheenRoughnessMap,fe=!!m.specularMap,et=!!m.specularColorMap,qe=!!m.specularIntensityMap,lt=Z&&!!m.transmissionMap,It=Z&&!!m.thicknessMap,Se=!!m.gradientMap,Ze=!!m.alphaMap,Ge=m.alphaTest>0,yt=!!m.alphaHash,tt=!!m.extensions,pt=hi;m.toneMapped&&(he!==null&&he.isXRRenderTarget!==!0||(pt=r.toneMapping));let ot={shaderID:V,shaderType:m.type,shaderName:m.name,vertexShader:k,fragmentShader:z,defines:m.defines,customVertexShaderID:q,customFragmentShaderID:W,isRawShaderMaterial:m.isRawShaderMaterial===!0,glslVersion:m.glslVersion,precision:p,batching:me,batchingColor:me&&x._colorsTexture!==null,instancing:pe,instancingColor:pe&&x.instanceColor!==null,instancingMorph:pe&&x.morphTexture!==null,outputColorSpace:he===null?r.outputColorSpace:he.isXRRenderTarget===!0?he.texture.colorSpace:ke.workingColorSpace,alphaToCoverage:!!m.alphaToCoverage,map:ee,matcap:le,envMap:se,envMapMode:se&&N.mapping,envMapCubeUVHeight:U,aoMap:ge,lightMap:Ae,bumpMap:$,normalMap:P,displacementMap:b,emissiveMap:R,normalMapObjectSpace:P&&m.normalMapType===cu,normalMapTangentSpace:P&&m.normalMapType===rc,packedNormalMap:P&&m.normalMapType===rc&&(jt=m.normalMap.format,jt===Tn||jt===Ga||jt===Va),metalnessMap:T,roughnessMap:v,anisotropy:L,anisotropyMap:re,clearcoat:I,clearcoatMap:ve,clearcoatNormalMap:ye,clearcoatRoughnessMap:ue,dispersion:C,iridescence:H,iridescenceMap:Ce,iridescenceThicknessMap:te,sheen:X,sheenColorMap:ae,sheenRoughnessMap:ne,specularMap:fe,specularColorMap:et,specularIntensityMap:qe,transmission:Z,transmissionMap:lt,thicknessMap:It,gradientMap:Se,opaque:m.transparent===!1&&m.blending===$r&&m.alphaToCoverage===!1,alphaMap:Ze,alphaTest:Ge,alphaHash:yt,combine:m.combine,mapUv:ee&&f(m.map.channel),aoMapUv:ge&&f(m.aoMap.channel),lightMapUv:Ae&&f(m.lightMap.channel),bumpMapUv:$&&f(m.bumpMap.channel),normalMapUv:P&&f(m.normalMap.channel),displacementMapUv:b&&f(m.displacementMap.channel),emissiveMapUv:R&&f(m.emissiveMap.channel),metalnessMapUv:T&&f(m.metalnessMap.channel),roughnessMapUv:v&&f(m.roughnessMap.channel),anisotropyMapUv:re&&f(m.anisotropyMap.channel),clearcoatMapUv:ve&&f(m.clearcoatMap.channel),clearcoatNormalMapUv:ye&&f(m.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ue&&f(m.clearcoatRoughnessMap.channel),iridescenceMapUv:Ce&&f(m.iridescenceMap.channel),iridescenceThicknessMapUv:te&&f(m.iridescenceThicknessMap.channel),sheenColorMapUv:ae&&f(m.sheenColorMap.channel),sheenRoughnessMapUv:ne&&f(m.sheenRoughnessMap.channel),specularMapUv:fe&&f(m.specularMap.channel),specularColorMapUv:et&&f(m.specularColorMap.channel),specularIntensityMapUv:qe&&f(m.specularIntensityMap.channel),transmissionMapUv:lt&&f(m.transmissionMap.channel),thicknessMapUv:It&&f(m.thicknessMap.channel),alphaMapUv:Ze&&f(m.alphaMap.channel),vertexTangents:!!M.attributes.tangent&&(P||L),vertexNormals:!!M.attributes.normal,vertexColors:m.vertexColors,vertexAlphas:m.vertexColors===!0&&!!M.attributes.color&&M.attributes.color.itemSize===4,pointsUvs:x.isPoints===!0&&!!M.attributes.uv&&(ee||Ze),fog:!!w,useFog:m.fog===!0,fogExp2:!!w&&w.isFogExp2,flatShading:m.wireframe===!1&&(m.flatShading===!0||M.attributes.normal===void 0&&P===!1&&(m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshStandardMaterial||m.isMeshPhysicalMaterial)),sizeAttenuation:m.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Me,skinning:x.isSkinnedMesh===!0,hasPositionAttribute:M.attributes.position!==void 0,morphTargets:M.morphAttributes.position!==void 0,morphNormals:M.morphAttributes.normal!==void 0,morphColors:M.morphAttributes.color!==void 0,morphTargetsCount:Y,morphTextureStride:ie,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numLightProbeGrids:S.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:m.dithering,shadowMapEnabled:r.shadowMap.enabled&&g.length>0,shadowMapType:r.shadowMap.type,toneMapping:pt,decodeVideoTexture:ee&&m.map.isVideoTexture===!0&&ke.getTransfer(m.map.colorSpace)===Ye,decodeVideoTextureEmissive:R&&m.emissiveMap.isVideoTexture===!0&&ke.getTransfer(m.emissiveMap.colorSpace)===Ye,premultipliedAlpha:m.premultipliedAlpha,doubleSided:m.side===Tt,flipSided:m.side===Bt,useDepthPacking:m.depthPacking>=0,depthPacking:m.depthPacking||0,index0AttributeName:m.index0AttributeName,extensionClipCullDistance:tt&&m.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(tt&&m.extensions.multiDraw===!0||me)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:m.customProgramCacheKey()};var jt;return ot.vertexUv1s=c.has(1),ot.vertexUv2s=c.has(2),ot.vertexUv3s=c.has(3),c.clear(),ot},getProgramCacheKey:function(m){let y=[];if(m.shaderID?y.push(m.shaderID):(y.push(m.customVertexShaderID),y.push(m.customFragmentShaderID)),m.defines!==void 0)for(let g in m.defines)y.push(g),y.push(m.defines[g]);return m.isRawShaderMaterial===!1&&(function(g,_){g.push(_.precision),g.push(_.outputColorSpace),g.push(_.envMapMode),g.push(_.envMapCubeUVHeight),g.push(_.mapUv),g.push(_.alphaMapUv),g.push(_.lightMapUv),g.push(_.aoMapUv),g.push(_.bumpMapUv),g.push(_.normalMapUv),g.push(_.displacementMapUv),g.push(_.emissiveMapUv),g.push(_.metalnessMapUv),g.push(_.roughnessMapUv),g.push(_.anisotropyMapUv),g.push(_.clearcoatMapUv),g.push(_.clearcoatNormalMapUv),g.push(_.clearcoatRoughnessMapUv),g.push(_.iridescenceMapUv),g.push(_.iridescenceThicknessMapUv),g.push(_.sheenColorMapUv),g.push(_.sheenRoughnessMapUv),g.push(_.specularMapUv),g.push(_.specularColorMapUv),g.push(_.specularIntensityMapUv),g.push(_.transmissionMapUv),g.push(_.thicknessMapUv),g.push(_.combine),g.push(_.fogExp2),g.push(_.sizeAttenuation),g.push(_.morphTargetsCount),g.push(_.morphAttributeCount),g.push(_.numDirLights),g.push(_.numPointLights),g.push(_.numSpotLights),g.push(_.numSpotLightMaps),g.push(_.numHemiLights),g.push(_.numRectAreaLights),g.push(_.numDirLightShadows),g.push(_.numPointLightShadows),g.push(_.numSpotLightShadows),g.push(_.numSpotLightShadowsWithMaps),g.push(_.numLightProbes),g.push(_.shadowMapType),g.push(_.toneMapping),g.push(_.numClippingPlanes),g.push(_.numClipIntersection),g.push(_.depthPacking)}(y,m),function(g,_){a.disableAll(),_.instancing&&a.enable(0),_.instancingColor&&a.enable(1),_.instancingMorph&&a.enable(2),_.matcap&&a.enable(3),_.envMap&&a.enable(4),_.normalMapObjectSpace&&a.enable(5),_.normalMapTangentSpace&&a.enable(6),_.clearcoat&&a.enable(7),_.iridescence&&a.enable(8),_.alphaTest&&a.enable(9),_.vertexColors&&a.enable(10),_.vertexAlphas&&a.enable(11),_.vertexUv1s&&a.enable(12),_.vertexUv2s&&a.enable(13),_.vertexUv3s&&a.enable(14),_.vertexTangents&&a.enable(15),_.anisotropy&&a.enable(16),_.alphaHash&&a.enable(17),_.batching&&a.enable(18),_.dispersion&&a.enable(19),_.batchingColor&&a.enable(20),_.gradientMap&&a.enable(21),_.packedNormalMap&&a.enable(22),_.vertexNormals&&a.enable(23),g.push(a.mask),a.disableAll(),_.fog&&a.enable(0),_.useFog&&a.enable(1),_.flatShading&&a.enable(2),_.logarithmicDepthBuffer&&a.enable(3),_.reversedDepthBuffer&&a.enable(4),_.skinning&&a.enable(5),_.morphTargets&&a.enable(6),_.morphNormals&&a.enable(7),_.morphColors&&a.enable(8),_.premultipliedAlpha&&a.enable(9),_.shadowMapEnabled&&a.enable(10),_.doubleSided&&a.enable(11),_.flipSided&&a.enable(12),_.useDepthPacking&&a.enable(13),_.dithering&&a.enable(14),_.transmission&&a.enable(15),_.sheen&&a.enable(16),_.opaque&&a.enable(17),_.pointsUvs&&a.enable(18),_.decodeVideoTexture&&a.enable(19),_.decodeVideoTextureEmissive&&a.enable(20),_.alphaToCoverage&&a.enable(21),_.numLightProbeGrids>0&&a.enable(22),_.hasPositionAttribute&&a.enable(23),g.push(a.mask)}(y,m),y.push(r.outputColorSpace)),y.push(m.customProgramCacheKey),y.join()},getUniforms:function(m){let y=u[m.type],g;if(y){let _=Ei[y];g=Tu.clone(_.uniforms)}else g=m.uniforms;return g},acquireProgram:function(m,y){let g=h.get(y);return g!==void 0?++g.usedTimes:(g=new hm(r,y,m,n),l.push(g),h.set(y,g)),g},releaseProgram:function(m){if(--m.usedTimes===0){let y=l.indexOf(m);l[y]=l[l.length-1],l.pop(),h.delete(m.cacheKey),m.destroy()}},releaseShaderCache:function(m){o.remove(m)},programs:l,dispose:function(){o.dispose()}}}function pm(){let r=new WeakMap;return{has:function(e){return r.has(e)},get:function(e){let t=r.get(e);return t===void 0&&(t={},r.set(e,t)),t},remove:function(e){r.delete(e)},update:function(e,t,i){r.get(e)[t]=i},dispose:function(){r=new WeakMap}}}function mm(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.materialVariant!==e.materialVariant?r.materialVariant-e.materialVariant:r.z!==e.z?r.z-e.z:r.id-e.id}function Wu(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function Xu(){let r=[],e=0,t=[],i=[],n=[];function s(o){let c=0;return o.isInstancedMesh&&(c+=2),o.isSkinnedMesh&&(c+=1),c}function a(o,c,l,h,d,p){let u=r[e];return u===void 0?(u={id:o.id,object:o,geometry:c,material:l,materialVariant:s(o),groupOrder:h,renderOrder:o.renderOrder,z:d,group:p},r[e]=u):(u.id=o.id,u.object=o,u.geometry=c,u.material=l,u.materialVariant=s(o),u.groupOrder=h,u.renderOrder=o.renderOrder,u.z=d,u.group=p),e++,u}return{opaque:t,transmissive:i,transparent:n,init:function(){e=0,t.length=0,i.length=0,n.length=0},push:function(o,c,l,h,d,p){let u=a(o,c,l,h,d,p);l.transmission>0?i.push(u):l.transparent===!0?n.push(u):t.push(u)},unshift:function(o,c,l,h,d,p){let u=a(o,c,l,h,d,p);l.transmission>0?i.unshift(u):l.transparent===!0?n.unshift(u):t.unshift(u)},finish:function(){for(let o=e,c=r.length;o<c;o++){let l=r[o];if(l.id===null)break;l.id=null,l.object=null,l.geometry=null,l.material=null,l.group=null}},sort:function(o,c,l){t.length>1&&t.sort(o||mm),i.length>1&&i.sort(c||Wu),n.length>1&&n.sort(c||Wu),l&&(t.reverse(),i.reverse(),n.reverse())}}}function fm(){let r=new WeakMap;return{get:function(e,t){let i=r.get(e),n;return i===void 0?(n=new Xu,r.set(e,[n])):t>=i.length?(n=new Xu,i.push(n)):n=i[t],n},dispose:function(){r=new WeakMap}}}function gm(){let r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new A,color:new Ue};break;case"SpotLight":t={position:new A,direction:new A,color:new Ue,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new A,color:new Ue,distance:0,decay:0};break;case"HemisphereLight":t={direction:new A,skyColor:new Ue,groundColor:new Ue};break;case"RectAreaLight":t={color:new Ue,position:new A,halfWidth:new A,halfHeight:new A}}return r[e.id]=t,t}}}var _m=0;function vm(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function ym(r){let e=new gm,t=function(){let o={};return{get:function(c){if(o[c.id]!==void 0)return o[c.id];let l;switch(c.type){case"DirectionalLight":case"SpotLight":l={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q};break;case"PointLight":l={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q,shadowCameraNear:1,shadowCameraFar:1e3}}return o[c.id]=l,l}}}(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let o=0;o<9;o++)i.probe.push(new A);let n=new A,s=new Fe,a=new Fe;return{setup:function(o){let c=0,l=0,h=0;for(let D=0;D<9;D++)i.probe[D].set(0,0,0);let d=0,p=0,u=0,f=0,m=0,y=0,g=0,_=0,x=0,S=0,w=0;o.sort(vm);for(let D=0,O=o.length;D<O;D++){let N=o[D],U=N.color,V=N.intensity,F=N.distance,Y=null;if(N.shadow&&N.shadow.map&&(Y=N.shadow.map.texture.format===Tn?N.shadow.map.texture:N.shadow.map.depthTexture||N.shadow.map.texture),N.isAmbientLight)c+=U.r*V,l+=U.g*V,h+=U.b*V;else if(N.isLightProbe){for(let k=0;k<9;k++)i.probe[k].addScaledVector(N.sh.coefficients[k],V);w++}else if(N.isDirectionalLight){let k=e.get(N);if(k.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){let z=N.shadow,q=t.get(N);q.shadowIntensity=z.intensity,q.shadowBias=z.bias,q.shadowNormalBias=z.normalBias,q.shadowRadius=z.radius,q.shadowMapSize=z.mapSize,i.directionalShadow[d]=q,i.directionalShadowMap[d]=Y,i.directionalShadowMatrix[d]=N.shadow.matrix,y++}i.directional[d]=k,d++}else if(N.isSpotLight){let k=e.get(N);k.position.setFromMatrixPosition(N.matrixWorld),k.color.copy(U).multiplyScalar(V),k.distance=F,k.coneCos=Math.cos(N.angle),k.penumbraCos=Math.cos(N.angle*(1-N.penumbra)),k.decay=N.decay,i.spot[u]=k;let z=N.shadow;if(N.map&&(i.spotLightMap[x]=N.map,x++,z.updateMatrices(N),N.castShadow&&S++),i.spotLightMatrix[u]=z.matrix,N.castShadow){let q=t.get(N);q.shadowIntensity=z.intensity,q.shadowBias=z.bias,q.shadowNormalBias=z.normalBias,q.shadowRadius=z.radius,q.shadowMapSize=z.mapSize,i.spotShadow[u]=q,i.spotShadowMap[u]=Y,_++}u++}else if(N.isRectAreaLight){let k=e.get(N);k.color.copy(U).multiplyScalar(V),k.halfWidth.set(.5*N.width,0,0),k.halfHeight.set(0,.5*N.height,0),i.rectArea[f]=k,f++}else if(N.isPointLight){let k=e.get(N);if(k.color.copy(N.color).multiplyScalar(N.intensity),k.distance=N.distance,k.decay=N.decay,N.castShadow){let z=N.shadow,q=t.get(N);q.shadowIntensity=z.intensity,q.shadowBias=z.bias,q.shadowNormalBias=z.normalBias,q.shadowRadius=z.radius,q.shadowMapSize=z.mapSize,q.shadowCameraNear=z.camera.near,q.shadowCameraFar=z.camera.far,i.pointShadow[p]=q,i.pointShadowMap[p]=Y,i.pointShadowMatrix[p]=N.shadow.matrix,g++}i.point[p]=k,p++}else if(N.isHemisphereLight){let k=e.get(N);k.skyColor.copy(N.color).multiplyScalar(V),k.groundColor.copy(N.groundColor).multiplyScalar(V),i.hemi[m]=k,m++}}f>0&&(r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ce.LTC_FLOAT_1,i.rectAreaLTC2=ce.LTC_FLOAT_2):(i.rectAreaLTC1=ce.LTC_HALF_1,i.rectAreaLTC2=ce.LTC_HALF_2)),i.ambient[0]=c,i.ambient[1]=l,i.ambient[2]=h;let M=i.hash;M.directionalLength===d&&M.pointLength===p&&M.spotLength===u&&M.rectAreaLength===f&&M.hemiLength===m&&M.numDirectionalShadows===y&&M.numPointShadows===g&&M.numSpotShadows===_&&M.numSpotMaps===x&&M.numLightProbes===w||(i.directional.length=d,i.spot.length=u,i.rectArea.length=f,i.point.length=p,i.hemi.length=m,i.directionalShadow.length=y,i.directionalShadowMap.length=y,i.pointShadow.length=g,i.pointShadowMap.length=g,i.spotShadow.length=_,i.spotShadowMap.length=_,i.directionalShadowMatrix.length=y,i.pointShadowMatrix.length=g,i.spotLightMatrix.length=_+x-S,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=S,i.numLightProbes=w,M.directionalLength=d,M.pointLength=p,M.spotLength=u,M.rectAreaLength=f,M.hemiLength=m,M.numDirectionalShadows=y,M.numPointShadows=g,M.numSpotShadows=_,M.numSpotMaps=x,M.numLightProbes=w,i.version=_m++)},setupView:function(o,c){let l=0,h=0,d=0,p=0,u=0,f=c.matrixWorldInverse;for(let m=0,y=o.length;m<y;m++){let g=o[m];if(g.isDirectionalLight){let _=i.directional[l];_.direction.setFromMatrixPosition(g.matrixWorld),n.setFromMatrixPosition(g.target.matrixWorld),_.direction.sub(n),_.direction.transformDirection(f),l++}else if(g.isSpotLight){let _=i.spot[d];_.position.setFromMatrixPosition(g.matrixWorld),_.position.applyMatrix4(f),_.direction.setFromMatrixPosition(g.matrixWorld),n.setFromMatrixPosition(g.target.matrixWorld),_.direction.sub(n),_.direction.transformDirection(f),d++}else if(g.isRectAreaLight){let _=i.rectArea[p];_.position.setFromMatrixPosition(g.matrixWorld),_.position.applyMatrix4(f),a.identity(),s.copy(g.matrixWorld),s.premultiply(f),a.extractRotation(s),_.halfWidth.set(.5*g.width,0,0),_.halfHeight.set(0,.5*g.height,0),_.halfWidth.applyMatrix4(a),_.halfHeight.applyMatrix4(a),p++}else if(g.isPointLight){let _=i.point[h];_.position.setFromMatrixPosition(g.matrixWorld),_.position.applyMatrix4(f),h++}else if(g.isHemisphereLight){let _=i.hemi[u];_.direction.setFromMatrixPosition(g.matrixWorld),_.direction.transformDirection(f),u++}}},state:i}}function ju(r){let e=new ym(r),t=[],i=[],n=[],s={lightsArray:t,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:function(a){s.camera=a,t.length=0,i.length=0,n.length=0},state:s,setupLights:function(){e.setup(t)},setupLightsView:function(a){e.setupView(t,a)},pushLight:function(a){t.push(a)},pushShadow:function(a){i.push(a)},pushLightProbeGrid:function(a){n.push(a)}}}function xm(r){let e=new WeakMap;return{get:function(t,i=0){let n=e.get(t),s;return n===void 0?(s=new ju(r),e.set(t,[s])):i>=n.length?(s=new ju(r),n.push(s)):s=n[i],s},dispose:function(){e=new WeakMap}}}var Mm=[new A(1,0,0),new A(-1,0,0),new A(0,1,0),new A(0,-1,0),new A(0,0,1),new A(0,0,-1)],Sm=[new A(0,-1,0),new A(0,-1,0),new A(0,0,1),new A(0,0,-1),new A(0,-1,0),new A(0,-1,0)],qu=new Fe,rs=new A,Sc=new A;function bm(r,e,t){let i=new Fi,n=new Q,s=new Q,a=new Je,o=new pa,c=new ma,l={},h=t.maxTextureSize,d={[sn]:Bt,[Bt]:sn,[Tt]:Tt},p=new Ut({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Q},radius:{value:4}},vertexShader:`void main() {
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
}`}),u=p.clone();u.defines.HORIZONTAL_PASS=1;let f=new Ke;f.setAttribute("position",new bt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let m=new Oe(f,p),y=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Kr;let g=this.type;function _(M,D){let O=e.update(m);p.defines.VSM_SAMPLES!==M.blurSamples&&(p.defines.VSM_SAMPLES=M.blurSamples,u.defines.VSM_SAMPLES=M.blurSamples,p.needsUpdate=!0,u.needsUpdate=!0),M.mapPass===null&&(M.mapPass=new kt(n.x,n.y,{format:Tn,type:bi})),p.uniforms.shadow_pass.value=M.map.depthTexture,p.uniforms.resolution.value=M.mapSize,p.uniforms.radius.value=M.radius,r.setRenderTarget(M.mapPass),r.clear(),r.renderBufferDirect(D,null,O,p,m,null),u.uniforms.shadow_pass.value=M.mapPass.texture,u.uniforms.resolution.value=M.mapSize,u.uniforms.radius.value=M.radius,r.setRenderTarget(M.map),r.clear(),r.renderBufferDirect(D,null,O,u,m,null)}function x(M,D,O,N){let U=null,V=O.isPointLight===!0?M.customDistanceMaterial:M.customDepthMaterial;if(V!==void 0)U=V;else if(U=O.isPointLight===!0?c:o,r.localClippingEnabled&&D.clipShadows===!0&&Array.isArray(D.clippingPlanes)&&D.clippingPlanes.length!==0||D.displacementMap&&D.displacementScale!==0||D.alphaMap&&D.alphaTest>0||D.map&&D.alphaTest>0||D.alphaToCoverage===!0){let F=U.uuid,Y=D.uuid,k=l[F];k===void 0&&(k={},l[F]=k);let z=k[Y];z===void 0&&(z=U.clone(),k[Y]=z,D.addEventListener("dispose",w)),U=z}return U.visible=D.visible,U.wireframe=D.wireframe,U.side=N===hr?D.shadowSide!==null?D.shadowSide:D.side:D.shadowSide!==null?D.shadowSide:d[D.side],U.alphaMap=D.alphaMap,U.alphaTest=D.alphaToCoverage===!0?.5:D.alphaTest,U.map=D.map,U.clipShadows=D.clipShadows,U.clippingPlanes=D.clippingPlanes,U.clipIntersection=D.clipIntersection,U.displacementMap=D.displacementMap,U.displacementScale=D.displacementScale,U.displacementBias=D.displacementBias,U.wireframeLinewidth=D.wireframeLinewidth,U.linewidth=D.linewidth,O.isPointLight===!0&&U.isMeshDistanceMaterial===!0&&(r.properties.get(U).light=O),U}function S(M,D,O,N,U){if(M.visible===!1)return;if(M.layers.test(D.layers)&&(M.isMesh||M.isLine||M.isPoints)&&(M.castShadow||M.receiveShadow&&U===hr)&&(!M.frustumCulled||i.intersectsObject(M))){M.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,M.matrixWorld);let F=e.update(M),Y=M.material;if(Array.isArray(Y)){let k=F.groups;for(let z=0,q=k.length;z<q;z++){let W=k[z],ie=Y[W.materialIndex];if(ie&&ie.visible){let he=x(M,ie,N,U);M.onBeforeShadow(r,M,D,O,F,he,W),r.renderBufferDirect(O,null,F,he,M,W),M.onAfterShadow(r,M,D,O,F,he,W)}}}else if(Y.visible){let k=x(M,Y,N,U);M.onBeforeShadow(r,M,D,O,F,k,null),r.renderBufferDirect(O,null,F,k,M,null),M.onAfterShadow(r,M,D,O,F,k,null)}}let V=M.children;for(let F=0,Y=V.length;F<Y;F++)S(V[F],D,O,N,U)}function w(M){M.target.removeEventListener("dispose",w);for(let D in l){let O=l[D],N=M.target.uuid;N in O&&(O[N].dispose(),delete O[N])}}this.render=function(M,D,O){if(y.enabled===!1||y.autoUpdate===!1&&y.needsUpdate===!1||M.length===0)return;this.type===Oh&&(be("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Kr);let N=r.getRenderTarget(),U=r.getActiveCubeFace(),V=r.getActiveMipmapLevel(),F=r.state;F.setBlending(Si),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let Y=g!==this.type;Y&&D.traverse(function(k){k.material&&(Array.isArray(k.material)?k.material.forEach(z=>z.needsUpdate=!0):k.material.needsUpdate=!0)});for(let k=0,z=M.length;k<z;k++){let q=M[k],W=q.shadow;if(W===void 0){be("WebGLShadowMap:",q,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;n.copy(W.mapSize);let ie=W.getFrameExtents();n.multiply(ie),s.copy(W.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(s.x=Math.floor(h/ie.x),n.x=s.x*ie.x,W.mapSize.x=s.x),n.y>h&&(s.y=Math.floor(h/ie.y),n.y=s.y*ie.y,W.mapSize.y=s.y));let he=r.state.buffers.depth.getReversed();if(W.camera._reversedDepth=he,W.map===null||Y===!0){if(W.map!==null&&(W.map.depthTexture!==null&&(W.map.depthTexture.dispose(),W.map.depthTexture=null),W.map.dispose()),this.type===hr){if(q.isPointLight){be("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}W.map=new kt(n.x,n.y,{format:Tn,type:bi,minFilter:Ct,magFilter:Ct,generateMipmaps:!1}),W.map.texture.name=q.name+".shadowMap",W.map.depthTexture=new Bi(n.x,n.y,ui),W.map.depthTexture.name=q.name+".shadowMapDepth",W.map.depthTexture.format=an,W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=Jt,W.map.depthTexture.magFilter=Jt}else q.isPointLight?(W.map=new Ya(n.x),W.map.depthTexture=new Js(n.x,zi)):(W.map=new kt(n.x,n.y),W.map.depthTexture=new Bi(n.x,n.y,zi)),W.map.depthTexture.name=q.name+".shadowMap",W.map.depthTexture.format=an,this.type===Kr?(W.map.depthTexture.compareFunction=he?ka:Ha,W.map.depthTexture.minFilter=Ct,W.map.depthTexture.magFilter=Ct):(W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=Jt,W.map.depthTexture.magFilter=Jt);W.camera.updateProjectionMatrix()}let Me=W.map.isWebGLCubeRenderTarget?6:1;for(let pe=0;pe<Me;pe++){if(W.map.isWebGLCubeRenderTarget)r.setRenderTarget(W.map,pe),r.clear();else{pe===0&&(r.setRenderTarget(W.map),r.clear());let me=W.getViewport(pe);a.set(s.x*me.x,s.y*me.y,s.x*me.z,s.y*me.w),F.viewport(a)}if(q.isPointLight){let me=W.camera,ee=W.matrix,le=q.distance||me.far;le!==me.far&&(me.far=le,me.updateProjectionMatrix()),rs.setFromMatrixPosition(q.matrixWorld),me.position.copy(rs),Sc.copy(me.position),Sc.add(Mm[pe]),me.up.copy(Sm[pe]),me.lookAt(Sc),me.updateMatrixWorld(),ee.makeTranslation(-rs.x,-rs.y,-rs.z),qu.multiplyMatrices(me.projectionMatrix,me.matrixWorldInverse),W._frustum.setFromProjectionMatrix(qu,me.coordinateSystem,me.reversedDepth)}else W.updateMatrices(q);i=W.getFrustum(),S(D,O,W.camera,q,this.type)}W.isPointLightShadow!==!0&&this.type===hr&&_(W,O),W.needsUpdate=!1}g=this.type,y.needsUpdate=!1,r.setRenderTarget(N,U,V)}}function Tm(r,e){let t=new function(){let v=!1,L=new Je,I=null,C=new Je(0,0,0,0);return{setMask:function(H){I===H||v||(r.colorMask(H,H,H,H),I=H)},setLocked:function(H){v=H},setClear:function(H,X,Z,re,ve){ve===!0&&(H*=re,X*=re,Z*=re),L.set(H,X,Z,re),C.equals(L)===!1&&(r.clearColor(H,X,Z,re),C.copy(L))},reset:function(){v=!1,I=null,C.set(-1,0,0,0)}}},i=new function(){let v=!1,L=!1,I=null,C=null,H=null;return{setReversed:function(X){if(L!==X){let Z=e.get("EXT_clip_control");X?Z.clipControlEXT(Z.LOWER_LEFT_EXT,Z.ZERO_TO_ONE_EXT):Z.clipControlEXT(Z.LOWER_LEFT_EXT,Z.NEGATIVE_ONE_TO_ONE_EXT),L=X;let re=H;H=null,this.setClear(re)}},getReversed:function(){return L},setTest:function(X){X?se(r.DEPTH_TEST):ge(r.DEPTH_TEST)},setMask:function(X){I===X||v||(r.depthMask(X),I=X)},setFunc:function(X){if(L&&(X=yu[X]),C!==X){switch(X){case al:r.depthFunc(r.NEVER);break;case ol:r.depthFunc(r.ALWAYS);break;case ll:r.depthFunc(r.LESS);break;case Ca:r.depthFunc(r.LEQUAL);break;case cl:r.depthFunc(r.EQUAL);break;case hl:r.depthFunc(r.GEQUAL);break;case ul:r.depthFunc(r.GREATER);break;case dl:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}C=X}},setLocked:function(X){v=X},setClear:function(X){H!==X&&(H=X,L&&(X=1-X),r.clearDepth(X))},reset:function(){v=!1,I=null,C=null,H=null,L=!1}}},n=new function(){let v=!1,L=null,I=null,C=null,H=null,X=null,Z=null,re=null,ve=null;return{setTest:function(ye){v||(ye?se(r.STENCIL_TEST):ge(r.STENCIL_TEST))},setMask:function(ye){L===ye||v||(r.stencilMask(ye),L=ye)},setFunc:function(ye,ue,Ce){I===ye&&C===ue&&H===Ce||(r.stencilFunc(ye,ue,Ce),I=ye,C=ue,H=Ce)},setOp:function(ye,ue,Ce){X===ye&&Z===ue&&re===Ce||(r.stencilOp(ye,ue,Ce),X=ye,Z=ue,re=Ce)},setLocked:function(ye){v=ye},setClear:function(ye){ve!==ye&&(r.clearStencil(ye),ve=ye)},reset:function(){v=!1,L=null,I=null,C=null,H=null,X=null,Z=null,re=null,ve=null}}},s=new WeakMap,a=new WeakMap,o={},c={},l={},h=new WeakMap,d=[],p=null,u=!1,f=null,m=null,y=null,g=null,_=null,x=null,S=null,w=new Ue(0,0,0),M=0,D=!1,O=null,N=null,U=null,V=null,F=null,Y=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS),k=!1,z=0,q=r.getParameter(r.VERSION);q.indexOf("WebGL")!==-1?(z=parseFloat(/^WebGL (\d)/.exec(q)[1]),k=z>=1):q.indexOf("OpenGL ES")!==-1&&(z=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),k=z>=2);let W=null,ie={},he=r.getParameter(r.SCISSOR_BOX),Me=r.getParameter(r.VIEWPORT),pe=new Je().fromArray(he),me=new Je().fromArray(Me);function ee(v,L,I,C){let H=new Uint8Array(4),X=r.createTexture();r.bindTexture(v,X),r.texParameteri(v,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(v,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let Z=0;Z<I;Z++)v===r.TEXTURE_3D||v===r.TEXTURE_2D_ARRAY?r.texImage3D(L,0,r.RGBA,1,1,C,0,r.RGBA,r.UNSIGNED_BYTE,H):r.texImage2D(L+Z,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,H);return X}let le={};function se(v){o[v]!==!0&&(r.enable(v),o[v]=!0)}function ge(v){o[v]!==!1&&(r.disable(v),o[v]=!1)}le[r.TEXTURE_2D]=ee(r.TEXTURE_2D,r.TEXTURE_2D,1),le[r.TEXTURE_CUBE_MAP]=ee(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[r.TEXTURE_2D_ARRAY]=ee(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),le[r.TEXTURE_3D]=ee(r.TEXTURE_3D,r.TEXTURE_3D,1,1),t.setClear(0,0,0,1),i.setClear(1),n.setClear(0),se(r.DEPTH_TEST),i.setFunc(Ca),b(!1),R(il),se(r.CULL_FACE),P(Si);let Ae={[ur]:r.FUNC_ADD,[Bh]:r.FUNC_SUBTRACT,[zh]:r.FUNC_REVERSE_SUBTRACT};Ae[Gh]=r.MIN,Ae[Vh]=r.MAX;let $={[Hh]:r.ZERO,[kh]:r.ONE,[Wh]:r.SRC_COLOR,[jh]:r.SRC_ALPHA,[$h]:r.SRC_ALPHA_SATURATE,[Jh]:r.DST_COLOR,[Yh]:r.DST_ALPHA,[Xh]:r.ONE_MINUS_SRC_COLOR,[qh]:r.ONE_MINUS_SRC_ALPHA,[Kh]:r.ONE_MINUS_DST_COLOR,[Zh]:r.ONE_MINUS_DST_ALPHA,[Qh]:r.CONSTANT_COLOR,[eu]:r.ONE_MINUS_CONSTANT_COLOR,[tu]:r.CONSTANT_ALPHA,[iu]:r.ONE_MINUS_CONSTANT_ALPHA};function P(v,L,I,C,H,X,Z,re,ve,ye){if(v!==Si){if(u===!1&&(se(r.BLEND),u=!0),v===Fh)H=H||L,X=X||I,Z=Z||C,L===m&&H===_||(r.blendEquationSeparate(Ae[L],Ae[H]),m=L,_=H),I===y&&C===g&&X===x&&Z===S||(r.blendFuncSeparate($[I],$[C],$[X],$[Z]),y=I,g=C,x=X,S=Z),re.equals(w)!==!1&&ve===M||(r.blendColor(re.r,re.g,re.b,ve),w.copy(re),M=ve),f=v,D=!1;else if(v!==f||ye!==D){if(m===ur&&_===ur||(r.blendEquation(r.FUNC_ADD),m=ur,_=ur),ye)switch(v){case $r:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case nl:r.blendFunc(r.ONE,r.ONE);break;case rl:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case sl:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:Ee("WebGLState: Invalid blending: ",v)}else switch(v){case $r:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case nl:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case rl:Ee("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case sl:Ee("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ee("WebGLState: Invalid blending: ",v)}y=null,g=null,x=null,S=null,w.set(0,0,0),M=0,f=v,D=ye}}else u===!0&&(ge(r.BLEND),u=!1)}function b(v){O!==v&&(v?r.frontFace(r.CW):r.frontFace(r.CCW),O=v)}function R(v){v!==Nh?(se(r.CULL_FACE),v!==N&&(v===il?r.cullFace(r.BACK):v===Uh?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):ge(r.CULL_FACE),N=v}function T(v,L,I){v?(se(r.POLYGON_OFFSET_FILL),V===L&&F===I||(V=L,F=I,i.getReversed()&&(L=-L),r.polygonOffset(L,I))):ge(r.POLYGON_OFFSET_FILL)}return{buffers:{color:t,depth:i,stencil:n},enable:se,disable:ge,bindFramebuffer:function(v,L){return l[v]!==L&&(r.bindFramebuffer(v,L),l[v]=L,v===r.DRAW_FRAMEBUFFER&&(l[r.FRAMEBUFFER]=L),v===r.FRAMEBUFFER&&(l[r.DRAW_FRAMEBUFFER]=L),!0)},drawBuffers:function(v,L){let I=d,C=!1;if(v){I=h.get(L),I===void 0&&(I=[],h.set(L,I));let H=v.textures;if(I.length!==H.length||I[0]!==r.COLOR_ATTACHMENT0){for(let X=0,Z=H.length;X<Z;X++)I[X]=r.COLOR_ATTACHMENT0+X;I.length=H.length,C=!0}}else I[0]!==r.BACK&&(I[0]=r.BACK,C=!0);C&&r.drawBuffers(I)},useProgram:function(v){return p!==v&&(r.useProgram(v),p=v,!0)},setBlending:P,setMaterial:function(v,L){v.side===Tt?ge(r.CULL_FACE):se(r.CULL_FACE);let I=v.side===Bt;L&&(I=!I),b(I),v.blending===$r&&v.transparent===!1?P(Si):P(v.blending,v.blendEquation,v.blendSrc,v.blendDst,v.blendEquationAlpha,v.blendSrcAlpha,v.blendDstAlpha,v.blendColor,v.blendAlpha,v.premultipliedAlpha),i.setFunc(v.depthFunc),i.setTest(v.depthTest),i.setMask(v.depthWrite),t.setMask(v.colorWrite);let C=v.stencilWrite;n.setTest(C),C&&(n.setMask(v.stencilWriteMask),n.setFunc(v.stencilFunc,v.stencilRef,v.stencilFuncMask),n.setOp(v.stencilFail,v.stencilZFail,v.stencilZPass)),T(v.polygonOffset,v.polygonOffsetFactor,v.polygonOffsetUnits),v.alphaToCoverage===!0?se(r.SAMPLE_ALPHA_TO_COVERAGE):ge(r.SAMPLE_ALPHA_TO_COVERAGE)},setFlipSided:b,setCullFace:R,setLineWidth:function(v){v!==U&&(k&&r.lineWidth(v),U=v)},setPolygonOffset:T,setScissorTest:function(v){v?se(r.SCISSOR_TEST):ge(r.SCISSOR_TEST)},activeTexture:function(v){v===void 0&&(v=r.TEXTURE0+Y-1),W!==v&&(r.activeTexture(v),W=v)},bindTexture:function(v,L,I){I===void 0&&(I=W===null?r.TEXTURE0+Y-1:W);let C=ie[I];C===void 0&&(C={type:void 0,texture:void 0},ie[I]=C),C.type===v&&C.texture===L||(W!==I&&(r.activeTexture(I),W=I),r.bindTexture(v,L||le[v]),C.type=v,C.texture=L)},unbindTexture:function(){let v=ie[W];v!==void 0&&v.type!==void 0&&(r.bindTexture(v.type,null),v.type=void 0,v.texture=void 0)},compressedTexImage2D:function(){try{r.compressedTexImage2D(...arguments)}catch(v){Ee("WebGLState:",v)}},compressedTexImage3D:function(){try{r.compressedTexImage3D(...arguments)}catch(v){Ee("WebGLState:",v)}},texImage2D:function(){try{r.texImage2D(...arguments)}catch(v){Ee("WebGLState:",v)}},texImage3D:function(){try{r.texImage3D(...arguments)}catch(v){Ee("WebGLState:",v)}},pixelStorei:function(v,L){c[v]!==L&&(r.pixelStorei(v,L),c[v]=L)},getParameter:function(v){return c[v]!==void 0?c[v]:r.getParameter(v)},updateUBOMapping:function(v,L){let I=a.get(L);I===void 0&&(I=new WeakMap,a.set(L,I));let C=I.get(v);C===void 0&&(C=r.getUniformBlockIndex(L,v.name),I.set(v,C))},uniformBlockBinding:function(v,L){let I=a.get(L).get(v);s.get(L)!==I&&(r.uniformBlockBinding(L,I,v.__bindingPointIndex),s.set(L,I))},texStorage2D:function(){try{r.texStorage2D(...arguments)}catch(v){Ee("WebGLState:",v)}},texStorage3D:function(){try{r.texStorage3D(...arguments)}catch(v){Ee("WebGLState:",v)}},texSubImage2D:function(){try{r.texSubImage2D(...arguments)}catch(v){Ee("WebGLState:",v)}},texSubImage3D:function(){try{r.texSubImage3D(...arguments)}catch(v){Ee("WebGLState:",v)}},compressedTexSubImage2D:function(){try{r.compressedTexSubImage2D(...arguments)}catch(v){Ee("WebGLState:",v)}},compressedTexSubImage3D:function(){try{r.compressedTexSubImage3D(...arguments)}catch(v){Ee("WebGLState:",v)}},scissor:function(v){pe.equals(v)===!1&&(r.scissor(v.x,v.y,v.z,v.w),pe.copy(v))},viewport:function(v){me.equals(v)===!1&&(r.viewport(v.x,v.y,v.z,v.w),me.copy(v))},reset:function(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),i.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),r.pixelStorei(r.PACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,r.BROWSER_DEFAULT_WEBGL),r.pixelStorei(r.PACK_ROW_LENGTH,0),r.pixelStorei(r.PACK_SKIP_PIXELS,0),r.pixelStorei(r.PACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_ROW_LENGTH,0),r.pixelStorei(r.UNPACK_IMAGE_HEIGHT,0),r.pixelStorei(r.UNPACK_SKIP_PIXELS,0),r.pixelStorei(r.UNPACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_SKIP_IMAGES,0),o={},c={},W=null,ie={},l={},h=new WeakMap,d=[],p=null,u=!1,f=null,m=null,y=null,g=null,_=null,x=null,S=null,w=new Ue(0,0,0),M=0,D=!1,O=null,N=null,U=null,V=null,F=null,pe.set(0,0,r.canvas.width,r.canvas.height),me.set(0,0,r.canvas.width,r.canvas.height),t.reset(),i.reset(),n.reset()}}}function Em(r,e,t,i,n,s,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator<"u"&&/OculusBrowser/g.test(navigator.userAgent),l=new Q,h=new WeakMap,d=new Set,p,u=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(P,b){return f?new OffscreenCanvas(P,b):Ir("canvas")}function y(P,b,R){let T=1,v=$(P);if((v.width>R||v.height>R)&&(T=R/Math.max(v.width,v.height)),T<1){if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){let L=Math.floor(T*v.width),I=Math.floor(T*v.height);p===void 0&&(p=m(L,I));let C=b?m(L,I):p;return C.width=L,C.height=I,C.getContext("2d").drawImage(P,0,0,L,I),be("WebGLRenderer: Texture has been resized from ("+v.width+"x"+v.height+") to ("+L+"x"+I+")."),C}return"data"in P&&be("WebGLRenderer: Image in DataTexture is too big ("+v.width+"x"+v.height+")."),P}return P}function g(P){return P.generateMipmaps}function _(P){r.generateMipmap(P)}function x(P){return P.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?r.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function S(P,b,R,T,v,L=!1){if(P!==null){if(r[P]!==void 0)return r[P];be("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let I;T&&(I=e.get("EXT_texture_norm16"),I||be("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let C=b;if(b===r.RED&&(R===r.FLOAT&&(C=r.R32F),R===r.HALF_FLOAT&&(C=r.R16F),R===r.UNSIGNED_BYTE&&(C=r.R8),R===r.UNSIGNED_SHORT&&I&&(C=I.R16_EXT),R===r.SHORT&&I&&(C=I.R16_SNORM_EXT)),b===r.RED_INTEGER&&(R===r.UNSIGNED_BYTE&&(C=r.R8UI),R===r.UNSIGNED_SHORT&&(C=r.R16UI),R===r.UNSIGNED_INT&&(C=r.R32UI),R===r.BYTE&&(C=r.R8I),R===r.SHORT&&(C=r.R16I),R===r.INT&&(C=r.R32I)),b===r.RG&&(R===r.FLOAT&&(C=r.RG32F),R===r.HALF_FLOAT&&(C=r.RG16F),R===r.UNSIGNED_BYTE&&(C=r.RG8),R===r.UNSIGNED_SHORT&&I&&(C=I.RG16_EXT),R===r.SHORT&&I&&(C=I.RG16_SNORM_EXT)),b===r.RG_INTEGER&&(R===r.UNSIGNED_BYTE&&(C=r.RG8UI),R===r.UNSIGNED_SHORT&&(C=r.RG16UI),R===r.UNSIGNED_INT&&(C=r.RG32UI),R===r.BYTE&&(C=r.RG8I),R===r.SHORT&&(C=r.RG16I),R===r.INT&&(C=r.RG32I)),b===r.RGB_INTEGER&&(R===r.UNSIGNED_BYTE&&(C=r.RGB8UI),R===r.UNSIGNED_SHORT&&(C=r.RGB16UI),R===r.UNSIGNED_INT&&(C=r.RGB32UI),R===r.BYTE&&(C=r.RGB8I),R===r.SHORT&&(C=r.RGB16I),R===r.INT&&(C=r.RGB32I)),b===r.RGBA_INTEGER&&(R===r.UNSIGNED_BYTE&&(C=r.RGBA8UI),R===r.UNSIGNED_SHORT&&(C=r.RGBA16UI),R===r.UNSIGNED_INT&&(C=r.RGBA32UI),R===r.BYTE&&(C=r.RGBA8I),R===r.SHORT&&(C=r.RGBA16I),R===r.INT&&(C=r.RGBA32I)),b===r.RGB&&(R===r.UNSIGNED_SHORT&&I&&(C=I.RGB16_EXT),R===r.SHORT&&I&&(C=I.RGB16_SNORM_EXT),R===r.UNSIGNED_INT_5_9_9_9_REV&&(C=r.RGB9_E5),R===r.UNSIGNED_INT_10F_11F_11F_REV&&(C=r.R11F_G11F_B10F)),b===r.RGBA){let H=L?Pr:ke.getTransfer(v);R===r.FLOAT&&(C=r.RGBA32F),R===r.HALF_FLOAT&&(C=r.RGBA16F),R===r.UNSIGNED_BYTE&&(C=H===Ye?r.SRGB8_ALPHA8:r.RGBA8),R===r.UNSIGNED_SHORT&&I&&(C=I.RGBA16_EXT),R===r.SHORT&&I&&(C=I.RGBA16_SNORM_EXT),R===r.UNSIGNED_SHORT_4_4_4_4&&(C=r.RGBA4),R===r.UNSIGNED_SHORT_5_5_5_1&&(C=r.RGB5_A1)}return C!==r.R16F&&C!==r.R32F&&C!==r.RG16F&&C!==r.RG32F&&C!==r.RGBA16F&&C!==r.RGBA32F||e.get("EXT_color_buffer_float"),C}function w(P,b){let R;return P?b===null||b===zi||b===mr?R=r.DEPTH24_STENCIL8:b===ui?R=r.DEPTH32F_STENCIL8:b===pr&&(R=r.DEPTH24_STENCIL8,be("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===zi||b===mr?R=r.DEPTH_COMPONENT24:b===ui?R=r.DEPTH_COMPONENT32F:b===pr&&(R=r.DEPTH_COMPONENT16),R}function M(P,b){return g(P)===!0||P.isFramebufferTexture&&P.minFilter!==Jt&&P.minFilter!==Ct?Math.log2(Math.max(b.width,b.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?b.mipmaps.length:1}function D(P){let b=P.target;b.removeEventListener("dispose",D),function(R){let T=i.get(R);if(T.__webglInit===void 0)return;let v=R.source,L=u.get(v);if(L){let I=L[T.__cacheKey];I.usedTimes--,I.usedTimes===0&&N(R),Object.keys(L).length===0&&u.delete(v)}i.remove(R)}(b),b.isVideoTexture&&h.delete(b),b.isHTMLTexture&&d.delete(b)}function O(P){let b=P.target;b.removeEventListener("dispose",O),function(R){let T=i.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),i.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let L=0;L<6;L++){if(Array.isArray(T.__webglFramebuffer[L]))for(let I=0;I<T.__webglFramebuffer[L].length;I++)r.deleteFramebuffer(T.__webglFramebuffer[L][I]);else r.deleteFramebuffer(T.__webglFramebuffer[L]);T.__webglDepthbuffer&&r.deleteRenderbuffer(T.__webglDepthbuffer[L])}else{if(Array.isArray(T.__webglFramebuffer))for(let L=0;L<T.__webglFramebuffer.length;L++)r.deleteFramebuffer(T.__webglFramebuffer[L]);else r.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&r.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&r.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let L=0;L<T.__webglColorRenderbuffer.length;L++)T.__webglColorRenderbuffer[L]&&r.deleteRenderbuffer(T.__webglColorRenderbuffer[L]);T.__webglDepthRenderbuffer&&r.deleteRenderbuffer(T.__webglDepthRenderbuffer)}let v=R.textures;for(let L=0,I=v.length;L<I;L++){let C=i.get(v[L]);C.__webglTexture&&(r.deleteTexture(C.__webglTexture),a.memory.textures--),i.remove(v[L])}i.remove(R)}(b)}function N(P){let b=i.get(P);r.deleteTexture(b.__webglTexture);let R=P.source;delete u.get(R)[b.__cacheKey],a.memory.textures--}let U=0;function V(P,b){let R=i.get(P);if(P.isVideoTexture&&function(T){let v=a.render.frame;h.get(T)!==v&&(h.set(T,v),T.update())}(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&R.__version!==P.version){let T=P.image;if(T===null)be("WebGLRenderer: Texture marked for update but no image data found.");else{if(T.complete!==!1)return void ie(R,P,b);be("WebGLRenderer: Texture marked for update but image is incomplete")}}else P.isExternalTexture&&(R.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(r.TEXTURE_2D,R.__webglTexture,r.TEXTURE0+b)}let F={[zs]:r.REPEAT,[Ji]:r.CLAMP_TO_EDGE,[Gs]:r.MIRRORED_REPEAT},Y={[Jt]:r.NEAREST,[au]:r.NEAREST_MIPMAP_NEAREST,[es]:r.NEAREST_MIPMAP_LINEAR,[Ct]:r.LINEAR,[Ia]:r.LINEAR_MIPMAP_NEAREST,[Sn]:r.LINEAR_MIPMAP_LINEAR},k={[hu]:r.NEVER,[fu]:r.ALWAYS,[uu]:r.LESS,[Ha]:r.LEQUAL,[du]:r.EQUAL,[ka]:r.GEQUAL,[pu]:r.GREATER,[mu]:r.NOTEQUAL};function z(P,b){if(b.type!==ui||e.has("OES_texture_float_linear")!==!1||b.magFilter!==Ct&&b.magFilter!==Ia&&b.magFilter!==es&&b.magFilter!==Sn&&b.minFilter!==Ct&&b.minFilter!==Ia&&b.minFilter!==es&&b.minFilter!==Sn||be("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(P,r.TEXTURE_WRAP_S,F[b.wrapS]),r.texParameteri(P,r.TEXTURE_WRAP_T,F[b.wrapT]),P!==r.TEXTURE_3D&&P!==r.TEXTURE_2D_ARRAY||r.texParameteri(P,r.TEXTURE_WRAP_R,F[b.wrapR]),r.texParameteri(P,r.TEXTURE_MAG_FILTER,Y[b.magFilter]),r.texParameteri(P,r.TEXTURE_MIN_FILTER,Y[b.minFilter]),b.compareFunction&&(r.texParameteri(P,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(P,r.TEXTURE_COMPARE_FUNC,k[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Jt||b.minFilter!==es&&b.minFilter!==Sn||b.type===ui&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||i.get(b).__currentAnisotropy){let R=e.get("EXT_texture_filter_anisotropic");r.texParameterf(P,R.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,n.getMaxAnisotropy())),i.get(b).__currentAnisotropy=b.anisotropy}}}function q(P,b){let R=!1;P.__webglInit===void 0&&(P.__webglInit=!0,b.addEventListener("dispose",D));let T=b.source,v=u.get(T);v===void 0&&(v={},u.set(T,v));let L=function(I){let C=[];return C.push(I.wrapS),C.push(I.wrapT),C.push(I.wrapR||0),C.push(I.magFilter),C.push(I.minFilter),C.push(I.anisotropy),C.push(I.internalFormat),C.push(I.format),C.push(I.type),C.push(I.generateMipmaps),C.push(I.premultiplyAlpha),C.push(I.flipY),C.push(I.unpackAlignment),C.push(I.colorSpace),C.join()}(b);if(L!==P.__cacheKey){v[L]===void 0&&(v[L]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,R=!0),v[L].usedTimes++;let I=v[P.__cacheKey];I!==void 0&&(v[P.__cacheKey].usedTimes--,I.usedTimes===0&&N(b)),P.__cacheKey=L,P.__webglTexture=v[L].texture}return R}function W(P,b,R){return Math.floor(Math.floor(P/R)/b)}function ie(P,b,R){let T=r.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(T=r.TEXTURE_2D_ARRAY),b.isData3DTexture&&(T=r.TEXTURE_3D);let v=q(P,b),L=b.source;t.bindTexture(T,P.__webglTexture,r.TEXTURE0+R);let I=i.get(L);if(L.version!==I.__version||v===!0){if(t.activeTexture(r.TEXTURE0+R),!(typeof ImageBitmap<"u"&&b.image instanceof ImageBitmap)){let ae=ke.getPrimaries(ke.workingColorSpace),ne=b.colorSpace===En?null:ke.getPrimaries(b.colorSpace),fe=b.colorSpace===En||ae===ne?r.NONE:r.BROWSER_DEFAULT_WEBGL;t.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),t.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),t.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,fe)}t.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment);let C=y(b.image,!1,n.maxTextureSize);C=Ae(b,C);let H=s.convert(b.format,b.colorSpace),X=s.convert(b.type),Z,re=S(b.internalFormat,H,X,b.normalized,b.colorSpace,b.isVideoTexture);z(T,b);let ve=b.mipmaps,ye=b.isVideoTexture!==!0,ue=I.__version===void 0||v===!0,Ce=L.dataReady,te=M(b,C);if(b.isDepthTexture)re=w(b.format===bn,b.type),ue&&(ye?t.texStorage2D(r.TEXTURE_2D,1,re,C.width,C.height):t.texImage2D(r.TEXTURE_2D,0,re,C.width,C.height,0,H,X,null));else if(b.isDataTexture)if(ve.length>0){ye&&ue&&t.texStorage2D(r.TEXTURE_2D,te,re,ve[0].width,ve[0].height);for(let ae=0,ne=ve.length;ae<ne;ae++)Z=ve[ae],ye?Ce&&t.texSubImage2D(r.TEXTURE_2D,ae,0,0,Z.width,Z.height,H,X,Z.data):t.texImage2D(r.TEXTURE_2D,ae,re,Z.width,Z.height,0,H,X,Z.data);b.generateMipmaps=!1}else ye?(ue&&t.texStorage2D(r.TEXTURE_2D,te,re,C.width,C.height),Ce&&function(ae,ne,fe,et){let qe=ae.updateRanges;if(qe.length===0)t.texSubImage2D(r.TEXTURE_2D,0,0,0,ne.width,ne.height,fe,et,ne.data);else{qe.sort((Ge,yt)=>Ge.start-yt.start);let lt=0;for(let Ge=1;Ge<qe.length;Ge++){let yt=qe[lt],tt=qe[Ge],pt=yt.start+yt.count,ot=W(tt.start,ne.width,4),jt=W(yt.start,ne.width,4);tt.start<=pt+1&&ot===jt&&W(tt.start+tt.count-1,ne.width,4)===ot?yt.count=Math.max(yt.count,tt.start+tt.count-yt.start):(++lt,qe[lt]=tt)}qe.length=lt+1;let It=t.getParameter(r.UNPACK_ROW_LENGTH),Se=t.getParameter(r.UNPACK_SKIP_PIXELS),Ze=t.getParameter(r.UNPACK_SKIP_ROWS);t.pixelStorei(r.UNPACK_ROW_LENGTH,ne.width);for(let Ge=0,yt=qe.length;Ge<yt;Ge++){let tt=qe[Ge],pt=Math.floor(tt.start/4),ot=Math.ceil(tt.count/4),jt=pt%ne.width,$t=Math.floor(pt/ne.width),ln=ot;t.pixelStorei(r.UNPACK_SKIP_PIXELS,jt),t.pixelStorei(r.UNPACK_SKIP_ROWS,$t),t.texSubImage2D(r.TEXTURE_2D,0,jt,$t,ln,1,fe,et,ne.data)}ae.clearUpdateRanges(),t.pixelStorei(r.UNPACK_ROW_LENGTH,It),t.pixelStorei(r.UNPACK_SKIP_PIXELS,Se),t.pixelStorei(r.UNPACK_SKIP_ROWS,Ze)}}(b,C,H,X)):t.texImage2D(r.TEXTURE_2D,0,re,C.width,C.height,0,H,X,C.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){ye&&ue&&t.texStorage3D(r.TEXTURE_2D_ARRAY,te,re,ve[0].width,ve[0].height,C.depth);for(let ae=0,ne=ve.length;ae<ne;ae++)if(Z=ve[ae],b.format!==di)if(H!==null)if(ye){if(Ce)if(b.layerUpdates.size>0){let fe=uc(Z.width,Z.height,b.format,b.type);for(let et of b.layerUpdates){let qe=Z.data.subarray(et*fe/Z.data.BYTES_PER_ELEMENT,(et+1)*fe/Z.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,ae,0,0,et,Z.width,Z.height,1,H,qe)}b.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,ae,0,0,0,Z.width,Z.height,C.depth,H,Z.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,ae,re,Z.width,Z.height,C.depth,0,Z.data,0,0);else be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ye?Ce&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,ae,0,0,0,Z.width,Z.height,C.depth,H,X,Z.data):t.texImage3D(r.TEXTURE_2D_ARRAY,ae,re,Z.width,Z.height,C.depth,0,H,X,Z.data)}else{ye&&ue&&t.texStorage2D(r.TEXTURE_2D,te,re,ve[0].width,ve[0].height);for(let ae=0,ne=ve.length;ae<ne;ae++)Z=ve[ae],b.format!==di?H!==null?ye?Ce&&t.compressedTexSubImage2D(r.TEXTURE_2D,ae,0,0,Z.width,Z.height,H,Z.data):t.compressedTexImage2D(r.TEXTURE_2D,ae,re,Z.width,Z.height,0,Z.data):be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ye?Ce&&t.texSubImage2D(r.TEXTURE_2D,ae,0,0,Z.width,Z.height,H,X,Z.data):t.texImage2D(r.TEXTURE_2D,ae,re,Z.width,Z.height,0,H,X,Z.data)}else if(b.isDataArrayTexture)if(ye){if(ue&&t.texStorage3D(r.TEXTURE_2D_ARRAY,te,re,C.width,C.height,C.depth),Ce)if(b.layerUpdates.size>0){let ae=uc(C.width,C.height,b.format,b.type);for(let ne of b.layerUpdates){let fe=C.data.subarray(ne*ae/C.data.BYTES_PER_ELEMENT,(ne+1)*ae/C.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,ne,C.width,C.height,1,H,X,fe)}b.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,C.width,C.height,C.depth,H,X,C.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,re,C.width,C.height,C.depth,0,H,X,C.data);else if(b.isData3DTexture)ye?(ue&&t.texStorage3D(r.TEXTURE_3D,te,re,C.width,C.height,C.depth),Ce&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,C.width,C.height,C.depth,H,X,C.data)):t.texImage3D(r.TEXTURE_3D,0,re,C.width,C.height,C.depth,0,H,X,C.data);else if(b.isFramebufferTexture){if(ue)if(ye)t.texStorage2D(r.TEXTURE_2D,te,re,C.width,C.height);else{let ae=C.width,ne=C.height;for(let fe=0;fe<te;fe++)t.texImage2D(r.TEXTURE_2D,fe,re,ae,ne,0,H,X,null),ae>>=1,ne>>=1}}else if(b.isHTMLTexture){if("texElementImage2D"in r){let ae=r.canvas;if(ae.hasAttribute("layoutsubtree")||ae.setAttribute("layoutsubtree","true"),C.parentNode!==ae)return ae.appendChild(C),d.add(b),ae.onpaint=ne=>{let fe=ne.changedElements;for(let et of d)fe.includes(et.image)&&(et.needsUpdate=!0)},void ae.requestPaint();if(r.texElementImage2D.length===3)r.texElementImage2D(r.TEXTURE_2D,r.RGBA8,C);else{let fe=r.RGBA,et=r.RGBA,qe=r.UNSIGNED_BYTE;r.texElementImage2D(r.TEXTURE_2D,0,fe,et,qe,C)}r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)}}else if(ve.length>0){if(ye&&ue){let ae=$(ve[0]);t.texStorage2D(r.TEXTURE_2D,te,re,ae.width,ae.height)}for(let ae=0,ne=ve.length;ae<ne;ae++)Z=ve[ae],ye?Ce&&t.texSubImage2D(r.TEXTURE_2D,ae,0,0,H,X,Z):t.texImage2D(r.TEXTURE_2D,ae,re,H,X,Z);b.generateMipmaps=!1}else if(ye){if(ue){let ae=$(C);t.texStorage2D(r.TEXTURE_2D,te,re,ae.width,ae.height)}Ce&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,H,X,C)}else t.texImage2D(r.TEXTURE_2D,0,re,H,X,C);g(b)&&_(T),I.__version=L.version,b.onUpdate&&b.onUpdate(b)}P.__version=b.version}function he(P,b,R,T,v,L){let I=s.convert(R.format,R.colorSpace),C=s.convert(R.type),H=S(R.internalFormat,I,C,R.normalized,R.colorSpace),X=i.get(b),Z=i.get(R);if(Z.__renderTarget=b,!X.__hasExternalTextures){let re=Math.max(1,b.width>>L),ve=Math.max(1,b.height>>L);v===r.TEXTURE_3D||v===r.TEXTURE_2D_ARRAY?t.texImage3D(v,L,H,re,ve,b.depth,0,I,C,null):t.texImage2D(v,L,H,re,ve,0,I,C,null)}t.bindFramebuffer(r.FRAMEBUFFER,P),ge(b)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,T,v,Z.__webglTexture,0,se(b)):(v===r.TEXTURE_2D||v>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&v<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,T,v,Z.__webglTexture,L),t.bindFramebuffer(r.FRAMEBUFFER,null)}function Me(P,b,R){if(r.bindRenderbuffer(r.RENDERBUFFER,P),b.depthBuffer){let T=b.depthTexture,v=T&&T.isDepthTexture?T.type:null,L=w(b.stencilBuffer,v),I=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;ge(b)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,se(b),L,b.width,b.height):R?r.renderbufferStorageMultisample(r.RENDERBUFFER,se(b),L,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,L,b.width,b.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,I,r.RENDERBUFFER,P)}else{let T=b.textures;for(let v=0;v<T.length;v++){let L=T[v],I=s.convert(L.format,L.colorSpace),C=s.convert(L.type),H=S(L.internalFormat,I,C,L.normalized,L.colorSpace);ge(b)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,se(b),H,b.width,b.height):R?r.renderbufferStorageMultisample(r.RENDERBUFFER,se(b),H,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,H,b.width,b.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function pe(P,b,R){let T=b.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(r.FRAMEBUFFER,P),!b.depthTexture||!b.depthTexture.isDepthTexture)throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let v=i.get(b.depthTexture);if(v.__renderTarget=b,v.__webglTexture&&b.depthTexture.image.width===b.width&&b.depthTexture.image.height===b.height||(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),T){if(v.__webglInit===void 0&&(v.__webglInit=!0,b.depthTexture.addEventListener("dispose",D)),v.__webglTexture===void 0){v.__webglTexture=r.createTexture(),t.bindTexture(r.TEXTURE_CUBE_MAP,v.__webglTexture),z(r.TEXTURE_CUBE_MAP,b.depthTexture);let X=s.convert(b.depthTexture.format),Z=s.convert(b.depthTexture.type),re;b.depthTexture.format===an?re=r.DEPTH_COMPONENT24:b.depthTexture.format===bn&&(re=r.DEPTH24_STENCIL8);for(let ve=0;ve<6;ve++)r.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,re,b.width,b.height,0,X,Z,null)}}else V(b.depthTexture,0);let L=v.__webglTexture,I=se(b),C=T?r.TEXTURE_CUBE_MAP_POSITIVE_X+R:r.TEXTURE_2D,H=b.depthTexture.format===bn?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;if(b.depthTexture.format===an)ge(b)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,H,C,L,0,I):r.framebufferTexture2D(r.FRAMEBUFFER,H,C,L,0);else{if(b.depthTexture.format!==bn)throw new Error("THREE.WebGLTextures: Unknown depthTexture format.");ge(b)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,H,C,L,0,I):r.framebufferTexture2D(r.FRAMEBUFFER,H,C,L,0)}}function me(P){let b=i.get(P),R=P.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==P.depthTexture){let T=P.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),T){let v=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,T.removeEventListener("dispose",v)};T.addEventListener("dispose",v),b.__depthDisposeCallback=v}b.__boundDepthTexture=T}if(P.depthTexture&&!b.__autoAllocateDepthBuffer)if(R)for(let T=0;T<6;T++)pe(b.__webglFramebuffer[T],P,T);else{let T=P.texture.mipmaps;T&&T.length>0?pe(b.__webglFramebuffer[0],P,0):pe(b.__webglFramebuffer,P,0)}else if(R){b.__webglDepthbuffer=[];for(let T=0;T<6;T++)if(t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[T]),b.__webglDepthbuffer[T]===void 0)b.__webglDepthbuffer[T]=r.createRenderbuffer(),Me(b.__webglDepthbuffer[T],P,!1);else{let v=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,L=b.__webglDepthbuffer[T];r.bindRenderbuffer(r.RENDERBUFFER,L),r.framebufferRenderbuffer(r.FRAMEBUFFER,v,r.RENDERBUFFER,L)}}else{let T=P.texture.mipmaps;if(T&&T.length>0?t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[0]):t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=r.createRenderbuffer(),Me(b.__webglDepthbuffer,P,!1);else{let v=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,L=b.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,L),r.framebufferRenderbuffer(r.FRAMEBUFFER,v,r.RENDERBUFFER,L)}}t.bindFramebuffer(r.FRAMEBUFFER,null)}let ee=[],le=[];function se(P){return Math.min(n.maxSamples,P.samples)}function ge(P){let b=i.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Ae(P,b){let R=P.colorSpace,T=P.format,v=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||R!==Rr&&R!==En&&(ke.getTransfer(R)===Ye?T===di&&v===Xt||be("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ee("WebGLTextures: Unsupported texture color space:",R)),b}function $(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(l.width=P.naturalWidth||P.width,l.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(l.width=P.displayWidth,l.height=P.displayHeight):(l.width=P.width,l.height=P.height),l}this.allocateTextureUnit=function(){let P=U;return P>=n.maxTextures&&be("WebGLTextures: Trying to use "+P+" texture units while this GPU supports only "+n.maxTextures),U+=1,P},this.resetTextureUnits=function(){U=0},this.getTextureUnits=function(){return U},this.setTextureUnits=function(P){U=P},this.setTexture2D=V,this.setTexture2DArray=function(P,b){let R=i.get(P);P.isRenderTargetTexture===!1&&P.version>0&&R.__version!==P.version?ie(R,P,b):(P.isExternalTexture&&(R.__webglTexture=P.sourceTexture?P.sourceTexture:null),t.bindTexture(r.TEXTURE_2D_ARRAY,R.__webglTexture,r.TEXTURE0+b))},this.setTexture3D=function(P,b){let R=i.get(P);P.isRenderTargetTexture===!1&&P.version>0&&R.__version!==P.version?ie(R,P,b):t.bindTexture(r.TEXTURE_3D,R.__webglTexture,r.TEXTURE0+b)},this.setTextureCube=function(P,b){let R=i.get(P);P.isCubeDepthTexture!==!0&&P.version>0&&R.__version!==P.version?function(T,v,L){if(v.image.length!==6)return;let I=q(T,v),C=v.source;t.bindTexture(r.TEXTURE_CUBE_MAP,T.__webglTexture,r.TEXTURE0+L);let H=i.get(C);if(C.version!==H.__version||I===!0){t.activeTexture(r.TEXTURE0+L);let X=ke.getPrimaries(ke.workingColorSpace),Z=v.colorSpace===En?null:ke.getPrimaries(v.colorSpace),re=v.colorSpace===En||X===Z?r.NONE:r.BROWSER_DEFAULT_WEBGL;t.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(r.UNPACK_ALIGNMENT,v.unpackAlignment),t.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,re);let ve=v.isCompressedTexture||v.image[0].isCompressedTexture,ye=v.image[0]&&v.image[0].isDataTexture,ue=[];for(let Se=0;Se<6;Se++)ue[Se]=ve||ye?ye?v.image[Se].image:v.image[Se]:y(v.image[Se],!0,n.maxCubemapSize),ue[Se]=Ae(v,ue[Se]);let Ce=ue[0],te=s.convert(v.format,v.colorSpace),ae=s.convert(v.type),ne=S(v.internalFormat,te,ae,v.normalized,v.colorSpace),fe=v.isVideoTexture!==!0,et=H.__version===void 0||I===!0,qe=C.dataReady,lt,It=M(v,Ce);if(z(r.TEXTURE_CUBE_MAP,v),ve){fe&&et&&t.texStorage2D(r.TEXTURE_CUBE_MAP,It,ne,Ce.width,Ce.height);for(let Se=0;Se<6;Se++){lt=ue[Se].mipmaps;for(let Ze=0;Ze<lt.length;Ze++){let Ge=lt[Ze];v.format!==di?te!==null?fe?qe&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ze,0,0,Ge.width,Ge.height,te,Ge.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ze,ne,Ge.width,Ge.height,0,Ge.data):be("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):fe?qe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ze,0,0,Ge.width,Ge.height,te,ae,Ge.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ze,ne,Ge.width,Ge.height,0,te,ae,Ge.data)}}}else{if(lt=v.mipmaps,fe&&et){lt.length>0&&It++;let Se=$(ue[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,It,ne,Se.width,Se.height)}for(let Se=0;Se<6;Se++)if(ye){fe?qe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,0,0,ue[Se].width,ue[Se].height,te,ae,ue[Se].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,ne,ue[Se].width,ue[Se].height,0,te,ae,ue[Se].data);for(let Ze=0;Ze<lt.length;Ze++){let Ge=lt[Ze].image[Se].image;fe?qe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ze+1,0,0,Ge.width,Ge.height,te,ae,Ge.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ze+1,ne,Ge.width,Ge.height,0,te,ae,Ge.data)}}else{fe?qe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,0,0,te,ae,ue[Se]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,ne,te,ae,ue[Se]);for(let Ze=0;Ze<lt.length;Ze++){let Ge=lt[Ze];fe?qe&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ze+1,0,0,te,ae,Ge.image[Se]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ze+1,ne,te,ae,Ge.image[Se])}}}g(v)&&_(r.TEXTURE_CUBE_MAP),H.__version=C.version,v.onUpdate&&v.onUpdate(v)}T.__version=v.version}(R,P,b):t.bindTexture(r.TEXTURE_CUBE_MAP,R.__webglTexture,r.TEXTURE0+b)},this.rebindTextures=function(P,b,R){let T=i.get(P);b!==void 0&&he(T.__webglFramebuffer,P,P.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),R!==void 0&&me(P)},this.setupRenderTarget=function(P){let b=P.texture,R=i.get(P),T=i.get(b);P.addEventListener("dispose",O);let v=P.textures,L=P.isWebGLCubeRenderTarget===!0,I=v.length>1;if(I||(T.__webglTexture===void 0&&(T.__webglTexture=r.createTexture()),T.__version=b.version,a.memory.textures++),L){R.__webglFramebuffer=[];for(let C=0;C<6;C++)if(b.mipmaps&&b.mipmaps.length>0){R.__webglFramebuffer[C]=[];for(let H=0;H<b.mipmaps.length;H++)R.__webglFramebuffer[C][H]=r.createFramebuffer()}else R.__webglFramebuffer[C]=r.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){R.__webglFramebuffer=[];for(let C=0;C<b.mipmaps.length;C++)R.__webglFramebuffer[C]=r.createFramebuffer()}else R.__webglFramebuffer=r.createFramebuffer();if(I)for(let C=0,H=v.length;C<H;C++){let X=i.get(v[C]);X.__webglTexture===void 0&&(X.__webglTexture=r.createTexture(),a.memory.textures++)}if(P.samples>0&&ge(P)===!1){R.__webglMultisampledFramebuffer=r.createFramebuffer(),R.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,R.__webglMultisampledFramebuffer);for(let C=0;C<v.length;C++){let H=v[C];R.__webglColorRenderbuffer[C]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,R.__webglColorRenderbuffer[C]);let X=s.convert(H.format,H.colorSpace),Z=s.convert(H.type),re=S(H.internalFormat,X,Z,H.normalized,H.colorSpace,P.isXRRenderTarget===!0),ve=se(P);r.renderbufferStorageMultisample(r.RENDERBUFFER,ve,re,P.width,P.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+C,r.RENDERBUFFER,R.__webglColorRenderbuffer[C])}r.bindRenderbuffer(r.RENDERBUFFER,null),P.depthBuffer&&(R.__webglDepthRenderbuffer=r.createRenderbuffer(),Me(R.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(L){t.bindTexture(r.TEXTURE_CUBE_MAP,T.__webglTexture),z(r.TEXTURE_CUBE_MAP,b);for(let C=0;C<6;C++)if(b.mipmaps&&b.mipmaps.length>0)for(let H=0;H<b.mipmaps.length;H++)he(R.__webglFramebuffer[C][H],P,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+C,H);else he(R.__webglFramebuffer[C],P,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+C,0);g(b)&&_(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(I){for(let C=0,H=v.length;C<H;C++){let X=v[C],Z=i.get(X),re=r.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(re=P.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(re,Z.__webglTexture),z(re,X),he(R.__webglFramebuffer,P,X,r.COLOR_ATTACHMENT0+C,re,0),g(X)&&_(re)}t.unbindTexture()}else{let C=r.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(C=P.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(C,T.__webglTexture),z(C,b),b.mipmaps&&b.mipmaps.length>0)for(let H=0;H<b.mipmaps.length;H++)he(R.__webglFramebuffer[H],P,b,r.COLOR_ATTACHMENT0,C,H);else he(R.__webglFramebuffer,P,b,r.COLOR_ATTACHMENT0,C,0);g(b)&&_(C),t.unbindTexture()}P.depthBuffer&&me(P)},this.updateRenderTargetMipmap=function(P){let b=P.textures;for(let R=0,T=b.length;R<T;R++){let v=b[R];if(g(v)){let L=x(P),I=i.get(v).__webglTexture;t.bindTexture(L,I),_(L),t.unbindTexture()}}},this.updateMultisampleRenderTarget=function(P){if(P.samples>0){if(ge(P)===!1){let b=P.textures,R=P.width,T=P.height,v=r.COLOR_BUFFER_BIT,L=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,I=i.get(P),C=b.length>1;if(C)for(let X=0;X<b.length;X++)t.bindFramebuffer(r.FRAMEBUFFER,I.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+X,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,I.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+X,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,I.__webglMultisampledFramebuffer);let H=P.texture.mipmaps;H&&H.length>0?t.bindFramebuffer(r.DRAW_FRAMEBUFFER,I.__webglFramebuffer[0]):t.bindFramebuffer(r.DRAW_FRAMEBUFFER,I.__webglFramebuffer);for(let X=0;X<b.length;X++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(v|=r.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(v|=r.STENCIL_BUFFER_BIT)),C){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,I.__webglColorRenderbuffer[X]);let Z=i.get(b[X]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Z,0)}r.blitFramebuffer(0,0,R,T,0,0,R,T,v,r.NEAREST),c===!0&&(ee.length=0,le.length=0,ee.push(r.COLOR_ATTACHMENT0+X),P.depthBuffer&&P.resolveDepthBuffer===!1&&(ee.push(L),le.push(L),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,le)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,ee))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),C)for(let X=0;X<b.length;X++){t.bindFramebuffer(r.FRAMEBUFFER,I.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+X,r.RENDERBUFFER,I.__webglColorRenderbuffer[X]);let Z=i.get(b[X]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,I.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+X,r.TEXTURE_2D,Z,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,I.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.resolveDepthBuffer===!1&&c){let b=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[b])}}},this.setupDepthRenderbuffer=me,this.setupFrameBufferTexture=he,this.useMultisampledRTT=ge,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function wm(r,e){return{convert:function(t,i=En){let n,s=ke.getTransfer(i);if(t===Xt)return r.UNSIGNED_BYTE;if(t===Da)return r.UNSIGNED_SHORT_4_4_4_4;if(t===Na)return r.UNSIGNED_SHORT_5_5_5_1;if(t===bl)return r.UNSIGNED_INT_5_9_9_9_REV;if(t===Tl)return r.UNSIGNED_INT_10F_11F_11F_REV;if(t===Ml)return r.BYTE;if(t===Sl)return r.SHORT;if(t===pr)return r.UNSIGNED_SHORT;if(t===La)return r.INT;if(t===zi)return r.UNSIGNED_INT;if(t===ui)return r.FLOAT;if(t===bi)return r.HALF_FLOAT;if(t===ou)return r.ALPHA;if(t===lu)return r.RGB;if(t===di)return r.RGBA;if(t===an)return r.DEPTH_COMPONENT;if(t===bn)return r.DEPTH_STENCIL;if(t===El)return r.RED;if(t===Ua)return r.RED_INTEGER;if(t===Tn)return r.RG;if(t===wl)return r.RG_INTEGER;if(t===Al)return r.RGBA_INTEGER;if(t===Oa||t===Fa||t===Ba||t===za)if(s===Ye){if(n=e.get("WEBGL_compressed_texture_s3tc_srgb"),n===null)return null;if(t===Oa)return n.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(t===Fa)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(t===Ba)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(t===za)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else{if(n=e.get("WEBGL_compressed_texture_s3tc"),n===null)return null;if(t===Oa)return n.COMPRESSED_RGB_S3TC_DXT1_EXT;if(t===Fa)return n.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(t===Ba)return n.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(t===za)return n.COMPRESSED_RGBA_S3TC_DXT5_EXT}if(t===Cl||t===Rl||t===Pl||t===Il){if(n=e.get("WEBGL_compressed_texture_pvrtc"),n===null)return null;if(t===Cl)return n.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(t===Rl)return n.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(t===Pl)return n.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(t===Il)return n.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}if(t===Ll||t===Dl||t===Nl||t===Ul||t===Ol||t===Ga||t===Fl){if(n=e.get("WEBGL_compressed_texture_etc"),n===null)return null;if(t===Ll||t===Dl)return s===Ye?n.COMPRESSED_SRGB8_ETC2:n.COMPRESSED_RGB8_ETC2;if(t===Nl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:n.COMPRESSED_RGBA8_ETC2_EAC;if(t===Ul)return n.COMPRESSED_R11_EAC;if(t===Ol)return n.COMPRESSED_SIGNED_R11_EAC;if(t===Ga)return n.COMPRESSED_RG11_EAC;if(t===Fl)return n.COMPRESSED_SIGNED_RG11_EAC}if(t===Bl||t===zl||t===Gl||t===Vl||t===Hl||t===kl||t===Wl||t===Xl||t===jl||t===ql||t===Yl||t===Zl||t===Jl||t===Kl){if(n=e.get("WEBGL_compressed_texture_astc"),n===null)return null;if(t===Bl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:n.COMPRESSED_RGBA_ASTC_4x4_KHR;if(t===zl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:n.COMPRESSED_RGBA_ASTC_5x4_KHR;if(t===Gl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:n.COMPRESSED_RGBA_ASTC_5x5_KHR;if(t===Vl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:n.COMPRESSED_RGBA_ASTC_6x5_KHR;if(t===Hl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:n.COMPRESSED_RGBA_ASTC_6x6_KHR;if(t===kl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:n.COMPRESSED_RGBA_ASTC_8x5_KHR;if(t===Wl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:n.COMPRESSED_RGBA_ASTC_8x6_KHR;if(t===Xl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:n.COMPRESSED_RGBA_ASTC_8x8_KHR;if(t===jl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:n.COMPRESSED_RGBA_ASTC_10x5_KHR;if(t===ql)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:n.COMPRESSED_RGBA_ASTC_10x6_KHR;if(t===Yl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:n.COMPRESSED_RGBA_ASTC_10x8_KHR;if(t===Zl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:n.COMPRESSED_RGBA_ASTC_10x10_KHR;if(t===Jl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:n.COMPRESSED_RGBA_ASTC_12x10_KHR;if(t===Kl)return s===Ye?n.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:n.COMPRESSED_RGBA_ASTC_12x12_KHR}if(t===$l||t===Ql||t===ec){if(n=e.get("EXT_texture_compression_bptc"),n===null)return null;if(t===$l)return s===Ye?n.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:n.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(t===Ql)return n.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(t===ec)return n.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}if(t===tc||t===ic||t===Va||t===nc){if(n=e.get("EXT_texture_compression_rgtc"),n===null)return null;if(t===tc)return n.COMPRESSED_RED_RGTC1_EXT;if(t===ic)return n.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(t===Va)return n.COMPRESSED_RED_GREEN_RGTC2_EXT;if(t===nc)return n.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}return t===mr?r.UNSIGNED_INT_24_8:r[t]!==void 0?r[t]:null}}}var Pc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new Fr(e.texture);e.depthNear===t.depthNear&&e.depthFar===t.depthFar||(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Ut({vertexShader:`
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

}`,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Oe(new Mi(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Ic=class extends si{constructor(e,t){super();let i=this,n=null,s=1,a=null,o="local-floor",c=1,l=null,h=null,d=null,p=null,u=null,f=null,m=typeof XRWebGLBinding<"u",y=new Pc,g={},_=t.getContextAttributes(),x=null,S=null,w=[],M=[],D=new Q,O=null,N=new At;N.viewport=new Je;let U=new At;U.viewport=new Je;let V=[N,U],F=new wa,Y=null,k=null;function z(ee){let le=M.indexOf(ee.inputSource);if(le===-1)return;let se=w[le];se!==void 0&&(se.update(ee.inputSource,ee.frame,l||a),se.dispatchEvent({type:ee.type,data:ee.inputSource}))}function q(){n.removeEventListener("select",z),n.removeEventListener("selectstart",z),n.removeEventListener("selectend",z),n.removeEventListener("squeeze",z),n.removeEventListener("squeezestart",z),n.removeEventListener("squeezeend",z),n.removeEventListener("end",q),n.removeEventListener("inputsourceschange",W);for(let ee=0;ee<w.length;ee++){let le=M[ee];le!==null&&(M[ee]=null,w[ee].disconnect(le))}Y=null,k=null,y.reset();for(let ee in g)delete g[ee];e.setRenderTarget(x),u=null,p=null,d=null,n=null,S=null,me.stop(),i.isPresenting=!1,e.setPixelRatio(O),e.setSize(D.width,D.height,!1),i.dispatchEvent({type:"sessionend"})}function W(ee){for(let le=0;le<ee.removed.length;le++){let se=ee.removed[le],ge=M.indexOf(se);ge>=0&&(M[ge]=null,w[ge].disconnect(se))}for(let le=0;le<ee.added.length;le++){let se=ee.added[le],ge=M.indexOf(se);if(ge===-1){for(let $=0;$<w.length;$++){if($>=M.length){M.push(se),ge=$;break}if(M[$]===null){M[$]=se,ge=$;break}}if(ge===-1)break}let Ae=w[ge];Ae&&Ae.connect(se)}}this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ee){let le=w[ee];return le===void 0&&(le=new Qn,w[ee]=le),le.getTargetRaySpace()},this.getControllerGrip=function(ee){let le=w[ee];return le===void 0&&(le=new Qn,w[ee]=le),le.getGripSpace()},this.getHand=function(ee){let le=w[ee];return le===void 0&&(le=new Qn,w[ee]=le),le.getHandSpace()},this.setFramebufferScaleFactor=function(ee){s=ee,i.isPresenting===!0&&be("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ee){o=ee,i.isPresenting===!0&&be("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(ee){l=ee},this.getBaseLayer=function(){return p!==null?p:u},this.getBinding=function(){return d===null&&m&&(d=new XRWebGLBinding(n,t)),d},this.getFrame=function(){return f},this.getSession=function(){return n},this.setSession=async function(ee){if(n=ee,n!==null){if(x=e.getRenderTarget(),n.addEventListener("select",z),n.addEventListener("selectstart",z),n.addEventListener("selectend",z),n.addEventListener("squeeze",z),n.addEventListener("squeezestart",z),n.addEventListener("squeezeend",z),n.addEventListener("end",q),n.addEventListener("inputsourceschange",W),_.xrCompatible!==!0&&await t.makeXRCompatible(),O=e.getPixelRatio(),e.getSize(D),m&&"createProjectionLayer"in XRWebGLBinding.prototype){let le=null,se=null,ge=null;_.depth&&(ge=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=_.stencil?bn:an,se=_.stencil?mr:zi);let Ae={colorFormat:t.RGBA8,depthFormat:ge,scaleFactor:s};d=this.getBinding(),p=d.createProjectionLayer(Ae),n.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),S=new kt(p.textureWidth,p.textureHeight,{format:di,type:Xt,depthTexture:new Bi(p.textureWidth,p.textureHeight,se,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{let le={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:s};u=new XRWebGLLayer(n,t,le),n.updateRenderState({baseLayer:u}),e.setPixelRatio(1),e.setSize(u.framebufferWidth,u.framebufferHeight,!1),S=new kt(u.framebufferWidth,u.framebufferHeight,{format:di,type:Xt,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await n.requestReferenceSpace(o),me.setContext(n),me.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};let ie=new A,he=new A;function Me(ee,le){le===null?ee.matrixWorld.copy(ee.matrix):ee.matrixWorld.multiplyMatrices(le.matrixWorld,ee.matrix),ee.matrixWorldInverse.copy(ee.matrixWorld).invert()}this.updateCamera=function(ee){if(n===null)return;let le=ee.near,se=ee.far;y.texture!==null&&(y.depthNear>0&&(le=y.depthNear),y.depthFar>0&&(se=y.depthFar)),F.near=U.near=N.near=le,F.far=U.far=N.far=se,Y===F.near&&k===F.far||(n.updateRenderState({depthNear:F.near,depthFar:F.far}),Y=F.near,k=F.far),F.layers.mask=6|ee.layers.mask,N.layers.mask=-5&F.layers.mask,U.layers.mask=-3&F.layers.mask;let ge=ee.parent,Ae=F.cameras;Me(F,ge);for(let $=0;$<Ae.length;$++)Me(Ae[$],ge);Ae.length===2?function($,P,b){ie.setFromMatrixPosition(P.matrixWorld),he.setFromMatrixPosition(b.matrixWorld);let R=ie.distanceTo(he),T=P.projectionMatrix.elements,v=b.projectionMatrix.elements,L=T[14]/(T[10]-1),I=T[14]/(T[10]+1),C=(T[9]+1)/T[5],H=(T[9]-1)/T[5],X=(T[8]-1)/T[0],Z=(v[8]+1)/v[0],re=L*X,ve=L*Z,ye=R/(-X+Z),ue=ye*-X;if(P.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(ue),$.translateZ(ye),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),T[10]===-1)$.projectionMatrix.copy(P.projectionMatrix),$.projectionMatrixInverse.copy(P.projectionMatrixInverse);else{let Ce=L+ye,te=I+ye,ae=re-ue,ne=ve+(R-ue),fe=C*I/te*Ce,et=H*I/te*Ce;$.projectionMatrix.makePerspective(ae,ne,fe,et,Ce,te),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}(F,N,U):F.projectionMatrix.copy(N.projectionMatrix),function($,P,b){b===null?$.matrix.copy(P.matrixWorld):($.matrix.copy(b.matrixWorld),$.matrix.invert(),$.matrix.multiply(P.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(P.projectionMatrix),$.projectionMatrixInverse.copy(P.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=2*Jn*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}(ee,F,ge)},this.getCamera=function(){return F},this.getFoveation=function(){if(p!==null||u!==null)return c},this.setFoveation=function(ee){c=ee,p!==null&&(p.fixedFoveation=ee),u!==null&&u.fixedFoveation!==void 0&&(u.fixedFoveation=ee)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(F)},this.getCameraTexture=function(ee){return g[ee]};let pe=null,me=new Yu;me.setAnimationLoop(function(ee,le){if(h=le.getViewerPose(l||a),f=le,h!==null){let se=h.views;u!==null&&(e.setRenderTargetFramebuffer(S,u.framebuffer),e.setRenderTarget(S));let ge=!1;se.length!==F.cameras.length&&(F.cameras.length=0,ge=!0);for(let $=0;$<se.length;$++){let P=se[$],b=null;if(u!==null)b=u.getViewport(P);else{let T=d.getViewSubImage(p,P);b=T.viewport,$===0&&(e.setRenderTargetTextures(S,T.colorTexture,T.depthStencilTexture),e.setRenderTarget(S))}let R=V[$];R===void 0&&(R=new At,R.layers.enable($),R.viewport=new Je,V[$]=R),R.matrix.fromArray(P.transform.matrix),R.matrix.decompose(R.position,R.quaternion,R.scale),R.projectionMatrix.fromArray(P.projectionMatrix),R.projectionMatrixInverse.copy(R.projectionMatrix).invert(),R.viewport.set(b.x,b.y,b.width,b.height),$===0&&(F.matrix.copy(R.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale)),ge===!0&&F.cameras.push(R)}let Ae=n.enabledFeatures;if(Ae&&Ae.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&m){d=i.getBinding();let $=d.getDepthInformation(se[0]);$&&$.isValid&&$.texture&&y.init($,n.renderState)}if(Ae&&Ae.includes("camera-access")&&m){e.state.unbindTexture(),d=i.getBinding();for(let $=0;$<se.length;$++){let P=se[$].camera;if(P){let b=g[P];b||(b=new Fr,g[P]=b);let R=d.getCameraImage(P);b.sourceTexture=R}}}}for(let se=0;se<w.length;se++){let ge=M[se],Ae=w[se];ge!==null&&Ae!==void 0&&Ae.update(ge,le,l||a)}pe&&pe(ee,le),le.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:le}),f=null}),this.setAnimationLoop=function(ee){pe=ee},this.dispose=function(){}}},Am=new Fe,ed=new Le;function Cm(r,e){function t(n,s){n.matrixAutoUpdate===!0&&n.updateMatrix(),s.value.copy(n.matrix)}function i(n,s){n.opacity.value=s.opacity,s.color&&n.diffuse.value.copy(s.color),s.emissive&&n.emissive.value.copy(s.emissive).multiplyScalar(s.emissiveIntensity),s.map&&(n.map.value=s.map,t(s.map,n.mapTransform)),s.alphaMap&&(n.alphaMap.value=s.alphaMap,t(s.alphaMap,n.alphaMapTransform)),s.bumpMap&&(n.bumpMap.value=s.bumpMap,t(s.bumpMap,n.bumpMapTransform),n.bumpScale.value=s.bumpScale,s.side===Bt&&(n.bumpScale.value*=-1)),s.normalMap&&(n.normalMap.value=s.normalMap,t(s.normalMap,n.normalMapTransform),n.normalScale.value.copy(s.normalScale),s.side===Bt&&n.normalScale.value.negate()),s.displacementMap&&(n.displacementMap.value=s.displacementMap,t(s.displacementMap,n.displacementMapTransform),n.displacementScale.value=s.displacementScale,n.displacementBias.value=s.displacementBias),s.emissiveMap&&(n.emissiveMap.value=s.emissiveMap,t(s.emissiveMap,n.emissiveMapTransform)),s.specularMap&&(n.specularMap.value=s.specularMap,t(s.specularMap,n.specularMapTransform)),s.alphaTest>0&&(n.alphaTest.value=s.alphaTest);let a=e.get(s),o=a.envMap,c=a.envMapRotation;o&&(n.envMap.value=o,n.envMapRotation.value.setFromMatrix4(Am.makeRotationFromEuler(c)).transpose(),o.isCubeTexture&&o.isRenderTargetTexture===!1&&n.envMapRotation.value.premultiply(ed),n.reflectivity.value=s.reflectivity,n.ior.value=s.ior,n.refractionRatio.value=s.refractionRatio),s.lightMap&&(n.lightMap.value=s.lightMap,n.lightMapIntensity.value=s.lightMapIntensity,t(s.lightMap,n.lightMapTransform)),s.aoMap&&(n.aoMap.value=s.aoMap,n.aoMapIntensity.value=s.aoMapIntensity,t(s.aoMap,n.aoMapTransform))}return{refreshFogUniforms:function(n,s){s.color.getRGB(n.fogColor.value,cc(r)),s.isFog?(n.fogNear.value=s.near,n.fogFar.value=s.far):s.isFogExp2&&(n.fogDensity.value=s.density)},refreshMaterialUniforms:function(n,s,a,o,c){s.isNodeMaterial?s.uniformsNeedUpdate=!1:s.isMeshBasicMaterial?i(n,s):s.isMeshLambertMaterial?(i(n,s),s.envMap&&(n.envMapIntensity.value=s.envMapIntensity)):s.isMeshToonMaterial?(i(n,s),function(l,h){h.gradientMap&&(l.gradientMap.value=h.gradientMap)}(n,s)):s.isMeshPhongMaterial?(i(n,s),function(l,h){l.specular.value.copy(h.specular),l.shininess.value=Math.max(h.shininess,1e-4)}(n,s),s.envMap&&(n.envMapIntensity.value=s.envMapIntensity)):s.isMeshStandardMaterial?(i(n,s),function(l,h){l.metalness.value=h.metalness,h.metalnessMap&&(l.metalnessMap.value=h.metalnessMap,t(h.metalnessMap,l.metalnessMapTransform)),l.roughness.value=h.roughness,h.roughnessMap&&(l.roughnessMap.value=h.roughnessMap,t(h.roughnessMap,l.roughnessMapTransform)),h.envMap&&(l.envMapIntensity.value=h.envMapIntensity)}(n,s),s.isMeshPhysicalMaterial&&function(l,h,d){l.ior.value=h.ior,h.sheen>0&&(l.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),l.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(l.sheenColorMap.value=h.sheenColorMap,t(h.sheenColorMap,l.sheenColorMapTransform)),h.sheenRoughnessMap&&(l.sheenRoughnessMap.value=h.sheenRoughnessMap,t(h.sheenRoughnessMap,l.sheenRoughnessMapTransform))),h.clearcoat>0&&(l.clearcoat.value=h.clearcoat,l.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(l.clearcoatMap.value=h.clearcoatMap,t(h.clearcoatMap,l.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(l.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,t(h.clearcoatRoughnessMap,l.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(l.clearcoatNormalMap.value=h.clearcoatNormalMap,t(h.clearcoatNormalMap,l.clearcoatNormalMapTransform),l.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===Bt&&l.clearcoatNormalScale.value.negate())),h.dispersion>0&&(l.dispersion.value=h.dispersion),h.iridescence>0&&(l.iridescence.value=h.iridescence,l.iridescenceIOR.value=h.iridescenceIOR,l.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],l.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(l.iridescenceMap.value=h.iridescenceMap,t(h.iridescenceMap,l.iridescenceMapTransform)),h.iridescenceThicknessMap&&(l.iridescenceThicknessMap.value=h.iridescenceThicknessMap,t(h.iridescenceThicknessMap,l.iridescenceThicknessMapTransform))),h.transmission>0&&(l.transmission.value=h.transmission,l.transmissionSamplerMap.value=d.texture,l.transmissionSamplerSize.value.set(d.width,d.height),h.transmissionMap&&(l.transmissionMap.value=h.transmissionMap,t(h.transmissionMap,l.transmissionMapTransform)),l.thickness.value=h.thickness,h.thicknessMap&&(l.thicknessMap.value=h.thicknessMap,t(h.thicknessMap,l.thicknessMapTransform)),l.attenuationDistance.value=h.attenuationDistance,l.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(l.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(l.anisotropyMap.value=h.anisotropyMap,t(h.anisotropyMap,l.anisotropyMapTransform))),l.specularIntensity.value=h.specularIntensity,l.specularColor.value.copy(h.specularColor),h.specularColorMap&&(l.specularColorMap.value=h.specularColorMap,t(h.specularColorMap,l.specularColorMapTransform)),h.specularIntensityMap&&(l.specularIntensityMap.value=h.specularIntensityMap,t(h.specularIntensityMap,l.specularIntensityMapTransform))}(n,s,c)):s.isMeshMatcapMaterial?(i(n,s),function(l,h){h.matcap&&(l.matcap.value=h.matcap)}(n,s)):s.isMeshDepthMaterial?i(n,s):s.isMeshDistanceMaterial?(i(n,s),function(l,h){let d=e.get(h).light;l.referencePosition.value.setFromMatrixPosition(d.matrixWorld),l.nearDistance.value=d.shadow.camera.near,l.farDistance.value=d.shadow.camera.far}(n,s)):s.isMeshNormalMaterial?i(n,s):s.isLineBasicMaterial?(function(l,h){l.diffuse.value.copy(h.color),l.opacity.value=h.opacity,h.map&&(l.map.value=h.map,t(h.map,l.mapTransform))}(n,s),s.isLineDashedMaterial&&function(l,h){l.dashSize.value=h.dashSize,l.totalSize.value=h.dashSize+h.gapSize,l.scale.value=h.scale}(n,s)):s.isPointsMaterial?function(l,h,d,p){l.diffuse.value.copy(h.color),l.opacity.value=h.opacity,l.size.value=h.size*d,l.scale.value=.5*p,h.map&&(l.map.value=h.map,t(h.map,l.uvTransform)),h.alphaMap&&(l.alphaMap.value=h.alphaMap,t(h.alphaMap,l.alphaMapTransform)),h.alphaTest>0&&(l.alphaTest.value=h.alphaTest)}(n,s,a,o):s.isSpriteMaterial?function(l,h){l.diffuse.value.copy(h.color),l.opacity.value=h.opacity,l.rotation.value=h.rotation,h.map&&(l.map.value=h.map,t(h.map,l.mapTransform)),h.alphaMap&&(l.alphaMap.value=h.alphaMap,t(h.alphaMap,l.alphaMapTransform)),h.alphaTest>0&&(l.alphaTest.value=h.alphaTest)}(n,s):s.isShadowMaterial?(n.color.value.copy(s.color),n.opacity.value=s.opacity):s.isShaderMaterial&&(s.uniformsNeedUpdate=!1)}}}function Rm(r,e,t,i){let n={},s={},a=[],o=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function c(p,u,f,m){if(function(y,g,_,x){let S=y.value,w=g+"_"+_;if(x[w]===void 0)return typeof S=="number"||typeof S=="boolean"?x[w]=S:ArrayBuffer.isView(S)?x[w]=S.slice():x[w]=S.clone(),!0;{let M=x[w];if(typeof S=="number"||typeof S=="boolean"){if(M!==S)return x[w]=S,!0}else{if(ArrayBuffer.isView(S))return!0;if(M.equals(S)===!1)return M.copy(S),!0}}return!1}(p,u,f,m)===!0){let y=p.__offset,g=p.value;if(Array.isArray(g)){let _=0;for(let x=0;x<g.length;x++){let S=g[x],w=h(S);l(S,p.__data,_),typeof S=="number"||typeof S=="boolean"||S.isMatrix3||ArrayBuffer.isView(S)||(_+=w.storage/Float32Array.BYTES_PER_ELEMENT)}}else l(g,p.__data,0);r.bufferSubData(r.UNIFORM_BUFFER,y,p.__data)}}function l(p,u,f){typeof p=="number"||typeof p=="boolean"?u[0]=p:p.isMatrix3?(u[0]=p.elements[0],u[1]=p.elements[1],u[2]=p.elements[2],u[3]=0,u[4]=p.elements[3],u[5]=p.elements[4],u[6]=p.elements[5],u[7]=0,u[8]=p.elements[6],u[9]=p.elements[7],u[10]=p.elements[8],u[11]=0):ArrayBuffer.isView(p)?u.set(new p.constructor(p.buffer,p.byteOffset,u.length)):p.toArray(u,f)}function h(p){let u={boundary:0,storage:0};return typeof p=="number"||typeof p=="boolean"?(u.boundary=4,u.storage=4):p.isVector2?(u.boundary=8,u.storage=8):p.isVector3||p.isColor?(u.boundary=16,u.storage=12):p.isVector4?(u.boundary=16,u.storage=16):p.isMatrix3?(u.boundary=48,u.storage=48):p.isMatrix4?(u.boundary=64,u.storage=64):p.isTexture?be("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(p)?(u.boundary=16,u.storage=p.byteLength):be("WebGLRenderer: Unsupported uniform value type.",p),u}function d(p){let u=p.target;u.removeEventListener("dispose",d);let f=a.indexOf(u.__bindingPointIndex);a.splice(f,1),r.deleteBuffer(n[u.id]),delete n[u.id],delete s[u.id]}return{bind:function(p,u){let f=u.program;i.uniformBlockBinding(p,f)},update:function(p,u){let f=n[p.id];f===void 0&&(function(g){let _=g.uniforms,x=0,S=16;for(let M=0,D=_.length;M<D;M++){let O=Array.isArray(_[M])?_[M]:[_[M]];for(let N=0,U=O.length;N<U;N++){let V=O[N],F=Array.isArray(V.value)?V.value:[V.value];for(let Y=0,k=F.length;Y<k;Y++){let z=h(F[Y]),q=x%S,W=q%z.boundary,ie=q+W;x+=W,ie!==0&&S-ie<z.storage&&(x+=S-ie),V.__data=new Float32Array(z.storage/Float32Array.BYTES_PER_ELEMENT),V.__offset=x,x+=z.storage}}}let w=x%S;w>0&&(x+=S-w),g.__size=x,g.__cache={}}(p),f=function(g){let _=function(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return Ee("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}();g.__bindingPointIndex=_;let x=r.createBuffer(),S=g.__size,w=g.usage;return r.bindBuffer(r.UNIFORM_BUFFER,x),r.bufferData(r.UNIFORM_BUFFER,S,w),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,_,x),x}(p),n[p.id]=f,p.addEventListener("dispose",d));let m=u.program;i.updateUBOMapping(p,m);let y=e.render.frame;s[p.id]!==y&&(function(g){let _=n[g.id],x=g.uniforms,S=g.__cache;r.bindBuffer(r.UNIFORM_BUFFER,_);for(let w=0,M=x.length;w<M;w++){let D=x[w];if(Array.isArray(D))for(let O=0,N=D.length;O<N;O++)c(D[O],w,O,S);else c(D,w,0,S)}r.bindBuffer(r.UNIFORM_BUFFER,null)}(p),s[p.id]=y)},dispose:function(){for(let p in n)r.deleteBuffer(n[p]);a=[],n={},s={}}}}ed.set(-1,0,0,0,1,0,0,0,1);var Pm=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Ti=null,Za=class{constructor(e={}){let{canvas:t=gu(),context:i=null,depth:n=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:p=!1,outputBufferType:u=Xt}=e,f;if(this.isWebGLRenderer=!0,i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=a;let m=u,y=new Set([Al,wl,Ua]),g=new Set([Xt,zi,pr,mr,Da,Na]),_=new Uint32Array(4),x=new Int32Array(4),S=new A,w=null,M=null,D=[],O=[],N=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=hi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let U=this,V=!1,F=null,Y=null,k=null,z=null;this._outputColorSpace=Dt;let q=0,W=0,ie=null,he=-1,Me=null,pe=new Je,me=new Je,ee=null,le=new Ue(0),se=0,ge=t.width,Ae=t.height,$=1,P=null,b=null,R=new Je(0,0,ge,Ae),T=new Je(0,0,ge,Ae),v=!1,L=new Fi,I=!1,C=!1,H=new Fe,X=new A,Z=new Je,re={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ve=!1;function ye(){return ie===null?$:1}let ue,Ce,te,ae,ne,fe,et,qe,lt,It,Se,Ze,Ge,yt,tt,pt,ot,jt,$t,ln,pi,Gi,as,B=i;function Uc(E,G){return t.getContext(E,G)}try{let E={alpha:!0,depth:n,stencil:s,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Bs}`),t.addEventListener("webglcontextlost",Fc,!1),t.addEventListener("webglcontextrestored",Bc,!1),t.addEventListener("webglcontextcreationerror",zc,!1),B===null){let G="webgl2";if(B=Uc(G,E),B===null)throw Uc(G)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(E){throw Ee("WebGLRenderer: "+E.message),E}function Oc(){ue=new np(B),ue.init(),pi=new wm(B,ue),Ce=new Qd(B,ue,e,pi),te=new Tm(B,ue),Ce.reversedDepthBuffer&&p&&te.buffers.depth.setReversed(!0),Y=B.createFramebuffer(),k=B.createFramebuffer(),z=B.createFramebuffer(),ae=new ap(B),ne=new pm,fe=new Em(B,ue,te,ne,Ce,pi,ae),et=new ip(U),qe=new Yd(B),Gi=new Kd(B,qe),lt=new rp(B,qe,ae,Gi),It=new lp(B,lt,qe,Gi,ae),jt=new op(B,Ce,fe),tt=new ep(ne),Se=new dm(U,et,ue,Ce,Gi,tt),Ze=new Cm(U,ne),Ge=new fm,yt=new xm(ue),ot=new Jd(U,et,te,It,f,c),pt=new bm(U,It,Ce),as=new Rm(B,ae,Ce,te),$t=new $d(B,ue,ae),ln=new sp(B,ue,ae),ae.programs=Se.programs,U.capabilities=Ce,U.extensions=ue,U.properties=ne,U.renderLists=Ge,U.shadowMap=pt,U.state=te,U.info=ae}Oc(),m!==Xt&&(N=new hp(m,t.width,t.height,o,n,s));let ct=new Ic(U,B);function Fc(E){E.preventDefault(),ac("WebGLRenderer: Context Lost."),V=!0}function Bc(){ac("WebGLRenderer: Context Restored."),V=!1;let E=ae.autoReset,G=pt.enabled,j=pt.autoUpdate,K=pt.needsUpdate,J=pt.type;Oc(),ae.autoReset=E,pt.enabled=G,pt.autoUpdate=j,pt.needsUpdate=K,pt.type=J}function zc(E){Ee("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Gc(E){let G=E.target;G.removeEventListener("dispose",Gc),function(j){(function(K){let J=ne.get(K).programs;J!==void 0&&(J.forEach(function(oe){Se.releaseProgram(oe)}),K.isShaderMaterial&&Se.releaseShaderCache(K))})(j),ne.remove(j)}(G)}function Vc(E,G,j){E.transparent===!0&&E.side===Tt&&E.forceSinglePass===!1?(E.side=Bt,E.needsUpdate=!0,ls(E,G,j),E.side=sn,E.needsUpdate=!0,ls(E,G,j),E.side=Tt):ls(E,G,j)}this.xr=ct,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let E=ue.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=ue.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return $},this.setPixelRatio=function(E){E!==void 0&&($=E,this.setSize(ge,Ae,!1))},this.getSize=function(E){return E.set(ge,Ae)},this.setSize=function(E,G,j=!0){ct.isPresenting?be("WebGLRenderer: Can't change size while VR device is presenting."):(ge=E,Ae=G,t.width=Math.floor(E*$),t.height=Math.floor(G*$),j===!0&&(t.style.width=E+"px",t.style.height=G+"px"),N!==null&&N.setSize(t.width,t.height),this.setViewport(0,0,E,G))},this.getDrawingBufferSize=function(E){return E.set(ge*$,Ae*$).floor()},this.setDrawingBufferSize=function(E,G,j){ge=E,Ae=G,$=j,t.width=Math.floor(E*j),t.height=Math.floor(G*j),this.setViewport(0,0,E,G)},this.setEffects=function(E){if(m!==Xt){if(E){for(let G=0;G<E.length;G++)if(E[G].isOutputPass===!0){be("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}N.setEffects(E||[])}else Ee("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.")},this.getCurrentViewport=function(E){return E.copy(pe)},this.getViewport=function(E){return E.copy(R)},this.setViewport=function(E,G,j,K){E.isVector4?R.set(E.x,E.y,E.z,E.w):R.set(E,G,j,K),te.viewport(pe.copy(R).multiplyScalar($).round())},this.getScissor=function(E){return E.copy(T)},this.setScissor=function(E,G,j,K){E.isVector4?T.set(E.x,E.y,E.z,E.w):T.set(E,G,j,K),te.scissor(me.copy(T).multiplyScalar($).round())},this.getScissorTest=function(){return v},this.setScissorTest=function(E){te.setScissorTest(v=E)},this.setOpaqueSort=function(E){P=E},this.setTransparentSort=function(E){b=E},this.getClearColor=function(E){return E.copy(ot.getClearColor())},this.setClearColor=function(){ot.setClearColor(...arguments)},this.getClearAlpha=function(){return ot.getClearAlpha()},this.setClearAlpha=function(){ot.setClearAlpha(...arguments)},this.clear=function(E=!0,G=!0,j=!0){let K=0;if(E){let J=!1;if(ie!==null){let oe=ie.texture.format;J=y.has(oe)}if(J){let oe=ie.texture.type,de=g.has(oe),_e=ot.getClearColor(),xe=ot.getClearAlpha(),Re=_e.r,We=_e.g,Xe=_e.b;de?(_[0]=Re,_[1]=We,_[2]=Xe,_[3]=xe,B.clearBufferuiv(B.COLOR,0,_)):(x[0]=Re,x[1]=We,x[2]=Xe,x[3]=xe,B.clearBufferiv(B.COLOR,0,x))}else K|=B.COLOR_BUFFER_BIT}G&&(K|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),j&&(K|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),K!==0&&B.clear(K)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),F=E},this.dispose=function(){t.removeEventListener("webglcontextlost",Fc,!1),t.removeEventListener("webglcontextrestored",Bc,!1),t.removeEventListener("webglcontextcreationerror",zc,!1),ot.dispose(),Ge.dispose(),yt.dispose(),ne.dispose(),et.dispose(),It.dispose(),Gi.dispose(),as.dispose(),Se.dispose(),ct.dispose(),ct.removeEventListener("sessionstart",Hc),ct.removeEventListener("sessionend",kc),cn.stop()},this.renderBufferDirect=function(E,G,j,K,J,oe){G===null&&(G=re);let de=J.isMesh&&J.matrixWorld.determinantAffine()<0,_e=function(He,rt,xt,Pe,Ne){rt.isScene!==!0&&(rt=re),fe.resetTextureUnits();let Qt=rt.fog,oo=Pe.isMeshStandardMaterial||Pe.isMeshLambertMaterial||Pe.isMeshPhongMaterial?rt.environment:null,cs=ie===null?U.outputColorSpace:ie.isXRRenderTarget===!0?ie.texture.colorSpace:ke.workingColorSpace,vr=Pe.isMeshStandardMaterial||Pe.isMeshLambertMaterial&&!Pe.envMap||Pe.isMeshPhongMaterial&&!Pe.envMap,mi=et.get(Pe.envMap||oo,vr),Pn=Pe.vertexColors===!0&&!!xt.attributes.color&&xt.attributes.color.itemSize===4,wi=!!xt.attributes.tangent&&(!!Pe.normalMap||Pe.anisotropy>0),lo=!!xt.morphAttributes.position,In=!!xt.morphAttributes.normal,ud=!!xt.morphAttributes.color,Zc=hi;Pe.toneMapped&&(ie!==null&&ie.isXRRenderTarget!==!0||(Zc=U.toneMapping));let Jc=xt.morphAttributes.position||xt.morphAttributes.normal||xt.morphAttributes.color,dd=Jc!==void 0?Jc.length:0,Ie=ne.get(Pe),hn=M.state.lights;if(I===!0&&(C===!0||He!==Me)){let ut=He===Me&&Pe.id===he;tt.setState(Pe,He,ut)}let ei=!1;Pe.version===Ie.__version?Ie.needsLights&&Ie.lightsStateVersion!==hn.state.version||Ie.outputColorSpace!==cs||Ne.isBatchedMesh&&Ie.batching===!1?ei=!0:Ne.isBatchedMesh||Ie.batching!==!0?Ne.isBatchedMesh&&Ie.batchingColor===!0&&Ne.colorTexture===null||Ne.isBatchedMesh&&Ie.batchingColor===!1&&Ne.colorTexture!==null||Ne.isInstancedMesh&&Ie.instancing===!1?ei=!0:Ne.isInstancedMesh||Ie.instancing!==!0?Ne.isSkinnedMesh&&Ie.skinning===!1?ei=!0:Ne.isSkinnedMesh||Ie.skinning!==!0?Ne.isInstancedMesh&&Ie.instancingColor===!0&&Ne.instanceColor===null||Ne.isInstancedMesh&&Ie.instancingColor===!1&&Ne.instanceColor!==null||Ne.isInstancedMesh&&Ie.instancingMorph===!0&&Ne.morphTexture===null||Ne.isInstancedMesh&&Ie.instancingMorph===!1&&Ne.morphTexture!==null||Ie.envMap!==mi||Pe.fog===!0&&Ie.fog!==Qt?ei=!0:Ie.numClippingPlanes===void 0||Ie.numClippingPlanes===tt.numPlanes&&Ie.numIntersection===tt.numIntersection?(Ie.vertexAlphas!==Pn||Ie.vertexTangents!==wi||Ie.morphTargets!==lo||Ie.morphNormals!==In||Ie.morphColors!==ud||Ie.toneMapping!==Zc||Ie.morphTargetsCount!==dd||!!Ie.lightProbeGrid!=M.state.lightProbeGridArray.length>0)&&(ei=!0):ei=!0:ei=!0:ei=!0:ei=!0:(ei=!0,Ie.__version=Pe.version);let Vi=Ie.currentProgram;ei===!0&&(Vi=ls(Pe,rt,Ne),F&&Pe.isNodeMaterial&&F.onUpdateProgram(Pe,Vi,Ie));let Kc=!1,Ln=!1,co=!1,st=Vi.getUniforms(),qt=Ie.uniforms;if(te.useProgram(Vi.program)&&(Kc=!0,Ln=!0,co=!0),Pe.id!==he&&(he=Pe.id,Ln=!0),Ie.needsLights){let ut=function(gi,uo){if(gi.length===0)return null;if(gi.length===1)return gi[0].texture!==null?gi[0]:null;S.setFromMatrixPosition(uo.matrixWorld);for(let Dn=0,pd=gi.length;Dn<pd;Dn++){let po=gi[Dn];if(po.texture!==null&&po.boundingBox.containsPoint(S))return po}return null}(M.state.lightProbeGridArray,Ne);Ie.lightProbeGrid!==ut&&(Ie.lightProbeGrid=ut,Ln=!0)}if(Kc||Me!==He){te.buffers.depth.getReversed()&&He.reversedDepth!==!0&&(He._reversedDepth=!0,He.updateProjectionMatrix()),st.setValue(B,"projectionMatrix",He.projectionMatrix),st.setValue(B,"viewMatrix",He.matrixWorldInverse);let ut=st.map.cameraPosition;ut!==void 0&&ut.setValue(B,X.setFromMatrixPosition(He.matrixWorld)),Ce.logarithmicDepthBuffer&&st.setValue(B,"logDepthBufFC",2/(Math.log(He.far+1)/Math.LN2)),(Pe.isMeshPhongMaterial||Pe.isMeshToonMaterial||Pe.isMeshLambertMaterial||Pe.isMeshBasicMaterial||Pe.isMeshStandardMaterial||Pe.isShaderMaterial)&&st.setValue(B,"isOrthographic",He.isOrthographicCamera===!0),Me!==He&&(Me=He,Ln=!0,co=!0)}if(Ie.needsLights&&(hn.state.directionalShadowMap.length>0&&st.setValue(B,"directionalShadowMap",hn.state.directionalShadowMap,fe),hn.state.spotShadowMap.length>0&&st.setValue(B,"spotShadowMap",hn.state.spotShadowMap,fe),hn.state.pointShadowMap.length>0&&st.setValue(B,"pointShadowMap",hn.state.pointShadowMap,fe)),Ne.isSkinnedMesh){st.setOptional(B,Ne,"bindMatrix"),st.setOptional(B,Ne,"bindMatrixInverse");let ut=Ne.skeleton;ut&&(ut.boneTexture===null&&ut.computeBoneTexture(),st.setValue(B,"boneTexture",ut.boneTexture,fe))}Ne.isBatchedMesh&&(st.setOptional(B,Ne,"batchingTexture"),st.setValue(B,"batchingTexture",Ne._matricesTexture,fe),st.setOptional(B,Ne,"batchingIdTexture"),st.setValue(B,"batchingIdTexture",Ne._indirectTexture,fe),st.setOptional(B,Ne,"batchingColorTexture"),Ne._colorsTexture!==null&&st.setValue(B,"batchingColorTexture",Ne._colorsTexture,fe));let ho=xt.morphAttributes;if(ho.position===void 0&&ho.normal===void 0&&ho.color===void 0||jt.update(Ne,xt,Vi),(Ln||Ie.receiveShadow!==Ne.receiveShadow)&&(Ie.receiveShadow=Ne.receiveShadow,st.setValue(B,"receiveShadow",Ne.receiveShadow)),(Pe.isMeshStandardMaterial||Pe.isMeshLambertMaterial||Pe.isMeshPhongMaterial)&&Pe.envMap===null&&rt.environment!==null&&(qt.envMapIntensity.value=rt.environmentIntensity),qt.dfgLUT!==void 0&&(qt.dfgLUT.value=(Ti===null&&(Ti=new Xs(Pm,16,16,Tn,bi),Ti.name="DFG_LUT",Ti.minFilter=Ct,Ti.magFilter=Ct,Ti.wrapS=Ji,Ti.wrapT=Ji,Ti.generateMipmaps=!1,Ti.needsUpdate=!0),Ti)),Ln){if(st.setValue(B,"toneMappingExposure",U.toneMappingExposure),Ie.needsLights&&(ti=co,(fi=qt).ambientLightColor.needsUpdate=ti,fi.lightProbe.needsUpdate=ti,fi.directionalLights.needsUpdate=ti,fi.directionalLightShadows.needsUpdate=ti,fi.pointLights.needsUpdate=ti,fi.pointLightShadows.needsUpdate=ti,fi.spotLights.needsUpdate=ti,fi.spotLightShadows.needsUpdate=ti,fi.rectAreaLights.needsUpdate=ti,fi.hemisphereLights.needsUpdate=ti),Qt&&Pe.fog===!0&&Ze.refreshFogUniforms(qt,Qt),Ze.refreshMaterialUniforms(qt,Pe,$,Ae,M.state.transmissionRenderTarget[He.id]),Ie.needsLights&&Ie.lightProbeGrid){let ut=Ie.lightProbeGrid;qt.probesSH.value=ut.texture,qt.probesMin.value.copy(ut.boundingBox.min),qt.probesMax.value.copy(ut.boundingBox.max),qt.probesResolution.value.copy(ut.resolution)}gr.upload(B,qc(Ie),qt,fe)}var fi,ti;if(Pe.isShaderMaterial&&Pe.uniformsNeedUpdate===!0&&(gr.upload(B,qc(Ie),qt,fe),Pe.uniformsNeedUpdate=!1),Pe.isSpriteMaterial&&st.setValue(B,"center",Ne.center),st.setValue(B,"modelViewMatrix",Ne.modelViewMatrix),st.setValue(B,"normalMatrix",Ne.normalMatrix),st.setValue(B,"modelMatrix",Ne.matrixWorld),Pe.uniformsGroups!==void 0){let ut=Pe.uniformsGroups;for(let gi=0,uo=ut.length;gi<uo;gi++){let Dn=ut[gi];as.update(Dn,Vi),as.bind(Dn,Vi)}}return Vi}(E,G,j,K,J);te.setMaterial(K,de);let xe=j.index,Re=1;if(K.wireframe===!0){if(xe=lt.getWireframeAttribute(j),xe===void 0)return;Re=2}let We=j.drawRange,Xe=j.attributes.position,we=We.start*Re,je=(We.start+We.count)*Re;oe!==null&&(we=Math.max(we,oe.start*Re),je=Math.min(je,(oe.start+oe.count)*Re)),xe!==null?(we=Math.max(we,0),je=Math.min(je,xe.count)):Xe!=null&&(we=Math.max(we,0),je=Math.min(je,Xe.count));let mt=je-we;if(mt<0||mt===1/0)return;let ht;Gi.setup(J,K,_e,j,xe);let nt=$t;if(xe!==null&&(ht=qe.get(xe),nt=ln,nt.setIndex(ht)),J.isMesh)K.wireframe===!0?(te.setLineWidth(K.wireframeLinewidth*ye()),nt.setMode(B.LINES)):nt.setMode(B.TRIANGLES);else if(J.isLine){let He=K.linewidth;He===void 0&&(He=1),te.setLineWidth(He*ye()),J.isLineSegments?nt.setMode(B.LINES):J.isLineLoop?nt.setMode(B.LINE_LOOP):nt.setMode(B.LINE_STRIP)}else J.isPoints?nt.setMode(B.POINTS):J.isSprite&&nt.setMode(B.TRIANGLES);if(J.isBatchedMesh)if(ue.get("WEBGL_multi_draw"))nt.renderMultiDraw(J._multiDrawStarts,J._multiDrawCounts,J._multiDrawCount);else{let He=J._multiDrawStarts,rt=J._multiDrawCounts,xt=J._multiDrawCount,Pe=xe?qe.get(xe).bytesPerElement:1,Ne=ne.get(K).currentProgram.getUniforms();for(let Qt=0;Qt<xt;Qt++)Ne.setValue(B,"_gl_DrawID",Qt),nt.render(He[Qt]/Pe,rt[Qt])}else if(J.isInstancedMesh)nt.renderInstances(we,mt,J.count);else if(j.isInstancedBufferGeometry){let He=j._maxInstanceCount!==void 0?j._maxInstanceCount:1/0,rt=Math.min(j.instanceCount,He);nt.renderInstances(we,mt,rt)}else nt.render(we,mt)},this.compile=function(E,G,j=null){j===null&&(j=E),M=yt.get(j),M.init(G),O.push(M),j.traverseVisible(function(J){J.isLight&&J.layers.test(G.layers)&&(M.pushLight(J),J.castShadow&&M.pushShadow(J))}),E!==j&&E.traverseVisible(function(J){J.isLight&&J.layers.test(G.layers)&&(M.pushLight(J),J.castShadow&&M.pushShadow(J))}),M.setupLights();let K=new Set;return E.traverse(function(J){if(!(J.isMesh||J.isPoints||J.isLine||J.isSprite))return;let oe=J.material;if(oe)if(Array.isArray(oe))for(let de=0;de<oe.length;de++){let _e=oe[de];Vc(_e,j,J),K.add(_e)}else Vc(oe,j,J),K.add(oe)}),M=O.pop(),K},this.compileAsync=function(E,G,j=null){let K=this.compile(E,G,j);return new Promise(J=>{function oe(){K.forEach(function(de){ne.get(de).currentProgram.isReady()&&K.delete(de)}),K.size!==0?setTimeout(oe,10):J(E)}ue.get("KHR_parallel_shader_compile")!==null?oe():setTimeout(oe,10)})};let so=null;function Hc(){cn.stop()}function kc(){cn.start()}let cn=new Yu;function ao(E,G,j,K){if(E.visible===!1)return;if(E.layers.test(G.layers)){if(E.isGroup)j=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(G);else if(E.isLightProbeGrid)M.pushLightProbeGrid(E);else if(E.isLight)M.pushLight(E),E.castShadow&&M.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||L.intersectsSprite(E)){K&&Z.setFromMatrixPosition(E.matrixWorld).applyMatrix4(H);let oe=It.update(E),de=E.material;de.visible&&w.push(E,oe,de,j,Z.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||L.intersectsObject(E))){let oe=It.update(E),de=E.material;if(K&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Z.copy(E.boundingSphere.center)):(oe.boundingSphere===null&&oe.computeBoundingSphere(),Z.copy(oe.boundingSphere.center)),Z.applyMatrix4(E.matrixWorld).applyMatrix4(H)),Array.isArray(de)){let _e=oe.groups;for(let xe=0,Re=_e.length;xe<Re;xe++){let We=_e[xe],Xe=de[We.materialIndex];Xe&&Xe.visible&&w.push(E,oe,Xe,j,Z.z,We)}}else de.visible&&w.push(E,oe,de,j,Z.z,null)}}let J=E.children;for(let oe=0,de=J.length;oe<de;oe++)ao(J[oe],G,j,K)}function Wc(E,G,j,K){let{opaque:J,transmissive:oe,transparent:de}=E;M.setupLightsView(j),I===!0&&tt.setGlobalState(U.clippingPlanes,j),K&&te.viewport(pe.copy(K)),J.length>0&&os(J,G,j),oe.length>0&&os(oe,G,j),de.length>0&&os(de,G,j),te.buffers.depth.setTest(!0),te.buffers.depth.setMask(!0),te.buffers.color.setMask(!0),te.setPolygonOffset(!1)}function Xc(E,G,j,K){if((j.isScene===!0?j.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[K.id]===void 0){let Xe=ue.has("EXT_color_buffer_half_float")||ue.has("EXT_color_buffer_float");M.state.transmissionRenderTarget[K.id]=new kt(1,1,{generateMipmaps:!0,type:Xe?bi:Xt,minFilter:Sn,samples:Math.max(4,Ce.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ke.workingColorSpace})}let J=M.state.transmissionRenderTarget[K.id],oe=K.viewport||pe;J.setSize(oe.z*U.transmissionResolutionScale,oe.w*U.transmissionResolutionScale);let de=U.getRenderTarget(),_e=U.getActiveCubeFace(),xe=U.getActiveMipmapLevel();U.setRenderTarget(J),U.getClearColor(le),se=U.getClearAlpha(),se<1&&U.setClearColor(16777215,.5),U.clear(),ve&&ot.render(j);let Re=U.toneMapping;U.toneMapping=hi;let We=K.viewport;if(K.viewport!==void 0&&(K.viewport=void 0),M.setupLightsView(K),I===!0&&tt.setGlobalState(U.clippingPlanes,K),os(E,j,K),fe.updateMultisampleRenderTarget(J),fe.updateRenderTargetMipmap(J),ue.has("WEBGL_multisampled_render_to_texture")===!1){let Xe=!1;for(let we=0,je=G.length;we<je;we++){let mt=G[we],{object:ht,geometry:nt,material:He,group:rt}=mt;if(He.side===Tt&&ht.layers.test(K.layers)){let xt=He.side;He.side=Bt,He.needsUpdate=!0,jc(ht,j,K,nt,He,rt),He.side=xt,He.needsUpdate=!0,Xe=!0}}Xe===!0&&(fe.updateMultisampleRenderTarget(J),fe.updateRenderTargetMipmap(J))}U.setRenderTarget(de,_e,xe),U.setClearColor(le,se),We!==void 0&&(K.viewport=We),U.toneMapping=Re}function os(E,G,j){let K=G.isScene===!0?G.overrideMaterial:null;for(let J=0,oe=E.length;J<oe;J++){let de=E[J],{object:_e,geometry:xe,group:Re}=de,We=de.material;We.allowOverride===!0&&K!==null&&(We=K),_e.layers.test(j.layers)&&jc(_e,G,j,xe,We,Re)}}function jc(E,G,j,K,J,oe){E.onBeforeRender(U,G,j,K,J,oe),E.modelViewMatrix.multiplyMatrices(j.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),J.onBeforeRender(U,G,j,K,E,oe),J.transparent===!0&&J.side===Tt&&J.forceSinglePass===!1?(J.side=Bt,J.needsUpdate=!0,U.renderBufferDirect(j,G,K,J,E,oe),J.side=sn,J.needsUpdate=!0,U.renderBufferDirect(j,G,K,J,E,oe),J.side=Tt):U.renderBufferDirect(j,G,K,J,E,oe),E.onAfterRender(U,G,j,K,J,oe)}function ls(E,G,j){G.isScene!==!0&&(G=re);let K=ne.get(E),J=M.state.lights,oe=M.state.shadowsArray,de=J.state.version,_e=Se.getParameters(E,J.state,oe,G,j,M.state.lightProbeGridArray),xe=Se.getProgramCacheKey(_e),Re=K.programs;K.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?G.environment:null,K.fog=G.fog;let We=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;K.envMap=et.get(E.envMap||K.environment,We),K.envMapRotation=K.environment!==null&&E.envMap===null?G.environmentRotation:E.envMapRotation,Re===void 0&&(E.addEventListener("dispose",Gc),Re=new Map,K.programs=Re);let Xe=Re.get(xe);if(Xe!==void 0){if(K.currentProgram===Xe&&K.lightsStateVersion===de)return Yc(E,_e),Xe}else _e.uniforms=Se.getUniforms(E),F!==null&&E.isNodeMaterial&&F.build(E,j,_e),E.onBeforeCompile(_e,U),Xe=Se.acquireProgram(_e,xe),Re.set(xe,Xe),K.uniforms=_e.uniforms;let we=K.uniforms;return(E.isShaderMaterial||E.isRawShaderMaterial)&&E.clipping!==!0||(we.clippingPlanes=tt.uniform),Yc(E,_e),K.needsLights=function(je){return je.isMeshLambertMaterial||je.isMeshToonMaterial||je.isMeshPhongMaterial||je.isMeshStandardMaterial||je.isShadowMaterial||je.isShaderMaterial&&je.lights===!0}(E),K.lightsStateVersion=de,K.needsLights&&(we.ambientLightColor.value=J.state.ambient,we.lightProbe.value=J.state.probe,we.directionalLights.value=J.state.directional,we.directionalLightShadows.value=J.state.directionalShadow,we.spotLights.value=J.state.spot,we.spotLightShadows.value=J.state.spotShadow,we.rectAreaLights.value=J.state.rectArea,we.ltc_1.value=J.state.rectAreaLTC1,we.ltc_2.value=J.state.rectAreaLTC2,we.pointLights.value=J.state.point,we.pointLightShadows.value=J.state.pointShadow,we.hemisphereLights.value=J.state.hemi,we.directionalShadowMatrix.value=J.state.directionalShadowMatrix,we.spotLightMatrix.value=J.state.spotLightMatrix,we.spotLightMap.value=J.state.spotLightMap,we.pointShadowMatrix.value=J.state.pointShadowMatrix),K.lightProbeGrid=M.state.lightProbeGridArray.length>0,K.currentProgram=Xe,K.uniformsList=null,Xe}function qc(E){if(E.uniformsList===null){let G=E.currentProgram.getUniforms();E.uniformsList=gr.seqWithValue(G.seq,E.uniforms)}return E.uniformsList}function Yc(E,G){let j=ne.get(E);j.outputColorSpace=G.outputColorSpace,j.batching=G.batching,j.batchingColor=G.batchingColor,j.instancing=G.instancing,j.instancingColor=G.instancingColor,j.instancingMorph=G.instancingMorph,j.skinning=G.skinning,j.morphTargets=G.morphTargets,j.morphNormals=G.morphNormals,j.morphColors=G.morphColors,j.morphTargetsCount=G.morphTargetsCount,j.numClippingPlanes=G.numClippingPlanes,j.numIntersection=G.numClipIntersection,j.vertexAlphas=G.vertexAlphas,j.vertexTangents=G.vertexTangents,j.toneMapping=G.toneMapping}cn.setAnimationLoop(function(E){so&&so(E)}),typeof self<"u"&&cn.setContext(self),this.setAnimationLoop=function(E){so=E,ct.setAnimationLoop(E),E===null?cn.stop():cn.start()},ct.addEventListener("sessionstart",Hc),ct.addEventListener("sessionend",kc),this.render=function(E,G){if(G!==void 0&&G.isCamera!==!0)return void Ee("WebGLRenderer.render: camera is not an instance of THREE.Camera.");if(V===!0)return;F!==null&&F.renderStart(E,G);let j=ct.enabled===!0&&ct.isPresenting===!0,K=N!==null&&(ie===null||j)&&N.begin(U,ie);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),ct.enabled!==!0||ct.isPresenting!==!0||N!==null&&N.isCompositing()!==!1||(ct.cameraAutoUpdate===!0&&ct.updateCamera(G),G=ct.getCamera()),E.isScene===!0&&E.onBeforeRender(U,E,G,ie),M=yt.get(E,O.length),M.init(G),M.state.textureUnits=fe.getTextureUnits(),O.push(M),H.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),L.setFromProjectionMatrix(H,Ni,G.reversedDepth),C=this.localClippingEnabled,I=tt.init(this.clippingPlanes,C),w=Ge.get(E,D.length),w.init(),D.push(w),ct.enabled===!0&&ct.isPresenting===!0){let oe=U.xr.getDepthSensingMesh();oe!==null&&ao(oe,G,-1/0,U.sortObjects)}ao(E,G,0,U.sortObjects),w.finish(),U.sortObjects===!0&&w.sort(P,b,G.reversedDepth),ve=ct.enabled===!1||ct.isPresenting===!1||ct.hasDepthSensing()===!1,ve&&ot.addToRenderList(w,E),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),I===!0&&tt.beginShadows();let J=M.state.shadowsArray;if(pt.render(J,E,G),I===!0&&tt.endShadows(),(K&&N.hasRenderPass())===!1){let oe=w.opaque,de=w.transmissive;if(M.setupLights(),G.isArrayCamera){let _e=G.cameras;if(de.length>0)for(let xe=0,Re=_e.length;xe<Re;xe++)Xc(oe,de,E,_e[xe]);ve&&ot.render(E);for(let xe=0,Re=_e.length;xe<Re;xe++){let We=_e[xe];Wc(w,E,We,We.viewport)}}else de.length>0&&Xc(oe,de,E,G),ve&&ot.render(E),Wc(w,E,G)}ie!==null&&W===0&&(fe.updateMultisampleRenderTarget(ie),fe.updateRenderTargetMipmap(ie)),K&&N.end(U),E.isScene===!0&&E.onAfterRender(U,E,G),Gi.resetDefaultState(),he=-1,Me=null,O.pop(),O.length>0?(M=O[O.length-1],fe.setTextureUnits(M.state.textureUnits),I===!0&&tt.setGlobalState(U.clippingPlanes,M.state.camera)):M=null,D.pop(),w=D.length>0?D[D.length-1]:null,F!==null&&F.renderEnd()},this.getActiveCubeFace=function(){return q},this.getActiveMipmapLevel=function(){return W},this.getRenderTarget=function(){return ie},this.setRenderTargetTextures=function(E,G,j){let K=ne.get(E);K.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,K.__autoAllocateDepthBuffer===!1&&(K.__useRenderToTexture=!1),ne.get(E.texture).__webglTexture=G,ne.get(E.depthTexture).__webglTexture=K.__autoAllocateDepthBuffer?void 0:j,K.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,G){let j=ne.get(E);j.__webglFramebuffer=G,j.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(E,G=0,j=0){ie=E,q=G,W=j;let K=null,J=!1,oe=!1;if(E){let de=ne.get(E);if(de.__useDefaultFramebuffer!==void 0)return te.bindFramebuffer(B.FRAMEBUFFER,de.__webglFramebuffer),pe.copy(E.viewport),me.copy(E.scissor),ee=E.scissorTest,te.viewport(pe),te.scissor(me),te.setScissorTest(ee),void(he=-1);if(de.__webglFramebuffer===void 0)fe.setupRenderTarget(E);else if(de.__hasExternalTextures)fe.rebindTextures(E,ne.get(E.texture).__webglTexture,ne.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let Re=E.depthTexture;if(de.__boundDepthTexture!==Re){if(Re!==null&&ne.has(Re)&&(E.width!==Re.image.width||E.height!==Re.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");fe.setupDepthRenderbuffer(E)}}let _e=E.texture;(_e.isData3DTexture||_e.isDataArrayTexture||_e.isCompressedArrayTexture)&&(oe=!0);let xe=ne.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(K=Array.isArray(xe[G])?xe[G][j]:xe[G],J=!0):K=E.samples>0&&fe.useMultisampledRTT(E)===!1?ne.get(E).__webglMultisampledFramebuffer:Array.isArray(xe)?xe[j]:xe,pe.copy(E.viewport),me.copy(E.scissor),ee=E.scissorTest}else pe.copy(R).multiplyScalar($).floor(),me.copy(T).multiplyScalar($).floor(),ee=v;if(j!==0&&(K=Y),te.bindFramebuffer(B.FRAMEBUFFER,K)&&te.drawBuffers(E,K),te.viewport(pe),te.scissor(me),te.setScissorTest(ee),J){let de=ne.get(E.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+G,de.__webglTexture,j)}else if(oe){let de=G;for(let _e=0;_e<E.textures.length;_e++){let xe=ne.get(E.textures[_e]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+_e,xe.__webglTexture,j,de)}}else if(E!==null&&j!==0){let de=ne.get(E.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,de.__webglTexture,j)}he=-1},this.readRenderTargetPixels=function(E,G,j,K,J,oe,de,_e=0){if(!E||!E.isWebGLRenderTarget)return void Ee("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=ne.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&de!==void 0&&(xe=xe[de]),xe){te.bindFramebuffer(B.FRAMEBUFFER,xe);try{let Re=E.textures[_e],We=Re.format,Xe=Re.type;if(E.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+_e),!Ce.textureFormatReadable(We))return void Ee("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");if(!Ce.textureTypeReadable(Xe))return void Ee("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");G>=0&&G<=E.width-K&&j>=0&&j<=E.height-J&&B.readPixels(G,j,K,J,pi.convert(We),pi.convert(Xe),oe)}finally{let Re=ie!==null?ne.get(ie).__webglFramebuffer:null;te.bindFramebuffer(B.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(E,G,j,K,J,oe,de,_e=0){if(!E||!E.isWebGLRenderTarget)throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=ne.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&de!==void 0&&(xe=xe[de]),xe){if(G>=0&&G<=E.width-K&&j>=0&&j<=E.height-J){te.bindFramebuffer(B.FRAMEBUFFER,xe);let Re=E.textures[_e],We=Re.format,Xe=Re.type;if(E.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+_e),!Ce.textureFormatReadable(We))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ce.textureTypeReadable(Xe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let we=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,we),B.bufferData(B.PIXEL_PACK_BUFFER,oe.byteLength,B.STREAM_READ),B.readPixels(G,j,K,J,pi.convert(We),pi.convert(Xe),0);let je=ie!==null?ne.get(ie).__webglFramebuffer:null;te.bindFramebuffer(B.FRAMEBUFFER,je);let mt=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await vu(B,mt,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,we),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,oe),B.deleteBuffer(we),B.deleteSync(mt),oe}throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,G=null,j=0){let K=Math.pow(2,-j),J=Math.floor(E.image.width*K),oe=Math.floor(E.image.height*K),de=G!==null?G.x:0,_e=G!==null?G.y:0;fe.setTexture2D(E,0),B.copyTexSubImage2D(B.TEXTURE_2D,j,0,0,de,_e,J,oe),te.unbindTexture()},this.copyTextureToTexture=function(E,G,j=null,K=null,J=0,oe=0){let de,_e,xe,Re,We,Xe,we,je,mt,ht=E.isCompressedTexture?E.mipmaps[oe]:E.image;if(j!==null)de=j.max.x-j.min.x,_e=j.max.y-j.min.y,xe=j.isBox3?j.max.z-j.min.z:1,Re=j.min.x,We=j.min.y,Xe=j.isBox3?j.min.z:0;else{let mi=Math.pow(2,-J);de=Math.floor(ht.width*mi),_e=Math.floor(ht.height*mi),xe=E.isDataArrayTexture?ht.depth:E.isData3DTexture?Math.floor(ht.depth*mi):1,Re=0,We=0,Xe=0}K!==null?(we=K.x,je=K.y,mt=K.z):(we=0,je=0,mt=0);let nt=pi.convert(G.format),He=pi.convert(G.type),rt;G.isData3DTexture?(fe.setTexture3D(G,0),rt=B.TEXTURE_3D):G.isDataArrayTexture||G.isCompressedArrayTexture?(fe.setTexture2DArray(G,0),rt=B.TEXTURE_2D_ARRAY):(fe.setTexture2D(G,0),rt=B.TEXTURE_2D),te.activeTexture(B.TEXTURE0),te.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,G.flipY),te.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),te.pixelStorei(B.UNPACK_ALIGNMENT,G.unpackAlignment);let xt=te.getParameter(B.UNPACK_ROW_LENGTH),Pe=te.getParameter(B.UNPACK_IMAGE_HEIGHT),Ne=te.getParameter(B.UNPACK_SKIP_PIXELS),Qt=te.getParameter(B.UNPACK_SKIP_ROWS),oo=te.getParameter(B.UNPACK_SKIP_IMAGES);te.pixelStorei(B.UNPACK_ROW_LENGTH,ht.width),te.pixelStorei(B.UNPACK_IMAGE_HEIGHT,ht.height),te.pixelStorei(B.UNPACK_SKIP_PIXELS,Re),te.pixelStorei(B.UNPACK_SKIP_ROWS,We),te.pixelStorei(B.UNPACK_SKIP_IMAGES,Xe);let cs=E.isDataArrayTexture||E.isData3DTexture,vr=G.isDataArrayTexture||G.isData3DTexture;if(E.isDepthTexture){let mi=ne.get(E),Pn=ne.get(G),wi=ne.get(mi.__renderTarget),lo=ne.get(Pn.__renderTarget);te.bindFramebuffer(B.READ_FRAMEBUFFER,wi.__webglFramebuffer),te.bindFramebuffer(B.DRAW_FRAMEBUFFER,lo.__webglFramebuffer);for(let In=0;In<xe;In++)cs&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,ne.get(E).__webglTexture,J,Xe+In),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,ne.get(G).__webglTexture,oe,mt+In)),B.blitFramebuffer(Re,We,de,_e,we,je,de,_e,B.DEPTH_BUFFER_BIT,B.NEAREST);te.bindFramebuffer(B.READ_FRAMEBUFFER,null),te.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(J!==0||E.isRenderTargetTexture||ne.has(E)){let mi=ne.get(E),Pn=ne.get(G);te.bindFramebuffer(B.READ_FRAMEBUFFER,k),te.bindFramebuffer(B.DRAW_FRAMEBUFFER,z);for(let wi=0;wi<xe;wi++)cs?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,mi.__webglTexture,J,Xe+wi):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,mi.__webglTexture,J),vr?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Pn.__webglTexture,oe,mt+wi):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Pn.__webglTexture,oe),J!==0?B.blitFramebuffer(Re,We,de,_e,we,je,de,_e,B.COLOR_BUFFER_BIT,B.NEAREST):vr?B.copyTexSubImage3D(rt,oe,we,je,mt+wi,Re,We,de,_e):B.copyTexSubImage2D(rt,oe,we,je,Re,We,de,_e);te.bindFramebuffer(B.READ_FRAMEBUFFER,null),te.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else vr?E.isDataTexture||E.isData3DTexture?B.texSubImage3D(rt,oe,we,je,mt,de,_e,xe,nt,He,ht.data):G.isCompressedArrayTexture?B.compressedTexSubImage3D(rt,oe,we,je,mt,de,_e,xe,nt,ht.data):B.texSubImage3D(rt,oe,we,je,mt,de,_e,xe,nt,He,ht):E.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,oe,we,je,de,_e,nt,He,ht.data):E.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,oe,we,je,ht.width,ht.height,nt,ht.data):B.texSubImage2D(B.TEXTURE_2D,oe,we,je,de,_e,nt,He,ht);te.pixelStorei(B.UNPACK_ROW_LENGTH,xt),te.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Pe),te.pixelStorei(B.UNPACK_SKIP_PIXELS,Ne),te.pixelStorei(B.UNPACK_SKIP_ROWS,Qt),te.pixelStorei(B.UNPACK_SKIP_IMAGES,oo),oe===0&&G.generateMipmaps&&B.generateMipmap(rt),te.unbindTexture()},this.initRenderTarget=function(E){ne.get(E).__webglFramebuffer===void 0&&fe.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?fe.setTextureCube(E,0):E.isData3DTexture?fe.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?fe.setTexture2DArray(E,0):fe.setTexture2D(E,0),te.unbindTexture()},this.resetState=function(){q=0,W=0,ie=null,te.reset(),Gi.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ni}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=ke._getDrawingBufferColorSpace(e),t.unpackColorSpace=ke._getUnpackColorSpace()}};var td={type:"change"},Dc={type:"start"},nd={type:"end"},Ka=new yi,id=new Zt,Lm=Math.cos(70*oc.DEG2RAD),_t=new A,zt=2*Math.PI,$e={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Lc=1e-6,$a=class extends Jr{constructor(e,t=null){super(e,t),this.state=$e.NONE,this.target=new A,this.cursor=new A,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:nn.ROTATE,MIDDLE:nn.DOLLY,RIGHT:nn.PAN},this.touches={ONE:rn.ROTATE,TWO:rn.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new A,this._lastQuaternion=new Nt,this._lastTargetPosition=new A,this._quat=new Nt().setFromUnitVectors(e.up,new A(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new cr,this._sphericalDelta=new cr,this._scale=1,this._panOffset=new A,this._rotateStart=new Q,this._rotateEnd=new Q,this._rotateDelta=new Q,this._panStart=new Q,this._panEnd=new Q,this._panDelta=new Q,this._dollyStart=new Q,this._dollyEnd=new Q,this._dollyDelta=new Q,this._dollyDirection=new A,this._mouse=new Q,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Nm.bind(this),this._onPointerDown=Dm.bind(this),this._onPointerUp=Um.bind(this),this._onContextMenu=Hm.bind(this),this._onMouseWheel=Bm.bind(this),this._onKeyDown=zm.bind(this),this._onTouchStart=Gm.bind(this),this._onTouchMove=Vm.bind(this),this._onMouseDown=Om.bind(this),this._onMouseMove=Fm.bind(this),this._interceptControlDown=km.bind(this),this._interceptControlUp=Wm.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(td),this.update(),this.state=$e.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;_t.copy(t).sub(this.target),_t.applyQuaternion(this._quat),this._spherical.setFromVector3(_t),this.autoRotate&&this.state===$e.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,n=this.maxAzimuthAngle;isFinite(i)&&isFinite(n)&&(i<-Math.PI?i+=zt:i>Math.PI&&(i-=zt),n<-Math.PI?n+=zt:n>Math.PI&&(n-=zt),i<=n?this._spherical.theta=Math.max(i,Math.min(n,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+n)/2?Math.max(i,this._spherical.theta):Math.min(n,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let s=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),s=a!=this._spherical.radius}if(_t.setFromSpherical(this._spherical),_t.applyQuaternion(this._quatInverse),t.copy(this.target).add(_t),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=_t.length();a=this._clampDistance(o*this._scale);let c=o-a;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),s=!!c}else if(this.object.isOrthographicCamera){let o=new A(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),s=c!==this.object.zoom;let l=new A(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(o),this.object.updateMatrixWorld(),a=_t.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Ka.origin.copy(this.object.position),Ka.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ka.direction))<Lm?this.object.lookAt(this.target):(id.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ka.intersectPlane(id,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),s=!0)}return this._scale=1,this._performCursorZoom=!1,s||this._lastPosition.distanceToSquared(this.object.position)>Lc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Lc||this._lastTargetPosition.distanceToSquared(this.target)>Lc?(this.dispatchEvent(td),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?zt/60*this.autoRotateSpeed*e:zt/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){_t.setFromMatrixColumn(t,0),_t.multiplyScalar(-e),this._panOffset.add(_t)}_panUp(e,t){this.screenSpacePanning===!0?_t.setFromMatrixColumn(t,1):(_t.setFromMatrixColumn(t,0),_t.crossVectors(this.object.up,_t)),_t.multiplyScalar(e),this._panOffset.add(_t)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let n=this.object.position;_t.copy(n).sub(this.target);let s=_t.length();s*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*s/i.clientHeight,this.object.matrix),this._panUp(2*t*s/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),n=e-i.left,s=t-i.top,a=i.width,o=i.height;this._mouse.x=n/a*2-1,this._mouse.y=-(s/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(zt*this._rotateDelta.x/t.clientHeight),this._rotateUp(zt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(zt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-zt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(zt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-zt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._rotateStart.set(i,n)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._panStart.set(i,n)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,n=e.pageY-t.y,s=Math.sqrt(i*i+n*n);this._dollyStart.set(0,s)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),n=.5*(e.pageX+i.x),s=.5*(e.pageY+i.y);this._rotateEnd.set(n,s)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(zt*this._rotateDelta.x/t.clientHeight),this._rotateUp(zt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._panEnd.set(i,n)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,n=e.pageY-t.y,s=Math.sqrt(i*i+n*n);this._dollyEnd.set(0,s),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Q,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function Dm(r){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(r.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(r)&&(this._addPointer(r),r.pointerType==="touch"?this._onTouchStart(r):this._onMouseDown(r),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Nm(r){this.enabled!==!1&&(r.pointerType==="touch"?this._onTouchMove(r):this._onMouseMove(r))}function Um(r){switch(this._removePointer(r),this._pointers.length){case 0:this.domElement.releasePointerCapture(r.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(nd),this.state=$e.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Om(r){let e;switch(r.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case nn.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(r),this.state=$e.DOLLY;break;case nn.ROTATE:if(r.ctrlKey||r.metaKey||r.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(r),this.state=$e.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(r),this.state=$e.ROTATE}break;case nn.PAN:if(r.ctrlKey||r.metaKey||r.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(r),this.state=$e.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(r),this.state=$e.PAN}break;default:this.state=$e.NONE}this.state!==$e.NONE&&this.dispatchEvent(Dc)}function Fm(r){switch(this.state){case $e.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(r);break;case $e.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(r);break;case $e.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(r);break}}function Bm(r){this.enabled===!1||this.enableZoom===!1||this.state!==$e.NONE||(r.preventDefault(),this.dispatchEvent(Dc),this._handleMouseWheel(this._customWheelEvent(r)),this.dispatchEvent(nd))}function zm(r){this.enabled!==!1&&this._handleKeyDown(r)}function Gm(r){switch(this._trackPointer(r),this._pointers.length){case 1:switch(this.touches.ONE){case rn.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(r),this.state=$e.TOUCH_ROTATE;break;case rn.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(r),this.state=$e.TOUCH_PAN;break;default:this.state=$e.NONE}break;case 2:switch(this.touches.TWO){case rn.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(r),this.state=$e.TOUCH_DOLLY_PAN;break;case rn.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(r),this.state=$e.TOUCH_DOLLY_ROTATE;break;default:this.state=$e.NONE}break;default:this.state=$e.NONE}this.state!==$e.NONE&&this.dispatchEvent(Dc)}function Vm(r){switch(this._trackPointer(r),this.state){case $e.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(r),this.update();break;case $e.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(r),this.update();break;case $e.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(r),this.update();break;case $e.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(r),this.update();break;default:this.state=$e.NONE}}function Hm(r){this.enabled!==!1&&r.preventDefault()}function km(r){r.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Wm(r){r.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var Cn=document.getElementById("thermal-3d-shell"),Rn=document.getElementById("thermal-3d-canvas"),Xm=document.getElementById("thermal-3d-fallback"),jm=document.getElementById("thermal-component-readout"),Nc=document.getElementById("thermal-3d-legend"),De=.01,Ve={x:343,y:153,z:198},on={heat:{color:16748390,label:"Heat source"},fan:{color:5429759,label:"Fan"},duct:{color:3064998,label:"Printed duct"},structure:{color:10465979,label:"Structure"},porous:{color:9082524,label:"Cables / grille"}},ss={measured:{color:13238077,label:"Measured / official"},official:{color:13238077,label:"Measured / official"},photo:{color:5429759,label:"From photos"},assumed:{color:11111392,label:"Assumed"}},qm={GPU:16748390,CPU_COOLER:16740175,RAM:15909198,PSU:16757611},Ym=5429759,rd=16748390;if(Cn&&Rn){let r=!1,e=new IntersectionObserver(t=>{t.some(i=>i.isIntersecting)&&!r&&(r=!0,e.disconnect(),Zm().catch(i=>{console.error("Terra 3D viewer:",i),Rn.hidden=!0,Xm.hidden=!1}))},{rootMargin:"120px"});e.observe(Cn)}var Qe=(r,e,t)=>new A((r-Ve.x/2)*De,(t-Ve.z/2)*De,(e-Ve.y/2)*De),od=r=>Qe(r.min[0]+r.size[0]/2,r.min[1]+r.size[1]/2,r.min[2]+r.size[2]/2),ld=r=>[r.size[0]*De,r.size[2]*De,r.size[1]*De];async function Zm(){let r=await fetch("/control/data/terra-thermal-summary.json",{credentials:"same-origin",headers:{accept:"application/json"}});if(!r.ok)throw new Error(`Geometry request failed: ${r.status}`);let e=(await r.json()).geometry,[t,i,n]=e.case.outer_body_mm;Ve={x:t,y:i,z:n};let s=new Za({canvas:Rn,antialias:!0,alpha:!0,powerPreference:"low-power"});s.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)),s.outputColorSpace=Dt;let a=new Dr,o=new At(32,1,.05,60),c=new $a(o,Rn);c.enableDamping=!1,c.minDistance=2.2,c.maxDistance=11,c.addEventListener("change",R),a.add(new Yr(15137791,1054490,1.7));let l=new lr(16777215,2);l.position.set(-3,5,4),a.add(l);let h=new lr(11111392,.9);h.position.set(4,1,-3),a.add(h);let d=new Mt;a.add(d);let p=[],u=[],f=[],m=new Mt;d.add(m);let y=(T,v)=>v==="certainty"?(ss[T.certainty]||ss.assumed).color:T.role==="heat"?qm[T.id]??on.heat.color:(on[T.role]||on.structure).color,g=(T,v={})=>{let L=v.opacity??.35,I=v.line?new vn({transparent:!0,opacity:L}):new ci({transparent:L<1,opacity:L,roughness:.55,metalness:.15,depthWrite:L>.7,side:v.side??sn});return I.color.setHex(y(T,"role")),u.push({material:I,part:T}),I},_=(T,v)=>(T.userData.part=v,p.push(T),T);$m(d,e.case),Qm(d,e.case,m);for(let T of e.panels||[])tf(m,T,e.case);let x={GPU:[0,0,-1.2],GPU_FAN_1:[0,0,-1.2],GPU_FAN_2:[0,0,-1.2],GPU_FAN_3:[0,0,-1.2],GPU_DUCT:[0,0,-2.05],SPINE:[0,0,-.35],RISER:[0,-.35,-.9],MOTHERBOARD:[0,0,.45],RAM:[0,.15,1],CPU_COOLER:[0,0,1.2],CPU_FAN:[0,0,1.2],CPU_DUCT:[0,0,2.05],PSU:[-.35,0,1.3],PSU_FAN:[-.35,0,1.3],BOTTOM_FAN:[0,-.9,0],BOTTOM_GRILLE:[0,-.55,0],TOP_FAN:[0,.9,0],CABLES_GPU:[-.5,0,-.85],CABLES_MAIN:[0,.1,.75],CABLES_BOTTOM:[0,-.45,.75]};for(let T of e.components){let v=new Mt;v.userData.offset=new A(...x[T.id]||[0,0,0]),d.add(v),f.push(v),T.fan?of(v,T,g,_):T.shape?.type==="rings"?lf(v,T,g,_):T.shape?.type==="tube"?cf(v,T,g,_):T.shape?.type==="disc_grille"?hf(v,T,g,_):T.role==="porous"?uf(v,T,g,_):T.id==="RAM"?sf(v,T,g,_):T.id==="SPINE"?af(v,T,g,_):T.id==="CPU_COOLER"?rf(v,T,g,_):T.id==="RISER"?io(v,T,g,_,.04):io(v,T,g,_)}let S=new Mt;d.add(S),pf(S,e);let w=new Mt;d.add(w);for(let T of e.cables||[])df(w,T,g,_);let M=f.filter((T,v)=>e.components[v]?.id.startsWith("CABLES_")),D=new Mt;d.add(D);let O={},N={value:0},U=f.filter((T,v)=>["GPU_DUCT","CPU_DUCT"].includes(e.components[v]?.id));U.forEach(T=>{T.userData.componentId=e.components[f.indexOf(T)].id});let V=document.getElementById("thermal-cfd-key"),F="off",Y=!0;new IntersectionObserver(T=>{Y=T.some(v=>v.isIntersecting)}).observe(Cn);let k=0,z=0;async function q(T){if(!O[T]){let v=await fetch(`/control/data/cfd/${T}-streams.bin`,{credentials:"same-origin"});if(!v.ok)throw new Error(`CFD ${T}: ${v.status}`);O[T]=ff(await v.arrayBuffer(),N)}return O[T]}function W(T){if(k=0,F==="off")return;let v=z?Math.min((T-z)/1e3,.1):0;z=T,Y&&!document.hidden&&(N.value+=v,R()),k=requestAnimationFrame(W)}async function ie(T){F=T,document.querySelectorAll("[data-thermal-cfd]").forEach(I=>me(I,I.dataset.thermalCfd===T)),D.clear();let v=T!=="off";S.visible=!v&&(document.querySelector("[data-thermal-flow]")?.getAttribute("aria-pressed")??"true")!=="false";let L={s04:[],s05:[],s06:["CPU_DUCT"]}[T]??["GPU_DUCT","CPU_DUCT"];if(U.forEach(I=>{I.visible=!v||L.includes(I.userData.componentId)}),V){V.hidden=!v;let I=V.querySelector("b"),C=document.querySelector(`.thermal-view-cfd [data-thermal-cfd="${T}"]`);I&&(I.textContent=C?.textContent||T.toUpperCase())}if(v){try{D.add(await q(T))}catch(I){console.warn(I)}k||(z=0,k=requestAnimationFrame(W))}R()}document.addEventListener("click",T=>{let v=T.target.closest?.("[data-thermal-cfd]");if(!v)return;v.closest(".thermal-view-controls")!==null||Cn.scrollIntoView({behavior:"smooth",block:"center"}),ie(v.dataset.thermalCfd)});let he="role";function Me(){if(!Nc)return;let T=he==="certainty"?[ss.measured,ss.photo,ss.assumed]:[on.heat,on.fan,on.duct,on.structure,on.porous];Nc.setAttribute("aria-label",he==="certainty"?"How sure each position is":"What each part does"),Nc.innerHTML=T.map(({label:v,color:L})=>`<span><i style="background:#${L.toString(16).padStart(6,"0")}"></i>${v}</span>`).join("")}let pe=(T,v)=>document.querySelectorAll(T).forEach(L=>L.addEventListener("click",()=>v(L))),me=(T,v)=>{T.setAttribute("aria-pressed",String(v)),T.classList.toggle("active",v)};pe("[data-thermal-colour]",T=>{document.querySelectorAll("[data-thermal-colour]").forEach(v=>me(v,v===T)),he=T.dataset.thermalColour;for(let{material:v,part:L}of u)v.color.setHex(y(L,he));Me(),R()});let ee=document.querySelector("[data-thermal-panels]");m.visible=ee?ee.getAttribute("aria-pressed")==="true":!0,pe("[data-thermal-panels]",T=>{let v=T.getAttribute("aria-pressed")!=="true";me(T,v),m.visible=v,R()}),pe("[data-thermal-opaque]",T=>{let v=T.getAttribute("aria-pressed")!=="true";me(T,v),Km(v),v&&ee&&ee.getAttribute("aria-pressed")!=="true"&&ee.click(),R()}),pe("[data-thermal-cables]",T=>{let v=T.getAttribute("aria-pressed")!=="true";me(T,v),w.visible=v&&!le,M.forEach(L=>{L.visible=v}),R()}),pe("[data-thermal-flow]",T=>{let v=T.getAttribute("aria-pressed")!=="true";me(T,v),S.visible=v&&F==="off",R()});let le=!1;pe("[data-thermal-explode]",T=>{let v=T.getAttribute("aria-pressed")!=="true";me(T,v),le=v,w.visible=!v&&document.querySelector("[data-thermal-cables]")?.getAttribute("aria-pressed")!=="false";for(let L of f)L.position.copy(v?L.userData.offset:new A);S.visible=!v&&F==="off"&&(document.querySelector("[data-thermal-flow]")?.getAttribute("aria-pressed")??"true")!=="false",D.visible=!v,R()});let se={iso:[4.6,3.1,4.3],gpu:[0,.3,-5.6],board:[0,.3,5.6],top:[0,6.4,.01]};pe("[data-thermal-camera]",T=>{document.querySelectorAll("[data-thermal-camera]").forEach(v=>me(v,v===T)),P(se[T.dataset.thermalCamera])});let ge=new Zr,Ae=new Q,$=null;Rn.addEventListener("pointerdown",T=>{$=[T.clientX,T.clientY]}),Rn.addEventListener("pointerup",T=>{if(!$||Math.hypot(T.clientX-$[0],T.clientY-$[1])>5)return;let v=Rn.getBoundingClientRect();Ae.x=(T.clientX-v.left)/v.width*2-1,Ae.y=-((T.clientY-v.top)/v.height)*2+1,ge.setFromCamera(Ae,o);let L=ge.intersectObjects(p,!1).find(I=>Jm(I.object));L&&vf(L.object.userData.part)});function P(T){o.position.fromArray(T),c.target.set(0,0,0),c.update(),R()}function b(){let T=Math.max(Cn.clientWidth,1),v=Math.max(Cn.clientHeight,1);s.setSize(T,v,!1),o.aspect=T/v,o.updateProjectionMatrix(),R()}function R(){s.render(a,o)}Me(),new ResizeObserver(b).observe(Cn),P(se.iso),b(),window.__terraViewer={scene:a,camera:o,render:R,setCamera:P}}function Jm(r){for(let e=r;e;e=e.parent)if(!e.visible)return!1;return!0}var cd=[];function to(r=.22){let e=new ci({color:8824202,transparent:!0,opacity:r,roughness:.8,metalness:.3,side:Tt,depthWrite:!1});return e.userData.baseOpacity=r,cd.push(e),e}function Km(r){for(let e of cd)e.opacity=r?1:e.userData.baseOpacity,e.transparent=!r,e.depthWrite=r,e.needsUpdate=!0}function $m(r,e){let t=e.feet?.height_mm||e.feet_mm||20,i=new Oe(new Mi(5.4,3.4),new ci({color:1712934,roughness:.95}));i.rotation.x=-Math.PI/2,i.position.copy(Qe(Ve.x/2,Ve.y/2,-t)),r.add(i)}function Qm(r,e,t){let i=e.top_edge_radius_mm||0,n=Ve.y/2,s=Ve.z/2,a=new Ft;a.moveTo(-n,-s),a.lineTo(n,-s),a.lineTo(n,s-i),i&&a.absarc(n-i,s-i,i,0,Math.PI/2,!1),a.lineTo(-n+i,s),i&&a.absarc(-n+i,s-i,i,Math.PI/2,Math.PI,!1),a.lineTo(-n,-s);let o=new en(a,{depth:Ve.x,bevelEnabled:!1,curveSegments:10}),c=new Ki(new Qi(o,25),new vn({color:10469272,transparent:!0,opacity:.85}));if(c.scale.setScalar(De),c.rotation.y=Math.PI/2,c.position.copy(Qe(0,Ve.y/2,Ve.z/2)),r.add(c),i)for(let[u,f]of[[Ve.y-i,Math.PI*1.5],[i,Math.PI]]){let m=new Oe(new xi(i*De,i*De,Ve.x*De,8,1,!0,f,Math.PI/2),to());m.rotation.z=-Math.PI/2,m.position.copy(Qe(Ve.x/2,u,Ve.z-i)),t.add(m)}let l=new Oe(new li(a,10),to(.28));l.scale.setScalar(De),l.rotation.y=Math.PI/2,l.position.copy(Qe(-.5,Ve.y/2,Ve.z/2)),t.add(l);let h=e.feet?.height_mm||20,d=new Oe(new Rt(.04,(h+16)*De,Ve.y*De),new ci({color:8015146,roughness:.7}));d.position.copy(Qe(-2,Ve.y/2,(16-h)/2)),r.add(d);let p=e.front_io;if(p){let u=new ci({color:2896952,metalness:.6,roughness:.35}),f=p.power_button,m=new Oe(new xi(f.diameter/2*De,f.diameter/2*De,2*De,32),u);m.rotation.z=Math.PI/2,m.position.copy(Qe(-5,f.y,f.z)),r.add(m);let y=new ci({color:856082,roughness:.6});for(let g of p.usb_c){let _=new Ft;_.absarc(-3,0,1.6,Math.PI/2,Math.PI*1.5,!1),_.absarc(3,0,1.6,-Math.PI/2,Math.PI/2,!1);let x=new Oe(new li(_,8),y);x.scale.setScalar(De),x.rotation.set(Math.PI/2,-Math.PI/2,0,"YXZ"),x.position.copy(Qe(-4.05,g.y,g.z)),r.add(x)}}}function ef(r,e,t,i){let n=new Kt,s=e-r>=i-t,a=(s?i-t:e-r)/2;if(s){let o=(t+i)/2;n.moveTo(r+a,t),n.lineTo(e-a,t),n.absarc(e-a,o,a,-Math.PI/2,Math.PI/2,!1),n.lineTo(r+a,i),n.absarc(r+a,o,a,Math.PI/2,Math.PI*1.5,!1)}else{let o=(r+e)/2;n.moveTo(e,t+a),n.lineTo(e,i-a),n.absarc(o,i-a,a,0,Math.PI,!1),n.lineTo(r,t+a),n.absarc(o,t+a,a,Math.PI,Math.PI*2,!1)}return n}function tf(r,e,t){if(e.openings)return nf(r,e);let i=e.grille;if(!i)return;let n=to(),s;if(e.face==="y-"||e.face==="y+"){let a=t.feet||{height_mm:20,legs:[{x:[0,30]},{x:[Ve.x-30,Ve.x]}],chamfer_mm:20},o=a.height_mm,c=a.chamfer_mm,l=t.top_edge_radius_mm||0,h=new Ft,[d,p]=[a.legs[0].x[1],a.legs[1].x[0]];h.moveTo(0,-o),h.lineTo(d,-o),h.lineTo(d+c,0),h.lineTo(p-c,0),h.lineTo(p,-o),h.lineTo(Ve.x,-o),h.lineTo(Ve.x,Ve.z-l),h.lineTo(0,Ve.z-l),h.lineTo(0,-o),i.rows_x.forEach((u,f)=>{let m=f%2===0?i.gap_z.even:i.gap_z.odd;for(let[y,g]of[[i.slot_z[0],m[0]],[m[1],i.slot_z[1]]])h.holes.push(sd(u,y,g,i.slot_w))}),s=new Oe(new li(h,4),n),s.position.copy(Qe(0,e.face==="y-"?-.5:Ve.y+.5,0))}else if(e.face==="z+"||e.face==="z-"){let a=e.face==="z+"&&t.top_edge_radius_mm||0,o=new Ft;if(o.moveTo(0,a),o.lineTo(Ve.x,a),o.lineTo(Ve.x,Ve.y-a),o.lineTo(0,Ve.y-a),o.lineTo(0,a),i.slots)for(let c of i.slots)o.holes.push(ef(c.x[0],c.x[1],c.y[0],c.y[1]));else i.rows_x.forEach((c,l)=>{let h=l%2===0?i.gap_y.even:i.gap_y.odd;for(let[d,p]of[[i.slot_y[0],h[0]],[h[1],i.slot_y[1]]])o.holes.push(sd(c,d,p,i.slot_w))});s=new Oe(new li(o,4),n),s.rotation.x=Math.PI/2,s.position.copy(Qe(0,0,e.face==="z+"?Ve.z+.5:-.5))}s&&(s.scale.setScalar(De),r.add(s))}function nf(r,e){let t=new Ft;t.moveTo(0,0),t.lineTo(Ve.y,0),t.lineTo(Ve.y,Ve.z),t.lineTo(0,Ve.z),t.lineTo(0,0);for(let n of e.openings){let s=new Kt;s.moveTo(n.y[0],n.z[0]),s.lineTo(n.y[1],n.z[0]),s.lineTo(n.y[1],n.z[1]),s.lineTo(n.y[0],n.z[1]),s.lineTo(n.y[0],n.z[0]),t.holes.push(s)}let i=new Oe(new li(t),to());i.rotation.y=-Math.PI/2,i.scale.setScalar(De),i.position.copy(Qe(Ve.x+.5,0,0)),r.add(i);for(let n of e.openings){if(n.porosity>=1)continue;let s=new Oe(new Mi((n.y[1]-n.y[0])*De,(n.z[1]-n.z[0])*De),new ci({color:2106922,transparent:!0,opacity:.55,side:Tt,depthWrite:!1}));s.rotation.y=Math.PI/2,s.position.copy(Qe(Ve.x-2,(n.y[0]+n.y[1])/2,(n.z[0]+n.z[1])/2)),r.add(s)}}function sd(r,e,t,i){let n=i/2,s=new Kt;return s.moveTo(r-n,e+n),s.lineTo(r-n,t-n),s.absarc(r,t-n,n,Math.PI,0,!0),s.lineTo(r+n,e+n),s.absarc(r,e+n,n,0,Math.PI,!0),s}function io(r,e,t,i,n=.32){let s=new Rt(...ld(e.box)),a=i(new Oe(s,t(e,{opacity:n})),e);a.position.copy(od(e.box)),r.add(a);let o=new Ki(new Qi(s),t(e,{line:!0,opacity:.9}));o.position.copy(a.position),r.add(o)}function rf(r,e,t,i){io(r,e,t,i,.18);let n=e.box,s=18,a=n.size[1]-18,o=new Rt(.006,n.size[2]*De*.94,a*De),c=t(e,{opacity:.6});for(let l=0;l<s;l+=1){let h=i(new Oe(o,c),e);h.position.copy(Qe(n.min[0]+4+l*(n.size[0]-8)/(s-1),n.min[1]+3+a/2,n.min[2]+n.size[2]/2)),r.add(h)}}function sf(r,e,t,i){let n=e.box,s=e.modules||{count:2,size_mm:[7,n.size[1],n.size[2]],pitch_mm:9.5};for(let a=0;a<s.count;a+=1)io(r,{...e,box:{min:[n.min[0]+.5+a*s.pitch_mm,n.min[1],n.min[2]],size:[s.size_mm[0],s.size_mm[1],s.size_mm[2]]}},t,i,.6)}function af(r,e,t,i){let n=e.box,s=new Ft;s.moveTo(0,0),s.lineTo(n.size[0],0),s.lineTo(n.size[0],n.size[2]),s.lineTo(0,n.size[2]),s.lineTo(0,0);for(let[o,c,l,h]of[[150,22,332,180],[14,28,132,176]]){let d=new Kt;d.moveTo(o,c),d.lineTo(l,c),d.lineTo(l,h),d.lineTo(o,h),d.lineTo(o,c),s.holes.push(d)}let a=i(new Oe(new li(s),t(e,{opacity:.18,side:Tt})),e);a.scale.setScalar(De),a.position.copy(Qe(n.min[0],n.min[1]+n.size[1]/2,n.min[2])),r.add(a)}function of(r,e,t,i){let n=e.fan,s=n.diameter/2*De,a=new Mt;if(n.frame){let l=n.frame,h=new Ft,d=l/2;h.moveTo(-d+4,-d),h.lineTo(d-4,-d),h.quadraticCurveTo(d,-d,d,-d+4),h.lineTo(d,d-4),h.quadraticCurveTo(d,d,d-4,d),h.lineTo(-d+4,d),h.quadraticCurveTo(-d,d,-d,d-4),h.lineTo(-d,-d+4),h.quadraticCurveTo(-d,-d,-d+4,-d);let p=new Kt;p.absarc(0,0,n.diameter/2+1,0,Math.PI*2,!0),h.holes.push(p);let u=new Oe(new en(h,{depth:n.thickness,bevelEnabled:!1,curveSegments:32}),t(e,{opacity:.55}));u.scale.setScalar(De),u.position.z=-(n.thickness/2)*De,a.add(i(u,e))}a.add(i(new Oe(new xn(s,n.frame?.012:.02,8,48),t(e,{opacity:.95})),e)),a.add(i(new Oe(new er(s,40),t(e,{opacity:.07,side:Tt})),e));let o=i(new Oe(new xi(s*n.hub_ratio,s*n.hub_ratio,Math.max(n.thickness*De,.03),20),t(e,{opacity:.85})),e);o.rotation.x=Math.PI/2,a.add(o);let c=t(e,{opacity:.5,side:Tt});for(let l=0;l<7;l+=1){let h=new Mt;h.rotation.z=l*Math.PI*2/7;let d=new Oe(new Mi(s*(.95-n.hub_ratio),s*.22),c);d.position.x=s*(n.hub_ratio+.95)/2,d.rotation.x=.55,h.add(i(d,e)),a.add(h)}a.quaternion.setFromUnitVectors(new A(0,0,1),hd(n.axis)),a.position.copy(Qe(...n.centre)),r.add(a)}var hd=r=>new A(r[0],r[2],r[1]).normalize();function no(r,e,t){let i=new Ft;i.absarc(0,0,r,0,Math.PI*2,!1);let n=new Kt;return n.absarc(0,0,e,0,Math.PI*2,!0),i.holes.push(n),new en(i,{depth:t,bevelEnabled:!1,curveSegments:48})}function ro(r,e,t,i,n){let s=new Oe(r,e);return s.scale.setScalar(De),s.position.copy(Qe(t,i,n)),s}function lf(r,e,t,i){let n=e.shape,s=e.box.min[1],a=t(e,{opacity:.9}),o=no(n.r_out,n.r_in,n.height),c=no(n.flange_r,n.r_in,n.flange_t);for(let l of n.centres_x){r.add(i(ro(o,a,l,s,n.centre_z),e)),r.add(i(ro(c,a,l,s,n.centre_z),e));for(let h of n.ears_z){let d=new Oe(new Rt(16*De,13*De,2*De),a);d.position.copy(Qe(l,s+1,n.centre_z+h)),r.add(i(d,e))}}for(let l=0;l<n.centres_x.length-1;l+=1){let h=new Oe(new Rt((n.centres_x[l+1]-n.centres_x[l]-2*n.r_in+3)*De,30*De,n.height*De),a);h.position.copy(Qe((n.centres_x[l]+n.centres_x[l+1])/2,s+n.height/2,n.centre_z)),r.add(i(h,e))}}function cf(r,e,t,i){let n=e.shape,s=t(e,{opacity:.9}),a=e.box.min[1]+e.box.size[1];r.add(i(ro(no(n.r_out,n.r_in,n.height),s,n.centre_x,e.box.min[1],n.centre_z),e)),r.add(i(ro(no(n.flange_r,n.r_in,n.flange_t),s,n.centre_x,a-n.flange_t,n.centre_z),e));for(let o of n.ears_x){let c=Math.abs(o)-n.r_out+8,l=new Oe(new Rt(c*De,16*De,2*De),s);l.position.copy(Qe(n.centre_x+Math.sign(o)*(n.r_out+c/2-4),a-1,n.centre_z)),r.add(i(l,e))}}function hf(r,e,t,i){let n=e.shape,s=t(e,{opacity:.9}),a=Qe(...n.centre);for(let o=1;o<=n.rings;o+=1){let c=new Oe(new xn(n.diameter/2*(o/n.rings)*De,(n.wire_mm||1.2)/2*De,6,48),s);c.rotation.x=Math.PI/2,c.position.copy(a),r.add(i(c,e))}for(let o=0;o<4;o+=1){let c=new Oe(new Rt(n.diameter*De,(n.wire_mm||1.2)*De,(n.wire_mm||1.2)*De),s);c.rotation.y=o*Math.PI/4,c.position.copy(a),r.add(i(c,e))}}function uf(r,e,t,i){let n=e.box,s=new Oe(new Rt(...ld(n)),t(e,{opacity:.05}));s.position.copy(od(n)),r.add(i(s,e));let a=new Ki(new Qi(s.geometry),t(e,{line:!0,opacity:.35}));a.position.copy(s.position),r.add(a)}function df(r,e,t,i){let n={...e,role:"porous",basis:`${e.from} \u2192 ${e.to}`},s=new nr(e.points.map(c=>Qe(...c)),!1,"centripetal"),a=t(n,{opacity:.95}),o;if(e.flat){let c=e.flat[0]/2*De,l=s.getPoints(60),h=[],d=[];l.forEach((p,u)=>{h.push(p.x-c,p.y,p.z,p.x+c,p.y,p.z),u&&d.push(2*u-2,2*u-1,2*u,2*u-1,2*u+1,2*u)}),o=new Ke,o.setAttribute("position",new Te(h,3)),o.setIndex(d),o.computeVertexNormals(),a.side=Tt}else o=new sr(s,80,e.diameter/2*De,10,!1);r.add(i(new Oe(o,a),n))}function pf(r,e){for(let t of e.components){if(t.exhaust?.face==="z+"){let a=t.box;r.add(ad(Qe(a.min[0]+a.size[0]/2,a.min[1]+a.size[1]/2,a.min[2]+a.size[2]+1),new A(0,1,0),.22,rd))}if(!t.fan)continue;let i=t.fan,n=hd(i.axis),s;t.id.startsWith("GPU_FAN")?s=Qe(i.centre[0],-45,i.centre[2]):t.id==="CPU_FAN"?s=Qe(i.centre[0],Ve.y+45,i.centre[2]):t.id==="PSU_FAN"?s=Qe(i.centre[0],Ve.y+35,i.centre[2]):i.flow==="intake"?s=Qe(...i.centre).sub(n.clone().multiplyScalar(.5)):s=Qe(...i.centre).add(n.clone().multiplyScalar(.18)),r.add(ad(s,n,.45,i.flow==="intake"?Ym:rd))}}var Qa=[[19,3898328],[22,6271216],[25,11066613],[28,15659764],[31,16163947],[34,14698539],[37,10491176]];function mf(r,e){let t=1;for(;t<Qa.length-1&&r>Qa[t][0];)t++;let[i,n]=Qa[t-1],[s,a]=Qa[t],o=Math.min(1,Math.max(0,(r-i)/(s-i)));return e.setHex(n).lerp(new Ue(a),o),e}function ff(r,e){let t=new DataView(r),i=t.getUint32(0,!0),n=t.getUint32(4,!0),s=new Uint16Array(r,8,i),a=8+i*2+(i%2?2:0),o=new Int16Array(r,a,n*5),c=new Float32Array(n*3),l=new Float32Array(n*3),h=new Float32Array(n),d=[],p=new Ue,u=0;for(let y=0;y<i;y++){let g=s[y],_=Math.random()*3;for(let x=0;x<g;x++,u++){let S=o[u*5]/10,w=o[u*5+1]/10,M=o[u*5+2]/10,D=Qe(S,w,M);if(c.set([D.x,D.y,D.z],u*3),mf(o[u*5+3]/100,p),l.set([p.r,p.g,p.b],u*3),x>0){let O=(o[u*5]-o[u*5-5])/1e4,N=(o[u*5+1]-o[u*5-4])/1e4,U=(o[u*5+2]-o[u*5-3])/1e4,V=Math.max(.03,(o[u*5+4]+o[u*5-1])/2e3);_+=Math.hypot(O,N,U)/V,d.push(u-1,u)}h[u]=_}}let f=new Ke;f.setAttribute("position",new bt(c,3)),f.setAttribute("color",new bt(l,3)),f.setAttribute("phase",new bt(h,1)),f.setIndex(d);let m=new Ut({uniforms:{time:e},vertexShader:`attribute float phase; attribute vec3 color; varying vec3 vColor; varying float vPhase;
      void main(){ vColor = color; vPhase = phase; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`uniform float time; varying vec3 vColor; varying float vPhase;
      void main(){
        float w = fract((vPhase - time) / 0.45);
        float pulse = smoothstep(0.0, 0.08, w) * (1.0 - smoothstep(0.08, 0.6, w));
        gl_FragColor = vec4(vColor * (0.8 + 0.45 * pulse), 0.07 + 0.93 * pulse);   // la l\xEDnea casi no se ve: manda el pulso
      }`,transparent:!0,depthWrite:!1});return new Ki(f,m)}function ad(r,e,t,i){let n=new Mt,s=.13,a=new _n({color:i,transparent:!0,opacity:.95}),o=new Oe(new xi(.016,.016,t-s,10),a);o.position.y=(t-s)/2;let c=new Oe(new tr(.06,s,14),a);return c.position.y=t-s/2,n.add(o,c),n.position.copy(r),n.quaternion.setFromUnitVectors(new A(0,1,0),e.clone().normalize()),n}var gf={measured:"Measured",official:"Official spec",photo:"From photos",assumed:"Assumed \xB7 to measure"},_f={heat:"Heat source",fan:"Fan",duct:"Printed duct",structure:"Structure",porous:"Porous \xB7 cables / grille"};function vf(r){let e=r.box?.size?.map(i=>Number.isInteger(i)?i:i.toFixed(1)).join(" \xD7 "),t=r.heat_W?` \xB7 ~${r.heat_W} W`:"";jm.innerHTML=`<small>${eo(_f[r.role]||"")} \xB7 ${eo(gf[r.certainty]||"")}</small><strong>${eo(r.label)}</strong><span>${e?`${e} mm${t} \xB7 `:""}${eo(r.basis||"")}</span>`}function eo(r){return String(r).replace(/[&<>'"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[e])}})();
/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
