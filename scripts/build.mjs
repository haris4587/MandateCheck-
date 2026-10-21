import {build} from 'esbuild';
import fs from 'node:fs/promises';
await fs.mkdir('dist',{recursive:true});
await build({entryPoints:['app.js'],bundle:true,format:'esm',target:'es2022',outfile:'dist/app.js',minify:true,define:{'process.env.NODE_ENV':'"production"'}});
for(const name of ['index.html','style.css','deployment.json'])await fs.copyFile(name,'dist/'+name);
await fs.copyFile('contracts/mandate_check.py','dist/mandate_check.py');
console.log('Static application built.');

try{await fs.copyFile('docs/demo/mandatecheck-demo.mp4','dist/frontend-demo.mp4');}catch(e){if(e.code!=='ENOENT')throw e;}
