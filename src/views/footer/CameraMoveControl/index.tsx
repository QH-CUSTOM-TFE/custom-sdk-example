import { ECameraMoveDirection, ModelCameraService } from '@manycore/custom-sdk';
import { PureComponent } from 'react';
import { getApplication } from '../../../core/app';
import style from './index.module.scss';

export class CameraMoveControl extends PureComponent<{}, {}> {
    private timer: any;

    private onMouseDown = (direction: ECameraMoveDirection) => {
        const cameraService = getApplication().getService(ModelCameraService);
        cameraService.moveCamera(direction);
        this.timer = setInterval(() => {
            cameraService.moveCamera(direction);
        }, 50);
    };

    private clearInterval = () => {
        clearInterval(this.timer);
    };

    render() {
        return (
            <div className={style.root}>
                <div className={style.container}>
                    {Object.values(ECameraMoveDirection).map((item) => {
                        if (
                            item !== ECameraMoveDirection.UP &&
                            item !== ECameraMoveDirection.DOWN
                        ) {
                            const className = item.toLowerCase() as keyof typeof style;
                            return (
                                <div
                                    key={item}
                                    className={`${style.base} ${style[className]}`}
                                    onMouseDown={() => this.onMouseDown(item)}
                                    onMouseUp={this.clearInterval}
                                    onMouseOut={this.clearInterval}
                                />
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        );
    }
}
