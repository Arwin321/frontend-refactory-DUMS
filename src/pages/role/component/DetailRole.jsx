import React, { useEffect, useState } from 'react';
import { Modal, Input, Divider, Typography, Switch, Button, ConfigProvider, InputNumber, Row, Col } from 'antd';
import { NotifAlert, NotifOk } from '../../../components/Global/ToastNotif';
import { validateRun } from '../../../Utils/validate';
import { createRole, updateRole } from '../../../api/role';

const { Text } = Typography;
const { TextArea } = Input;

const DetailRole = (props) => {
    const [confirmLoading, setConfirmLoading] = useState(false);

    const defaultData = {
        role_id: '',
        role_name: '',
        role_level: null,
        role_description: '',
        is_active: true,
    };

    const [formData, setFormData] = useState(defaultData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleInputNumberChange = (value) => {
        setFormData({ ...formData, role_level: value });
    };

    const handleStatusToggle = (checked) => {
        setFormData({ ...formData, is_active: checked });
    };

    const handleCancel = () => {
        props.setSelectedData(null);
        props.setActionMode('list');
    };

    const handleSave = async () => {
        setConfirmLoading(true);

        const validationRules = [
            { field: 'role_name', label: 'Role name', required: true },
            { field: 'role_level', label: 'Level', required: true },
        ];

        if (
            validateRun(formData, validationRules, (errorMessages) => {
                NotifOk({
                    icon: 'warning',
                    title: 'Peringatan',
                    message: errorMessages,
                });
                setConfirmLoading(false);
            })
        ) {
            return;
        }

        try {
            const payload = {
                role_name: formData.role_name,
                role_level: formData.role_level,
                role_description: formData.role_description,
                is_active: formData.is_active,
            };

            const response = formData.role_id
                ? await updateRole(formData.role_id, payload)
                : await createRole(payload);

            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                const action = formData.role_id ? 'diubah' : 'ditambahkan';
                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `Data Role "${payload.role_name}" berhasil ${action}.`,
                });
                props.setActionMode('list');
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: response?.message || 'Gagal menyimpan data.',
                });
            }
        } catch (error) {
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: error.message || 'Terjadi kesalahan pada server.',
            });
        } finally {
            setConfirmLoading(false);
        }
    };

    useEffect(() => {
        if (props.selectedData) {
            setFormData({ ...defaultData, ...props.selectedData });
        } else {
            setFormData(defaultData);
        }
    }, [props.showModal, props.selectedData]);

    return (
        <Modal
            title={
                <Text style={{ fontSize: '18px' }}>
                    {props.actionMode === 'add'
                        ? 'Tambah Role'
                        : props.actionMode === 'preview'
                        ? 'Preview Role'
                        : 'Edit Role'}
                </Text>
            }
            open={props.showModal}
            onCancel={handleCancel}
            footer={[
                <React.Fragment key="modal-footer">
                    <ConfigProvider
                        theme={{
                            components: {
                                Button: {
                                    defaultBg: 'white',
                                    defaultColor: '#23A55A',
                                    defaultBorderColor: '#23A55A',
                                },
                            },
                        }}
                    >
                        <Button onClick={handleCancel}>{props.readOnly ? 'Tutup' : 'Batal'}</Button>
                    </ConfigProvider>
                    <ConfigProvider
                        theme={{
                            components: {
                                Button: {
                                    defaultBg: '#23a55a',
                                    defaultColor: '#FFFFFF',
                                    defaultBorderColor: '#23a55a',
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
        >
            <Divider />
            <div style={{ marginBottom: 12 }}>
                <Text strong>Status</Text>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                    <Switch
                        disabled={props.readOnly}
                        checked={formData.is_active}
                        onChange={handleStatusToggle}
                        style={{ backgroundColor: formData.is_active ? '#23A55A' : '#bfbfbf' }}
                    />
                    <Text style={{ marginLeft: 8 }}>{formData.is_active ? 'Active' : 'Inactive'}</Text>
                </div>
            </div>
            <Row gutter={16}>
                <Col span={12}>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Role name</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Input
                            name="role_name"
                            value={formData.role_name}
                            placeholder="Masukan nama role"
                            readOnly={props.readOnly}
                            onChange={handleInputChange}
                        />
                    </div>
                </Col>
                <Col span={12}>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Level</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <InputNumber
                            name="role_level"
                            value={formData.role_level}
                            placeholder="Masukan level role"
                            readOnly={props.readOnly}
                            style={{ width: '100%' }}
                            onChange={handleInputNumberChange}
                        />
                    </div>
                </Col>
            </Row>
            <div style={{ marginBottom: 12 }}>
                <Text strong>Role Description</Text>
                <TextArea
                    name="role_description"
                    value={formData.role_description}
                    placeholder="Masukan deskripsi (opsional)"
                    readOnly={props.readOnly}
                    rows={4}
                    onChange={handleInputChange}
                />
            </div>
        </Modal>
    );
};

export default DetailRole;
