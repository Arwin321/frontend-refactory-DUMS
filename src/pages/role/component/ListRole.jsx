import React, { memo, useState, useEffect } from 'react';
import { Space, Tag, ConfigProvider, Button, Row, Col, Card, Input } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { NotifAlert, NotifOk, NotifConfirmDialog } from '../../../components/Global/ToastNotif';
import { useNavigate } from 'react-router-dom';
import { getAllRole, deleteRole } from '../../../api/role';
import TableList from '../../../components/Global/TableList';

const columns = (showPreviewModal, showEditModal, showDeleteDialog) => [
    {
        title: 'No',
        key: 'no',
        width: '5%',
        align: 'center',
        render: (_, __, index) => index + 1,
    },
    {
        title: 'ID',
        dataIndex: 'role_id',
        key: 'role_id',
        width: '5%',
        hidden: true,
    },
    {
        title: 'Role Name',
        dataIndex: 'role_name',
        key: 'role_name',
        width: '25%',
    },
    {
        title: 'Level',
        dataIndex: 'role_level',
        key: 'role_level',
        width: '10%',
        align: 'center',
    },
    {
        title: 'Description',
        dataIndex: 'role_description',
        key: 'role_description',
        width: '35%',
    },
    {
        title: 'Status',
        dataIndex: 'is_active',
        key: 'is_active',
        width: '10%',
        align: 'center',
        render: (_, { is_active }) => (
            <>
                {is_active === true ? (
                    <Tag color={'green'} key={'status'}>
                        Active
                    </Tag>
                ) : (
                    <Tag color={'default'} key={'status'}>
                        Inactive
                    </Tag>
                )}
            </>
        ),
    },
    {
        title: 'Action',
        key: 'aksi',
        align: 'center',
        width: '15%',
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

const ListRole = memo(function ListRole(props) {
    const [trigerFilter, setTrigerFilter] = useState(false);
    const defaultFilter = { criteria: '' };
    const [formDataFilter, setFormDataFilter] = useState(defaultFilter);
    const [searchValue, setSearchValue] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            if (props.actionMode === 'list') {
                setFormDataFilter(defaultFilter);
                doFilter();
            }
        } else {
            navigate('/signin');
        }
    }, [props.actionMode]);

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

    const showDeleteDialog = (param) => {
        NotifConfirmDialog({
            icon: 'question',
            title: 'Konfirmasi Hapus',
            message: 'Role "' + param.role_name + '" akan dihapus?',
            onConfirm: () => handleDelete(param.role_id, param.role_name),
            onCancel: () => props.setSelectedData(null),
        });
    };

    const handleDelete = async (role_id, role_name) => {
        const response = await deleteRole(role_id);
        if (response.statusCode === 200) {
            NotifAlert({
                icon: 'success',
                title: 'Berhasil',
                message: `Data Role "${role_name}" berhasil dihapus.`,
            });
            doFilter();
        } else {
            NotifOk({
                icon: 'error',
                title: 'Gagal',
                message: response.message || 'Gagal Menghapus Data Role',
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
                                    placeholder="Search role by name, level, or description..."
                                    value={searchValue}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchValue(value);
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
                                            components: {
                                                Button: {
                                                    defaultBg: 'white',
                                                    defaultColor: '#23A55A',
                                                    defaultBorderColor: '#23A55A',
                                                },
                                            },
                                        }}
                                    >
                                        <Button
                                            icon={<PlusOutlined />}
                                            onClick={() => showAddModal()}
                                            size="large"
                                        >
                                            Add Role
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
                            header={'role_name'}
                            showPreviewModal={showPreviewModal}
                            showEditModal={showEditModal}
                            showDeleteDialog={showDeleteDialog}
                            getData={getAllRole}
                            queryParams={formDataFilter}
                            columns={columns(showPreviewModal, showEditModal, showDeleteDialog)}
                            triger={trigerFilter}
                        />
                    </Col>
                </Row>
            </Card>
        </React.Fragment>
    );
});

export default ListRole;
