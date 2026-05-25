import React from 'react';
import { Card, Button, Row, Col, Typography, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CardList = ({
    data,
    column,
    header,
    showPreviewModal,
    showEditModal,
    showDeleteDialog,
    cardColor,
    fieldColor,
}) => {
    const getCardStyle = (color) => {
        const colorStyle = color ?? '#F3EDEA'; // Orange color
        return {
            border: `2px solid ${colorStyle}`,
            borderRadius: '8px',
            textAlign: 'center', // Center text
        };
    };

    const getTitleStyle = (color) => {
        const backgroundColor = color ?? '#FCF2ED';
        return {
            backgroundColor,
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block', // ganti inline-block → block
            width: 'fit-content', // biar lebarnya tetap menyesuaikan teks
        };
    };

    return (
        <Row gutter={[16, 16]} style={{ marginTop: '16px', justifyContent: 'left' }}>
            {data.map((item) => (
                <Col xs={24} sm={24} md={12} lg={6} key={item.device_id}>
                    <Card
                        title={
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between', // kiri & kanan
                                    alignItems: 'center',
                                }}
                            >
                                <span
                                    style={getTitleStyle(fieldColor ? item[fieldColor] : cardColor)}
                                >
                                    {item[header]}
                                </span>
                            </div>
                        }
                        style={getCardStyle(fieldColor ? item[fieldColor] : cardColor)}
                        actions={[
                            showPreviewModal && (
                                <EyeOutlined
                                    style={{ color: '#1890ff' }}
                                    key="preview"
                                    onClick={() => showPreviewModal(item)}
                                />
                            ),
                            showEditModal && (
                                <EditOutlined
                                    style={{ color: '#faad14' }}
                                    key="edit"
                                    onClick={() => showEditModal(item)}
                                />
                            ),
                            showDeleteDialog && (
                                <DeleteOutlined
                                    style={{ color: '#ff1818' }}
                                    key="delete"
                                    onClick={() => showDeleteDialog(item)}
                                />
                            ),
                        ].filter(Boolean)} // <== Hapus elemen yang undefined
                    >
                        <div style={{ textAlign: 'left' }}>
                            {column.map((itemCard, index) => (
                                <React.Fragment key={index}>
                                    {!itemCard.hidden &&
                                        itemCard.title !== 'No' &&
                                        itemCard.title !== 'Action' && (
                                            <p style={{ margin: '8px 0' }}>
                                                <Text strong>{itemCard.title}:</Text>{' '}
                                                {itemCard.render
                                                    ? itemCard.render(
                                                          item[itemCard.dataIndex],
                                                          item,
                                                          index
                                                      )
                                                    : item[itemCard.dataIndex] ||
                                                      item[itemCard.key] ||
                                                      '-'}
                                            </p>
                                        )}
                                </React.Fragment>
                            ))}
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default CardList;
