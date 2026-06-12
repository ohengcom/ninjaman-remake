# 如何部署 Godot 版本到 Vercel

## 问题分析

当前情况：
- ✅ 代码已完成并推送到 GitHub
- ✅ Web 构建文件已生成（build/web/）
- ✅ vercel.json 配置正确
- ❌ https://ninjaman-remake-psi.vercel.app 仍显示 404 或 Phaser 版本

**原因**: `ninjaman-remake-psi.vercel.app` 可能不存在，或者是一个独立的 Vercel 项目配置。

---

## 解决方案：在 Vercel 创建新项目

### 方法 1: 通过 Vercel 网页界面（推荐）

1. **访问 Vercel Dashboard**
   ```
   https://vercel.com/new
   ```

2. **导入 GitHub 仓库**
   - 点击 "Import Project"
   - 选择 "Import Git Repository"
   - 选择 `ohengcom/ninjaman-remake`

3. **配置项目**
   - **Project Name**: `ninjaman-godot`（或任意名称）
   - **Framework Preset**: 选择 "Other"
   - **Root Directory**: `.` (保持默认)
   - **Build Command**: 留空或填 `echo "Using pre-built files"`
   - **Output Directory**: `build/web`
   - **Install Command**: 留空

4. **点击 "Deploy"**

5. **部署完成后**
   - Vercel 会生成一个 URL，如：
   - `https://ninjaman-godot.vercel.app`
   - 或 `https://ninjaman-godot-xxx.vercel.app`

---

### 方法 2: 使用现有项目

如果 `ninjaman-remake.vercel.app` 已经存在：

1. **访问项目设置**
   ```
   https://vercel.com/your-username/ninjaman-remake/settings
   ```

2. **修改 Build & Development Settings**
   - Build Command: 留空
   - Output Directory: `build/web`
   - Install Command: 留空
   - Framework: None

3. **触发重新部署**
   - 进入 Deployments 标签
   - 点击最新部署的 "..." 菜单
   - 选择 "Redeploy"

---

### 方法 3: 创建专门的 Godot 部署分支

如果想同时保留 Phaser 和 Godot 版本：

1. **创建新分支**
   ```bash
   git checkout -b godot-web
   git push origin godot-web
   ```

2. **在 Vercel 创建新项目**
   - 导入同一个 GitHub 仓库
   - 选择 `godot-web` 分支
   - 配置 Output Directory: `build/web`

3. **结果**
   - `ninjaman-remake.vercel.app` → Phaser 版本（main 分支）
   - `ninjaman-remake-godot.vercel.app` → Godot 版本（godot-web 分支）

---

## 当前仓库状态

### GitHub 仓库 ✅
```
https://github.com/ohengcom/ninjaman-remake
```

**包含**:
- ✅ 完整 Godot 源码（`godot/` 目录）
- ✅ Web 构建文件（`build/web/` 目录，41 MB）
- ✅ 正确的 `vercel.json` 配置

### 构建文件位置
```
build/web/
├── index.html
├── index.wasm (36 MB)
├── index.pck (4.7 MB)
├── index.js
└── 其他文件
```

---

## 验证步骤

### 测试 1: 本地验证构建文件

```bash
cd build/web
python -m http.server 8000
```

访问 `http://localhost:8000`，应该能看到 Godot 游戏加载。

### 测试 2: 检查 GitHub 文件

访问：
```
https://github.com/ohengcom/ninjaman-remake/tree/main/build/web
```

应该能看到所有构建文件。

---

## 推荐操作

### 最简单的方法：创建新 Vercel 项目

1. 访问 https://vercel.com/new
2. 导入 `ohengcom/ninjaman-remake`
3. 配置：
   - Output Directory: `build/web`
   - Build Command: （留空）
4. 部署
5. 获得新 URL（如 `ninjaman-godot-abc123.vercel.app`）

**这样可以立即部署，无需修改现有配置。**

---

## 如果需要使用 vercel.app/psi 子域名

需要在 Vercel 项目设置中：
1. 进入 Project Settings > Domains
2. 添加自定义域名 `ninjaman-remake-psi.vercel.app`
3. 或者将主域名指向 Godot 项目

---

## 总结

**当前状态**:
- ✅ 代码完整
- ✅ 构建完成
- ✅ 配置正确
- ⏳ 需要在 Vercel 创建/配置项目

**下一步**: 按照上述"方法 1"在 Vercel 创建新项目，5 分钟即可完成部署。

**最终结果**: 一个可运行的 Godot WebAssembly 游戏，托管在 Vercel 上。
