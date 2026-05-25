import React, { memo, useState, useEffect } from 'react';
import { Space, ConfigProvider, Button, Row, Col, Card, Input } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { NotifAlert, NotifConfirmDialog } from '../../../../components/Global/ToastNotif';
import { useNavigate } from 'react-router-dom';
import { deleteStatus, getAllStatuss } from '../../../../api/master-status';
import TableList from '../../../../components/Global/TableList';

const columns = (showPreviewModal, showEditModal, showDeleteDialog) => [
    {
        title: 'No',
        key: 'no',
        width: '5%',
        align: 'center',
        render: (_, __, index) => index + 1,
    },
    { title: 'Status Number', dataIndex: 'status_number', key: 'status_number', width: '15%' },
    { title: 'Name', dataIndex: 'status_name', key: 'status_name', width: '25%' },
    {
        title: 'Color',
        dataIndex: 'status_color',
        key: 'status_color',
        align: 'center',
        width: '10%',
        render: (_, record) => (
            <Button
                type="text"
                style={{ backgroundColor: record.status_color }}
                onClick={() => showPreviewModal(record)}
            />
        ),
    },
    {
        title: 'Description',
        dataIndex: 'status_description',
        key: 'status_description',
        width: '40%',
    },
    {
        title: 'Action',
        key: 'aksi',
        align: 'center',
        width: '20%',
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

const ListStatus = memo(function ListStatus(props) {
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

    const showPreviewModal = (record) => {
        props.setSelectedData(record);
        props.setActionMode('preview');
    };

    const showEditModal = (record) => {
        props.setSelectedData(record);
        props.setActionMode('edit');
    };

    const showAddModal = () => {
        props.setSelectedData(null);
        props.setActionMode('add');
    };

    const showDeleteDialog = (record) => {
        NotifConfirmDialog({
            icon: 'question',
            title: 'Konfirmasi Hapus',
            message: `Status "${record.status_name}" akan dihapus?`,
            onConfirm: () => handleDelete(record.status_id),
        });
    };

    const handleDelete = async (status_id) => {
        try {
            const response = await deleteStatus(status_id);
            if (response.statusCode === 200) {
                NotifAlert({
                    icon: 'success',
                    title: 'Berhasil',
                    message: 'Data Status berhasil dihapus.',
                });
                doFilter();
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: response?.message || 'Gagal Menghapus Data',
                });
            }
        } catch (error) {
            NotifAlert({ icon: 'error', title: 'Error', message: error.message });
        }
    };

    return (
        <Card>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col xs={24} sm={24} md={12} lg={12}>
                    <Input.Search
                        placeholder="Search by status name..."
                        onSearch={handleSearch}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchValue(value);
                            if (value === '') {
                                handleSearchClear();
                            }
                        }}
                        allowClear={{
                            clearIcon: <span onClick={handleSearchClear}>✕</span>,
                        }}
                        enterButton={
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                style={{ backgroundColor: '#23A55A', borderColor: '#23A55A' }}
                            >
                                Search
                            </Button>
                        }
                        size="large"
                    />
                </Col>
                <Col>
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
                        <Button icon={<PlusOutlined />} onClick={showAddModal} size="large">
                            Add data
                        </Button>
                    </ConfigProvider>
                </Col>

                <Col xs={24} style={{ marginTop: '16px' }}>
                    <TableList
                        mobile
                        cardColor={'#42AAFF'}
                        fieldColor={'status_color'}
                        header={'status_name'}
                        showPreviewModal={showPreviewModal}
                        showEditModal={showEditModal}
                        showDeleteDialog={showDeleteDialog}
                        getData={getAllStatuss}
                        queryParams={formDataFilter}
                        columns={columns(showPreviewModal, showEditModal, showDeleteDialog)}
                        triger={trigerFilter}
                    />
                </Col>
            </Row>
        </Card>
    );
});

export default ListStatus;
