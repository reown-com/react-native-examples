[English](README.md) | [简体中文](README_zh-CN.md)

---

# React Native 示例

一组 React Native 示例应用，展示 [Reown](https://reown.com) AppKit 和 WalletKit SDK。本仓库包含示例 dapp 和参考钱包实现，可作为测试环境、学习资源和参考代码，帮助开发者将 Reown SDK 集成到自己的项目中。

## 钱包

- React Native CLI 钱包：`wallets/rn_cli_wallet`
- Expo 钱包（开发中）：`wallets/expo-wallet`

## Dapps

### AppKit 应用

- AppKit + Wagmi + 多链：`dapps/W3MWagmi`
- AppKit + Ethers：`dapps/W3MEthers`
- AppKit + Ethers v5：`dapps/W3MEthers5`
- AppKit + Expo + Wagmi：`dapps/appkit-expo-wagmi`

### POS 应用

- 销售终端应用：`dapps/pos-app`
- PoC 销售终端应用（旧版）：`dapps/poc-pos-app`


## 快速开始

- 确保你的 [React Native 开发环境](https://reactnative.dev/docs/next/set-up-your-environment)已正确配置（XCode、Ruby 等）。
- 阅读我们的 [React Native 文档](https://docs.reown.com/appkit/react-native/core/installation)
- 查看各项目的 README 文件获取更多信息
- 提交问题或功能请求

## Fastlane

本仓库使用 [Fastlane](https://fastlane.tools) 进行 iOS 构建自动化和证书管理。

### 安装

**macOS 用户：** 建议使用 [rbenv](https://github.com/rbenv/rbenv) 管理 Ruby 版本：

```bash
# 通过 Homebrew 安装 rbenv
brew install rbenv

# 安装 Ruby 3.3.0
rbenv install 3.3.0

# 将其设为本项目的本地版本
rbenv local 3.3.0
```

然后安装 Ruby 依赖：

```bash
# 安装 Ruby 依赖（包括 Fastlane 和 CocoaPods）
bundle install
```

### 为新应用创建证书

使用提供的脚本创建新证书和配置文件。该脚本会创建分支、运行 fastlane match，并创建 PR（由于证书仓库有分支保护，这是必需的）：

```bash
# 使脚本可执行（仅首次需要）
chmod +x scripts/create-certificates.sh

# 创建 App Store 证书（创建 PR 需人工审核）
./scripts/create-certificates.sh <certificates_repo> <bundle_id> <apple_email> appstore

# 创建开发证书
./scripts/create-certificates.sh <certificates_repo> <bundle_id> <apple_email> development

# 自动合并 PR（跳过人工审核）
./scripts/create-certificates.sh <certificates_repo> <bundle_id> <apple_email> appstore --auto-merge
```

**示例：**

```bash
./scripts/create-certificates.sh reown-com/mobile-certificates com.reown.myapp dev@reown.com appstore
./scripts/create-certificates.sh reown-com/mobile-certificates com.reown.myapp dev@reown.com development
```

> **注意：** 需要安装并认证 [GitHub CLI](https://cli.github.com/)（`gh`）。默认情况下，脚本会创建需要手动合并的 PR。使用 `--auto-merge` 可自动合并。

### 在本地下载证书

以只读模式下载现有证书（不修改）：

```bash
# 下载开发证书
bundle exec fastlane match development --readonly --git_url <certificates_repo_url> --app_identifier <bundle_id>

# 下载 App Store 证书
bundle exec fastlane match appstore --readonly --git_url <certificates_repo_url> --app_identifier <bundle_id>
```

## 配置文件

### Sentry 配置

`sentry.properties` 文件是 iOS 和 Android 上传 source map 和调试符号所必需的。同一文件内容适用于两个平台。

**方式一：Sentry 向导（推荐）**

```bash
npx @sentry/wizard@latest -i reactNative
```

这将引导你连接 Sentry 账户，并自动创建配置文件。

**方式二：手动创建**

创建 `ios/sentry.properties` 和 `android/sentry.properties`，内容如下：

```properties
defaults.url=https://sentry.io/
defaults.org=<your-org>
defaults.project=<your-project>
auth.token=<your-auth-token>
```

### Google Services 文件（用于 GitHub Secrets）

Android 和 iOS 的 Google Services 文件在存入 GitHub Secrets 之前应先进行 base64 编码：

```bash
# Android - 编码 google-services.json
base64 -i /path/to/google-services.json | pbcopy

# iOS - 编码 GoogleService-Info.plist  
base64 -i /path/to/GoogleService-Info.plist | pbcopy
```

工作流将在构建过程中自动解码这些文件。

## 支持

欢迎通过 [Discord](https://discord.com/invite/kdTQHQ6AFQ) 的开发者支持频道联系 WalletConnect。
