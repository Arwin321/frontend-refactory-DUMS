import React, { useEffect, useState } from 'react';
import {
    Modal,
    Input,
    Typography,
    Switch,
    Button,
    ConfigProvider,
    Divider,
    TimePicker,
    Space,
} from 'antd';
import { NotifOk } from '../../../../components/Global/ToastNotif';
import { createShift, updateShift } from '../../../../api/master-shift';
import { validateRun } from '../../../../Utils/validate';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const { Text } = Typography;
const timeFormat = 'HH:mm';

const DetailShift = (props) => {
    const [confirmLoading, setConfirmLoading] = useState(false);

    const defaultData = {
        shift_id: '',
        shift_name: '',
        start_time: '',
        end_time: '',
        is_active: true,
    };

    const [formData, setFormData] = useState(defaultData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleCancel = () => {
        props.setSelectedData(null);
        props.setActionMode('list');
    };

    const handleSave = async () => {
        setConfirmLoading(true);

        // Daftar aturan validasi
        const validationRules = [
            { field: 'shift_name', label: 'Shift Name', required: true },
            { field: 'start_time', label: 'Start Time', required: true },
            { field: 'end_time', label: 'End Time', required: true },
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

        // Validasi format waktu
        if (!formData.start_time || !formData.end_time) {
            NotifOk({
                icon: 'warning',
                title: 'Peringatan',
                message: 'Waktu Mulai dan Waktu Selesai wajib diisi.',
            });
            setConfirmLoading(false);
            return;
        }

        try {
            // Pastikan format waktu HH:mm sesuai validasi BE (regex: /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
            const formatTimeForAPI = (timeValue) => {
                if (!timeValue) return '';

                // Jika sudah dalam format HH:mm, return langsung
                if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}$/)) {
                    return timeValue;
                }

                // Parse dengan dayjs dan format ke HH:mm (string murni, bukan Date object)
                const time = dayjs(timeValue, 'HH:mm', true); // strict mode
                if (time.isValid()) {
                    return time.format('HH:mm'); // Return string "08:00" bukan Date object
                }

                // Fallback: coba parse sebagai ISO date dan ambil jam/menitnya (gunakan UTC)
                const isoTime = dayjs.utc(timeValue);
                if (isoTime.isValid()) {
                    return isoTime.format('HH:mm');
                }

                return '';
            };

            const payload = {
                shift_name: formData.shift_name,
                start_time: formatTimeForAPI(formData.start_time),
                end_time: formatTimeForAPI(formData.end_time),
                is_active: formData.is_active,
            };

            // console.log('Payload yang dikirim:', payload);
            // console.log('Type start_time:', typeof payload.start_time, payload.start_time);
            // console.log('Type end_time:', typeof payload.end_time, payload.end_time);

            const response =
                props.actionMode === 'edit'
                    ? await updateShift(formData.shift_id, payload)
                    : await createShift(payload);

            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                const action = props.actionMode === 'edit' ? 'diubah' : 'ditambahkan';

                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `Data Shift berhasil ${action}.`,
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

    const handleTimeChange = (time, _, field) => {
        // Pastikan format HH:mm yang konsisten sesuai validasi BE
        const formattedTime = time && time.isValid() ? time.format('HH:mm') : '';
        setFormData({
            ...formData,
            [field]: formattedTime,
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
            // Konversi waktu dari berbagai format ke HH:mm menggunakan dayjs
            const convertTimeToString = (timeValue) => {
                if (!timeValue) return '';

                // Jika sudah dalam format HH:mm, return langsung
                if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}$/)) {
                    return timeValue;
                }

                // Jika dalam format ISO (1970-01-01T08:00:00.000Z), extract jam:menit dalam UTC
                const time = dayjs.utc(timeValue);
                if (time.isValid()) {
                    return time.format('HH:mm');
                }

                return '';
            };

            setFormData({
                ...props.selectedData,
                start_time: convertTimeToString(props.selectedData.start_time),
                end_time: convertTimeToString(props.selectedData.end_time),
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
            } Shift`}
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

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Shift Name</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Input
                            name="shift_name"
                            value={formData.shift_name}
                            onChange={handleInputChange}
                            placeholder="Contoh: Pagi, Sore, Malam"
                            readOnly={props.readOnly}
                        />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <Text strong>Shift Time</Text>
                        <Text style={{ color: 'red' }}> *</Text>
                        <Space.Compact block style={{ marginTop: '4px' }}>
                            <TimePicker
                                format={timeFormat}
                                onChange={(time, timeString) =>
                                    handleTimeChange(time, timeString, 'start_time')
                                }
                                style={{ width: '50%' }}
                                placeholder="Start Time "
                                disabled={props.readOnly}
                            />
                            <TimePicker
                                value={
                                    formData.end_time ? dayjs(formData.end_time, timeFormat) : null
                                }
                                format={timeFormat}
                                onChange={(time, timeString) =>
                                    handleTimeChange(time, timeString, 'end_time')
                                }
                                style={{ width: '50%' }}
                                placeholder="End Time "
                                disabled={props.readOnly}
                            />
                        </Space.Compact>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default DetailShift;
