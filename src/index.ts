import { AppConfigService } from '@manycore/custom-sdk';
import { bootstrap } from './core';
import { getApplication } from './core/app';
import { bootstrap as viewBootstrap } from './main';

bootstrap().then(() => {
    getApplication().getService(AppConfigService).setGetJsonConfig({
        ignoreResetPosition: true,
    });
    return viewBootstrap();
});
