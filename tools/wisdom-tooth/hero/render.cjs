const {chromium}=require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const dir=__dirname; const srv=http.createServer((q,s)=>{const p=((u)=>u==='/model-viewer-umd.js'?path.join(dir,'../../../node_modules/@google/model-viewer/dist/model-viewer-umd.js'):u==='/impacted-molar.glb'?path.join(dir,'../../../public/models/impacted-molar.glb'):path.join(dir,u))(decodeURIComponent(q.url.split('?')[0]));try{const d=fs.readFileSync(p);s.writeHead(200,{'content-type':p.endsWith('.js')?'text/javascript':p.endsWith('.html')?'text/html':'application/octet-stream'});s.end(d)}catch{s.writeHead(404);s.end()}}).listen(8765);
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const pg=await b.newPage({viewport:{width:1536,height:1024}});
const jobs=JSON.parse(process.argv[2]);
for(const [name,qs] of jobs){await pg.goto('http://localhost:8765/index.html?'+qs);await pg.waitForFunction(()=>document.title==='ready',null,{timeout:120000});await pg.screenshot({path:path.resolve(name+'.png')});console.log(name)}
await b.close();srv.close();})();
