# Ninjaman 改造方案文档

日期：2026-05-20

## 目标

这个文档把当前 review 结论转成可执行的修改方案。目标不是只让项目“能跑”，而是让它符合现代 Phaser + TypeScript + Vite 游戏项目的工程习惯，并显著改善画质、动作表现和可维护性。

当前项目已经具备一个可运行的基础：`npm run typecheck`、`npm test`、`npm run build` 均通过，浏览器进入游戏时没有 console error。主要问题集中在三类：

1. 画面比例和缩放链路不正确，实际显示会变形。
2. 资源管线过于简陋，所谓 HD 实际是低复杂度 SVG 静态图。
3. 游戏对象生命周期和状态 timer 存在可见 bug 风险。

## Context7 对照依据

本次 review 使用 Context7 查询了 Phaser 4 和 Vite 8 文档。

Phaser 相关结论：

- `this.load.svg` 会把 SVG 渲染成 bitmap texture 并存入 Texture Manager，不是运行时无限矢量缩放。
- `this.load.svg` 支持 `svgConfig.width`、`svgConfig.height`、`svgConfig.scale`，可以控制 rasterize 尺寸。
- Phaser 支持 texture atlas、spritesheet 和 AnimationManager，适合把角色动作做成真实帧动画，而不是频繁 `setTexture` 切静态图。
- Scene 的 `preload`、`create`、`update` 生命周期和 `Game.destroy` 行为需要配合事件与 timer 清理，避免场景重启后旧回调污染新状态。

Vite 相关结论：

- `vite build` 是生产构建入口，默认以 `index.html` 为入口输出静态资源。
- 部署到子路径时应通过 `base` 配置处理资源路径。
- TypeScript 配置中 `moduleResolution: "bundler"`、`isolatedModules`、`strict` 等设置符合现代 Vite 项目方向。

参考：

- https://docs.phaser.io/api-documentation/4.0.0-rc.6/class/loader-loaderplugin
- https://docs.phaser.io/api-documentation/4.0.0-rc.6/class/textures-texturemanager
- https://github.com/vitejs/vite/blob/v8.0.10/docs/guide/build.md

## 当前证据快照

已验证命令：

```bash
npm run typecheck
npm test
npm run build
```

结果：

- TypeScript 检查通过。
- Vitest 3 个测试文件、12 个测试通过。
- Vite 8.0.10 构建通过。
- 浏览器 headless 检查无 Vite overlay、无 console error。

浏览器实测问题：

- canvas 内部分辨率：`1280 x 720`。
- 实际 CSS 显示尺寸约：`1220 x 558`。
- 内部比例是 `1.7777`，实际显示比例约 `2.1864`。
- 结果是游戏画面被横向拉伸，角色、建筑、UI 都会显得扁和粗糙。

依赖状态：

```text
phaser      4.1.0
vite        8.0.10, latest patch 8.0.13
typescript 5.9.3, latest 6.0.3
vitest      3.2.4, latest 4.1.7
```

Phaser 当前未显示过期。升级工具链有价值，但不应优先于画面比例和资源管线。

## 优先级总览

| 优先级 | 主题 | 影响 | 推荐处理 |
| --- | --- | --- | --- |
| P0 | canvas 比例修复 | 直接影响所有画面观感 | 立刻修 |
| P0 | 资源与截图基线 | 防止后续改动无验收标准 | 立刻建 |
| P1 | 美术资源管线 | 决定画质上限 | 分阶段替换 |
| P1 | 动作动画系统 | 决定角色手感和高级感 | 分阶段替换 |
| P1 | Projectile/timer bug | 会导致随机消失、状态错乱 | 尽快修 |
| P2 | 场景和实体生命周期 | 长局游戏稳定性 | 和 P1 一起修 |
| P2 | 测试与视觉回归 | 防止重复退化 | 建自动化 |
| P3 | 依赖升级 | 工具链健康 | 在主风险修复后做 |

## 阶段 0：建立可验收基线

### 目标

先把“画面好不好”和“有没有回归”变成可测量的事情。否则后续美术升级很容易只凭主观判断。

### 具体改动

1. 新增视觉检查脚本。
   - 推荐引入 Playwright 或等价浏览器自动化。
   - 覆盖菜单页、进入游戏后的首屏、移动和攻击后的截图。
   - 输出截图到 ignored 目录，例如 `test-results/visual/`。

