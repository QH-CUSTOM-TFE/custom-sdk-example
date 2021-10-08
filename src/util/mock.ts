import { EFittingType, IFittingDesignData } from '@manycore/custom-sdk';
import { random } from 'lodash';

const brandGoodId = '3FO4B2O29WOC';

/**
 * 模拟生成孔槽数据
 * @param options
 * @returns
 */
export const mockFittingDesignData = (options: {
    modelId?: string;
    fittingDesignData?: IFittingDesignData;
    planeId: string;
}) => {
    const { modelId, fittingDesignData, planeId } = options;
    const holeId = random(1000000000, 10000000000).toString();
    const grooveId = random(1000000000, 10000000000).toString();
    return {
        id: modelId,
        holes: {
            ...(fittingDesignData ? fittingDesignData.holes : {}),
            [planeId]: [
                {
                    id: holeId,
                    fittingType: EFittingType.HOLE,
                    params: [],
                    depth: 20,
                    diameter: 20,
                    plankFaceId: 0,
                    start: {
                        x: -100,
                        y: 0,
                        z: 20,
                    },
                    end: {
                        x: 100,
                        y: 0,
                        z: 20,
                    },
                },
            ],
        },
        grooves: {
            ...(fittingDesignData ? fittingDesignData.grooves : {}),
            [planeId]: [
                {
                    id: grooveId,
                    fittingType: EFittingType.GROOVE,
                    params: [],
                    depth: 20,
                    width: 20,
                    plankFaceId: 0,
                    start: {
                        x: 300,
                        y: 0,
                        z: 20,
                    },
                    end: {
                        x: 100,
                        y: 0,
                        z: 20,
                    },
                },
            ],
        },
        hardwares: {
            ...(fittingDesignData ? fittingDesignData.hardwares : {}),
            [planeId]: [
                {
                    id: random(1000000000, 10000000000).toString(),
                    position: {
                        x: 0,
                        y: -52,
                        z: 9,
                    },
                    rotate: {
                        x: 0,
                        y: 0,
                        z: 0,
                    },
                    scale: {
                        x: 1,
                        y: 1,
                        z: 1,
                    },
                    fittingType: EFittingType.HARDWARE,
                    brandGoodId,
                    linkedIds: [grooveId],
                },
                {
                    id: random(1000000000, 10000000000).toString(),
                    position: {
                        x: 0,
                        y: -448,
                        z: 9,
                    },
                    rotate: {
                        x: 0,
                        y: 0,
                        z: 0,
                    },
                    scale: {
                        x: 1,
                        y: 1,
                        z: 1,
                    },
                    fittingType: EFittingType.HARDWARE,
                    brandGoodId,
                    linkedIds: [holeId],
                },
            ],
        },
    };
};
