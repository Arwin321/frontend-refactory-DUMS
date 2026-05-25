import React, { memo, useState, useEffect } from 'react';
import {
    Button,
    Row,
    Col,
    Card,
    Badge,
    Input,
    Typography,
    Space,
    Divider,
    Modal,
    Tag,
    message,
    Spin,
    Pagination,
} from 'antd';
import {
    CloseCircleFilled,
    WarningFilled,
    CheckCircleFilled,
    InfoCircleFilled,
    ClockCircleOutlined,
    EnvironmentOutlined,
    LinkOutlined,
    SendOutlined,
    MailOutlined,
    UserOutlined,
    HistoryOutlined,
    EyeOutlined,
    MobileOutlined,
    CloseOutlined,
    BookOutlined,
    ToolOutlined,
    FilePdfOutlined,
    PlusOutlined,
    ExclamationCircleOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    getAllNotification,
    getNotificationLogByNotificationId,
    getNotificationDetail,
    resendChatByUser,
    resendChatAllUser,
    searchData,
} from '../../../api/notification';
import { onNotifUpdate } from '../../../components/Global/MqttConnection';

const { Text, Paragraph, Link: AntdLink } = Typography;
const OpenMail = ({ size = 22, color = 'black' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 640"
        width={size}
        height={size}
        fill={color}
    >
        <path d="M576 480C576 515.3 547.5 544 512.1 544L128 544C92.6 544 64 515.3 64 480L64 228C64.1 212.5 71.8 198 84.5 189.2L270 61.3C300.1 40.6 339.8 40.6 369.9 61.3L555.5 189.2C568.3 198 575.9 212.5 576 228L576 480zM128 496L512.1 496C520.9 496 528 488.9 528 480L528 288.3L373.2 405.7C341.8 429.6 298.3 429.6 266.8 405.7L112 288.3L112 480C112 488.9 119.2 496 128 496zM527.6 228.4L342.7 100.8C329 91.4 311 91.4 297.3 100.8L112.4 228.4L295.8 367.5C310.1 378.3 329.9 378.3 344.2 367.5L527.6 228.4z" />
    </svg>
);
// Transform API response to component format
const transformNotificationData = (apiData) => {
    return apiData.map((item, index) => ({
        id: `notification-${item.notification_error_id}-${index}`, // Unique key prefix with array index
        type: item.is_read ? 'resolved' : item.is_delivered ? 'warning' : 'critical',
        title: item.error_code_name || 'Unknown Error',
        color: item.error_code_color || 'Black',
        issue: item.error_code || item.error_code_name || 'Unknown Error',
        description: `${item.error_code} - ${item.error_code_name || ''}`,
        timestamp: item.created_at
            ? new Date(item.created_at).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              }) + ' WIB'
            : 'N/A',
        location: item.plant_sub_section_name || item.device_location || 'Location not specified',
        details: item.device_name || '-',
        errId: item.notification_error_id || 0,
        link: `/verification-sparepart/${item.notification_error_id}`, // Dummy URL untuk verifikasi spare part
        subsection: item.plant_sub_section_name || 'N/A',
        isRead: item.is_read,
        status: item.is_read ? 'Resolved' : item.is_delivered ? 'Delivered' : 'Pending',
        tag: item.error_code,
        errorCode: item.error_code,
        solutionName: item.error_code?.solution?.[0]?.solution_name || 'N/A',
        typeSolution: item.error_code?.solution?.[0]?.type_solution || 'N/A',
        pathSolution:
            item.error_code?.solution?.[0]?.path_document ||
            item.error_code?.solution?.[0]?.path_solution ||
            'N/A',
        error_code: item.error_code,
    }));
};

