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
import { deleteShift, getAllShift } from '../../../../api/master-shift';
import TableList from '../../../../components/Global/TableList';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// Helper function untuk convert ISO time ke HH:mm
const formatTime = (timeValue) => {
    if (!timeValue) return '-';
    if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}$/)) {
        return timeValue;
    }
    // UTC untuk menghindari timezone conversion
    const time = dayjs.utc(timeValue);
    return time.isValid() ? time.format('HH:mm') : '-';
};

const columns = (showPreviewModal, showEditModal, showDeleteDialog) => [
    {
        title: 'No',
        key: 'no',
        width: '5%',
        align: 'center',
        render: (_, __, index) => index + 1,
    },
    {
        title: 'Shift Name',
        dataIndex: 'shift_name',
        key: 'shift_name',
        width: '30%',
    },
    {
        title: 'Start Time',
        dataIndex: 'start_time',
        key: 'start_time',
        width: '15%',
        align: 'center',
        render: (time) => formatTime(time),
    },
    {
        title: 'End Time',
        dataIndex: 'end_time',
        key: 'end_time',
        width: '15%',
        align: 'center',
        render: (time) => formatTime(time),
    },
    {
        title: 'Status',
        dataIndex: 'is_active',
        key: 'is_active',
        width: '15%',
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
        width: '25%',
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

const ListShift = memo(function ListShift(props) {
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
            message: 'Shift "' + param.shift_name + '" akan dihapus?',
            onConfirm: () => handleDelete(param.shift_id),
            onCancel: () => props.setSelectedData(null),
        });
    };

    const handleDelete = async (shift_id) => {
        const response = await deleteShift(shift_id);
        if (response.statusCode === 200) {
            NotifAlert({
                icon: 'success',
                title: 'Berhasil',
                message: 'Data Shift berhasil dihapus.',
            });
            doFilter();
        } else {
            NotifAlert({
                icon: 'error',
                title: 'Gagal',
                message: response?.message || 'Gagal Menghapus Data Shift',
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
                                    placeholder="Cari berdasarkan nama shift..."
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
                            header={'shift_name'}
                            showPreviewModal={showPreviewModal}
                            showEditModal={showEditModal}
                            showDeleteDialog={showDeleteDialog}
                            getData={getAllShift}
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

export default ListShift;
