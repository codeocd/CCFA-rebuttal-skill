# ACL / EMNLP / NAACL（ARR）— Rebuttal 规则卡

> 标记：✅ 官方可查 · 🟡 社区经验 · ❓ 每年/每周期会变，**必须核对当期 ARR 指南**

## 一句话

ACL 系已转向 **ARR（ACL Rolling Review）双月周期 + OpenReview 多轮对话**。
形态最接近「真实谈判」：**允许补实验、允许多轮往返、审稿人被期待回应**。
另有独立的 **ethics review** 通道，以及 ARR 之后的 **commitment / 会议直投** 两段流程。

## 关键参数

| 项目 | 值 | 标记 |
| --- | --- | --- |
| 平台 | OpenReview（ARR 投稿 → 审稿 → 作者回应 → AC meta-review → 可 commit 到某会议） | ✅ |
| 结构 | 每条 review 各一条 author response + 一条 global response | 🟡 |
| 长度 | 通常无硬字符上限；实践上第一版回复建议控制在数百词，长了没人读 | 🟡 |
| 富文本 | Markdown：表格、公式、列表全支持 | ✅ |
| 外链 | 允许但须匿名；**注意 anonymity period 政策近年已放宽但仍有条款** | ❓ 核对当期 |
| 补新实验 | **允许**（这是 ACL 社区改革明确写进政策的） | ✅ |
| 多轮讨论 | **有，且是核心**。审稿人通常被要求回应 author response 并说明是否改分 | ✅ |
| 修改论文 | ARR 允许在后续周期提交修订版（与 AI 系一次性投稿不同） | 🟡 |
| Ethics | 有独立 ethics review；伦理质疑要单独、认真回答 | ✅ |
| 打分 | ARR 用 1–5 量级 + 置信度 + Soundness/Contribution 分项；**字段与刻度以当期表单为准** | ❓ |
| 负分阈值（供 `--threshold`） | ❓ ARR 1–5 刻度时 borderline（**3**）以下即负，以当期表单为准 | ❓ |
| 审稿人可见性 | 互相可见 | 🟡 |

## ACL 系专属要点

1. **两段流程要分清**：ARR 阶段的 author response 影响 ARR AC 的 meta-review 与分数；之后 commit 到 ACL/EMNLP/NAACL 时，会议侧可能还有 commitment 阶段的补充回应。**在 ARR 阶段就把事情解决**，别指望 commit 后再翻盘。
2. **多轮 = 你有权追问，也有义务尽快回**。第一版回复后，如果审稿人没回应，一条简短 ping（`@Reviewer X, may I ask whether [point] resolves your concern?`）比再写一千词有效。
3. **NLP 领域高频质疑及处理**：
   - 「和 LLM prompting 比过吗」→ 给对齐条件（同模型规模/同 token 预算/同数据），说明你的方法在**哪一维**占优（成本、可控性、数据效率），别宣称全面超越。
   - 「数据污染 / benchmark leakage」→ 给出污染检查协议（n-gram 重叠、去重方法），这是硬伤级质疑，必须实证回答。
   - 「评测指标单一 / 只报自动指标」→ 补人工评测或至少说明自动指标与该任务的相关性依据。
   - 「统计显著性」→ 多 seed + 显著性检验；跑不到要求的次数就如实说明跑了多少次。
   - 「novelty 相对某 arXiv 工作」→ 指出时间线（contemporaneous）+ 实质差异。
4. **ethics 质疑不要对抗**。加一段声明的成本极低，对抗的成本极高；照改不误。

## 常见坑

- 把多轮当成「一次写完就等结果」，浪费追问机会。
- 在 ARR 阶段留了尾巴（承诺未来补），commit 时审稿人已经换了一批。
- 只答语言层面的质疑，忽略 Soundness / Contribution 分项分数背后的真实顾虑。
- 忽略 ethics reviewer。

## 官方原文（粘贴处）

```
[ ] 当期 ARR Author Guidelines 关于 author response 的原文：
[ ] 审稿人被要求回应的条款原文：
[ ] anonymity period 条款：
[ ] 本周期截止日 + commitment 截止日：
```
