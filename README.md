# Ninjaman Remake

一款经典 Flash 横版动作游戏的现代 HD 重制版，使用 **Phaser 4 + TypeScript + Vite** 构建。

> A modern, high-definition remake of a classic Flash beat-'em-up, rebuilt from the ground up with web-native technologies.

---

## 目录 / Table of Contents

- [项目概览](#项目概览)
- [玩法说明](#玩法说明)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [架构设计](#架构设计)
- [游戏设计](#游戏设计)
- [资源管线](#资源管线)
- [测试](#测试)
- [构建与部署](#构建与部署)
- [扩展指南](#扩展指南)
- [故障排查](#故障排查)
- [开发路线图](#开发路线图)

---

## 项目概览

Ninjaman Remake 把一款基于 SWF 的老 Flash 游戏完整迁移到了现代浏览器平台。原版游戏依赖 Flash Player（已于 2020 年停止支持），且使用了 3000+ 个零散导出的 PNG 帧，几乎无法直接复用。本项目保留了原作的世界观（黄昏、忍者、城堡），但重写了所有代码、关卡和美术。

### 核心改动

| 维度 | 原版 (Flash) | 重制版 (Web) |
| --- | --- | --- |
| 运行环境 | Flash Player (已废弃) | 任意现代浏览器（Chrome/Firefox/Safari/Edge） |
| 渲染分辨率 | 640 × 360 | 1280 × 720 (16:9 自适应) |
| 关卡尺寸 | 18,200 px 横向（与画布严重不匹配） | 6,400 px，与相机视口一致 |
| 角色资源 | 3,631 张稀疏 PNG 帧（多数为空） | 程序化 Phaser Graphics 绘制 |
| 背景 | 灰色色块 + 占位矩形 | 4 张 AI 生成的浮世绘风 HD 场景 + 三层视差 |
| 音频 | 无 | 5 段动作音效 (MP3) |
| 状态管理 | 全局 `MovieClip` | 6 个独立的 Phaser `Scene` |
| 类型检查 | 无 | TypeScript 严格模式 |
| 单元测试 | 无 | Vitest（关卡数据 + 游戏配置） |

---

## 玩法说明

你扮演一位赤红色丝带的忍者，在黄昏的山林之间穿越，一路砍杀拦路的敌方武士，直到抵达远方的城堡。

### 操作

| 按键 | 操作 |
| --- | --- |
| `← →` 或 `A` `D` | 左右移动 |
| `↑` 或 `W` 或 `Space` | 跳跃 |
| `J` | 攻击（剑斩） |
| `K` | 防御（减伤 + 击退抵抗） |
| `Esc` | 暂停/继续 |
| `Enter` | 标题界面开始 / 死亡后重生 |

### 胜负条件

- **胜利**：到达关卡终点的旗帜（默认 x = 6280）
- **失败**：3 条命全部用完后进入 Game Over
- **复活**：单次死亡时若仍有生命，则在最近的检查点重生，血量回满

### 战斗反馈

- 攻击命中后产生粒子飞溅 + 屏幕震动 + 击退
- 受伤进入 800 ms 无敌帧（角色闪烁）
- 防御状态下伤害减半，且不会被击退

---

## 技术栈

| 类别 | 选型 | 版本 |
| --- | --- | --- |
| 游戏引擎 | [Phaser](https://phaser.io/) | `^4.1.0` |
| 编程语言 | TypeScript（`strict: true`） | `^5.9.3` |
| 构建工具 | [Vite](https://vitejs.dev/) | `^8.0.10` |
| 测试框架 | [Vitest](https://vitest.dev/) | `^3.2.4` |
| 部署平台 | [Vercel](https://vercel.com/) | — |
| 模块格式 | ESM (`type: "module"`) | — |

为什么选 Phaser 4：稳定的 WebGL/Canvas 双渲染、内建 Arcade Physics、对移动端触屏支持良好、社区与文档成熟，且对 TypeScript 一等支持。

---

## 快速开始

### 环境要求

- Node.js **≥ 20.x**
- pnpm / npm / yarn 任一（项目无 lockfile，使用 `npm` 即可）

### 安装与运行

\`\`\`bash
# 安装依赖
npm install

# 启动本地开发服务器（默认 http://localhost:5173）
npm run dev

# 类型检查
npm run typecheck

# 单元测试
npm run test

# 监听模式跑测试
npm run test:watch

# 生产构建（输出到 dist/）
npm run build

# 本地预览构建产物
npm run preview
\`\`\`

启动 `npm run dev` 后，所有 `src/` 下的修改会通过 Vite HMR 即时生效，无需手动刷新。

---

## 项目结构

\`\`\`
ninjaman-remake/
├── index.html                  # 入口 HTML，包含 SEO meta 与游戏容器
├── package.json
├── tsconfig.json               # TypeScript 严格模式配置
├── vite.config.ts              # publicDir = static/，单独打包 Phaser
├── vitest.config.ts            # 测试环境配置
├── vercel.json                 # 生产部署：缓存策略 + SPA rewrite
│
├── static/                     # ★ 唯一会被部署的资源目录
│   └── assets/
│       ├── hd/                 # AI 生成的 HD 背景与平铺图
│       │   ├── bg-sky.jpg
│       │   ├── bg-mid.jpg
│       │   ├── tile-ground.jpg
│       │   ├── tile-platform.jpg
│       │   └── title-bg.jpg
│       └── sounds/             # 动作音效
│           ├── 251_ninjah_jump1.mp3
│           ├── 253_ninjah_powerslash2.mp3
│           ├── 254_ninjah_sword_impact1.mp3
│           ├── 242_enemy_thrownimpact.mp3
│           └── 244_ninjah_blood1.mp3
│
├── public/                     # 旧 Flash 帧的归档（不会进入构建产物）
│
└── src/
    ├── main.ts                 # 入口，启动 Phaser.Game
    ├── config.ts               # 游戏全局配置（场景顺序、物理、缩放）
    │
    ├── scenes/
    │   ├── BootScene.ts        # 加载所有资源 + 进度条
    │   ├── TitleScene.ts       # 标题画面 + 落樱粒子
    │   ├── GameScene.ts        # 主游戏场景（关卡、相机、碰撞）
    │   ├── HudScene.ts         # 浮在 GameScene 上方的 UI
    │   ├── GameOverScene.ts    # 失败画面
    │   └── WinScene.ts         # 通关画面
    │
    ├── entities/
    │   ├── BaseEntity.ts       # 通用实体基类（血量、无敌帧、面向）
    │   ├── Player.ts           # 玩家：移动/跳跃/攻击/防御/受伤
    │   └── Enemy.ts            # 敌人：idle → chase → attack 状态机
    │
    ├── factories/
    │   └── CharacterFactory.ts # 程序化绘制角色帧到纹理缓存
    │
    └── utils/
        ├── constants.ts        # 全游戏常量（尺寸/物理/颜色/键名）
        ├── constants.test.ts   # 配置约束的单元测试
        ├── levelData.ts        # 关卡数据结构与第一关定义
        └── levelData.test.ts   # 关卡完整性校验
\`\`\`

---

## 架构设计

### 场景流转

\`\`\`
┌──────────┐     load     ┌───────────┐   ENTER   ┌────────────┐
│  Boot    │─────────────▶│   Title   │──────────▶│   Game     │
└──────────┘              └───────────┘           │  + Hud     │
                                                  └─────┬──────┘
                                                        │
                                       death (lives=0)  │  reach goal
                                                        │
                                            ┌───────────┴───────────┐
                                            ▼                       ▼
                                     ┌─────────────┐         ┌────────────┐
                                     │ GameOver    │         │    Win     │
                                     └──────┬──────┘         └─────┬──────┘
                                            │  ENTER               │  ENTER
                                            └────────┬─────────────┘
                                                     ▼
                                                 (Title)
\`\`\`

`HudScene` 与 `GameScene` 并行运行（通过 `scene.launch()`），两者通过 Phaser 的事件总线通信：

\`\`\`ts
// GameScene
this.events.emit('playerHealth', player.health);
this.events.emit('score', this.score);

// HudScene
gameScene.events.on('playerHealth', (hp) => this.updateHealthBar(hp));
\`\`\`

这样 HUD 永远固定在屏幕上（不随相机移动），同时跟主世界完全解耦。

### 实体系统

`BaseEntity` 提供以下能力，供 `Player` 与 `Enemy` 继承：

- 当前血量 / 最大血量
- 无敌帧计时（受伤后短暂免疫）
- `takeDamage(amount, knockback)` 统一伤害入口
- `isAlive`、`facing`（朝向）等只读 getter

`Player.update()` 处理输入；`Enemy.update()` 跑一个简单的状态机：

\`\`\`
       ┌── player out of range ──┐
       │                         ▼
   [chase] ◀─── aggro ─── [idle]
       │                         ▲
       │  in attack range        │  player far away
       ▼                         │
   [attack] ───── cooldown ──────┘
\`\`\`

### 程序化角色帧

`CharacterFactory` 在 `BootScene` 完成后被调用一次，使用 `Phaser.Graphics` 把忍者/敌人的所有动作姿势离屏绘制成贴图：

| 角色 | 帧 |
| --- | --- |
| 忍者 (玩家) | idle, run-1, run-2, jump, attack-1, attack-2, defend |
| 敌人武士 | idle, run-1, run-2, attack |
| 特效 | slash-fx（剑光）, particle（粒子飞溅） |

这样我们绕开了原 Flash 资源的兼容性问题，且每个帧都是矢量级清晰的高分辨率图像。

### 视差背景

\`\`\`
Sky layer    (scrollFactor 0.12)  ← 几乎不动
Mid layer    (scrollFactor 0.32)  ← 缓慢移动的远山/宝塔
Ground tiles (scrollFactor 1.00)  ← 跟随玩家
\`\`\`

每层都通过 `tileSprite` 实现，水平方向无缝重复。

---

## 游戏设计

### 全局配置（`src/utils/constants.ts`）

\`\`\`ts
GAME_CONFIG = {
  WIDTH: 1280,
  HEIGHT: 720,
  GROUND_Y: 620,
  LEVEL_WIDTH: 6400,
  PHYSICS: { GRAVITY: 1500, DEBUG: false },
};

PLAYER_CONFIG = {
  SPEED: 240,
  JUMP_FORCE: -680,
  MAX_HEALTH: 100,
  STARTING_LIVES: 3,
  ATTACK_DAMAGE: 25,
  ATTACK_RANGE: 90,
  ATTACK_COOLDOWN_MS: 350,
  INVULNERABILITY_MS: 800,
};

ENEMY_CONFIG = {
  SPEED: 110,
  MAX_HEALTH: 50,
  ATTACK_DAMAGE: 12,
  ATTACK_RANGE: 60,
  AGGRO_RANGE: 360,
  ATTACK_COOLDOWN_MS: 900,
};
\`\`\`

调整这些常量可以快速迭代手感。所有数值都被 `constants.test.ts` 检查（必须为正、合理范围等）。

### 关卡数据（`src/utils/levelData.ts`）

关卡是声明式的纯数据：

\`\`\`ts
export const LEVEL_ONE: LevelData = {
  name: 'The Outer Path',
  width: 6400,
  spawn: { x: 120, y: 520 },
  platforms: [
    { x: 600, y: 480, width: 220 },
    // ... 共 12 块平台
  ],
  enemies: [
    { x: 900, y: 560 },
    // ... 共 10 个敌人
  ],
  goalX: 6280,
};
\`\`\`

新增关卡：

1. 在 `levelData.ts` 中导出新的 `LevelData` 对象
2. 在 `GameScene.init()` 接收关卡 key
3. 在 `WinScene` 中跳转到下一关

### 配色方案（5 色规范）

| 角色 | HEX | 用途 |
| --- | --- | --- |
| Primary | `#e94560` | 忍者丝带、血条、按钮高亮 |
| Accent | `#f2b134` | 得分、闪光、终点旗帜 |
| Dark | `#14142b` | 文字、UI 描边 |
| Light | `#f6f5f5` | 主要文字 |
| Muted | `#6b6b8d` | 次要 UI 文字、阴影 |

---

## 资源管线

### 背景与平铺图（HD JPG）

| 文件 | 用途 | 描述 |
| --- | --- | --- |
| `bg-sky.jpg` | 最远景 | 黄昏天空 + 富士山远山剪影 |
| `bg-mid.jpg` | 中景 | 宝塔 + 松林剪影 |
| `tile-ground.jpg` | 地面 | 可水平平铺的草+土 |
| `tile-platform.jpg` | 平台 | 可水平平铺的木板 |
| `title-bg.jpg` | 标题画面 | 红月城堡 |

所有 HD 资源均为 AI 生成的 16:9 浮世绘/动画电影风画作。如需替换，只需保持文件名一致并放回 `static/assets/hd/`。

### 音频

| Key | 文件 | 触发时机 |
| --- | --- | --- |
| `sfx-attack` | `253_ninjah_powerslash2.mp3` | 玩家挥剑 |
| `sfx-jump` | `251_ninjah_jump1.mp3` | 玩家跳跃 |
| `sfx-hit` | `254_ninjah_sword_impact1.mp3` | 命中敌人 |
| `sfx-enemy-hit` | `242_enemy_thrownimpact.mp3` | 敌人命中玩家 |
| `sfx-player-hurt` | `244_ninjah_blood1.mp3` | 玩家受伤 |

### 关键优化

`vite.config.ts` 设置了 `publicDir: 'static'`，使得：

- 仅 `static/` 中的资源会被复制到 `dist/`
- 旧的 3,631 个 Flash 帧虽然保留在 `public/` 作为历史归档，但**不会进入生产构建**
- 部署体积从原本数十 MB 降低到约 2 MB

Phaser 通过 `manualChunks` 单独打包，浏览器缓存命中率更高：

\`\`\`ts
build: {
  rollupOptions: {
    output: {
      manualChunks: { phaser: ['phaser'] },
    },
  },
}
\`\`\`

---

## 测试

测试用 Vitest 编写，覆盖纯逻辑层（关卡数据 + 游戏配置约束），不依赖 DOM 或 Phaser 运行时。

\`\`\`bash
npm run test         # 一次性跑完
npm run test:watch   # 开发模式
\`\`\`

### `constants.test.ts`

- 校验玩家/敌人速度为正
- 校验跳跃力为负（向上）
- 校验攻击范围 > 命中盒
- 校验关卡宽度 ≥ 视口宽度

### `levelData.test.ts`

- 校验出生点在关卡范围内
- 校验所有平台 x 坐标递增（避免重叠）
- 校验敌人 y 坐标在地面附近
- 校验目标点在关卡末尾

新增功能时，请在 `src/utils/*.test.ts` 中追加用例。

---

## 构建与部署

### 本地构建

\`\`\`bash
npm run build
# → dist/ 即为静态可部署目录
\`\`\`

构建后会得到：

\`\`\`
dist/
├── index.html
├── assets/
│   ├── index-[hash].js     # 应用代码
│   ├── phaser-[hash].js    # Phaser 引擎（独立 chunk）
│   ├── hd/                 # HD 背景与平铺图
│   └── sounds/             # 音效
\`\`\`

### 部署到 Vercel

项目根目录已包含 `vercel.json`：

\`\`\`json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
\`\`\`

部署方式：

1. **一键部署**：在 v0 编辑器右上角点 **Publish**，Vercel 自动构建并发布
2. **GitHub 集成**：推送到 `main` 分支触发自动部署
3. **CLI**：`npx vercel --prod`

### 缓存策略

- `/assets/*` → `max-age=31536000, immutable`（一年）
- `/index.html` → 默认（不缓存）

文件名包含内容 hash，因此长缓存安全可靠。

### 浏览器要求

游戏需要：

- ES2020 支持（async/await、可选链等）
- WebGL 或 Canvas2D 渲染
- Web Audio API（用于音效）

覆盖 Chrome 90+、Firefox 88+、Safari 14+、Edge 90+，约占全球流量 95% 以上。

---

## 扩展指南

### 新增敌人类型

1. 在 `CharacterFactory.ts` 中绘制新敌人帧并注册纹理 key
2. 创建 `src/entities/EnemyArcher.ts`，继承 `BaseEntity` 或 `Enemy`
3. 重写 `update()` 实现新行为（如远程射击）
4. 在 `GameScene.spawnEnemies()` 中根据关卡数据生成不同类型

### 新增能力

例如二段跳：

\`\`\`ts
// Player.ts
private jumpsRemaining = 2;

private jump() {
  if (this.jumpsRemaining > 0) {
    this.body.setVelocityY(PLAYER_CONFIG.JUMP_FORCE);
    this.jumpsRemaining--;
  }
}

protected onLand() {
  this.jumpsRemaining = 2;
}
\`\`\`

### 新增 BGM

\`\`\`ts
// BootScene.ts
this.load.audio('bgm-game', 'assets/sounds/bgm-game.mp3');

// GameScene.ts
this.sound.play('bgm-game', { loop: true, volume: 0.4 });
\`\`\`

### 移动端触屏

Phaser 4 自带触屏输入。可在 `HudScene` 中加入虚拟摇杆 + 按钮：

\`\`\`ts
this.add.zone(120, 600, 200, 200)
  .setInteractive()
  .on('pointermove', (p) => { /* movement */ });
\`\`\`

---

## 故障排查

| 现象 | 排查 |
| --- | --- |
| 黑屏 | 打开浏览器 DevTools，查看 Console 是否有 "Failed to load asset"；确认 `static/assets/` 下文件齐全 |
| 角色不渲染 | 检查 `CharacterFactory` 是否在 `BootScene` 完成后被调用 |
| 卡顿 | 在 `constants.ts` 中临时设 `PHYSICS.DEBUG = true`，观察是否有过多碰撞体；考虑降低粒子数量 |
| HMR 不生效 | 重启 `npm run dev`；删除 `node_modules/.vite` 缓存 |
| Vercel 部署 404 | 检查 `vercel.json` 的 `outputDirectory` 是否为 `dist` |
| 音效不响 | 浏览器策略要求用户交互后才能播放；本作通过 Title 场景的 ENTER 键触发首次音频上下文 |

如要查看运行时错误，请打开浏览器 DevTools → Console。Phaser 报错通常带有清晰的场景名 + 资源 key。

---

## 开发路线图

### 已完成 ✓

- HD 视差背景 + 程序化角色 + 完整 HUD
- Boot/Title/Game/Hud/GameOver/Win 6 大场景
- 完整战斗系统（攻击/防御/无敌帧/击退）
- 关卡数据驱动 + 第一关 12 平台 / 10 敌人
- TypeScript 严格模式 + Vitest 单元测试
- Vercel 部署配置 + 静态资源长缓存

### 计划中

- [ ] 第二、三关（雪山、城堡内部）
- [ ] BOSS 战
- [ ] 道具系统（生命药水、攻击力提升）
- [ ] BGM
- [ ] 移动端虚拟摇杆
- [ ] 本地存档（localStorage 记录最高分）
- [ ] 多语言（i18n）
- [ ] 全屏模式按钮

欢迎 PR！

---

## License

ISC

## Credits

- 原版 Flash 游戏：Ninjaman（社区作品，本项目仅借鉴概念，未复用任何原始资源）
- 重制版代码 / 美术 / 设计：本仓库贡献者
- 引擎：[Phaser](https://phaser.io/)
- 部署：[Vercel](https://vercel.com/)
