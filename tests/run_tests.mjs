#!/usr/bin/env node
/**
 * run_tests.mjs — 解析器的回归测试。
 *
 * 用法: node tests/run_tests.mjs
 *
 * 为什么需要它：parse_reviews.mjs 是正则密集的启发式解析器，而本仓库欢迎贡献者
 * 补规则卡与报解析失败。没有测试，任何一次「顺手改改正则」都可能静默破坏
 * 攻单顺序或字符预算。这里锁住的是**行为**，不是实现。
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PARSE = join(HERE, '..', 'skills', 'ccfa-rebuttal', 'scripts', 'parse_reviews.mjs');
const ASSEMBLE = join(HERE, '..', 'skills', 'ccfa-rebuttal', 'scripts', 'assemble_rebuttal.mjs');

let pass = 0, fail = 0;
const fails = [];

function check(name, cond, extra) {
  if (cond) { pass++; return; }
  fail++;
  fails.push(name + (extra ? ` — ${extra}` : ''));
}

function parse(fixture, args = []) {
  const out = mkdtempSync(join(tmpdir(), 'ccfa-rt-'));
  const r = spawnSync(process.execPath, [PARSE, join(HERE, 'fixtures', fixture), '--out', out, '--json', ...args], { encoding: 'utf8' });
  if (r.status !== 0) {
    check(`parse ${fixture} 退出码 0`, false, `got ${r.status}: ${r.stderr.slice(0, 200)}`);
    return { ws: null, out };
  }
  const lines = r.stdout.trim().split('\n');
  const jsonLine = lines[lines.length - 1];
  let ws = null;
  try { ws = JSON.parse(jsonLine); } catch (e) { check(`parse ${fixture} 输出可解析 JSON`, false, e.message); }
  return { ws, out };
}

/* ---- OpenReview 形态 ---- */
{
  const { ws, out } = parse('openreview.txt', ['--limit', '1500', '--threshold', '6']);
  if (ws) {
    check('openreview: 2 位审稿人', ws.meta.reviewer_count === 2, String(ws.meta.reviewer_count));
    check('openreview: 识别出 aA1/bB2', ws.reviewers.map((r) => r.id).sort().join(',') === 'aA1,bB2');
    check('openreview: 攻单顺序先 aA1（高置信度负分）', ws.reviewers[0].id === 'aA1', ws.reviewers[0].id);
    check('openreview: aA1 判为负分 T1', ws.reviewers[0].negative === true && ws.reviewers[0].tier === 1);
    check('openreview: bB2 判为正分 T3', ws.reviewers[1].negative === false && ws.reviewers[1].tier === 3);
    const a = ws.reviewers.find((r) => r.id === 'aA1');
    const cats = a.items.filter((i) => i.section !== 'strength').map((i) => i.category);
    check('openreview: aA1 三条问题分类正确', cats.join(',') === 'novelty,baseline,scalability', cats.join(','));
    check('openreview: aA1/W1 无 hard-signal 时判为 major（不升级为 blocker）', a.items.find((i) => i.label === 'W1').severity === 'major');
    const b = ws.reviewers.find((r) => r.id === 'bB2');
    check('openreview: bB2/W1 泄漏指控判为 soundness+blocker', b.items[0].category === 'soundness' && b.items[0].severity === 'blocker');
    check('openreview: 标签在审稿人内唯一', new Set(a.items.map((i) => i.label)).size === a.items.length);
  }
  // check 与 assemble 必须能跑通且退出码 0
  const c = spawnSync(process.execPath, [PARSE, '--check', out], { encoding: 'utf8' });
  check('openreview: --check 退出码 0', c.status === 0, c.stderr.slice(0, 120));
  const asm = spawnSync(process.execPath, [ASSEMBLE, out], { encoding: 'utf8' });
  check('openreview: assemble 退出码 0', asm.status === 0, asm.stderr.slice(0, 120));
  check('openreview: assemble 报告未填条目', /未填/.test(asm.stdout), asm.stdout.slice(0, 120));
  rmSync(out, { recursive: true, force: true });
}

/* ---- CMT bullet 形态（无小标题）---- */
{
  const { ws } = parse('cmt_bullets.txt', ['--threshold', '6']);
  if (ws) {
    check('bullets: 1 位审稿人 3 条问题', ws.meta.reviewer_count === 1 && ws.meta.question_count === 3, String(ws.meta.question_count));
    const cats = ws.reviewers[0].items.map((i) => i.category);
    check('bullets: 分类 novelty/baseline/clarity', cats.join(',') === 'novelty,baseline,clarity', cats.join(','));
    check('bullets: 4 分判为负分', ws.reviewers[0].negative === true);
  }
}

/* ---- 无冒号小标题 + 数字编号 ---- */
{
  const { ws } = parse('numbered_noheading.txt', ['--threshold', '6']);
  if (ws) {
    check('numbered: 2 条问题', ws.meta.question_count === 2, String(ws.meta.question_count));
    const cats = ws.reviewers[0].items.map((i) => i.category);
    check('numbered: 分类 experiment/scalability（主题优先，二者打法同为 evidence）', cats.join(',') === 'experiment,scalability', cats.join(','));
  }
}

/* ---- 中文审稿意见 ---- */
{
  const { ws } = parse('chinese.txt', ['--threshold', '6']);
  if (ws) {
    check('chinese: 4 条问题', ws.meta.question_count === 4, String(ws.meta.question_count));
    check('chinese: 抽出评分 4', ws.reviewers[0].score === 4, String(ws.reviewers[0].score));
    check('chinese: 抽出置信度 4（熟悉）', ws.reviewers[0].confidence === 4, String(ws.reviewers[0].confidence));
    const cats = ws.reviewers[0].items.map((i) => i.category);
    check('chinese: 分类含 novelty/experiment/clarity/reproducibility',
      cats.join(',') === 'novelty,experiment,clarity,reproducibility', cats.join(','));
  }
}

/* ---- 退化输入：整段一行 ---- */
{
  const { ws } = parse('degenerate_oneline.txt', ['--threshold', '6']);
  if (ws) {
    check('degenerate: 解析出 0 条并报警而非崩溃', ws.meta.question_count === 0, String(ws.meta.question_count));
  }
}

console.log(`\n测试：${pass} 通过 / ${fail} 失败`);
if (fail) {
  console.log('失败项：');
  for (const f of fails) console.log('  ✗ ' + f);
  process.exit(1);
}
console.log('全部通过。');
