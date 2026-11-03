# 异议打法库：14 类高频质疑

按 `parse_reviews.mjs` 输出的 `category` 直接检索本文件（每个小节标题就是类别名）。
每条给出：**识别信号 → 先判断 → 打法 → 英文范例（可直接改写）**。

范例里的 `[...]` 是占位符，必须换成真实内容；**没有真实数据时保留占位符并标注「待补证据」，绝不填假数字**。

---

## novelty

**信号**：`limited novelty` / `incremental` / `similar to [X]` / `just a combination of A and B` / `no difference from ...`

**先判断**：他是「找不到硬伤所以口味不合」（novelty 有限但通篇没有具体缺陷），还是真的指出了一个未被区分的先验工作？后者必须正面处理。

**打法**（三选一，按情况）：

1. **重新定义**：不谈模块新旧，谈架构带来的可用性差异。别人也有 ≠ 你也有价值。
2. **给出 rationale**：与别人不同本身不是贡献，要说清「为什么不同、带来什么好处」，并指到已有实验。
3. **围魏救赵**：单组件被攻击，把论述抬到整体范式或其他组件。

```
We respectfully clarify that our contribution is not the [component] itself but the
[interaction/architecture] it enables: [one-sentence mechanism]. This yields
[concrete benefit], which we already measure in Table [n] (Sec. [x], Line [y]) where
[method] improves by [z] under [setting]. We will sharpen this positioning in Sec. [x].
```

## baseline

**信号**：`missing baseline` / `only comparisons from 20xx` / `not compared with the strongest method`

**打法**分三种情形，别混用：

- **能做**：直接给数字，并说明对齐条件（同 backbone / 同分辨率 / 同参数预算）。
- **来不及做**：承诺终稿补，同时**立刻**用「参数/预算对齐」的控制实验或已有数字间接回答。注意力度较弱。
- **不合理**：说明为什么不需要（任务设定不同、数据不可得、代码未公开）。要具体到原因。

```
We compared with the strongest available baseline [name] under identical
[backbone/resolution/parameter budget]: [metric] [a] vs. ours [b] (Table [n]).
We did not compare with [x] because its code is not public, and with [y] because it
requires [unavailable data], which is outside what our task provides.
```

## experiment

**信号**：`no ablation` / `please report ...` / `the improvement is within noise` / `how many seeds`

**关键子情形**：

- **提升很小（~1%）**：无证据的空降质疑 → 引用已发表 SOTA 之间同量级差距；有证据的质疑 → 攻击对比公平性（分辨率/backbone/训练预算不同）。
- **统计可靠性**：给 seed 数、均值±方差、以及显著性检验（若真做了）。跑不到要求的 seed 数就如实说「能跑多少跑多少」。
- **要求与投稿之后才出现的工作比较**（例如某工作今年 7 月才挂 arXiv）：指出时间线，说明属于同期工作（contemporaneous），并欢迎终稿引用。

```
Under [k] seeds we obtain [mean] ± [std]; the gap to [baseline] is [d], which is
consistent with the [d'] gap reported between [published SOTA A] and [published SOTA B]
(CVPR/NeurIPS [year], Table [n]). We added a paired [test] over [n] samples: p = [p].
```

## theory

**信号**：`the proof assumes ...` / `this bound is vacuous` / `assumption is unrealistic`

**打法**：不要和审稿人在 rebuttal 里推公式。做两件事之一：(a) 用实验验证假设失败时会怎样；(b) 给一个具体 worked example 说明假设在你的设定下成立/近似成立。若确实过强，把定理降级为 proposition 并如实说明。

```
Assumption [n] holds when [condition], which is satisfied in our setting because
[evidence in Sec. x]. To check what happens when it fails, we ran [experiment]:
performance degrades by [d], i.e. the assumption is [mild/critical] in practice.
```

## scalability

**信号**：`complexity` / `runtime` / `memory` / `does it scale to ...`

**打法**：给 Big-O + 一个实测数字（延迟/显存/相对基线开销）。若论文里已有，指过去——这类问题一半是没找到。

```
The added cost is [O(...)] and [x]% wall-clock over [baseline] at [scale]
(Sec. [n], Line [y]: [table]). At [larger scale] this becomes [value], which we will state explicitly.
```

## reproducibility

**信号**：`code not available` / `hyperparameters missing` / `cannot tell how it was trained`

