import React from 'react';
import ReactDom from 'react-dom';
import App from './views/App';
import { once } from 'lodash';

const createRootMountPoint = once(() => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    return div;
});

export function bootstrap() {
    // 创建DOM到页面
    ReactDom.render(<App />, createRootMountPoint());
}
