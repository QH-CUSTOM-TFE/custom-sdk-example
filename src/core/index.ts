import { getApplication } from './app';

export async function bootstrap() {
    const modelViewApp = getApplication();
    await modelViewApp.start();
}
