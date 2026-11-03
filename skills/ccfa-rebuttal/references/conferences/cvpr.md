# CVPR / ICCV / ECCV — Rebuttal 规则卡

> 标记：✅ 官方可查 · 🟡 社区经验 · ❓ 每年会变，**必须核对当年 author kit**

## 一句话

**1 页 PDF** 形态。可以放小表和小图（这是它相对纯文本会议的最大优势），但**超页或改页边距的 rebuttal 不会被读**。
通常没有多轮讨论，写完即定。

## 关键参数

| 项目 | 值 | 标记 |
| --- | --- | --- |
| 形式 | 官方 author kit 模板排出的 **1 页 PDF** | ✅ |
| 长度 | 严格 1 页；**超页 / 修改页边距 → 不予审阅** | ✅ |
| 富文本 | 完整 LaTeX：表格、公式、小图都可以 | ✅ |
| 外链 | **禁止**（会破坏双盲，且被视为绕过页数限制） | ✅ |
| 新图/新表 | 允许，且是最有效的表达手段 | ✅ |
| 补新实验 | ⚠️ **不建议**。PAMI-TC 动议明确：审稿人不应要求重大额外实验或因缺失而惩罚；作者应避免引入新贡献/新结果（尤其是未被要求的），审稿人被告知可忽略新贡献 | ✅ |
| 修改论文 | rebuttal 期不能重传论文 | ✅ |
| 讨论期 | 通常无（个别年份有 short feedback） | ❓ |
| 审稿人可见性 | 通常互相不可见（与 OpenReview 系不同） | 🟡 |
| 给 AC 的密信 | 特殊情况下允许单独的 confidential comment | 🟡 |
| 打分 | 分数 + 置信度，看当年 form | ❓ |

## 1 页 PDF 的排版即预算

页数是唯一硬约束，所以**布局要当字数来省**：

- 双栏、小表、`Table n: 3 行 4 列` 比三段散文有效得多。
- 每条回复用 `R1-W1:` 这类编号起头，不复述问题。
- 一张表最多 4 列 5 行；放不下的说明你选错了要展示的数字。
- 先写完所有内容的 LaTeX，再统一压字号/间距到 1 页——**不要边写边排版**。
- 必须用官方 author kit 渲染后数页，别信「我觉得差不多」。

## CVPR 系专属打法

1. **不要主动加未被要求的新实验**。审稿人被告知可以忽略新贡献，你等于白烧版面，还可能引出新质疑。
2. **需要政策豁免时的标准句式**（当审稿人要求新实验而政策不允许）：

```
Due to the rebuttal policy that "authors should not include new experimental results in
the rebuttal", we are unable to add [X] here. However, we will include these experiments
and the discussion in the final version.
```

3. **用已有证据 + 精确位置回答**：CVPR 审稿人常在截止前 3 天才写完 review，默认他记得不比你清楚。指到 `Sec. 3.2, Eq. (4), Table 2 row 3`。
4. **novelty 质疑在 CV 领域最常见**：把论述从「模块新」抬到「任务设定/监督方式/推理成本上的实质差异」，并用一张小表把差异量化（参数量、FLOPs、精度）。
5. **数据泄漏/划分质疑（CVPR 高频硬伤）**：给出划分依据的具体协议，并承诺写进 caption。

## 改分基线率（CVPR 2019，>15,000 条 review）

用来设定预期：Strong Reject → 正分 **0.8%**；Weak Reject → 正分 **6.9%**；Borderline → 正分 **33.6%**、→ 负分 **约 56%**；Weak Accept → 负分 **15.5%**；Strong Accept → 负分 **5.2%**。

含义：1 页预算应该几乎全部投给 **borderline** 和**高置信度负分**，正分审稿人只给两三句。

## 常见坑

- 超页 → 直接不被读，前面所有努力归零。
- 塞新实验却不对齐条件（分辨率/backbone/训练预算），被反问一句就输。
- 在 rebuttal 里加未被要求的新贡献，被审稿人当作「不尊重评审意见」。
- 因为分数难看就不写。

## 官方原文（粘贴处）

```
[ ] 当年 author kit / CFP 关于 1 页限制的原文：
[ ] 关于 new results in the rebuttal 的原文句子：
[ ] 是否允许 confidential comment 给 AC：
[ ] rebuttal 截止日期与时区：
```
