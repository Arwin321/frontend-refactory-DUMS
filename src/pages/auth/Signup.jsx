import React, { useState } from 'react';
import { Flex, Input, Form, Button, Card, Space, Image, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import bg_cod from 'assets/bg_cod.jpg';
import logo from 'assets/freepik/LOGOPIU.png';
import { register } from '../../api/auth';
import { NotifOk, NotifAlert } from '../../components/Global/ToastNotif';

const SignUp = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [isRegistered, setIsRegistered] = useState(false);

    const moveToSignin = () => {
        navigate('/signin');
    };

    const handleSignUp = async (values) => {
        const { user_fullname, user_name, user_email, user_phone, user_password, confirmPassword } =
            values;

        // Validasi confirm password
        if (user_password !== confirmPassword) {
            NotifAlert({
                icon: 'error',
                title: 'Password Tidak Sama',
                message: 'Password dan confirm password harus sama',
            });
            form.resetFields(['password', 'confirmPassword']);
            return;
        }

        // Validasi nomor telepon Indonesia
        const phoneRegex = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
        if (!phoneRegex.test(user_phone)) {
            NotifAlert({
                icon: 'error',
                title: 'Format Telepon Salah',
                message: 'Nomor telepon tidak valid (harus nomor Indonesia)',
            });
            form.resetFields(['user_phone']);
            return;
        }

        // Validasi password kompleks
        const passwordErrors = [];
        if (user_password.length < 8) passwordErrors.push('Minimal 8 karakter');
        if (!/[A-Z]/.test(user_password)) passwordErrors.push('Harus ada huruf kapital');
        if (!/[0-9]/.test(user_password)) passwordErrors.push('Harus ada angka');
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(user_password))
            passwordErrors.push('Harus ada karakter spesial');
        if (passwordErrors.length) {
            NotifAlert({
                icon: 'error',
                title: 'Password Tidak Valid',
                message: passwordErrors.join(', '),
            });
            form.resetFields(['user_password', 'confirmPassword']);
            return;
        }

        setLoading(true);
        try {
            const res = await register({
                user_fullname,
                user_name,
                user_email,
                user_phone,
                user_password,
            });

            NotifOk({
                icon: 'success',
                title: 'Registrasi Berhasil',
                message: res?.data?.message || 'Berhasil menambahkan user.',
            });

            form.resetFields();
            setIsRegistered(true);
            // navigate('/signin');
        } catch (err) {
            console.error('Register error:', err);
            const errorMessage = err?.response?.data?.message || err.message || 'Terjadi kesalahan';

            NotifAlert({
                icon: 'error',
                title: 'Registrasi Gagal',
                message: errorMessage || 'Terjadi kesalahan',
            });
            if (errorMessage.toLowerCase().includes('already')) {
                form.resetFields();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex
            align="center"
            justify="center"
            style={{
                minHeight: '100vh',
                backgroundImage: `url(${bg_cod})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '20px',
            }}
        >
            <Card
                style={{
                    width: '100%',
                    maxWidth: 450,
                    borderRadius: '12px',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                    padding: '10px',
                    textAlign: 'center',
                }}
            >
                <Image src={logo} height={150} width={220} preview={false} alt="logo" />

                <h2 style={{ marginBottom: '20px', color: '#1a3c34' }}>Registration</h2>

                <Form form={form} onFinish={handleSignUp} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Full Name"
                                name="user_fullname"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="Full Name" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Name" name="user_name" rules={[{ required: true }]}>
                                <Input placeholder="Name" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Email"
                                name="user_email"
                                rules={[
                                    {
                                        required: true,
                                        type: 'email',
                                        message: 'Please input a valid email!',
                                    },
                                ]}
                            >
                                <Input placeholder="Email" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Phone" name="user_phone" rules={[{ required: true }]}>
                                <Input placeholder="Phone" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Password" name="user_password" rules={[{ required: true }]}>
                        <Input.Password placeholder="Password" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        rules={[{ required: true }]}
                    >
                        <Input.Password placeholder="Confirm Password" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{ width: '100%' }}
                            >
                                Sign Up
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>

                <Button type="primary" style={{ width: '100%' }} onClick={moveToSignin}>
                    Sign In
                </Button>
            </Card>
        </Flex>
    );
};

export default SignUp;
