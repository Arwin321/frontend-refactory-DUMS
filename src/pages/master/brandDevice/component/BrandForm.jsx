import React from 'react';
import { Form, Input, Row, Col, Typography, Switch } from 'antd';

const { Text } = Typography;

const BrandForm = ({
    form,
    onValuesChange,
    isEdit = false,
    brandInfo = null,
    readOnly = false,
}) => {
    const isActive = Form.useWatch('is_active', form) ?? true;

    React.useEffect(() => {
        if (brandInfo && brandInfo.brand_code) {
            form.setFieldsValue({
                brand_code: brandInfo.brand_code
            });
        }
    }, [brandInfo, form]);

    return (
        <div>
            <Form
                layout="vertical"
                form={form}
                onValuesChange={onValuesChange}
                initialValues={{
                    brand_name: '',
                    brand_type: '',
                    brand_model: '',
                    brand_manufacture: '',
                    is_active: true,
                }}
            >
                <Form.Item label="Status">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Form.Item name="is_active" valuePropName="checked" noStyle>
                            <Switch
                                style={{ backgroundColor: isActive ? '#23A55A' : '#bfbfbf' }}
                                disabled={readOnly}
                            />
                        </Form.Item>
                        <Text style={{ marginLeft: 8 }}>
                            {isActive ? 'Running' : 'Offline'}
                        </Text>
                    </div>
                </Form.Item>

                <Form.Item label="Brand Code" name="brand_code">
                    <Input
                        disabled={true}
                        style={{
                            backgroundColor: '#f5f5f5',
                            cursor: 'not-allowed'
                        }}
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Brand Name"
                            name="brand_name"
                            rules={[{ required: !readOnly, message: 'Brand Name wajib diisi!' }]}
                        >
                            <Input disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Manufacturer"
                            name="brand_manufacture"
                            rules={[{ required: !readOnly, message: 'Manufacturer wajib diisi!' }]}
                        >
                            <Input placeholder="Enter Manufacturer" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Brand Type" name="brand_type">
                            <Input placeholder="Enter Brand Type (Optional)" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Model" name="brand_model">
                            <Input placeholder="Enter Model (Optional)" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default BrandForm;