import React, { useState, useEffect } from 'react';
import { Form, Input, Switch, Typography, ConfigProvider, Card, Button } from 'antd';
import { FileOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import FileUploadHandler from './FileUploadHandler';
import { NotifAlert, NotifOk } from '../../../../components/Global/ToastNotif';
import { getFileUrl, getFolderFromFileType } from '../../../../api/file-uploads';

const { Text } = Typography;

const ErrorCodeForm = ({
    errorCodeForm,
    isErrorCodeFormReadOnly = false,
    errorCodeIcon,
    onErrorCodeIconUpload,
    onErrorCodeIconRemove,
    isEdit = false,
}) => {
    const [currentIcon, setCurrentIcon] = useState(null);
    const statusWatch = Form.useWatch('status', errorCodeForm) ?? true;

    useEffect(() => {
        if (errorCodeIcon && typeof errorCodeIcon === 'object' && Object.keys(errorCodeIcon).length > 0) {
            setCurrentIcon(errorCodeIcon);
        } else {
            setCurrentIcon(null);
        }
    }, [errorCodeIcon]);

    const handleIconRemove = () => {
        setCurrentIcon(null);
        onErrorCodeIconRemove();
    };

    const renderIconUpload = () => {
        if (currentIcon) {
            const displayFileName = currentIcon.name || currentIcon.uploadPath?.split('/').pop() || currentIcon.url?.split('/').pop() || 'Icon File';

            return (
                <Card
                    style={{
                        marginTop: 8,
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '1px solid #e8e8e8'
                    }}
                    styles={{ body: { padding: '16px' } }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            backgroundColor: '#f0f5ff',
                            flexShrink: 0
                        }}>
                            <FileOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#262626',
                                marginBottom: 4,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {displayFileName}
                            </div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                {currentIcon.size ? `${(currentIcon.size / 1024).toFixed(1)} KB` : 'Icon uploaded'}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <Button
                                type="primary"
                                size="middle"
                                icon={<EyeOutlined />}
                                style={{
                                    fontSize: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}
                                onClick={() => {
                                    try {
                                        let iconUrl = '';
                                        let actualFileName = '';

                                        const filePath = currentIcon.uploadPath || currentIcon.url || currentIcon.path || '';
                                        const iconDisplayName = currentIcon.name || '';

                                        if (iconDisplayName) {
                                            actualFileName = iconDisplayName;
                                        } else if (filePath) {
                                            actualFileName = filePath.split('/').pop();
                                        }

                                        if (actualFileName) {
                                            const fileExtension = actualFileName.split('.').pop()?.toLowerCase();
                                            const folder = getFolderFromFileType(fileExtension);
                                            iconUrl = getFileUrl(folder, actualFileName);
                                        }

                                        if (!iconUrl && filePath) {
                                            iconUrl = filePath.startsWith('http') ? filePath : `${import.meta.env.VITE_API_SERVER}/${filePath}`;
                                        }

                                        if (iconUrl && actualFileName) {
                                            const fileExtension = actualFileName.split('.').pop()?.toLowerCase();
                                            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
                                            const pdfExtensions = ['pdf'];

                                            if (imageExtensions.includes(fileExtension) || pdfExtensions.includes(fileExtension)) {
                                                const viewerUrl = `/image-viewer/${encodeURIComponent(actualFileName)}`;
                                                window.open(viewerUrl, '_blank', 'noopener,noreferrer');
                                            } else {
                                                window.open(iconUrl, '_blank', 'noopener,noreferrer');
                                            }
                                        } else {
                                            NotifAlert({
                                                icon: 'error',
                                                title: 'Error',
                                                message: `File URL not found. FileName: ${actualFileName}, FilePath: ${filePath}`
                                            });
                                        }
                                    } catch (error) {
                                        NotifAlert({
                                            icon: 'error',
                                            title: 'Error',
                                            message: `Failed to open file preview: ${error.message}`
                                        });
                                    }
                                }}
                            />
                            <Button
                                danger
                                size="middle"
                                icon={<DeleteOutlined />}
                                style={{
                                    fontSize: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                onClick={handleIconRemove}
                                disabled={isErrorCodeFormReadOnly}
                            />
                        </div>
                    </div>
                </Card>
            );
        } else {
            return (
                <FileUploadHandler
                    type="error_code"
                    existingFile={null}
                    accept="image/*"
                    onFileUpload={(fileData) => {
                        setCurrentIcon(fileData);
                        onErrorCodeIconUpload(fileData);
                    }}
                    onFileRemove={handleIconRemove}
                    buttonText="Upload Icon"
                    buttonStyle={{
                        width: '100%',
                        borderColor: '#23A55A',
                        color: '#23A55A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    uploadText="Upload error code icon"
                    disabled={isErrorCodeFormReadOnly}
                />
            );
        }
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Switch: {
                        colorPrimary: '#23A55A',
                        colorPrimaryHover: '#23A55A',
                    },
                },
            }}
        >
            <Form
                form={errorCodeForm}
                layout="vertical"
                initialValues={{
                    status: true,
                    error_code_color: '#000000'
                }}
            >
                {/* Header bar with color picker, icon upload, and status toggle */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    gap: '16px'
                }}>
                    {/* Color picker on left */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Form.Item
                            name="error_code_color"
                            noStyle
                            getValueFromEvent={(e) => e.target.value}
                            getValueProps={(value) => ({ value: value || '#000000' })}
                        >
                            <input
                                type="color"
                                style={{
                                    width: '120px',
                                    height: '40px',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: 4,
                                    cursor: isErrorCodeFormReadOnly ? 'not-allowed' : 'pointer',
                                }}
                                disabled={isErrorCodeFormReadOnly}
                            />
                        </Form.Item>

                        {/* Icon upload beside color picker */}
                        <div style={{ flex: 1, maxWidth: '300px' }}>
                            {renderIconUpload()}
                        </div>
                    </div>

                    {/* Status toggle on right */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Form.Item name="status" valuePropName="checked" noStyle>
                            <Switch
                                disabled={isErrorCodeFormReadOnly}
                            />
                        </Form.Item>
                        <Text style={{ marginLeft: 8 }}>
                            {statusWatch ? 'Active' : 'Inactive'}
                        </Text>
                    </div>
                </div>

                {/* Error Code and Error Name in one row with 1/3 and 2/3 ratio */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <Form.Item
                        label="Error Code"
                        name="error_code"
                        rules={[{ required: true, message: 'Error code wajib diisi!' }]}
                        style={{ flex: 1, marginBottom: 0, maxWidth: '33.33%' }}
                    >
                        <Input
                            placeholder="Enter error code"
                            disabled={isErrorCodeFormReadOnly}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Error Name"
                        name="error_code_name"
                        rules={[{ required: !isErrorCodeFormReadOnly, message: 'Error name wajib diisi!' }]}
                        style={{ flex: 2, marginBottom: 0, maxWidth: '66.67%' }}
                    >
                        <Input placeholder="Enter error name" disabled={isErrorCodeFormReadOnly} />
                    </Form.Item>
                </div>

                <Form.Item label="Description" name="error_code_description">
                    <Input.TextArea
                        placeholder="Enter error description"
                        rows={3}
                        disabled={isErrorCodeFormReadOnly}
                    />
                </Form.Item>
            </Form>
        </ConfigProvider>
    );
};

export default ErrorCodeForm;
