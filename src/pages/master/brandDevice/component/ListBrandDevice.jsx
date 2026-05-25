import React, { memo, useState, useEffect } from 'react';
import { Button, Col, Row, Space, Input, ConfigProvider, Card, Tag, Spin } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { NotifAlert, NotifConfirmDialog, NotifOk } from '../../../../components/Global/ToastNotif';
import { useNavigate } from 'react-router-dom';
import TableList from '../../../../components/Global/TableList';
import { getAllBrands, deleteBrand } from '../../../../api/master-brand';

const columns = (showPreviewModal, showEditModal, showDeleteDialog) => [
    {
        title: 'No',
        key: 'no',
        width: '5%',
        align: 'center',
        render: (_, __, index) => index + 1,
    },
    {
        title: 'Brand Device ',
        dataIndex: 'brand_name',
        key: 'brand_name',
        width: '20%',
    },
    {
        title: 'Manufacturer',
        dataIndex: 'brand_manufacture',
        key: 'brand_manufacture',
        width: '20%',
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
        key: 'action',
        align: 'center',
        width: '15%',
        render: (_, record) => (
            <Space>
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => showPreviewModal(record)}
                    style={{
                        color: '#1890ff',
                        borderColor: '#1890ff',
                    }}
                />
                <Button
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(record)}
                    style={{
                        color: '#faad14',
                        borderColor: '#faad14',
                    }}
                />
                <Button
                    danger
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

const ListBrandDevice = memo(function ListBrandDevice(props) {
    const [trigerFilter, setTrigerFilter] = useState(false);

    const defaultFilter = { criteria: '' };
    const [formDataFilter, setFormDataFilter] = useState(defaultFilter);
    const [searchText, setSearchText] = useState('');

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
    }, [props.actionMode, navigate]);

    const doFilter = () => {
        setTrigerFilter((prev) => !prev);
    };

    const handleSearch = () => {
        setFormDataFilter({ criteria: searchText });
        setTrigerFilter((prev) => !prev);
    };

    const handleSearchClear = () => {
        setSearchText('');
        setFormDataFilter({ criteria: '' });
        setTrigerFilter((prev) => !prev);
    };

    const showPreviewModal = (param) => {
        navigate(`/master/brand-device/view/${param.brand_id}`);
    };

    const showEditModal = (param = null) => {
        if (param) {
            navigate(`/master/brand-device/edit/${param.brand_id}`);
        } else {
            navigate('/master/brand-device/add');
        }
    };

    const showDeleteDialog = (param) => {
        NotifConfirmDialog({
            icon: 'question',
            title: 'Konfirmasi',
            message: 'Apakah anda yakin hapus data "' + param.brand_name + '" ?',
            onConfirm: () => handleDelete(param.brand_id, param.brand_name),
            onCancel: () => { },
        });
    };

    const handleDelete = async (brand_id, brand_name) => {
        try {
            const response = await deleteBrand(brand_id);

            if (response && response.statusCode === 200) {
                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `Brand ${brand_name} deleted successfully.`,
                });
                doFilter();
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: response?.message || 'Gagal menghapus Data Brand Device',
                });
            }
        } catch (error) {
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: error.message || 'Gagal menghapus Data Brand Device',
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
                                    placeholder="Search brand device..."
                                    value={searchText}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchText(value);
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
                                            onClick={() => {
                                                navigate('/master/brand-device/add');
                                            }}
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
                            header={'brand_name'}
                            showPreviewModal={showPreviewModal}
                            showEditModal={showEditModal}
                            showDeleteDialog={showDeleteDialog}
                            getData={getAllBrands}
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

export default ListBrandDevice;
