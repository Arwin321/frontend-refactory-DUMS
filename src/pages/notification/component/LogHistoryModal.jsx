import React from 'react';
import { Modal, Table, Tag, Typography } from 'antd';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

// Dummy data untuk log history
const getDummyLogHistory = (notification) => {
    if (!notification) return [];
    return [
        {
            key: '1',
            timestamp: dayjs().subtract(2, 'hour').format('DD-MM-YYYY HH:mm:ss'),
            activity: 'Notification Created',
            details: `System generated a ${notification.type} notification for: ${notification.issue}`,
        },
        {
            key: '2',
            timestamp: dayjs().subtract(1, 'hour').format('DD-MM-YYYY HH:mm:ss'),
            activity: 'Notification Sent',
            details: 'Sent to 2 engineers',
        },
        {
            key: '3',
            timestamp: dayjs().subtract(30, 'minute').format('DD-MM-YYYY HH:mm:ss'),
            activity: 'Notification Read',
            details: 'Read by Engineer A',
        },
        {
            key: '4',
            timestamp: dayjs().subtract(5, 'minute').format('DD-MM-YYYY HH:mm:ss'),
            activity: 'Resend Triggered',
            details: 'Notification resent by Admin',
        },
    ];
};

const columns = [
    {
        title: 'Timestamp',
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (text) => (
            <span>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                {text}
            </span>
        ),
    },
    {
        title: 'Activity',
        dataIndex: 'activity',
        key: 'activity',
        render: (text) => {
            let color = 'blue';
            if (text.includes('Created')) {
                color = 'geekblue';
            } else if (text.includes('Sent')) {
                color = 'purple';
            } else if (text.includes('Read')) {
                color = 'green';
            } else if (text.includes('Triggered')) {
                color = 'orange';
            }
            return <Tag color={color}>{text.toUpperCase()}</Tag>;
        },
    },
    {
        title: 'Details',
        dataIndex: 'details',
        key: 'details',
    },
];

const LogHistoryModal = ({ visible, onCancel, notificationData }) => {
    const logHistoryData = getDummyLogHistory(notificationData);

    return (
        <Modal
            title={
                <Text strong>
                    Log History: <Text type="secondary">{notificationData?.title}</Text>
                </Text>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
            destroyOnClose
        >
            <Table
                columns={columns}
                dataSource={logHistoryData}
                pagination={{ pageSize: 5 }}
                style={{ marginTop: 24 }}
            />
        </Modal>
    );
};

export default LogHistoryModal;
