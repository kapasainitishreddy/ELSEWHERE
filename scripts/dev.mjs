import { spawn } from 'node:child_process';
const children = [];
for (const script of ['dev:api', 'dev:web']) {
  const child = spawn('npm', ['run', script], { stdio: 'inherit', shell: process.platform === 'win32' });
  children.push(child);
  child.on('error', (error) => console.error(`${script}: ${error.message}`));
}
function stop() { for (const child of children) if (!child.killed) child.kill('SIGTERM'); }
process.on('SIGINT', () => { stop(); process.exit(0); });
process.on('SIGTERM', () => { stop(); process.exit(0); });
