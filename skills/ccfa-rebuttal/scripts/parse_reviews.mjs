#!/usr/bin/env node
/**
 * parse_reviews.mjs — 把审稿意见原文解析成 rebuttal 工作区（工作清单 + 分片草稿 + 字符预算）。
 *
 * 用法:
 *   node parse_reviews.mjs <reviews.txt> [--out DIR] [--limit N] [--threshold N]
 *                          [--max-confidence N] [--lang en|zh] [--json]
 *
 * 设计约定（写给使用本脚本的 agent）:
 *   - 输入必须是纯文本。PDF/截图请先由 agent 读成文本再落盘，本脚本不解析二进制。
 *   - 本脚本只做「确定性」的事：切分审稿人、抽取分数/置信度、编号化问题、
 *     按 OpenReview 规则统计字符、生成骨架。判断与措辞永远交给 agent。
 *   - stdout 输出精简摘要（供 agent 直接读），详细结果写入 --out 目录。
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/* ------------------------------------------------------------------ 参数 */

function parseArgs(argv) {
  const args = { _: [] };
  const FLAGS = new Set(['json', 'check']);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      if (FLAGS.has(key)) { args[key] = true; continue; }
      args[key] = argv[++i];
    } else args._.push(a);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const input = args._[0];

if (args.check) { runCheck(resolve(args._[0] || args.out || 'rebuttal-workspace')); process.exit(0); }

if (!input) {
  console.log('用法: node parse_reviews.mjs <reviews.txt> [--out DIR] [--limit 1500] [--threshold 6]');
  console.log('      node parse_reviews.mjs --check <workspace目录>');
  console.log('错误: 缺少输入文件。');
  process.exit(1);
}

const LIMIT = intArg(args.limit, 1500);          // 每条 review 回复的字符上限
const THRESHOLD = intArg(args.threshold, 6);     // 低于此分数视为负分（AAAI: 5 分 borderline reject）
const MAXCONF = intArg(args['max-confidence'], 5);
const OUT = resolve(args.out || 'rebuttal-workspace');

function intArg(v, d) { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : d; }

/* ------------------------------------------------------- 字符计数（关键） */

/**
 * OpenReview / CMT 按「单个字符」计数：apple = 5，空格、Markdown 语法符号同样计费。
 * 因此必须统计提交框里的原始字符串长度，而不是单词数。
 */
const countChars = (s) => [...String(s ?? '')].length;
const countWords = (s) => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;

/* ------------------------------------------------------------ 切分审稿人 */

const HEADER_RE = /^[ \t]*(?:=+|-{3,}|\*{3,})?[ \t]*(?:Official Review of Submission[ \t]*[0-9]+[ \t]*-?[ \t]*)?(?:[ \t]*[#\[\]]?)[ \t]*(?:Reviewer|Rebuttal target|R[vi])\s*(?:[#_\-\s]\s*)?([A-Za-z0-9][A-Za-z0-9_-]{0,11})\b[^\n]*$/im;
const ANY_HEADER_RE = /^[ \t]*(?:Reviewer|R)\s*#?\s*([A-Za-z0-9_-]{1,12})\s*[::]?\s*$/gim;

function splitReviewers(text) {
  // 收集所有可能的 header 位置
  const marks = [];
  const re = new RegExp(HEADER_RE.source, 'gim');
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1] && !/^(id|response|comment|rebuttal|summary|paper)$/i.test(m[1])) {
      marks.push({ id: m[1], start: m.index });
    }
  }
  if (!marks.length) {
    // 退化路径：用连续空行 + "Reviewer" 关键词兜底
    const parts = text.split(/\n\s*\n\s*\n/).filter((p) => p.trim());
    if (parts.length > 1) return parts.map((p, i) => ({ id: `R${i + 1}`, body: p }));
    return [{ id: 'R1', body: text }];
  }
  // 去掉同一 id 的重复行内提及，只保留首次出现
  const seen = new Set();
  const uniq = marks.filter((x) => (seen.has(x.id) ? false : seen.add(x.id)));
  return uniq.map((mk, i) => ({
    id: mk.id,
    // 丢掉 header 本身那一行，否则会被当成一条意见
    body: text.slice(mk.start, i + 1 < uniq.length ? uniq[i + 1].start : text.length).split('\n').slice(1).join('\n'),
  }));
}

