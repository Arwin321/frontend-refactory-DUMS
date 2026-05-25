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
import { deletePlantSection, getAllPlantSection } from '../../../../api/master-plant-section';
import TableList from '../../../../components/Global/TableList';

const columns = (showPreviewModal, showEditModal, showDeleteDialog) => [
    {
        title: 'No',
        key: 'no',
        width: '5%',
        align: 'center',
        render: (_, __, index) => index + 1,
    },
    {
        title: 'Plant Sub Section Code',
        dataIndex: 'plant_sub_section_code',
        key: 'plant_sub_section_code',
        width: '10%',
        align: 'center',
        hidden: true,
    },
    {
        title: 'Plant Sub Section Name',
        dataIndex: 'plant_sub_section_name',
        key: 'plant_sub_section_name',
        width: '15%',
    },
    {
        title: 'Description',
        dataIndex: 'plant_sub_section_description',
        key: 'plant_sub_section_description',
        width: '30%',
        render: (text) => text || '-',
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
                    icon={<EyeOutlined />}
                    onClick={() => showPreviewModal(record)}
                    style={{ color: '#1890ff', borderColor: '#1890ff' }}
                    title="View"
                />
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(record)}
                    style={{ color: '#faad14', borderColor: '#faad14' }}
                    title="Edit"
                />
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => showDeleteDialog(record)}
                    style={{ borderColor: '#ff4d4f' }}
                    title="Delete"
                />
            </Space>
        ),
    },
];

const ListPlantSubSection = memo(function ListPlantSubSection(props) {
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
            message: `Plant Sub Section "${param.plant_sub_section_name}" akan dihapus?`,
            onConfirm: () => handleDelete(param.plant_sub_section_id),
            onCancel: () => props.setSelectedData(null),
        });
    };

    const handleDelete = async (sub_section_id) => {
        const response = await deletePlantSection(sub_section_id);
        if (response.statusCode === 200) {
            NotifAlert({
                icon: 'success',
                title: 'Berhasil',
                message: 'Data Plant Section berhasil dihapus.',
            });
            doFilter();
        } else {
            NotifAlert({
                icon: 'error',
                title: 'Gagal',
                message: response?.message || 'Gagal Menghapus Data Plant Section',
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
                                    placeholder="Search section by name or code..."
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
                                            Add data
                                        </Button>
                                    </ConfigProvider>
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={24} style={{ marginTop: '16px' }}>
                        <TableList
                            mobile
                            cardColor={'#42AAFF'}
                            header={'plant_sub_section_name'}
                            showPreviewModal={showPreviewModal}
                            showEditModal={showEditModal}
                            showDeleteDialog={showDeleteDialog}
                            getData={getAllPlantSection}
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

export default ListPlantSubSection;
