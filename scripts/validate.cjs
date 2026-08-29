const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'carbtune-validation-'));
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function serve(request, response) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const target = path.resolve(root, relative);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  fs.readFile(target, (error, body) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end(error.code === 'ENOENT' ? 'Not found' : 'Read error');
      return;
    }
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(target).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    response.end(body);
  });
}

function runTest(file, environment) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== ${file} ===`);
    const child = spawn(process.execPath, [path.join(root, file)], {
      cwd: root,
      env: environment,
      stdio: 'inherit'
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${file} failed${signal ? ` with signal ${signal}` : ` with exit code ${code}`}`));
    });
  });
}

async function main() {
  const server = http.createServer(serve);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const environment = {
    ...process.env,
    CARBTUNE_URL: `http://127.0.0.1:${address.port}`,
    CARBTUNE_SCREENSHOT: process.env.CARBTUNE_SCREENSHOT || path.join(temporary, 'vehicle-cascade.png'),
    CARBTUNE_SCREENSHOT_DIR: process.env.CARBTUNE_SCREENSHOT_DIR || path.join(temporary, 'responsive')
  };
  if (!environment.CHROME_PATH && process.platform === 'win32') {
    const installedChrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (fs.existsSync(installedChrome)) environment.CHROME_PATH = installedChrome;
  }

  const tests = [
    'tests/build51.test.mjs',
    'tests/vehicle-applications.test.mjs',
    'tests/project-control.test.mjs',
    'tests/vehicle-cascade.browser.cjs',
    'tests/validate-workflow.cjs'
  ];

  try {
    console.log(`CarbTune validation server: ${environment.CARBTUNE_URL}`);
    for (const test of tests) await runTest(test, environment);
    console.log(`\nCarbTune validation passed (${tests.length} test programs).`);
  } finally {
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(`\nVALIDATION FAILED: ${error.message}`);
  process.exitCode = 1;
});
