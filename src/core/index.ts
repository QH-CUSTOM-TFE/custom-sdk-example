import { sappSDK } from 'servkit';
import { getApplication } from './app';

export async function bootstrap() {
    const isMiniAppMode = window != window.top;
    if (isMiniAppMode) {
        await sappSDK
            .setConfig({
                async onClose(s) {
                    await getApplication().stop();
                },
            })
            .start();
    }
    const modelViewApp = getApplication();
    await modelViewApp.start();
}
