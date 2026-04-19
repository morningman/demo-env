# Doris Hybrid Search 静态网页小游戏设计文档

## 1. 概述

这个项目要做一个静态、移动端优先的网页小游戏，让用户在约 60 到 90 秒内直观理解 Doris Hybrid Search 的完整价值。用户不需要懂 Doris，也不需要懂 BM25、ANN、RRF 这些技术细节。用户需要在一次轻量、流畅、有科技感的互动里记住一件事：

**好的搜索结果，不只是匹配词，还要结合过滤、文本、语义，并在一次查询里完成统一融合。**

本项目用于活动落地页或官网专题页中的互动模块，重点是传播和理解，不是产品控制台，也不是真实搜索 Demo。

为了增强游戏感，体验外壳会采用一个清晰任务：

> One of these stays is the best fit. Find it.

整场体验不靠积分弹窗，而是通过一个持续上升的 `Match Confidence` 进度装置，让用户感觉自己正在不断逼近最合适的酒店。

## 2. 目标

### 产品目标

1. 让用户理解 Hybrid Search 为什么比单一搜索方式更稳。
2. 让用户感知 Doris 的优势在于：过滤、文本搜索、语义搜索、结果融合可以在一条查询链路中完成。
3. 让用户愿意继续了解 Doris Hybrid Search。
4. 让用户感受到自己在完成一个任务，而不是按顺序看一段会动的流程说明。

### 用户目标

1. 快速进入情境，不需要先了解 Doris。
2. 每一步只做一个判断，轻松完成整段体验。
3. 在手机竖屏上获得顺滑、连续、带科技感的反馈。

### 非目标

1. 不做真实后端搜索。
2. 不让用户自由输入查询。
3. 不深入讲解公式、索引结构或 SQL 细节。
4. 不把页面做成复杂产品控制台。

## 3. 目标受众

主要受众是活动落地页上的广泛技术人群，包括开发者、数据工程师、架构师，以及对 AI 搜索或数据库感兴趣但不熟悉 Doris 的用户。

这意味着设计必须先解决代入感，再解决知识传递。场景不能依赖 Doris 文档或数据库背景知识。

## 4. 核心设计思路

项目采用一个大多数人熟悉的场景：**找酒店 / 民宿**。

用户会自然理解以下需求：

- 先筛掉不可能的结果
- 既要看字面信息，也要理解描述背后的意思
- 最后要把不同信号合成一个更可靠的排序

这个场景天然对应 Doris Hybrid Search 的四个核心环节：

| 游戏阶段 | Doris 能力 | 用户直觉 |
| --- | --- | --- |
| Filter First | 结构化过滤 | 先缩小范围，结果才更靠谱 |
| Recall in Parallel | 文本搜索 + 向量语义搜索 | 字面和语义都重要 |
| Fuse to Win | 结果融合 | 最终排序要综合多个信号 |
| Finish | 单次查询中的统一执行 | 一次查询完成整条链路 |

## 5. 产品形态

产品形态是一个静态单页小游戏，移动端优先，默认竖屏。

整页是一条连续的任务流：

1. Intro
2. Level 1: Filter First
3. Level 2: Recall in Parallel
4. Level 3: Fuse to Win
5. Finish
6. Deep Dive Replay

每个阶段接近一屏高度。用户完成当前阶段的唯一动作后，页面自动平滑下滑到下一阶段。整体感受像沿着一条检索链路往下推进，而不是在多个页面之间跳转。

设计默认不采用关卡内部滚动。若 Level 1 在最小竖屏尺寸下内容过高，应优先压缩视觉密度，而不是引入单关卡内滚动。

## 6. 故事情境

用户扮演一个旅行助手，帮助真实用户为一次周末家庭出行找到合适的酒店。

用户看到的核心任务文案应为英文，并面向北美用户表达：

> Find a hotel for a family weekend trip.

用户需求分成两层：

1. **硬条件**：City、Check-in、Budget
2. **软需求**：quiet, family-friendly, close to the main attractions

这个拆分直接对应 Doris 的三段能力链：

1. 先通过结构化字段过滤得到初始候选集
2. 再在候选集上并行做文本检索和语义检索
3. 最后通过 RRF 融合得到最终 TopK

## 7. 用户旅程

### 7.1 Intro