/* ---------------------------------------------------------- 元数据抽取 */

const SCORE_LABELS = ['rating', 'score', 'recommendation', 'overall assessment', 'overall recommendation', 'ethics flag'];
const CONF_WORDS = {
  expert: 5, 'knowledgeable': 4, 'willing': 3, 'unfamiliar': 2, 'not willing': 1, other: 1,
  专家: 5, 熟悉: 4, 一般: 3, 不熟: 2,
};

function grabNumber(body, labelRe) {
  const re = new RegExp(`(?:^|\\n)\\s*(?:${labelRe})\\s*[:\\-\\u2014]?\\s*(?:\\*\\*)?\\s*(?:[1-9][0-9]?)`, 'i');
  const m = body.match(re);
  if (!m) return null;
  const n = parseInt(m[0].match(/[1-9][0-9]?/)[0], 10);
  return n;
}

function extractMeta(body) {
  const score = grabNumber(body, SCORE_LABELS.join('|'));
  let confidence = grabNumber(body, 'confidence|expertise|knowledge|self[- ]assessment');
  if (confidence === null) {
    const wm = body.match(/\b(expert|knowledgeable|willing|unfamiliar|not willing)\b/i);
    if (wm) confidence = CONF_WORDS[wm[1].toLowerCase()];
  }
  const soundness = grabNumber(body, 'soundness|significance|quality|clarity|originality');
  return { score, confidence, soundness };
}

/** 审稿人是否给出「解决 X 就提分」的明确条件——这类问题必须逐字命中。 */
function extractScoreCondition(body) {
  const re = /([^\n.]*(?:raise|increase|improve|bump|change)\s+(?:my|the)\s+score[^\n]*|(?:if|should|would like)\s+the\s+authors[^\n]{10,300}|[^\n]*\bwould\s+(?:consider\s+)?(?:accept|raise|increase)[^\n]{5,200})/i;
  const m = body.match(re);
  return m ? m[1].replace(/\s+/g, ' ').trim().slice(0, 300) : null;
}

/* ------------------------------------------------------------ 问题条目 */

const SECTION_RE = /^\s*(?:#{1,4}\s*)?[*_]{0,2}(Strengths and Weaknesses|Strengths?|Weaknesses?|Questions and Details|Questions?|Limitations?|Details|Summary|Comments and Suggestions|Suggestions?|Ethical Concerns?|Meta-?review)\b\s*[.:：]?\s*[^\n]{0,40}$/i;
const META_RE = /^\s*[*_]{0,2}(Rating|Score|Recommendation|Overall Assessment|Overall Recommendation|Confidence|Expertise|Soundness|Significance|Quality|Clarity|Originality|Ethics Flag|Time|Submission|Reviewer)\b\s*[*_]{0,2}\s*[:：]/i;
const SEP_RE = /^\s*[-=_*#]{3,}\s*$/;
const ITEM_SECTIONS = ['weakness', 'question', 'detail', 'limitation', 'ethics', 'strength'];

function normKind(k) {
  const u = k.toUpperCase();
  return u === 'Q' ? 'question' : u === 'S' ? 'strength' : 'weakness';
}
function prefix(sec) { return sec === 'question' ? 'Q' : sec === 'strength' ? 'S' : 'W'; }
/** limitation / detail / ethics 与 weakness 共用计数器，避免同一审稿人出现两个 W1。 */
function counterKey(sec) { return sec === 'question' ? 'question' : sec === 'strength' ? 'strength' : 'weakness'; }

/** 识别行首的问题编号：`- W1. xxx` / `W1. xxx` / `1) xxx` / `(2) xxx` / `- xxx` */
function parseMarker(line) {
  let m = line.match(/^[ \t]*(?:[-*•]\s*)?[*_]{0,2}([WwQqCc])\s*[._)：:]?\s*(\d{1,2})\s*[.)\]:：]?\s+(.+)$/);
  if (m) return { kind: normKind(m[1]), num: +m[2], rest: m[3].trim() };
  m = line.match(/^[ \t]*(?:[-*•]\s*)?[(\[](\d{1,2})[).\]]\s+(.+)$/);
  if (m) return { kind: null, num: +m[1], rest: m[2].trim() };
  m = line.match(/^[ \t]*(?:[-*•]\s*)?(\d{1,2})\s*[.)]\s+(.+)$/);
  if (m) return { kind: null, num: +m[1], rest: m[2].trim() };
  m = line.match(/^[ \t]*[-*•]\s+(\S.*)$/);
  if (m) return { kind: null, num: null, rest: m[1].trim() };
  return null;
}

