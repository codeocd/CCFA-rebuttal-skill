# 示例成品：AAAI-27 一条完整 rebuttal（人工打磨版）

> ⚠️ **本示例的论文、审稿意见与全部数字均为合成数据**，仅用于演示输出形态。
> 真实使用时：`[...]` 占位符必须换成你自己的数据；跑不出来的数字**保留占位符**，不要填假值。
>
> 流水线三层产物，从机器到人工：
> 1. [`reviews.txt`](reviews.txt) — 合成审稿输入
> 2. [`workspace/`](workspace/) — `parse_reviews.mjs` 的解析产物（分片 + 工作台）
> 3. [`workspace/final-rebuttal.md`](workspace/final-rebuttal.md) — `assemble_rebuttal.mjs` 组装的机器成稿
> 4. **本文件** — 在机器成稿基础上人工打磨后的版本：把 C1/C2 的 seed 改写成面向全体审稿人的一句话结论，
>    删掉机器留下的指针冗余，调整语气。字符数由 `--check` 实测，见文末。

---

## 策略判断（中文，给自己看的，不提交）

| 顺序 | 审稿人 | 分数 | 置信度 | 判断 | 实际用量 |
| --- | --- | --- | --- | --- | --- |
| 1 | Bt3Q | 4 | 5 | 高置信度负分，且提出**数据泄漏**这一 blocker | 1053 / 1500 |
| 2 | xK9p | 5 | 4 | borderline，且**明确写了提分条件** → 逐字命中 | 1337 / 1500 |
| 3 | mN7d | 7 | 2 | 正分但置信度低，通篇没有硬伤 | 465 / 1500 |
| 4 | qW2z | 8 | 4 | 正分，只有一个 minor → 守分，别写长 | 286 / 1500 |

三个关键决策：

1. **共性问题单列**：`baseline` 被 xK9p + qW2z 提、`experiment` 被三位提。合成一份 Common Responses，各分回复只留指针（`See Common Response C1`），省下约 600 字符。
2. **Bt3Q 的泄漏指控必须先核实**。这里假设核实结论是「划分在产线级别，不泄漏」→ 属于「当众纠正审稿人事实错误」，语气平和但结论明确，并给出可核查位置。
3. **xK9p 的提分条件是「补一个 2026 方法 + 缺失模态消融」**。这两件事不做，其余写得再好也不会提分。所以预算优先给这两条，用量最大（1337 字符）是刻意的。

---

## Common Responses（作为 Global/Summary 提交；若会议只允许逐条回复，则把对应段落复制进每条）

**C1 — Comparison with recent methods (raised by R-xK9p W2/Q1, R-qW2z W1).**
We added [AdaFuse-26] under identical backbone, resolution and parameter budget: mAP [a] vs. ours [b] (+[d]). We did not compare with [x] because its code is not public, and with [y] because its benchmark requires [unavailable labels]. Full table will appear as Table 3 in the final version.

**C2 — Statistical reliability (R-xK9p Q2, R-Bt3Q W2, R-qW2z W1).**
All rows now report mean ± std over [5] seeds. Our gain over the strongest baseline is [d] with a paired t-test over [n] samples, p = [p]. This is the same order as the gap between [published SOTA A] and [published SOTA B] ([venue] [year], Table [k]).

**C3 — Missing-modality robustness (R-xK9p W3).**
mAP with 0/1/2 sensors missing at test time: [x] / [y] / [z]. Degradation is sub-linear because [mechanism, Sec. 3.2]. We will add this as Table 4 and discuss it in Sec. 5.

---

## Response to Reviewer Bt3Q（1053 / 1500 字符）

We thank you for recognizing the practical motivation and the clarity of the pipeline figure.

**W1 (data split / leakage).** Short answer: no leakage. Our split is at the **line** level, not the sample level (Sec. 3.1, Line 412): every test line appears in zero training sequences. We agree the original wording made this easy to miss, and we will state the protocol explicitly in the caption of Table 2 and release the split audit script with the camera-ready.

**W2 (0.6 mAP within noise).** Under [5] seeds we obtain [84.1 ± 0.4] vs. [83.5 ± 0.5] for [baseline]; paired t-test over [1,024] samples gives p = [0.021]. We will report std over seeds for **all** rows of Table 2, including the detector-free baseline.

