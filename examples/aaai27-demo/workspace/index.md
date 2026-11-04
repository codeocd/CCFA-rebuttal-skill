# Rebuttal 工作区总览

- 来源：`examples/aaai27-demo/reviews.txt`
- 审稿人：4 位 · 待答问题：15 条
- 每条回复字符上限：1500
- 负分判定：< 6 分

## 攻单顺序

| 顺序 | Reviewer | 分数 | 置信度 | 正/负 | blocker | major | 需补实验 | 策略 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Bt3Q | 4 | 5 | 负 | 1 | 2 | 1 | 最高优先：高置信度负分 |
| 2 | xK9p | 5 | 4 | 负 | 1 | 5 | 5 | 最高优先：高置信度负分 |
| 3 | qW2z | 8 | 4 | 正 | 0 | 1 | 2 | 守分：简短致谢 + 答掉小问题，别写长，别引入新争议 |
| 4 | mN7d | 7 | 2 | 正 | 0 | 1 | 0 | 守分：简短致谢 + 答掉小问题，别写长，别引入新争议 |

## 共性问题（建议单列，避免每份回复重复浪费字数）

| 类别 | 提出者 | 条目 |
| --- | --- | --- |
| experiment | Bt3Q, xK9p, qW2z | Bt3Q/W2, xK9p/W3, xK9p/Q2, qW2z/Q1 |
| baseline | xK9p, qW2z | xK9p/W2, xK9p/Q1, xK9p/W4, qW2z/W1 |

## 提分条件命中清单

- **xK9p**：if the authors provide a comparison against at least one 2026 method

## 待办：需要补的数字/实验

- [ ] Bt3Q/S1（experiment/major）：S1. Practical motivation, clear figures, and the pipeline diagram is helpful.…
- [ ] Bt3Q/W2（experiment/major）：The improvement on the second benchmark is about 0.6 mAP, which is within the reported noise. Statistical reliability is…
- [ ] xK9p/S2（baseline/major）：S2. Consistent gains over the three cited fusion baselines on both datasets.…
- [ ] xK9p/W2（baseline/major）：Only two baselines are from the last 18 months. There is no comparison against a strong recent method, so I cannot judge…
- [ ] xK9p/W3（experiment/major）：No ablation on the number of fused modalities. What happens when one sensor is missing at test time? Robustness to missi…
- [ ] xK9p/Q1（baseline/major）：Could you report inference latency and peak memory relative to the early-fusion baseline? The method section does not st…
- [ ] xK9p/Q2（experiment/major）：Which random seeds were used? Are the reported standard deviations over seeds or over test folds?…
- [ ] xK9p/W4（baseline/major）：The paper acknowledges only dataset coverage. I would consider raising my score if the authors provide a comparison agai…
- [ ] qW2z/W1（baseline/minor）：A minor point: Table 2 should report the standard deviation of the detector-free baseline too, for symmetry.…
- [ ] qW2z/Q1（experiment/major）：Do you plan to release the anonymized evaluation scripts?…

## 下一步

1. 先做「待办」里的实验，再动笔（先补实验再承认局限）。
2. 打开 `workbench.html` 逐条撰写，实时看字符数是否超 1500。
3. 定稿前跑一遍 `check` 模式：`node parse_reviews.mjs --check D:\OneDrive\openProject\CCFA-rebuttal-skill\examples\aaai27-demo\workspace`。
