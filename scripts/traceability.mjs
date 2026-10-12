#!/usr/bin/env node
/**
 * Genera la matriz de trazabilidad requisito → prueba → evidencia (CONST §4, ADR-0013).
 *
 * Entradas:
 *  - docs/01-especificacion/especificacion.md   (IDs activos: RF, CA, RNF)
 *  - reports/vitest.json                         (informe JSON de Vitest)
 *  - reports/playwright.json                     (informe JSON de Playwright, local)
 *  - reports/playwright-prod.json                (opcional: pruebas en producción)
 *  - docs/06-pruebas/verificacion-manual.md      (requisitos verificados por revisión)
 * Salida: docs/06-pruebas/matriz-trazabilidad.md
 * Código de salida ≠ 0 si algún CA o RNF activo no tiene una prueba que pase ni verificación manual.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const SPEC = 'docs/01-especificacion/especificacion.md';
const MANUAL = 'docs/06-pruebas/verificacion-manual.md';
const OUT = 'docs/06-pruebas/matriz-trazabilidad.md';
const REPORTS = [
  { file: 'reports/vitest.json', kind: 'vitest', env: 'local' },
  { file: 'reports/playwright.json', kind: 'playwright', env: 'local' },
  { file: 'reports/playwright-prod.json', kind: 'playwright', env: 'producción' },
];

// ---------- Especificación ----------
const spec = readFileSync(SPEC, 'utf8');
const specVersion = /\| SPEC \| ([\d.]+) \|/.exec(spec)?.[1] ?? '?';
const requirements = []; // { id, title, removed, criteria: [] }
let current = null;
for (const line of spec.split('\n')) {
  const rf = /^### (RF-\d+) · (.+)$/.exec(line);
  if (rf) {
    const removed = /Eliminado/.test(rf[2]);
    current = { id: rf[1], title: rf[2].replace(/~~/g, '').replace(/\s—.*$/, ''), removed, criteria: [] };
    requirements.push(current);
    continue;
  }
  const ca = /^- \*\*(CA-\d+\.\d+)\*\* (.+)$/.exec(line);
  if (ca && current) current.criteria.push({ id: ca[1], text: ca[2] });
  const rnf = /^\| (RNF-\d+) \| ([^|]+) \| ([^|]+) \|/.exec(line);
  if (rnf)
    requirements.push({ id: rnf[1], title: `${rnf[2].trim()}: ${rnf[3].trim()}`, removed: false, criteria: [], nonFunctional: true });
}

// ---------- Resultados de pruebas ----------
/** @type {{ id: string, title: string, status: 'passed'|'failed'|'skipped', env: string, project?: string, refs: string[] }[]} */
const tests = [];
const refsOf = (title) => [...title.matchAll(/\[((?:RF|RNF|CA|AME|ADR)-[\d.]+)\]/g)].map((m) => m[1]);
const idOf = (title) => /CP-[A-Z]-\d+/.exec(title)?.[0] ?? '—';

function collectPlaywright(suite, env, out) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const status = test.status === 'skipped' ? 'skipped' : test.status === 'expected' || test.status === 'flaky' ? 'passed' : 'failed';
      out.push({ id: idOf(spec.title), title: spec.title, status, env, project: test.projectName, refs: refsOf(spec.title) });
    }
  }
  for (const child of suite.suites ?? []) collectPlaywright(child, env, out);
}

const loaded = [];
for (const report of REPORTS) {
  if (!existsSync(report.file)) continue;
  const data = JSON.parse(readFileSync(report.file, 'utf8'));
  loaded.push(report);
  if (report.kind === 'vitest') {
    for (const file of data.testResults ?? []) {
      for (const a of file.assertionResults ?? []) {
        const status = a.status === 'passed' ? 'passed' : a.status === 'failed' ? 'failed' : 'skipped';
        tests.push({ id: idOf(a.title), title: a.title, status, env: report.env, refs: refsOf(a.title) });
      }
    }
  } else {
    for (const suite of data.suites ?? []) collectPlaywright(suite, report.env, tests);
  }
}

// ---------- Verificación manual ----------
const manual = new Map();
if (existsSync(MANUAL)) {
  for (const line of readFileSync(MANUAL, 'utf8').split('\n')) {
    const m = /^\| ((?:RF|RNF|CA)-[\d.]+) \| ([^|]+) \| ([^|]+) \|/.exec(line);
    if (m) manual.set(m[1], `${m[2].trim()} (${m[3].trim()})`);
  }
}

