# 英文句式库

rebuttal 正文一律英文。本库提供**可直接替换槽位的句子**，按「在回复里的位置」组织。
用之前先确认：句子里的每个 `[...]` 都必须换成真实内容。

## 全局规则

- 整份 rebuttal **只有一句**总致谢，放在最前面。不要每条回复都 `Thank you for this insightful comment`。
- 每个回答的**第一或第二句必须给出结论**，然后再给依据。先解释三段再给结论 = 让 AC 自己找答案。
- 结构固定为：**结论 → 依据（章节/图/表/公式/新数字）→ 具体动作**。
- 一句话能说清的不要写三句。字越多，别人越不会细看。

## 禁用与慎用

| 禁用 | 原因 | 换成 |
| --- | --- | --- |
| `insightful` / `valuable` / `excellent comment` | 空洞奉承，审稿人一眼看穿 | 直接说对方指出的具体问题 |
| `We hope this clarifies` | 无信息量收尾 | `We will add this to Sec. [x]` |
| `as clearly stated` / `obviously` | 隐含「你没看见」，易激化 | `as stated in Line [y]` |
| `We apologize for the confusion, but ... is still acceptable` | 部分承认 + 找理由削弱，两头不讨好 | 结论先行，该认的认具体，该争的争清楚 |
| `We will revise/restructure/improve the paper` | 空承诺，审稿人无法核查 | 列出改哪一段、加哪句话 |
| `Due to page limit we cannot` | 像借口 | 给出你会放在哪、并已在 rebuttal 给出的证据 |
| 外链 / GitHub / 匿名页二维码 | 多数会议禁止，且破坏双盲 | 文字描述 + 承诺终稿释出 |

## 1. 开头（整份 rebuttal 用一次）

```
We thank all reviewers for their careful reading and for recognizing
[1-2 concrete positives they named]. We respond to each review separately;
common questions are addressed first below (C1-C3).
```

```
We thank the reviewers for their time. Several concerns recur across reviews, so we
answer them once in "Common Responses", then address review-specific points.
```

## 2. 结论先行

```
Short answer: yes / no / [X] — [one-sentence reason]. Evidence below.
```

```
[Claim] does not hold in our setting, because [reason] (Sec. [x], Table [n]).
```

```
This is a presentation issue rather than a methodological one: [what is actually in the paper].
```

## 3. 引用论文已有内容（省字数、防误解）

```
We have indeed reported [X] in the original paper (Sec. [x], Line [y], Table [n]).
```

```
As stated in Line [y]: "[quote <= 12 words]".
```

```
The [component] is defined in Eq. (4); its effect is measured in Table [n], row [m].
```

## 4. 礼貌但明确地不同意

按强度递增：

```
Thank you for the comment, but we cannot fully agree with [X], because [evidence].
```

```
We respectfully disagree with the assessment that [X]. [Reason + evidence].
```

```
The reviewer may have overlooked Table [n], which reports [X] under [setting].
```

```
We would like to emphasize that [X] is [why it matters] in this task setting.
```

```
This is a valid assessment of [A]; however, we believe [B] is more appropriate here
because [reason].
```

```
[Method] differs from [X] in [specific axis], which is what enables [benefit].
```

## 5. 承认（只承认 presentation 与小事实错）

```
We agree that [notation/figure/wording] is unclear and will [exact action].
```

```
You are right that [typo/mis-numbered eq.]; the corrected [item] is: [content].
```

```
We will state this limitation explicitly in Sec. [x] of the final version.
```

**不要写**：`We acknowledge a fundamental limitation of the approach` / `the main claim does not hold`。承认硬伤 = 直接出局。

## 6. 不道歉地处理「没做的可选实验」

```
[Setting] was not evaluated in [A, CVPR'24; B, NeurIPS'24; C, ICML'25], which follow the
same protocol as ours. Since you raised it, we ran it anyway: [result].
```

## 7. 承诺具体化（把「会改」变成可核查动作）

```
Concretely, we will: (1) move Sec.3.1 to Related Work; (2) add the following overview
paragraph at the start of Sec.3: "..."; (3) report [metric] in Table 2; (4) enlarge
Fig.2 captions to 9pt. Total page count is unchanged.
```

## 8. 新数字的呈现（压成一行，别画大表）

```
[W1] latency/memory: ours [a] ms / [b] GB vs. [baseline] [c] ms / [d] GB on [hw] (1x, same batch).
```

```
[W3] missing-modality ablation (mAP): 0 sensors [x], 1 missing [y], 2 missing [z].
```

> Markdown 表格的竖线、空格、换行都计入字符数。一张表往往吃掉大半预算——纯文本类会议（AAAI/IJCAI）优先用上面这种紧凑行。

## 9. 跨审稿人借力

```
We note that [aspect] distinguishes our method from [X] and [Y], which is appreciated
by Reviewers [B] and [C].
```

## 10. 请求具体化 / 请求回复

```
Could you specify which comparison you consider missing? We currently compare with
[a, b, c] (Table 1). If you meant [d], we will add it immediately.
```

```
Given the short discussion window, we would appreciate a follow-up at your convenience;
we can provide [specific additional evidence] within [time].
```

## 11. 引导排序

```
Among your concerns, which one would most change your score? We focus our response there.
```

## 12. 收尾（每位审稿人一句，不要长）

```
We hope these clarifications and the added results address your concerns, and we would
be glad to provide further details during the discussion period.
```

正分审稿人（越短越好）：

```
Thank you for the positive assessment. We will add [the one small thing] to Table [n]
and release [scripts] with the camera-ready.
```

## 13. Confidential Comment（只给 AC/SAC/SPC 看）

对事不对人；只陈述一看就荒谬的可核查事实；请求「考虑评审质量」，绝不请求「忽略这个分数」。

```
We would like to bring to your attention that Reviewer [id]'s comments appear to describe
a different paper: they refer to [X], which our submission does not contain (our method is
[y], Sec. 3). We have responded in full regardless, but ask that you consider the review
quality when weighing this score.
```

```
Reviewer [id] states [A] in Comment [i] and [not A] in Comment [j]. We have addressed both.
```

```
The reviewer notes limited familiarity with [area] (confidence [k]). The concern that
[quote] relies on [assumption], which does not hold in [setting]; evidence is in Table [n].
```

**不要写**：`This reviewer clearly does not know the field` / `we suggest excluding this review` / `please ignore this score`。
