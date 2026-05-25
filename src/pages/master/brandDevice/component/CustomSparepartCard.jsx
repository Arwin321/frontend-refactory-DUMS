import React, { useState } from 'react';
import { Card, Typography, Tag, Button, Modal, Row, Col, Space } from 'antd';
import { EyeOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const CustomSparepartCard = ({
    sparepart,
    isSelected = false,
    isReadOnly = false,
    showPreview = true,
    showDelete = false,
    onPreview,
    onDelete,
    onCardClick,
    loading = false,
    size = 'small',
    style = {},
}) => {
    const [previewModalVisible, setPreviewModalVisible] = useState(false);

    const getImageSrc = () => {
        if (sparepart.sparepart_foto) {
            if (sparepart.sparepart_foto.startsWith('http')) {
                return sparepart.sparepart_foto;
            } else {
                const fileName = sparepart.sparepart_foto.split('/').pop();
                if (fileName === 'defaultSparepartImg.jpg') {
                    return `/assets/defaultSparepartImg.jpg`;
                } else {
                    const token = localStorage.getItem('token');
                    const baseURL = import.meta.env.VITE_API_SERVER || '';
                    return `${baseURL}/file-uploads/images/${encodeURIComponent(fileName)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
                }
            }
        }
        return 'https://via.placeholder.com/150';
    };

    const handlePreview = () => {
        if (onPreview) {
            onPreview(sparepart);
        } else {
            setPreviewModalVisible(true);
        }
    };

    const truncateText = (text, maxLength = 15) => {
        if (!text) return 'Unnamed';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    const handleCardClick = () => {
        if (!isReadOnly && onCardClick) {
            onCardClick(sparepart);
        }
    };

    const getCardActions = () => {
        const actions = [];

        if (showPreview) {
            actions.push(
                <Button
                    key="preview"
                    type="text"
                    icon={<EyeOutlined />}
                    title="Lihat Detail"
                    style={{ color: '#1890ff' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePreview();
                    }}
                />
            );
        }

        if (showDelete && !isReadOnly) {
            actions.push(
                <Button
                    key="delete"
                    type="text"
                    icon={<DeleteOutlined />}
                    title="Hapus"
                    style={{ color: '#ff4d4f' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(sparepart);
                    }}
                />
            );
        }

        return actions;
    };

    const getCardStyle = () => {
        const baseStyle = {
            borderRadius: '12px',
            overflow: 'hidden',
            border: isSelected ? '2px solid #1890ff' : '1px solid #E0E0E0',
            cursor: isReadOnly ? 'default' : 'pointer',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'all 0.3s ease'
        };

        switch (size) {
            case 'small':
                return {
                    ...baseStyle,
                    height: '180px',
                    minHeight: '180px'
                };
            case 'large':
                return {
                    ...baseStyle,
                    height: '280px',
                    minHeight: '280px'
                };
            default:
                return {
                    ...baseStyle,
                    height: '220px',
                    minHeight: '220px'
                };
        }
    };

    return (
        <>
            <div
                style={{
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    backgroundColor: 'white',
                    cursor: onCardClick && !isReadOnly ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
                onClick={handleCardClick}
            >
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <Text
                            strong
                            style={{
                                fontSize: '14px',
                                color: '#262626',
                                marginRight: '12px'
                            }}
                            title={sparepart.sparepart_name || sparepart.name || 'Unnamed'}
                        >
                            {truncateText(sparepart.sparepart_name || sparepart.name || 'Unnamed')}
                        </Text>
                        <Tag
                            color={sparepart.sparepart_stok === 'Available' ? 'green' : 'red'}
                            style={{ fontSize: '11px', margin: 0 }}
                        >
                            {sparepart.sparepart_stok || 'Not Available'}
                        </Tag>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontSize: '12px', color: '#666', marginRight: '4px' }}>
                                qty:
                            </Text>
                            <Text
                                style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#262626'
                                }}
                            >
                                {sparepart.sparepart_qty || 0}
                            </Text>
                        </div>
                    </div>
                </div>

                <Space size="small">
                    {showPreview && (
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePreview();
                            }}
                            title="Preview"
                        />
                    )}
                    {showDelete && !isReadOnly && (
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(sparepart);
                            }}
                            title="Remove"
                        />
                    )}
                </Space>
            </div>


            <Modal
                title="Sparepart Details"
                open={previewModalVisible}
                onCancel={() => setPreviewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={800}
                centered
                styles={{ body: { padding: '24px' } }}
            >
                <Row gutter={[24, 24]}>
                    <Col span={10}>
                        <div style={{ textAlign: 'center' }}>
                            <div
                                style={{
                                    backgroundColor: '#f0f0f0',
                                    width: '220px',
                                    height: '220px',
                                    margin: '0 auto 16px',
                                    position: 'relative',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid #E0E0E0',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                <img
                                    src={getImageSrc()}
                                    alt={sparepart.sparepart_name || 'Sparepart'}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/220x220/d9d9d9/666666?text=No+Image';
                                    }}
                                />
                            </div>


                            {sparepart.sparepart_item_type && (
                                <div style={{ marginBottom: '12px' }}>
                                    <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                                        {sparepart.sparepart_item_type}
                                    </Tag>
                                </div>
                            )}


                            <div style={{
                                textAlign: 'left',
                                background: '#f8f9fa',
                                padding: '12px',
                                borderRadius: '8px',
                                marginTop: '25px'
                            }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <Text strong style={{ fontSize: '14px', color: '#262626' }}>Stock Status:</Text>
                                    <Tag
                                        color={sparepart.sparepart_stok === 'Available' ? 'green' : 'red'}
                                        style={{ marginLeft: '8px', fontSize: '12px' }}
                                    >
                                        {sparepart.sparepart_stok || 'Not Available'}
                                    </Tag>
                                </div>
                                <div>
                                    <Text strong style={{ fontSize: '14px', color: '#262626' }}>Quantity:</Text>
                                    <Text style={{ fontSize: '14px', marginLeft: '8px', fontWeight: 600 }}>
                                        {sparepart.sparepart_qty || 0} {sparepart.sparepart_unit || ''}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col span={14}>
                        <div>

                            <Title level={3} style={{ marginBottom: '20px', color: '#262626' }}>
                                {sparepart.sparepart_name || 'Unnamed'}
                            </Title>


                            <div style={{ marginBottom: '24px' }}>
                                <Row gutter={[16, 12]}>
                                    <Col span={24}>
                                        <div style={{
                                            padding: '12px',
                                            backgroundColor: '#fafafa',
                                            borderRadius: '8px',
                                            border: '1px solid #f0f0f0'
                                        }}>
                                            <Row gutter={16}>
                                                <Col span={8}>
                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>Code</Text>
                                                        <div style={{ fontSize: '15px', fontWeight: 500, marginTop: '2px' }}>
                                                            {sparepart.sparepart_code || 'N/A'}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col span={8}>
                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>Brand</Text>
                                                        <div style={{ fontSize: '15px', fontWeight: 500, marginTop: '2px' }}>
                                                            {sparepart.sparepart_merk || '-'}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col span={8}>
                                                    <div>
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>Unit</Text>
                                                        <div style={{ fontSize: '15px', fontWeight: 500, marginTop: '2px' }}>
                                                            {sparepart.sparepart_unit || '-'}
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>

                                    {sparepart.sparepart_model && (
                                        <Col span={24}>
                                            <div>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Model</Text>
                                                <div style={{ fontSize: '15px', fontWeight: 500, marginTop: '2px' }}>
                                                    {sparepart.sparepart_model}
                                                </div>
                                            </div>
                                        </Col>
                                    )}

                                    {sparepart.sparepart_description && (
                                        <Col span={24}>
                                            <div>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Description</Text>
                                                <div style={{ fontSize: '15px', marginTop: '2px', lineHeight: '1.5' }}>
                                                    {sparepart.sparepart_description}
                                                </div>
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                            </div>


                            {sparepart.created_at && (
                                <div>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <div>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Created</Text>
                                                <div style={{ fontSize: '13px', marginTop: '2px' }}>
                                                    {dayjs(sparepart.created_at).format('DD MMM YYYY, HH:mm')}
                                                </div>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Last Updated</Text>
                                                <div style={{ fontSize: '13px', marginTop: '2px' }}>
                                                    {dayjs(sparepart.updated_at).format('DD MMM YYYY, HH:mm')}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Modal>
        </>
    );
};

export default CustomSparepartCard;