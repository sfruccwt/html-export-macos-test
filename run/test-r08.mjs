import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';

const script=process.argv[2]??'runtime/installed-skill/html-export/scripts/export-html.mjs';
const config=process.argv[3];
const source=fs.readFileSync('source/demo.html','utf8');
const embedded=source.match(/src="(data:image\/svg\+xml;charset=utf-8,[^"]+)"/)[1];
const server=http.createServer((req,res)=>{
 if(req.url==='/start'){res.writeHead(302,{Location:'/demo.html'});res.end();return}
 if(req.url==='/demo.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(source.replace(embedded,'leaf.svg'));return}
 if(req.url==='/leaf.svg'){res.setHeader('Content-Type','image/svg+xml');res.end(decodeURIComponent(embedded.split(',').slice(1).join(',')));return}
 res.writeHead(404);res.end('Not found');
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const results=[];
async function run(name,input,extra=[],expectedCode=0){
 const out='output/r08/'+name;
 const args=[script,'--input',input,'--out-dir',out,'--name','result',...extra,...(config?['--runtime-config',config]:[])];
 const child=spawn(process.execPath,args,{stdio:['ignore','pipe','pipe']});let stdout='',stderr='';
 child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr+=d);
 const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve)});
 assert.equal(code,expectedCode,stderr+'\n'+stdout);
 const receipt=JSON.parse(stdout.trim());assert.equal(receipt.skillVersion,'r08');
 if(expectedCode===0){
  assert.equal(receipt.status,'completed');assert.equal(receipt.verification.status,'passed');
  for(const file of receipt.files){assert.equal(file.width,1280);assert.equal(file.height,2400)}
  assert.equal(receipt.resourceFailures.length,0);
 }else assert.equal(receipt.status,expectedCode===2?'blocked':'failed');
 results.push({name,status:receipt.status,seconds:receipt.finishedUtc?(Date.parse(receipt.finishedUtc)-Date.parse(receipt.startedUtc))/1000:null,files:receipt.files?.map(f=>({format:f.format,width:f.width,height:f.height})),failure:receipt.failure,node:receipt.nodeVersion,browser:receipt.browserVersion});
 return receipt;
}
try{
 const local=await run('local','source/demo.html',['--selector','#poster','--transparent']);
 assert.equal(local.verification.files.find(f=>f.format==='png').hasTransparentPixels,true);
 const url=await run('url',base+'/start',['--selector','#poster']);
 assert.equal(url.finalURL,base+'/demo.html');assert.equal(url.images.length,1);assert.equal(url.images[0].embedded,false);
 const bad=await run('http-error',base+'/missing',[],1);assert.equal(bad.failure.stage,'navigate');assert.match(bad.failure.message,/HTTP 404/);assert.equal(bad.files.length,0);
 const ardot=await run('ardot-route','https://ardot.tencent.com/file/route-test',[],2);assert.equal(ardot.failure.code,'ARDOT_DESIGN_ROUTE');
 console.log('R08_RESULTS='+JSON.stringify(results));
}finally{await new Promise(resolve=>server.close(resolve))}
