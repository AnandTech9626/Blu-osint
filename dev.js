const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '=====================================================');
console.log('\x1b[36m%s\x1b[0m', '  Starting Blu OSINT (Backend + Frontend)            ');
console.log('\x1b[36m%s\x1b[0m', '  Backend:  http://localhost:3001                    ');
console.log('\x1b[36m%s\x1b[0m', '  Frontend: http://localhost:5174                    ');
console.log('\x1b[36m%s\x1b[0m', '=====================================================\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
});

const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\nStopping Blu OSINT servers...');
  if (isWin) {
    if (server.pid) {
      try { spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t']); } catch {}
    }
    if (client.pid) {
      try { spawn('taskkill', ['/pid', client.pid.toString(), '/f', '/t']); } catch {}
    }
  } else {
    server.kill('SIGTERM');
    client.kill('SIGTERM');
  }
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
