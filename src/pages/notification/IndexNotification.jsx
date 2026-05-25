import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreadcrumb } from '../../layout/LayoutBreadcrumb';
import { Typography, Row, Col } from 'antd';
import ListNotification from './component/ListNotification';
import DetailNotification from './component/DetailNotification';

const { Text } = Typography;

const IndexNotification = memo(function IndexNotification() {
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();
    const [selectedData, setSelectedData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setBreadcrumbItems([
                {
                    title: (
                        <Text strong style={{ fontSize: '14px' }}>
                            • Notification
                        </Text>
                    ),
                },
            ]);
        } else {
            navigate('/signin');
        }
    }, [navigate, setBreadcrumbItems]);

    const handleCloseDetail = () => {
        setSelectedData(null);
    };

    // This handler will be passed to ListNotification to update the selected item
    const handleSelectNotification = (data) => {
        setSelectedData(data);
    };

    return (
        <Row gutter={16}>
            <Col span={selectedData ? 16 : 24}>
                <ListNotification
                    // The setActionMode is likely not needed anymore,
                    // but we pass the selection handler
                    setActionMode={() => {}} // Keep prop for safety, but can be empty
                    setSelectedData={handleSelectNotification}
                />
            </Col>
            {selectedData && (
                <Col span={8}>
                    <DetailNotification
                        selectedData={selectedData}
                        onClose={handleCloseDetail}
                    />
                </Col>
            )}
        </Row>
    );
});

export default IndexNotification;
