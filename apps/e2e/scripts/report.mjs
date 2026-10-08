// Runs the e2e suite in headless Chromium and builds cypress/report/index.html:
// one section per spec, one card per test, with the screenshots `cy.snap()` took.
// Usage: npm run e2e:report [-- --spec "cypress/e2e/cart.cy.ts"]
import cypress from "cypress";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportDir = path.join(root, "cypress/report");
const shotsDir = path.join(reportDir, "screenshots");
const specArg = process.argv.includes("--spec")
    ? process.argv[process.argv.indexOf("--spec") + 1]
    : undefined;

fs.rmSync(reportDir, { recursive: true, force: true });
fs.mkdirSync(reportDir, { recursive: true });

const run = await cypress.run({
    browser: "chromium",
    headless: true,
    ...(specArg ? { spec: specArg } : {}),
    config: { screenshotsFolder: shotsDir, screenshotOnRunFailure: true },
});

if (run.status === "failed") {
    console.error(run.message);
    process.exit(1);
}

const esc = (text) =>
    String(text).replace(
        /[&<>"]/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Screenshots of one spec, oldest first. File names are "<test slug>__<caption>.png". */
const shotsOf = (specFile) => {
    const dir = path.join(shotsDir, path.basename(specFile));
    if (!fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir)
        .filter((file) => file.endsWith(".png"))
        .map((file) => ({
            file,
            rel: path.posix.join("screenshots", path.basename(specFile), file),
            mtime: fs.statSync(path.join(dir, file)).mtimeMs,
            owner: file.replace(/\.png$/, "").split("__")[0],
            caption:
                file
                    .replace(/\.png$/, "")
                    .split("__")
                    .slice(1)
                    .join("__") || file,
        }))
        .sort((a, b) => a.mtime - b.mtime);
};

const sections = run.runs.map((specRun) => {
    const shots = shotsOf(specRun.spec.relative);
    const tests = specRun.tests.map((test) => {
        const key = slug(test.title.join(" "));
        // a failure screenshot is named "<suite> -- <test> (failed).png"
        const own = shots.filter(
            (shot) =>
                shot.owner === key ||
                slug(
                    shot.file.replace(/\.png$/, "").replace(/\(failed\)/, ""),
                ) === key,
        );
        return { test, own };
    });
    return { spec: specRun.spec.relative, tests };
});

const stateLabel = { passed: "passou", failed: "falhou", pending: "pulado" };
const totals = { passed: 0, failed: 0, pending: 0 };
let shotCount = 0;

const body = sections
    .map(({ spec, tests }) => {
        const cards = tests
            .map(({ test, own }) => {
                totals[test.state] = (totals[test.state] ?? 0) + 1;
                shotCount += own.length;
                const figures = own
                    .map((shot) => {
                        const caption = shot.caption.replace(
                            /\(failed\)/,
                            "(falhou)",
                        );
                        return `<figure><a href="${esc(shot.rel)}"><img loading="lazy" src="${esc(shot.rel)}" alt="${esc(caption)}"></a><figcaption>${esc(caption)}</figcaption></figure>`;
                    })
                    .join("");
                const err = test.displayError
                    ? `<pre>${esc(test.displayError.split("\n").slice(0, 6).join("\n"))}</pre>`
                    : "";
                return `<article class="test ${test.state}"><h3><span class="pill">${stateLabel[test.state] ?? test.state}</span>${esc(test.title.slice(1).join(" › ") || test.title[0])}<small>${(test.duration / 1000).toFixed(1)}s</small></h3>${err}${figures ? `<div class="shots">${figures}</div>` : ""}</article>`;
            })
            .join("");
        return `<section><h2>${esc(spec)}</h2>${cards}</section>`;
    })
    .join("");

const commit = (() => {
    try {
        return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
            cwd: root,
            encoding: "utf8",
        }).trim();
    } catch {
        return "";
    }
})();

fs.writeFileSync(
    path.join(reportDir, "index.html"),
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pizzaria ON e2e</title>
<style>
:root{--bg:#f6f1ea;--fg:#231815;--card:#fff;--ok:#1f8a4c;--bad:#d63a2f;--muted:#7a6f69}
@media(prefers-color-scheme:dark){:root{--bg:#1b1512;--fg:#f3ebe4;--card:#2a211d;--muted:#a99d95}}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.4 system-ui,sans-serif}
header,section{max-width:1200px;margin:0 auto;padding:16px}
h1{margin:16px 0 4px}h2{margin:32px 0 8px;font-size:1.1rem;border-bottom:2px solid var(--muted);padding-bottom:4px}
.summary{display:flex;gap:16px;flex-wrap:wrap;color:var(--muted)}
.test{background:var(--card);border-radius:12px;padding:12px 16px;margin:12px 0;border-left:6px solid var(--ok)}
.test.failed{border-color:var(--bad)}.test.pending{border-color:var(--muted)}
.test h3{margin:0 0 8px;font-size:1rem;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.test small{margin-left:auto;color:var(--muted);font-weight:400}
.pill{background:var(--ok);color:#fff;border-radius:99px;padding:2px 10px;font-size:.75rem}
.failed .pill{background:var(--bad)}.pending .pill{background:var(--muted)}
.shots{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
figure{margin:0}figure img{width:100%;border-radius:8px;border:1px solid #0002;display:block}
figcaption{font-size:.85rem;color:var(--muted);padding-top:4px}
pre{background:#0001;padding:8px;border-radius:8px;overflow:auto;font-size:.8rem}
</style></head><body>
<header><h1>Pizzaria ON — relatório e2e</h1>
<div class="summary"><span>${totals.passed} passaram</span><span>${totals.failed} falharam</span><span>${totals.pending} pulados</span><span>${shotCount} capturas</span><span>${new Date().toLocaleString("pt-BR")}</span>${commit ? `<span>commit ${esc(commit)}</span>` : ""}</div></header>
${body}</body></html>`,
);

console.log(`\nReport: ${path.join(reportDir, "index.html")}`);
process.exit(totals.failed > 0 ? 1 : 0);
