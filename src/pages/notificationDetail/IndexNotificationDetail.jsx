import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Layout,
    Card,
    Row,
    Col,
    Typography,
    Space,
    Button,
    Spin,
    Result,
    Input,
    message,
    Avatar,
    Tag,
    Badge,
    Divider,
} from 'antd';
import {
    ArrowLeftOutlined,
    CloseCircleFilled,
    WarningFilled,
    CheckCircleFilled,
    InfoCircleFilled,
    CloseOutlined,
    BookOutlined,
    ToolOutlined,
    HistoryOutlined,
    FilePdfOutlined,
    PlusOutlined,
    UserOutlined,
    LoadingOutlined,
    PhoneOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    SendOutlined,
    MobileOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import {
    getNotificationDetail,
    createNotificationLog,
    getNotificationLogByNotificationId,
    updateIsRead,
    resendNotificationToUser,
    resendChatByUser,
} from '../../api/notification';

const { Content } = Layout;
const { Text, Paragraph, Link } = Typography;

// Transform API response to component format
const transformNotificationData = (apiData) => {
    // Extract nested data
    const errorCodeData = apiData.error_code;
    // Get active solution (is_active: true)
    const activeSolution =
        errorCodeData?.solution?.find((sol) => sol.is_active) || errorCodeData?.solution?.[0] || {};

    return {
        id: `notification-${apiData.notification_error_id}-0`,
        type: apiData.is_read ? 'resolved' : apiData.is_delivered ? 'warning' : 'critical',
        title: errorCodeData?.error_code_name || 'Unknown Error',
        issue: errorCodeData?.error_code || 'Unknown Error',
        description: apiData.message_error_issue || 'No details available',
        timestamp: apiData.created_at
            ? new Date(apiData.created_at).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              }) + ' WIB'
            : 'N/A',
        location: apiData.plant_sub_section_name || 'Location not specified',
        details: apiData.message_error_issue || 'No details available',
        isRead: apiData.is_read || false,
        isDelivered: apiData.is_delivered || false,
        isSend: apiData.is_send || false,
        status: apiData.is_read ? 'Resolved' : apiData.is_delivered ? 'Delivered' : 'Pending',
        tag: errorCodeData?.error_code,
        plc: 'N/A', // PLC not available in API response
        notification_error_id: apiData.notification_error_id,
        error_code_id: apiData.error_code_id,
        error_chanel: apiData.error_chanel,
        spareparts: errorCodeData?.spareparts || [],
        solution: {
            ...activeSolution,
            path_document: activeSolution.path_document
                ? activeSolution.path_document.replace(
                      '/detail-notification/pdf/',
                      '/notification-detail/pdf/'
                  )
                : activeSolution.path_document,
        }, // Include the active solution data with fixed URL
        error_code: errorCodeData,
        device_info: {
            device_code: apiData.device_code,
            device_name: apiData.device_name,
            device_location: apiData.device_location,
            brand_name: apiData.brand_name,
        },
        users: apiData.users || [],
    };
};

