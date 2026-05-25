import React from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

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

const LogHistoryCard = ({ notificationData }) => {
    const logHistoryData = getDummyLogHistory(notificationData);

    return (
        <Card 
            title="Log History" 
            size="small" 
            style={{ height: '100%' }}
        >
            <Table
                columns={columns}
                dataSource={logHistoryData}
                pagination={false} // Remove pagination entirely
                size="small"
                scroll={{ y: 200 }} // Use scroll for overflow, adjust height as needed
            />
        </Card>
    );
};

export default LogHistoryCard;
