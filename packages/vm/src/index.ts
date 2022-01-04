// @ts-nocheck
// 挂载展示
IDP.Miniapp.view.defaultFrame.mount(IDP.Miniapp.view.mountPoints.main);
// 设置全屏展示
IDP.Miniapp.view.setContainerOptions(IDP.Miniapp.view.defaultFrame, {
    windowMode: 'fullscreen',
});

// 打开对接2.0通道
IDP.Custom.Common.openTerminalAsync().catch(() => {
    // 如果出现异常，则自动卸载
    IDP.Miniapp.view.defaultFrame.unmount();
});

