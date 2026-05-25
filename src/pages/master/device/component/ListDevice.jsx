import React, { memo, useState, useEffect } from 'react';
import { Space, Tag, ConfigProvider, Button, Row, Col, Card, Input, Segmented } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    AppstoreOutlined,
    TableOutlined,
} from '@ant-design/icons';
import { NotifAlert, NotifOk, NotifConfirmDialog } from '../../../../components/Global/ToastNotif';
import { useNavigate } from 'react-router-dom';
import { deleteDevice, getAllDevice } from '../../../../api/master-device';
import TableList from '../../../../components/Global/TableList';
import { getAllBrands } from '../../../../api/master-brand';

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
        dataIndex: 'device_id',
        key: 'device_id',
        width: '5%',
        hidden: 'true',
    },
    {
        title: 'Device Code',
        dataIndex: 'device_code',
        key: 'device_code',
        width: '10%',
        hidden: true,
    },
    {
        title: 'Device Name',
        dataIndex: 'device_name',
        key: 'device_name',
        width: '20%',
    },
    {
        title: 'Brand Device',
        dataIndex: 'brand_name',
        key: 'brand_name',
        width: '20%',
        render: (brand_name) => brand_name || '-'
    },
    {
        title: 'Location',
        dataIndex: 'device_location',
        key: 'device_location',
        width: '10%',
    },
    {
        title: 'IP Address',
        dataIndex: 'ip_address',
        key: 'ip_address',
        width: '10%',
    },
    {
        title: 'Listen Channel',
        dataIndex: 'listen_channel',
        key: 'listen_channel',
        width: '10%',
        render: (listen_channel) => listen_channel || '-'
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
                        Running
                    </Tag>
                ) : (
                    <Tag color={'red'} key={'status'}>
                        Offline
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

const ListDevice = memo(function ListDevice(props) {
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
            message: 'Device "' + param.device_name + '" akan dihapus?',
            onConfirm: () => handleDelete(param.device_id),
            onCancel: () => props.setSelectedData(null),
        });
    };

    const handleDelete = async (device_id) => {
        const response = await deleteDevice(device_id);

        if (response.statusCode === 200 && response.data === true) {
            NotifAlert({
                icon: 'success',
                title: 'Berhasil',
                message: response.message || 'Data Device berhasil dihapus.',
            });
            doFilter();
        } else {
            NotifOk({
                icon: 'error',
                title: 'Gagal',
                message: response?.message || 'Gagal Menghapus Data Device',
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
                                    placeholder="Search device by name, code, or location..."
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
                                            Add data
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
                            header={'device_name'}
                            showPreviewModal={showPreviewModal}
                            showEditModal={showEditModal}
                            showDeleteDialog={showDeleteDialog}
                            getData={getAllDevice}
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

export default ListDevice;
