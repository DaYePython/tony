# GitHub Actions CI/CD Setup

## 自动发布到 NPM

已配置 GitHub Actions 自动化发布流程，当代码合并到 `main` 分支时会自动发布到 NPM。

## 配置步骤

### 1. 创建 NPM Token

1. 访问 https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. 点击 "Generate New Token" -> "Automation"
3. 复制生成的 token

### 2. 添加 GitHub Secret

1. 访问你的 GitHub 仓库
2. 进入 Settings -> Secrets and variables -> Actions
3. 点击 "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: 粘贴你的 NPM token
6. 点击 "Add secret"

### 3. 触发发布

当你推送代码到 `main` 分支，且修改了以下路径时会自动触发发布：
- `packages/keyboard-sequence-listener/**`
- `.github/workflows/publish.yml`

## 工作流程

1. 检出代码
2. 设置 pnpm 和 Node.js 环境
3. 安装依赖
4. 构建包
5. 发布到 NPM

## 手动发布

如果需要手动发布：

```bash
cd packages/keyboard-sequence-listener
npm publish --otp=YOUR_6_DIGIT_CODE
```

## 注意事项

- 确保 `package.json` 中的版本号已更新
- NPM token 需要有 "Automation" 权限以绕过 2FA
- 每次发布都会自动执行构建