2. 新增 canvas 比例断言。
   - 检查 canvas attribute ratio 和 CSS layout ratio 的差值。
   - 差值建议小于 `0.01`。

3. 新增性能基线。
   - 记录首屏加载时间、进入游戏后的 `actualFps`。
   - 对低端机器不做硬性 60 FPS，但桌面 Chrome 下首屏应该稳定接近 60 FPS。

### 涉及文件

- `package.json`
- 新增 `tests/e2e` 或 `scripts/visual-check.*`
- `.gitignore`

### 验收标准

- 一条命令可以打开本地服务并截取菜单和游戏截图。
- 自动断言 canvas 没有变形。
- 视觉检查输出可被 CI 或本地 review 使用。

## 阶段 1：修复 canvas 缩放和页面容器

### 问题

`index.html` 中 `#game-container canvas` 强制：

```css
width: 100% !important;
height: 100% !important;
```

这会覆盖 Phaser Scale Manager 的布局结果。当前 `body` 是 flex 布局，footer、padding、gap 会压缩容器高度，容器宽度没有同步缩小，最终 16:9 被破坏。

### 修改方案

1. 移除 canvas 强制宽高。
2. 让外层容器通过 `min()` 同时受视口宽度和视口高度限制。
3. 保留 `aspect-ratio: 16 / 9`，并设置 `flex: 0 0 auto` 防止 flex 压缩破坏比例。
4. footer 不应挤压游戏容器比例。小高度屏幕下优先隐藏 footer。

推荐 CSS 方向：

```css
#game-container {
  width: min(100vw - 32px, 1280px, calc((100vh - 96px) * 16 / 9));
  aspect-ratio: 16 / 9;
  flex: 0 0 auto;
}

#game-container canvas {
  display: block;
}
```

如果要保留 footer，`96px` 需要根据实际 footer 高度、padding、gap 计算。更稳妥的方案是游戏容器独占 viewport，控制说明放进游戏 HUD 或可折叠 overlay。

### 涉及文件

- `index.html`
- `src/config.ts`

### 验收标准

- 在 `1280x720`、`1366x768`、`1920x1080`、移动竖屏下，canvas 显示比例保持 16:9。
- 浏览器实测 canvas CSS ratio 与 attribute ratio 差值小于 `0.01`。
- 菜单和游戏内截图不再横向拉伸。

## 阶段 2：资源加载从散落写法改成 manifest

### 问题

当前 `BootScene.preload` 手写几十行：

```ts
this.load.svg('player_idle', 'assets/sprites/player_idle.svg');
this.load.svg('player_run', 'assets/sprites/player_run.svg');
```

这会带来几个问题：

- key、路径、资源类型没有统一登记。
- 无法声明每个 SVG 的 rasterize 尺寸。
- 后续替换 atlas、spritesheet、音效、字体时会越来越难维护。
- `public` 下资源不会走 Vite import/hash 管线，不利于缓存版本管理。

### 修改方案

1. 新增资源 manifest。

示例结构：

```ts
export const svgAssets = [
  { key: 'player_idle', url: playerIdleUrl, svgConfig: { width: 256, height: 256 } },
  { key: 'enemy_guard', url: enemyGuardUrl, svgConfig: { width: 256, height: 256 } },
] as const;
```

2. 将长期维护的资源从 `public/assets` 迁入 `src/assets`，用 `?url` import 获取 Vite 处理后的 URL。

3. `BootScene` 只负责遍历 manifest。

4. 临时生成资源可以保留，但应明确标记为 placeholder，不再宣称是最终 HD 资源。

### 涉及文件

- `src/scenes/BootScene.ts`
- 新增 `src/assets/manifest.ts`
- `scripts/generate-assets.js`
- `public/assets/**` 或新增 `src/assets/**`

### 验收标准

- `BootScene.preload` 不再维护大量硬编码路径。
- 每个 SVG 可以声明 rasterize 尺寸。
- 新增或替换资源时只改 manifest。
- 构建产物中的正式资源带 hash，placeholder 资源有明确边界。

## 阶段 3：从静态 SVG 切换到高质量 2D 资源

### 问题

当前角色、敌人、Boss 是脚本生成的简单几何 SVG。它们不是“建模”，也不具备高质量游戏美术需要的体积、材质、阴影、动作帧和风格一致性。

