import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(process.cwd());
const failures = [];
const passes = [];

const protectedFiles = new Map([
  ["privacy-policy/index.html", "8350e3718473ccc08df01875bc2515f9ee30da92c08b53141076afc94141b6cc"],
  ["app-ads.txt", "5eab6fab9aa4a650ce0c2c9b15f743b90b9b25a924b2bc9df9c6888f3fd5fdea"],
  ["CNAME", "e5d4738714b9e8b9de9e95803b15cec3d32b1b2b6c872fb3787c2c350d695db4"]
]);

const identityAssets = new Map([
  ["assets/images/store/app-store-en.svg", "a26fc5b38380272c92e9019a2eb8b45542a66814b3e2b203772db8904b9fb99f"],
  ["assets/images/store/google-play-en.png", "f72611e2df8e88204009fd896d05d5e8e83c77009c63943bbffa169559934849"],
  ["assets/images/device/brand-neutral-phone-frame-v1.webp", "4bfdced4f2d35f8a2cedd719d9a5fe764133728faacdaba9e94232fe8d637c88"]
]);

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

for (const [relativePath, expectedHash] of protectedFiles) {
  const path = join(root, relativePath);
  if (!existsSync(path)) {
    fail(`Protected file missing: ${relativePath}`);
  } else if (sha256(path) !== expectedHash) {
    fail(`Protected file changed: ${relativePath}`);
  } else {
    pass(`Protected hash exact: ${relativePath}`);
  }
}

for (const [relativePath, expectedHash] of identityAssets) {
  const path = join(root, relativePath);
  if (!existsSync(path)) {
    fail(`Identity asset missing: ${relativePath}`);
  } else if (sha256(path) !== expectedHash) {
    fail(`Identity asset changed: ${relativePath}`);
  } else {
    pass(`Identity asset hash exact: ${relativePath}`);
  }
}

const required = [
  "index.html",
  "assets/css/site.css",
  "assets/js/site.js",
  "assets/images/brand/app-icon-192.png",
  "assets/images/brand/rgb-block-puzzle-social.jpg",
  "assets/images/store/app-store-en.svg",
  "assets/images/store/google-play-en.png",
  "assets/images/device/brand-neutral-phone-frame-v1.webp",
  "assets/video/gameplay-classic-arcade-poster.webp",
  "assets/video/gameplay-classic-arcade.mp4",
  "robots.txt",
  "sitemap.xml"
];

for (const relativePath of required) {
  existsSync(join(root, relativePath)) ? pass(`Required file present: ${relativePath}`) : fail(`Required file missing: ${relativePath}`);
}

const html = readFileSync(join(root, "index.html"), "utf8");
const css = readFileSync(join(root, "assets/css/site.css"), "utf8");
const js = readFileSync(join(root, "assets/js/site.js"), "utf8");

if (/<script[^>]+src=["']https?:\/\//i.test(html) || /<link[^>]+rel=["']stylesheet["'][^>]+href=["']https?:\/\//i.test(html)) fail("Remote script or stylesheet dependency found");
else pass("No remote script or stylesheet dependency");

if (/<video[^>]*\sautoplay(?:\s|=|>)/i.test(html)) fail("Video autoplay attribute found");
else pass("No video autoplay");

if (!/<video[^>]*preload=["']none["']/i.test(html) || !/data-video-src=["']\/assets\/video\//i.test(html)) fail("Video deferred-load contract missing");
else pass("Video deferred-load contract present");

if (!css.includes("prefers-reduced-motion: reduce")) fail("Reduced-motion stylesheet missing");
else pass("Reduced-motion stylesheet present");

if (!html.includes('name="viewport"') || !html.includes("viewport-fit=cover")) fail("Responsive viewport/safe-area declaration missing");
else pass("Responsive viewport/safe-area declaration present");

if (!js.includes("rgbBlockPuzzleLanguage")) fail("Language storage compatibility key missing");
else pass("Language storage compatibility key preserved");

const obsoleteVisualTokens = ["store-button", "store-mark", "play-mark", "screenshot-frame", "hero-blocks", "trust-mark"];
const remainingObsoleteTokens = obsoleteVisualTokens.filter((token) => html.includes(token) || css.includes(token));
if (remainingObsoleteTokens.length) fail(`Obsolete imitation visuals remain: ${remainingObsoleteTokens.join(", ")}`);
else pass("Obsolete imitation visuals removed");

if (!html.includes("A game by Tolga YILMAZ") || !html.includes('"name": "Tolga YILMAZ"')) fail("Tolga YILMAZ developer identity missing");
else pass("Tolga YILMAZ visible and structured identity present");

if (!html.includes("device-mockup") || !html.includes("trust-visual")) fail("V2-A device/trust composition missing");
else pass("V2-A device and trust compositions present");

const refs = new Set();
for (const match of html.matchAll(/(?:href|src|poster|data-src|data-video-src)=["']([^"']+)["']/g)) {
  const reference = match[1];
  if (reference.startsWith("#") || reference.startsWith("http") || reference.startsWith("mailto:") || reference.startsWith("data:")) continue;
  refs.add(reference);
}

for (const reference of refs) {
  const clean = reference.split(/[?#]/)[0];
  let path = join(root, clean.replace(/^\//, ""));
  if (clean.endsWith("/")) path = join(path, "index.html");
  existsSync(path) ? pass(`Local reference exists: ${reference}`) : fail(`Broken local reference: ${reference}`);
}

const videoPath = join(root, "assets/video/gameplay-classic-arcade.mp4");
if (existsSync(videoPath)) {
  const bytes = statSync(videoPath).size;
  bytes <= 3 * 1024 * 1024 ? pass(`Video budget PASS: ${bytes} bytes`) : fail(`Video exceeds 3 MiB ceiling: ${bytes} bytes`);
}

const initialPaths = [
  "index.html",
  "assets/css/site.css",
  "assets/js/site.js",
  "assets/images/brand/app-icon-192.png",
  "assets/images/gameplay/hero-classic-720.webp",
  "assets/images/store/app-store-en.svg",
  "assets/images/store/google-play-en.png",
  "assets/images/device/brand-neutral-phone-frame-v1.webp"
];
const initialBytes = initialPaths.reduce((sum, path) => sum + statSync(join(root, path)).size, 0);
initialBytes <= 750 * 1024 ? pass(`Initial static asset budget PASS: ${initialBytes} bytes`) : fail(`Initial static asset budget exceeds 750 KiB: ${initialBytes} bytes`);

for (const message of passes) process.stdout.write(`PASS  ${message}\n`);
for (const message of failures) process.stderr.write(`FAIL  ${message}\n`);
process.stdout.write(`\nSUMMARY ${passes.length} PASS / ${failures.length} FAIL\n`);
if (failures.length) process.exitCode = 1;
