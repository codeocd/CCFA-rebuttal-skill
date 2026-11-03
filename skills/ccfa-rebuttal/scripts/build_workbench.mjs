#!/usr/bin/env node
/**
 * build_workbench.mjs — 把 parse_reviews.mjs 生成的 workspace.json 注入 HTML 工作台。
 *
 * 用法:
 *   node build_workbench.mjs <workspace目录> [--template 路径] [-o 输出文件]
 *
 * 产出: <workspace目录>/workbench.html —— 单文件、离线可用、双击即可在浏览器打开。
 * 草稿存在浏览器 localStorage，不会上传任何内容。
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
const dir = argv[0];
if (!dir) {
  console.log('用法: node build_workbench.mjs <workspace目录>');
  console.log('错误: 缺少工作区目录。先运行 parse_reviews.mjs 生成 workspace.json。');
  process.exit(1);
}
const WS = resolve(dir);
const wsFile = join(WS, 'workspace.json');
if (!existsSync(wsFile)) {
  console.log(`错误: 找不到 ${wsFile.replace(/\\/g, '/')}。请先运行 parse_reviews.mjs。`);
  process.exit(1);
}

const ti = argv.indexOf('--template');
const tpl = ti > -1 ? resolve(argv[ti + 1]) : join(HERE, '..', 'assets', 'workbench.html');
if (!existsSync(tpl)) {
  console.log(`错误: 找不到工作台模板 ${tpl.replace(/\\/g, '/')}。`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(readFileSync(wsFile, 'utf8'));
} catch (e) {
  console.log(`错误: workspace.json 解析失败——${e.message.split('\n')[0]}`);
  process.exit(1);
}

const html = readFileSync(tpl, 'utf8');
const MARKER = '/*__DATA__*/null';
if (!html.includes(MARKER)) {
  console.log('错误: 模板里找不到注入点 /*__DATA__*/null。');
  process.exit(1);
}

// </script> 出现在 JSON 字符串里会提前闭合标签，必须转义
const safe = JSON.stringify(data).replace(/<\//g, '<\\/');
const oi = argv.indexOf('-o');
const out = oi > -1 ? resolve(argv[oi + 1]) : join(WS, 'workbench.html');

writeFileSync(out, html.replace(MARKER, safe), 'utf8');

const kb = (readFileSync(out).length / 1024).toFixed(1);
console.log(`✅ 工作台已生成：${out.replace(/\\/g, '/')}`);
console.log(`   ${data.meta.reviewer_count} 位审稿人 · ${data.meta.question_count} 条待答 · 每条上限 ${data.meta.char_limit_per_review} 字符 · ${kb} KB`);
console.log('   直接双击在浏览器打开即可；草稿保存在本地 localStorage，不联网。');
