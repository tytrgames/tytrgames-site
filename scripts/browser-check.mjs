import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
];
const edge = edgeCandidates.find(existsSync);
if (!edge) throw new Error("Microsoft Edge was not found.");

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:4173/";
const port = 9333;
const profile = mkdtempSync(join(tmpdir(), "tytrgames-edge-"));
const outputDir = join(tmpdir(), "tytrgames-site-browser-check");
mkdirSync(outputDir, { recursive: true });

const browser = spawn(edge, [
  "--headless=new",
  "--disable-gpu",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank"
], { stdio: "ignore", windowsHide: true });

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForDebugger() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) return response.json();
    } catch (_) {
      // Edge is still starting.
    }
    await wait(100);
  }
  throw new Error("Edge DevTools endpoint did not start.");
}

function createClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  let nextId = 1;

  const opened = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  return {
    opened,
    close: () => socket.close(),
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    }
  };
}

const viewports = [
  { width: 320, height: 780 },
  { width: 360, height: 800 },
  { width: 390, height: 844, screenshot: "mobile-390-tr.png", language: "tr" },
  { width: 430, height: 900 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 1000, screenshot: "desktop-1440-en.png", language: "en" }
];

let failures = 0;
let client;

try {
  const targets = await waitForDebugger();
  const page = targets.find((target) => target.type === "page");
  if (!page) throw new Error("No Edge page target was found.");
  client = createClient(page.webSocketDebuggerUrl);
  await client.opened;
  await client.send("Page.enable");
  await client.send("Runtime.enable");

  for (const viewport of viewports) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.width < 768,
      screenWidth: viewport.width,
      screenHeight: viewport.height
    });
    await client.send("Page.navigate", { url: baseUrl });
    await wait(700);

    const language = viewport.language || "en";
    await client.send("Runtime.evaluate", {
      expression: `document.querySelector('[data-language="${language}"]')?.click()`
    });
    await wait(120);

    const evaluation = await client.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const root = document.documentElement;
        const body = document.body;
        const interactive = [...document.querySelectorAll('a, button')]
          .filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          })
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return { label: (element.textContent || element.getAttribute('aria-label') || element.tagName).trim().replace(/\\s+/g, ' ').slice(0, 60), width: Math.round(rect.width * 10) / 10, height: Math.round(rect.height * 10) / 10 };
          });
        return {
          innerWidth,
          rootClientWidth: root.clientWidth,
          rootScrollWidth: root.scrollWidth,
          bodyScrollWidth: body.scrollWidth,
          language: root.lang,
          smallTargets: interactive.filter((target) => target.width < 44 || target.height < 44),
          h1: (() => { const rect = document.querySelector('h1').getBoundingClientRect(); return { left: rect.left, right: rect.right, width: rect.width }; })(),
          header: (() => { const rect = document.querySelector('.header-inner').getBoundingClientRect(); return { left: rect.left, right: rect.right, width: rect.width, height: rect.height }; })()
        };
      })()`
    });

    const result = evaluation.result.value;
    const overflow = result.rootScrollWidth > result.rootClientWidth || result.bodyScrollWidth > result.rootClientWidth;
    const targetFailure = result.smallTargets.length > 0;
    if (overflow || targetFailure || result.innerWidth !== viewport.width) failures += 1;
    process.stdout.write(`${overflow || targetFailure ? "FAIL" : "PASS"} ${viewport.width}x${viewport.height} ${language.toUpperCase()} `
      + `viewport=${result.innerWidth} root=${result.rootClientWidth}/${result.rootScrollWidth} body=${result.bodyScrollWidth} `
      + `smallTargets=${JSON.stringify(result.smallTargets)}\n`);

    if (viewport.screenshot) {
      const capture = await client.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
      writeFileSync(join(outputDir, viewport.screenshot), Buffer.from(capture.data, "base64"));

      const sectionIds = viewport.width === 390
        ? ["gameplay", "arcade", "make-it-yours", "trust", "gallery", "download"]
        : ["gameplay", "arcade", "make-it-yours", "trust"];
      const stem = viewport.screenshot.replace(/\.png$/i, "");
      for (const sectionId of sectionIds) {
        await client.send("Runtime.evaluate", {
          expression: `(() => { const element = document.querySelector('#${sectionId}'); if (!element) return; const rect = element.getBoundingClientRect(); const target = rect.top + scrollY - ${sectionId === "trust" ? "Math.max(0, (innerHeight - rect.height) / 2)" : "0"}; window.scrollTo({ top: target, behavior: 'instant' }); })()`
        });
        await wait(180);
        const sectionCapture = await client.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
        writeFileSync(join(outputDir, `${stem}-${sectionId}.png`), Buffer.from(sectionCapture.data, "base64"));
      }

      if (viewport.width === 390) {
        await client.send("Page.navigate", { url: baseUrl });
        await wait(700);
        const initialVideo = await client.send("Runtime.evaluate", {
          returnByValue: true,
          expression: `(() => ({
            currentSrc: document.querySelector('#gameplay-video').currentSrc,
            mp4Requests: performance.getEntriesByType('resource').filter((entry) => entry.name.includes('gameplay-classic-arcade.mp4')).length
          }))()`
        });
        const initialDeferred = !initialVideo.result.value.currentSrc && initialVideo.result.value.mp4Requests === 0;
        process.stdout.write(`${initialDeferred ? "PASS" : "FAIL"} initial video transfer gate currentSrc=${JSON.stringify(initialVideo.result.value.currentSrc)} requests=${initialVideo.result.value.mp4Requests}\n`);
        if (!initialDeferred) failures += 1;

        await client.send("Runtime.evaluate", { expression: `document.querySelector('[data-video-play]').click()` });
        await wait(1200);
        const playingVideo = await client.send("Runtime.evaluate", {
          returnByValue: true,
          expression: `(() => {
            const video = document.querySelector('#gameplay-video');
            return { currentSrc: video.currentSrc, readyState: video.readyState, mp4Requests: performance.getEntriesByType('resource').filter((entry) => entry.name.includes('gameplay-classic-arcade.mp4')).length };
          })()`
        });
        const explicitLoad = playingVideo.result.value.currentSrc.endsWith("/assets/video/gameplay-classic-arcade.mp4")
          && playingVideo.result.value.readyState >= 2
          && playingVideo.result.value.mp4Requests >= 1;
        process.stdout.write(`${explicitLoad ? "PASS" : "FAIL"} explicit video load readyState=${playingVideo.result.value.readyState} requests=${playingVideo.result.value.mp4Requests}\n`);
        if (!explicitLoad) failures += 1;

        await client.send("Runtime.evaluate", { expression: `document.querySelector('[data-menu-toggle]').click()` });
        const menuState = await client.send("Runtime.evaluate", {
          returnByValue: true,
          expression: `(() => ({ expanded: document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded'), display: getComputedStyle(document.querySelector('[data-nav]')).display }))()`
        });
        const menuPass = menuState.result.value.expanded === "true" && menuState.result.value.display !== "none";
        process.stdout.write(`${menuPass ? "PASS" : "FAIL"} mobile menu expanded=${menuState.result.value.expanded} display=${menuState.result.value.display}\n`);
        if (!menuPass) failures += 1;
      }
    }
  }
} finally {
  if (client) client.close();
  browser.kill();
}

process.stdout.write(`Screenshots: ${outputDir}\n`);
if (failures) process.exitCode = 1;