目标是快速建立任务感和代入感。

- 标题要直接，像真实产品体验，而不是夸张游戏文案
- 副标题说明：一次搜索不只靠一个信号
- 主按钮引导进入第一关
- 页面视觉提示用户这是一条连续的查询旅程
- 页面右侧从一开始就出现 `Match Confidence` 纵向进度装置

建议文案方向：

- 标题：`Find the stay that really fits`
- 副标题：`One search. More than one signal.`
- 任务提示：`One of these stays is the best fit. Find it.`

`Match Confidence` 纵向进度装置需要设置两个 checkpoints：

1. `Good Options`
2. `Best Match Found`

初始状态下，`Match Confidence` 以较低液位出现，推荐起始值约为 18%，表示用户还在搜索早期。

### 7.2 Level 1: Filter First

这一关代表 **结构化字段过滤**。它的作用不是做文本检索，而是通过硬条件先缩小搜索空间，为后续检索生成初始候选集。

#### 用户看到的文案

- 标题：`Level 1: Narrow the field`
- 副标题：`Use exact filters to turn a broad search into a clean candidate set.`

#### 过滤条件

Level 1 只展示三组英文 filter chips：

- `City`: `Boston`, `Seattle`, `San Diego`
- `Check-in`: `This weekend`, `Next weekend`
- `Budget`: `Budget: $250-$400`, `Budget: $401-$650`

chips 采用 `Field + value` 的表达方式，例如：

- `City: Boston`
- `Check-in: This weekend`
- `Budget: $250-$400`

用户可以自由组合，组合总数为 12 种。12 种组合都有效，都会生成正确的候选集。不同组合的候选内容不同，但页面骨架保持一致。

#### 交互方式

- 用户每点击一个 chip，下方候选集立刻变化
- chips 可替换，不锁死
- 当 City、Check-in、Budget 三组都已有选中值后，shortlist 区域下方出现一个明确的 `Continue` 入口
- 用户点击 `Continue` 后，`Match Confidence` 到达 `Good Options`，页面再进入 Level 2

#### 视觉结构

- 上半部分是 **compressed result fragment stream**
  - 表现大规模、混杂、尚未收敛的结果池
  - 不是完整卡片，也不是抽象词云，而是被压缩过的酒店结果碎片流
  - 具体形态可理解为大量简短酒店名、价格片段、标签片段和位置片段组成的高密度信息流
- 下半部分是 **shortlist area**
  - 随着过滤生效，逐步沉淀出真实候选条目

#### 输出结果

- 最终固定输出 `10 shortlisted stays`
- 数量固定，但内容随 12 种组合变化
- 视觉上展示 4 条完整 rows，第 5 条半露出

每条 shortlist row 只显示：

- Hotel name
- Nightly price
- 2 tags
- 1 short location line

#### 用户收获

- 结构化过滤先缩小搜索空间
- Level 1 的输出是 Level 2 的输入
- 这一步体现的是数据库对结构化字段的条件过滤能力

当用户完成 Level 1 时，右侧 `Match Confidence` 液位上升到第一个 checkpoint：`Good Options`。达到该 checkpoint 后，页面才进入下一关。

### 7.3 Level 2: Recall in Parallel

这一关代表 Doris 的两条并行检索路径。输入是 Level 1 产出的 10 个候选结果，系统会基于同一批候选集，同时运行文本检索和语义检索。

#### 用户看到的文案

- 标题：`Level 2: Retrieve in parallel`
- 副标题：`Run two retrieval paths on the same candidate set.`

#### 查询条件呈现

- 顶部保留 Level 1 已生效的硬条件，作为轻提示
- 中间用一条 query bar 展示软需求：
  - `quiet, family-friendly, close to the main attractions`
- query bar 在进入 Level 2 时已经处于预填充状态，用户不输入文字，只点击它来启动两条检索通道

#### 触发方式

- 用户点击一次带搜索条件的可点击 query bar。它既展示搜索条件，也是当前关卡的唯一触发件
- 两条通道同时启动
- 允许轻微错峰出现结果，便于阅读，但逻辑上是并行执行

#### 两条检索通道

左侧：

- `Text Retrieval`
- 技术副标题：`Inverted Index + BM25`

右侧：

- `Semantic Retrieval`
- 技术副标题：`ANN Vector Retrieve`

