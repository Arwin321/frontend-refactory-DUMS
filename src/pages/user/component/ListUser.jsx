import React, { memo, useState, useEffect } from 'react';
import { Space, Tag, ConfigProvider, Button, Row, Col, Card, Input, Modal } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    CheckOutlined,
    CloseOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { NotifAlert, NotifOk, NotifConfirmDialog } from '../../../components/Global/ToastNotif';
import { useNavigate } from 'react-router-dom';
import { deleteUser, getAllUser, approveUser, rejectUser } from '../../../api/user';
import TableList from '../../../components/Global/TableList';
import Swal from 'sweetalert2';

// Helper function to capitalize first letter
const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Helper function to get role tag color based on role_level or role_name
const getRoleColor = (role_name, role_level) => {
    // Priority 1: Based on role_level
    if (role_level) {
        switch (role_level) {
            case 1:
                return 'purple'; // Highest level
            case 2:
                return 'blue';
            case 3:
                return 'cyan';
            case 4:
                return 'green';
            default:
                return 'default';
        }
    }

    // Priority 2: Based on role_name (fallback for backward compatibility)
    const roleLower = role_name?.toLowerCase() || '';
    if (roleLower.includes('admin')) return 'purple';
    if (roleLower.includes('operator')) return 'blue';
    if (roleLower.includes('engineer')) return 'cyan';
    if (roleLower.includes('guest')) return 'default';

    return 'default';
};

const columns = (showPreviewModal, showEditModal, showDeleteDialog, showApprovalModal) => [
    {
        title: 'No',
        key: 'no',
        width: '5%',
        align: 'center',
        render: (_, __, index) => index + 1,
    },
    {
        title: 'ID',
        dataIndex: 'user_id',
        key: 'user_id',
        width: '5%',
        hidden: 'true',
    },
    {
        title: 'Username',
        dataIndex: 'user_name',
        key: 'user_name',
        width: '12%',
    },
    {
        title: 'Nama Lengkap',
        dataIndex: 'user_fullname',
        key: 'user_fullname',
        width: '15%',
    },
    {
        title: 'Nomor WA',
        dataIndex: 'user_phone',
        key: 'user_phone',
        width: '12%',
    },
    {
        title: 'Level',
        dataIndex: 'role_level',
        key: 'role_level',
        width: '8%',
        align: 'center',
        render: (role_level) => role_level || '-',
    },
    {
        title: 'Nama Role',
        dataIndex: 'role_name',
        key: 'role_name',
        width: '12%',
        render: (_, { role_name, role_level }) => {
            if (!role_name) return <Tag color={'default'}>Belum Ada Role</Tag>;

            const color = getRoleColor(role_name, role_level);
            const displayName = capitalizeFirstLetter(role_name);

            return (
                <Tag color={color} key={'role'}>
                    {displayName}
                </Tag>
            );
        },
    },
    {
        title: 'Status Approval',
        dataIndex: 'is_approve',
        key: 'is_approve',
        width: '15%',
        align: 'center',
        render: (_, record) => {
            // is_approve: 0 = Rejected, 1 = Pending, 2 = Approved
            if (record.is_approve === 1 || record.is_approve === '1') {
                // Pending - show single Pending button
                return (
                    <Button
                        type="default"
                        size="small"
                        icon={<ClockCircleOutlined />}
                        onClick={() => showApprovalModal(record)}
                        style={{
                            backgroundColor: '#faad14',
                            borderColor: '#faad14',
                            color: 'white',
                            width: '100%',
                        }}
                    >
                        Pending
                    </Button>
                );
            } else if (record.is_approve === 0 || record.is_approve === '0') {
                // Rejected
                return (
                    <Tag color={'red'} key={'status'}>
                        Rejected
                    </Tag>
                );
            } else if (
                record.is_approve === 2 ||
                record.is_approve === '2' ||
                record.is_approve === true
            ) {
                // Approved
                return (
                    <Tag color={'green'} key={'status'}>
                        Approved
                    </Tag>
                );
            }
            // Default fallback (for false/null which means pending in old system)
            return (
                <Tag color={'orange'} key={'status'}>
                    Pending
                </Tag>
            );
        },
    },
    {
        title: 'Status Active',
        dataIndex: 'is_active',
        key: 'is_active',
        width: '10%',
        align: 'center',
        render: (_, record) => {
            // Only show active status if user is approved
            if (
                record.is_approve === 2 ||
                record.is_approve === '2' ||
                record.is_approve === true
            ) {
                if (record.is_active === true || record.is_active === 1) {
                    return (
                        <Tag color={'green'} key={'active'}>
                            Active
                        </Tag>
                    );
                }
                return (
                    <Tag color={'default'} key={'inactive'}>
                        Inactive
                    </Tag>
                );
            }
            return <span>-</span>;
        },
    },
    {
        title: 'Action',
        key: 'aksi',
        align: 'center',
        width: '12%',
        render: (_, record) => (
            <Space>
                <Button
                    type="text"
                    style={{ borderColor: '#1890ff' }}
                    icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                    onClick={() => showPreviewModal(record)}
                />
                <Button
                    type="text"
                    style={{ borderColor: '#faad14' }}
                    icon={<EditOutlined style={{ color: '#faad14' }} />}
                    onClick={() => showEditModal(record)}
                />
                <Button
                    type="text"
                    danger
                    style={{ borderColor: 'red' }}
                    icon={<DeleteOutlined />}
                    onClick={() => showDeleteDialog(record)}
                />
            </Space>
        ),
    },
];