如果继续使用 Phaser 2D，最佳路线不是做 3D 模型，而是做高质量 2D atlas：

- 角色帧动画 atlas。
- 敌人帧动画 atlas。
- Boss 大尺寸 atlas。
- 独立 VFX atlas。
- 背景分层图。
- tileset 或 tilemap。

如果产品目标是“真实 3D 建模”，那是引擎和渲染路线变更，需要引入 Three.js/Babylon.js 或换引擎，不应当混在当前 Phaser 2D 小改里。

### 推荐美术规格

角色：

- 原画尺寸：单帧 256x256 或 512x512。
- 游戏显示尺寸：约 80 到 120 像素高。
- 动作数量：idle、run、jump、fall、dash、defend、hurt、death、combo1 到 combo4、wave cast、uppercut、dive。
- 每个动作帧数：
  - idle：6 到 8 帧。
  - run：8 到 12 帧。
  - attack：6 到 10 帧。
  - boss attack：10 到 16 帧。

背景：

- 至少 4 层 parallax：sky、far skyline、mid buildings、foreground details。
- 每个关卡一套色彩脚本，避免所有场景都只是霓虹线条。
- 前景平台要有可读边缘、接触阴影和材质变化。

VFX：

- 攻击轨迹单独成 atlas。
- 命中特效单独成 atlas。
- 不要只用平台贴图粒子代替所有粒子。

### 修改方案

1. 选定资源路线。
   - 方案 A：手绘/AI 辅助 2D sprite atlas，推荐。
   - 方案 B：Spine/DragonBones 骨骼动画，需要额外运行时、license 和技术验证。
   - 方案 C：3D 角色预渲染成 2D sprite sheet，适合保持 Phaser 架构。

2. 用 atlas 替换核心角色。
   - 第一个里程碑只替换 Player。
   - 保持碰撞体和游戏逻辑不大改。

3. 再替换敌人和 Boss。

4. 最后替换场景和 VFX。

### 涉及文件

- `public/assets/sprites/**` 或 `src/assets/sprites/**`
- `src/scenes/BootScene.ts`
- `src/entities/Player.ts`
- `src/entities/Enemy.ts`
- `src/entities/Boss.ts`
- `scripts/generate-assets.js`

### 验收标准

- 玩家 idle/run/attack 不再是单图切换。
- 角色在 1080p 显示下边缘清晰、没有拉伸。
- Boss 至少具备 windup、attack、rush、hurt、death 的独立动画。
- 关卡背景不再只由简单 SVG 几何构成。

## 阶段 4：接入 Phaser AnimationManager

### 问题

当前动作表现主要靠 `setTexture`：

- `Player.ts` 多个状态直接 `setTexture(...)`。
- `Enemy.ts` 和 `Boss.ts` 也是切静态纹理。
- 攻击判定和动画时机没有绑定，打击感不稳定。

### 修改方案

1. 在 `BootScene` 或专门的 `AnimationFactory` 中创建动画。

示例方向：

```ts
this.anims.create({
  key: 'player_run',
  frames: this.anims.generateFrameNames('player_atlas', {
    prefix: 'run_',
    start: 0,
    end: 7,
    zeroPad: 2,
  }),
  frameRate: 12,
  repeat: -1,
});
```

2. `Player` 状态机从 `setTexture` 改为 `play`。

3. 攻击命中帧用动画事件驱动。
   - windup frame：允许取消。
   - active frame：发出 `player_attack`。
   - recovery frame：恢复 idle/fall。

4. 每个动画对应碰撞体 preset。
   - 不建议每帧无控制地重设 body。
   - 可以在状态进入时设置一个稳定 hitbox。

### 涉及文件

- `src/entities/Player.ts`
- `src/entities/Enemy.ts`
- `src/entities/Boss.ts`
- 新增 `src/animations/createAnimations.ts`

### 验收标准

- 角色移动、攻击和受击有连续动画。
- 攻击命中只在 active frame 发生。
- 同一个动作在不同帧率机器上时序一致。
- 状态机逻辑比当前更少依赖裸 `delayedCall`。

## 阶段 5：修复 projectile 和状态 timer 生命周期

### Projectile 风险

`Projectile.fire` 每次发射都创建 lifetime timer：