#### 输出结果

- 两边各展示 Top 3
- 每条结果都带轻量理由标签
- Text 侧强调字面 / 文本命中
- Semantic 侧强调语义接近
- 两边结果部分重叠，部分不同

这意味着：

- 有些酒店会同时出现在两边结果里
- 也会有只被某一条通道推出来的结果

#### 用户收获

- 文本检索擅长抓字面线索
- 语义检索擅长抓意思接近
- 同一批候选集会因为不同信号而产生两组合理但不同的 TopK

当两条通道完成并展示出两组 Top 3 后，右侧 `Match Confidence` 液位继续上升，但不会到达最终 checkpoint。

Level 2 的结尾需要出现一个明确动作：`Fuse the Ranking`。用户点击后，页面进入 Level 3。

### 7.4 Level 3: Fuse to Win

这一关代表 Doris 的 **RRF Fusion**。它不再做新的检索，而是接住 Level 2 的两组 Top 3，把文本检索和语义检索的结果统一融合，输出最终最佳 TopK。

#### 交互方式

- Level 3 的进入条件是用户在 Level 2 末尾点击 `Fuse the Ranking`
- 进入 Level 3 后，不再要求用户做额外点击
- 融合动画自动开始

#### 视觉表现

- 左右两边结果卡保持可见
- 用户触发融合后，两边卡片沿轨迹向中间汇聚
- 中间生成 `Final Top 3`
- 在两边都表现较好的结果升到更高位置

#### 用户看到的文案

- 主标题：`Final Ranking`
- 技术标签：`RRF Fusion`
- 辅助文案：`Text and semantic results are fused into one final Top 3.`

#### 用户收获

- Hybrid search 的关键不只是两条检索并行
- 真正更稳的结果来自最终融合
- Doris 不只是能并行检索，还能把两边结果统一融合计算

Level 3 完成后，右侧 `Match Confidence` 液位到达最后一个 checkpoint：`Best Match Found`。

紧接着，屏幕中央先出现一个短促的烟花 / 能量绽放效果，然后弹出一个 win modal。

### 7.5 Finish

结尾页需要完成两件事：

1. 用一句话收口用户刚刚经历的逻辑
2. 把这段体验和 Doris 的能力挂钩

建议收口方向：

> Apache Doris can filter, retrieve, and fuse in one flow.

win modal 的核心内容应是：

1. `Best Match Found`
2. `Final Top 3` 酒店结果
3. 第 1 名使用主卡展示，第 2 名和第 3 名使用较小的辅助卡展示
4. 一句很轻的 Doris 价值收口
5. CTA
6. `See how Doris made this work` 入口按钮
7. `Replay the experience` 次级入口按钮

CTA 应该轻，不要硬转化。适合使用“继续了解 Hybrid Search”这类按钮文案。

CTA 跳转目标应作为可配置项处理，默认由 marketing 在实现计划阶段提供最终链接，不写死在当前 spec 中。若实现时链接仍未到位，页面需先使用 `#` 作为安全占位。

当用户到达 win modal 后，页面进入 persistent win state。用户此时可以：

- 进入 Deep Dive，查看 Doris 内部执行链路
- 重新开始主体验，从 Intro 再玩一遍

若用户选择 Replay，则需要清空主流程中的瞬时阶段状态，并返回 Intro；但页面仍可视为一次已达成过 `Best Match Found` 的体验会话。

### 7.6 Deep Dive Replay

这部分是 win modal 之后的第二幕，用来进一步解释 Doris 内部如何执行刚才那次搜索。

Deep Dive 属于当前版本的正式范围，不是后续再考虑的增强项。主流程完成后，用户需要始终可以从 win modal 进入这一段体验。

入口按钮文案为：

`See how Doris made this work`

#### 形式原则

- 这是一个 manual Vertical Replay，不沿用主游戏的自动推进
- Deep Dive 采用数据库对象视角，而不是玩家交互视角
- Replay 复用用户刚才的真实路径，而不是切成固定通用示例
- Deep Dive 中出现的筛选条件、候选集和 Top 3 结果，都需要与用户在主流程中实际完成的 `combination_id` 保持一致；不允许切回固定示例城市或固定预算
- Deep Dive 采用单页内联展开模式：用户从 Finish 点击入口后，页面继续向下滚动进入 Deep Dive，不使用 modal overlay，也不切换到单独路由
- 每一步采用相同的展示骨架：
  1. 步骤标题
  2. 一段简化 Doris SQL
  3. 一张大的技术图 placeholder
  4. 2 到 3 行简短解释
  5. `Next` 或继续下滑提示
