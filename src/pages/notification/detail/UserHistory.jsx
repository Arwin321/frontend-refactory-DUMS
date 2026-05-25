import React from 'react';
import { Button, Row, Col, Card, Badge, Typography, Space, Divider } from 'antd';
import {
    SendOutlined,
    MobileOutlined,
    CheckCircleFilled,
    ArrowLeftOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// Dummy data for user history
const userHistoryData = [
    {
        id: 1,
        name: 'John Doe',
        phone: '081234567890',
        status: 'Delivered',
        timestamp: '04-11-2025 11:40 WIB',
    },
    {
        id: 2,
        name: 'Jane Smith',
        phone: '087654321098',
        status: 'Delivered',
        timestamp: '04-11-2025 11:41 WIB',
    },
    {
        id: 3,
        name: 'Peter Jones',
        phone: '082345678901',
        status: 'Delivered',
        timestamp: '04-11-2025 11:42 WIB',
    },
];

const UserHistory = ({ notification, onBack }) => {
    return (
        <Card>
            <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
                <Col>
                    <Space align="center">
                        <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} />
                        <Typography.Title level={4} style={{ margin: 0 }}>
                            History User Notification
                        </Typography.Title>
                    </Space>
                    <Text type="secondary" style={{ marginLeft: '40px' }}>
                        {notification.title} - {notification.issue}
                    </Text>
                </Col>
            </Row>

            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                {userHistoryData.map((user) => (
                    <Card
                        key={user.id}
                        style={{ backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}
                    >
                        <Row align="middle" justify="space-between">
                            <Col>
                                <Space align="center">
                                    <Text strong>{user.name}</Text>
                                    <Text>|</Text>
                                    <Text>
                                        <MobileOutlined /> {user.phone}
                                    </Text>
                                    <Text>|</Text>
                                    <Badge status="success" text={user.status} />
                                </Space>
                                <Divider style={{ margin: '8px 0' }} />
                                <Space align="center">
                                    <CheckCircleFilled style={{ color: '#52c41a' }} />
                                    <Text type="secondary">
                                        Success Delivered at {user.timestamp}
                                    </Text>
                                </Space>
                            </Col>
                            <Col>
                                <Button type="primary" ghost icon={<SendOutlined />}>
                                    Resend
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                ))}
            </Space>
        </Card>
    );
};

export default UserHistory;