**注意**：多数会议 rebuttal 阶段**禁止外链**，别为了回答复现问题贴 GitHub 链接——那会破坏双盲并被直接拒。改为在文字里给出具体数值/清单，并承诺终稿随 camera-ready 释出。

代码与论文不一致的答法：说明仓库里包含开发与消融过程中的探索代码/简化实现，同时强调**核心方法与论文一致**。

```
Training uses [optimizer, lr, schedule, batch, #steps, hardware]; the fusion module is
[trained jointly / frozen] (Sec. [x], Alg. [y] — we will remove the inconsistency with
the appendix). The public release will include [list]; the current repo also contains
exploratory variants from our ablations, which is why some files differ from the paper.
```

## clarity

**信号**：`unclear` / `notation` / `hard to follow` / `typo` / `figure is small`

**打法**：这是最该痛快认的一类，也是**唯一要认得具体**的一类。禁止「我们会重写第三章」。要给可核查的动作：移动了什么、新增什么段落（最好把新段落原文贴出来）、后续每小节讲什么。

理由：只有一轮 rebuttal 时，审稿人和 AC 害怕的是**不可控的修改**（页数溢出、删掉他们喜欢的内容、引入新错误）。

```
We will (1) move Sec.3.1 background to Related Work; (2) add this overview paragraph at
the start of Sec.3: "[paste 2 sentences]"; (3) fix Eq.(4) reference in Sec.3.2 and unify
z / \hat{z}; (4) enlarge Fig.2 fonts to [x]pt. No page count changes.
```

## limitation

**信号**：`only evaluated on ...` / `generalization is unclear` / `scope is narrow`

**打法**：先补实验，再承认局限。顺序反了会显得工作不完整。承认局限时给出边界条件（什么情况下会失效），比笼统说「未来工作」更可信。

## soundness

**信号**：`overclaim` / `the conclusion does not follow` / `data leakage` / `unfair comparison`

**这是最危险的一类**——审稿人自己用了 `fundamental` / `invalid` 这类词。

**打法**：

1. 立刻核实。数据泄漏类指控要给出**具体协议**：划分依据、同一实体的样本是否跨集合、你如何保证。
2. 若指控成立 → 这是硬伤，如实说明影响范围，并给出修正后的主表（若来得及）。别藏。
3. 若不成立 → 当众纠正，先下一城。其他审稿人和 AC 都看得见。

```
Our split is at the [line/site/patient] level, not the sample level: all [entities] in
test appear in zero training sequences (Sec. [x], and we will state this in the caption of
Table [n]). We therefore believe the leakage concern does not apply; we agree that the
original wording made this easy to miss.
```

## ethics / broader impact

**信号**：`bias` / `privacy` / `dual use`

**打法**：照改不误。加一段声明的成本极低，对抗的成本极高。

## citation / related work

**信号**：`missing related work` / `you should cite [X]`

**打法**：除非你真诚不同意，否则引用并加一句实质讨论（不是罗列）。审稿人让你引的工作，往往也是他判断你 novelty 的依据。

## 要求多 seed / 多数据集但时间不够

```
We ran [n] of the [k] requested seeds within the rebuttal window and report
[mean] ± [std] over those [n]. We will complete the remaining [k-n] for the final version.
```

## 改进的是某个已有模型，被质疑「你没资格说创新」

去 OpenReview 找**那篇原论文自己的 rebuttal**，看当年审稿人提过什么、作者怎么答的。这类质疑几乎一定有先例，照抄已被接受的答法结构（不要照抄内容）。

## 含糊但严重的质疑 / 敌意评审

只答这一条 + 请他具体化 + 请求尽快回复 + 顺带把你已有的对比列全。不要向其他审稿人解释这位审稿人有多差。

```
Could you specify which comparison you consider missing? We currently compare with
[a, b, c] (Table 1). We did not include [d] (no public code) or [e] (dataset not
released). If you meant another method, we will add it immediately.
```

## 无法补的实验 / 超出范围

不要只说「超出范围」。给出：为什么超出（任务定义差异）+ 你做了什么替代（最接近的控制实验）+ 终稿会写什么。

```
[Experiment] requires [unavailable resource/label], which is outside the task setting
defined in Sec. 2. As the closest available control, we ran [proxy experiment], which
shows [result]. We will add this discussion and the limitation statement to the final version.
```