```ts
this.scene.time.delayedCall(PROJECTILE_CONFIG.lifetime, () => {
  if (this.active) this.disableBody(true, true);
});
```

如果 projectile 被命中后很快复用，旧 timer 可能在新 projectile active 时触发，把新 projectile 提前 disable。

### Projectile 修改方案

1. 在 `Projectile` 内保存 `lifetimeTimer`。
2. 每次 `fire` 前取消旧 timer。
3. `hit` 和 `destroy` 时也取消 timer。
4. 或者使用 `shotId` generation，timer 回调只处理对应 generation。

推荐实现方向：

```ts
private lifetimeTimer: Phaser.Time.TimerEvent | null = null;

public fire(...) {
  this.lifetimeTimer?.remove(false);
  this.lifetimeTimer = this.scene.time.delayedCall(PROJECTILE_CONFIG.lifetime, () => {
    this.lifetimeTimer = null;
    if (this.active) this.disableBody(true, true);
  });
}

public hit() {
  this.lifetimeTimer?.remove(false);
  this.lifetimeTimer = null;
  this.disableBody(true, true);
}
```

### 状态 timer 风险

`Enemy`、`Boss`、`Player` 都在状态进入时创建 `delayedCall`，但状态退出时大多没有取消。典型风险：

- 敌人进入攻击 windup 后被打断，旧 windup 仍然触发攻击。
- 玩家 combo recovery timer 在玩家受击后仍然把状态切回 idle。
- Boss rush 的嵌套 timer 在死亡或切状态后继续执行。

### 状态 timer 修改方案

1. 给 `StateMachine` 增加 state-scoped cleanup 支持，或者每个实体维护 `stateTimers`。
2. 状态退出时统一取消当前状态创建的 timer。
3. timer 回调中检查当前状态名和对象 active/health。
4. 减少嵌套 `delayedCall`，把长流程拆成显式状态。

### 涉及文件

- `src/entities/Projectile.ts`
- `src/entities/Player.ts`
- `src/entities/Enemy.ts`
- `src/entities/Boss.ts`
- `src/utils/StateMachine.ts`

### 验收标准

- projectile 快速命中、复用不会被旧 timer 提前回收。
- 敌人被打断后不会继续完成旧攻击。
- Boss 死亡后不会继续触发旧 rush/attack 回调。
- 场景 restart 后没有旧对象回调影响新场景。

## 阶段 6：战斗、分数和存档规则修正

### SP 里程碑问题

当前 HUD 用：

```ts
if (diff > 0 && diff % 500 === 0) {
  SaveManager.addSP(1);
}
```

这会漏掉跨越式得分。例如从 450 到 600，已经跨过 500，但 `diff` 是 150，不会奖励。

### 修改方案

1. 用 `SCORE_CONFIG.spMilestoneInterval` 替代硬编码 `500`。
2. 记录上一次已奖励 milestone。
3. 按 score 跨越次数发奖励。

示例方向：

```ts
const previousMilestone = Math.floor(this.currentScore / SCORE_CONFIG.spMilestoneInterval);
const nextMilestone = Math.floor(score / SCORE_CONFIG.spMilestoneInterval);
const earned = Math.max(0, nextMilestone - previousMilestone);
if (earned > 0) SaveManager.addSP(earned);
```

### 存档建议

1. 给 SaveData 增加 `version` 字段。
2. `load` 时做基本类型校验，防止坏数据污染游戏。
3. 不要把 base64 当安全机制，它只是编码。文档和代码注释应避免暗示“加密”。

### 涉及文件

- `src/scenes/HUDScene.ts`
- `src/config/combat.ts`
- `src/managers/SaveManager.ts`
- `src/managers/SaveManager.test.ts`

### 验收标准

- 跨越 500、1000、1500 分时都能正确发 SP。
- 旧存档能迁移。
- 损坏存档回落到默认值。

## 阶段 7：场景视觉升级

### 当前问题

当前背景是少量 SVG 图层和平台瓦片，VFX 大多复用 `platform` texture 作为粒子源。截图中可见角色占比小、平台和背景细节不足、前中后景层次弱。

### 修改方案

1. 关卡构图。
   - 城市：增加前景管线、招牌、地面阴影、雾层、远景灯光。
   - 森林：增加数字植被层、半透明叶片、前景遮挡。
   - 核心：增加机械结构、能量脉冲、危险区域指示。