- 每一屏底部固定同权重双按钮条：
  - `Download Apache Doris`
  - `VeloDB Free Trial`
- Deep Dive 的最后一屏需要提供返回主体验的明确入口；返回目标为 Finish 区域，且保留 win state，不强制用户重新开始
- Deep Dive 中每一屏的技术图在当前版本按 placeholder 资产规划；前端只需预留稳定布局与插图槽位，不要求在实现阶段同步完成最终技术插画

#### Replay 步骤

1. **Screen 1: Table View**
   - 标题：`Table View`
   - 副标题：`Doris stores structured fields, searchable text, and vector fields in the same table.`
   - 展示内容：简化后的酒店表结构 + 示例字段
   - 字段分成三组：
      - structured fields: `hotel_name`, `city`, `check_in_window`, `nightly_price`, `budget_band`
      - text fields: `hotel_description`, `hotel_tags`
      - vector fields: `image_embedding`, `description_embedding`
   - 解释重点：同一张表可以同时承载过滤字段、文本字段和向量字段
2. **Screen 2: Structured Filter**
   - 标题：`Structured Filter`
   - 副标题：`Doris first narrows the search space with exact conditions.`
   - SQL 采用“真实但简化”的形式，并生成候选视图。示例值必须来自用户刚才实际选中的 `combination_id`：
      ```sql
      CREATE VIEW hotel_candidates AS
      SELECT hotel_id, hotel_name, nightly_price, budget_band,
             hotel_description, hotel_tags,
             image_embedding, description_embedding
      FROM hotels
      WHERE city = '[selected_city]'
        AND check_in_window = '[selected_check_in_window]'
        AND nightly_price BETWEEN [budget_min] AND [budget_max];
      ```
   - 解释重点：先生成候选集，再进入后续检索
3. **Screen 3: Text Retrieval**
   - 标题：`Text Retrieval`
   - 副标题：`Doris runs full-text search on the filtered candidate set.`
   - SQL 示例：
     ```sql
     SELECT hotel_id, hotel_name, score() AS bm25
     FROM hotel_candidates
     WHERE hotel_description MATCH_ANY 'quiet family-friendly attractions'
        OR hotel_tags MATCH_ANY 'quiet family-friendly attractions'
     ORDER BY score() DESC
     LIMIT 3;
     ```
   - 配一个内部运行逻辑架构图 placeholder
   - 解释重点：倒排索引和 BM25 如何产出 Text Top 3
4. **Screen 4: Semantic Retrieval**
   - 标题：`Semantic Retrieval`
   - 副标题：`Doris runs vector search on the same candidate view.`
   - SQL 示例：
     ```sql
     SELECT hotel_id, hotel_name,
            l2_distance_approximate(description_embedding, [query_vector]) AS dist
     FROM hotel_candidates
     ORDER BY dist ASC
     LIMIT 3;
     ```
   - 配一个内部运行逻辑架构图 placeholder
   - 解释重点：向量检索如何产出 Semantic Top 3
5. **Screen 5: RRF Fusion**
   - 标题：`RRF Fusion`
   - 副标题：`Doris fuses the two ranked result sets into one final Top 3.`
   - SQL 示例：
     ```sql
     WITH fused AS (
       SELECT hotel_id, SUM(1.0 / (60 + rank)) AS rrf_score
       FROM (
         SELECT hotel_id, text_rank AS rank FROM text_top3
         UNION ALL
         SELECT hotel_id, semantic_rank AS rank FROM semantic_top3
       ) ranked_results
       GROUP BY hotel_id
     )
     SELECT hotel_id, rrf_score
     FROM fused
     ORDER BY rrf_score DESC
     LIMIT 3;
     ```
   - 配一个内部运行逻辑架构图 placeholder
   - 解释重点：RRF 不是拼接，而是基于 rank 融合成最终 Top 3

#### 视觉要求