**W3 (notation in Sec. 3.2).** We agree. Concretely we will: (1) unify `z` / `ẑ` throughout; (2) reference Eq. (4) in the paragraph after Line 318 where it is currently used but not cited; (3) enlarge Fig. 2 captions to 9pt. Page count is unchanged.

**Q1 (joint vs. frozen).** The fusion module is trained **jointly** with the backbone (Alg. 1, Sec. 3.2). The appendix describes a frozen variant retained from our ablation study; we will remove that inconsistency and keep only the configuration used for the main results.

---

## Response to Reviewer xK9p（1337 / 1500 字符）

We thank you for the positive reading of the latent-space formulation and the consistent gains.

**W1 (novelty vs. cross-attention conditioning).** We respectfully clarify that our contribution is not the conditioning interface itself, but that moving fusion **into** the latent space removes the per-modality encoders at inference — which is what makes the sensor-drop setting tractable. This is measurable, not rhetorical: [−x%] parameters, [−y ms] latency, and the robustness curve in C3. We will sharpen this positioning at the start of Sec. 3 and add the comparison to [AdaCond-style] work to Related Work.

**W2 / Q1 (recent baselines).** See **Common Response C1**. Under matched budget we obtain [a] vs. [b] (+[d]) over [AdaFuse-26].

**W3 (modality ablation).** See **Common Response C3**. We ran the missing-modality ablation you asked for: [x] / [y] / [z] mAP at 0/1/2 missing sensors.

**Q2 (latency, memory, seeds).** [O(1)] extra ops at inference; [a] ms / [b] GB vs. early fusion [c] ms / [d] GB on [1×GPU, batch n] (we will add this row to Table 2). Seeds: [5], mean ± std — see C2.

**Limitations / your stated condition for raising the score.** We have provided both items you named: a comparison against a 2026 method (C1) and the missing-modality ablation (C3). If these address your concern, we would be grateful for an updated assessment; if a specific number would help further, we will add it immediately.

---

## Response to Reviewer mN7d（465 / 1500 字符）

Thank you for the encouraging assessment.

**W1 (Gaussian assumption in Sec. 3.3).** You are right that a trained VAE latent is not exactly Gaussian. We will soften the statement to "approximately Gaussian under the [regularization] used (Sec. 3.1)" and note the empirical check in Fig. [k].

**W2 (medical multi-modal fusion related work).** We will cite and discuss [refs] in Related Work; they share our sensor-drop motivation but differ in [axis], which we will make explicit.

**Q1 (cost as modality count grows).** See R-xK9p Q2 above: [O(1)] extra inference ops; [a] ms / [b] GB on [hardware].

---

## Response to Reviewer qW2z（286 / 1500 字符）

Thank you for the positive assessment and for catching the asymmetry in Table 2.

**W1.** We will add mean ± std over [5] seeds for the detector-free baseline too (see **Common Response C2**).

**Q1.** Yes — evaluation scripts, the split audit, and the [5]-seed configs will be released with the camera-ready at our anonymous repository link, which we can only include after the review period.

---

## 实测校验

```
$ node skills/ccfa-rebuttal/scripts/parse_reviews.mjs --check examples/aaai27-demo/workspace

字符预算校验（每条上限 1500，按字符计）

Bt3Q.md — 1053/1500 字符 ✅ · 已填 4/4 条
xK9p.md — 1337/1500 字符 ✅ · 已填 6/6 条
qW2z.md — 286/1500 字符 ✅ · 已填 2/2 条
mN7d.md — 465/1500 字符 ✅ · 已填 3/3 条

结果：全部在预算内且已填写，可以提交。
```

> 仓库里 `workspace/reviews/*.md` 就是上面这份已填写状态。
> 重新跑 `parse_reviews.mjs` 会得到未填写的骨架，此时 `--check` 会提示「N 条仍是骨架」。

## 这份示例刻意示范了五件事

1. **结论先行**：每条第一句就给答案（`Short answer: no leakage`），不先解释三段。
2. **指向可核查位置**：Sec. 3.1 / Line 412 / Table 2 / Alg. 1 —— 而不是「论文里说了」。
3. **承诺具体化**：改哪个符号、加哪一行、图例几 pt、页数不变。没有「我们会重写第三章」。
4. **逐字命中提分条件**，并把「你要求的两件事都做了」明确点出来，请求更新评估。
5. **正分审稿人写得最短**（286 / 465 字符），不引入新争议。
