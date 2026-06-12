# 将现有 Vercel 项目切换到 Godot 版本

## 当前情况

- **Vercel 项目**: `ninjaman-remake`
- **域名**: https://ninjaman-remake.vercel.app
- **当前部署**: Phaser 版本（从 `dist/` 目录）
- **目标**: 切换到 Godot 版本（从 `build/web/` 目录）

## 方法 1: 在 Vercel Dashboard 修改设置（推荐）

### 步骤

1. **访问项目设置**
   ```
   https://vercel.com/ohengcoms-projects/ninjaman-remake/settings
   ```

2. **进入 Build & Development Settings**
   - 在左侧菜单找到 "Build & Development Settings"
   - 或直接访问: https://vercel.com/ohengcoms-projects/ninjaman-remake/settings/build-output

3. **修改配置**
   
   **Framework Preset**: 
   - 当前可能是: `Vite` 或 `Other`
   - 改为: `Other`
   
   **Build Command**:
   - 当前可能是: `npm run build`
   - 改为: **留空** 或填 `echo "Using pre-built files"`
   
   **Output Directory**:
   - 当前可能是: `dist`
   - 改为: `build/web`
   
   **Install Command**:
   - 改为: **留空** 或 `echo "Skip install"`

4. **保存设置**
   - 点击页面底部的 "Save" 按钮

5. **触发重新部署**
   
   方法 A - 推送新提交（自动触发）:
   ```bash
   # 在项目目录
   git commit --allow-empty -m "Trigger Vercel redeploy for Godot"
   git push
   ```
   
   方法 B - 手动重新部署:
   - 进入 https://vercel.com/ohengcoms-projects/ninjaman-remake
   - 找到最新的 Deployment
   - 点击右侧的 "..." 菜单
   - 选择 "Redeploy"

6. **等待部署完成**
   - 大约 1-2 分钟
   - 部署完成后，访问 https://ninjaman-remake.vercel.app
   - 应该看到 Godot 游戏加载界面

---

## 方法 2: 删除 dist 目录强制使用 build/web

如果 Vercel 还是读取 `dist` 目录，可以临时删除它：

```bash
cd C:\Users\lixia\OneDrive\Projects\ninjaman
git rm -r dist
git commit -m "Remove Phaser build, use Godot build only"
git push
```

这样 Vercel 只能找到 `build/web/` 目录。

---

## 方法 3: 创建 vercel.json 覆盖配置（已完成）

我们已经更新了 `vercel.json`:

```json
{
  "outputDirectory": "build/web",
  "framework": null
}
```

这应该会覆盖 Vercel Dashboard 的设置。

**如果还不生效**，可能需要在 Vercel 项目设置中勾选 "Override" 选项。

---

## 验证步骤

### 1. 检查 GitHub 文件
访问: https://github.com/ohengcom/ninjaman-remake/tree/main/build/web

应该看到:
- index.html
- index.wasm (36 MB)
- index.pck (4.7 MB)
- index.js
- 等等

### 2. 检查 vercel.json
访问: https://github.com/ohengcom/ninjaman-remake/blob/main/vercel.json

应该包含:
```json
"outputDirectory": "build/web"
```

### 3. 测试部署
部署完成后访问: https://ninjaman-remake.vercel.app

**期望结果**:
- 看到 Godot 加载界面
- 显示 "Loading..." 进度条
- 加载完成后显示 "NINJA MAN" 标题
- 可以按 Space 或 J 开始游戏

---

## 快速操作（推荐）

### 最简单的方法：

1. **访问 Vercel 项目设置**
   ```
   https://vercel.com/ohengcoms-projects/ninjaman-remake/settings/build-output
   ```

2. **修改 Output Directory**
   - 将 `dist` 改为 `build/web`
   - 点击 Save

3. **推送一个空提交触发部署**
   ```bash
   cd C:\Users\lixia\OneDrive\Projects\ninjaman
   git commit --allow-empty -m "Trigger redeploy for Godot"
   git push
   ```

4. **等待 1-2 分钟**

5. **访问**
   ```
   https://ninjaman-remake.vercel.app
   ```

完成！

---

## 如果想保留两个版本

### 选项 A: 使用不同域名

1. 保持当前项目为 Phaser 版本
2. 创建新项目 `ninjaman-remake-godot`
3. 配置新项目使用 `build/web`
4. 结果:
   - https://ninjaman-remake.vercel.app → Phaser
   - https://ninjaman-remake-godot.vercel.app → Godot

### 选项 B: 使用不同分支

1. 创建 `godot-web` 分支:
   ```bash
   git checkout -b godot-web
   git rm -r dist
   git commit -m "Godot branch: remove Phaser build"
   git push origin godot-web
   ```

2. 在 Vercel 项目设置中:
   - Git > Production Branch: `godot-web`
   - 或创建新项目指向 `godot-web` 分支

---

## 故障排除

### 如果部署后还是 Phaser 版本

**检查 1**: Vercel 构建日志
- 查看是否运行了 `npm run build`
- 如果是，说明 Build Command 没有清空

**检查 2**: Output Directory
- 确认设置为 `build/web` 而不是 `dist`

**检查 3**: 缓存问题
- 尝试强制刷新浏览器 (Ctrl+Shift+R)
- 或在 Vercel 中 Redeploy

### 如果出现 404

**可能原因**: 
- Output Directory 路径错误
- 文件没有推送到 GitHub

**解决**:
```bash
# 确认文件存在
git ls-tree -r main --name-only | grep "build/web"

# 如果没有，重新提交
git add build/web/
git commit -m "Add Godot build files"
git push
```

---

## 总结

**最快方法**:
1. 修改 Vercel Output Directory: `dist` → `build/web`
2. 保存
3. 推送空提交触发部署
4. 完成！

整个过程 < 5 分钟。
