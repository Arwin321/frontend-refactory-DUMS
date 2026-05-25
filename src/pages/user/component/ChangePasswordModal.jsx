import React, { useState, useEffect } from 'react';
import { Modal, Input, Typography, Button, ConfigProvider } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { NotifAlert, NotifOk } from '../../../components/Global/ToastNotif';
import { changePassword } from '../../../api/user';

const { Text } = Typography;

const ChangePasswordModal = (props) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});

    // Password requirements state
    const [passwordRequirements, setPasswordRequirements] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    const validatePassword = (password) => {
        if (!password) return 'Password wajib diisi';

        // Must be at least 8 characters long
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }

        // Must contain at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }

        // Must contain at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }

        // Must contain at least one number
        if (!/\d/.test(password)) {
            return 'Password must contain at least one number';
        }

        // Must contain at least one special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return 'Password must contain at least one special character';
        }

        return null;
    };

    const validateForm = () => {
        const newErrors = {};

        const passwordError = validatePassword(formData.newPassword);
        if (passwordError) {
            newErrors.newPassword = passwordError;
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCancel = () => {
        props.setShowModal(false);
        props.setSelectedUser(null);
        setFormData({
            newPassword: '',
            confirmPassword: '',
        });
        setErrors({});
        setPasswordRequirements({
            minLength: false,
            hasUppercase: false,
            hasLowercase: false,
            hasNumber: false,
            hasSpecialChar: false,
        });
    };

    // Check password requirements
    const checkPasswordRequirements = (password) => {
        setPasswordRequirements({
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    };

    const handleSave = async () => {
        if (!validateForm()) {
            NotifOk({
                icon: 'warning',
                title: 'Peringatan',
                message: 'Mohon periksa kembali form Anda',
            });
            return;
        }

        setConfirmLoading(true);

        try {
            const response = await changePassword(props.selectedUser.user_id, formData.newPassword);

            // console.log('Change Password Response:', response);

            if (response && response.statusCode === 200) {
                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `Password untuk user "${props.selectedUser.user_fullname}" berhasil diubah.`,
                });

                handleCancel();
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: response?.message || 'Terjadi kesalahan saat mengubah password.',
                });
            }
        } catch (error) {
            console.error('Change Password Error:', error);
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: error.message || 'Terjadi kesalahan pada server. Coba lagi nanti.',
            });
        }

        setConfirmLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Check password requirements on password change
        if (name === 'newPassword') {
            checkPasswordRequirements(value);
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null,
            });
        }
    };

    useEffect(() => {
        if (!props.showModal) {
            setFormData({
                newPassword: '',
                confirmPassword: '',
            });
            setErrors({});
        }
    }, [props.showModal]);

    return (
        <Modal
            title={`Ubah Password - ${props.selectedUser?.user_fullname || ''}`}
            open={props.showModal}
            onCancel={handleCancel}
            footer={[
                <React.Fragment key="modal-footer">
                    <ConfigProvider
                        theme={{
                            token: { colorBgContainer: '#E9F6EF' },
                            components: {
                                Button: {
                                    defaultBg: 'white',
                                    defaultColor: '#23A55A',
                                    defaultBorderColor: '#23A55A',
                                    defaultHoverColor: '#23A55A',
                                    defaultHoverBorderColor: '#23A55A',
                                },
                            },
                        }}
                    >
                        <Button onClick={handleCancel}>Batal</Button>
                    </ConfigProvider>
                    <ConfigProvider
                        theme={{
                            token: {
                                colorBgContainer: '#209652',
                            },
                            components: {
                                Button: {
                                    defaultBg: '#23a55a',
                                    defaultColor: '#FFFFFF',
                                    defaultBorderColor: '#23a55a',
                                    defaultHoverColor: '#FFFFFF',
                                    defaultHoverBorderColor: '#23a55a',
                                },
                            },
                        }}
                    >
                        <Button loading={confirmLoading} onClick={handleSave}>
                            Simpan
                        </Button>
                    </ConfigProvider>
                </React.Fragment>,
            ]}
            width={500}
        >
            <div>
                <div style={{ marginBottom: 12 }}>
                    <Text strong>Username</Text>
                    <Input
                        value={props.selectedUser?.user_name || ''}
                        disabled
                        style={{ backgroundColor: '#f5f5f5' }}
                    />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <Text strong>Password Baru</Text>
                    <Text style={{ color: 'red' }}> *</Text>
                    <Input.Password
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Masukkan password baru"
                        status={errors.newPassword ? 'error' : ''}
                    />
                    {errors.newPassword && (
                        <Text style={{ color: 'red', fontSize: '12px' }}>{errors.newPassword}</Text>
                    )}

                    {/* Password Requirements Indicator */}
                    <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <Text style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>Password harus memenuhi:</Text>
                        <div style={{ marginTop: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                                {passwordRequirements.minLength ? (
                                    <CheckCircleFilled style={{ color: '#52c41a', fontSize: '14px', marginRight: '6px' }} />
                                ) : (
                                    <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: '14px', marginRight: '6px' }} />
                                )}
                                <Text style={{ fontSize: '12px', color: passwordRequirements.minLength ? '#52c41a' : '#ff4d4f' }}>
                                    Minimal 8 karakter
                                </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                                {passwordRequirements.hasUppercase ? (
                                    <CheckCircleFilled style={{ color: '#52c41a', fontSize: '14px', marginRight: '6px' }} />
                                ) : (
                                    <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: '14px', marginRight: '6px' }} />
                                )}
                                <Text style={{ fontSize: '12px', color: passwordRequirements.hasUppercase ? '#52c41a' : '#ff4d4f' }}>
                                    Minimal 1 huruf besar (A-Z)
                                </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                                {passwordRequirements.hasLowercase ? (
                                    <CheckCircleFilled style={{ color: '#52c41a', fontSize: '14px', marginRight: '6px' }} />
                                ) : (
                                    <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: '14px', marginRight: '6px' }} />
                                )}
                                <Text style={{ fontSize: '12px', color: passwordRequirements.hasLowercase ? '#52c41a' : '#ff4d4f' }}>
                                    Minimal 1 huruf kecil (a-z)
                                </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                                {passwordRequirements.hasNumber ? (
                                    <CheckCircleFilled style={{ color: '#52c41a', fontSize: '14px', marginRight: '6px' }} />
                                ) : (
                                    <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: '14px', marginRight: '6px' }} />
                                )}
                                <Text style={{ fontSize: '12px', color: passwordRequirements.hasNumber ? '#52c41a' : '#ff4d4f' }}>
                                    Minimal 1 angka (0-9)
                                </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                                {passwordRequirements.hasSpecialChar ? (
                                    <CheckCircleFilled style={{ color: '#52c41a', fontSize: '14px', marginRight: '6px' }} />
                                ) : (
                                    <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: '14px', marginRight: '6px' }} />
                                )}
                                <Text style={{ fontSize: '12px', color: passwordRequirements.hasSpecialChar ? '#52c41a' : '#ff4d4f' }}>
                                    Minimal 1 karakter spesial (!@#$%^&*(),.?":&#123;&#125;|&lt;&gt;)
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <Text strong>Konfirmasi Password</Text>
                    <Text style={{ color: 'red' }}> *</Text>
                    <Input.Password
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Konfirmasi password baru"
                        status={errors.confirmPassword ? 'error' : ''}
                    />
                    {errors.confirmPassword && (
                        <Text style={{ color: 'red', fontSize: '12px' }}>
                            {errors.confirmPassword}
                        </Text>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ChangePasswordModal;
