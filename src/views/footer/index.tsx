import { ModelViewerService } from '@manycore/custom-sdk';
import { Fragment } from 'react';
import { RenderModes } from '../../constant';
import { getApplication } from '../../core/app';
import style from './index.module.scss';

const viewerService = getApplication().getService(ModelViewerService);

export function Footer() {
    return (
        <Fragment>
            <div>
                <button
                    className={style.viewerBtn}
                    onClick={() => viewerService.resetPerspective()}
                >
                    重置视角
                </button>
                {RenderModes.map((mode) => {
                    return (
                        <button
                            className={style.viewerBtn}
                            onClick={() => {
                                viewerService.toggleModelBorder(mode.isSetBorder);
                                viewerService.toggleModelTransparent(mode.isSetTransparent);
                            }}
                        >
                            {mode.text}
                        </button>
                    );
                })}
            </div>
        </Fragment>
    );
}
