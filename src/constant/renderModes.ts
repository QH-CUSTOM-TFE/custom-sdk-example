import { ECameraMode, EDesignMode } from '@manycore/custom-sdk';

/**
 * 模型渲染模式
 */
export const RenderModes = [
    {
        text: '材质',
        isSetBorder: false,
        isSetTransparent: false,
    },
    {
        text: '线框',
        isSetBorder: true,
        isSetTransparent: false,
    },
    {
        text: '半透明',
        isSetBorder: false,
        isSetTransparent: true,
    },
    {
        text: '线框+半透明',
        isSetBorder: true,
        isSetTransparent: true,
    },
];

export const sceneCameraMode = [
    {
        text: '鸟瞰',
        mode: ECameraMode.View3D,
    },
    {
        text: '漫游',
        mode: ECameraMode.Roamer,
    },
];

export const designModes = [
    {
        text: '整体模式',
        mode: EDesignMode.TOP_MODEL,
    },
    {
        text: '组件模式',
        mode: EDesignMode.ACCESSORY,
    },
    {
        text: '底层商品模式',
        mode: EDesignMode.PRODUCT,
    },
    {
        text: '自定义模式',
        mode: EDesignMode.CUSTOM,
    },
];
