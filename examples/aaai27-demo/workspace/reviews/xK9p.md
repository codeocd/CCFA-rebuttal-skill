# Response to Reviewer xK9p

> 分数 5/10（负分） · 置信度 4/5 · 优先级 T1
> 最高优先：高置信度负分。先攻这条，其他审稿人常会跟着调整。
> **提分条件原文**：if the authors provide a comparison against at least one 2026 method

字符上限 1500（按字符计，Markdown 符号同样计费）。当前已用见下方每行标注。

---

## W1 — novelty · blocker · 文字回答（重新定义/划范围）

**审稿人原文**（240 字符，引用时只取关键短语，别整段复述）：
> The novelty relative to cross-attention conditioning (e.g. the 2025 "AdaCond" line of work) is not clearly established. The claimed contribution looks like an incremental change of the conditioning interface. This is a major concern for me.

**回答**：

**W1.** We respectfully clarify that our contribution is not the conditioning interface itself, but that moving fusion into the latent space removes the per-modality encoders at inference, which is what makes the sensor-drop setting tractable. This is measurable, not rhetorical: [-x%] parameters, [-y ms] latency, and the robustness curve in C3. We will sharpen this positioning at the start of Sec. 3 and add the comparison to AdaCond-style work to Related Work.

---

## W2 — baseline · major · 需要补实验或新数字

**审稿人原文**（177 字符，引用时只取关键短语，别整段复述）：
> Only two baselines are from the last 18 months. There is no comparison against a strong recent method, so I cannot judge whether the gain comes from fusion or from the backbone.

**回答**：

**W2.** See Common Response C1. Under matched backbone, resolution and parameter budget we obtain [a] vs. [b] (+[d]) over [AdaFuse-26].

---

## W3 — experiment · major · 需要补实验或新数字

**审稿人原文**（179 字符，引用时只取关键短语，别整段复述）：
> No ablation on the number of fused modalities. What happens when one sensor is missing at test time? Robustness to missing modality is the whole point of the application scenario.

**回答**：

**W3.** See Common Response C3. We ran the missing-modality ablation you asked for: [x] / [y] / [z] mAP at 0 / 1 / 2 missing sensors.

---

## Q1 — baseline · major · 需要补实验或新数字

**审稿人原文**（137 字符，引用时只取关键短语，别整段复述）：
> Could you report inference latency and peak memory relative to the early-fusion baseline? The method section does not state the overhead.

**回答**：

**Q1.** See Common Response C1. We did not compare with [x] (no public code) or [y] (requires [unavailable labels]); we will state this in Sec. 4.1.

---

## Q2 — experiment · major · 需要补实验或新数字

**审稿人原文**（97 字符，引用时只取关键短语，别整段复述）：
> Which random seeds were used? Are the reported standard deviations over seeds or over test folds?

**回答**：

**Q2.** O(1) extra ops at inference; [a] ms / [b] GB vs. early fusion [c] ms / [d] GB on 1x GPU, batch [n]. We will add this row to Table 2. Seeds: [5], mean +/- std, see C2.

---

## W4 — baseline · major · 需要补实验或新数字

**审稿人原文**（181 字符，引用时只取关键短语，别整段复述）：
> The paper acknowledges only dataset coverage. I would consider raising my score if the authors provide a comparison against at least one 2026 method and a missing-modality ablation.

**回答**：

**W4.** We have provided both items you named: a comparison against a 2026 method (C1) and the missing-modality ablation (C3). If these address your concern we would be grateful for an updated assessment; if a specific number would help further, we will add it immediately.

---

**可复用的 Strengths（用于开头呼应）**：
- S1. The latent-space fusion formulation is elegant and avoids per-modality encoders at inference time.
- S2. Consistent gains over the three cited fusion baselines on both datasets.
