import { IFittingDesignData } from '@manycore/custom-sdk';
import { actionUpdateSelected } from './action';
import { APP_SELECTION_CHANGE } from './constant';
import { IExportModelData } from '@manycore/custom-miniapp-sdk';

export interface IAppSelection {
    // 当前选中的模块信息
    selected: IExportModelData[];
    // 选中商品中的方案信息
    selectedFittingDesign?: IFittingDesignData | null;
    // 完整的方案信息
    fullFittingDesign?: IFittingDesignData | null;
}

export const initialState: IAppSelection = {
    /**
     * 当前选中的内容
     */
    selected: [],
    selectedFittingDesign: undefined,
    // 完整的方案信息
    fullFittingDesign: undefined,
};

export function selectionReducers(
    state = initialState,
    action: ReturnType<typeof actionUpdateSelected>
): IAppSelection {
    switch (action.type) {
        case APP_SELECTION_CHANGE: {
            return {
                ...state,
                ...action.value,
            };
        }
    }
    return state;
}
