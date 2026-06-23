import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';

const processes = [
  spawn(`${npm} --prefix server run dev`, {
    stdio: 'inherit',
    shell: true,
  }),
  spawn(`${npm} run dev:client`, {
    stdio: 'inherit',
    shell: true,
  }),
];

let shuttingDown = false;

function stopAll(signal = 'SIGTERM') {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of processes) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

for (const child of processes) {
  child.on('exit', (code, signal) => {
    if (!shuttingDown && code !== 0) {
      stopAll(signal || 'SIGTERM');
      process.exitCode = code || 1;
    }
  });
}

process.on('SIGINT', () => {
  stopAll('SIGINT');
});

process.on('SIGTERM', () => {
  stopAll('SIGTERM');
});
