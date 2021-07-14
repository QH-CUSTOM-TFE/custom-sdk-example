import { Action } from 'redux';
import { APP_SELECTION_CHANGE } from './constant';
import { IAppSelection } from './reducers';

export interface IUpdateSelected extends Action {
    /**
     * 选中的内容
     */
    value: Partial<IAppSelection>;
}

/**
 * 更新选中的内容
 * @param selected
 */
export function actionUpdateSelected(selected: Partial<IAppSelection> = {}): IUpdateSelected {
    return {
        type: APP_SELECTION_CHANGE,
        value: selected,
    };
}
