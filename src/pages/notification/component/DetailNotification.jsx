import React, { memo } from 'react';
import { Row, Col, Tag, Card, Button } from 'antd';
import {
    CloseCircleFilled,
    WarningFilled,
    CheckCircleFilled,
    InfoCircleFilled,
} from '@ant-design/icons';

const DetailNotification = memo(function DetailNotification({ selectedData, onClose }) {
    if (!selectedData) {
        return null;
    }

    // Get error code data from the nested structure
    const errorCodeData = selectedData.error_code;
    // Get active solution (is_active: true) or first solution
    const activeSolution = errorCodeData?.solution?.find(sol => sol.is_active) || errorCodeData?.solution?.[0] || {};
    const sparepartsData = selectedData.spareparts || errorCodeData?.spareparts || [];

    // Determine notification type based on is_read status
    const getTypeFromStatus = () => {
        if (selectedData.is_read === false) return 'critical'; // Not read yet
        if (selectedData.is_delivered === false) return 'warning'; // Not delivered
        return 'resolved'; // Read and delivered
    };

    const getIconAndColor = (type) => {
        switch (type) {
            case 'critical':
                return {
                    IconComponent: CloseCircleFilled,
                    color: '#ff4d4f',
                    bgColor: '#fff1f0',
                    tagColor: 'error',
                };
            case 'warning':
                return {
                    IconComponent: WarningFilled,
                    color: '#faad14',
                    bgColor: '#fffbe6',
                    tagColor: 'warning',
                };
            case 'resolved':
                return {
                    IconComponent: CheckCircleFilled,
                    color: '#52c41a',
                    bgColor: '#f6ffed',
                    tagColor: 'success',
                };
            default:
                return {
                    IconComponent: InfoCircleFilled,
                    color: '#1890ff',
                    bgColor: '#e6f7ff',
                    tagColor: 'processing',
                };
        }
    };

    const notificationType = getTypeFromStatus();
    const { IconComponent, color, bgColor, tagColor } = getIconAndColor(notificationType);

    return (
        <Card
            title="Detail Notifikasi"
            extra={<Button onClick={onClose}>Tutup</Button>}
            style={{ height: '100%' }}
            bodyStyle={{ padding: '0 24px' }}
        >
            <div>
                {/* Header with Icon and Status */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '0',
                        padding: '2px 0',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                    }}
                >
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: bgColor,
                            color: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            flexShrink: 0,
                        }}
                    >
                        {IconComponent && <IconComponent style={{ fontSize: '18px' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <Tag color={tagColor} style={{ marginBottom: '2px', fontSize: '11px' }}>
                            {notificationType.toUpperCase()}
                        </Tag>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#262626' }}>
                            {errorCodeData?.error_code_name || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Information Grid */}
                <Row gutter={[16, 0]}>
                    <Col span={12}>
                        <div style={{ marginBottom: '2px' }}>
                            <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '0' }}>
                                Kode Error
                            </div>
                            <div style={{ fontSize: '13px', color: '#262626', fontWeight: 500 }}>
                                {errorCodeData?.error_code || 'N/A'}
                            </div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div style={{ marginBottom: '2px' }}>
                            <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '0' }}>
                                ID Notifikasi
                            </div>
                            <div style={{ fontSize: '13px', color: '#262626', fontWeight: 500 }}>
                                {selectedData.notification_error_id || 'N/A'}
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row gutter={[16, 0]}>
                    <Col span={12}>
                        <div style={{ marginBottom: '2px' }}>
                            <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '0' }}>
                                Solusi
                            </div>
                            <div style={{ fontSize: '13px', color: '#262626', fontWeight: 500 }}>
                                {activeSolution?.solution_name || 'N/A'}
                            </div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div style={{ marginBottom: '2px' }}>
                            <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '0' }}>
                                Waktu Dibuat
                            </div>
                            <div style={{ fontSize: '13px', color: '#262626', fontWeight: 500 }}>
                                {selectedData.created_at
                                    ? new Date(selectedData.created_at).toLocaleString('id-ID', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      }) + ' WIB'
                                    : 'N/A'}
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Status Information */}
                <Row gutter={[16, 0]}>
                    <Col span={8}>
                        <div style={{ marginBottom: '2px' }}>
                            <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '0' }}>
                                Status Kirim
                            </div>
                            <Tag color={selectedData.is_send ? 'success' : 'error'}>
                                {selectedData.is_send ? 'Terkirim' : 'Belum Terkirim'}
                            </Tag>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div style={{ marginBottom: '2px' }}>
                            <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '0' }}>
                                Status Terkirim
                            </div>
                            <Tag color={selectedData.is_delivered ? 'success' : 'warning'}>
                                {selectedData.is_delivered ? 'Terkirim' : 'Belum Terkirim'}
                            </Tag>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div style={{ marginBottom: '2px' }}>
                            <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '0' }}>
                                Status Baca
                            </div>
                            <Tag color={selectedData.is_read ? 'success' : 'processing'}>
                                {selectedData.is_read ? 'Dibaca' : 'Belum Dibaca'}
                            </Tag>
                        </div>
                    </Col>
                </Row>

                {/* Description */}
                <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '4px' }}>
                        Deskripsi Error
                    </div>
                    <div
                        style={{
                            fontSize: '13px',
                            color: '#262626',
                            fontWeight: 500,
                            padding: '8px',
                            backgroundColor: '#fafafa',
                            borderRadius: '4px',
                            border: '1px solid #f0f0f0',
                        }}
                    >
                        {selectedData.message_error_issue || 'N/A'}
                    </div>
                </div>

                {/* Spareparts Information */}
                {sparepartsData.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '4px' }}>
                            Spareparts Terkait
                        </div>
                        {sparepartsData.map((sparepart, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '8px',
                                    marginBottom: '4px',
                                    backgroundColor: '#fafafa',
                                    borderRadius: '4px',
                                    border: '1px solid #f0f0f0',
                                }}
                            >
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                    {sparepart.sparepart_name}
                                </div>
                                <div style={{ fontSize: '12px' }}>
                                    Kode: {sparepart.sparepart_code} | Stok:{' '}
                                    {sparepart.sparepart_stok}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
});

export default DetailNotification;
