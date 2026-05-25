import React, { useState, useEffect, useMemo } from 'react';
import { Card, Input, Button, Row, Col, Empty } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { getErrorCodesByBrandId, deleteErrorCode } from '../../../../api/master-brand';
import { NotifAlert, NotifOk, NotifConfirmDialog } from '../../../../components/Global/ToastNotif';

const ListErrorCode = ({
    brandId,
    selectedErrorCode,
    onErrorCodeSelect,
    onAddNew,
    tempErrorCodes = [],
    trigerFilter,
    searchText,
    onSearchChange,
    onSearch,
    onSearchClear,
    isReadOnly = false,
    errorCodes: propErrorCodes = null
}) => {
    const [errorCodes, setErrorCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        current_limit: 15,
        total_limit: 0,
        total_page: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', pageSize.toString());
        if (searchText) {
            params.set('criteria', searchText);
        }
        return params;
    }, [searchText, currentPage, pageSize]);

    const fetchErrorCodes = async () => {
        if (!brandId) {
            setErrorCodes([]);
            return;
        }

        setLoading(true);
        try {
            const response = await getErrorCodesByBrandId(brandId, queryParams);

            if (response && response.statusCode === 200) {
                const apiErrorData = response.data || [];
                const allErrorCodes = [
                    ...apiErrorData.map(ec => ({
                        ...ec,
                        tempId: `existing_${ec.error_code_id}`,
                        status: 'existing'
                    })),
                    ...tempErrorCodes.filter(ec => ec.status !== 'deleted')
                ];

                setErrorCodes(allErrorCodes);

                if (response.paging) {
                    setPagination({
                        current_page: response.paging.current_page || 1,
                        current_limit: response.paging.current_limit || 15,
                        total_limit: response.paging.total_limit || 0,
                        total_page: response.paging.total_page || 0,
                    });
                }
            } else {
                setErrorCodes([]);
            }
        } catch (error) {
            setErrorCodes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isReadOnly && propErrorCodes) {

            setErrorCodes(propErrorCodes);
            setLoading(false);
        } else {

            fetchErrorCodes();
        }
    }, [brandId, queryParams, tempErrorCodes, trigerFilter, isReadOnly, propErrorCodes]);

    const handlePrevious = () => {
        if (pagination.current_page > 1) {
            setCurrentPage(pagination.current_page - 1);
        }
    };

    const handleNext = () => {
        if (pagination.current_page < pagination.total_page) {
            setCurrentPage(pagination.current_page + 1);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        if (onSearch) {
            onSearch();
        }
    };

    const handleSearchClear = () => {
        setCurrentPage(1);
        if (onSearchClear) {
            onSearchClear();
        }
    };

    const handleDelete = async (item, e) => {
        e.stopPropagation();

        if (item.status === 'existing' && item.error_code_id) {
            NotifConfirmDialog({
                icon: 'warning',
                title: 'Hapus Error Code',
                message: `Apakah Anda yakin ingin menghapus error code ${item.error_code}?`,
                onConfirm: () => performDelete(item),
                onCancel: () => { },
                confirmButtonText: 'Hapus'
            });
        }
    };

    const performDelete = async (item) => {
        try {

            if (!item.error_code_id || item.error_code_id === 'undefined') {
                NotifAlert({
                    icon: 'error',
                    title: 'Error',
                    message: 'Error code ID tidak valid'
                });
                return;
            }

            if (!item.brand_id || item.brand_id === 'undefined') {
                NotifAlert({
                    icon: 'error',
                    title: 'Error',
                    message: 'Brand ID tidak valid'
                });
                return;
            }

            const response = await deleteErrorCode(item.brand_id, item.error_code_id);

            if (response && response.statusCode === 200) {
                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: 'Error code berhasil dihapus'
                });
                fetchErrorCodes();
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: 'Gagal menghapus error code'
                });
            }
        } catch (error) {
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: 'Terjadi kesalahan saat menghapus error code'
            });
        }
    };

    return (
        <Card
            title="Daftar Error Code"
            style={{ width: '100%', minWidth: '472px' }}
            styles={{ body: { padding: '12px' } }}
        >
            <Input.Search
                placeholder="Cari error code..."
                value={searchText}
                onChange={(e) => {
                    const value = e.target.value;
                    if (onSearchChange) {
                        onSearchChange(value);
                    }
                }}
                onSearch={handleSearch}
                allowClear
                enterButton={
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleSearch}
                        style={{
                            backgroundColor: '#23A55A',
                            borderColor: '#23A55A',
                            height: '32px'
                        }}
                    >
                        Search
                    </Button>
                }
                size="default"
                style={{
                    marginBottom: 12,
                    height: '32px',
                    width: '100%',
                }}
            />

            <div style={{
                height: '90vh',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                overflow: 'auto',
                marginBottom: 12,
                backgroundColor: '#fafafa'
            }}>
                {errorCodes.length === 0 ? (
                    <Empty
                        description="Belum ada error code"
                        style={{ marginTop: 50 }}
                    />
                ) : (
                    <div style={{ padding: '8px' }}>
                        {errorCodes.map((item) => (
                            <div
                                key={item.tempId || item.error_code_id}
                                style={{
                                    cursor: 'pointer',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    marginBottom: '4px',
                                    border: selectedErrorCode?.tempId === item.tempId ? '2px solid #23A55A' : '1px solid #d9d9d9',
                                    backgroundColor: selectedErrorCode?.tempId === item.tempId ? '#f6ffed' : '#fff',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => onErrorCodeSelect(item)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                                            {item.error_code}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#666' }}>
                                            {item.error_code_name}
                                        </div>
                                    </div>
                                    {item.status === 'existing' && (
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => handleDelete(item, e)}
                                            style={{
                                                padding: '2px 6px',
                                                height: '24px',
                                                fontSize: '11px',
                                                border: '1px solid #ff4d4f'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {pagination.total_limit > 0 && (
                <Row justify="space-between" align="middle" gutter={16}>
                    <Col flex="auto">
                        <span style={{ fontSize: '12px', color: '#666' }}>
                            Menampilkan {pagination.current_limit} data halaman{' '}
                            {pagination.current_page} dari total {pagination.total_limit} data
                        </span>
                    </Col>
                    <Col flex="none">
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Button
                                icon={<LeftOutlined />}
                                onClick={handlePrevious}
                                disabled={pagination.current_page <= 1}
                                size="small"
                            >
                            </Button>
                            <span style={{ fontSize: '12px', color: '#666', minWidth: '60px', textAlign: 'center' }}>
                                {pagination.current_page} / {pagination.total_page}
                            </span>
                            <Button
                                icon={<RightOutlined />}
                                onClick={handleNext}
                                disabled={pagination.current_page >= pagination.total_page}
                                size="small"
                            >
                            </Button>
                        </div>
                    </Col>
                </Row>
            )}
        </Card>
    );
};

export default ListErrorCode;