import { IExportModelData } from '@manycore/custom-miniapp-sdk';

/**
 * 获取所有子模型
 * @param subModels
 * @returns
 */
export const getSubModels = (subModels: IExportModelData[]): IExportModelData[] => {
    const result = subModels
        .map((model) => {
            if (model.subModels && model.subModels.length) {
                return getSubModels(model.subModels);
            }
            return [];
        })
        .flat();
    result.push(...subModels);
    return result;
};
