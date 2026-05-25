import React, { memo, useState, useEffect } from 'react';
import { Space, Tag, ConfigProvider, Button, Row, Col, Card, Input } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { NotifAlert, NotifConfirmDialog } from '../../../../components/Global/ToastNotif';
import { useNavigate } from 'react-router-dom';
import TableList from '../../../../components/Global/TableList';
import { getAllTag, deleteTag } from '../../../../api/master-tag';

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
        dataIndex: 'tag_id',
        key: 'tag_id',
        width: '5%',
        hidden: true,
    },
    {
        title: 'Tag Code',
        dataIndex: 'tag_code',
        key: 'tag_code',
        width: '10%',
        hidden: true,
    },
    {
        title: 'Tag Number',
        dataIndex: 'tag_number',
        key: 'tag_number',
        width: '10%',
        align: 'center',
    },
    {
        title: 'Tag Name',
        dataIndex: 'tag_name',
        key: 'tag_name',
        width: '20%',
    },

    {
        title: 'Type',
        dataIndex: 'data_type',
        key: 'data_type',
        width: '8%',
        render: (text) => text || '-',
    },
    {
        title: 'Unit',
        dataIndex: 'unit',
        key: 'unit',
        width: '8%',
        render: (text) => text || '-',
    },
    {
        title: 'Plant Sub Section',
        dataIndex: 'plant_sub_section_name',
        key: 'plant_sub_section_name',
        width: '10%',
        render: (text) => text || '-',
    },
    {
        title: 'Device',
        dataIndex: 'device_name',
        key: 'device_name',
        width: '12%',
        render: (text) => text || '-',
        hidden: true,
    },
    {
        title: 'Status',
        dataIndex: 'is_active',
        key: 'is_active',
        width: '5%',
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
                    icon={<EyeOutlined />}
                    onClick={() => showPreviewModal(record)}
                    style={{
                        color: '#1890ff',
                        borderColor: '#1890ff',
                    }}
                />
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(record)}
                    style={{
                        color: '#faad14',
                        borderColor: '#faad14',
                    }}
                />
                <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => showDeleteDialog(record)}
                    style={{
                        borderColor: '#ff4d4f',
                    }}
                />
            </Space>
        ),
    },
];

const ListTag = memo(function ListTag(props) {
    const [trigerFilter, setTrigerFilter] = useState(false);

    const defaultFilter = {
        criteria: '', // Global search (OR condition)
        name: '',
        code: '',
        data: '',
        unit: '',
        device: '',
        subsection: '',
    };
    const [formDataFilter, setFormDataFilter] = useState(defaultFilter);
    const [searchValue, setSearchValue] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            if (props.actionMode == 'list') {
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
        setFormDataFilter((prev) => ({ ...prev, criteria: searchValue }));
        doFilter();
    };

    const handleSearchClear = () => {
        setSearchValue('');
        setFormDataFilter((prev) => ({ ...prev, criteria: '' }));
        doFilter();
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
            title: 'Konfirmasi',
            message: 'Apakah anda yakin hapus data "' + param.tag_name + '" ?',
            onConfirm: () => handleDelete(param.tag_id),
            onCancel: () => props.setSelectedData(null),
        });
    };

    const handleDelete = async (tag_id) => {
        try {
            const response = await deleteTag(tag_id);

            if (response && response.statusCode === 200) {
                NotifAlert({
                    icon: 'success',
                    title: 'Berhasil',
                    message: response.message || 'Data Tag berhasil dihapus.',
                });
                // Refresh table
                doFilter();
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: response?.message || 'Terjadi kesalahan saat menghapus data.',
                });
            }
        } catch (error) {
            console.error('Delete Tag Error:', error);
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: error.message || 'Terjadi kesalahan pada server. Coba lagi nanti.',
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
                                    placeholder="Search tag by code, name, or type..."
                                    value={searchValue}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchValue(value);
                                        // Auto search when clearing by backspace/delete
                                        if (value === '') {
                                            handleSearchClear();
                                        }
                                    }}
                                    onSearch={handleSearch}
                                    allowClear
                                    onClear={handleSearchClear}
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
                            header={'tag_name'}
                            showPreviewModal={showPreviewModal}
                            showEditModal={showEditModal}
                            showDeleteDialog={showDeleteDialog}
                            getData={getAllTag}
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

export default ListTag;
