# Ninjaman 优化计划

日期：2026-05-25

## 目标

这份文档记录当前代码状态下的优化计划。它替代旧的改造方案，重点不再是已经完成的资源 manifest、基础动画接入、canvas 比例修复或工具链升级，而是聚焦当前 review 中仍然存在的工程风险。

当前项目已经具备稳定基础：

- `npm run typecheck` 通过。
- `npm test` 通过，4 个测试文件、19 个测试。
- `npm run test:visual` 通过，2 个 Playwright 测试。
- `npm run build` 通过。
- `npm audit --audit-level=moderate` 通过，0 vulnerabilities。
- 项目使用 Phaser 4、Vite 8、TypeScript 6、Vitest 4，并已有 Playwright 主流程 smoke test。

当前最值得优先处理的问题集中在：

- 场景重启和事件监听的生命周期清理。
- 玩家和 Boss 状态 timer 的一致性。
- 主流程 e2e/smoke 覆盖不足。
- dev asset tooling 依赖链已清理，资源打包脚本改为使用 `jimp`。
- 文档和依赖分类需要跟上真实项目状态。

## 当前证据快照

已验证命令：

```bash
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
```

验证结果：

- TypeScript 检查通过。
- Vitest 单测通过。
- Vite 生产构建通过。
- `npm audit --audit-level=moderate` 通过，0 vulnerabilities。

已移除的历史风险链路：

```text
free-tex-packer-core -> jimp <=0.3.5 -> request/form-data/jpeg-js/minimist/qs/tough-cookie/url-regex/uuid
```

`scripts/pack_assets.js` 现在使用项目已有的现代 `jimp` 依赖，不再依赖 `free-tex-packer-core`。

## 优先级总览

| 优先级 | 主题 | 影响 | 推荐处理 |
| --- | --- | --- | --- |
| P0 | Matter collision listener 清理 | 场景重启后可能重复执行碰撞逻辑 | 已完成 |
| P0 | Player/Boss 状态 timer 生命周期 | 受击、死亡、切状态后可能被旧 callback 污染 | 已完成 |
| P1 | 游戏主流程 Playwright smoke test | 自动化覆盖进入游戏后的核心路径 | 已完成 |
| P1 | dependency audit 风险 | dev tooling 漏洞链路 | 已清零 |
| P2 | 依赖分类和包体治理 | 避免运行时安装不必要工具 | 已完成 |
| P2 | SaveManager 和 DOM HUD 防御性 | 提高浏览器异常环境和 HTML 改动下的稳定性 | 已完成 |
| P3 | 文档治理 | 避免 roadmap 与真实代码再次脱节 | 已完成 |

## Ticket 1：清理 GameScene Matter 碰撞监听

### 问题

`src/scenes/GameScene.ts` 在 `create()` 中通过 `this.matter.world.on('collisionstart', ...)` 注册匿名回调，但 `cleanup()` 只移除了 scene events 和 keyboard listener，没有移除 Matter world listener。

场景 restart、切关、GameOver 后重进游戏时，如果 listener 没有被正确移除，可能导致同一次碰撞触发多次逻辑，例如：

- 玩家被同一颗子弹多次扣血。
- player wave 对敌人或 Boss 重复造成伤害。
- 投射物 `hit()` 被重复调用。
- VFX、音效、分数事件重复触发。

### 修改方案

1. 把 collision handler 提取成类字段。
2. 在 `create()` 中用具名函数注册。
3. 在 `cleanup()` 中显式 `off`。
4. 保持现有碰撞判定逻辑不做大改，避免扩大变更范围。

推荐结构：

```ts
private readonly onCollisionStart = (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
  // current collision handling
};

// create
this.matter.world.on('collisionstart', this.onCollisionStart);

// cleanup
this.matter.world.off('collisionstart', this.onCollisionStart);
```

### 涉及文件

- `src/scenes/GameScene.ts`

### 验收标准

- `npm run typecheck` 通过。
- `npm test` 通过。
- `npm run build` 通过。
- 手动反复进入游戏、死亡、重开、切关后，碰撞伤害和投射物命中不会成倍触发。

## Ticket 2：统一 Player 和 Boss 状态 timer 生命周期

### 问题

`StateMachine` 已经支持 `addTimer()` 并在切状态时 `clearTimers()`。`Enemy` 和部分 Boss 状态已经使用该机制，但 `Player` 中仍有多个裸 `scene.time.delayedCall`：

- dash recovery。
- combo recovery。
- wave recovery。
- hurt stun recovery。
- invulnerability recovery。

这些 callback 如果在玩家受击、死亡、切状态、暂停或场景重启附近触发，可能把状态切回旧流程，造成偶发手感和状态错误。

Boss 也存在死亡和受击 delayed callback 没有统一管理的问题，尤其是 rush、attack、death tween 等流程较长。

