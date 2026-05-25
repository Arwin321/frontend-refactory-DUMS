import React, { useState } from 'react';
import {
    Button,
    Modal,
    Divider,
    Card,
    Tag,
    ConfigProvider,
    Typography,
    message,
    Input,
    Radio,
} from 'antd';
import { getStatusHistory, approvalPermit } from '../../api/status-history';
import { NotifAlert, NotifOk, NotifConfirmDialog } from './ToastNotif';
import { getSessionData } from './Formatter';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const { Text } = Typography;
const { TextArea } = Input;

const StatusButton = (props) => {
    const {
        color,
        name,
        style,
        canApprove = true,
        canReject = true,
        refreshData = (e) => {},
    } = props;

    const session = getSessionData();
    const isVendor = session?.user?.role_id == `${import.meta.env.VITE_ROLE_VENDOR}`;

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPermitSelesai, setShowPermitSelesai] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [deskripsi, setDeskripsi] = useState('');
    const [closeType, setCloseType] = useState('1');

    const pengajuanPermitSelesai = 4;
    const permitSelesai = 7;

    const fetchHistory = async () => {
        const permitId = props.permitId;
        const id = parseInt(permitId);

        if (!permitId || isNaN(id)) {
            console.error('Permit ID tidak valid:', permitId);
            message.error('Permit ID tidak valid atau kosong');
            return;
        }

        try {
            const res = await getStatusHistory(id);

            const mapped =
                res?.data?.data?.map((item) => ({
                    name: item.name,
                    color: item.status_permit_color,
                    text: item.status_permit_name,
                    deskripsi: item.deskripsi,
                    date: item.created_at,
                    closed: item.close_type !== null ? item.close_type_name : null,
                })) ?? [];

            setHistoryData(mapped);
        } catch (err) {
            console.error('API ERROR:', err);
            message.error('Gagal mengambil riwayat status dari server');
        }
    };

    const showModal = () => {
        fetchHistory();
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSelesai = () => {
        setShowPermitSelesai(true);
    };

    const handleApprove = () => {
        setActionType('approve');
        setShowConfirmModal(true);
    };

    const handleReject = () => {
        setActionType('reject');
        setShowConfirmModal(true);
    };

    const submitSelesai = async () => {
        const payload = {
            status_permit: true,
            close_type: closeType,
        };

        try {

            setConfirmLoading(true);
            const response = await approvalPermit(props.permitId, payload);

            if (response?.status === 200) {
                NotifOk({
                    icon: 'success',
                    title: 'Pengajuan Selesai',
                    message: `Permit berhasil diajukan sebagai ${
                        closeType === '1' ? 'selesai' : 'belum selesai'
                    }.`,
                });
                setIsModalVisible(false);
                setShowPermitSelesai(false);
                setCloseType('');
                setTimeout(() => {
                    refreshData();
                }, 500);
            } else {
                throw new Error(response?.data?.message || 'Proses gagal');
            }
        } catch (err) {
            console.error('Error saat mengajukan permit:', err);
            NotifAlert({
                icon: 'error',
                title: 'Gagal',
                message: err.message || 'Terjadi kesalahan saat memproses permit.',
            });
        } finally {
            setConfirmLoading(false);
            setShowPermitSelesai(false);
            setCloseType('');
        }
    };

    const submitApproval = async () => {
        const payload = {
            status_permit: actionType === 'approve' ? true : false,
            deskripsi: deskripsi.trim(),
        };

        try {

            setConfirmLoading(true);
            const response = await approvalPermit(props.permitId, payload);

            if (response?.status === 200) {
                NotifOk({
                    icon: 'success',
                    title: actionType === 'approve' ? 'Disetujui' : 'Ditolak',
                    message:
                        actionType === 'approve'
                            ? 'Permit berhasil disetujui.'
                            : 'Permit berhasil ditolak.',
                });
                setIsModalVisible(false);
                setShowConfirmModal(false);
                setDeskripsi('');
                setTimeout(() => {
                    refreshData();
                }, 500);
            } else {
                throw new Error(response?.data?.message || 'Proses gagal');
            }
        } catch (err) {
            console.error('Error saat menyetujui permit:', err);
            NotifAlert({
                icon: 'error',
                title: 'Gagal',
                message: err.message || 'Terjadi kesalahan saat memproses permit.',
            });
        } finally {
            setConfirmLoading(false);
            setShowConfirmModal(false);
            setDeskripsi('');
        }
    };

    return (
        <>
            <Button
                size="middle"
                onClick={showModal}
                style={{
                    backgroundColor: '#fff',
                    color: color,
                    borderColor: color,
                    borderRadius: '8px',
                    padding: '5px 16px',
                    fontWeight: 500,
                    ...style?.button,
                }}
            >
                {name || 'N/A'}
            </Button>

            <Modal
                title={
                    <Tag
                        style={{
                            backgroundColor: '#fff',
                            color: color || '#999',
                            border: `1px solid ${color || '#ddd'}`,
                            borderRadius: 8,
                            padding: '4px 12px',
                            fontSize: 16,
                            display: 'inline-block',
                        }}
                    >
                        {name ?? 'Belum ada status'}
                    </Tag>
                }
                open={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <>
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
                        {props.status_permit === pengajuanPermitSelesai &&
                            historyData.length >= 0 &&
                            isVendor && (
                                <>
                                    <ConfigProvider
                                        theme={{
                                            token: { colorBgContainer: '#23a55ade' },
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
                                        <Button loading={confirmLoading} onClick={handleSelesai}>
                                            Selesai
                                        </Button>
                                    </ConfigProvider>
                                </>
                            )}
                        {props.status_permit !== 0 &&
                            props.status_permit !== pengajuanPermitSelesai &&
                            props.status_permit !== permitSelesai &&
                            historyData.length >= 0 && (
                                <>
                                    {canReject && (
                                        <ConfigProvider
                                            theme={{
                                                token: { colorBgContainer: '#FF4D4Fde' },
                                                components: {
                                                    Button: {
                                                        defaultBg: '#FF4D4F',
                                                        defaultColor: '#FFFFFF',
                                                        defaultBorderColor: '#FF4D4F',
                                                        defaultHoverColor: '#FFFFFF',
                                                        defaultHoverBorderColor: '#FF4D4F',
                                                    },
                                                },
                                            }}
                                        >
                                            <Button onClick={handleReject}>Reject</Button>
                                        </ConfigProvider>
                                    )}
                                    {canApprove && (
                                        <ConfigProvider
                                            theme={{
                                                token: { colorBgContainer: '#23a55ade' },
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
                                            <Button
                                                loading={confirmLoading}
                                                onClick={handleApprove}
                                            >
                                                Approve
                                            </Button>
                                        </ConfigProvider>
                                    )}
                                </>
                            )}
                    </>,
                ]}
            >
                <Divider style={{ margin: '16px 0', borderTop: '2px solid #D9D9D9' }} />

                {historyData.length > 0 ? (
                    [...historyData]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((item, index) => (
                            <Card
                                key={index}
                                style={{
                                    marginBottom: 16,
                                    color: item.color,
                                    backgroundColor: '#FFFFFF',
                                    border: `1.5px solid ${item.color}`,
                                    borderRadius: 8,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: 8,
                                    }}
                                >
                                    <Tag
                                        style={{
                                            backgroundColor: '#FFFFFF',
                                            color: item.color,
                                            border: `1.5px solid ${item.color}`,
                                            fontSize: 13,
                                            padding: '4px 10px',
                                            borderRadius: 6,
                                            fontWeight: '600',
                                        }}
                                    >
                                        {item.text}
                                    </Tag>
                                    {item.date != null && (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {dayjs.utc(item.date).format('YYYY-MM-DD HH:mm:ss')}
                                        </Text>
                                    )}
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 4,
                                    }}
                                >
                                    <div style={{ fontSize: 13, color: '#333' }}>{item.name}</div>

                                    {item.closed && (
                                        <Tag
                                            style={{
                                                backgroundColor: '#f9f9f9',
                                                color: '#000',
                                                border: '1px dashed #999',
                                                fontSize: 12,
                                                fontStyle: 'italic',
                                                marginRight: 0,
                                            }}
                                        >
                                            Closed: {item.closed}
                                        </Tag>
                                    )}
                                </div>

                                {item.deskripsi && (
                                    <p style={{ fontSize: 12, color: '#333', margin: 0 }}>
                                        {item.deskripsi}
                                    </p>
                                )}
                            </Card>
                        ))
                ) : (
                    <Text type="secondary">Belum ada riwayat status.</Text>
                )}
            </Modal>

            <Modal
                open={showConfirmModal}
                title={actionType === 'approve' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
                onCancel={() => {
                    setShowConfirmModal(false);
                    setDeskripsi('');
                }}
                confirmLoading={confirmLoading}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setShowConfirmModal(false);
                            setDeskripsi('');
                        }}
                    >
                        Batal
                    </Button>,

                    <ConfigProvider
                        key="action"
                        theme={{
                            token: {
                                colorBgContainer:
                                    actionType === 'approve' ? '#23a55ade' : '#FF4D4Fde',
                            },
                            components: {
                                Button: {
                                    defaultBg: actionType === 'approve' ? '#23a55a' : '#FF4D4F',
                                    defaultColor: '#FFFFFF',
                                    defaultBorderColor:
                                        actionType === 'approve' ? '#23a55a' : '#FF4D4F',
                                    defaultHoverColor: '#FFFFFF',
                                    defaultHoverBorderColor:
                                        actionType === 'approve' ? '#23a55a' : '#FF4D4F',
                                },
                            },
                        }}
                    >
                        <Button key="submit" loading={confirmLoading} onClick={submitApproval}>
                            {actionType === 'approve' ? 'Approve' : 'Reject'}
                        </Button>
                    </ConfigProvider>,
                ]}
            >
                <p>Silakan isi deskripsi:</p>
                <TextArea
                    rows={4}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Contoh: Disetujui karena dokumen lengkap atau ditolak karena dokumen tidak lengkap."
                />
            </Modal>

            <Modal
                open={showPermitSelesai}
                title={'Konfirmasi Pengajuan Selesai'}
                onCancel={() => {
                    setShowPermitSelesai(false);
                    setCloseType('');
                }}
                confirmLoading={confirmLoading}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setShowPermitSelesai(false);
                            setCloseType('');
                        }}
                    >
                        Batal
                    </Button>,
                    <ConfigProvider
                        key="action"
                        theme={{
                            token: { colorBgContainer: '#23a55ade' },
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
                        <Button key="submit" loading={confirmLoading} onClick={submitSelesai}>
                            Ajukan Permit Selesai
                        </Button>
                    </ConfigProvider>,
                ]}
            >
                <p>Status Permit saat ini :</p>
                <Radio.Group onChange={(e) => setCloseType(e.target.value)} value={closeType}>
                    <Radio value="0">Belum Selesai</Radio>
                    <Radio value="1">Selesai</Radio>
                </Radio.Group>
            </Modal>
        </>
    );
};

export default StatusButton;
