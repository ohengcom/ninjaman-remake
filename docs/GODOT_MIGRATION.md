# Godot 4 重构原型

当前仓库保留 Phaser 版本，同时新增 `godot/` 作为 Godot 4 vertical slice。这个目录用于验证是否将项目完全迁移到 Godot。

## 技术栈

- Godot 4.6.3
- GDScript
- `CharacterBody2D` 玩家/敌人运动
- `AnimatedSprite2D` spritesheet 风格动画入口
- `AnimationPlayer` / `AnimationTree` 节点预留给动画事件和状态机混合
- `TileMap` 节点预留给正式 TileSet 关卡管线
- `Skeleton2D` / `Bone2D` 节点预留给免费 2D cutout 骨骼动画

## 当前原型内容

- `scenes/Main.tscn`：入口场景，注册输入，显示主菜单，并负责菜单/关卡切换。
- `scenes/levels/Level01.tscn`：第一关 vertical slice，包含数据驱动平台/敌人布局、出口、相机和 HUD。
- `scenes/player/Player.tscn`：玩家移动、跳跃、二段跳、dash、近战、波动弹、受击、死亡信号。
- `scenes/enemies/EnemyGuard.tscn`：基础敌人模板，通过 `configure()` 支持 guard/axe/ninja 三种参数和外观。
- `scenes/enemies/BossOni.tscn`：Boss vertical slice，包含近身伤害、受击、低血量 rush、击败得分。
- `scenes/combat/WaveProjectile.tscn`：波动弹。
- `scenes/vfx/HitVfx.tscn`：非方块命中特效。
- `scenes/ui/Hud.tscn`：血量、分数、提示消息。
- `scenes/ui/MainMenu.tscn`：Godot 原型主菜单。
- `scripts/autoload/game_state.gd`：全局运行状态、分数、关卡进度。

## 当前视觉资源方向

- 不再复用 Phaser/Vite 版的程序生成角色和背景。
- 当前 Godot 主角临时使用 OpenGameArt 的 `Foxy 2D Character Asset` demo 帧作为更好的动画基线；主角不再强制限定为 ninja，优先生动、好看、授权清晰的免费可商用资源。
- 当前 guard/axe/ninja/Boss 使用同一 Foxy 资源的缩放、调色、速度变体，先替代脚本生成的方块敌人，建立完整非方块视觉基线。
- Foxy 资源许可证是 OGA-BY 3.0，需要保留署名；署名记录在 `godot/assets/CREDITS.md`。
- Kenney Platformer Characters 已确认是 CC0，可作为后续敌人/替代主角/cutout 骨骼资源来源。
- 背景和平台暂时用 Godot 原生矢量/几何绘制，包括夜空、星点、月亮、远山、雾、树林、草和平台细节，不沿用 Vite 背景。

## 运行方式

1. 安装 Godot 4.6.3。
2. 用 Godot 打开 `godot/project.godot`。
3. 运行主场景 `res://scenes/Main.tscn`。

当前机器已通过 `winget` 安装 Godot 4.6.3。当前 shell 的 `godot` alias 可能尚未刷新，可直接运行：

```powershell
& "C:\Users\lixia\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.6.3-stable_win64_console.exe" --version
```

已通过 headless editor 打开项目并完成脚本注册/资源导入：

```powershell
& "C:\Users\lixia\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.6.3-stable_win64_console.exe" --headless --editor --quit --path "C:\Users\lixia\OneDrive\Projects\ninjaman\godot"
```

## Web 导出

- Godot Web export preset 已添加到 `godot/export_presets.cfg`，输出路径为 `godot/build/web/index.html`。
- 本地导出命令：`npm run build:godot:web`。
- 当前机器已安装 Godot 4.6.3 Web export templates，并已验证 Web 导出成功。
- 导出脚本默认使用当前机器的 Godot 4.6.3 console 路径；其他机器可设置 `GODOT_BIN` 指向 Godot 可执行文件。
- 当前根目录 `vercel.json` 仍保持 Phaser/Vite 发布，避免在 Vercel 环境缺少 Godot CLI 或 export templates 时破坏线上版本。
- 若要切换 Vercel 发布 Godot 版，可把 `vercel.godot.json` 的内容复制/替换为根目录 `vercel.json`，或在单独项目中使用同等配置。
- Godot Web 导出需要安装 Godot Web export templates；若本地导出失败，先在 Godot Editor 的 Export Template Manager 中安装匹配版本模板。

## 控制

- `A` / `D`：移动
- `Space`：跳跃 / 二段跳
- `Shift`：Dash
- `J`：近战攻击
- `L`：波动弹
- `Esc`：暂停/继续
- 菜单中 `Space` 或 `J`：开始

## 当前玩法循环

- 玩家从左侧出生，沿数据驱动平台和地面推进。
- 敌人包含 guard、axe、ninja 和 boss 四类原型。
- 击败敌人增加分数并生成命中特效。
- 玩家受伤会更新 HUD 血条。
- 玩家死亡后自动重开当前场景。
- 到达出口区域后显示 `ACT CLEAR` 并加分。
- 完成关卡后通过 `Main` 回到主菜单，预留多关卡切换钩子。

## 下一步迁移计划

1. 为敌人和 Boss 选择独立的免费可商用角色包，替换当前 Foxy 调色/缩放变体。
2. 用 `TileSet`/`TileMap` 重做关卡，而不是脚本生成平台。
3. 用 `AnimationPlayer` 做攻击判定窗口、受击停顿和脚步事件。
4. 用 `AnimationTree` 管 idle/run/jump/fall/attack/wave/hurt 状态切换。
5. 如果继续免费路线，用 `Skeleton2D`/`Bone2D` 做 cutout 角色，而不是 Spine。
6. 如果正式切换 Vercel 到 Godot 版，需要确保构建环境安装 Godot CLI 和 4.6.3 Web export templates。
