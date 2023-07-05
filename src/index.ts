import { bootstrap } from './core';
import { bootstrap as viewBootstrap } from './main';
import { getApplication } from './core/app';
import { AppConfigService } from '@manycore/custom-sdk';

bootstrap().then(() => {
    getApplication().getService(AppConfigService).setGetJsonConfig({
        ignoreResetPosition: false,
    });

    return viewBootstrap();
});
