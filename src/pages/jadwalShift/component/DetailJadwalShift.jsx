import React, { useEffect, useState } from 'react';
import { Modal, Select, Typography, Button, ConfigProvider } from 'antd';
import { NotifOk } from '../../../components/Global/ToastNotif';
import { createJadwalShift, updateJadwalShift } from '../../../api/jadwal-shift';
import { getAllUser } from '../../../api/user';
import { getAllShift } from '../../../api/master-shift';
import { validateRun } from '../../../Utils/validate';

const { Text } = Typography;
const { Option } = Select;

const DetailJadwalShift = (props) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const defaultData = {
        id: '',
        user_id: null,
        shift_id: null,
        schedule_id: '',
        user_phone: null,
    };

    const [formData, setFormData] = useState(defaultData);

    const handleSelectChange = (name, value) => {
        const updates = { [name]: value };

        if (name === 'user_id') {
            const selectedEmployee = employees.find((emp) => emp.user_id === value);
            updates.user_phone = selectedEmployee?.user_phone || '-';
        }

        setFormData({
            ...formData,
            ...updates,
        });
    };

    const handleCancel = () => {
        props.setSelectedData(null);
        props.setActionMode('list');
    };

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const params = new URLSearchParams({
                page: 1,
                limit: 100,
            });

            const [usersResponse, shiftsResponse] = await Promise.all([
                getAllUser(params),
                getAllShift(params),
            ]);

            const userData = usersResponse?.data || usersResponse || [];
            const shiftData = shiftsResponse?.data || shiftsResponse || [];

            setEmployees(Array.isArray(userData) ? userData : []);
            setShifts(Array.isArray(shiftData) ? shiftData : []);
        } catch (error) {
            NotifOk({
                icon: 'error',
                title: 'Gagal',
                message: 'Gagal memuat data karyawan atau shift.',
            });
        } finally {
            setLoadingData(false);
        }
    };

    const handleSave = async () => {
        setConfirmLoading(true);

        // Daftar aturan validasi
        const validationRules = [
            { field: 'user_id', label: 'Nama Karyawan', required: true },
            { field: 'shift_id', label: 'Shift', required: true },
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
                user_id: formData.user_id,
                shift_id: formData.shift_id,
            };

            // Add schedule_id only if editing and it exists
            if (props.actionMode === 'edit' && formData.schedule_id) {
                payload.schedule_id = formData.schedule_id;
            }

            const response =
                props.actionMode === 'edit'
                    ? await updateJadwalShift(formData.id, payload)
                    : await createJadwalShift(payload);

            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                const action = props.actionMode === 'edit' ? 'diubah' : 'ditambahkan';

                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `Jadwal berhasil ${action}.`,
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

    useEffect(() => {
        if (props.showModal) {
            fetchData();
        }

        if (props.selectedData) {
            setFormData({
                id: props.selectedData.id || '',
                user_id: props.selectedData.user_id || null,
                shift_id: props.selectedData.shift_id || null,
                schedule_id: props.selectedData.schedule_id || '',
                user_phone: props.selectedData.whatsapp || props.selectedData.user_phone || null,
            });
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
            } Jadwal Shift`}
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
                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Nama Karyawan</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Select
                            value={formData.user_id}
                            onChange={(value) => handleSelectChange('user_id', value)}
                            placeholder="Pilih karyawan"
                            disabled={props.readOnly || loadingData}
                            loading={loadingData}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            style={{ width: '100%' }}
                        >
                            {employees
                                .filter((emp) => emp.user_id != null)
                                .map((emp) => (
                                    <Option key={`emp-${emp.user_id}`} value={emp.user_id}>
                                        {emp.user_fullname || emp.user_name}
                                    </Option>
                                ))}
                        </Select>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>No. Telepon</Text>
                        <div
                            style={{
                                padding: '8px 12px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '6px',

                                marginTop: '4px',
                                color: formData.user_phone ? '#000' : '#999',
                            }}
                        >
                            {formData.user_phone || 'Pilih karyawan terlebih dahulu'}
                        </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Shift</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Select
                            value={formData.shift_id}
                            onChange={(value) => handleSelectChange('shift_id', value)}
                            placeholder="Pilih shift"
                            disabled={props.readOnly || loadingData}
                            loading={loadingData}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            style={{ width: '100%' }}
                        >
                            {shifts
                                .filter((shift) => shift.shift_id != null)
                                .map((shift) => (
                                    <Option key={`shift-${shift.shift_id}`} value={shift.shift_id}>
                                        {shift.shift_name}
                                    </Option>
                                ))}
                        </Select>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default DetailJadwalShift;