2. 光照和后处理。
   - 只对关键对象使用 glow，避免整屏统一霓虹导致层次糊掉。
   - Vignette 强度需要在移动端测试，防止 HUD 可读性下降。
   - 粒子数量按性能分档。

3. 平台和碰撞可读性。
   - 平台贴图需要明确顶边、侧边、危险边界。
   - 可站立平台和背景装饰必须视觉区分。

4. 摄像机。
   - 加入轻微 look-ahead，让玩家移动方向有更多视野。
   - Boss 战可以改成固定 arena camera，减少追随抖动。

### 涉及文件

- `src/scenes/GameScene.ts`
- `src/config/levels.ts`
- `public/assets/backgrounds/**`
- 新增 `src/config/visuals.ts`

### 验收标准

- 每个关卡截图不用 UI 也能识别场景主题。
- 可交互平台和背景元素不会混淆。
- 常规战斗场景下桌面浏览器保持稳定 60 FPS 附近。

## 阶段 8：输入与移动手感

### 当前问题

代码已有 coyote time 和 double jump，但 `jumpBufferTime` 在配置中存在却未真正使用。攻击、dash、jump 的输入时序还可以更稳定。

### 修改方案

1. 实现 jump buffer。
   - 玩家提前按 jump，在落地后的短窗口内自动跳起。

2. 规范输入抽象。
   - Keyboard 和 Gamepad 输入统一成 `InputState`。
   - 避免各状态直接读取多个键盘 API。

3. 攻击取消规则表。
   - 定义哪些状态可以取消到 dash、defend、jump 或下一段 combo。
   - 避免状态机分支散落在多个方法里。

### 涉及文件

- `src/entities/Player.ts`
- `src/config/combat.ts`
- 新增 `src/input/InputState.ts`

### 验收标准

- 起跳、连击、dash 在 30 FPS 到 60 FPS 之间手感一致。
- Gamepad 和键盘行为一致。
- 配置中的 `jumpBufferTime` 被实际使用并有测试或手动验收步骤。

## 阶段 9：工具链和依赖升级

### 推荐顺序

1. Vite patch 升级。

```bash
npm install -D vite@^8.0.13
```

2. Vitest major 升级。

```bash
npm install -D vitest@^4.1.7
```

3. TypeScript 6 升级。

```bash
npm install -D typescript@^6.0.3
```

4. 每一步单独运行：

```bash
npm run typecheck
npm test
npm run build
```

### 注意

- 不建议一次性升级全部工具链。
- Phaser 目前不是首要升级对象，除非发现 4.1.0 有明确 bug 或文档 API 不匹配。
- 如果引入 Playwright，要把浏览器缓存和截图输出目录加入 `.gitignore`。

### 验收标准

- 每次升级都有单独 commit。
- lockfile 与 package.json 一致。
- build chunk 体积无异常增长。

## 阶段 10：代码组织和可维护性

### 修改方向

1. 场景职责拆分。
   - `GameScene` 当前承担关卡生成、HUD 通信、战斗 overlap、转场、VFX、存档奖励等职责。
   - 建议拆出 `LevelBuilder`、`EncounterManager`、`VfxManager`。

2. 配置集中化。
   - 美术层配置、音效层配置、战斗层配置分离。
   - 避免 magic number 散落在场景里。

3. 事件命名。
   - 当前字符串事件如 `player_attack`、`update_health` 可以集中成常量。
   - 降低拼写错误风险。

4. 类型边界。
   - `EnemyType`、攻击类型、事件 payload 都应有明确类型。
   - `type: string` 的攻击参数应改成 union type。

### 涉及文件

- `src/scenes/GameScene.ts`
- `src/managers/CombatManager.ts`
- 新增 `src/events.ts`
- 新增 `src/levels/LevelBuilder.ts`
- 新增 `src/managers/VfxManager.ts`

### 验收标准

- `GameScene` 行数和职责明显下降。
- 战斗事件 payload 有类型约束。
- 新增敌人或关卡不需要改动多个无关模块。

## 推荐任务拆分

### Ticket 1：修复 canvas 比例

范围：

- 修改 `index.html` 的容器和 canvas CSS。
- 增加本地验证脚本或至少记录验证步骤。

验收：

- `1280x720` 和 `1366x768` 下 canvas 不变形。
- `npm run build` 通过。

