import { Application } from '@manycore/custom-sdk';

let app: Application;

/**
 * 每次创建新的app并覆盖之前的应用
 */
export function generateApplication() {
    app = new Application();
    return app;
}

/**
 * 使用上次创建的app
 */
export function getApplication() {
    if (app) {
        return app;
    }
    return generateApplication();
}
