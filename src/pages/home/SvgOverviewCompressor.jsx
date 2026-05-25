import { useEffect, useState } from 'react';
import { Card, Typography, Flex } from 'antd';
import { setValSvg } from '../../components/Global/MqttConnection';
import SvgTemplate from './SvgTemplate';
import SvgViewer from './SvgViewer';
import filePathSvg from '../../assets/svg/overview-compressor.svg';

const { Text } = Typography;

// const filePathSvg = '/src/assets/svg/test-new.svg';
const topicMqtt = 'PIU_COD/COMPRESSOR/OVERVIEW';

const SvgOverviewCompressor = () => {
    return (
        <SvgTemplate>
            <SvgViewer filePathSvg={filePathSvg} topicMqtt={topicMqtt} setValSvg={setValSvg} />
        </SvgTemplate>
    );
};

export default SvgOverviewCompressor;
