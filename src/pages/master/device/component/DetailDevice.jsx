import React, { useEffect, useState } from 'react';
import { Modal, Input, Divider, Typography, Switch, Button, ConfigProvider, Select } from 'antd';
import { NotifAlert, NotifOk } from '../../../../components/Global/ToastNotif';
import { createDevice, updateDevice } from '../../../../api/master-device';
import { getAllBrands } from '../../../../api/master-brand';
import { validateRun } from '../../../../Utils/validate';

const { Text } = Typography;
const { TextArea } = Input;

const DetailDevice = (props) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(false);

    const defaultData = {
        device_id: '',
        device_code: '',
        device_name: '',
        brand_id: '',
        brand_code: '',
        is_active: true,
        device_location: '',
        device_description: '',
        ip_address: '',
        listen_channel: '',
    };

    const [formData, setFormData] = useState(defaultData);

    const handleCancel = () => {
        props.setSelectedData(null);
        props.setActionMode('list');
    };

    const handleSave = async () => {
        setConfirmLoading(true);

        // Daftar aturan validasi
        const validationRules = [
            { field: 'device_name', label: 'Device Name', required: true },
            { field: 'ip_address', label: 'Ip Address', required: true, ip: true },
            { field: 'brand_id', label: 'Brand Device', required: true },
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
            const payload = {
                device_name: formData.device_name,
                is_active: formData.is_active,
                device_location: formData.device_location,
                device_description:
                    formData.device_description && formData.device_description.trim() !== ''
                        ? formData.device_description
                        : ' ',
                ip_address: formData.ip_address,
                brand_id: formData.brand_id,
                listen_channel: formData.listen_channel,
            };

            const response = formData.device_id
                ? await updateDevice(formData.device_id, payload)
                : await createDevice(payload);

            // Check if response is successful
            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                const deviceName = response.data?.device_name || formData.device_name;

                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `Data Device "${deviceName}" berhasil ${
                        formData.device_id ? 'diubah' : 'ditambahkan'
                    }.`,
                });

                props.setActionMode('list');
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: response?.message || 'Terjadi kesalahan saat menyimpan data.',
                });
            }
        } catch (error) {
            console.error('Save Device Error:', error);
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
    };

    const handleSelectChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleStatusToggle = (event) => {
        const isChecked = event;
        setFormData({
            ...formData,
            is_active: isChecked ? true : false,
        });
    };

    // Fungsi untuk mengambil daftar brand
    const fetchBrands = async () => {
        setLoadingBrands(true);
        try {
            const response = await getAllBrands(new URLSearchParams());
            if (response && response.data) {
                setBrands(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: error.message || 'Gagal mengambil data brand',
            });
        } finally {
            setLoadingBrands(false);
        }
    };

    useEffect(() => {
        if (props.showModal && (props.actionMode === 'add' || props.actionMode === 'edit')) {
            fetchBrands();
        }
    }, [props.showModal, props.actionMode]);

    useEffect(() => {
        if (props.selectedData) {
            setFormData(props.selectedData);
        } else {
            setFormData(defaultData);
        }
    }, [props.showModal, props.selectedData, props.actionMode]);

    return (
        <Modal
            // title={`${formData.id_apd === '' ? 'Tambah' : 'Edit'} APD`}
            title={`${
                props.actionMode === 'add'
                    ? 'Tambah'
                    : props.actionMode === 'preview'
                    ? 'Preview'
                    : 'Edit'
            } Device`}
            open={props.showModal}
            // open={true}
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
        >
            {formData && (
                <div>
                    <div>
                        <div>
                            <Text strong>Device Status</Text>
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
                                        backgroundColor:
                                            formData.is_active === true ? '#23A55A' : '#bfbfbf',
                                    }}
                                    checked={formData.is_active === true}
                                    onChange={handleStatusToggle}
                                />
                            </div>
                            <div>
                                <Text>{formData.is_active === true ? 'Running' : 'Offline'}</Text>
                            </div>
                        </div>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                    <div hidden>
                        <Text strong>Device ID</Text>
                        <Input
                            name="device_id"
                            value={formData.device_id}
                            onChange={handleInputChange}
                            disabled
                        />
                    </div>
                    {/* Device Code - Auto Increment & Read Only */}
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Device Code</Text>
                        <Input
                            name="device_code"
                            value={formData.device_code}
                            placeholder={'Device Code Auto Fill'}
                            disabled
                            style={{
                                backgroundColor: '#f5f5f5',
                                cursor: 'not-allowed',
                                color: formData.device_code ? '#000000' : '#bfbfbf',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Device Name</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Input
                            name="device_name"
                            value={formData.device_name}
                            onChange={handleInputChange}
                            placeholder="Enter Device Name"
                            readOnly={props.readOnly}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Brand Device</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Select
                            name="brand_id"
                            value={formData.brand_id}
                            onChange={(value) => handleSelectChange('brand_id', value)}
                            placeholder="Select Brand Device"
                            disabled={props.readOnly}
                            loading={loadingBrands}
                            style={{ width: '100%' }}
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {brands.map((brand) => (
                                <Select.Option key={brand.brand_id} value={brand.brand_id}>
                                    {`${brand.brand_code} - ${brand.brand_name} `}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Device Location</Text>
                        <Input
                            type="text"
                            name="device_location"
                            value={formData.device_location}
                            onChange={handleInputChange}
                            placeholder="Enter Device Location"
                            readOnly={props.readOnly}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>IP Address</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Input
                            name="ip_address"
                            value={formData.ip_address}
                            onChange={handleInputChange}
                            placeholder="e.g. 192.168.1.1"
                            readOnly={props.readOnly}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Listen Channel</Text>
                        <Input
                            name="listen_channel"
                            value={formData.listen_channel}
                            onChange={handleInputChange}
                            placeholder="Enter Listen Channel"
                            readOnly={props.readOnly}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Device Description</Text>
                        <TextArea
                            name="device_description"
                            value={formData.device_description}
                            onChange={handleInputChange}
                            placeholder="Enter Device Description (Optional)"
                            readOnly={props.readOnly}
                            rows={4}
                        />
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default DetailDevice;