### 修改方案

1. Player 状态内创建的 delayed timer 统一走 `stateMachine.addTimer()`。
2. timer callback 内检查当前状态名、`health > 0`、`active` 和 scene 状态。
3. Boss 的状态流程继续使用 `stateMachine.addTimer()`，死亡或 destroy 时清理未完成 timer。
4. 对死亡流程保持单向状态，避免旧 attack/rush callback 在死亡后继续触发事件。
5. 不在本 ticket 中重写状态机架构，只补齐生命周期一致性。

### 涉及文件

- `src/entities/Player.ts`
- `src/entities/Boss.ts`
- `src/utils/StateMachine.ts`，仅在需要增加 `destroy()`/`reset()` 辅助方法时修改

### 验收标准

- 玩家受击时不会被旧 combo/wave recovery timer 切回错误状态。
- 玩家死亡后不会再次恢复到 idle/fall。
- Boss 死亡后不会继续触发 rush/attack 伤害事件。
- 快速暂停、恢复、死亡、重开不会出现 console error。
- `npm run typecheck`、`npm test`、`npm run build` 通过。

## Ticket 3：补齐进入游戏后的 Playwright smoke test

### 问题

当前 `tests/e2e/visual.spec.ts` 只覆盖主菜单截图。它能发现首屏视觉问题，但覆盖不到更高风险的主流程：

- 按 Space 进入游戏。
- HUD 初始化。
- 玩家移动、跳跃、攻击。
- 暂停和恢复。
- 运行时 console error。

### 修改方案

1. 新增一个非截图 smoke test，先降低 flaky 风险。
2. 捕获 `page.on('console')` 和 `page.on('pageerror')`，失败时输出错误。
3. 从主菜单按 Space 进入游戏。
4. 等待 canvas 和 HUD 显示。
5. 模拟 `A`/`D`、`Space`、`J`、`L`、`K`、`Escape` 等关键输入。
6. 断言没有未处理异常，canvas 仍存在，HUD health/score/sector 元素正常。

### 涉及文件

- `tests/e2e/gameplay-smoke.spec.ts`
- `playwright.config.ts`，如果需要增加 reporter 或 timeout
- `.github/workflows/ci.yml`，如果要把 smoke test 加入 CI

### 验收标准

- `npm run test:visual` 能通过 smoke test。
- smoke test 不依赖精确像素截图。
- 本地和 CI 都能稳定运行。
- 进入游戏后的 console error 会导致测试失败。

## Ticket 4：处理 dependency audit 风险

### 问题

`npm audit --audit-level=moderate` 当前报告 11 个漏洞，核心来源是资源打包工具链中的旧依赖。

这些依赖可能不进入最终浏览器 bundle，但仍存在以下问题：

- CI 和开发机安装存在供应链风险。
- 新 contributor 会直接安装漏洞依赖。
- 安全扫描会持续报红，影响发布质量信号。
- `No fix available` 表示不能只靠 `npm audit fix` 解决。

### 修改方案

1. 确认 `free-tex-packer-core` 是否仍是当前资源管线必需项。
2. 如果不是必需，移除依赖和对应脚本。
3. 如果仍需要，评估替代工具，例如维护活跃的 atlas packer 或自写最小脚本。
4. 尝试 `npm audit fix` 处理可自动修复的 `url-regex` 链路，但不要使用 force 升级。
5. 对无法立即替换的 dev-only 风险，在文档中记录范围和替代计划。

### 涉及文件

- `package.json`
- `package-lock.json`
- `scripts/pack_assets.js`
- `scripts/check-images.js`
- `scripts/process-sprite.js`

### 验收标准

- `npm audit --audit-level=moderate` 报告明显收敛，理想目标为 0。
- 如果无法清零，剩余项必须有明确 dev-only 风险说明和替换计划。
- `npm run build:sprites` 如果保留，必须继续可用。
- `npm run typecheck`、`npm test`、`npm run build` 通过。

## Ticket 5：清理 package.json 依赖分类

### 问题

`package.json` 中 `puppeteer` 位于 `dependencies`，但当前游戏运行时代码没有看到使用它。若它只是脚本或测试工具，应归类到 `devDependencies`。

错误依赖分类会导致：

- 生产部署安装更多不必要包。
- lockfile 更重。
- 审计范围更嘈杂。
- 新环境安装时间增加。

### 修改方案

1. 搜索 `puppeteer` 是否被脚本实际使用。
2. 如果未使用，移除。
3. 如果仅用于脚本，移动到 `devDependencies`。
4. 审查其他依赖是否也只用于开发脚本。

### 涉及文件

- `package.json`
- `package-lock.json`
- `scripts/**`

### 验收标准

