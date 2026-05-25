import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createBrand } from '../../api/master-brand';

const { Title } = Typography;

const FormBrand = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await createBrand(values);
            if (response.statusCode === 200 || response.statusCode === 201) {
                message.success('Brand created successfully!');
                const newBrandId = response.data.brand_id;
                // Redirect to the error code page for the new brand
                navigate(`/master/brand/${newBrandId}/error-codes`);
            } else {
                message.error(response.message || 'Failed to create brand.');
            }
        } catch (error) {
            message.error('An error occurred while creating the brand.');
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <Card>
            <Title level={4}>Add New Brand</Title>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    name="brand_name"
                    label="Brand Name"
                    rules={[{ required: true, message: 'Please input the brand name!' }]}
                >
                    <Input placeholder="Enter brand name" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Lanjut ke Error Code
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default FormBrand;