const bare = (s) => s.replace(/[*_`\s]/g, '').length;

function splitItems(body) {
  const lines = body.split('\n');
  const items = [];
  const counters = {};
  let section = null; // null / 'meta' / 'summary' → 不建条目
  let cur = null;

  const flush = () => {
    if (cur) {
      const t = cur.text.replace(/\s+/g, ' ').trim();
      if (bare(t) >= 25) { cur.text = t; cur.chars = countChars(t); items.push(cur); }
    }
    cur = null;
  };
  const next = (sec, num) => {
    const key = counterKey(sec);
    counters[key] = Math.max(counters[key] || 0, num ?? 0) + (num == null ? 1 : 0);
    return `${prefix(sec)}${num ?? counters[key]}`;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || SEP_RE.test(line)) continue;

    const sm = line.match(SECTION_RE);
    if (sm && line.length < 70) { flush(); section = normSection(sm[1]); continue; }
    if (META_RE.test(line)) { flush(); section = 'meta'; continue; }

    const mk = parseMarker(line);
    if (mk && section !== 'meta' && section !== 'summary') {
      flush();
      const sec = mk.kind || section || 'weakness';
      cur = { section: sec, label: next(sec, mk.num), text: mk.rest };
      continue;
    }
    if (cur) { cur.text += ' ' + line; continue; }
    if (ITEM_SECTIONS.includes(section) && line.length > 60) {
      flush();
      cur = { section, label: next(section, null), text: line };
    }
  }
  flush();
  return items;
}

function normSection(s) {
  const k = s.toLowerCase();
  if (k.startsWith('summary') || k.startsWith('meta')) return 'summary';
  if (k.startsWith('strength and weakness')) return 'weakness';
  if (k.startsWith('strength')) return 'strength';
  if (k.startsWith('limitation')) return 'limitation';
  if (k.startsWith('question')) return 'question';
  if (k.startsWith('weakness')) return 'weakness';
  if (k.startsWith('ethical')) return 'ethics';
  return 'detail';
}

/* ------------------------------------------------------------ 分类规则 */

const CATS = [
  ['novelty', /novel|contribution|incremental|similar to|prior work|related work|already (been )?(known|proposed)|first[- ]?to|别人也有|新意|创新/i],
  ['baseline', /baseline|compar|state[- ]of[- ]the[- ]art|sota|stronger method|missing (the )?comparison|对照|基线/i],
  ['experiment', /experiment|ablation|benchmark|dataset|evaluation|metric|results?( in)? table|figure|seed|variance|statistical|significance|error bar|跑实验|补实验/i],
  ['theory', /proof|theorem|convergen|assumption|theoretical|bound|lemma|derivation|convergence analysis|理论|证明/i],
  ['scalability', /scalab|complexity|computational cost|runtime|memory|overhead|efficiency|parallel|扩展性|复杂度/i],
  ['reproducibility', /reproduc|code|implementation|hyper-?parameter|open[- ]source|appendix detail|seed count|复现|代码/i],
  ['clarity', /unclear|confus|not clear|hard to follow|notation|defin(?:e|ition)|typo|grammar|writing|structure|readability|clarity|不清楚|表述|写作/i],
  ['limitation', /limitation|generaliz|future work|scope|applicab|robust|assumes? that|边界|局限/i],
  ['soundness', /overclaim|unsupported|not (well[- ])?justif|claim that|conclusion is|invalid|flaw|unsound|不成立|夸大/i],
  ['ethics', /ethic|societal|bias|privacy|safety|dual[- ]use|伦理/i],
];

const BLOCKER = /major|critical|significant|serious|fundamental|fatal|deal[- ]?breaker|cannot recommend|reject|unfair|invalid|unsound|missing essential|严重|致命|硬伤/i;
const MINOR = /minor|typo|grammar|notation|suggest|could be|it would be better|nice to have|clarif|small|slight|建议|小问题/i;
const MISREAD = /i (?:think|believe|am not sure) (?:you|the authors)|i may be missing|perhaps i (?:mis|overlook)|not sure i understand|i do not fully understand|我对.{0,6}不太(熟|懂)/i;

function classify(text) {
  const cats = CATS.filter(([, re]) => re.test(text)).map(([c]) => c);
  const category = cats[0] || 'other';
  let severity = 'major';
  if (BLOCKER.test(text)) severity = 'blocker';
  else if (MINOR.test(text) && !BLOCKER.test(text)) severity = 'minor';
  const misread = MISREAD.test(text);
  return { category, categories: cats.length ? cats : ['other'], severity, misread };
}

/** 该问题主要靠什么解决——决定要不要动实验资源。 */
const EFFORT_MAP = {
  novelty: 'answer', baseline: 'new_experiment', experiment: 'new_experiment',
  theory: 'answer', scalability: 'evidence', reproducibility: 'evidence',
  clarity: 'revise', limitation: 'answer', soundness: 'evidence',
  ethics: 'revise', other: 'answer',
};
const EFFORT_LABEL = {
  answer: '文字回答（重新定义/划范围）',
  evidence: '指向论文已有证据（章节/图/表/公式）',
  new_experiment: '需要补实验或新数字',
  revise: '承认 presentation 并承诺修改',
};

/**
 * 「要新数字」的判据要窄：只有当审稿人明确要求论文里没有的东西时才算，
 * 否则会把「请解释表 2」这类一句话能说清的问题误判成要跑实验。
 */
const ASKS_FOR_DATA = [
  /\b(could you|can the authors|please|would (?:you|it) be|we (?:would|will) like|it would be (?:better|nice|helpful|interesting))\b[^.?]{0,90}\b(report|provide|add|include|run|evaluate|compare|show|quantify|measure)\b[^.?]{0,90}\b(experiment|ablation|result|comparison|baseline|number|latency|memory|cost|throughput|standard deviation|significance|seed|variance|mAP|accuracy|F1|AUC|table)\b/i,
  /\b(no|lack(?:ing)?|missing|only \d+|not (?:given|reported|provided))\b[^.?]{0,50}\b(ablation|experiment|comparison|baseline|error bar|standard deviation|significance test|seed)\b/i,
  /\b(how|what)\b[^.?]{0,40}\b(cost|latency|overhead|memory|complexity|runtime|gpu hours?)\b/i,
];
const needsNewData = (t) => ASKS_FOR_DATA.some((re) => re.test(t));

/* ------------------------------------------------------------------ 组装 */

function normalizeNewlines(s) { return String(s).replace(/\r\n?/g, '\n'); }

const raw = readFileSync(input, 'utf8');
const text = normalizeNewlines(raw);
const blocks = splitReviewers(text);

const reviewers = blocks.map((b) => {
  const meta = extractMeta(b.body);
  const items = splitItems(b.body).map((it) => {
    const c = classify(it.text);
    const needsData = c.section !== 'strength' && needsNewData(it.text);
    return {
      ...it,
      ...c,
      effort: c.misread ? 'answer' : needsData ? 'new_experiment' : (EFFORT_MAP[c.category] || 'answer'),
      chars: countChars(it.text),
    };
  });

  const neg = meta.score !== null && meta.score < THRESHOLD;
  const conf = meta.confidence ?? 0;
  let tier, tierNote;
  if (neg && conf >= Math.max(4, MAXCONF - 1)) { tier = 1; tierNote = '最高优先：高置信度负分。先攻这条，其他审稿人常会跟着调整。'; }
  else if (neg) { tier = 2; tierNote = '次优先：负分但置信度不高，本身更容易被说动。'; }
  else if (meta.score === null) { tier = 2; tierNote = '分数未知：按保守策略处理，先答掉所有 blocker/major。'; }
  else { tier = 3; tierNote = '守分：简短致谢 + 答掉小问题，别写长，别引入新争议。'; }

  const answerable = items.filter((i) => i.section !== 'strength');
  return {
    id: b.id,
    ...meta,
    negative: neg,
    tier,
    tierNote,
    scoreCondition: extractScoreCondition(b.body),
    items,
    counts: {
      blocker: answerable.filter((i) => i.severity === 'blocker').length,
      major: answerable.filter((i) => i.severity === 'major').length,
      minor: answerable.filter((i) => i.severity === 'minor').length,
      needExperiment: answerable.filter((i) => i.effort === 'new_experiment').length,
    },
  };
}).sort((a, b) => a.tier - b.tier || (b.confidence ?? 0) - (a.confidence ?? 0) || b.counts.blocker - a.counts.blocker);

// 共性问题：同一 category 被 >=2 位审稿人提出 → 值得单列 Common Concerns
const byCat = {};
for (const r of reviewers) for (const it of r.items) {
  if (it.section === 'strength') continue;
  (byCat[it.category] ??= []).push(`${r.id}/${it.label}`);
}
const commonConcerns = Object.entries(byCat)
  .filter(([, who]) => new Set(who.map((w) => w.split('/')[0])).size >= 2)
  .map(([cat, who]) => ({ category: cat, raised_by: [...new Set(who.map((w) => w.split('/')[0]))], items: who }))
  .sort((a, b) => b.raised_by.length - a.raised_by.length);

const workspace = {
  meta: {
    source: input.replace(/\\/g, '/'),
    generated_at: new Date().toISOString(),
    char_limit_per_review: LIMIT,
    negative_threshold: THRESHOLD,
    max_confidence: MAXCONF,
    reviewer_count: reviewers.length,
    question_count: reviewers.reduce((n, r) => n + r.items.filter((i) => i.section !== 'strength').length, 0),
  },
  reviewers,
  common_concerns: commonConcerns,
};

/* ------------------------------------------------------------------ 落盘 */

mkdirSync(join(OUT, 'reviews'), { recursive: true });
writeFileSync(join(OUT, 'workspace.json'), JSON.stringify(workspace, null, 2));

// 每位审稿人一个分片：问题清单 + 待填回答 + 实时字符预算
for (const r of reviewers) {
  const lines = [];
  lines.push(`# Response to Reviewer ${r.id}`, '');
  lines.push(`> 分数 ${r.score ?? '未知'}/10（${r.negative ? '负分' : '正分'}） · 置信度 ${r.confidence ?? '未知'}/${MAXCONF} · 优先级 T${r.tier}`);
  lines.push(`> ${r.tierNote}`);
  if (r.scoreCondition) lines.push(`> **提分条件原文**：${r.scoreCondition}`);
  lines.push('', `字符上限 ${LIMIT}（按字符计，Markdown 符号同样计费）。当前已用见下方每行标注。`, '');
  lines.push('---', '');
  for (const it of r.items.filter((i) => i.section !== 'strength')) {
    lines.push(`## ${it.label} — ${it.category} · ${it.severity} · ${EFFORT_LABEL[it.effort]}`);
    lines.push('');
    lines.push(`**审稿人原文**（${it.chars} 字符，引用时只取关键短语，别整段复述）：`);
    lines.push(`> ${it.text.slice(0, 400)}`);
    lines.push('');
    lines.push('**回答**：');
    lines.push('');
    lines.push('<!-- ANSWER:' + `${r.id}-${it.label}` + ' -->');
    lines.push('');
    lines.push('---', '');
  }
  const strengths = r.items.filter((i) => i.section === 'strength').map((i) => i.text);
  if (strengths.length) { lines.push('**可复用的 Strengths（用于开头呼应）**：', ...strengths.map((s) => `- ${s.slice(0, 160)}`), ''); }
  writeFileSync(join(OUT, 'reviews', `${r.id}.md`), lines.join('\n'));
}

/* 总览 */
const idx = [];
idx.push('# Rebuttal 工作区总览', '');
idx.push(`- 来源：\`${workspace.meta.source}\``, `- 审稿人：${workspace.meta.reviewer_count} 位 · 待答问题：${workspace.meta.question_count} 条`, `- 每条回复字符上限：${LIMIT}`, `- 负分判定：< ${THRESHOLD} 分`, '');
idx.push('## 攻单顺序', '', '| 顺序 | Reviewer | 分数 | 置信度 | 正/负 | blocker | major | 需补实验 | 策略 |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
reviewers.forEach((r, i) => {
  idx.push(`| ${i + 1} | ${r.id} | ${r.score ?? '?'} | ${r.confidence ?? '?'} | ${r.negative ? '负' : '正'} | ${r.counts.blocker} | ${r.counts.major} | ${r.counts.needExperiment} | ${r.tierNote.split('。')[0]} |`);
});
idx.push('', '## 共性问题（建议单列，避免每份回复重复浪费字数）', '');
if (!commonConcerns.length) idx.push('（未检出跨审稿人共性问题）');
else { idx.push('| 类别 | 提出者 | 条目 |', '| --- | --- | --- |'); for (const c of commonConcerns) idx.push(`| ${c.category} | ${c.raised_by.join(', ')} | ${c.items.join(', ')} |`); }
idx.push('', '## 提分条件命中清单', '');
const conds = reviewers.filter((r) => r.scoreCondition);
if (!conds.length) idx.push('（未检出显式「解决 X 就提分」表述——去原文再人工确认一遍，这类问题必须逐字命中）');
else for (const r of conds) idx.push(`- **${r.id}**：${r.scoreCondition}`);
idx.push('', '## 待办：需要补的数字/实验', '');
const exps = [];
for (const r of reviewers) for (const it of r.items) if (it.effort === 'new_experiment') exps.push(`- [ ] ${r.id}/${it.label}（${it.category}/${it.severity}）：${it.text.slice(0, 120)}…`);
idx.push(...(exps.length ? exps : ['- [ ] 无（全部可用文字与已有证据回应）']));
idx.push('', '## 下一步', '', '1. 先做「待办」里的实验，再动笔（先补实验再承认局限）。', '2. 打开 `workbench.html` 逐条撰写，实时看字符数是否超 ' + LIMIT + '。', '3. 定稿前跑一遍 `check` 模式：`node parse_reviews.mjs --check ' + OUT + '`。', '');
writeFileSync(join(OUT, 'index.md'), idx.join('\n'));

/* ------------------------------------------------------------------ 输出 */

console.log(`✅ 已解析 ${reviewers.length} 位审稿人 / ${workspace.meta.question_count} 条待答问题`);
if (workspace.meta.question_count === 0) {
  console.log('   ⚠️ 没有解析出任何待答问题。常见原因：');
  console.log('     1) 整段意见挤在同一行——解析按行首标记切分，请先换成每行一条；');
  console.log('     2) 输入是 PDF/截图的二进制乱码——先由 agent 读成纯文本再存文件；');
  console.log('     3) 编号格式在本工具之外——手工把每条意见拆成独立一行（`- 内容` 或 `W1. 内容`）再重跑。');
  console.log('   不要在此状态下继续起草：工作区是空的，等于没有清单。');
}
console.log(`   负分 ${reviewers.filter((r) => r.negative).length} 位 · 需补实验 ${reviewers.reduce((n, r) => n + r.counts.needExperiment, 0)} 条 · 共性问题 ${commonConcerns.length} 类`);
console.log('   攻单顺序：' + reviewers.map((r) => `${r.id}(T${r.tier}${r.score !== null ? ',' + r.score + '分' : ''})`).join(' → '));
console.log(`   工作区：${OUT.replace(/\\/g, '/')}/`);
console.log('     index.md            总览与攻单顺序');
console.log('     reviews/<ID>.md     每位审稿人的分片草稿（含字符预算）');
console.log('     workspace.json      结构化数据（供工作台与后续脚本使用）');
console.log(`   校验：node parse_reviews.mjs --check ${OUT.replace(/\\/g, '/')}`);
if (args.json) console.log(JSON.stringify(workspace));

/* -------------------------------------------------------------- 校验模式 */

/**
 * 只统计「回答」正文：从 `**回答**：` 到下一个 `---` 之间的内容。
 * 分片文件的标题、审稿人原文引用、提示语都不会被提交，因此不计入预算。
 */
function runCheck(dir) {
  const wsFile = join(dir, 'workspace.json');
  if (!existsSync(wsFile)) {
    console.log(`错误: 找不到 ${wsFile.replace(/\\/g, '/')}。先运行 parse_reviews.mjs 生成工作区。`);
    process.exit(1);
  }
  let ws;
  try { ws = JSON.parse(readFileSync(wsFile, 'utf8')); }
  catch (e) { console.log(`错误: workspace.json 解析失败——${e.message.split('\n')[0]}`); process.exit(1); }

  const LIMIT = ws.meta.char_limit_per_review;
  const rows = [];
  let over = 0, warn = 0, empty = 0;

  for (const r of ws.reviewers) {
    const f = join(dir, 'reviews', `${r.id}.md`);
    if (!existsSync(f)) { rows.push(`${r.id}.md — ❓ 分片文件不存在`); continue; }
    const body = readFileSync(f, 'utf8');
    let used = 0, filled = 0, total = 0;
    for (const seg of body.split(/\n(?=## )/)) {
      if (!seg.startsWith('## ')) continue;
      total++;
      const m = seg.match(/\*\*回答\*\*：\n([\s\S]*?)(?=\n---|\n\*\*可复用|$)/);
      const ans = (m ? m[1] : '').replace(/^<!--\s*ANSWER:[^>]*-->/m, '').trim();
      if (ans.length) filled++;
      used += [...ans].length + (ans.length ? 2 : 0); // 条目之间的一次空行
    }
    const state = used > LIMIT ? '❌ 超限' : used > LIMIT * 0.9 ? '⚠️ 接近上限' : '✅';
    if (used > LIMIT) over++; else if (used > LIMIT * 0.9) warn++;
    if (filled < total) empty += total - filled;
    rows.push(`${r.id}.md — ${used}/${LIMIT} 字符 ${state} · 已填 ${filled}/${total} 条${filled < total ? '（' + (total - filled) + ' 条仍是骨架）' : ''}`);
  }

  console.log(`字符预算校验（每条上限 ${LIMIT}，按字符计）\n`);
  console.log(rows.join('\n'));
  console.log('');
  if (over) console.log(`结果：${over} 条超限，无法提交。按 references/pitfalls.md 的删减顺序处理。`);
  else if (empty) console.log(`结果：预算内，但仍有 ${empty} 条未填。合并同类项可以，静默删除被点名的 W/Q 不行。`);
  else if (warn) console.log(`结果：预算内且已全部填写；${warn} 条接近上限，定稿前留一点余量。`);
  else console.log('结果：全部在预算内且已填写，可以提交。');
}