// ---------- Cruce ----------
const byRef = new Map();
for (const t of tests) for (const r of t.refs) byRef.set(r, [...(byRef.get(r) ?? []), t]);

const summarize = (list) => {
  const ids = new Map();
  for (const t of list) {
    const entry = ids.get(t.id) ?? { passed: 0, failed: 0, skipped: 0, envs: new Set() };
    entry[t.status]++;
    entry.envs.add(t.project ? `${t.env}/${t.project}` : t.env);
    ids.set(t.id, entry);
  }
  return [...ids]
    .sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true }))
    .map(([id, e]) => `${e.failed ? '❌' : e.passed ? '✅' : '⏭️'} ${id}`)
    .join('<br>');
};

const gaps = [];
const rows = [];
for (const req of requirements) {
  if (req.removed) {
    rows.push(`| **${req.id}** | ${req.title} | — | *Eliminado* | — |`);
    continue;
  }
  const units = req.nonFunctional ? [{ id: req.id, text: req.title }] : req.criteria;
  if (!req.nonFunctional) rows.push(`| **${req.id}** | ${req.title} | | | ${summarize(byRef.get(req.id) ?? []) || '—'} |`);
  for (const unit of units) {
    const covering = byRef.get(unit.id) ?? [];
    const passing = covering.some((t) => t.status === 'passed');
    const failing = covering.some((t) => t.status === 'failed');
    const viaManual = manual.get(unit.id);
    let state;
    if (failing) state = '❌ Falla';
    else if (passing) state = '✅ Verificado';
    else if (viaManual) state = '📝 Revisión';
    else state = '⚠️ Sin prueba';
    if (failing || (!passing && !viaManual)) gaps.push(`${unit.id} (${state})`);
    const text = unit.text.replace(/\|/g, '\\|').slice(0, 140);
    rows.push(
      `| ${req.nonFunctional ? `**${unit.id}**` : `↳ ${unit.id}`} | ${text} | ${summarize(covering) || (viaManual ?? '—')} | ${state} | |`,
    );
  }
}

// Amenazas cubiertas (modelo de amenazas).
const threatRows = [...new Set(tests.flatMap((t) => t.refs.filter((r) => r.startsWith('AME-') || r.startsWith('ADR-'))))]
  .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
  .map((ref) => `| ${ref} | ${summarize(byRef.get(ref))} |`);

const totals = { passed: 0, failed: 0, skipped: 0 };
for (const t of tests) totals[t.status]++;
const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

const md = `| ID | Versión | Estado | Fecha |
|---|---|---|---|
| TRAZ | generada | ${gaps.length ? 'Con huecos' : 'Completa'} | ${now} UTC |

# Matriz de trazabilidad

> Documento **generado automáticamente** por \`npm run traceability\` (scripts/traceability.mjs). No editar a mano.

- Especificación: \`SPEC\` ${specVersion}
- Informes: ${loaded.map((r) => `\`${r.file}\` (${r.env})`).join(', ') || 'ninguno'}
- Ejecuciones de prueba: ✅ ${totals.passed} superadas · ❌ ${totals.failed} fallidas · ⏭️ ${totals.skipped} omitidas
- Criterios sin evidencia: **${gaps.length}**${gaps.length ? ` → ${gaps.join(', ')}` : ''}

Leyenda: ✅ prueba superada (en todos los navegadores/entornos donde se ejecuta) · ❌ alguna ejecución falla · ⏭️ omitida · 📝 verificado por revisión ([verificacion-manual.md](verificacion-manual.md)).
Prefijos de prueba: \`CP-U\` unitaria · \`CP-I\` integración API · \`CP-C\` componente · \`CP-E\` extremo a extremo · \`CP-A\` accesibilidad · \`CP-P\` producción.

## Requisitos → pruebas

| Requisito / criterio | Descripción | Pruebas | Estado | Pruebas del requisito |
|---|---|---|---|---|
${rows.join('\n')}

## Amenazas y decisiones de seguridad → pruebas

| Referencia | Pruebas |
|---|---|
${threatRows.join('\n')}
`;

writeFileSync(OUT, md);
console.log(
  `Matriz escrita en ${OUT}: ${totals.passed} ejecuciones superadas, ${totals.failed} fallidas, ${gaps.length} criterios sin evidencia.`,
);
if (gaps.length) {
  console.error(`Criterios sin evidencia: ${gaps.join(', ')}`);
  process.exit(1);
}
