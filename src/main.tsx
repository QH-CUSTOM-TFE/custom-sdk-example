import { once } from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';
import App from './views/App';

const createRootMountPoint = once(() => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    return div;
});

export function bootstrap() {
    // 创建DOM到页面
    ReactDom.render(<App />, createRootMountPoint());
}
