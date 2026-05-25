import React, { useState } from 'react';
import { Button, Modal, Divider, Card, Tag, ConfigProvider, Typography } from 'antd';
import { NotifAlert, NotifOk, NotifConfirmDialog } from './ToastNotif';
import { approvalUser } from '../../api/user-admin';
import { toAppDateFormatter } from './Formatter';

const { Text } = Typography;

const StatusUserButton = ({ color, name, data, readOnly, style }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const statusColor = data?.warna || color || '#999';
    const statusName = data?.status_name || name || 'N/A';
    const userCreated = data?.user_add_name || 'Pengguna tidak dikenal';
    const userUpdated = data?.user_upd_name || 'Pengguna tidak dikenal';

    const handleApprove = async () => {
        setConfirmLoading(true);
        try {
            const payload = {
                approve_user: true,
            };
            const response = await approvalUser(data?.id_register, payload);

            if (response?.data?.statusCode === 200) {
                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: 'User berhasil di-approve.',
                });
                setIsModalVisible(false);
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: response?.data?.message || 'Gagal approve user.',
                });
            }
        } catch (err) {
            console.error('Error saat approve user:', err);
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: 'Terjadi kesalahan pada server.',
            });
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleReject = async () => {
        setConfirmLoading(true);
        NotifConfirmDialog({
            icon: 'question',
            title: 'Konfirmasi Penolakan',
            message: 'Apakah kamu yakin ingin menolak permintaan ini?',
            confirmButtonText: 'Reject',
            onConfirm: async () => {
                try {
                    const payload = {
                        approve_user: false,
                    };
                    const response = await approvalUser(data.id_register, payload);

                    if (response?.data?.statusCode === 200) {
                        NotifOk({
                            icon: 'success',
                            title: 'Ditolak',
                            message: 'User berhasil ditolak.',
                        });
                        setIsModalVisible(false);
                    } else {
                        NotifAlert({
                            icon: 'error',
                            title: 'Gagal',
                            message: response?.message || 'Gagal reject user.',
                        });
                    }
                } catch (err) {
                    NotifAlert({
                        icon: 'error',
                        title: 'Error',
                        message: 'Terjadi kesalahan pada server.',
                    });
                } finally {
                    setConfirmLoading(false);
                }
            },
            onCancel: () => {
            },
        });
    };

    return (
        <>
            <Button
                size="middle"
                onClick={showModal}
                style={{
                    backgroundColor: '#fff',
                    color: statusColor,
                    borderColor: statusColor,
                    borderRadius: '8px',
                    padding: '4px 16px',
                    fontWeight: 500,
                    ...style?.button,
                }}
            >
                {statusName}
            </Button>

            <Modal
                title={
                    <Tag
                        style={{
                            backgroundColor: '#fff',
                            color: statusColor,
                            border: `1px solid ${statusColor}`,
                            borderRadius: 8,
                            padding: '4px 12px',
                            fontSize: 16,
                            display: 'inline-block',
                        }}
                    >
                        {statusName}
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
                        {data?.status_register === 1 && (
                            <>
                                <ConfigProvider
                                    theme={{
                                        token: {
                                            colorBgContainer: '#FF4D4Fde',
                                        },
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
                                <ConfigProvider
                                    theme={{
                                        token: {
                                            colorBgContainer: '#23a55ade',
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
                                    <Button loading={confirmLoading} onClick={handleApprove}>
                                        Approve
                                    </Button>
                                </ConfigProvider>
                            </>
                        )}
                    </>,
                ]}
            >
                <Divider style={{ margin: '16px 0', borderTop: '2px solid #D9D9D9' }} />

                {data ? (
                    <>
                        {data.updated_at !== data.created_at && (
                            <Card
                                style={{
                                    marginBottom: 16,
                                    color: '#FF6E35',
                                    backgroundColor: '#FFFFFF',
                                    border: `1.5px solid #FF6E35`,
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
                                            color: '#FF6E35',
                                            border: `1.5px solid #FF6E35`,
                                            fontSize: 13,
                                            padding: '4px 10px',
                                            borderRadius: 6,
                                            fontWeight: '500',
                                        }}
                                    >
                                        Updated at
                                    </Tag>
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: 12, fontWeight: '500' }}
                                    >
                                        {toAppDateFormatter(data.updated_at)}
                                    </Text>
                                </div>
                                <div style={{ fontSize: 13, color: '#333' }}>
                                    Diubah terakhir oleh <b>{userUpdated}</b>
                                </div>
                            </Card>
                        )}
                        <Card
                            style={{
                                marginBottom: 16,
                                color: '#3498DB',
                                backgroundColor: '#FFFFFF',
                                border: `1.5px solid #3498DB`,
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
                                        color: '#3498DB',
                                        border: `1.5px solid #3498DB`,
                                        fontSize: 13,
                                        padding: '4px 10px',
                                        borderRadius: 6,
                                        fontWeight: '500',
                                    }}
                                >
                                    Created at
                                </Tag>
                                <Text type="secondary" style={{ fontSize: 12, fontWeight: '500' }}>
                                    {toAppDateFormatter(data.created_at)}
                                </Text>
                            </div>
                            <div style={{ fontSize: 13, color: '#333' }}>
                                Dibuat oleh <b>{userCreated}</b>
                            </div>
                        </Card>
                    </>
                ) : (
                    <Text type="secondary">Belum ada riwayat status.</Text>
                )}
            </Modal>
        </>
    );
};

export default StatusUserButton;