### Ticket 2：修复 projectile lifetime timer

范围：

- 修改 `Projectile.ts`。
- 增加测试或可重复手动验证场景。

验收：

- projectile 快速复用不会被旧 timer 回收。

### Ticket 3：SP 里程碑修正

范围：

- 修改 `HUDScene.ts`。
- 使用 `SCORE_CONFIG.spMilestoneInterval`。
- 增加对应测试。

验收：

- 从 450 到 600 会奖励 1 SP。
- 从 450 到 1100 会奖励 2 SP。

### Ticket 4：资源 manifest

范围：

- 新增 manifest。
- `BootScene` 改为遍历加载。
- 为 SVG 设置明确 rasterize 尺寸。

验收：

- 加载行为不变。
- 资源 key 和路径集中维护。

### Ticket 5：玩家 atlas 动画

范围：

- 先只替换 Player。
- 接入 `this.anims.create`。
- 状态机使用 `play`。

验收：

- idle/run/combo 至少有真实帧动画。
- 攻击命中时机跟动画帧一致。

### Ticket 6：敌人和 Boss 动画

范围：

- 替换 Enemy 和 Boss 静态纹理。
- 为 Boss 增加 hurt/death 动画。

验收：

- Boss 战 telegraph 清晰。
- 敌人类型在剪影和动作上可区分。

### Ticket 7：场景美术第一轮

范围：

- 替换城市关卡背景。
- 增加前景/中景/远景层。
- 增加平台贴图。

验收：

- 城市场景截图明显优于当前 SVG 方块楼。
- 平台可读性不下降。

### Ticket 8：视觉回归和工具链升级

范围：

- 加 Playwright 或同类视觉检查。
- Vite patch 升级。
- 评估 Vitest 和 TypeScript major 升级。

验收：

- CI 或本地一条命令完成构建、单测、视觉 smoke test。

## 风险与取舍

### 不建议马上做 3D 化

当前项目是 Phaser 2D action-platformer。把角色改成真正 3D 模型不是资源替换，而是渲染架构变化。除非产品目标明确变成 3D，否则更现实的路线是高质量 2D atlas 或 3D 预渲染成 2D sprite sheet。

### 不建议继续扩大 SVG 生成脚本

`scripts/generate-assets.js` 适合 placeholder，不适合长期生产美术。继续在这里堆细节会让资产不可由美术工具维护，也很难做动画和风格一致性。

### 不建议先大规模重构

最先修的是用户可见问题：比例、静态图、动作僵硬。架构拆分应服务于这些目标，而不是先把所有文件重新组织一遍。

### 依赖升级要分步

TypeScript 6 和 Vitest 4 都是 major 变化，可能暴露新的类型或测试 API 问题。应该单独升级、单独验证、单独提交。

## 最终验收清单

功能：

- 菜单进入游戏正常。
- 玩家移动、跳跃、dash、攻击、wave、defend 正常。
- 敌人攻击、投射物、Boss 战正常。
- 存档升级和 SP 奖励正常。

画面：

- 所有常见视口下 canvas 不变形。
- 玩家至少 idle/run/attack 有连续帧动画。
- 关卡背景有明确层次和主题。
- 平台、敌人、投射物可读性清晰。

工程：

- `npm run typecheck` 通过。
- `npm test` 通过。
- `npm run build` 通过。
- 视觉 smoke test 通过。
- 资源加载集中在 manifest。
- 状态 timer 不会跨状态污染。

性能：

- 桌面 Chrome 游戏首屏稳定接近 60 FPS。
- 粒子和 glow 不造成明显掉帧。
- 构建 chunk 体积可接受，Phaser 单独 chunk 保持合理。

## 推荐执行顺序

1. 修复 canvas 比例。
2. 修复 projectile 和状态 timer 高风险 bug。
3. 修正 SP 里程碑和存档校验。
4. 建资源 manifest。
5. 替换 Player atlas 和 AnimationManager。
6. 替换 Enemy/Boss atlas。
7. 升级场景背景、平台、VFX。
8. 建视觉回归。
9. 分步升级 Vite、Vitest、TypeScript。
10. 拆分 `GameScene` 和事件类型。

这个顺序的原则是先修肉眼可见的错误，再修会产生随机 bug 的生命周期问题，最后做系统性资源升级和架构整理。