const ListNotification = memo(function ListNotification(props) {
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [notifTrigger, setNotifTrigger] = useState(0);
    const [loading, setLoading] = useState(false);
    const [modalContent, setModalContent] = useState(null); // 'user', 'log', 'details', or null
    const [isAddingLog, setIsAddingLog] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [logHistoryData, setLogHistoryData] = useState([]);
    const [logLoading, setLogLoading] = useState(false);
    const [userHistoryData, setUserHistoryData] = useState([]);
    const [userLoading, setUserLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        current_limit: 10,
        total_limit: 0,
        total_page: 1,
    });
    const navigate = useNavigate();

    // Fetch notifications from API
    const fetchNotifications = async (page = 1, limit = 10, isRead = null) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (isRead !== null) {
                queryParams.append('is_read', isRead.toString());
            }

            const response = await getAllNotification(queryParams);
            if (response && response.data) {
                const transformedData = transformNotificationData(response.data);
                setNotifications(transformedData);

                // Update pagination with API response or calculate from data
                if (response.paging) {
                    setPagination({
                        current_page: response.paging.current_page || page,
                        current_limit: response.paging.current_limit || limit,
                        total_limit: response.paging.total_limit || transformedData.length,
                        total_page:
                            response.paging.total_page || Math.ceil(transformedData.length / limit),
                    });
                } else {
                    // Fallback: calculate pagination from data
                    const totalItems = transformedData.length;
                    setPagination((prev) => ({
                        ...prev,
                        current_page: page,
                        current_limit: limit,
                        total_limit: totalItems,
                        total_page: Math.ceil(totalItems / limit),
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 500);
        }
    };

    const handlePaginationChange = (page, pageSize) => {
        setPagination((prev) => ({
            ...prev,
            current_page: page,
            current_limit: pageSize,
        }));

        // Fetch notifications with new pagination
        const isReadFilter = activeTab === 'read' ? 1 : activeTab === 'unread' ? 0 : null;
        fetchNotifications(page, pageSize, isReadFilter);
    };

    useEffect(() => {
        onNotifUpdate(() => {
            setNotifTrigger((prev) => prev + 1);
        });
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }

        // Fetch notifications on component mount and when tab changes
        const isReadFilter = activeTab === 'read' ? 1 : activeTab === 'unread' ? 0 : null;
        fetchNotifications(pagination.current_page, pagination.current_limit, isReadFilter);
    }, [activeTab, notifTrigger]);

    const getIconAndColor = (type) => {
        switch (type) {
            case 'critical':
                return { IconComponent: MailOutlined, color: '#faad14', bgColor: '#fff1f0' };
            case 'warning':
                return { IconComponent: MailOutlined, color: '#1890ff', bgColor: '#fffbe6' };
            case 'resolved':
                return { IconComponent: MailOutlined, color: '#52c41a', bgColor: '#f6ffed' };
            default:
                return { IconComponent: MailOutlined, color: '#1890ff', bgColor: '#e6f7ff' };
        }
    };

    const handleResend = (notification) => {
        Modal.confirm({
            title: 'Confirm Resend',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to resend the notification for "${notification.title}"?`,
            okText: 'Resend',
            cancelText: 'Cancel',
            async onOk() {
                console.log('Resending notification:', notification.id);
                await resendChatAllUser(notification.errId);
                message.success(
                    `Notification for "${notification.title}" has been resent successfully.`
                );
            },
            onCancel() {
                console.log('Resend cancelled');
            },
        });
    };

    const handleMarkAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, isRead: true, type: 'resolved', status: 'Resolved' } : n
            )
        );
    };

    const fetchSearch = async (data) => {
        setLoading(true);
        try {
            const response = await searchData(data);
            if (response && response.data) {
                const transformedData = transformNotificationData(response.data);
                setNotifications(transformedData);

                // Update pagination with API response or calculate from data
                if (response.paging) {
                    setPagination({
                        current_page: response.paging.current_page || page,
                        current_limit: response.paging.current_limit || limit,
                        total_limit: response.paging.total_limit || transformedData.length,
                        total_page:
                            response.paging.total_page || Math.ceil(transformedData.length / limit),
                    });
                } else {
                    // Fallback: calculate pagination from data
                    const totalItems = transformedData.length;
                    setPagination((prev) => ({
                        ...prev,
                        current_page: page,
                        current_limit: limit,
                        total_limit: totalItems,
                        total_page: Math.ceil(totalItems / limit),
                    }));
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchSearch(searchValue);
    };

    const handleSearchClear = () => {
        setSearchValue('');
        fetchSearch('');
    };

    const getUnreadCount = () => notifications.filter((n) => !n.isRead).length;

    // Filter notifications based on search term
    const getFilteredNotifications = () => {
        if (!searchTerm) return notifications;
        // Search by title and error code name
        return notifications.filter((n) => {
            const searchableText = `${n.title} ${n.issue}`.toLowerCase();
            return searchableText.includes(searchTerm.toLowerCase());
        });
    };

    // Fetch log history from API
    const fetchLogHistory = async (notificationId) => {
        try {
            setLogLoading(true);
            const response = await getNotificationLogByNotificationId(notificationId);
            if (response && response.data) {
                // Transform API data to component format
                const transformedLogs = response.data.map((log) => ({
                    id: log.notification_error_log_id,
                    timestamp: log.created_at
                        ? new Date(log.created_at).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                          }) + ' WIB'
                        : 'N/A',
                    addedBy: {
                        name: log.contact_name || 'Unknown',
                        phone: log.contact_phone || 'N/A',
                    },
                    description: log.notification_error_log_description || '',
                }));
                setLogHistoryData(transformedLogs);
            }
        } catch (err) {
            console.error('Error fetching log history:', err);
            setLogHistoryData([]); // Set empty array on error
        } finally {
            setLogLoading(false);
        }
    };

    // Fetch user history from API
    const fetchUserHistory = async (notificationId) => {
        try {
            setUserLoading(true);

            const response = await getNotificationDetail(notificationId);

            if (response && response.data && response.data.users) {
                // Transform API data to component format
                const transformedUsers = response.data.users.map((user) => ({
                    id: user.notification_error_user_id.toString(),
                    name: user.contact_name,
                    phone: user.contact_phone,
                    status: user.is_send ? 'Delivered' : 'Pending',
                    timestamp: user.updated_at
                        ? new Date(user.updated_at)
                              .toLocaleString('id-ID', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                              })
                              .replace('.', ':') + ' WIB'
                        : 'N/A',
                }));
                setUserHistoryData(transformedUsers);
            } else {
                setUserHistoryData([]);
            }
        } catch (err) {
            console.error('Error fetching user history:', err);
            setUserHistoryData([]); // Set empty array on error
        } finally {
            setUserLoading(false);
        }
    };

    const tabButtonStyle = (isActive) => ({
        padding: '12px 16px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        color: isActive ? '#FF6B35' : '#595959',
        borderBottom: isActive ? '2px solid #FF6B35' : '2px solid transparent',
        marginBottom: '-1px',
        transition: 'all 0.3s',
    });

    const renderDeviceNotifications = () => {
        const filteredNotifications = getFilteredNotifications();
        return (
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                {filteredNotifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                        Tidak ada notifikasi
                    </div>
                ) : (
                    filteredNotifications.map((notification) => {
                        const { IconComponent, color, bgColor } = getIconAndColor(
                            notification.type
                        );
                        return (
                            <Card
                                key={notification.id}
                                style={{
                                    backgroundColor: notification.isRead ? '#ffffff' : '#f6f9ff',
                                    borderColor: notification.isRead ? '#f0f0f0' : '#d6e4ff',
                                    cursor: 'pointer',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '16px',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: bgColor,
                                            color: color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '22px',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {notification.type === 'resolved' ? (
                                            <OpenMail size={28.5} color={color} />
                                        ) : (
                                            <IconComponent style={{ fontSize: '22px' }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Row align="top">
                                            <Col flex="220px">
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                    }}
                                                >
                                                    <div>
                                                        <Text strong>{notification.title}</Text>
                                                        <div style={{ marginTop: '4px' }}>
                                                            <Text
                                                                style={{
                                                                    color: notification.color,
                                                                }}
                                                            >
                                                                Error Code {notification.issue}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                    {!notification.isRead && (
                                                        <Badge
                                                            color="red"
                                                            status="processing"
                                                            style={{
                                                                marginLeft: '8px',
                                                                marginTop: '4px',
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </Col>
                                            <Col flex="auto">
                                                {/* <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                        alignItems: 'flex-start',
                                                        marginBottom: '12px',
                                                    }}
                                                >
                                                    <MailOutlined
                                                        style={{
                                                            marginTop: '4px',
                                                            color: '#1890ff',
                                                        }}
                                                    />
                                                    <Paragraph
                                                        style={{
                                                            color: '#595959',
                                                            margin: 0,
                                                            flex: 1,
                                                        }}
                                                    >
                                                        {notification.details}
                                                    </Paragraph>
                                                </div> */}
                                                <Space
                                                    direction="vertical"
                                                    size={4}
                                                    style={{ fontSize: '13px', color: '#8c8c8c' }}
                                                >
                                                    <Space>
                                                        <MobileOutlined />
                                                        <Text type="secondary">
                                                            {notification.details}
                                                        </Text>
                                                    </Space>
                                                    <Space>
                                                        <ClockCircleOutlined />
                                                        <Text type="secondary">
                                                            {notification.timestamp}
                                                        </Text>
                                                    </Space>
                                                    <Space>
                                                        <EnvironmentOutlined />
                                                        <Text type="secondary">
                                                            {notification.location}
                                                        </Text>
                                                    </Space>
                                                    <Space>
                                                        <Button
                                                            type="link"
                                                            icon={<SendOutlined />}
                                                            style={{ paddingLeft: '0px' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleResend(notification);
                                                            }}
                                                        >
                                                            Resend
                                                        </Button>
                                                    </Space>
                                                </Space>
                                            </Col>
                                            <Col
                                                flex="120px"
                                                style={{ textAlign: 'center' }}
                                                align="bottom"
                                            >
                                                <Space
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        height: '100%',
                                                    }}
                                                >
                                                    <Button
                                                        type="text"
                                                        icon={
                                                            <UserOutlined
                                                                style={{ color: '#1890ff' }}
                                                            />
                                                        }
                                                        title="User History"
                                                        style={{
                                                            border: '1px solid #1890ff',
                                                            borderRadius: '4px',
                                                        }}
                                                        onClick={async (e) => {
                                                            e.stopPropagation();

                                                            setSelectedNotification(notification);

                                                            // Extract notification ID from the notification object
                                                            const notificationId =
                                                                notification.id.split('-')[1];

                                                            // Fetch user history for the selected notification
                                                            await fetchUserHistory(notificationId);

                                                            setModalContent('user');
                                                        }}
                                                    />
                                                    <RouterLink
                                                        to={`/notification-detail/${
                                                            notification.id.split('-')[1]
                                                        }`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Button
                                                            type="text"
                                                            icon={
                                                                <EyeOutlined
                                                                    style={{ color: '#1890ff' }}
                                                                />
                                                            }
                                                            title="Details"
                                                            style={{
                                                                border: '1px solid #1890ff',
                                                                borderRadius: '4px',
                                                            }}
                                                        />
                                                    </RouterLink>
                                                    <Button
                                                        type="text"
                                                        icon={
                                                            <HistoryOutlined
                                                                style={{ color: '#1890ff' }}
                                                            />
                                                        }
                                                        title="Log History"
                                                        style={{
                                                            border: '1px solid #1890ff',
                                                            borderRadius: '4px',
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            // Set the selected notification for the log history
                                                            const notificationId =
                                                                notification.id.split('-')[1];
                                                            setSelectedNotification(notification);

                                                            // Fetch log history for the selected notification
                                                            fetchLogHistory(notificationId);

                                                            setModalContent('log');
                                                        }}
                                                    />
                                                </Space>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </Space>
        );
    };

    const renderUserHistory = () => (
        <>
            {userLoading ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                    {userHistoryData.map((user) => (
                        <Card key={user.id} style={{ borderColor: '#91d5ff' }}>
                            <Row align="middle" justify="space-between">
                                <Col>
                                    <Space align="center">
                                        <Text strong>{user.name}</Text>
                                        <Text>|</Text>
                                        <Text>
                                            <MobileOutlined /> {user.phone}
                                        </Text>
                                        <Text>|</Text>
                                        <Badge
                                            status={
                                                user.status === 'Delivered' ? 'success' : 'default'
                                            }
                                            text={user.status}
                                        />
                                    </Space>
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Space align="center">
                                        {user.status === 'Delivered' ? (
                                            <CheckCircleFilled style={{ color: '#52c41a' }} />
                                        ) : (
                                            <ClockCircleOutlined style={{ color: '#faad14' }} />
                                        )}
                                        <Text type="secondary">
                                            {user.status === 'Delivered'
                                                ? 'Success Delivered at'
                                                : 'Status '}{' '}
                                            {user.timestamp}
                                        </Text>
                                    </Space>
                                </Col>
                                <Col>
                                    <Button
                                        type="primary"
                                        ghost
                                        icon={<SendOutlined />}
                                        onClick={async () => {
                                            await resendChatByUser(user.id, user.phone);
                                        }}
                                    >
                                        Resend
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                    ))}
                    {userHistoryData.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '24px', color: '#8c8c8c' }}>
                            No user history available
                        </div>
                    )}
                </Space>
            )}
        </>
    );

    const renderLogHistory = () => (
        <>
            {logLoading ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                    <Spin size="large" />
                </div>
            ) : logHistoryData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#8c8c8c' }}>
                    Tidak ada log history
                </div>
            ) : (
                <div
                    style={{
                        height: '400px',
                        overflowY: 'auto',
                        padding: '0 16px',
                        position: 'relative',
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                    }}
                >
                    <div style={{ position: 'relative' }}>
                        {/* Garis vertikal yang menyambung */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '7px',
                                left: '23px',
                                bottom: '7px',
                                width: '2px',
                                backgroundColor: '#91d5ff',
                                zIndex: 0,
                            }}
                        ></div>

                        {logHistoryData.map((log, index) => (
                            <Row
                                key={log.id}
                                wrap={false}
                                style={{ marginBottom: '16px', position: 'relative', zIndex: 1 }}
                            >
                                {/* Kolom Kiri: Branch/Timeline */}
                                <Col
                                    style={{
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        marginRight: '16px',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '14px',
                                            height: '14px',
                                            backgroundColor: '#fff',
                                            border: '3px solid #1890ff',
                                            borderRadius: '50%',
                                            zIndex: 1,
                                            flexShrink: 0,
                                        }}
                                    ></div>
                                </Col>

                                {/* Kolom Kanan: Card */}
                                <Col flex="auto">
                                    <Card size="small" style={{ borderColor: '#91d5ff' }}>
                                        <Row gutter={[16, 8]} align="top">
                                            <Col xs={24} md={10}>
                                                <Space direction="vertical" size={4}>
                                                    <Space>
                                                        <ClockCircleOutlined />
                                                        <Text
                                                            type="secondary"
                                                            style={{ fontSize: '12px' }}
                                                        >
                                                            Added at {log.timestamp}
                                                        </Text>
                                                    </Space>

                                                    <div>
                                                        <Text strong>{log.addedBy.name}</Text>
                                                    </div>

                                                    <div>
                                                        <span
                                                            style={{
                                                                border: '1px solid #52c41a',
                                                                color: '#52c41a',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                            }}
                                                        >
                                                            <MobileOutlined /> {log.addedBy.phone}
                                                        </span>
                                                    </div>
                                                </Space>
                                            </Col>
                                            <Col xs={24} md={14}>
                                                <Text strong>Description:</Text>
                                                <Paragraph
                                                    style={{
                                                        color: '#595959',
                                                        margin: 0,
                                                        fontSize: '13px',
                                                    }}
                                                >
                                                    {log.description}
                                                </Paragraph>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    const renderDetailsNotification = () => {
        if (!selectedNotification) return null;

        const { IconComponent, color } = getIconAndColor(selectedNotification.type);

        return (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Row gutter={[16, 8]}>
                    {/* Kolom Kiri: Data Kompresor */}
                    <Col span={12}>
                        <Card
                            title=""
                            size="small"
                            style={{ height: '100%', borderColor: '#d4380d' }}
                            bodyStyle={{ padding: '12px' }}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Row gutter={16} align="middle">
                                    <Col>
                                        <div
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundColor: '#d4380d',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#ffffff',
                                                fontSize: '18px',
                                            }}
                                        >
                                            <CloseOutlined />
                                        </div>
                                    </Col>
                                    <Col>
                                        <Text>{selectedNotification.title}</Text>
                                        <div style={{ marginTop: '2px' }}>
                                            <Text strong style={{ fontSize: '16px' }}>
                                                {selectedNotification.issue}
                                            </Text>
                                        </div>
                                    </Col>
                                </Row>
                                <div>
                                    <Text strong>Plant Subsection</Text>
                                    <div>{selectedNotification.subsection}</div>
                                    <Text strong style={{ display: 'block', marginTop: '8px' }}>
                                        Date & Time
                                    </Text>
                                    <div>{selectedNotification.timestamp}</div>
                                </div>

                                <div
                                    style={{
                                        border: '1px solid #d4380d',
                                        borderRadius: '4px',
                                        padding: '8px',
                                        background: 'linear-gradient(to right, #ffe7e6, #ffffff)',
                                    }}
                                >
                                    <Row justify="space-around" align="middle">
                                        <Col>
                                            <Text style={{ fontSize: '12px', color: color }}>
                                                Value
                                            </Text>
                                            <div
                                                style={{
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    color: color,
                                                }}
                                            >
                                                N/A
                                            </div>
                                        </Col>
                                        <Col>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                Treshold
                                            </Text>
                                            <div style={{ fontWeight: 500 }}>N/A</div>
                                        </Col>
                                    </Row>
                                </div>
                            </Space>
                        </Card>
                    </Col>

                    {/* Kolom Kanan: Informasi Teknis */}
                    <Col span={12}>
                        <Card title="Informasi Teknis" size="small" style={{ height: '100%' }}>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div>
                                    <Text strong>PLC</Text>
                                    <div>{selectedNotification.plc}</div>
                                </div>
                                <div>
                                    <Text strong>Status</Text>
                                    <div style={{ color: '#faad14', fontWeight: 500 }}>
                                        {selectedNotification.status}
                                    </div>
                                </div>
                                <div>
                                    <Text strong>Tag</Text>
                                    <div
                                        style={{
                                            fontFamily: 'monospace',
                                            backgroundColor: '#f0f0f0',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                        }}
                                    >
                                        {selectedNotification.tag}
                                    </div>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>
                <div>
                    <Row gutter={[16, 8]}>
                        <Col span={8}>
                            <Card
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                                bodyStyle={{ padding: '12px' }}
                            >
                                <Space>
                                    <BookOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                                    <Text strong style={{ fontSize: '16px', color: '#262626' }}>
                                        Handling Guideline
                                    </Text>
                                </Space>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                                bodyStyle={{ padding: '12px' }}
                            >
                                <Space>
                                    <ToolOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                                    <Text strong style={{ fontSize: '16px', color: '#262626' }}>
                                        Spare Part
                                    </Text>
                                </Space>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                                bodyStyle={{ padding: '12px' }}
                                onClick={() => {
                                    // Set the selected notification for the log history if not already set
                                    if (selectedNotification) {
                                        const notificationId =
                                            selectedNotification.id.split('-')[1];
                                        // Fetch log history for the selected notification
                                        fetchLogHistory(notificationId);
                                    }
                                    setModalContent('log');
                                }}
                            >
                                <Space>
                                    <HistoryOutlined
                                        style={{ fontSize: '16px', color: '#1890ff' }}
                                    />
                                    <Text strong style={{ fontSize: '16px', color: '#262626' }}>
                                        Log Activity
                                    </Text>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} style={{ marginTop: '0' }}>
                        <Col span={8}>
                            <Card size="small" style={{ height: '100%' }}>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Card
                                        size="small"
                                        bodyStyle={{ padding: '8px 12px' }}
                                        hoverable
                                        extra={
                                            <Text type="secondary" style={{ fontSize: '10px' }}>
                                                PDF
                                            </Text>
                                        }
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div>
                                                <Text
                                                    style={{ fontSize: '12px', color: '#262626' }}
                                                >
                                                    <FilePdfOutlined
                                                        style={{ marginRight: '8px' }}
                                                    />{' '}
                                                    Error 303.pdf
                                                </Text>
                                                <Link
                                                    href="#"
                                                    target="_blank"
                                                    style={{ fontSize: '12px', display: 'block' }}
                                                >
                                                    lihat disini
                                                </Link>
                                            </div>
                                        </div>
                                    </Card>
                                    <Card
                                        size="small"
                                        bodyStyle={{ padding: '8px 12px' }}
                                        hoverable
                                        extra={
                                            <Text type="secondary" style={{ fontSize: '10px' }}>
                                                PDF
                                            </Text>
                                        }
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div>
                                                <Text
                                                    style={{ fontSize: '12px', color: '#262626' }}
                                                >
                                                    <FilePdfOutlined
                                                        style={{ marginRight: '8px' }}
                                                    />{' '}
                                                    Error 303.pdf
                                                </Text>
                                                <Link
                                                    href="#"
                                                    target="_blank"
                                                    style={{ fontSize: '12px', display: 'block' }}
                                                >
                                                    lihat disini
                                                </Link>
                                            </div>
                                        </div>
                                    </Card>
                                    <Card
                                        size="small"
                                        bodyStyle={{ padding: '8px 12px' }}
                                        hoverable
                                        extra={
                                            <Text type="secondary" style={{ fontSize: '10px' }}>
                                                PDF
                                            </Text>
                                        }
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div>
                                                <Text
                                                    style={{ fontSize: '12px', color: '#262626' }}
                                                >
                                                    <FilePdfOutlined
                                                        style={{ marginRight: '8px' }}
                                                    />{' '}
                                                    Error 303.pdf
                                                </Text>
                                                <Link
                                                    href="#"
                                                    target="_blank"
                                                    style={{ fontSize: '12px', display: 'block' }}
                                                >
                                                    lihat disini
                                                </Link>
                                            </div>
                                        </div>
                                    </Card>
                                    <Card
                                        size="small"
                                        bodyStyle={{ padding: '8px 12px' }}
                                        extra={
                                            <Text type="secondary" style={{ fontSize: '10px' }}>
                                                Text
                                            </Text>
                                        }
                                    >
                                        <Paragraph style={{ fontSize: '12px', margin: 0 }}>
                                            <Text strong>Error 303:</Text> Sensor suhu tidak
                                            merespon. Lakukan reset manual pada panel kontrol.
                                        </Paragraph>
                                    </Card>
                                </Space>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" style={{ height: '100%' }}>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Card size="small" bodyStyle={{ padding: '12px' }} hoverable>
                                        <Row gutter={16} align="top">
                                            <Col span={7} style={{ textAlign: 'center' }}>
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        height: '60px',
                                                        backgroundColor: '#f0f0f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '4px',
                                                        marginBottom: '8px',
                                                    }}
                                                >
                                                    <ToolOutlined
                                                        style={{
                                                            fontSize: '24px',
                                                            color: '#bfbfbf',
                                                        }}
                                                    />
                                                </div>
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#52c41a',
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    Available
                                                </Text>
                                            </Col>
                                            <Col span={17}>
                                                <Space
                                                    direction="vertical"
                                                    size={4}
                                                    style={{ width: '100%' }}
                                                >
                                                    <Text strong>Air Filter</Text>
                                                    <Paragraph
                                                        style={{
                                                            fontSize: '12px',
                                                            margin: 0,
                                                            color: '#595959',
                                                        }}
                                                    >
                                                        Filters incoming air to remove dust and
                                                        impurities before compression.
                                                    </Paragraph>
                                                    <div
                                                        style={{
                                                            border: '1px solid #d9d9d9',
                                                            borderRadius: '4px',
                                                            padding: '4px 8px',
                                                            fontSize: '11px',
                                                            color: '#8c8c8c',
                                                            marginTop: '8px',
                                                        }}
                                                    >
                                                        Part No: AF-2024-X2 | Condition: New |
                                                        Compatible with Model XR-60
                                                    </div>
                                                </Space>
                                            </Col>
                                        </Row>
                                    </Card>
                                    <Card size="small" bodyStyle={{ padding: '12px' }} hoverable>
                                        <Row gutter={16} align="top">
                                            <Col span={7} style={{ textAlign: 'center' }}>
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        height: '60px',
                                                        backgroundColor: '#f0f0f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '4px',
                                                        marginBottom: '8px',
                                                    }}
                                                >
                                                    <ToolOutlined
                                                        style={{
                                                            fontSize: '24px',
                                                            color: '#bfbfbf',
                                                        }}
                                                    />
                                                </div>
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#ff4d4f',
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    Not Available
                                                </Text>
                                            </Col>
                                            <Col span={17}>
                                                <Space
                                                    direction="vertical"
                                                    size={4}
                                                    style={{ width: '100%' }}
                                                >
                                                    <Text strong>Compressor Oil</Text>
                                                    <Paragraph
                                                        style={{
                                                            fontSize: '12px',
                                                            margin: 0,
                                                            color: '#595959',
                                                        }}
                                                    >
                                                        Special synthetic oil to lubricate and cool
                                                        down the compressor unit.
                                                    </Paragraph>
                                                    <div
                                                        style={{
                                                            border: '1px solid #d9d9d9',
                                                            borderRadius: '4px',
                                                            padding: '4px 8px',
                                                            fontSize: '11px',
                                                            color: '#8c8c8c',
                                                            marginTop: '8px',
                                                        }}
                                                    >
                                                        Part No: OL-SYN-550 | Condition: New |
                                                        Compatible with Model XR-60
                                                    </div>
                                                </Space>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Space>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" style={{ height: '100%' }}>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Card
                                        size="small"
                                        bodyStyle={{
                                            padding: '8px 12px',
                                            backgroundColor: isAddingLog ? '#fafafa' : '#fff',
                                        }}
                                    >
                                        <Space
                                            direction="vertical"
                                            style={{ width: '100%' }}
                                            size="small"
                                        >
                                            {isAddingLog && (
                                                <>
                                                    <Text strong style={{ fontSize: '12px' }}>
                                                        Add New Log / Update Progress
                                                    </Text>
                                                    <Input.TextArea
                                                        rows={2}
                                                        placeholder="Tuliskan update penanganan di sini..."
                                                    />
                                                </>
                                            )}
                                            <Button
                                                type={isAddingLog ? 'primary' : 'dashed'}
                                                size="small"
                                                block
                                                icon={!isAddingLog && <PlusOutlined />}
                                                onClick={() => setIsAddingLog(!isAddingLog)}
                                            >
                                                {isAddingLog ? 'Submit Log' : 'Add Log'}
                                            </Button>
                                        </Space>
                                    </Card>
                                    {logLoading ? (
                                        <div style={{ textAlign: 'center', padding: '12px' }}>
                                            <Spin size="small" />
                                        </div>
                                    ) : logHistoryData.length === 0 ? (
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                padding: '12px',
                                                color: '#8c8c8c',
                                            }}
                                        >
                                            Tidak ada log history
                                        </div>
                                    ) : (
                                        logHistoryData.map((log) => (
                                            <Card
                                                key={log.id}
                                                size="small"
                                                bodyStyle={{ padding: '8px 12px' }}
                                            >
                                                <Paragraph
                                                    style={{ fontSize: '12px', margin: 0 }}
                                                    ellipsis={{ rows: 2 }}
                                                >
                                                    <Text strong>{log.addedBy.name}:</Text>{' '}
                                                    {log.description}
                                                </Paragraph>
                                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                                    {log.timestamp}
                                                </Text>
                                            </Card>
                                        ))
                                    )}
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Space>
        );
    };

    return (
        <React.Fragment>
            <Card>
                <Row>
                    <Col xs={24}>
                        <h2
                            style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                margin: '0 0 4px 0',
                                color: '#262626',
                            }}
                        >
                            Notification
                        </h2>
                        <p style={{ margin: '0 0 16px 0', color: '#8c8c8c', fontSize: '14px' }}>
                            Riwayat notifikasi yang dikirim ke engineer
                        </p>

                        <Row justify="space-between" align="middle" gutter={[8, 8]}>
                            <Col xs={24} sm={24} md={12} lg={12}>
                                <Input.Search
                                    placeholder="Search by notification name or error code name..."
                                    value={searchValue}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchValue(value);
                                        if (value === '') {
                                            handleSearchClear();
                                        }
                                    }}
                                    onSearch={handleSearch}
                                    allowClear={{
                                        clearIcon: <span onClick={handleSearchClear}>✕</span>,
                                    }}
                                    enterButton={
                                        <Button
                                            type="primary"
                                            icon={<SearchOutlined />}
                                            style={{
                                                backgroundColor: '#23A55A',
                                                borderColor: '#23A55A',
                                            }}
                                        >
                                            Search
                                        </Button>
                                    }
                                    size="large"
                                />
                            </Col>
                        </Row>
                        <div style={{ borderBottom: '1px solid #f0f0f0', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setActiveTab('all')}
                                    style={tabButtonStyle(activeTab === 'all')}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveTab('unread')}
                                    style={{
                                        ...tabButtonStyle(activeTab === 'unread'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    Not read yet
                                    {getUnreadCount() > 0 && (
                                        <Badge
                                            count={getUnreadCount()}
                                            style={{ backgroundColor: '#ff4d4f' }}
                                        />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('read')}
                                    style={tabButtonStyle(activeTab === 'read')}
                                >
                                    Already read
                                </button>
                            </div>
                        </div>

                        <Spin spinning={loading}>{renderDeviceNotifications()}</Spin>

                        {/* PAGINATION */}
                        <Row justify="space-between" align="middle" style={{ marginTop: '16px' }}>
                            <Col>
                                <div>
                                    Menampilkan {pagination.current_limit} data halaman{' '}
                                    {pagination.current_page} dari total {pagination.total_limit}{' '}
                                    data
                                </div>
                            </Col>
                            <Col>
                                <Pagination
                                    showSizeChanger
                                    onChange={handlePaginationChange}
                                    onShowSizeChange={handlePaginationChange}
                                    current={pagination.current_page}
                                    pageSize={pagination.current_limit}
                                    total={pagination.total_limit}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            <Modal
                title={
                    <div style={{ textAlign: 'center' }}>
                        {modalContent === 'details' ? (
                            <div
                                style={{
                                    backgroundColor: '#f6ffed',
                                    border: '1px solid #b7eb8f',
                                    borderRadius: '4px',
                                    padding: '4px 12px',
                                    margin: '0 -16px',
                                }}
                            >
                                <Typography.Title level={4} style={{ margin: 0, color: '#262626' }}>
                                    Error Notification Detail
                                </Typography.Title>
                            </div>
                        ) : (
                            <Typography.Title level={4} style={{ margin: 0 }}>
                                {modalContent === 'user' && 'History User Notification'}
                                {modalContent === 'log' && 'Log History Notification'}
                            </Typography.Title>
                        )}
                    </div>
                }
                open={modalContent !== null}
                onCancel={() => {
                    setModalContent(null);
                    // Reset state isAddingLog saat modal ditutup
                    if (modalContent === 'details') {
                        setIsAddingLog(false);
                    }
                    setSelectedNotification(null);
                }}
                closable={false} // Menghilangkan tombol 'x' di pojok kanan atas
                width={modalContent === 'details' ? 900 : 700}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button
                            type="primary"
                            ghost
                            onClick={() => {
                                setModalContent(null);
                                setSelectedNotification(null);
                                // Reset state isAddingLog saat modal ditutup
                                if (modalContent === 'details') {
                                    setIsAddingLog(false);
                                }
                            }}
                        >
                            Close
                        </Button>
                    </div>
                }
            >
                {modalContent === 'user' && renderUserHistory()}
                {modalContent === 'log' && renderLogHistory()}
                {modalContent === 'details' && renderDetailsNotification()}
            </Modal>
        </React.Fragment>
    );
});

export default ListNotification;
