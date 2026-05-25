import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Card, Button, Row, Col, Typography, Divider, Tag, Space, InputNumber, Input } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { updateSparepart } from '../../../../api/sparepart';
import { NotifAlert, NotifOk } from '../../../../components/Global/ToastNotif';

const { Text, Title } = Typography;

const SparepartCardList = ({
    data,
    header,
    showPreviewModal,
    showEditModal,
    showDeleteDialog,
    fieldColor,
    cardColor,
    onStockUpdate, // Prop to refresh the list
}) => {
    const [updateQuantities, setUpdateQuantities] = useState({});
    const [loadingQuantities, setLoadingQuantities] = useState({});

    const handleQuantityChange = (id, value) => {
        // Prevent the adjustment from going below the negative value of the original quantity
        // This ensures the final quantity (original + adjustment) never goes below 0
        const originalQty = data.find((item) => item.sparepart_id === id)?.sparepart_qty || 0;
        const maxNegativeAdjustment = -originalQty;

        const clampedValue = Math.max(value, maxNegativeAdjustment);

        const newQuantities = { ...updateQuantities };
        newQuantities[id] = clampedValue;
        setUpdateQuantities(newQuantities);
    };

    const handleUpdateStock = async (item) => {
        const quantityToAdd = updateQuantities[item.sparepart_id] || 0;
        if (quantityToAdd === 0) {
            NotifAlert({
                icon: 'info',
                title: 'Info',
                message: 'Please change the quantity first.',
            });
            return;
        }

        const currentQty = Number(item.sparepart_qty) || 0;
        const newQty = currentQty + quantityToAdd;
        if (newQty < 0) {
            NotifAlert({ icon: 'error', title: 'Error', message: 'Quantity cannot be negative.' });
            return;
        }

        setLoadingQuantities((prev) => ({ ...prev, [item.sparepart_id]: true }));

        // sparepart_qty disimpan sebagai angka kuantitas (update boleh 0 sesuai validasi update schema)
        const payload = {
            sparepart_qty: newQty,
            sparepart_stok: newQty > 0 ? 'Available' : 'Not Available', // Otomatis tentukan status
        };

        // Hanya tambahkan field jika nilainya tidak kosong untuk menghindari validasi error
        if (item.sparepart_unit && item.sparepart_unit.trim() !== '') {
            payload.sparepart_unit = item.sparepart_unit;
        }
        if (item.sparepart_merk && item.sparepart_merk.trim() !== '') {
            payload.sparepart_merk = item.sparepart_merk;
        }
        if (item.sparepart_model && item.sparepart_model.trim() !== '') {
            payload.sparepart_model = item.sparepart_model;
        }
        if (item.sparepart_description && item.sparepart_description.trim() !== '') {
            payload.sparepart_description = item.sparepart_description;
        }
        if (item.sparepart_item_type && item.sparepart_item_type !== null) {
            payload.sparepart_item_type = item.sparepart_item_type;
        }
        if (item.sparepart_foto && item.sparepart_foto.trim() !== '') {
            payload.sparepart_foto = item.sparepart_foto;
        }

        try {
            const response = await updateSparepart(item.sparepart_id, payload);

            // Periksa apakah response valid sebelum mengakses propertinya
            if (response && response.statusCode === 200) {
                NotifOk({
                    icon: 'success',
                    title: 'Success',
                    message: 'Stock updated successfully.',
                });

                // Cek apakah qty baru kurang dari 1, tampilkan alert
                if (newQty < 1) {
                    NotifAlert({
                        icon: 'warning',
                        title: 'Low Stock',
                        message: `Warning: Sparepart "${item.sparepart_name}" is out of stock. Please restock immediately.`,
                    });
                }

                if (onStockUpdate) {
                    onStockUpdate();
                }
                handleQuantityChange(item.sparepart_id, 0); // Reset quantity
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Failed',
                    message: response?.message || 'Failed to update stock.',
                });
            }
        } catch (error) {
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: error.message || 'An error occurred.',
            });
        } finally {
            setLoadingQuantities((prev) => ({ ...prev, [item.sparepart_id]: false }));
        }
    };

    return (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            {data.map((item) => {
                const quantity = updateQuantities[item.sparepart_id] || 0;
                const isLoading = loadingQuantities[item.sparepart_id] || false;

                return (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.sparepart_id || item.key}>
                        <Card
                            style={{
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: `1px solid ${
                                    fieldColor ? item[fieldColor] : cardColor || '#E0E0E0'
                                }`,
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
                            <Row>
                                <Col span={8}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                            padding: '16px 8px',
                                            height: '100%',
                                        }}
                                    >
                                        {item.sparepart_item_type && (
                                            <Tag
                                                color="blue"
                                                style={{
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                {item.sparepart_item_type}
                                            </Tag>
                                        )}
                                        <div
                                            style={{
                                                backgroundColor: '#f0f0f0',
                                                width: '100%',
                                                paddingTop:
                                                    '100%' /* Ini membuat tinggi sama dengan lebar (aspect ratio 1:1) */,
                                                position: 'relative',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {(() => {
                                                // Debug: log the image path construction
                                                let imgSrc;
                                                if (item.sparepart_foto) {
                                                    if (item.sparepart_foto.startsWith('http')) {
                                                        imgSrc = item.sparepart_foto;
                                                    } else {
                                                        // Gunakan format file URL seperti di brandDevice
                                                        const fileName = item.sparepart_foto
                                                            .split('/')
                                                            .pop();

                                                        // Jika filename adalah default file, gunakan dari public assets
                                                        if (
                                                            fileName === 'defaultSparepartImg.jpg'
                                                        ) {
                                                            imgSrc = `/assets/defaultSparepartImg.jpg`;
                                                        } else {
                                                            // Gunakan API getFileUrl untuk mendapatkan URL yang benar untuk file upload
                                                            const token =
                                                                localStorage.getItem('token');
                                                            const baseURL =
                                                                import.meta.env.VITE_API_SERVER ||
                                                                '';
                                                            imgSrc = `${baseURL}/file-uploads/images/${encodeURIComponent(
                                                                fileName
                                                            )}${
                                                                token
                                                                    ? `?token=${encodeURIComponent(
                                                                          token
                                                                      )}`
                                                                    : ''
                                                            }`;
                                                        }
                                                    }
                                                    console.log(
                                                        'Image path being constructed:',
                                                        imgSrc
                                                    );
                                                } else {
                                                    imgSrc = 'https://via.placeholder.com/150';
                                                }
                                                return (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                        }}
                                                    >
                                                        <img
                                                            src={imgSrc}
                                                            alt={item[header]}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover', // Mengisi container dan crop sisi berlebih
                                                            }}
                                                            onError={(e) => {
                                                                console.error(
                                                                    'Image failed to load:',
                                                                    imgSrc
                                                                );
                                                                e.target.src =
                                                                    'https://via.placeholder.com/150';
                                                            }}
                                                            onLoad={() =>
                                                                console.log(
                                                                    'Image loaded successfully:',
                                                                    imgSrc
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </Col>
                                <Col span={16}>
                                    <div
                                        style={{
                                            padding: '16px',
                                            position: 'relative',
                                            height: '100%',
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                display: 'flex',
                                                gap: '8px',
                                            }}
                                        >
                                            {showEditModal && (
                                                <Button
                                                    style={{
                                                        color: '#faad14',
                                                        borderColor: '#faad14',
                                                    }}
                                                    icon={<EditOutlined />}
                                                    key="edit"
                                                    onClick={() => showEditModal(item)}
                                                    size="small"
                                                />
                                            )}
                                            {showDeleteDialog && (
                                                <Button
                                                    icon={<DeleteOutlined />}
                                                    key="delete"
                                                    onClick={() => showDeleteDialog(item)}
                                                    size="small"
                                                    danger
                                                />
                                            )}
                                        </div>
                                        <Title
                                            level={5}
                                            style={{
                                                margin: 0,
                                                marginBottom: '8px',
                                                paddingRight: '60px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {item[header]}
                                        </Title>
                                        <Text type="secondary" style={{ display: 'block' }}>
                                            Stok: {item.sparepart_stok || 'Not Available'}
                                        </Text>
                                        <Divider style={{ margin: '8px 0' }} />

                                        <Space
                                            align="center"
                                            style={{
                                                marginBottom: '8px',
                                                display: 'flex',
                                            }}
                                        >
                                            <Text type="secondary">Qty</Text>
                                            <Button
                                                icon={<MinusOutlined />}
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item.sparepart_id,
                                                        quantity - 1
                                                    )
                                                }
                                                disabled={
                                                    isLoading || item.sparepart_qty + quantity <= 0
                                                }
                                                style={{ width: 28, height: 28 }}
                                            />
                                            <Text
                                                strong
                                                style={{ padding: '0 8px', fontSize: '16px' }}
                                            >
                                                {item.sparepart_qty + (quantity || 0)}
                                            </Text>
                                            <Button
                                                icon={<PlusOutlined />}
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item.sparepart_id,
                                                        quantity + 1
                                                    )
                                                }
                                                disabled={isLoading}
                                                style={{ width: 28, height: 28 }}
                                            />
                                            <Text type="secondary">
                                                {item.sparepart_unit
                                                    ? ` / ${item.sparepart_unit}`
                                                    : ' / pcs'}
                                            </Text>
                                        </Space>

                                        {quantity !== 0 && (
                                            <Button
                                                type={quantity === 0 ? 'default' : 'primary'}
                                                size="small"
                                                style={{ width: '100%' }}
                                                onClick={() => handleUpdateStock(item)}
                                                loading={isLoading}
                                            >
                                                Update Stock
                                            </Button>
                                        )}

                                        <br />
                                        <Text
                                            type="secondary"
                                            style={{
                                                fontSize: '12px',
                                                marginTop: '8px',
                                                display: 'inline-block',
                                            }}
                                        >
                                            Last updated:{' '}
                                            {item.updated_at
                                                ? dayjs(item.updated_at).format('DD MMM YYYY')
                                                : 'N/A'}
                                        </Text>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};

export default SparepartCardList;
