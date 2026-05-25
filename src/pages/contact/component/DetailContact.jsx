import React, { memo, useEffect, useState } from 'react';
import { Modal, Input, Button, Switch, ConfigProvider, Typography, Divider, Select } from 'antd';
import { NotifAlert, NotifOk } from '../../../components/Global/ToastNotif';
import { validateRun } from '../../../Utils/validate';
import { createContact, updateContact } from '../../../api/contact';

const { Text } = Typography;

const DetailContact = memo(function DetailContact(props) {
    const [confirmLoading, setConfirmLoading] = useState(false);

    const defaultData = {
        id: '',
        name: '',
        phone: '',
        is_active: true,
    };

    const [formData, setFormData] = useState(defaultData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validasi untuk field phone - hanya angka yang diperbolehkan
        if (name === 'phone') {
            const cleanedValue = value.replace(/[^0-9+\-\s()]/g, '');
            setFormData((prev) => ({
                ...prev,
                [name]: cleanedValue,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

  
    const handleStatusToggle = (checked) => {
        setFormData({
            ...formData,
            is_active: checked,
        });
    };

    const handleSave = async () => {
        setConfirmLoading(true);

        // Validation rules
        const validationRules = [
            { field: 'name', label: 'Contact Name', required: true },
            { field: 'phone', label: 'Phone', required: true },
        ];

        if (
            validateRun(formData, validationRules, (errorMessages) => {
                NotifOk({ icon: 'warning', title: 'Peringatan', message: errorMessages });
                setConfirmLoading(false);
            })
        )
            return;

        // Custom validation untuk name - minimal 3 karakter
        if (formData.name && formData.name.length < 3) {
            NotifOk({
                icon: 'warning',
                title: 'Peringatan',
                message: 'Nama contact minimal 3 karakter',
            });
            setConfirmLoading(false);
            return;
        }

        // Custom validation untuk phone - Indonesian phone format
        const phoneRegex = /^(?:\+62|0)8\d{7,10}$/;
        if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
            NotifOk({
                icon: 'warning',
                title: 'Peringatan',
                message: 'Nomor telepon harus format Indonesia (+628XXXXXXXXX atau 08XXXXXXXXX)',
            });
            setConfirmLoading(false);
            return;
        }

        try {
            const contactData = {
                contact_name: formData.name,
                contact_phone: formData.phone.replace(/[\s\-\(\)]/g, ''), // Clean phone number
                is_active: formData.is_active,
            };

            let response;
            if (props.actionMode === 'edit') {
                response = await updateContact(
                    props.selectedData.contact_id || props.selectedData.id,
                    contactData
                );
            } else {
                response = await createContact(contactData);
            }

            NotifAlert({
                icon: 'success',
                title: 'Berhasil',
                message: `Data Contact "${formData.name}" berhasil ${
                    props.actionMode === 'add' ? 'ditambahkan' : 'diperbarui'
                }.`,
            });

            props.onContactSaved?.(response.data, props.actionMode);
            handleCancel();
        } catch (error) {
            console.error('Save failed:', error);
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
            });
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleCancel = () => {
        props.setActionMode('list');
        props.setSelectedData(null);
    };

    useEffect(() => {
        if (props.showModal) {
            if (props.actionMode === 'edit' && props.selectedData) {
                setFormData({
                    name: props.selectedData.contact_name || props.selectedData.name,
                    phone: props.selectedData.contact_phone || props.selectedData.phone,
                    is_active:
                        props.selectedData.is_active || props.selectedData.status === 'active',
                });
            } else if (props.actionMode === 'add') {
                setFormData({
                    name: '',
                    phone: '',
                    is_active: true,
                });
            }
        }
    }, [props.showModal, props.actionMode, props.selectedData]);

    return (
        <Modal
            title={`${
                props.actionMode === 'add'
                    ? 'Tambah'
                    : props.actionMode === 'edit'
                    ? 'Edit'
                    : 'Detail'
            } Kontak`}
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
            <div style={{ padding: '8px 0' }}>
                {/* Status field only show in add mode*/}
                {props.actionMode === 'add' && (
                    <>
                        <div>
                            <div>
                                <Text strong>Status</Text>
                            </div>
                            <div
                                style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}
                            >
                                <div style={{ marginRight: '8px' }}>
                                    <Switch
                                        disabled={props.readOnly}
                                        style={{
                                            backgroundColor: formData.is_active
                                                ? '#23A55A'
                                                : '#bfbfbf',
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
                    </>
                )}

                <div style={{ marginBottom: 12 }}>
                    <Text strong>Name</Text>
                    <Text style={{ color: 'red' }}> *</Text>
                    <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter Name"
                        readOnly={props.readOnly}
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <Text strong>Phone</Text>
                    <Text style={{ color: 'red' }}> *</Text>
                    <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter Phone Number"
                        readOnly={props.readOnly}
                        maxLength={15}
                        style={{ color: formData.is_active ? '#000000' : '#ff4d4f' }}
                    />
                </div>
                {/* Contact Type */}
                {/* <div style={{ marginBottom: 12 }}>
                    <Text strong>Contact Type</Text>
                    <Text style={{ color: 'red' }}> *</Text>
                    <Select
                        value={formData.contact_type || undefined}
                        onChange={handleContactTypeChange}
                        placeholder="Select Contact Type"
                        disabled={props.readOnly}
                        style={{ width: '100%' }}
                    >
                        <Select.Option value="operator">Operator</Select.Option>
                        <Select.Option value="gudang">Gudang</Select.Option>
                    </Select>
                </div> */}
            </div>
        </Modal>
    );
});

export default DetailContact;
