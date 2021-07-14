import { FittingDesignService, IFittingDesignData } from '@manycore/custom-sdk';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getApplication } from '../../../core/app';
import { FittingData } from '../fittingData';
import { message } from 'antd';

const text = '保存';
export interface IFittingDataWrapProps {
    fittingDesign?: IFittingDesignData | null;
}

export class FittingDataWrap extends PureComponent<IFittingDataWrapProps, any> {
    protected saveFittingData = async (value: IFittingDesignData) => {
        const fittingDesignService = getApplication().getService(FittingDesignService);
        await fittingDesignService.saveDesign(value);
        message.success('保存成功!');
    };

    protected clearFittingData = async () => {
        const fittingDesignService = getApplication().getService(FittingDesignService);
        await fittingDesignService.clearDesign();
        message.success('已清空数据!');
    };

    render() {
        const { fittingDesign } = this.props;

        return (
            <FittingData
                onClear={this.clearFittingData}
                onSave={this.saveFittingData}
                text={text}
                value={fittingDesign}
            />
        );
    }
}

export default connect((state) => {
    return {
        fittingDesign: state.selection.fullFittingDesign,
    };
})(FittingDataWrap);
