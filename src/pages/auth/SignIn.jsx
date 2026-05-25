import React, { useEffect, useState } from 'react';
import { Flex, Input, Form, Button, Card, Space, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import { NotifAlert } from '../../components/Global/ToastNotif';
import { SendRequest } from '../../components/Global/ApiRequest';
import bg_cod from 'assets/bg-cod-1.jpg';
import logo from 'assets/freepik/LOGOPIU.png';

const SignIn = () => {
    const [form] = Form.useForm();
    const [captchaSvg, setCaptchaSvg] = useState('');
    const [captchaText, setCaptchaText] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const defaultSignIn = {
        identifier: 'superadmin@cod.com',
        password: '@Superadmin123',
        captcha: '',
    };

    const moveToSignUp = () => {
        navigate('/signup');
    };

    // ambil captcha
    const fetchCaptcha = async () => {
        try {
            const res = await SendRequest({
                method: 'get',
                prefix: 'auth/generate-captcha',
                token: false,
            });

            setCaptchaSvg(res.data?.data?.svg || '');
            setCaptchaText(res.data?.data?.text || '');
        } catch (err) {
            console.error('Error fetching captcha:', err);
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, []);

    const handleOnSubmit = async (values) => {
        setLoading(true);
        try {
            const res = await SendRequest({
                method: 'post',
                prefix: 'auth/login',
                params: {
                    identifier: values.identifier,
                    password: values.password,
                    captcha: values.captcha,
                    captchaText: captchaText,
                },
                withCredentials: true,
            });

            const user = res?.data?.data?.user || res?.user;
            const accessToken = res?.data?.data?.accessToken || res?.tokens?.accessToken;

            if (user && accessToken) {
                localStorage.setItem('token', accessToken);
                localStorage.setItem('user', JSON.stringify(user));

                NotifAlert({
                    icon: 'success',
                    title: 'Login Berhasil',
                    message: res?.message || 'Selamat datang!',
                });

                navigate('/dashboard/home');
            }
        } catch (err) {
            // hanya handle invalid captcha disini
            if (err?.response?.data?.message?.toLowerCase().includes('captcha')) {
                NotifAlert({
                    icon: 'warning',
                    title: 'Peringatan',
                    message: 'Invalid captcha',
                });
                fetchCaptcha();
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Login Gagal',
                    message: err?.message || 'Terjadi kesalahan',
                });
                fetchCaptcha();
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
                height: '100vh',
                backgroundImage: `url(${bg_cod})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <Card style={{ boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }}>
                <Flex align="center" justify="center">
                    <Image src={logo} height={150} width={220} preview={false} alt="logo" />
                </Flex>
                <br />
                <Form
                    form={form}
                    layout="vertical"
                    style={{ width: '250px' }}
                    onFinish={handleOnSubmit}
                    initialValues={defaultSignIn}
                >
                    <Form.Item
                        label="Email / Username"
                        name="identifier"
                        rules={[
                            {
                                required: true,
                                message: 'Email / Username tidak boleh kosong',
                            },
                        ]}
                    >
                        <Input placeholder="Email / Username" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Password tidak boleh kosong' }]}
                    >
                        <Input.Password placeholder="Password" size="large" />
                    </Form.Item>

                    <div
                        style={{ textAlign: 'center' }}
                        dangerouslySetInnerHTML={{ __html: captchaSvg }}
                    />

                    <Form.Item
                        label="CAPTCHA"
                        name="captcha"
                        rules={[{ required: true, message: 'Silahkan masukkan CAPTCHA' }]}
                    >
                        <Input placeholder="Masukkan CAPTCHA" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{ width: '100%' }}
                            >
                                Sign In
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
                <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: '100%' }}
                    onClick={() => moveToSignUp()}
                >
                    Registration
                </Button>
            </Card>
        </Flex>
    );
};

export default SignIn;
