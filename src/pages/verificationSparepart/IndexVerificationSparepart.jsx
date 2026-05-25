import React from 'react';
import { Layout, Card, Row, Col, Typography, Button, Input } from 'antd';
import { ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Search } = Input;

const IndexVerificationSparepart = () => {
    const navigate = useNavigate();
    const { notification_error_id } = useParams();

    return (
        <Layout style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
            <Content>
                <Card>
                    <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '16px', marginBottom: '24px' }}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Button 
                                    type="text" 
                                    icon={<ArrowLeftOutlined />} 
                                    onClick={() => navigate('/notification')}
                                    style={{ paddingLeft: 0 }}
                                >
                                    Kembali ke daftar notifikasi
                                </Button>
                            </Col>
                        </Row>
                        <div style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px 4px 0 0', padding: '8px 16px', marginTop: '16px' }}>
                            <Row justify="center" align="middle">
                                <Col>
                                    <Title level={4} style={{ margin: 0, color: '#262626' }}>
                                        List Available Sparepart
                                    </Title>
                                </Col>
                            </Row>
                            <Paragraph style={{ margin: '4px 0 0', color: '#595959', textAlign: 'center' }}>
                                Select items from inventory to save changes
                            </Paragraph>
                        </div>
                        <div style={{ border: '1px solid #91d5ff', borderTop: 'none', backgroundColor: '#e6f7ff', padding: '12px 16px', borderRadius: '0 0 4px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ExclamationCircleOutlined style={{ color: '#1890ff', fontSize: '20px', marginRight: '12px' }} />
                            <Paragraph style={{ margin: 0 }}>
                                <strong>Important Notice:</strong> All items listed are currently in stock and available for immediate use. Please verify part numbers before installation. Selected items will be marked for inventory tracking.
                            </Paragraph>
                        </div>
                    </div>
                    
                    <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                        <Col>
                            <Title level={5} style={{ margin: 0 }}>• Inventory</Title>
                        </Col>
                        <Col>
                            <Search
                                placeholder="Search in inventory"
                                onSearch={value => console.log(value)}
                                style={{ width: 200 }}
                            />
                        </Col>
                    </Row>

                    {/* Konten untuk verifikasi spare part akan ditambahkan di sini */}
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Title level={5}>ID Notifikasi: {notification_error_id}</Title>
                        <p>Halaman ini dalam pengembangan. Di sini akan ditampilkan detail spare part yang perlu diverifikasi.</p>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default IndexVerificationSparepart;