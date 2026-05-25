import { useEffect, useState } from 'react';
import { Card, Typography, Flex } from 'antd';
import { useBreadcrumb } from '../../layout/LayoutBreadcrumb';

const { Text } = Typography;

const Home = () => {
    const { setBreadcrumbItems } = useBreadcrumb();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setBreadcrumbItems([
            {
                title: (
                    <Text strong style={{ fontSize: '14px' }}>
                        Dashboard
                    </Text>
                ),
            },
            {
                title: (
                    <Text strong style={{ fontSize: '14px' }}>
                        Home
                    </Text>
                ),
            },
        ]);
    }, []);

    return (
        <Card>
            <Flex align="center" justify="center">
                <Text strong style={{ fontSize: '30px' }}>
                    Welcome to DUMS
                </Text>
            </Flex>
        </Card>
    );
};

export default Home;