const ListUser = memo(function ListUser(props) {
    const [showFilter, setShowFilter] = useState(false);
    const [trigerFilter, setTrigerFilter] = useState(false);
    const [approvalModalVisible, setApprovalModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const defaultFilter = { criteria: '' };
    const [formDataFilter, setFormDataFilter] = useState(defaultFilter);
    const [searchValue, setSearchValue] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && props.actionMode == 'list') {
            setFormDataFilter(defaultFilter);
            doFilter();
        } else if (!token) {
            navigate('/signin');
        }
    }, [props.actionMode]);

    const toggleFilter = () => {
        setFormDataFilter(defaultFilter);
        setShowFilter((prev) => !prev);
    };

    const doFilter = () => {
        setTrigerFilter((prev) => !prev);
    };

    const handleSearch = () => {
        setFormDataFilter({ criteria: searchValue });
        setTrigerFilter((prev) => !prev);
    };

    const handleSearchClear = () => {
        setSearchValue('');
        setFormDataFilter({ criteria: '' });
        setTrigerFilter((prev) => !prev);
    };

    const showPreviewModal = (param) => {
        props.setSelectedData(param);
        props.setActionMode('preview');
    };

    const showEditModal = (param = null) => {
        props.setSelectedData(param);
        props.setActionMode('edit');
    };

    const showAddModal = (param = null) => {
        props.setSelectedData(param);
        props.setActionMode('add');
    };

    const showApprovalModal = (param) => {
        setSelectedUser(param);
        setApprovalModalVisible(true);
    };

    const handleModalApprove = () => {
        if (selectedUser) {
            handleApprove(selectedUser.user_id);
            setApprovalModalVisible(false);
            setSelectedUser(null);
        }
    };

    const handleModalReject = () => {
        if (selectedUser) {
            handleReject(selectedUser.user_id);
            setApprovalModalVisible(false);
            setSelectedUser(null);
        }
    };

    const handleModalCancel = () => {
        setApprovalModalVisible(false);
        setSelectedUser(null);
    };

    const showDeleteDialog = (param) => {
        NotifConfirmDialog({
            icon: 'question',
            title: 'Konfirmasi',
            message: 'Apakah anda yakin hapus user "' + param.user_fullname + '" ?',
            onConfirm: () => handleDelete(param.user_id, param.user_fullname),
            onCancel: () => props.setSelectedData(null),
        });
    };

    const handleApprove = async (user_id) => {
        const response = await approveUser(user_id);
        if (response.statusCode == 200) {
            NotifAlert({
                icon: 'success',
                title: 'Berhasil',
                message: 'User berhasil diapprove.',
            });
            doFilter();
        } else {
            NotifOk({
                icon: 'error',
                title: 'Gagal',
                message: 'Gagal Approve User',
            });
        }
    };

    const handleReject = async (user_id) => {
        const response = await rejectUser(user_id);
        if (response.statusCode == 200) {
            NotifAlert({
                icon: 'success',
                title: 'Berhasil',
                message: 'User berhasil direject.',
            });
            doFilter();
        } else {
            NotifOk({
                icon: 'error',
                title: 'Gagal',
                message: 'Gagal Reject User',
            });
        }
    };

    const handleDelete = async (user_id, user_fullname) => {
        const response = await deleteUser(user_id);

        if (response.statusCode == 200) {
            NotifAlert({
                icon: 'success',
                title: 'Berhasil',
                message: 'User "' + user_fullname + '" berhasil dihapus.',
            });
            doFilter();
        } else {
            NotifOk({
                icon: 'error',
                title: 'Gagal',
                message: 'Gagal Menghapus User',
            });
        }
    };

    return (
        <React.Fragment>
            <Card>
                <Row>
                    <Col xs={24}>
                        <Row justify="space-between" align="middle" gutter={[8, 8]}>
                            <Col xs={24} sm={24} md={12} lg={12}>
                                <Input.Search
                                    placeholder="Search user by username, nama, or role..."
                                    value={searchValue}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchValue(value);
                                        // Auto search when clearing by backspace/delete
                                        if (value === '') {
                                            setFormDataFilter({ criteria: '' });
                                            setTrigerFilter((prev) => !prev);
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
                            <Col>
                                <Space wrap size="small">
                                    <ConfigProvider
                                        theme={{
                                            token: { colorBgContainer: '#E9F6EF' },
                                            components: {
                                                Button: {
                                                    defaultBg: 'white',
                                                    defaultColor: '#23A55A',
                                                    defaultBorderColor: '#23A55A',
                                                    defaultHoverColor: '#23A55A',
                                                    defaultHoverBorderColor: '#23A55A',
                                                },
                                            },
                                        }}
                                    >
                                        <Button
                                            icon={<PlusOutlined />}
                                            onClick={() => showAddModal()}
                                            size="large"
                                        >
                                            Tambah User
                                        </Button>
                                    </ConfigProvider>
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ marginTop: '16px' }}>
                        <TableList
                            mobile
                            cardColor={'#42AAFF'}
                            header={'user_name'}
                            showPreviewModal={showPreviewModal}
                            showEditModal={showEditModal}
                            showDeleteDialog={showDeleteDialog}
                            getData={getAllUser}
                            queryParams={formDataFilter}
                            columns={columns(
                                showPreviewModal,
                                showEditModal,
                                showDeleteDialog,
                                showApprovalModal
                            )}
                            triger={trigerFilter}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Approval Modal */}
            <Modal
                title="Konfirmasi Persetujuan User"
                open={approvalModalVisible}
                onCancel={handleModalCancel}
                footer={[
                    <Button key="reject" danger onClick={handleModalReject}>
                        Reject User
                    </Button>,
                    <Button
                        key="approve"
                        type="primary"
                        style={{ backgroundColor: '#23A55A', borderColor: '#23A55A' }}
                        onClick={handleModalApprove}
                    >
                        Approve User
                    </Button>,
                ]}
                width={400}
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <ClockCircleOutlined
                        style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }}
                    />
                    <p style={{ fontSize: '16px', margin: '16px 0' }}>
                        User: <strong>{selectedUser?.user_fullname}</strong>
                    </p>
                    <p style={{ color: '#666', margin: '8px 0' }}>
                        Apakah Anda ingin approve atau reject user ini?
                    </p>
                </div>
            </Modal>
        </React.Fragment>
    );
});

export default ListUser;
