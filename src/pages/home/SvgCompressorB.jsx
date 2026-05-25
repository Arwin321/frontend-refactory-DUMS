import { useEffect, useState } from 'react';
import { Card, Typography, Flex } from 'antd';
import { setValSvg } from '../../components/Global/MqttConnection';
import SvgTemplate from './SvgTemplate';
import SvgViewer from './SvgViewer';
import filePathSvg from '../../assets/svg/compressorB_rev.svg';

const { Text } = Typography;
const topicMqtt = 'PIU_COD/COMPRESSOR/COMPRESSOR_B';

const SvgCompressorB = () => {
    return (
        <SvgTemplate>
            <SvgViewer filePathSvg={filePathSvg} topicMqtt={topicMqtt} setValSvg={setValSvg} />
        </SvgTemplate>
    );
};

export default SvgCompressorB;
