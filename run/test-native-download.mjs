import fs from 'node:fs';
import http from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=http.createServer((req,res)=>{
 const format=req.url==='/image.png'?'png':'jpg';
 res.end(fs.readFileSync('output/r08/local/result.'+format));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 const base='http://127.0.0.1:'+server.address().port;
 const child=spawn(process.execPath,['runtime/installed-skill/html-export/scripts/save-ardot.mjs','--png-url',base+'/image.png','--jpg-url',base+'/image.jpg','--out-dir','output/native','--name','download'],{stdio:['ignore','pipe','pipe']});
 let stdout='',stderr='';child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr+=d);
 const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve)});
 assert.equal(code,0,stderr);const result=JSON.parse(stdout);assert.equal(result.status,'completed');
 for(const file of result.files){assert.equal(file.width,1280);assert.equal(file.height,2400);assert.ok(fs.existsSync(file.path))}
 assert.deepEqual(result.files.map(f=>f.format),['png','jpg']);console.log('NATIVE_DOWNLOAD_RESULT='+stdout.trim());
}finally{await new Promise(resolve=>server.close(resolve))}
