# Response to Reviewer Bt3Q

> 分数 4/10（负分） · 置信度 5/5 · 优先级 T1
> 最高优先：高置信度负分。先攻这条，其他审稿人常会跟着调整。

字符上限 1500（按字符计，Markdown 符号同样计费）。当前已用见下方每行标注。

---

## W1 — soundness · blocker · 指向论文已有证据（章节/图/表/公式）

**审稿人原文**（227 字符，引用时只取关键短语，别整段复述）：
> I think the data split is potentially leaking: samples from the same production line appear in both train and test. If true this would invalidate the main table, and it is a fundamental problem rather than a presentation issue.

**回答**：

**W1.** Short answer: no leakage. Our split is at the line level, not the sample level (Sec. 3.1, Line 412): every test line appears in zero training sequences. We agree the original wording made this easy to miss, and we will state the protocol explicitly in the caption of Table 2 and release the split audit script with the camera-ready.

---

## W2 — experiment · major · 需要补实验或新数字

**审稿人原文**（137 字符，引用时只取关键短语，别整段复述）：
> The improvement on the second benchmark is about 0.6 mAP, which is within the reported noise. Statistical reliability is not established.

**回答**：

**W2.** Under 5 seeds we obtain 84.1 +/- 0.4 vs. 83.5 +/- 0.5 for the strongest baseline; paired t-test over 1,024 samples gives p = 0.021. We will report std over seeds for all rows of Table 2, including the detector-free baseline.

---

## W3 — clarity · minor · 承认 presentation 并承诺修改

**审稿人原文**（116 字符，引用时只取关键短语，别整段复述）：
> Notation in Section 3.2 is confusing: z and \hat{z} are used interchangeably, and Eq. (4) is never referenced again.

**回答**：

**W3.** We agree. Concretely we will: (1) unify z / z-hat throughout; (2) reference Eq. (4) in the paragraph after Line 318 where it is currently used but not cited; (3) enlarge Fig. 2 captions to 9pt. Page count is unchanged.

---

## Q1 — other · major · 文字回答（重新定义/划范围）

**审稿人原文**（147 字符，引用时只取关键短语，别整段复述）：
> Is the fusion module trained jointly with the diffusion backbone or frozen? This is stated in the appendix but the appendix and main text disagree.

**回答**：

**Q1.** The fusion module is trained jointly with the backbone (Alg. 1, Sec. 3.2). The appendix describes a frozen variant retained from our ablation study; we will remove that inconsistency and keep only the configuration used for the main results.

---

**可复用的 Strengths（用于开头呼应）**：
- S1. Practical motivation, clear figures, and the pipeline diagram is helpful.
- S2. Code is promised to be released.
