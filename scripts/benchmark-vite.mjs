import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const start = performance.now();
const viteCli = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const child = spawn(process.execPath, [viteCli, 'build', '--emptyOutDir'], {
  cwd: process.cwd(),
  stdio: 'inherit',
});

child.on('close', (code) => {
  const duration = ((performance.now() - start) / 1000).toFixed(2);
  console.log(`Vite production build duration: ${duration}s`);
  process.exit(code ?? 1);
});