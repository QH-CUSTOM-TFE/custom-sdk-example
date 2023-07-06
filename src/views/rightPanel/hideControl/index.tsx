import Button from 'antd/es/button';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import Paragraph from 'antd/es/typography/Paragraph';
import React, { memo, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { CustomModelService, FittingModelService } from '@manycore/custom-sdk';

import { getApplication } from '../../../core/app';

const modelService = getApplication().getService(CustomModelService);
const fittingModelService = getApplication().getService(FittingModelService);

function getAllModels() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [data, setData] = useState<string>('');

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        (async () => {
            const models = await modelService.getAllCustomModels();
            console.log('eder 获取所有模型', models);
            setData(JSON.stringify(models.map((m) => m.toJSON())));
        })();
    }, []);

    return data;
}
const HideControl = memo(function HideControl() {
    const [modelID, setModelId] = useState('');
    const [fittingID, setFittingID] = useState('');
    const allModels = getAllModels();
    const getModelByID = () => {
        if (!modelID) {
            return;
        }
        return modelService.getCustomModelById(modelID);
    };

    const toggleHideStatus = async () => {
        const model = await getModelByID();
        console.log('eder 切换指定模型显示隐藏', model);
        if (model) {
            model.setHidden(!model.getHidden());
            modelService.save({ models: [model] });
        } else {
            message.error('请输入正确的模型ID');
        }
    };

    const copyModelData = async () => {
        const model = await getModelByID();
        if (model) {
            const save = function (evt: any) {
                evt.clipboardData.setData('text/plain', model.serialize());
                evt.preventDefault();
            };
            document.addEventListener('copy', save);
            document.execCommand('copy');
            message.success('复制成功');
        } else {
            message.error('请输入正确的模型ID');
        }
    };

    const toggleFittingHideStatus = async () => {
        const fittings = await fittingModelService.getAllFittingModels(modelID);
        console.log('eder 所有五金孔槽', fittings);
        fittings.forEach((f) => {
            f.setHidden(!f.getHidden());
        });
        await fittingModelService.save({
            models: fittings,
        });
    };

    const toggleFittingHideStatusById = async () => {
        const fittings = await fittingModelService.getAllFittingModels();
        console.log('eder 所有五金孔槽', fittings);
        if (!fittingID) {
            message.error('请输入正确的五金孔槽ID');
            return;
        }
        const currentFittings = fittings.filter((f) => {
            return f.id === fittingID;
        });
        currentFittings.forEach((f) => {
            f.setHidden(!f.getHidden());
        });
        await fittingModelService.save({
            models: currentFittings,
        });
    };

    return (
        <div>
            <section>
                <Paragraph copyable={allModels ? { text: allModels } : false}>
                    复制所有模型序列化数据
                </Paragraph>
            </section>
            <section>
                <Input
                    value={modelID}
                    onChange={(evt) => {
                        setModelId(evt.target.value.trim());
                    }}
                    placeholder="模型ID"
                />
                <Button type="primary" style={{ margin: '10px 0' }} onClick={toggleHideStatus}>
                    切换指定模型显隐状态
                </Button>
                <Button type="primary" onClick={copyModelData}>
                    复制指定模型序列化数据
                </Button>
                <Button
                    type="primary"
                    style={{ margin: '10px 0' }}
                    onClick={toggleFittingHideStatus}
                >
                    切换模型关联的所有孔槽五金显隐状态
                </Button>

                <Input
                    value={fittingID}
                    onChange={(evt) => {
                        setFittingID(evt.target.value.trim());
                    }}
                    placeholder="五金孔槽ID"
                />
                <Button
                    type="primary"
                    style={{ margin: '10px 0' }}
                    onClick={toggleFittingHideStatusById}
                >
                    切换指定五金孔槽显隐状态
                </Button>
            </section>
        </div>
    );
});

export default connect((state) => ({
    selection: state.selection.selected,
}))(HideControl);
