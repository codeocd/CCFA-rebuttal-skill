#!/usr/bin/env node
/**
 * assemble_rebuttal.mjs — 把分片草稿组装成可提交的成稿（闭合流水线最后一步）。
 *
 * 用法:
 *   node assemble_rebuttal.mjs <workspace目录> [-o 输出前缀]
 *
 * 产出:
 *   <前缀>.md   带元信息与用量表的成稿（给人看 / 存档）
 *   <前缀>.txt  纯正文（直接粘进提交框）
 *
 * 组装规则（全部确定性，不替作者做判断）:
 *   - 共性问题自动生成 C1..Cn 骨架；若该簇里已有成员填了答案，用第一条做 seed 并标注来源，
 *     其余留空槽 —— 合并成一句话是作者的判断，脚本不代写。
 *   - 分回复里属于某共性问题且自身未填的条目，自动写 `See Common Response Cn.`；
 *     既未填也不属于共性问题的条目，保留 `[待填]` 并在结尾列出。
 *   - 每位审稿人的字符数按与 --check / 工作台相同的口径统计并标注超限。
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const argv = process.argv.slice(2);
const dir = argv[0];
if (!dir) {
  console.log('用法: node assemble_rebuttal.mjs <workspace目录> [-o 输出前缀]');
  console.log('错误: 缺少工作区目录。先运行 parse_reviews.mjs。');
  process.exit(1);
}
const WS = resolve(dir);
const oi = argv.indexOf('-o');
const PREFIX = oi > -1 ? resolve(argv[oi + 1]) : join(WS, 'final-rebuttal');

const wsFile = join(WS, 'workspace.json');
if (!existsSync(wsFile)) {
  console.log(`错误: 找不到 ${wsFile.replace(/\\/g, '/')}。先运行 parse_reviews.mjs。`);
  process.exit(1);
}
let ws;
try { ws = JSON.parse(readFileSync(wsFile, 'utf8')); }
catch (e) { console.log(`错误: workspace.json 解析失败——${e.message.split('\n')[0]}`); process.exit(1); }

const LIMIT = ws.meta.char_limit_per_review;
const chars = (s) => [...String(s ?? '')].length;

/* 从分片里取每条的已填回答 */
function readAnswers(id) {
  const f = join(WS, 'reviews', `${id}.md`);
  const out = {};
  if (!existsSync(f)) return out;
  const body = readFileSync(f, 'utf8');
  for (const seg of body.split(/\n(?=## )/)) {
    const h = seg.match(/^## (\w+) —/);
    if (!h) continue;
    const m = seg.match(/\*\*回答\*\*：\n([\s\S]*?)(?=\n---|\n\*\*可复用|$)/);
    // 分片里可能已带 `**W1.**` 之类的标签；统一剥掉，由成稿加规范前缀，避免重复计数
    const ans = (m ? m[1] : '').replace(/^<!--\s*ANSWER:[^>]*-->/m, '').trim()
      .replace(/^\*\*\w+(?:\.\w+)?\.\*\*\s*/, '').replace(/^\*\*\w+\*\*\s*/, '');
    out[h[1]] = ans || '';
  }
  return out;
}

const answers = {};
for (const r of ws.reviewers) answers[r.id] = readAnswers(r.id);

/* 共性问题：编号 + seed */
const commons = (ws.common_concerns || []).map((c, i) => {
  const n = i + 1;
  let seed = null, seedFrom = null;
  for (const ref of c.items) {
    const [rid, lbl] = ref.split('/');
    const a = answers[rid]?.[lbl];
    if (a) { seed = a; seedFrom = ref; break; }
  }
  return { n, ...c, seed, seedFrom };
});
const commonOf = {}; // "R/W1" -> n
for (const c of commons) for (const ref of c.items) commonOf[ref] = c.n;

/* 组装每位审稿人的正文 */
const sections = [];
const usage = [];
const unfilled = [];

for (const r of ws.reviewers) {
  const items = r.items.filter((i) => i.section !== 'strength');
  const lines = [];
  for (const it of items) {
    const a = answers[r.id]?.[it.label] || '';
    const cn = commonOf[`${r.id}/${it.label}`];
    // 统一计数口径：计入文本 = `**标签.** ` + 正文（类别/严重度是内部元数据，不进提交文本）
    if (a) lines.push(`**${it.label}.** ${a}`);
    else if (cn && commons[cn - 1].seed) lines.push(`**${it.label}.** See Common Response C${cn}.`);
    else { lines.push(`**${it.label}.** [待填]`); unfilled.push(`${r.id}/${it.label}`); }
  }
  const body = lines.join('\n\n');
  const used = chars(body);
  usage.push({ id: r.id, used, over: used > LIMIT });
  sections.push({ id: r.id, used, body });
}

/* Common Responses 段 */
const commonLines = [];
for (const c of commons) {
  commonLines.push(`### C${c.n} — ${c.category}（${c.raised_by.join(', ')}）`);
  commonLines.push('');
  if (c.seed) {
    commonLines.push(`> seed 取自 ${c.seedFrom}，请改写为面向全体审稿人的一句话结论 + 证据位置 + 动作：`);
    commonLines.push('');
    commonLines.push(c.seed);
  } else {
    commonLines.push('[在此起草：一句话结论 → 证据位置（Sec./Table/Line）→ 具体动作]');
  }
  commonLines.push('');
}

/* 成稿 */
const md = [];
md.push('# Final Rebuttal（由 assemble_rebuttal.mjs 组装）', '');
md.push(`- 来源：\`${ws.meta.source}\``);
md.push(`- 每条上限：${LIMIT} 字符（按字符计，Markdown 符号同样计费）`);
md.push(`- 组装时间：${new Date().toISOString()}`);
md.push('');
md.push('| Reviewer | 已用字符 | 状态 |', '| --- | --- | --- |');
for (const u of usage) md.push(`| ${u.id} | ${u.used} / ${LIMIT} | ${u.over ? '❌ 超限' : '✅'} |`);
md.push('');
if (commons.length) {
  md.push('## Common Responses', '');
  md.push(...commonLines);
}
for (const s of sections) {
  md.push(`## Response to Reviewer ${s.id}（${s.used} / ${LIMIT} 字符）`, '');
  md.push(s.body, '');
}
if (unfilled.length) {
  md.push('---', '', `> ⚠️ 仍有 ${unfilled.length} 条未填：${unfilled.join(', ')}。`, '> 合并同类项可以，静默删除被点名的 W/Q 不行。');
}
writeFileSync(PREFIX + '.md', md.join('\n'), 'utf8');

/* 纯正文（粘贴用）：去掉元信息与用量表 */
const txt = [];
if (commons.length) { txt.push('Common Responses', ''); txt.push(...commonLines.map((l) => l.replace(/^### /, '').replace(/^> seed.*$/m, '').replace(/^> $/m, ''))); }
for (const s of sections) { txt.push(`--- Response to Reviewer ${s.id} ---`, '', s.body, ''); }
writeFileSync(PREFIX + '.txt', txt.join('\n').replace(/\n{3,}/g, '\n\n'), 'utf8');

/* 摘要 */
console.log(`✅ 成稿已组装：${(PREFIX + '.md').replace(/\\/g, '/')}`);
console.log(`   纯正文：${(PREFIX + '.txt').replace(/\\/g, '/')}`);
console.log('   用量：' + usage.map((u) => `${u.id} ${u.used}${u.over ? '(❌超)' : ''}`).join(' · '));
console.log(`   共性问题：${commons.length} 组（C1..C${commons.length}），其中 ${commons.filter((c) => c.seed).length} 组已有 seed`);
if (unfilled.length) {
  console.log(`   ⚠️ 未填 ${unfilled.length} 条：${unfilled.join(', ')}`);
  console.log('   未填且不属于共性问题的条目会保留 [待填]，提交前必须处理。');
} else {
  console.log('   全部条目已有内容或已指向 Common Response。');
}
const over = usage.filter((u) => u.over);
if (over.length) console.log(`   ❌ ${over.map((u) => u.id).join(', ')} 超出 ${LIMIT} 字符，无法提交。`);
