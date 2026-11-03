# 会议规则库索引

**用法**：确定投稿会议后，读本目录下对应文件；不确定格式就先看下面的路由表。
**检索**：`grep -ri "cvpr" references/conferences/` 或让 agent 按会议名找文件。

> ⚠️ 本库的规则卡是**辅助记忆，不是权威来源**。每一年 CFP 都可能改字符上限和补实验政策。
> 起草前必须核对**当年的官方作者通知邮件 / CFP 原文**。规则卡里标注了每条信息的可信度。

## 标记约定

- ✅ 官方文件或作者邮件原文可查
- 🟡 社区/群友经验，多数年份稳定但未逐条核实
- ❓ 存在冲突或未经核实，**必须自己确认**

## 三种 rebuttal 形态（先搞清楚你属于哪一种）

| 形态 | 代表会议 | 能不能放表/图 | 字数怎么算 | 策略含义 |
| --- | --- | --- | --- | --- |
| **纯文本 + 字符上限** | AAAI、IJCAI | 只能塞 Markdown，表格极贵 | 按字符（`apple`=5） | 预算极紧，必须编号化 + 紧凑行 |
| **1 页 PDF** | CVPR / ICCV / ECCV | 可以放小表和小图 | 按页 | 排版即预算；超页/改边距**不会被读** |
| **OpenReview 讨论期** | NeurIPS / ICLR / ICML / ACL(ARR) | 支持 Markdown、表格、可多轮 | 通常无硬上限 | 拼的是「让 AC 看到疑虑被解决」，可以追问 |

## 路由表

| 会议 | 目录 | 形态 | 上限 | 可否补实验 | 讨论期 | 审稿人互相可见 |
| --- | --- | --- | --- | --- | --- | --- |
| AAAI | [aaai.md](aaai.md) | 纯文本 | 每条 1500 字符 ❓ | ❓ 政策有冲突 | 无 | ✅ 是 |
| IJCAI | [aaai.md](aaai.md) 同族 | 纯文本 | 往年约 5000 字符 🟡 | ❓ | 无 | 🟡 |
| NeurIPS | [neurips.md](neurips.md) | OpenReview | 无硬上限 🟡 | ✅ 鼓励 | 有（数周） | ✅ |
| ICML | [icml.md](icml.md) | OpenReview | 无硬上限 🟡 | ✅ | 有 | ✅ |
| ICLR | [iclr.md](iclr.md) | OpenReview | 无硬上限 🟡 | ✅ | 有（较长） | ✅ 公开 |
| CVPR / ICCV / ECCV | [cvpr.md](cvpr.md) | 1 页 PDF | 1 页 ✅ | ⚠️ 不建议 | 无/短 | ❌ |
| ACL / EMNLP / NAACL (ARR) | [acl.md](acl.md) | OpenReview 多轮 | 无硬上限 🟡 | ✅ 允许 | 有，多轮 | ✅ |
| ACM MM / SIGIR / KDD / WWW | 见下方「其他 CCF-A」 | 多为纯文本或 PDF | 各异 ❓ | ❓ | 各异 | ❓ |
| EMNLP(旧) / COLING | 见 [acl.md](acl.md) | 各异 | 各异 ❓ |  | 各异 |  |

## 其他 CCF-A 领域（差异大，务必读官方 CFP）

| 领域 | 会议 | 作者反馈机制 | 要点 |
| --- | --- | --- | --- |
| 理论 | STOC / FOCS / SODA | 通常**无 rebuttal** | 直接进 revision，靠 rework 而非辩论 |
| 安全 | S&P / CCS / USENIX Sec / NDSS | 一轮 author response + revision cycle | 可补实验；对「伦理/责任披露」极敏感 |
| 系统 | OSDI / SOSP / ATC / EuroSys | 多数有 short response + shepherding | 承诺要具体到可核查 |
| 数据/IR | KDD / WWW / SIGIR / ICDM | 纯文本或 PDF，各异 | 常禁止外链；工业 track 注意匿名 |
| 多媒体 | ACM MM / ISWC | 各异 ❓ | 注意补充材料的匿名规则 |
| HCI/交叉 | CHI / UbiComp / SIGGRAPH | CHI 有 revision；SIGGRAPH 特殊 | 与 AI 类流程差别大，别套用 |

**新增一张卡的正确做法**：复制 [_TEMPLATE.md](_TEMPLATE.md)，把当年 CFP/作者邮件里的原句贴进「官方原文」一节，再填其余槽位。

## 通用不变量（跨会议都成立）

1. 字符/页数限制是**硬**的，超出直接提交失败或不被阅读。
2. 双盲期间**禁止**任何暴露身份的外链、仓库名、致谢。
3. 决定录用的是 AC/SAC/SPC，不是审稿人。
4. 「我们会改」必须变成「我们把 X 加到 Table Y」。
5. 永远不要把「打算做」写成「做了」。
