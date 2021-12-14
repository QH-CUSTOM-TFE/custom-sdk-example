import { EFittingType, IFittingDesignData, ELineType, EPointType } from '@manycore/custom-sdk';
import { random } from 'lodash';

// 3FO4GB757RQ1 内网
// 3FO4B2O29WOC 外网
const brandGoodId = '3FO4GB757RQ1';

/**
 * 模拟生成孔槽数据
 * @param options
 * @returns
 */
export const mockFittingDesignData = (options: {
    modelId?: string;
    fittingDesignData?: IFittingDesignData;
    planeId: string;
}): IFittingDesignData => {
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
        hardwareGrooves: {
            ...(fittingDesignData ? fittingDesignData.hardwareGrooves : {}),
            [planeId]: [
                {
                    id: random(1000000000, 10000000000).toString(),
                    plankFaceId: 0,
                    depth: 20,
                    fittingType: EFittingType.HARDWARE_GROOVE,
                    points: [
                        {
                            position: {
                                x: 500,
                                y: 0,
                                z: 0,
                            },
                            type: EPointType.LINE,
                            cornerCutDistance: [30, 60],
                        },
                        {
                            position: {
                                x: 500,
                                y: -300,
                                z: 0,
                            },
                            type: EPointType.CIRCLE,
                            radius: 60,
                        },
                        {
                            position: {
                                x: 200,
                                y: -150,
                                z: 0,
                            },
                            type: EPointType.CUT_CIRCLE,
                            radius: 20,
                            clockwise: false,
                        },
                    ],
                    lines: [
                        {
                            type: ELineType.SEGMENT,
                        },
                        {
                            type: ELineType.SEGMENT,
                        },
                        {
                            type: ELineType.SEGMENT,
                        },
                    ],
                },
                {
                    id: random(1000000000, 10000000000).toString(),
                    plankFaceId: 0,
                    depth: 20,
                    fittingType: EFittingType.HARDWARE_GROOVE,
                    points: [
                        {
                            position: {
                                x: 1000,
                                y: 0,
                                z: 0,
                            },
                            type: EPointType.NONE,
                        },
                        {
                            position: {
                                x: 1000,
                                y: -500,
                                z: 0,
                            },
                            type: EPointType.NONE,
                        },
                        {
                            position: {
                                x: 700,
                                y: -500,
                                z: 0,
                            },
                            type: EPointType.NONE,
                        },
                        {
                            position: {
                                x: 700,
                                y: 0,
                                z: 0,
                            },
                            type: EPointType.NONE,
                        },
                    ],
                    lines: [
                        {
                            type: ELineType.CIRCLE_ARC,
                            radius: 180,
                            clockwise: true,
                            minorArc: true,
                        },
                        {
                            type: ELineType.SEGMENT,
                        },
                        {
                            type: ELineType.CIRCLE_ARC,
                            radius: 300,
                            clockwise: true,
                            minorArc: true,
                        },
                        {
                            type: ELineType.CIRCLE_ARC,
                            radius: 180,
                            clockwise: false,
                            minorArc: true,
                        },
                    ],
                },
            ],
        },
    };
};
