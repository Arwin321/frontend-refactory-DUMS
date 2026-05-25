import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import TableList from '../../../components/Global/TableList';
// import { getAllErrorCodesByBrand, createErrorCode, updateErrorCode, deleteErrorCode } from '../../api/master-errorcode'; // Mock this later

const { Title } = Typography;

// Mock API functions for now
const mockApi = {
    errorCodes: [
        { error_code_id: 1, brand_id: 1, error_code: 'E-001', description: 'Paper Jam' },
        { error_code_id: 2, brand_id: 1, error_code: 'E-002', description: 'Low Ink' },
    ],
    getAllErrorCodesByBrand: async (brandId) => {
        return { status: 200, data: { data: mockApi.errorCodes.filter(ec => ec.brand_id == brandId) } };
    },
    createErrorCode: async (data) => {
        const newId = Math.max(...mockApi.errorCodes.map(ec => ec.error_code_id)) + 1;
        const newErrorCode = { ...data, error_code_id: newId };
        mockApi.errorCodes.push(newErrorCode);
        return { statusCode: 201, data: newErrorCode };
    },
    updateErrorCode: async (id, data) => {
        const index = mockApi.errorCodes.findIndex(ec => ec.error_code_id === id);
        if (index !== -1) {
            mockApi.errorCodes[index] = { ...mockApi.errorCodes[index], ...data };
            return { statusCode: 200, data: mockApi.errorCodes[index] };
        }
        return { statusCode: 404, message: 'Not Found' };
    },
    deleteErrorCode: async (id) => {
        const index = mockApi.errorCodes.findIndex(ec => ec.error_code_id === id);
        if (index !== -1) {
            mockApi.errorCodes.splice(index, 1);
            return { statusCode: 200 };
        }
        return { statusCode: 404, message: 'Not Found' };
    }
};

const ErrorCodePage = () => {
    const { brandId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [errorCodes, setErrorCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingErrorCode, setEditingErrorCode] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        const response = await mockApi.getAllErrorCodesByBrand(brandId);
        if (response.status === 200) {
            setErrorCodes(response.data.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [brandId]);

    const columns = [
        { title: 'Error Code', dataIndex: 'error_code', key: 'error_code' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button type="link" danger onClick={() => handleDelete(record.error_code_id)}>Delete</Button>
                </>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingErrorCode(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (errorCode) => {
        setEditingErrorCode(errorCode);
        form.setFieldsValue(errorCode);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        await mockApi.deleteErrorCode(id);
        message.success('Error code deleted successfully');
        fetchData();
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingErrorCode) {
                await mockApi.updateErrorCode(editingErrorCode.error_code_id, values);
                message.success('Error code updated successfully');
            } else {
                await mockApi.createErrorCode({ ...values, brand_id: brandId });
                message.success('Error code created successfully');
            }
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            console.log('Validate Failed:', error);
        }
    };

    return (
        <Card>
            <Title level={4}>Manage Error Codes for Brand ID: {brandId}</Title>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                style={{ marginBottom: 16 }}
            >
                Add Error Code
            </Button>
            <TableList
                columns={columns}
                getData={async () => ({ data: { data: errorCodes } })}
                triger={brandId}
            />
            <Modal
                title={editingErrorCode ? 'Edit Error Code' : 'Add Error Code'}
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="error_code" label="Error Code" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default ErrorCodePage;