- 运行时 `dependencies` 只保留浏览器运行或生产构建真正需要的包。
- `npm ci` 后所有脚本仍能运行。
- `npm run typecheck`、`npm test`、`npm run build` 通过。

## Ticket 6：加强 SaveManager 和 DOM HUD 防御性

### 问题

`SaveManager.load()` 直接访问 `localStorage.getItem()`，但访问本身不在 try/catch 内。某些浏览器隐私模式、嵌入环境或异常 storage 状态可能抛错。

`HUDScene` 使用大量非空断言读取 DOM 元素。如果 `index.html` 中 id 被改名或 UI 片段缺失，HUD 初始化会直接崩溃，错误信息也不够集中。

### 修改方案

1. `SaveManager.load()` 将 `localStorage.getItem()`、`atob()`、`JSON.parse()` 统一包进 try/catch。
2. 对 save data 做最小类型校验，例如 number 字段必须是有限数值，level 至少为 1。
3. 保留旧存档 merge defaults 行为。
4. HUD DOM 获取增加小型 helper：缺失时抛出包含 id 的明确错误，或降级成 no-op。
5. 不引入复杂状态管理库。

### 涉及文件

- `src/managers/SaveManager.ts`
- `src/managers/SaveManager.test.ts`
- `src/scenes/HUDScene.ts`

### 验收标准

- 损坏存档回落到默认值。
- localStorage 不可用时游戏不崩溃。
- DOM id 缺失时错误信息能指出具体缺失元素。
- 新增或更新 SaveManager 单测。

## Ticket 7：CI 增加主流程 smoke test

### 问题

CI 当前只运行：

- typecheck。
- unit tests。
- production build。

Playwright 测试没有进入 CI，因此浏览器运行时问题不能被 PR 自动发现。

### 修改方案

1. 在 Ticket 3 smoke test 稳定后，把它加入 CI。
2. 先只跑非截图 smoke test，避免视觉 diff flaky 阻塞开发。
3. 截图视觉测试可以保留本地运行，后续再考虑单独 workflow。
4. CI 中保留 Playwright trace on retry，方便定位失败。

### 涉及文件

- `.github/workflows/ci.yml`
- `playwright.config.ts`
- `tests/e2e/**`

### 验收标准

- PR 上能自动发现进入游戏后的 runtime error。
- CI 总耗时仍可接受。
- 失败时有 trace 或 report 可定位。

## Ticket 8：文档治理和状态同步

### 问题

旧版优化计划包含大量已经完成或与当前代码不一致的信息，例如旧依赖版本、旧测试数量、已完成的 manifest 和工具链升级任务。这样的文档会误导后续优先级判断。

### 修改方案

1. 本文档作为当前优化计划的唯一入口。
2. 完成一个 ticket 后，同步更新对应状态和验收结果。
3. 历史设计细节如果仍有价值，移动到单独的 archive 文档，而不是混在当前 roadmap 中。
4. 文档中不要写“已完成”但代码未验证的内容。

### 涉及文件

- `docs/NINJAMAN_IMPROVEMENT_PLAN.md`
- 可选：`docs/archive/**`

### 验收标准

- 文档中的版本、测试数量、命令结果与当前项目一致。
- 每个未完成项都有明确影响、涉及文件和验收标准。
- 新 contributor 能按文档直接拆 ticket 开工。

## 推荐执行顺序

1. [x] Ticket 1：清理 GameScene Matter 碰撞监听。
2. [x] Ticket 2：统一 Player 和 Boss 状态 timer 生命周期。
3. [x] Ticket 3：补齐进入游戏后的 Playwright smoke test。
4. [x] Ticket 4：处理 dependency audit 风险。
5. [x] Ticket 5：清理 package.json 依赖分类。
6. [x] Ticket 6：加强 SaveManager 和 DOM HUD 防御性。
7. [x] Ticket 7：CI 增加主流程 smoke test。
8. [x] Ticket 8：文档治理和状态同步。

## 最终验收清单

工程稳定性：

- 场景 restart、死亡重开、切关后没有重复碰撞事件。
- 玩家和 Boss 不会被旧 timer 切回错误状态。
- 暂停、恢复、GameOver、Victory、Restart 都没有 console error。

自动化：

- `npm run typecheck` 通过。
- `npm test` 通过。
- `npm run build` 通过。
- `npm run test:visual` 至少包含一个进入游戏后的 smoke test。
- CI 覆盖 typecheck、unit、build 和 gameplay smoke test。

依赖与安全：

- runtime dependencies 只包含生产运行需要的包。
- dev tooling 漏洞链路被移除、替换或明确隔离。
- `npm audit --audit-level=moderate` 清零。

文档：

- 本文档反映当前代码状态。
- 每个完成项都附带验证命令或验收说明。
- 旧方案不再作为当前 roadmap 使用。
