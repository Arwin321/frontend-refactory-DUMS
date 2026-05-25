import React, { useEffect, useState } from 'react';
import { Modal, Input, Divider, Typography, Switch, Button, ConfigProvider, Select } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { NotifAlert, NotifOk } from '../../../components/Global/ToastNotif';
import { createUser, updateUser, changePassword } from '../../../api/user';
import { getAllRole } from '../../../api/role';

const { Text } = Typography;
const { Option } = Select;

const DetailUser = (props) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [roleList, setRoleList] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);

    const defaultData = {
        user_id: '',
        user_name: '',
        user_fullname: '',
        user_email: '',
        user_phone: '',
        role_id: null,
        is_active: true,
        password: '',
        confirmPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    };

    const [FormData, setFormData] = useState(defaultData);
    const [originalEmail, setOriginalEmail] = useState(''); // Track original email
    const [errors, setErrors] = useState({});

    // Password requirements state
    const [passwordRequirements, setPasswordRequirements] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    // New password requirements state for edit mode
    const [newPasswordRequirements, setNewPasswordRequirements] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    const handleCancel = () => {
        props.setSelectedData(null);
        props.setActionMode('list');
        setFormData(defaultData);
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

    // Check new password requirements for edit mode
    const checkNewPasswordRequirements = (password) => {
        setNewPasswordRequirements({
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^(?:\+62|0)8\d{7,10}$/;
        return phoneRegex.test(phone);
    };

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

        // Required fields validation
        if (!FormData.user_fullname) {
            newErrors.user_fullname = 'Nama lengkap wajib diisi';
        } else if (FormData.user_fullname.length < 3) {
            newErrors.user_fullname = 'Nama minimal 3 karakter';
        } else if (FormData.user_fullname.length > 100) {
            newErrors.user_fullname = 'Nama maksimal 100 karakter';
        }

        if (!FormData.user_name) {
            newErrors.user_name = 'Username wajib diisi';
        } else if (FormData.user_name.length < 3) {
            newErrors.user_name = 'Username minimal 3 karakter';
        } else if (FormData.user_name.length > 50) {
            newErrors.user_name = 'Username maksimal 50 karakter';
        } else if (!/^[a-zA-Z0-9]+$/.test(FormData.user_name)) {
            newErrors.user_name = 'Username hanya boleh huruf dan angka';
        }

        if (!FormData.user_email) {
            newErrors.user_email = 'Email wajib diisi';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(FormData.user_email)) {
            newErrors.user_email = 'Format email tidak valid';
        }

        if (!FormData.user_phone) {
            newErrors.user_phone = 'Nomor telepon wajib diisi';
        } else if (!validatePhone(FormData.user_phone)) {
            newErrors.user_phone = 'Nomor harus format Indonesia (08xxxxxxxx atau +628xxxxxxxx)';
        }

        // Role validation - make role required
        if (!FormData.role_id) {
            newErrors.role_id = 'Role wajib dipilih';
        }

        // Password validation for add mode
        if (!FormData.user_id) {
            const passwordError = validatePassword(FormData.password);
            if (passwordError) {
                newErrors.password = passwordError;
            }

            if (!FormData.confirmPassword) {
                newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
            } else if (FormData.password !== FormData.confirmPassword) {
                newErrors.confirmPassword = 'Password tidak cocok';
            }
        }

        // Password validation for edit mode (optional)
        if (FormData.user_id && FormData.newPassword) {
            const passwordError = validatePassword(FormData.newPassword);
            if (passwordError) {
                newErrors.newPassword = passwordError;
            }

            if (!FormData.confirmNewPassword) {
                newErrors.confirmNewPassword = 'Konfirmasi password wajib diisi';
            } else if (FormData.newPassword !== FormData.confirmNewPassword) {
                newErrors.confirmNewPassword = 'Password tidak cocok';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

        // Format phone number
        let phone = FormData.user_phone;
        if (phone.startsWith('0')) {
            phone = '+62' + phone.slice(1);
        } else if (!phone.startsWith('+')) {
            phone = '+62' + phone;
        }

        // Backend expects field names with 'user_' prefix
        const payload = {
            user_fullname: FormData.user_fullname,
            user_phone: phone,
        };

        // For update mode: only send email if it has changed
        if (FormData.user_id) {
            if (FormData.user_email !== originalEmail) {
                payload.user_email = FormData.user_email;
            }

            payload.is_active = FormData.is_active;
        } else {
            payload.user_email = FormData.user_email;
        }

        if (FormData.role_id) {
            payload.role_id = FormData.role_id;
        }

        // Add password and name for new user (create mode)
        if (!FormData.user_id) {
            payload.user_name = FormData.user_name;
            payload.user_password = FormData.password;
        }

        try {
            // console.log('Payload being sent:', payload);

            let response;
            if (!FormData.user_id) {
                response = await createUser(payload);
            } else {
                response = await updateUser(FormData.user_id, payload);
            }

            // console.log('Save User Response:', response);

            // Check if response is successful
            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                if (FormData.user_id && FormData.newPassword) {
                    try {
                        const passwordResponse = await changePassword(
                            FormData.user_id,
                            FormData.newPassword
                        );

                        if (passwordResponse && passwordResponse.statusCode === 200) {
                            NotifOk({
                                icon: 'success',
                                title: 'Berhasil',
                                message: `User "${
                                    response.data?.user_fullname || FormData.user_fullname
                                }" berhasil diubah dan password berhasil diperbarui.`,
                            });
                        } else {
                            NotifAlert({
                                icon: 'warning',
                                title: 'Perhatian',
                                message: `User berhasil diubah, namun gagal mengubah password: ${
                                    passwordResponse?.message || 'Unknown error'
                                }`,
                            });
                        }
                    } catch (passwordError) {
                        console.error('Change Password Error:', passwordError);
                        NotifAlert({
                            icon: 'warning',
                            title: 'Perhatian',
                            message: 'User berhasil diubah, namun gagal mengubah password.',
                        });
                    }
                } else {
                    NotifOk({
                        icon: 'success',
                        title: 'Berhasil',
                        message: `User "${
                            response.data?.user_fullname || FormData.user_fullname
                        }" berhasil ${FormData.user_id ? 'diubah' : 'ditambahkan'}.`,
                    });
                }

                props.setActionMode('list');
                setFormData(defaultData);
                setErrors({});
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: response?.message || 'Terjadi kesalahan saat menyimpan data.',
                });
            }
        } catch (error) {
            console.error('Save User Error:', error);
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
            ...FormData,
            [name]: value,
        });

        // Check password requirements on password change
        if (name === 'password') {
            checkPasswordRequirements(value);
        }

        // Check new password requirements on new password change (for edit mode)
        if (name === 'newPassword') {
            checkNewPasswordRequirements(value);
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null,
            });
        }
    };

    const handleSelectChange = (value) => {
        setFormData({
            ...FormData,
            role_id: value,
        });

        // Clear role error when user selects a role
        if (errors.role_id) {
            setErrors({
                ...errors,
                role_id: null,
            });
        }
    };

    const handleSwitchChange = (name, checked) => {
        setFormData({
            ...FormData,
            [name]: checked,
        });
    };

    // Fetch all roles when component mounts or modal opens
    const fetchRoles = async () => {
        setLoadingRoles(true);
        try {
            // Create query params for fetching all roles
            const queryParams = new URLSearchParams({
                page: 1,
                limit: 100,
                search: '',
            });

            // console.log('Fetching roles with params:', queryParams.toString());
            const response = await getAllRole(queryParams);
            // console.log('Fetched roles response:', response);

            // Handle different response structures
            if (response && response.data) {
                let roles = [];

                if (response.data.data && Array.isArray(response.data.data)) {
                    roles = response.data.data;
                } else if (Array.isArray(response.data)) {
                    roles = response.data;
                } else {
                    // Add mock data as fallback for testing
                    console.warn('Unexpected role data structure, using mock data');
                    roles = [
                        { role_id: 1, role_name: 'Admin', role_level: 1 },
                        { role_id: 2, role_name: 'Manager', role_level: 2 },
                        { role_id: 3, role_name: 'User', role_level: 3 },
                    ];
                }

                setRoleList(roles);
                // console.log('Setting role list:', roles);
            } else {
                // Add mock data as fallback
                console.warn('No response data, using mock data');
                const mockRoles = [
                    { role_id: 1, role_name: 'Admin', role_level: 1 },
                    { role_id: 2, role_name: 'Manager', role_level: 2 },
                    { role_id: 3, role_name: 'User', role_level: 3 },
                ];
                setRoleList(mockRoles);
                // console.log('Setting mock role list:', mockRoles);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            // Add mock data as fallback on error
            const mockRoles = [
                { role_id: 1, role_name: 'Admin', role_level: 1 },
                { role_id: 2, role_name: 'Manager', role_level: 2 },
                { role_id: 3, role_name: 'User', role_level: 3 },
            ];
            setRoleList(mockRoles);
            // console.log('Setting mock role list due to error:', mockRoles);

            // Only show error notification if we don't have fallback data
            if (process.env.NODE_ENV === 'development') {
                console.warn('Using mock role data due to API error');
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Error',
                    message: 'Gagal memuat daftar role, menggunakan data default',
                });
            }
        } finally {
            setLoadingRoles(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            if (props.selectedData != null) {
                // Format phone untuk display
                let displayPhone = props.selectedData.user_phone || '';
                if (displayPhone.startsWith('+62')) {
                    displayPhone = '0' + displayPhone.slice(3);
                }

                setFormData({
                    user_id: props.selectedData.user_id || '',
                    user_name: props.selectedData.user_name || '',
                    user_fullname: props.selectedData.user_fullname || '',
                    user_email: props.selectedData.user_email || '',
                    user_phone: displayPhone,
                    role_id: props.selectedData.role_id || null,
                    is_active:
                        props.selectedData.is_active === 1 || props.selectedData.is_active === true,
                    password: '',
                    confirmPassword: '',
                });
                // Store original email for comparison
                setOriginalEmail(props.selectedData.user_email || '');
            } else {
                setFormData(defaultData);
                setOriginalEmail('');
            }
            setErrors({});

            // Fetch roles when modal opens
            fetchRoles();
        }
    }, [props.showModal]);

    return (
        <Modal
            title={`${
                props.actionMode === 'add'
                    ? 'Tambah'
                    : props.actionMode === 'preview'
                    ? 'Preview'
                    : 'Edit'
            } User`}
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
                        {!props.readOnly && (
                            <Button loading={confirmLoading} onClick={handleSave}>
                                Simpan
                            </Button>
                        )}
                    </ConfigProvider>
                </React.Fragment>,
            ]}
            width={600}
        >
            {FormData && (
                <div>
                    <div hidden>
                        <Text strong>User ID</Text>
                        <Input name="user_id" value={FormData.user_id} disabled />
                    </div>
                    {FormData.user_id && (
                        <div style={{ marginBottom: 12 }}>
                            <Divider style={{ margin: '12px 0' }} />
                            <div>
                                <Text strong>Status Aktif</Text>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginTop: '8px',
                                }}
                            >
                                <div style={{ marginRight: '8px' }}>
                                    <Switch
                                        disabled={props.readOnly}
                                        style={{
                                            backgroundColor: FormData.is_active
                                                ? '#23A55A'
                                                : '#bfbfbf',
                                        }}
                                        checked={FormData.is_active}
                                        onChange={(checked) =>
                                            handleSwitchChange('is_active', checked)
                                        }
                                    />
                                </div>
                                <div>
                                    <Text>{FormData.is_active ? 'Aktif' : 'Nonaktif'}</Text>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Nama Lengkap</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Input
                            name="user_fullname"
                            value={FormData.user_fullname}
                            onChange={handleInputChange}
                            placeholder="Masukkan nama lengkap"
                            readOnly={props.readOnly}
                            status={errors.user_fullname ? 'error' : ''}
                        />
                        {errors.user_fullname && (
                            <Text style={{ color: 'red', fontSize: '12px' }}>
                                {errors.user_fullname}
                            </Text>
                        )}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Username</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Input
                            name="user_name"
                            value={FormData.user_name}
                            onChange={handleInputChange}
                            placeholder="Masukkan username"
                            readOnly={props.readOnly || FormData.user_id !== ''}
                            disabled={FormData.user_id !== ''}
                            status={errors.user_name ? 'error' : ''}
                        />
                        {errors.user_name && (
                            <Text style={{ color: 'red', fontSize: '12px' }}>
                                {errors.user_name}
                            </Text>
                        )}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Email</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Input
                            name="user_email"
                            value={FormData.user_email}
                            onChange={handleInputChange}
                            placeholder="Masukkan email"
                            readOnly={props.readOnly}
                            status={errors.user_email ? 'error' : ''}
                        />
                        {errors.user_email && (
                            <Text style={{ color: 'red', fontSize: '12px' }}>
                                {errors.user_email}
                            </Text>
                        )}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Nomor WhatsApp</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Input
                            name="user_phone"
                            value={FormData.user_phone}
                            onChange={handleInputChange}
                            placeholder="08xxxxxxxxxx atau +628xxxxxxxxxx"
                            readOnly={props.readOnly}
                            status={errors.user_phone ? 'error' : ''}
                        />
                        {errors.user_phone && (
                            <Text style={{ color: 'red', fontSize: '12px' }}>
                                {errors.user_phone}
                            </Text>
                        )}
                    </div>

                    {!FormData.user_id && (
                        <>
                            <div style={{ marginBottom: 12 }}>
                                <Text strong>Password</Text>
                                <Text style={{ color: 'red' }}> *</Text>
                                <Input.Password
                                    name="password"
                                    value={FormData.password}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan password"
                                    readOnly={props.readOnly}
                                    status={errors.password ? 'error' : ''}
                                />
                                {errors.password && (
                                    <Text style={{ color: 'red', fontSize: '12px' }}>
                                        {errors.password}
                                    </Text>
                                )}

                                {/* Password Requirements Indicator */}
                                <div
                                    style={{
                                        marginTop: '8px',
                                        padding: '8px',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '4px',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            color: '#666',
                                        }}
                                    >
                                        Password harus memenuhi:
                                    </Text>
                                    <div style={{ marginTop: '4px' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '2px',
                                            }}
                                        >
                                            {passwordRequirements.minLength ? (
                                                <CheckCircleFilled
                                                    style={{
                                                        color: '#52c41a',
                                                        fontSize: '14px',
                                                        marginRight: '6px',
                                                    }}
                                                />
                                            ) : (
                                                <CloseCircleFilled
                                                    style={{
                                                        color: '#ff4d4f',
                                                        fontSize: '14px',
                                                        marginRight: '6px',
                                                    }}
                                                />
                                            )}
                                            <Text
                                                style={{
                                                    fontSize: '12px',
                                                    color: passwordRequirements.minLength
                                                        ? '#52c41a'
                                                        : '#ff4d4f',
                                                }}
                                            >
                                                Minimal 8 karakter
                                            </Text>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '2px',
                                            }}
                                        >
                                            {passwordRequirements.hasUppercase ? (
                                                <CheckCircleFilled
                                                    style={{
                                                        color: '#52c41a',
                                                        fontSize: '14px',
                                                        marginRight: '6px',
                                                    }}
                                                />
                                            ) : (
                                                <CloseCircleFilled
                                                    style={{
                                                        color: '#ff4d4f',
                                                        fontSize: '14px',
                                                        marginRight: '6px',
                                                    }}
                                                />
                                            )}
                                            <Text
                                                style={{
                                                    fontSize: '12px',
                                                    color: passwordRequirements.hasUppercase
                                                        ? '#52c41a'
                                                        : '#ff4d4f',
                                                }}
                                            >
                                                Minimal 1 huruf besar (A-Z)
                                            </Text>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '2px',
                                            }}
                                        >
                                            {passwordRequirements.hasLowercase ? (
                                                <CheckCircleFilled
                                                    style={{
                                                        color: '#52c41a',
                                                        fontSize: '14px',
                                                        marginRight: '6px',
                                                    }}
                                                />
                                            ) : (
                                                <CloseCircleFilled
                                                    style={{
                                                        color: '#ff4d4f',
                                                        fontSize: '14px',
                                                        marginRight: '6px',
                                                    }}
                                                />
                                            )}
                                            <Text
                                                style={{
                                                    fontSize: '12px',
                                                    color: passwordRequirements.hasLowercase
                                                        ? '#52c41a'
                                                        : '#ff4d4f',
                                                }}
                                            >
                                                Minimal 1 huruf kecil (a-z)
                                            </Text>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '2px',
                                            }}
                                        >
                                            {passwordRequirements.hasNumber ? (
                                                <CheckCircleFilled
                                                    style={{
                                                        color: '#52c41a',
                                                        fontSize: '14px',
                                                        marginRight: '6px',
                                                    }}
                                                />
                                            ) : (
                                                <CloseCircleFilled
                                                    style={{
                                                        color: '#ff4d4f',
                                                        fontSize: '14px',
                                                        marginRight: '6px',
                                                    }}
                                                />
                                            )}
                                            <Text
                                                style={{
                                                    fontSize: '12px',
                                                    color: passwordRequirements.hasNumber
                                                        ? '#52c41a'
                                                        : '#ff4d4f',
                                                }}
                                            >
                                                Minimal 1 angka (0-9)
                                            </Text>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '2px',
                                            }}
                                        >
                                            {passwordRequirements.hasSpecialChar ? (
                                                <CheckCircleFilled
                                                    style={{
                                                        color: '#52c41a',
                                                        fontSize: '14px',
                                                        marginRight: '6px',
                                                    }}
                                                />
                                            ) : (
                                                <CloseCircleFilled
                                                    style={{
                                                        color: '#ff4d4f',
                                                        fontSize: '14px',
                                                        marginRight: '6px',
                                                    }}
                                                />
                                            )}
                                            <Text
                                                style={{
                                                    fontSize: '12px',
                                                    color: passwordRequirements.hasSpecialChar
                                                        ? '#52c41a'
                                                        : '#ff4d4f',
                                                }}
                                            >
                                                Minimal 1 karakter spesial
                                                (!@#$%^&*(),.?":&#123;&#125;|&lt;&gt;)
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
                                    value={FormData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Konfirmasi password"
                                    readOnly={props.readOnly}
                                    status={errors.confirmPassword ? 'error' : ''}
                                />
                                {errors.confirmPassword && (
                                    <Text style={{ color: 'red', fontSize: '12px' }}>
                                        {errors.confirmPassword}
                                    </Text>
                                )}
                            </div>
                        </>
                    )}

                    {FormData.user_id && !props.readOnly && (
                        <>
                            <Divider style={{ margin: '12px 0' }}>Ubah Password (Opsional)</Divider>

                            <div style={{ marginBottom: 12 }}>
                                <Text strong>Password Baru</Text>
                                <Input.Password
                                    name="newPassword"
                                    value={FormData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="Kosongkan jika tidak ingin mengubah password"
                                    status={errors.newPassword ? 'error' : ''}
                                />
                                {errors.newPassword && (
                                    <Text style={{ color: 'red', fontSize: '12px' }}>
                                        {errors.newPassword}
                                    </Text>
                                )}

                                {FormData.newPassword && (
                                    <div
                                        style={{
                                            marginTop: '8px',
                                            padding: '8px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                color: '#666',
                                            }}
                                        >
                                            Password harus memenuhi:
                                        </Text>
                                        <div style={{ marginTop: '4px' }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '2px',
                                                }}
                                            >
                                                {newPasswordRequirements.minLength ? (
                                                    <CheckCircleFilled
                                                        style={{
                                                            color: '#52c41a',
                                                            fontSize: '14px',
                                                            marginRight: '6px',
                                                        }}
                                                    />
                                                ) : (
                                                    <CloseCircleFilled
                                                        style={{
                                                            color: '#ff4d4f',
                                                            fontSize: '14px',
                                                            marginRight: '6px',
                                                        }}
                                                    />
                                                )}
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: newPasswordRequirements.minLength
                                                            ? '#52c41a'
                                                            : '#ff4d4f',
                                                    }}
                                                >
                                                    Minimal 8 karakter
                                                </Text>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '2px',
                                                }}
                                            >
                                                {newPasswordRequirements.hasUppercase ? (
                                                    <CheckCircleFilled
                                                        style={{
                                                            color: '#52c41a',
                                                            fontSize: '14px',
                                                            marginRight: '6px',
                                                        }}
                                                    />
                                                ) : (
                                                    <CloseCircleFilled
                                                        style={{
                                                            color: '#ff4d4f',
                                                            fontSize: '14px',
                                                            marginRight: '6px',
                                                        }}
                                                    />
                                                )}
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: newPasswordRequirements.hasUppercase
                                                            ? '#52c41a'
                                                            : '#ff4d4f',
                                                    }}
                                                >
                                                    Minimal 1 huruf besar (A-Z)
                                                </Text>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '2px',
                                                }}
                                            >
                                                {newPasswordRequirements.hasLowercase ? (
                                                    <CheckCircleFilled
                                                        style={{
                                                            color: '#52c41a',
                                                            fontSize: '14px',
                                                            marginRight: '6px',
                                                        }}
                                                    />
                                                ) : (
                                                    <CloseCircleFilled
                                                        style={{
                                                            color: '#ff4d4f',
                                                            fontSize: '14px',
                                                            marginRight: '6px',
                                                        }}
                                                    />
                                                )}
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: newPasswordRequirements.hasLowercase
                                                            ? '#52c41a'
                                                            : '#ff4d4f',
                                                    }}
                                                >
                                                    Minimal 1 huruf kecil (a-z)
                                                </Text>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '2px',
                                                }}
                                            >
                                                {newPasswordRequirements.hasNumber ? (
                                                    <CheckCircleFilled
                                                        style={{
                                                            color: '#52c41a',
                                                            fontSize: '14px',
                                                            marginRight: '6px',
                                                        }}
                                                    />
                                                ) : (
                                                    <CloseCircleFilled
                                                        style={{
                                                            color: '#ff4d4f',
                                                            fontSize: '14px',
                                                            marginRight: '6px',
                                                        }}
                                                    />
                                                )}
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: newPasswordRequirements.hasNumber
                                                            ? '#52c41a'
                                                            : '#ff4d4f',
                                                    }}
                                                >
                                                    Minimal 1 angka (0-9)
                                                </Text>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '2px',
                                                }}
                                            >
                                                {newPasswordRequirements.hasSpecialChar ? (
                                                    <CheckCircleFilled
                                                        style={{
                                                            color: '#52c41a',
                                                            fontSize: '14px',
                                                            marginRight: '6px',
                                                        }}
                                                    />
                                                ) : (
                                                    <CloseCircleFilled
                                                        style={{
                                                            color: '#ff4d4f',
                                                            fontSize: '14px',
                                                            marginRight: '6px',
                                                        }}
                                                    />
                                                )}
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: newPasswordRequirements.hasSpecialChar
                                                            ? '#52c41a'
                                                            : '#ff4d4f',
                                                    }}
                                                >
                                                    Minimal 1 karakter spesial
                                                    (!@#$%^&*(),.?":&#123;&#125;|&lt;&gt;)
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <Text strong>Konfirmasi Password Baru</Text>
                                <Input.Password
                                    name="confirmNewPassword"
                                    value={FormData.confirmNewPassword}
                                    onChange={handleInputChange}
                                    placeholder="Konfirmasi password baru"
                                    status={errors.confirmNewPassword ? 'error' : ''}
                                />
                                {errors.confirmNewPassword && (
                                    <Text style={{ color: 'red', fontSize: '12px' }}>
                                        {errors.confirmNewPassword}
                                    </Text>
                                )}
                            </div>
                        </>
                    )}

                    <Divider style={{ margin: '12px 0' }} />

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Role</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Select
                            value={FormData.role_id}
                            onChange={handleSelectChange}
                            disabled={props.readOnly}
                            loading={loadingRoles}
                            style={{ width: '100%' }}
                            placeholder={loadingRoles ? 'Memuat role...' : 'Pilih role'}
                            allowClear
                            status={errors.role_id ? 'error' : ''}
                        >
                            {roleList.map((role) => (
                                <Option key={role.role_id} value={role.role_id}>
                                    {role.role_name} (Level {role.role_level})
                                </Option>
                            ))}
                        </Select>
                        {errors.role_id && (
                            <Text style={{ color: 'red', fontSize: '12px' }}>{errors.role_id}</Text>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default DetailUser;
