import React, { useEffect, useState } from 'react';
import { Modal, Input, Typography, Switch, Button, ConfigProvider, Select, Checkbox } from 'antd';
import { NotifAlert, NotifOk } from '../../../../components/Global/ToastNotif';
import { createTag, updateTag, getAllTag } from '../../../../api/master-tag';
import { getAllDevice } from '../../../../api/master-device';
import { getAllPlantSection } from '../../../../api/master-plant-section';
import { getAllUnit } from '../../../../api/master-unit';
import { validateRun } from '../../../../Utils/validate';

const { Text } = Typography;

const DetailTag = (props) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [deviceList, setDeviceList] = useState([]);
    const [loadingDevices, setLoadingDevices] = useState(false);
    const [plantSubSectionList, setPlantSubSectionList] = useState([]);
    const [loadingPlantSubSections, setLoadingPlantSubSections] = useState(false);
    const [unitList, setUnitList] = useState([]);
    const [loadingUnits, setLoadingUnits] = useState(false);

    const defaultData = {
        tag_id: '',

        tag_name: '',
        tag_number: '',
        data_type: '',
        unit: '',
        is_active: true,
        is_alarm: false,
        is_report: false,
        is_history: false,
        lim_low_crash: '',
        lim_low: '',
        lim_high: '',
        lim_high_crash: '',
        device_id: null,
        tag_description: '',

        plant_sub_section_id: null,
    };

    const [formData, setformData] = useState(defaultData);

    const handleCancel = () => {
        props.setSelectedData(null);
        props.setActionMode('list');
    };

    const handleSave = async () => {
        setConfirmLoading(true);

        // Daftar aturan validasi
        const validationRules = [
            { field: 'tag_name', label: 'Tag Name', required: true },
            { field: 'tag_number', label: 'Tag Number', required: true },
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

        // Validasi format number untuk tag_number
        const tagNumberInt = Number(formData.tag_number);
        if (isNaN(tagNumberInt)) {
            NotifOk({
                icon: 'warning',
                title: 'Peringatan',
                message: 'Tag Number harus berupa angka yang valid',
            });
            setConfirmLoading(false);
            return;
        }

        // Validasi duplicate tag_number
        try {
            const params = new URLSearchParams({ limit: 10000 });
            const response = await getAllTag(params);

            // Handle different response structures
            let existingTags = [];
            if (response) {
                if (Array.isArray(response)) {
                    existingTags = response;
                } else if (response.data && Array.isArray(response.data)) {
                    existingTags = response.data;
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    existingTags = response.data.data;
                }
            }

            if (existingTags.length > 0) {
                const isDuplicate = existingTags.some((tag) => {
                    // Handle both string and number tag_number
                    const existingTagNumber = Number(tag.tag_number);
                    const currentTagNumber = Number(formData.tag_number);

                    // Check if numbers are valid and equal
                    const isSameNumber = !isNaN(existingTagNumber) && !isNaN(currentTagNumber) &&
                                       existingTagNumber === currentTagNumber;

                    // For edit mode, exclude the current tag from duplicate check
                    const isDifferentTag = formData.tag_id ?
                        String(tag.tag_id) !== String(formData.tag_id) : true;

                    return isSameNumber && isDifferentTag;
                });

                if (isDuplicate) {
                    NotifOk({
                        icon: 'warning',
                        title: 'Peringatan',
                        message: `Tag Number ${formData.tag_number} sudah digunakan. Silakan gunakan nomor yang berbeda.`,
                    });
                    setConfirmLoading(false);
                    return;
                }
            }
        } catch (error) {
            console.error('Error checking duplicate tag number:', error);
            NotifOk({
                icon: 'error',
                title: 'Error',
                message: 'Gagal memvalidasi Tag Number. Silakan coba lagi.',
            });
            setConfirmLoading(false);
            return;
        }

        // Validasi data type hanya jika diisi
        if (formData.data_type && formData.data_type.trim() !== '') {
            const validDataTypes = ['Discrete', 'Analog'];
            if (!validDataTypes.includes(formData.data_type)) {
                NotifOk({
                    icon: 'warning',
                    title: 'Peringatan',
                    message: `Data Type harus "Discrete" atau "Analog". Nilai "${formData.data_type}" tidak valid. Silakan pilih dari dropdown.`,
                });
                setConfirmLoading(false);
                return;
            }
        }

        // Prepare payload berdasarkan backend validation schema
        const payload = {
            tag_name: formData.tag_name.trim(),
            tag_number: Number(formData.tag_number),
            is_active: formData.is_active,
            is_alarm: formData.is_alarm,
            is_report: formData.is_report,
            is_history: formData.is_history,
        };

        // Add data_type only if it has a value
        if (formData.data_type && formData.data_type.trim() !== '') {
            payload.data_type = formData.data_type;
        }

        // Add unit only if it has a value
        if (formData.unit && formData.unit.trim() !== '') {
            payload.unit = formData.unit.trim();
        }

        payload.tag_description = (formData.tag_description && formData.tag_description.trim() !== '') ? formData.tag_description.trim() : ' ';

        // Add device_id only if it has a value
        if (formData.device_id) {
            payload.device_id = Number(formData.device_id);
        }

        // Add limit fields only if they have values
        if (formData.lim_low_crash !== '' && formData.lim_low_crash !== null) {
            payload.lim_low_crash = Number(formData.lim_low_crash);
        }
        if (formData.lim_low !== '' && formData.lim_low !== null) {
            payload.lim_low = Number(formData.lim_low);
        }
        if (formData.lim_high !== '' && formData.lim_high !== null) {
            payload.lim_high = Number(formData.lim_high);
        }
        if (formData.lim_high_crash !== '' && formData.lim_high_crash !== null) {
            payload.lim_high_crash = Number(formData.lim_high_crash);
        }

        // Add plant_sub_section_id only if it has a value
        if (formData.plant_sub_section_id) {
            payload.plant_sub_section_id = Number(formData.plant_sub_section_id);
        }

        try {
            const response =
                props.actionMode === 'edit'
                    ? await updateTag(formData.tag_id, payload)
                    : await createTag(payload);

            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                const action = props.actionMode === 'edit' ? 'diubah' : 'ditambahkan';

                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `Data Tag berhasil ${action}.`,
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
        setformData({
            ...formData,
            [name]: value,
        });
    };

    const handleSelectChange = (name, value) => {
        setformData({
            ...formData,
            [name]: value,
        });
    };

    const handleDeviceChange = (deviceId) => {
        setformData({
            ...formData,
            device_id: deviceId,
        });
    };

    const handleStatusToggle = (checked) => {
        setformData({
            ...formData,
            is_active: checked,
        });
    };

    const handleAlarmToggle = (e) => {
        setformData({
            ...formData,
            is_alarm: e.target.checked,
        });
    };

    const handleReportToggle = (e) => {
        setformData({
            ...formData,
            is_report: e.target.checked,
        });
    };

    const handleHistoryToggle = (e) => {
        setformData({
            ...formData,
            is_history: e.target.checked,
        });
    };

    const loadDevices = async () => {
        setLoadingDevices(true);
        try {
            const params = new URLSearchParams({ limit: 1000 });
            const response = await getAllDevice(params);

            if (response && response.data) {
                const devices = response.data;
                const activeDevices = devices.filter((device) => device.is_active === true);
                setDeviceList(activeDevices);
            }
        } catch (error) {
            console.error('Error loading devices:', error);
        } finally {
            setLoadingDevices(false);
        }
    };

    const loadPlantSubSections = async () => {
        setLoadingPlantSubSections(true);
        try {
            const params = new URLSearchParams({ limit: 1000 });
            const response = await getAllPlantSection(params);

            if (response && response.data) {
                const activePlantSubSections = response.data.filter(
                    (section) => section.is_active === true
                );
                setPlantSubSectionList(activePlantSubSections);
            }
        } catch (error) {
            console.error('Error loading plant sub sections:', error);
        } finally {
            setLoadingPlantSubSections(false);
        }
    };

    const loadUnits = async () => {
        setLoadingUnits(true);
        try {
            const params = new URLSearchParams({ limit: 1000 });
            const response = await getAllUnit(params);

            if (response && response.data) {
                const units = response.data;
                const activeUnits = units.filter((unit) => unit.is_active === true);
                setUnitList(activeUnits);
            }
        } catch (error) {
            console.error('Error loading units:', error);
        } finally {
            setLoadingUnits(false);
        }
    };

    useEffect(() => {
        if (props.showModal) {
            // Load devices, plant sub sections, and units when modal opens
            loadDevices();
            loadPlantSubSections();
            loadUnits();
        }

        if (props.selectedData) {
            setformData(props.selectedData);
        } else {
            setformData(defaultData);
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
            } Tag`}
            open={props.showModal}
            onCancel={handleCancel}
            width={1000}
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
                    <div hidden>
                        <Text strong>Tag ID</Text>
                        <Input
                            name="tag_id"
                            value={formData.tag_id}
                            onChange={handleInputChange}
                            disabled
                        />
                    </div>
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
                    {/* Tag Code dan Alarm, Report dan History */}
                    <div style={{ marginBottom: 12 }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '20px',
                            }}
                        >
                            {/* Tag Code - Auto Increment & Read Only */}
                            <div style={{ flex: 1 }}>
                                <Text strong>Tag Code</Text>
                                <Input
                                    name="tag_code"
                                    value={formData.tag_code || ''}
                                    placeholder={'Tag Code Auto Fill'}
                                    disabled
                                    style={{
                                        backgroundColor: '#f5f5f5',
                                        cursor: 'not-allowed',
                                        color: formData.tag_code ? '#000000' : '#bfbfbf',
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: '20px',
                                    }}
                                >
                                    {/* Alarm Checkbox */}
                                    <div style={{ flex: 1 }}>
                                        <Text strong>Alarm</Text>
                                        <div style={{ marginTop: '8px' }}>
                                            <Checkbox
                                                disabled={props.readOnly}
                                                checked={formData.is_alarm === true}
                                                onChange={handleAlarmToggle}
                                            />
                                        </div>
                                    </div>
                                    {/* Report Checkbox */}
                                    <div style={{ flex: 1 }}>
                                        <Text strong>Report</Text>
                                        <div style={{ marginTop: '8px' }}>
                                            <Checkbox
                                                disabled={props.readOnly}
                                                checked={formData.is_report === true}
                                                onChange={handleReportToggle}
                                            />
                                        </div>
                                    </div>
                                    {/* History Checkbox */}
                                    <div style={{ flex: 1 }}>
                                        <Text strong>History</Text>
                                        <div>
                                            <Checkbox
                                                disabled={props.readOnly}
                                                checked={formData.is_history === true}
                                                onChange={handleHistoryToggle}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tag Number dan Tag Name dalam satu baris */}
                    <div style={{ marginBottom: 12 }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '16px',
                            }}
                        >
                            {/* Tag Number */}
                            <div style={{ flex: 1 }}>
                                <Text strong>Tag Number</Text>
                                <Text style={{ color: 'red' }}> *</Text>
                                <Input
                                    name="tag_number"
                                    value={formData.tag_number}
                                    onChange={handleInputChange}
                                    placeholder="Enter Tag Number"
                                    readOnly={props.readOnly}
                                />
                            </div>
                            {/* Tag Name */}
                            <div style={{ flex: 1 }}>
                                <Text strong>Tag Name</Text>
                                <Text style={{ color: 'red' }}> *</Text>
                                <Input
                                    name="tag_name"
                                    value={formData.tag_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter Tag Name"
                                    readOnly={props.readOnly}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Plant Sub Section dan Device dalam satu baris */}
                    <div style={{ marginBottom: 12 }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '16px',
                            }}
                        >
                            {/* Plant Sub Section */}
                            <div style={{ flex: 1 }}>
                                <Text strong>Plant Sub Section</Text>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Select Plant Sub Section"
                                    value={formData.plant_sub_section_id || undefined}
                                    onChange={(value) =>
                                        handleSelectChange('plant_sub_section_id', value)
                                    }
                                    disabled={props.readOnly}
                                    loading={loadingPlantSubSections}
                                    showSearch
                                    allowClear
                                    optionFilterProp="children"
                                    filterOption={(input, option) => {
                                        const text = option.children;
                                        if (!text) return false;
                                        return text.toLowerCase().includes(input.toLowerCase());
                                    }}
                                >
                                    {plantSubSectionList.map((section) => (
                                        <Select.Option
                                            key={section.plant_sub_section_id}
                                            value={section.plant_sub_section_id}
                                        >
                                            {section.plant_sub_section_name || ''}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                            {/* Device */}
                            <div style={{ flex: 1 }}>
                                <Text strong>Device</Text>

                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Select Device"
                                    value={formData.device_id || undefined}
                                    onChange={handleDeviceChange}
                                    disabled={props.readOnly}
                                    loading={loadingDevices}
                                    showSearch
                                    allowClear
                                    optionFilterProp="children"
                                    filterOption={(input, option) => {
                                        const text = option.children;
                                        if (!text) return false;
                                        return text.toLowerCase().includes(input.toLowerCase());
                                    }}
                                >
                                    {deviceList.map((device) => (
                                        <Select.Option
                                            key={device.device_id}
                                            value={device.device_id}
                                        >
                                            {`${device.device_code || ''} - ${
                                                device.device_name || ''
                                            }`}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>
                    {/* Data Type dan Unit dalam satu baris */}
                    <div style={{ marginBottom: 12 }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '16px',
                            }}
                        >
                            {/* Data Type */}
                            <div style={{ flex: 1 }}>
                                <Text strong>Data Type</Text>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Select Data Type"
                                    value={formData.data_type || undefined}
                                    onChange={(value) => handleSelectChange('data_type', value)}
                                    disabled={props.readOnly}
                                >
                                    <Select.Option value="Discrete">Discrete</Select.Option>
                                    <Select.Option value="Analog">Analog</Select.Option>
                                </Select>
                            </div>
                            {/* Unit */}
                            <div style={{ flex: 1 }}>
                                <Text strong>Unit</Text>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Select Unit"
                                    value={formData.unit || undefined}
                                    onChange={(value) => handleSelectChange('unit', value)}
                                    disabled={props.readOnly}
                                    loading={loadingUnits}
                                    showSearch
                                    allowClear
                                    optionFilterProp="children"
                                    filterOption={(input, option) => {
                                        const text = option.children;
                                        if (!text) return false;
                                        return text.toLowerCase().includes(input.toLowerCase());
                                    }}
                                >
                                    {unitList.map((unit) => (
                                        <Select.Option key={unit.unit_id} value={unit.unit_name}>
                                            {unit.unit_code_name ||
                                                `${unit.unit_code || ''} - ${unit.unit_name || ''}`}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>
                    {/* Semua Limit dalam satu baris */}
                    <div style={{ marginBottom: 12 }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '12px',
                            }}
                        >
                            {/* Limit Low Low */}
                            <div style={{ flex: 1 }}>
                                <Text strong>Limit Low Low</Text>
                                <Input
                                    name="lim_low_crash"
                                    value={formData.lim_low_crash}
                                    onChange={handleInputChange}
                                    placeholder="Enter Limit Low Low"
                                    readOnly={props.readOnly}
                                    type="number"
                                    step="any"
                                />
                            </div>
                            {/* Limit Low */}
                            <div style={{ flex: 1 }}>
                                <Text strong>Limit Low</Text>
                                <Input
                                    name="lim_low"
                                    value={formData.lim_low}
                                    onChange={handleInputChange}
                                    placeholder="Enter Limit Low"
                                    readOnly={props.readOnly}
                                    type="number"
                                    step="any"
                                />
                            </div>
                            {/* Limit High */}
                            <div style={{ flex: 1 }}>
                                <Text strong>Limit High</Text>
                                <Input
                                    name="lim_high"
                                    value={formData.lim_high}
                                    onChange={handleInputChange}
                                    placeholder="Enter Limit High"
                                    readOnly={props.readOnly}
                                    type="number"
                                    step="any"
                                />
                            </div>
                            {/* Limit High High */}
                            <div style={{ flex: 1 }}>
                                <Text strong>Limit High High</Text>
                                <Input
                                    name="lim_high_crash"
                                    value={formData.lim_high_crash}
                                    onChange={handleInputChange}
                                    placeholder="Enter Limit High High"
                                    readOnly={props.readOnly}
                                    type="number"
                                    step="any"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Description */}
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Description</Text>
                        <Input.TextArea
                            name="tag_description"
                            value={formData.tag_description}
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

export default DetailTag;