// Function to get actual users from notification data
const getUsersFromNotification = (notification) => {
    if (!notification || !notification.users) return [];

    return notification.users.map((user) => ({
        id: user.notification_error_user_id.toString(),
        name: user.contact_name,
        phone: user.contact_phone,
        status: user.is_send ? 'Delivered' : 'Pending',
        loading: user.loading || false,
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
};

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

const getIconAndColor = (type) => {
    switch (type) {
        case 'critical':
            return { IconComponent: CloseCircleFilled, color: '#ff4d4f', bgColor: '#fff1f0' };
        case 'warning':
            return { IconComponent: WarningFilled, color: '#faad14', bgColor: '#fffbe6' };
        case 'resolved':
            return { IconComponent: CheckCircleFilled, color: '#52c41a', bgColor: '#f6ffed' };
        default:
            return { IconComponent: InfoCircleFilled, color: '#1890ff', bgColor: '#e6f7ff' };
    }
};

const NotificationDetailTab = (props) => {
    const params = useParams(); // Mungkin perlu disesuaikan jika route berbeda
    const notificationId = props.id ?? params.notificationId;
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddingLog, setIsAddingLog] = useState(false);

    // Log history states
    const [logHistoryData, setLogHistoryData] = useState([]);
    const [logLoading, setLogLoading] = useState(false);
    const [newLogDescription, setNewLogDescription] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    // Fetch log history from API
    const fetchLogHistory = async (notifId) => {
        try {
            setLogLoading(true);
            const response = await getNotificationLogByNotificationId(notifId);
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
                        phone: log.contact_phone || '',
                    },
                    description: log.notification_error_log_description || '',
                }));
                setLogHistoryData(transformedLogs);
            }
        } catch (err) {
            console.error('Error fetching log history:', err);
        } finally {
            setLogLoading(false);
        }
    };

    // Handle submit new log
    const handleSubmitLog = async () => {
        if (!newLogDescription.trim()) {
            message.warning('Mohon isi deskripsi log terlebih dahulu');
            return;
        }

        try {
            setSubmitLoading(true);
            const payload = {
                notification_error_id: parseInt(notificationId),
                notification_error_log_description: newLogDescription.trim(),
            };

            const response = await createNotificationLog(payload);

            if (response && response.statusCode === 200) {
                message.success('Log berhasil ditambahkan');
                setNewLogDescription('');
                setIsAddingLog(false);
                // Refresh log history
                fetchLogHistory(notificationId);
            } else {
                throw new Error(response?.message || 'Gagal menambahkan log');
            }
        } catch (err) {
            console.error('Error submitting log:', err);
            message.error(err.message || 'Gagal menambahkan log');
        } finally {
            setSubmitLoading(false);
        }
    };

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);

                // Fetch using the actual API
                const response = await getNotificationDetail(notificationId);

                if (response && response.data) {
                    const transformedData = transformNotificationData(response.data);
                    setNotification(transformedData);

                    // Fetch log history
                    fetchLogHistory(notificationId);

                    // Fetch using the actual API
                    const resUpdate = await updateIsRead(notificationId);
                } else {
                    throw new Error('Notification not found');
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching notification detail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [notificationId]);

    if (loading) {
        return (
            <Layout
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Spin size="large" />
            </Layout>
        );
    }

    if (error || !notification) {
        return (
            <Layout
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Result
                    status="404"
                    title="404"
                    subTitle="Sorry, the notification you visited does not exist."
                    extra={
                        <Button type="primary" onClick={() => navigate('/notification')}>
                            Back to List
                        </Button>
                    }
                />
            </Layout>
        );
    }

    const { color } = getIconAndColor(notification.type);

    return (
        <Layout style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
            <Content>
                <Card>
                    <div
                        style={{
                            borderBottom: '1px solid #f0f0f0',
                            paddingBottom: '16px',
                            marginBottom: '24px',
                        }}
                    >
                        {!props.id && (
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Button
                                        type="text"
                                        icon={<ArrowLeftOutlined />}
                                        onClick={() => navigate('/notification')}
                                        style={{ paddingLeft: 0 }}
                                    >
                                        Back to notification list
                                    </Button>
                                </Col>
                            </Row>
                        )}

                        <div
                            style={{
                                backgroundColor: '#f6ffed',
                                border: '1px solid #b7eb8f',
                                borderRadius: '4px',
                                padding: '8px 16px',
                                textAlign: 'center',
                                marginTop: '16px',
                            }}
                        >
                            <Typography.Title level={4} style={{ margin: 0, color: '#262626' }}>
                                Error Notification Detail
                            </Typography.Title>
                        </div>
                    </div>

                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Row gutter={[8, 8]}>
                            {/* Kolom Kiri: Data Kompresor */}
                            <Col xs={24} lg={8}>
                                <Card
                                    size="small"
                                    style={{ height: '100%', borderColor: '#d4380d' }}
                                    bodyStyle={{ padding: '16px' }}
                                >
                                    <Space
                                        direction="vertical"
                                        size="large"
                                        style={{ width: '100%' }}
                                    >
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
                                                <Text>{notification.title}</Text>
                                                <div style={{ marginTop: '2px' }}>
                                                    <Text strong style={{ fontSize: '16px' }}>
                                                        Error Code {notification.issue}
                                                    </Text>
                                                </div>
                                            </Col>
                                        </Row>
                                        <div>
                                            <Text strong>Plant Subsection</Text>
                                            <div>{notification.location}</div>
                                            <Text
                                                strong
                                                style={{ display: 'block', marginTop: '8px' }}
                                            >
                                                Date & Time
                                            </Text>
                                            <div>{notification.timestamp}</div>
                                        </div>
                                    </Space>
                                </Card>
                            </Col>

                            {/* Kolom Tengah: Informasi Teknis */}
                            <Col xs={24} lg={8}>
                                <Card
                                    title="Device Information"
                                    size="small"
                                    style={{ height: '100%' }}
                                >
                                    <Space
                                        direction="vertical"
                                        size="middle"
                                        style={{ width: '100%' }}
                                    >
                                        <div>
                                            <Text strong>Error Channel</Text>
                                            <div>{notification.error_chanel || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <Text strong>Device Code</Text>
                                            <div>
                                                {notification.device_info?.device_code || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <Text strong>Device Name</Text>
                                            <div>
                                                {notification.device_info?.device_name || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <Text strong>Device Location</Text>
                                            <div>
                                                {notification.device_info?.device_location || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <Text strong>Brand</Text>
                                            <div>
                                                {notification.device_info?.brand_name || 'N/A'}
                                            </div>
                                        </div>
                                    </Space>
                                </Card>
                            </Col>

                            {/* Kolom Kanan: User History */}
                            <Col xs={24} lg={8}>
                                <Card title="User History" size="small" style={{ height: '100%' }}>
                                    <div
                                        style={{
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                            padding: '2px',
                                        }}
                                    >
                                        <Space
                                            direction="vertical"
                                            size={2}
                                            style={{ width: '100%' }}
                                        >
                                            {getUsersFromNotification(notification).map((user) => (
                                                <Card
                                                    key={user.id}
                                                    size="small"
                                                    style={{ width: '100%', margin: 0 }}
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
                                                                <Badge
                                                                    status={
                                                                        user.status === 'Delivered'
                                                                            ? 'success'
                                                                            : 'default'
                                                                    }
                                                                    text={user.status}
                                                                />
                                                            </Space>
                                                            <Divider style={{ margin: '8px 0' }} />
                                                            <Space align="center">
                                                                {user.status === 'Delivered' ? (
                                                                    <CheckCircleFilled
                                                                        style={{ color: '#52c41a' }}
                                                                    />
                                                                ) : (
                                                                    <ClockCircleOutlined
                                                                        style={{ color: '#faad14' }}
                                                                    />
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
                                                            <Col>
                                                                <Button
                                                                    type="primary"
                                                                    ghost
                                                                    icon={<SendOutlined />}
                                                                    onClick={async () => {
                                                                        await resendChatByUser(
                                                                            user.id,
                                                                            user.phone
                                                                        );
                                                                    }}
                                                                >
                                                                    Resend
                                                                </Button>
                                                            </Col>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            ))}
                                        </Space>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={[8, 8]}>
                            <Col xs={24} md={8}>
                                <div>
                                    <Card
                                        hoverable
                                        bodyStyle={{ padding: '12px'}}
                                    >
                                        <Space>
                                            <BookOutlined
                                                style={{ fontSize: '16px', color: '#1890ff' }}
                                            />
                                            <Text
                                                strong
                                                style={{ fontSize: '16px', color: '#262626' }}
                                            >
                                                Handling Guideline
                                            </Text>
                                        </Space>

                                        <Space
                                            direction="vertical"
                                            size="small"
                                            style={{ width: '100%' }}
                                        >
                                            {notification.error_code?.solution &&
                                            notification.error_code.solution.length > 0 ? (
                                                <>
                                                    {notification.error_code.solution
                                                        .filter((sol) => sol.is_active) // Hanya tampilkan solusi yang aktif
                                                        .map((sol, index) => (
                                                            <div
                                                                key={
                                                                    sol.brand_code_solution_id ||
                                                                    index
                                                                }
                                                            >
                                                                {sol.path_document ? (
                                                                    <Card
                                                                        size="small"
                                                                        bodyStyle={{
                                                                            padding: '8px 12px',
                                                                            marginBottom: '4px',
                                                                        }}
                                                                        hoverable
                                                                        extra={
                                                                            <Text
                                                                                type="secondary"
                                                                                style={{
                                                                                    fontSize:
                                                                                        '10px',
                                                                                }}
                                                                            >
                                                                                PDF
                                                                            </Text>
                                                                        }
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                justifyContent:
                                                                                    'space-between',
                                                                                alignItems:
                                                                                    'center',
                                                                            }}
                                                                        >
                                                                            <div>
                                                                                <Text
                                                                                    style={{
                                                                                        fontSize:
                                                                                            '12px',
                                                                                        color: '#262626',
                                                                                    }}
                                                                                >
                                                                                    <FilePdfOutlined
                                                                                        style={{
                                                                                            marginRight:
                                                                                                '8px',
                                                                                        }}
                                                                                    />{' '}
                                                                                    {sol.file_upload_name ||
                                                                                        'Solution Document.pdf'}
                                                                                </Text>
                                                                                <Link
                                                                                    href={sol.path_document.replace(
                                                                                        '/detail-notification/pdf/',
                                                                                        '/notification-detail/pdf/'
                                                                                    )}
                                                                                    target="_blank"
                                                                                    style={{
                                                                                        fontSize:
                                                                                            '12px',
                                                                                        display:
                                                                                            'block',
                                                                                    }}
                                                                                >
                                                                                    lihat disini
                                                                                </Link>
                                                                            </div>
                                                                        </div>
                                                                    </Card>
                                                                ) : null}
                                                                {sol.type_solution === 'text' &&
                                                                sol.text_solution ? (
                                                                    <Card
                                                                        size="small"
                                                                        title={
                                                                            <Text strong>
                                                                                {sol.solution_name}:
                                                                            </Text>
                                                                        }
                                                                        bodyStyle={{
                                                                            padding: '8px 12px',
                                                                            marginBottom: '4px',
                                                                        }}
                                                                        extra={
                                                                            <Text
                                                                                type="secondary"
                                                                                style={{
                                                                                    fontSize:
                                                                                        '10px',
                                                                                }}
                                                                            >
                                                                                {sol.type_solution.toUpperCase()}
                                                                            </Text>
                                                                        }
                                                                    >
                                                                        <div>
                                                                            <div
                                                                                style={{
                                                                                    marginTop:
                                                                                        '4px',
                                                                                }}
                                                                            >
                                                                                {sol.text_solution}
                                                                            </div>
                                                                        </div>
                                                                    </Card>
                                                                ) : null}
                                                            </div>
                                                        ))}
                                                </>
                                            ) : (
                                                <div
                                                    style={{
                                                        textAlign: 'center',
                                                        padding: '20px',
                                                        color: '#8c8c8c',
                                                    }}
                                                >
                                                    Tidak ada dokumen solusi tersedia
                                                </div>
                                            )}
                                        </Space>
                                    </Card>
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div>
                                    <Card
                                        hoverable
                                        bodyStyle={{ padding: '12px'}}
                                    >
                                        <Space>
                                            <ToolOutlined
                                                style={{ fontSize: '16px', color: '#1890ff' }}
                                            />
                                            <Text
                                                strong
                                                style={{ fontSize: '16px', color: '#262626' }}
                                            >
                                                Spare Part
                                            </Text>
                                        </Space>

                                        <Space
                                            direction="vertical"
                                            size="small"
                                            style={{ width: '100%' }}
                                        >
                                            {notification.spareparts &&
                                            notification.spareparts.length > 0 ? (
                                                notification.spareparts.map((sparepart, index) => (
                                                    <Card
                                                        size="small"
                                                        key={index}
                                                        bodyStyle={{ padding: '12px' }}
                                                        hoverable
                                                    >
                                                        <Row gutter={16} align="top">
                                                            <Col
                                                                span={7}
                                                                style={{ textAlign: 'center' }}
                                                            >
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
                                                                        color:
                                                                            sparepart.sparepart_stok ===
                                                                                'Available' ||
                                                                            sparepart.sparepart_stok ===
                                                                                'available'
                                                                                ? '#52c41a'
                                                                                : '#ff4d4f',
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    {sparepart.sparepart_stok}
                                                                </Text>
                                                            </Col>
                                                            <Col span={17}>
                                                                <Space
                                                                    direction="vertical"
                                                                    size={4}
                                                                    style={{ width: '100%' }}
                                                                >
                                                                    <Text strong>
                                                                        {sparepart.sparepart_name}
                                                                    </Text>
                                                                    <Paragraph
                                                                        style={{
                                                                            fontSize: '12px',
                                                                            margin: 0,
                                                                            color: '#595959',
                                                                        }}
                                                                    >
                                                                        {sparepart.sparepart_description ||
                                                                            'Deskripsi tidak tersedia'}
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
                                                                        Kode:{' '}
                                                                        {sparepart.sparepart_code} |
                                                                        Qty:{' '}
                                                                        {sparepart.sparepart_qty} |
                                                                        Unit:{' '}
                                                                        {sparepart.sparepart_unit}
                                                                    </div>
                                                                </Space>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                ))
                                            ) : (
                                                <div
                                                    style={{
                                                        textAlign: 'center',
                                                        padding: '20px',
                                                        color: '#8c8c8c',
                                                    }}
                                                >
                                                    Tidak ada spare parts terkait
                                                </div>
                                            )}
                                        </Space>
                                    </Card>
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div>
                                    <Card bodyStyle={{ padding: '12px'}}>
                                        <Space>
                                            <HistoryOutlined
                                                style={{ fontSize: '16px', color: '#1890ff' }}
                                            />
                                            <Text
                                                strong
                                                style={{ fontSize: '16px', color: '#262626' }}
                                            >
                                                Log Activity
                                            </Text>
                                        </Space>

                                        <Space
                                            direction="vertical"
                                            size="small"
                                            style={{ width: '100%' }}
                                        >
                                            <Card
                                                size="small"
                                                bodyStyle={{
                                                    padding: '8px 12px',
                                                    backgroundColor: isAddingLog
                                                        ? '#fafafa'
                                                        : '#fff',
                                                }}
                                            >
                                                <Space
                                                    direction="vertical"
                                                    style={{ width: '100%' }}
                                                    size="small"
                                                >
                                                    {isAddingLog && (
                                                        <>
                                                            <Text
                                                                strong
                                                                style={{ fontSize: '12px' }}
                                                            >
                                                                Add New Log / Update Progress
                                                            </Text>
                                                            <Input.TextArea
                                                                rows={2}
                                                                placeholder="Tuliskan update penanganan di sini..."
                                                                value={newLogDescription}
                                                                onChange={(e) =>
                                                                    setNewLogDescription(
                                                                        e.target.value
                                                                    )
                                                                }
                                                                disabled={submitLoading}
                                                            />
                                                        </>
                                                    )}
                                                    <Button
                                                        type={isAddingLog ? 'primary' : 'dashed'}
                                                        size="small"
                                                        block
                                                        icon={
                                                            submitLoading ? (
                                                                <LoadingOutlined />
                                                            ) : (
                                                                !isAddingLog && <PlusOutlined />
                                                            )
                                                        }
                                                        onClick={
                                                            isAddingLog
                                                                ? handleSubmitLog
                                                                : () => setIsAddingLog(true)
                                                        }
                                                        loading={submitLoading}
                                                        disabled={submitLoading}
                                                    >
                                                        {isAddingLog ? 'Submit Log' : 'Add Log'}
                                                    </Button>
                                                    {isAddingLog && (
                                                        <Button
                                                            size="small"
                                                            block
                                                            onClick={() => {
                                                                setIsAddingLog(false);
                                                                setNewLogDescription('');
                                                            }}
                                                            disabled={submitLoading}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </Space>
                                            </Card>
                                            {logHistoryData.map((log) => (
                                                <Card
                                                    key={log.id}
                                                    size="small"
                                                    bodyStyle={{
                                                        padding: '8px 12px',
                                                    }}
                                                >
                                                    <Paragraph
                                                        style={{ fontSize: '12px', margin: 0 }}
                                                        // ellipsis={{ rows: 2 }}
                                                    >
                                                        <Text strong>{log.addedBy.name}:</Text>{' '}
                                                        {log.description}
                                                    </Paragraph>
                                                    <Text
                                                        type="secondary"
                                                        style={{ fontSize: '11px' }}
                                                    >
                                                        {log.timestamp}
                                                    </Text>
                                                </Card>
                                            ))}
                                        </Space>
                                    </Card>
                                </div>
                            </Col>
                        </Row>
                    </Space>
                </Card>
            </Content>
        </Layout>
    );
};

export default NotificationDetailTab;
