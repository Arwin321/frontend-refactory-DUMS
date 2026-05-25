import React, { useEffect, useState } from 'react';
import { Modal, Input, Typography, Switch, Button, ConfigProvider, Divider } from 'antd';
import { NotifAlert, NotifOk } from '../../../../components/Global/ToastNotif';
import { createPlantSection, updatePlantSection } from '../../../../api/master-plant-section';
import { validateRun } from '../../../../Utils/validate';
import TextArea from 'antd/es/input/TextArea';

const { Text } = Typography;

const DetailPlantSubSection = (props) => {
    const [confirmLoading, setConfirmLoading] = useState(false);

    const defaultData = {
        plant_sub_section_id: '',
        plant_sub_section_code: '',
        plant_sub_section_name: '',
        table_name_value: '', // Fix field name
        plant_sub_section_description: '',
        is_active: true,
    };

    const [formData, setFormData] = useState(defaultData);

    const handleInputChange = (e) => {
        // Handle different input types
        let name, value;

        if (e && e.target) {
            // Standard input
            name = e.target.name;
            value = e.target.value;
        } else if (e && e.type === 'change') {
            // Switch or other components
            name = e.name || e.target?.name;
            value = e.value !== undefined ? e.value : e.checked;
        } else {
            // Fallback
            return;
        }

        // console.log(`📝 Input change: ${name} = ${value}`);

        if (name) {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleCancel = () => {
        props.setSelectedData(null);
        props.setActionMode('list');
    };

    const handleSave = async () => {
        setConfirmLoading(true);

        // Daftar aturan validasi
        const validationRules = [
            { field: 'plant_sub_section_name', label: 'Plant Sub Section Name', required: true },
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
        )
            return;

        try {
            // console.log('💾 Current formData before save:', formData);

            const payload = {
                plant_sub_section_name: formData.plant_sub_section_name,
                plant_sub_section_description:
                    formData.plant_sub_section_description &&
                    formData.plant_sub_section_description.trim() !== ''
                        ? formData.plant_sub_section_description
                        : ' ',
                table_name_value: formData.table_name_value, // Fix field name
                is_active: formData.is_active,
            };

            // console.log('📤 Payload to be sent:', payload);

            const response =
                props.actionMode === 'edit'
                    ? await updatePlantSection(formData.plant_sub_section_id, payload)
                    : await createPlantSection(payload);

            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                const action = props.actionMode === 'edit' ? 'diubah' : 'ditambahkan';

                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `Data Plant Section berhasil ${action}.`,
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

    const handleStatusToggle = (checked) => {
        setFormData({
            ...formData,
            is_active: checked,
        });
    };

    useEffect(() => {
        //  console.log('🔄 Modal state changed:', {
        //     showModal: props.showModal,
        //     actionMode: props.actionMode,
        //     selectedData: props.selectedData,
        // });

        if (props.selectedData) {
            // console.log('📋 Setting form data from selectedData:', props.selectedData);
            setFormData(props.selectedData);
        } else {
            // console.log('📋 Resetting to default data');
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
            } Plant Section`}
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

                    {/* Plant Section Code - Auto Increment & Read Only */}
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Plant Sub Section Code</Text>
                        <Input
                            name="sub_section_code"
                            value={formData.sub_section_code || ''}
                            placeholder={'Plant Sub Section Code Auto Fill'}
                            disabled
                            style={{
                                backgroundColor: '#f5f5f5',
                                cursor: 'not-allowed',
                                color: formData.sub_section_code ? '#000000' : '#bfbfbf',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Plant Sub Section Name</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Input
                            name="plant_sub_section_name"
                            value={formData.plant_sub_section_name}
                            onChange={handleInputChange}
                            placeholder="Enter Plant Sub Section Name"
                            readOnly={props.readOnly}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Table Name Value</Text>
                        <Input
                            name="table_name_value"
                            value={formData.table_name_value}
                            onChange={handleInputChange}
                            placeholder="Enter Table Name Value (Optional)"
                            readOnly={props.readOnly}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Description</Text>
                        <TextArea
                            name="plant_sub_section_description"
                            value={formData.plant_sub_section_description}
                            onChange={handleInputChange}
                            placeholder="Enter Description (Optional)"
                            readOnly={props.readOnly}
                            rows={4}
                        />
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default DetailPlantSubSection;
