import React from 'react';
import { Modal, Typography, Card, Row, Col, Avatar, Tag, Button, Space } from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    SendOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// Dummy data baru untuk user history
const getDummyUsers = (notification) => {
    if (!notification) return [];
    return [
        {
            id: '1',
            name: 'Budi Santoso',
            phone: '081234567890',
            status: 'delivered',
        },
        {
            id: '2',
            name: 'Citra Lestari',
            phone: '082345678901',
            status: 'sent',
        },
        {
            id: '3',
            name: 'Agus Wijaya',
            phone: '083456789012',
            status: 'failed',
        },
        {
            id: '4',
            name: 'Dewi Anggraini',
            phone: '084567890123',
            status: 'delivered',
        },
    ];
};

const UserHistoryModal = ({ visible, onCancel, notificationData }) => {
    const userData = getDummyUsers(notificationData);

    const getStatusTag = (status) => {
        switch (status) {
            case 'delivered':
                return (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Delivered
                    </Tag>
                );
            case 'sent':
                return (
                    <Tag icon={<SyncOutlined spin />} color="processing">
                        Sent
                    </Tag>
                );
            case 'failed':
                return <Tag color="error">Failed</Tag>;
            default:
                return <Tag color="default">{status}</Tag>;
        }
    };

    return (
        <Modal
            title={
                <Text strong style={{ fontSize: '18px' }}>
                    History User Notification
                </Text>
            }
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Close
                </Button>,
            ]}
            width={600}
            destroyOnClose
        >
            <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '8px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    {userData.map((user) => (
                        <Card key={user.id} size="small" style={{ width: '100%' }}>
                            <Row align="middle" justify="space-between">
                                <Col>
                                    <Space align="center">
                                        <Avatar size="large" icon={<UserOutlined />} />
                                        <div>
                                            <Text strong>{user.name}</Text>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                }}
                                            >
                                                <PhoneOutlined style={{ color: '#8c8c8c' }} />
                                                <Text type="secondary">{user.phone}</Text>
                                            </div>
                                        </div>
                                    </Space>
                                </Col>
                                <Col>
                                    <Space align="center" size="large">
                                        {getStatusTag(user.status)}
                                        <Button
                                            type="primary"
                                            icon={<SendOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log(`Resend to ${user.name}`);
                                            }}
                                        >
                                            Resend
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    ))}
                </Space>
            </div>
        </Modal>
    );
};

export default UserHistoryModal;
