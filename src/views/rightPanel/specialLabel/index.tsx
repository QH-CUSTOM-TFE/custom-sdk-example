import { Button, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import {
    FittingHintService,
    ModelViewerSelectionV2Service
} from '@manycore/custom-sdk';

import { getApplication } from '../../../core/app';

const fittingHintService = getApplication().getService(FittingHintService );
const viewerSelectionV2Service = getApplication().getService(ModelViewerSelectionV2Service);
const inputLabelIds = new Set<string>();  //用特殊标识高亮的模型id（取消高亮后，对应的id从Set中去除）

// 监听/取消监听公用的函数——必须放在外面（不能放在startSelectListenOn等函数内部）
function onSelect(data) {
    console.log('【监听】选中数据:', data);
}

const SpecialLabel = React.memo(function () {
    const [inputLabelId, setInputLabelID] = React.useState('');
    const [inputCancelLabelId, setCancelLabelID] = React.useState('');

    const showSpecialLabelById = async () => {
        if (!inputLabelId) {
            message.error('请输入正确的五金孔槽ID');
            return;
        }
        let confs = {};  //用特殊标识高亮的所有配置
        inputLabelIds.add(inputLabelId);
        inputLabelIds.forEach(
            (element) => {
                confs[element] = {
                    outline: {
                        color: '#00a300',
                        opacity: 0.8
                    }
                };
            }
        );
        fittingHintService.setFittingHint(confs);
    };

    const cancelSpecialLabelById = async () => {
        if (!inputCancelLabelId) {
            message.error('请输入正确的五金孔槽ID');
            return;
        }
        inputLabelIds.delete(inputCancelLabelId);
        fittingHintService.clearFittingHint(inputCancelLabelId);
    };

    const cancelAllSpecialLabel = async () => {
        fittingHintService.clearFittingHint();
    };

    // 持续监听
    const startSelectListenOn = async () => {
        viewerSelectionV2Service.on(onSelect);
    };
    // 监听一次
    const startSelectListenOnce = async () => {
        viewerSelectionV2Service.once(onSelect);
    };
    // 取消监听
    const cancelSelectListen = async () => {
        viewerSelectionV2Service.off(onSelect);
    };

    return (
        <div>
            <section>
                <Input
                    value={inputLabelId}
                    onChange={(evt) => {
                        setInputLabelID(evt.target.value.trim());
                    }}
                    placeholder="五金孔槽ID"
                />
                <Button
                    type="primary"
                    style={{ margin: '10px 0 0' }}
                    onClick={showSpecialLabelById}
                >
                    展示指定孔槽特殊标识高亮
                </Button>

                <Input
                    style={{ margin: '20px 0 0' }}
                    value={inputCancelLabelId}
                    onChange={(evt) => {
                        setCancelLabelID(evt.target.value.trim());
                    }}
                    placeholder="五金孔槽ID"
                />
                <Button
                    type="primary"
                    style={{ margin: '10px 0 0' }}
                    onClick={cancelSpecialLabelById}
                >
                    取消指定孔槽特殊标识高亮
                </Button>
                <Button
                    type="primary"
                    style={{ margin: '10px 0 0' }}
                    onClick={cancelAllSpecialLabel}
                >
                    取消所有孔槽特殊标识高亮
                </Button>

                <Button
                    type="primary"
                    style={{ margin: '50px 0 0' }}
                    onClick={startSelectListenOn}
                >
                    开启持续监听选中模型
                </Button>
                <Button
                    type="primary"
                    style={{ margin: '10px 0 0'}}
                    onClick={startSelectListenOnce}
                >
                    开启监听一次选中模型
                </Button>
                <Button
                    type="primary"
                    style={{ margin: '10px 0 0' , width:'120px' }}
                    onClick={cancelSelectListen}
                >
                    关闭监听
                </Button>
            </section>
        </div>
    );
});

export default connect((state) => ({
    selection: state.selection.selected,
}))(SpecialLabel);
