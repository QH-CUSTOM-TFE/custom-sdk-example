# 定制对接 2.0 开发者工具

安装

```bash
yarn
```

启动项目

```bash
yarn start
```

## 项目开发

当前项目即支持定制小程序，也支持工具小程序启动。

[定制小程序开发者文档](https://manual.kujiale.com/custom-miniapp-sdk/0.11.1#/mini-app/quick-start/accessGuide)

如果使用 kaf 小程序启动，可以在浏览器控制台中，执行如下代码添加入口：

```typescript
__miniappUtils.enableDebug();
__miniappUtils.enableDev();
__miniappUtils.loadApp('test-app', 'http://127.0.0.1:3000/manifest.json');
```

如果存在异常退出的情况，执行以下逻辑，强制关闭小程序

```typescript
__miniappUtils.killActive();
```