- 整体风格延续主游戏，但更技术化
- 图片 placeholder 占比更大，文字更短
- 先确定展示形式，图片细节后续再单独设计
- SQL 需要真实但简化，能看出 Doris 的能力链，但不堆满生产细节

## 8. 交互设计

### 8.1 基本交互原则

1. 每个阶段只允许一个核心动作。
2. 不要求用户输入文字。
3. 阶段中不应出现 dead end 或需要重开的失败态。
4. 每一步反馈只解释一个知识点。
5. 游戏感要来自持续进展，不来自打断式弹窗。

### 8.2 页面推进方式

页面推进必须优先适配手机竖屏体验。

- 用户完成动作后，页面自动 smooth scroll 到下一阶段
- 已完成阶段缩成上方摘要模块
- 新阶段从下方滑入，并由连线、发光、卡片位移动效承接
- `Match Confidence` 在手机上以固定在右侧边缘的细窄纵向条持续可见，并在达到 checkpoint 时同步抬升液位

这种推进方式要让用户感觉自己在沿着一条真实查询链往下走。

摘要模块至少包含该关卡标题、已达到的 checkpoint 文案，以及一条极短的结果摘要，用来提醒用户上一关完成了什么。

页面状态机需要满足以下规则：

- 已完成阶段的摘要模块可被重新打开，允许用户回改更早一步的选择
- 一旦用户回改上游阶段，所有下游阶段结果、摘要和完成态都需要按当前输入重新计算，不允许保留旧结果假装成功
- 浏览器刷新后，页面需要恢复到最近已完成或正在进行的阶段，并保留当前选择与已生成结果
- Finish 达成后，页面进入可持续存在的 win state；用户从 Deep Dive 返回时，应回到 Finish 区域并保留该状态
- 用户点击 `Replay the experience` 后，主流程开始一个新的 run：返回 Intro，清空阶段进度、当前选择和结果缓存；刷新恢复只针对当前 run 生效
- 进入 Deep Dive 后，刷新应恢复到当前 Deep Dive 屏；退出 Deep Dive 后，再恢复 Finish / win state

建议在实现计划中直接使用一张状态转移表覆盖以下关键事件：`Start`、`Continue`、`Run retrieval`、`Fuse the Ranking`、`Open Deep Dive`、`Return to Finish`、`Replay the experience`、`Refresh`、`Edit previous stage`。

### 8.3 动效原则

动效要达到以下目标：

1. 让流程连续
2. 让结果变化一眼可见
3. 保持科技感

推荐动效：

- chips 吸附和点亮
- 卡片淡出和筛掉
- 两路召回通道同时亮起
- 结果卡片向中间榜单汇聚
- 最优结果上浮到第一位
- 查询链路节点和连接线在阶段完成后同步点亮，明确提示当前流程已向下推进
- 右侧 `Match Confidence` 水位抬升并触达 checkpoint

不推荐：

- 过重的弹跳
- 过多的旋转或装饰性粒子
- 会延长操作时间的夸张转场
- 每关结束时额外弹出一层奖励提示

### 8.4 降级与可访问性

- 需要支持 `prefers-reduced-motion`
- 降级后依然保留阶段推进，只减少位移和发光动画
- 触控元素尺寸需适合手机单手点击
- 文案长度必须控制，避免小屏拥挤

## 9. 视觉设计方向

整体风格应体现以下关键词：

- 科技感
- 丝滑
- 克制
- 清晰
- 未来感

建议视觉表达：

- 深色背景
- 高对比结果卡
- 青蓝或蓝紫发光线条
- 用节点、连接线、流动光效表达“查询链路”

技术元素如 `BM25`、`ANN`、`RRF` 适合做成小型徽标、角标或背景浮层，作为专业感来源，不应成为主文案焦点。

## 10. 内容与数据设计

本项目不接真实数据源。所有结果、排序、反馈均为预设内容，但不同 Level 之间的输入输出关系需要保持一致。

需要准备：

1. 12 组 Level 1 有效过滤组合
2. 一个共享酒店内容池
3. 每个组合对应的 10 条 shortlisted stays
4. 每组 shortlist 对应的 Level 2 Text Top 3
5. 每组 shortlist 对应的 Level 2 Semantic Top 3
6. 每组 Level 2 结果对应的 Level 3 Final Top 3
7. 每个阶段的反馈文案和状态切换文案

