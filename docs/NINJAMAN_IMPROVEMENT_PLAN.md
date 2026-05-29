# Ninjaman 工程状态与维护计划

日期：2026-05-29
版本：3.6.0

## 当前状态

本项目使用 Phaser 4、TypeScript、Vite、Vitest 和 Playwright。当前重点维护方向是：输入一致性、敌我速度配置、场景生命周期、测试可靠性、脚本文档一致性。

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
- README、HUD footer、主菜单版本号、package 版本同步到真实操作和 `3.6.0`。
- 资源/音频脚本移除本机绝对路径和未转义 shell 字符串拼接。

## 约定

### Controls

- Keyboard: `A/D` move, `W/S` directional modifiers, `Space` jump, `J` attack, `K` defend, `L` wave, double-tap `A/D` dash.
- Gamepad: left stick or D-pad move/modifier, `A` jump, `X` attack, `B` defend, `Y` wave.

### Movement Tuning

- Player movement lives in `src/config/combat.ts`.
- Enemy and Boss movement lives in `src/config/enemies.ts`.
- Multipliers should be named config values, not inline magic numbers in entity logic.

## 验证清单

每次改动后至少运行：

```bash
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
npm run test:visual
```

## 后续建议

- 如果明确支持手机浏览器，需要增加虚拟摇杆和触屏按钮；否则 README 应继续明确当前是 keyboard/gamepad 操作。
- 可以继续减少 Phaser 内部 API 的 `as any` 使用，但涉及 Phaser 4 新 API 类型缺口时应先补本地类型声明。
- 如果确认未使用 `player_hero` 或 normal map 资产，应删除对应 manifest 项以降低加载体积。
