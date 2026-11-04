# Response to Reviewer mN7d

> 分数 7/10（正分） · 置信度 2/5 · 优先级 T3
> 守分：简短致谢 + 答掉小问题，别写长，别引入新争议。

字符上限 1500（按字符计，Markdown 符号同样计费）。当前已用见下方每行标注。

---

## W1 — theory · minor · 文字回答（重新定义/划范围）

**审稿人原文**（186 字符，引用时只取关键短语，别整段复述）：
> The theoretical justification in Sec. 3.3 seems to assume the latent distribution is Gaussian, which is generally false for trained VAEs. Minor for me but should be softened in the text.

**回答**：

**W1.** You are right that a trained VAE latent is not exactly Gaussian. We will soften the statement to "approximately Gaussian under the regularization used (Sec. 3.1)" and note the empirical check in Fig. [k].

---

## W2 — citation · major · 承认 presentation 并承诺修改

**审稿人原文**（105 字符，引用时只取关键短语，别整段复述）：
> Related work on multi-modal fusion in medical imaging is missing; the authors should cite and discuss it.

**回答**：

**W2.** We will cite and discuss [refs] in Related Work; they share our sensor-drop motivation but differ in [axis], which we will make explicit.

---

## Q1 — scalability · minor · 指向论文已有证据（章节/图/表/公式）

**审稿人原文**（75 字符，引用时只取关键短语，别整段复述）：
> Could you clarify the computational cost as the number of modalities grows?

**回答**：

**Q1.** See response to Reviewer xK9p Q2 above: O(1) extra inference ops; [a] ms / [b] GB on [hardware].

---

**可复用的 Strengths（用于开头呼应）**：
- S1. The problem formulation is well motivated and the application is meaningful.
