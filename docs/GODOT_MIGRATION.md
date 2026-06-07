# Godot 4 重构原型

当前仓库保留 Phaser 版本，同时新增 `godot/` 作为 Godot 4 vertical slice。这个目录用于验证是否将项目完全迁移到 Godot。

## 技术栈

- Godot 4.4+ 或 Godot 4.5+
- GDScript
- `CharacterBody2D` 玩家/敌人运动
- `AnimatedSprite2D` spritesheet 风格动画入口
- `AnimationPlayer` / `AnimationTree` 节点预留给动画事件和状态机混合
- `TileMap` 节点预留给正式 TileSet 关卡管线
- `Skeleton2D` / `Bone2D` 节点预留给免费 2D cutout 骨骼动画

## 当前原型内容

- `scenes/Main.tscn`：入口场景，注册输入并加载关卡。
- `scenes/levels/Level01.tscn`：第一关 vertical slice，包含数据驱动平台/敌人布局、出口、相机和 HUD。
- `scenes/player/Player.tscn`：玩家移动、跳跃、二段跳、dash、近战、波动弹、受击、死亡信号。
- `scenes/enemies/EnemyGuard.tscn`：基础敌人模板，通过 `configure()` 支持 guard/axe/ninja 三种参数和外观。
- `scenes/enemies/BossOni.tscn`：Boss vertical slice，包含近身伤害、受击、低血量 rush、击败得分。
- `scenes/combat/WaveProjectile.tscn`：波动弹。
- `scenes/vfx/HitVfx.tscn`：非方块命中特效。
- `scenes/ui/Hud.tscn`：血量、分数、提示消息。

## 运行方式

1. 安装 Godot 4.4+ 或 4.5+。
2. 用 Godot 打开 `godot/project.godot`。
3. 运行主场景 `res://scenes/Main.tscn`。

当前机器没有检测到 `godot` CLI 在 PATH 中，所以本轮只能做文本项目和脚本静态构建，无法在命令行直接运行 Godot 校验。

## 控制

- `A` / `D`：移动
- `Space`：跳跃 / 二段跳
- `Shift`：Dash
- `J`：近战攻击
- `L`：波动弹
- `Esc`：暂停/继续

## 当前玩法循环

- 玩家从左侧出生，沿数据驱动平台和地面推进。
- 敌人包含 guard、axe、ninja 和 boss 四类原型。
- 击败敌人增加分数并生成命中特效。
- 玩家受伤会更新 HUD 血条。
- 玩家死亡后自动重开当前场景。
- 到达出口区域后显示 `ACT CLEAR` 并加分。

## 下一步迁移计划

1. 安装 Godot 后打开项目并修正任何引擎导入/脚本提示。
2. 用正式免费 spritesheet 替换脚本生成临时帧。
3. 用 `TileSet`/`TileMap` 重做关卡，而不是脚本生成平台。
4. 用 `AnimationPlayer` 做攻击判定窗口、受击停顿和脚步事件。
5. 用 `AnimationTree` 管 idle/run/jump/fall/attack/wave/hurt 状态切换。
6. 如果继续免费路线，用 `Skeleton2D`/`Bone2D` 做 cutout 角色，而不是 Spine。
7. 验证 Web export：如果启用线程，需要配置 COOP/COEP；否则用单线程 Web export 简化部署。
