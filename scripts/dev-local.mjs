/** Starts both loopback services; neither process connects to a cloud model. */
import { spawn } from 'node:child_process';
const children = [
  spawn(process.execPath,['local-server.mjs'],{stdio:'inherit'}),
  spawn('npm',['run','dev:web'],{stdio:'inherit',shell:process.platform==='win32'})
];
for (const child of children)child.on('error',error=>console.error(`Local service failed: ${error.message}`));
const stop = () => { for (const child of children) if(!child.killed)child.kill('SIGTERM'); };
process.on('SIGINT',()=>{stop();process.exit(0)});
process.on('SIGTERM',()=>{stop();process.exit(0)});
