---
name: 解析失败 / Parse failure
about: parse_reviews.mjs 把某条审稿意见解析错了（漏条、错分类、错分数、错攻单顺序）
title: "[parse] "
labels: [bug, parser]
---

## 出了什么问题

<!-- 例：W2 被漏掉了 / 把「缺少相关工作讨论」判成了 novelty / 置信度没抽出来 -->

## 最小复现输入

<!-- 请贴**脱敏后**的 reviews 片段：去掉论文标题、作者、机构、可识别的专有名词。
     保留行结构（小标题、编号、Rating/Confidence 行），因为解析按行首标记切分。 -->

```text
（粘贴在这里）
```

## 期望 vs 实际

- 期望：
- 实际（可贴 `--json` 输出里对应的那一段）：

## 环境

- 操作系统 / Node 版本：
- 命令：`node skills/ccfa-rebuttal/scripts/parse_reviews.mjs ... --limit ? --threshold ?`

## 补充

<!-- 这条意见来自哪个会议的什么导出格式（OpenReview 复制 / CMT 导出 / PDF 转文本）？ -->
