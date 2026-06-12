# Ninjaman 工程状态与维护计划

日期：2026-06-12
版本：3.9.0

## 当前状态

本项目使用 Phaser 4、TypeScript、Vite、Vitest、Playwright 和 Matter.js。当前重点维护方向是：资源管线可维护性、平台可达性、场景生命周期稳定性、缓存一致性、测试可靠性和目录清洁度。

本轮修复对照了公开文档：

- Phaser Input 文档：键盘、手柄和 pointer/touch 都应通过统一 input plugin/action 语义消费。
- Playwright Web Server 文档：测试应使用 `webServer.url` + `use.baseURL`，测试内使用相对路径。
- Vite Build Options 文档：Vite 8 默认支持 OXC minify，`build.target` 和相对 `base` 行为需要明确配置。

## 已完成修复

- 统一键盘/手柄 action 语义：键盘 `Space/J/K/L`，手柄 `A/X/B/Y` 分别对应 jump/attack/defend/wave。
- 手柄按钮改为 edge detection，避免长按每帧重复触发攻击、跳跃或波动。
- Dash 双击检测每帧只计算一次，避免单击 A/D 被误判为 dash。
- 输入缓冲时间改为 `PLAYER_MOVEMENT.actionBufferTime`，移除硬编码 150ms。
- 敌人 chase、Boss enraged/rush 速度倍率配置化。
- Matter gravity 配置改为真实使用的 `MATTER_GRAVITY_Y`。
- `GameScene.create()` 显式恢复 Matter world，避免胜利后重开物理停住。
- collision start 也更新玩家 ground contact，减少落地首帧延迟。
- `StateMachine.setState()` 先校验目标 state，避免跳转错误状态时退出当前 state。
- Save data 移除已废弃升级字段，并限制 `unlockedLevel` 上限。
- `SeededRandom` 对空数组和无效整数范围抛出明确错误。
- Playwright 转场测试改用 `baseURL`，删除默认运行的 debug test，增加实际断言。
- e2e 构建使用 Vite `--mode test`，只在 dev/test 模式暴露 `window.game` 测试钩子。
- HUD sound toggle 移除 inline `onclick`，改为 add/remove event listener。
- README、主菜单版本号、package 版本、package-lock 版本和 asset cache 版本同步到 `3.9.0`。
- 新增 Godot 4.6.3 重构原型：非 Vite 旧素材、夜间森林关卡、Godot Web export preset、本地 `npm run build:godot:web` 和可切换 `vercel.godot.json`。
- Godot 原型角色统一切换到 CC0 `dungeonSprites_` 24x24 pixel fantasy set（玩家 `mHero_`、guard `goblin_`、axe `orc_`、ninja `skeleton_`、Boss `dragon_`），早期 Foxy/Kenney/Bevouliin 方案已退役；Web export 排除旧资源，署名记录在 `godot/assets/CREDITS.md`。
- Godot 战斗原型升级：玩家加速/土狼时间/跳跃缓冲/Dash 残影、敌人与 Boss 状态机、hit stop、命中特效、镜头震动、checkpoint 与暂停。
- 资源/音频脚本移除本机绝对路径和未转义 shell 字符串拼接。
- 玩家动画注册改为 `src/animations/characterAnimationManifest.ts` 数据驱动，避免帧范围散落硬编码。
- 玩家 spritesheet 改为 `scripts/generate_player_hero.js` 通过 Playwright/Chromium 渲染 SVG 生成。
- 敌人/Boss spritesheet 使用 `scripts/generate_realistic_enemies.js` 的 SVG 渲染管线。
- 平台高度按当前双跳能力约束生成，e2e 校验平台存在、可达和资源版本请求。
- 删除旧 SWF、调试截图、未加载 packed atlases、旧 knight/player placeholder 资源和废弃导入/处理脚本。

## 约定

### Controls

- Keyboard: `A/D` move, `W/S` directional modifiers, `Space` jump, `J` attack, `K` defend, `L` wave, double-tap `A/D` dash.
- Gamepad: left stick or D-pad move/modifier, `A` jump, `X` attack, `B` defend, `Y` wave.

### Movement Tuning

- Player movement lives in `src/config/combat.ts`.
- Enemy and Boss movement lives in `src/config/enemies.ts`.
- Multipliers should be named config values, not inline magic numbers in entity logic.

### Asset Pipeline

- Runtime asset loading lives in `src/assets/manifest.ts`.
- `ASSET_VERSION` must match the app release version whenever cached public assets change.
- Player animation ranges live in `src/animations/characterAnimationManifest.ts`.
- Regenerate the player sheet with `npm run build:player-art`.
- Regenerate backgrounds, player, enemies, and boss with `npm run build:art`.
- Keep generated assets checked in only when the current manifest or generation scripts use them.

## 验证清单

每次改动后至少运行：

```bash
npm run typecheck
npm test
npm run build
npm run test:visual
npm run build:godot:web
```

## 后续建议

- 如果明确支持手机浏览器，需要增加虚拟摇杆和触屏按钮；否则 README 应继续明确当前是 keyboard/gamepad 操作。
- 可以继续减少 Phaser 内部 API 的 `as any` 使用，但涉及 Phaser 4 新 API 类型缺口时应先补本地类型声明。
- 当前 SVG 生成美术仍是 placeholder；如果后续接入 Aseprite atlas 或 Spine，应保留 animation manifest / animator 层作为切换点。
