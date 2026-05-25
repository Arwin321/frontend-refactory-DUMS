import { useEffect, useState } from 'react';
import { Card, Typography, Flex } from 'antd';
import { setValSvg } from '../../components/Global/MqttConnection';
import SvgTemplate from './SvgTemplate';
import SvgViewer from './SvgViewer';
import filePathSvg from '../../assets/svg/air_dryer_B_rev.svg';

const { Text } = Typography;

// const filePathSvg = '/src/assets/svg/air_dryer_B_rev.svg';
const topicMqtt = 'PIU_COD/AIR_DRYER/AIR_DRYER_B';

const SvgAirDryerB = () => {
    return (
        <SvgTemplate>
            <SvgViewer filePathSvg={filePathSvg} topicMqtt={topicMqtt} setValSvg={setValSvg} />
        </SvgTemplate>
    );
};

export default SvgAirDryerB;