数据规模按如下方式固定：

1. Level 1 有 12 个有效组合
2. 酒店内容不要求 12 x 10 全部唯一
3. 内容准备采用一个共享酒店池，固定规模为 30 家
4. 每个有效组合从共享酒店池中筛出 10 条 shortlisted stays
5. Level 2 在这 10 条候选上生成两组并行结果，各自 Top 3
6. Level 3 基于这两组 Top 3 融合出 Final Top 3

这个固定规模可以直接指导状态设计、内容准备和画面编排。

### 10.1 数据 contract

为保证内容生产、状态管理和渲染规则一致，预设数据至少拆成以下三层：

1. `hotel_pool`
2. `filter_combinations`
3. `stage_results`

建议字段如下：

| 数据层 | 必备字段 | 说明 |
| --- | --- | --- |
| `hotel_pool` | `hotel_id`, `hotel_name`, `city`, `check_in_window`, `nightly_price`, `budget_band`, `hotel_tags`, `location_line`, `hotel_description`, `illustration_key` | 30 家酒店的主档。`hotel_id` 为稳定主键，供全部关卡复用。 |
| `filter_combinations` | `combination_id`, `city`, `check_in_window`, `budget_band`, `shortlisted_hotel_ids` | 12 组 Level 1 组合配置。每组固定映射到 10 条 shortlist。 |
| `stage_results` | `combination_id`, `text_top3`, `semantic_top3`, `final_top3` | 每组 Level 2 / Level 3 的结果映射。`text_top3` 与 `semantic_top3` 内的单项需包含 `hotel_id` 与 `reason_tags`。`final_top3` 仅需包含最终名次与 `hotel_id`。 |

组合之间的关系需要遵循以下约束：

- 12 组 Level 1 组合之间必须部分重叠、部分独有，不应给人“同一组结果换皮”或“完全随机重置”的感受
- 同城且预算相邻的组合，shortlist 重叠度应更高
- 跨城市组合，shortlist 重叠度应显著更低
- 所有组合都必须有效，不允许出现空结果或需要重选的失败态

建议的 shortlist 重叠目标如下：

- 同城、同 check-in、仅 budget 不同：重叠 4-6 条
- 同城、同 budget、仅 check-in 不同：重叠 3-5 条
- 不同城市组合：重叠 0-2 条

### 10.2 结果映射规则

Level 2 与 Level 3 的映射规则需要固定，保证不同组合虽然内容变化，但学习路径稳定：

- 对任意一个 `combination_id`，`Text Top 3` 与 `Semantic Top 3` 默认恰好重叠 1 条结果
- 因此两路结果合并后的候选集合默认是 5 条，既能体现共识，也能体现互补
- `Final Top 3` 的第 1 名默认来自两路都出现的重叠结果
- `Final Top 3` 的第 2 名和第 3 名默认分别保留 1 条偏文本、和 1 条偏语义的结果
- Final 榜单卡片只显示最终名次，不额外展示技术解释标签；融合逻辑主要通过 Level 2 到 Level 3 的汇聚动画表达

### 10.3 标签字典与文案长度约束

Budget 需要使用固定映射，避免 `budget_band`、chip 文案和 SQL 条件各写各的：

| `budget_band` | chip 展示文案 | SQL 条件 |
| --- | --- | --- |
| `budget_mid` | `$250-$400` | `nightly_price BETWEEN 250 AND 400` |
| `budget_high` | `$401-$650` | `nightly_price BETWEEN 401 AND 650` |

为避免内容风格漂移，理由标签采用固定枚举库，不使用自由文案。建议至少包含：

- `quiet match`
- `family-friendly match`
- `near attractions`
- `budget fit`
- `central access`
- `calm vibe`
- `good for kids`
- `walkable area`

字段长度需要写死在内容规范中，避免小屏布局失控：

| 字段 | 长度上限 | 说明 |
| --- | --- | --- |
| `hotel_name` | 32 characters | 适用于 Level 1 / 2 / 3 全部卡片 |
| 单个 `hotel_tag` | 16 characters | Level 1 每条展示 2 个 |
| `location_line` | 38 characters | 单行展示，不换行 |
| 单个 `reason_tag` | 20 characters | Level 2 每张卡最多 1-2 个 |
| `budget_band` 展示文案 | 14 characters | 适配 chip 和卡片 |

