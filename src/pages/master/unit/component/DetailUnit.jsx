import React, { useEffect, useState } from 'react';
import { Modal, Input, Typography, Switch, Button, ConfigProvider, Divider, Select } from 'antd';
import { NotifOk } from '../../../../components/Global/ToastNotif';
import { createUnit, updateUnit } from '../../../../api/master-unit';
import { validateRun } from '../../../../Utils/validate';

const { Text } = Typography;

const DetailUnit = (props) => {
    const [confirmLoading, setConfirmLoading] = useState(false);

    const defaultData = {
        unit_id: '',
        unit_code: '',
        unit_name: '',
        unit_description: '',
        is_active: true,
    };

    const [formData, setFormData] = useState(defaultData);

    const handleCancel = () => {
        props.setSelectedData(null);
        props.setActionMode('list');
    };

    const handleSave = async () => {
        setConfirmLoading(true);

        const validationRules = [{ field: 'unit_name', label: 'Unit Name', required: true }];

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
                unit_name: formData.unit_name,
                unit_description: formData.unit_description,
                is_active: formData.is_active,
            };

            const response =
                props.actionMode === 'edit'
                    ? await updateUnit(formData.unit_id, payload)
                    : await createUnit(payload);

            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                const action = props.actionMode === 'edit' ? 'diubah' : 'ditambahkan';

                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `Data Unit berhasil ${action}.`,
                });

                props.setActionMode('list');
            } else {
                NotifOk({
                    icon: 'error',
                    title: 'Gagal',
                    message: response?.message || 'Terjadi kesalahan saat menyimpan data.',
                });
            }
        } catch (error) {
            NotifOk({
                icon: 'error',
                title: 'Error',
                message: error.message || 'Terjadi kesalahan pada server.',
            });
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleStatusToggle = (checked) => {
        setFormData({
            ...formData,
            is_active: checked,
        });
    };

    useEffect(() => {
        if (props.selectedData) {
            setFormData(props.selectedData);
        } else {
            setFormData(defaultData);
        }
    }, [props.showModal, props.selectedData, props.actionMode]);

    return (
        <Modal
            title={`${
                props.actionMode === 'add'
                    ? 'Tambah'
                    : props.actionMode === 'preview'
                    ? 'Preview'
                    : 'Edit'
            } Unit`}
            open={props.showModal}
            onCancel={handleCancel}
            width={600}
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
            {formData && (
                <div>
                    <div>
                        <div>
                            <Text strong>Status</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                            <div style={{ marginRight: '8px' }}>
                                <Switch
                                    disabled={props.readOnly}
                                    style={{
                                        backgroundColor: formData.is_active ? '#23A55A' : '#bfbfbf',
                                    }}
                                    checked={formData.is_active}
                                    onChange={handleStatusToggle}
                                />
                            </div>
                            <div>
                                <Text>{formData.is_active ? 'Active' : 'Inactive'}</Text>
                            </div>
                        </div>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Unit Code</Text>
                        <Input
                            name="unit_code"
                            value={formData.unit_code || ''}
                            placeholder="Unit Code Auto Fill"
                            disabled
                            style={{
                                backgroundColor: '#f5f5f5',
                                cursor: 'not-allowed',
                                color: formData.unit_code ? '#000000' : '#bfbfbf',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Unit Name</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Input
                            name="unit_name"
                            value={formData.unit_name}
                            onChange={handleInputChange}
                            placeholder="Enter Unit Name"
                            readOnly={props.readOnly}
                        />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Description</Text>
                        <Input.TextArea
                            name="unit_description"
                            value={formData.unit_description}
                            onChange={handleInputChange}
                            placeholder="Enter Description (Optional)"
                            readOnly={props.readOnly}
                            rows={4}
                            maxLength={255}
                        />
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default DetailUnit;
