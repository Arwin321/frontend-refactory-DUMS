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
import { deleteSparepart, getAllSparepart } from '../../../../api/sparepart';
import TableList from '../../../../components/Global/TableList';
import SparepartCardList from './SparepartCardList'; // Import the new custom card component

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
        dataIndex: 'sparepart_id',
        key: 'sparepart_id',
        width: '5%',
        hidden: 'true',
    },
    {
        title: 'Sparepart Name',
        dataIndex: 'sparepart_name',
        key: 'sparepart_name',
        width: '20%',
    },
    {
        title: 'Description',
        dataIndex: 'sparepart_description',
        key: 'sparepart_description',
        width: '20%',
        render: (sparepart_description) => sparepart_description || '-'
    },
    {
        title: 'Model',
        dataIndex: 'sparepart_model',
        key: 'sparepart_model',
        width: '10%',
        render: (sparepart_model) => sparepart_model || '-'
    },
    {
        title: 'Item Type',
        dataIndex: 'sparepart_item_type',
        key: 'sparepart_item_type',
        width: '10%',
        render: (sparepart_item_type) => sparepart_item_type || '-'
    },
    {
        title: 'Unit',
        dataIndex: 'sparepart_unit',
        key: 'sparepart_unit',
        width: '8%',
        render: (sparepart_unit) => sparepart_unit || '-'
    },
    {
        title: 'Merk',
        dataIndex: 'sparepart_merk',
        key: 'sparepart_merk',
        width: '12%',
        render: (sparepart_merk) => sparepart_merk || '-'
    },
    {
        title: 'Qty',
        dataIndex: 'sparepart_qty',
        key: 'sparepart_qty',
        width: '8%',
        render: (sparepart_qty) => sparepart_qty || '0'
    },
    {
        title: 'Status',
        dataIndex: 'sparepart_stok',
        key: 'sparepart_stok',
        width: '8%',
        render: (sparepart_stok) => sparepart_stok || 'Not Available'
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

const ListSparepart = memo(function ListSparepart(props) {
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
            message: 'Sparepart "' + param.sparepart_name + '" akan dihapus?',
            onConfirm: () => handleDelete(param.sparepart_id),
            onCancel: () => props.setSelectedData(null),
        });
    };

    const handleDelete = async (sparepart_id) => {
        const response = await deleteSparepart(sparepart_id);

        if (response.statusCode === 200 && response.data === true) {
            NotifAlert({
                icon: 'success',
                title: 'Berhasil',
                message: response.message || 'Data Sparepart berhasil dihapus.',
            });
            doFilter();
        } else {
            NotifOk({
                icon: 'error',
                title: 'Gagal',
                message: response?.message || 'Gagal Menghapus Data Sparepart',
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
                                    placeholder="Search sparepart by name, model, or merk..."
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
                            header={'sparepart_name'}
                            showPreviewModal={showPreviewModal}
                            showEditModal={showEditModal}
                            showDeleteDialog={showDeleteDialog}
                            getData={getAllSparepart}
                            queryParams={formDataFilter}
                            columns={columns(showPreviewModal, showEditModal, showDeleteDialog)}
                            triger={trigerFilter}
                            cardComponent={SparepartCardList} // Pass the custom component here
                            onStockUpdate={doFilter}
                            onGetData={(data) => {
                                if(data && data.length > 0) {
                                    console.log('Sample sparepart data from API:', data[0]);
                                    console.log('Available fields:', Object.keys(data[0] || {}));
                                }
                            }} // Log untuk debugging field-field yang tersedia
                        />
                    </Col>
                </Row>
            </Card>
        </React.Fragment>
    );
});

export default ListSparepart;