卡片视觉资产统一采用同一风格的插画占位，不使用混杂的真实照片。这样可以控制静态页面的资产复杂度，并保持整体科技感。

默认素材来源是项目内自制插画或 AI 生成后统一风格处理的插画，不依赖零散图库照片。

Level 1 的 shortlist row 至少应包含：

- 酒店名
- 每晚价格
- 2 个标签
- 1 行简短位置说明

Level 2 中出现的结果卡可在此基础上增加轻量理由标签，用于说明文本命中或语义接近。Level 3 的 Final Top 3 仅显示最终名次，不再重复展示技术解释标签。

## 11. 状态与反馈设计

项目不应该用“答题失败”制造挫败感。

本体验不是问答游戏，而是目标导向的进展体验。用户的主要反馈来自状态推进，而不是对错分支。

应采用以下策略：

- Level 1 中所有 12 个过滤组合都有效，区别只在候选集内容不同
- Level 2 和 Level 3 的核心动作分别是启动并行检索和触发融合，不设计对错选择题
- 持续反馈依赖 `Match Confidence` 进度装置，而不是积分、弹窗或中断式奖励
- 每个阶段通过结果变化、checkpoint 提升和文案解释，让用户感觉自己更接近最佳匹配

这样可以保证所有用户都完整走完流程，同时把体验重点集中在 Doris 能力链本身，而不是做题正确率。

## 12. 实现边界

本设计文档默认以下实现边界：

1. 这是静态网页，不依赖后端接口
2. 这是单页体验，不做多路由站点
3. 重点是移动端竖屏，桌面端只做兼容展示
4. 不扩展为真实酒店搜索产品
5. 不在本阶段加入复杂积分体系、排行榜或社交分享机制
6. Deep Dive Replay 属于当前版本范围，不作为后续增强项延后

## 13. 规划阶段需要覆盖的实现点

后续实现计划至少需要覆盖以下方面：

1. 页面结构与阶段状态管理
2. 竖屏布局与移动端适配
3. 平滑下滑推进和动画编排
4. 结果卡片数据结构与预设状态切换
5. 12 个有效过滤组合与共享酒店池的数据准备
6. 基于进展状态的反馈设计与 checkpoint 提升
7. `prefers-reduced-motion` 降级策略
8. CTA 与收口文案落点
9. post-win Deep Dive 的 5 屏结构、SQL 内容和常驻双按钮条
10. 验收所需的埋点事件与统计口径

## 14. 验收标准

从传播效果和活动落地视角看，本体验的核心验收指标应为：

1. 从 Intro 开始到 Finish 的中位完成时长不超过 90 秒
2. 点击 `Start` 进入主体验的用户中，至少 85% 能走到 Finish
3. 到达 Finish / win modal 的用户中，主 CTA 点击率至少达到 15%

这些指标优先用于判断体验是否足够顺滑、是否足够容易完成、以及是否能把兴趣导向后续了解动作。

为支撑这些指标，当前版本需要至少具备以下埋点：

- `intro_started`: 用户点击 `Start`
- `level1_completed`: 用户在 Level 1 点击 `Continue`
- `level2_triggered`: 用户点击 query bar 启动双路检索
- `level3_fused`: 用户点击 `Fuse the Ranking`
- `finish_reached`: win modal 首次出现
- `deep_dive_opened`: 用户从 Finish 进入 Deep Dive
- `replay_started`: 用户点击 `Replay the experience`
- `primary_cta_clicked`: 用户点击 Finish 的主 CTA

验收统计口径默认如下：

- 完成时长：`intro_started` 到 `finish_reached` 的中位时长
- 完成率：`finish_reached / intro_started`
- CTA 点击率：`primary_cta_clicked / finish_reached`

如果设计实现正确，用户在完成体验后应能说出类似下面的话：

1. 先通过结构化条件缩小候选空间。
2. 文本检索和语义检索会在同一批候选上得到不同的 TopK。
3. 最终结果要把两种检索结果融合起来。
4. Doris 可以把过滤、并行检索和融合放在同一条流程里完成。

上面四点仍然是本设计的核心理解目标；但在上线验收时，应优先结合完成率、完成时长和 CTA 行为一起判断，而不是只用主观感受评估是否成功。
