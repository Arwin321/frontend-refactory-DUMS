import { useEffect, useState } from 'react';
import { Card, Typography, Flex } from 'antd';
// import { ReactSVG } from 'react-svg';
import { setValSvg } from '../../components/Global/MqttConnection';
import { ReactSVG } from 'react-svg';
import filePathSvg from '../../assets/svg/test-new.svg';

const { Text } = Typography;

// const filePathSvg = '/src/assets/svg/test-new.svg';
const topicMqtt = 'PIU_GGCP/Devices/PB';

const SvgTest = () => {
    return (
        <>
            <Card>
                <Flex align="center" justify="center">
                    <Text strong style={{ fontSize: '30px' }}>
                        Example SVG Value By Mqtt
                    </Text>
                </Flex>
            </Card>
            <ReactSVG
                src={filePathSvg}
                beforeInjection={(svg) => {
                    setValSvg(topicMqtt, svg);
                }}
            />
        </>
    );
};

export default SvgTest;
