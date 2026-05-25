import React, { useEffect, useState } from 'react';
import {
    Modal,
    Input,
    Divider,
    Typography,
    Button,
    InputNumber,
    Switch,
    Row,
    Col,
    ColorPicker,
} from 'antd';
import { NotifAlert, NotifOk } from '../../../../components/Global/ToastNotif';
import { validateRun } from '../../../../Utils/validate';
import { createStatus, updateStatus } from '../../../../api/master-status';

const { Text } = Typography;
const { TextArea } = Input;

const DetailStatus = (props) => {
    const [confirmLoading, setConfirmLoading] = useState(false);

    const defaultData = {
        status_id: '',
        status_number: null,
        status_name: '',
        status_color: '',
        status_description: '',
        is_active: true,
    };

    const [formData, setFormData] = useState(defaultData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleInputNumberChange = (value) => {
        setFormData({ ...formData, status_number: value });
    };

    const handleStatusToggle = (checked) => {
        setFormData({ ...formData, is_active: checked });
    };

    const handleColorChange = (color, hex) => {
        setFormData({ ...formData, status_color: hex });
    };

    const handleCancel = () => {
        props.setSelectedData(null);
        props.setActionMode('list');
    };

    const handleSave = async () => {
        setConfirmLoading(true);

        const validationRules = [
            { field: 'status_number', label: 'Status Number', required: true },
            { field: 'status_name', label: 'Status Name', required: true },
            { field: 'status_color', label: 'Status Color', required: true },
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
                status_number: formData.status_number,
                status_name: formData.status_name,
                status_color: formData.status_color,
                status_description: (formData.status_description && formData.status_description.trim() !== '') ? formData.status_description : ' ',
                is_active: formData.is_active,
            };

            const response = formData.status_id
                ? await updateStatus(formData.status_id, payload)
                : await createStatus(payload);

            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                const action = formData.status_id ? 'diubah' : 'ditambahkan';
                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `Data Status "${payload.status_name}" berhasil ${action}.`,
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
                        ? 'Add data'
                        : props.actionMode === 'preview'
                        ? 'Preview Status'
                        : 'Edit Status'}
                </Text>
            }
            open={props.showModal}
            onCancel={handleCancel}
            footer={
                !props.readOnly && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px',
                            paddingTop: '15px',
                        }}
                    >
                        <Button onClick={handleCancel}>Batal</Button>
                        <Button type="primary" loading={confirmLoading} onClick={handleSave}>
                            Simpan
                        </Button>
                    </div>
                )
            }
        >
            <Divider />
            <div style={{ marginBottom: 12 }}>
                <Text strong>Status</Text>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                    <Switch
                        disabled={props.readOnly}
                        checked={formData.is_active}
                        onChange={handleStatusToggle}
                    />
                    <Text style={{ marginLeft: 8 }}>
                        {formData.is_active ? 'Active' : 'Inactive'}
                    </Text>
                </div>
            </div>
            <Row gutter={16}>
                <Col span={12}>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Status Number</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <InputNumber
                            name="status_number"
                            value={formData.status_number}
                            placeholder="Masukan nomor status"
                            readOnly={props.readOnly}
                            style={{ width: '100%' }}
                            onChange={handleInputNumberChange}
                        />
                    </div>
                </Col>
                <Col span={12}>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Status Name</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Input
                            name="status_name"
                            value={formData.status_name}
                            placeholder="Masukan nama status"
                            readOnly={props.readOnly}
                            onChange={handleInputChange}
                        />
                    </div>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Status Color</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <div style={{ marginTop: '8px' }}>
                            <ColorPicker
                                value={formData.status_color || '#000000'}
                                onChange={handleColorChange}
                                disabled={props.readOnly}
                                showText={(color) => `color hex: ${color.toHexString()}`}
                                allowClear={false}
                                format="hex"
                                style={{ width: '100%' }}
                                presets={[
                                    {
                                        label: 'Recommended',
                                        colors: [
                                            '#EF4444', // Merah
                                            '#3B82F6', // Biru
                                            '#10B981', // Hijau
                                            '#F59E0B', // Kuning
                                            '#8B5CF6', // Ungu
                                            '#EC4899', // Pink
                                            '#F97316', // Orange
                                            '#14B8A6', // Teal
                                            '#6B7280', // Gray
                                            '#000000', // Black
                                        ],
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </Col>
            </Row>

            <div style={{ marginBottom: 12 }}>
                <Text strong>Description</Text>
                <TextArea
                    name="status_description"
                    value={formData.status_description}
                    placeholder="Masukan deskripsi"
                    readOnly={props.readOnly}
                    rows={4}
                    onChange={handleInputChange}
                />
            </div>
        </Modal>
    );
};

export default DetailStatus;
