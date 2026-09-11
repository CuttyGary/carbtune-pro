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

function runTest(stage, file, environment) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== ${stage}: ${file} ===`);
    const child = spawn(process.execPath, [path.join(root, file)], {
      cwd: root,
      env: environment,
      stdio: 'inherit'
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${stage} (${file}) failed${signal ? ` with signal ${signal}` : ` with exit code ${code}`}`));
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

  const stages = [
    ['JavaScript / syntax integrity', 'tests/build51.test.mjs'],
    ['Vehicle registry and provenance integrity', 'tests/vehicle-applications.test.mjs'],
    ['Project control and data-policy integrity', 'tests/project-control.test.mjs'],
    ['Versioned service contracts and validation truth', 'tests/service-contracts.test.mjs'],
    ['Relational vehicle cascade browser regressions', 'tests/vehicle-cascade.browser.cjs'],
    ['Legacy workflow, persistence, provenance, and UI smoke regressions', 'tests/validate-workflow.cjs'],
    ['CT-0061 redesigned workflow and evidence boundaries', 'tests/redesign.browser.cjs']
  ];

  try {
    console.log(`CarbTune validation server: ${environment.CARBTUNE_URL}`);
    const selected = process.env.CARBTUNE_TEST ? stages.filter(([,test])=>test===process.env.CARBTUNE_TEST) : stages;
    if (!selected.length) throw new Error('CARBTUNE_TEST did not match a canonical test program');
    for (const [stage, test] of selected) {
      const legacy = ['tests/vehicle-cascade.browser.cjs', 'tests/validate-workflow.cjs'].includes(test);
      await runTest(stage, test, legacy ? { ...environment, CARBTUNE_URL: environment.CARBTUNE_URL + '/?workflow=legacy' } : environment);
    }
    console.log(`\nCarbTune validation passed (${selected.length} test programs).`);
  } finally {
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(`\nVALIDATION FAILED: ${error.message}`);
  process.exitCode = 1;
});
