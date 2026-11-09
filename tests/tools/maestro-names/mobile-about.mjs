import { createServer } from 'node:http'
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { resolve, join, extname, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { build } from 'esbuild'
import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import {
  mobileWebAppBuildOptions,
  MOBILE_WEB_APP_ROOT_RESET,
  MOBILE_WEB_APP_NATIVE_PARITY_STYLE
} from '../../../config/scripts/build/mobile-web-app/build-mobile-web-app-bundle.mjs'
const mobileDir = resolve('mobile')
const out = resolve('.local/names/mobile-about')
await mkdir(out, { recursive: true })
const entry = `import {createElement as h} from 'react';import {createRoot} from 'react-dom/client';import {SafeAreaProvider} from 'react-native-safe-area-context';import About from './src/settings/about-screen';createRoot(document.getElementById('root')).render(h(SafeAreaProvider,{initialMetrics:{frame:{x:0,y:0,width:375,height:812},insets:{top:0,right:0,bottom:0,left:0}}},h(About,{onBack:()=>{},openExternal:async()=>{},versionLabel:'Brand preview'})));`
await build({
  ...mobileWebAppBuildOptions([]),
  entryPoints: undefined,
  stdin: { contents: entry, resolveDir: mobileDir, loader: 'js', sourcefile: 'brand-about.js' },
  splitting: false,
  write: true,
  outdir: out,
  entryNames: 'about',
  metafile: false
})
await writeFile(
  join(out, 'index.html'),
  `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${MOBILE_WEB_APP_ROOT_RESET}${MOBILE_WEB_APP_NATIVE_PARITY_STYLE}</head><body><div id="root"></div><script type="module" src="/about.js"></script></body></html>`
)
const types = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2'
}
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname
  const file = pathname === '/' ? join(out, 'index.html') : resolve(out, `.${pathname}`)
  if (!file.startsWith(out + sep)) {
    res.writeHead(403)
    res.end()
    return
  }
  try {
    res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream')
    res.end(await readFile(file))
  } catch {
    res.writeHead(404)
    res.end()
  }
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const home = await mkdtemp(join(tmpdir(), 'names-mobile-about-'))
let browser
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: chromium.executablePath(),
    env: { ...process.env, HOME: home, ORCA_BACKGROUND_LAUNCH: '1' }
  })
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`http://127.0.0.1:${server.address().port}/`)
  await page.getByText('Maestro', { exact: true }).waitFor()
  await page.evaluate(() => document.fonts.ready)
  const text = await page.locator('body').innerText()
  assert.doesNotMatch(text, /orca/i)
  assert.deepEqual(errors, [])
  await page.screenshot({ path: 'docs/maestro/qa/names-mobile-about.png' })
  await writeFile(
    'docs/maestro/qa/names-mobile-about.json',
    `${JSON.stringify(
      {
        kind: 'React Native Web presentational fixture',
        source: 'mobile/src/settings/about-screen.tsx',
        viewport: { width: 375, height: 812 },
        text,
        errors,
        passed: true
      },
      null,
      2
    )}\n`
  )
  console.log(text)
} finally {
  await browser?.close()
  server.closeAllConnections()
  await new Promise((done) => server.close(done))
  await rm(home, { recursive: true, force: true })
}
