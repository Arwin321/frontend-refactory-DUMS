import React, { useState } from 'react';
import { Upload, Modal, Button, Typography, Space, Image } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { NotifOk, NotifAlert } from '../../../../components/Global/ToastNotif';
import { uploadFile, getFolderFromFileType, getFileUrl, getFileType } from '../../../../api/file-uploads';

const { Text } = Typography;

const FileUploadHandler = ({
    type = 'solution',
    maxCount = 1,
    accept = '.pdf,.jpg,.jpeg,.png,.gif',
    disabled = false,

    fileList = [],
    onFileUpload,
    onFileRemove,

    existingFile = null,
    clearSignal = null,
    debugProps = {},

    uploadText = 'Click or drag file to this area to upload',
    uploadHint = 'Support for PDF and image files only',
    buttonText = 'Upload File',
    buttonType = 'default',

    containerStyle = {},
    buttonStyle = {},
    showPreview = true
}) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    React.useEffect(() => {
        if (clearSignal !== null && clearSignal > 0) {
            setUploadedFile(null);
        }
    }, [clearSignal, debugProps]);

    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const validateFile = (file) => {
        const isAllowedType = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
        ].includes(file.type);

        if (!isAllowedType) {
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: `${file.name} bukan file PDF atau gambar yang diizinkan.`,
            });
            return false;
        }

        return true;
    };

    const handleFileUpload = async (file) => {
        if (isUploading) {
            return false;
        }

        if (!validateFile(file)) {
            return false;
        }

        try {
            setIsUploading(true);

            const fileExtension = file.name.split('.').pop().toLowerCase();
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileExtension);
            const fileType = isImage ? 'image' : 'pdf';
            const folder = getFolderFromFileType(fileType);

            const uploadResponse = await uploadFile(file, folder);

            const isSuccess = uploadResponse && (
                uploadResponse.statusCode === 200 ||
                uploadResponse.statusCode === 201
            );

            if (!isSuccess) {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: uploadResponse?.message || `Gagal mengupload ${file.name}`,
                });
                setIsUploading(false);
                return false;
            }

            let actualPath = '';
            if (uploadResponse && typeof uploadResponse === 'object') {
                if (uploadResponse.data && uploadResponse.data.path_document) {
                    actualPath = uploadResponse.data.path_document;
                }
                else if (uploadResponse.path_document) {
                    actualPath = uploadResponse.path_document;
                }
                else if (uploadResponse.data && uploadResponse.data.path_solution) {
                    actualPath = uploadResponse.data.path_solution;
                }
                else if (uploadResponse.data && typeof uploadResponse.data === 'object') {
                    if (uploadResponse.data.file_url) {
                        actualPath = uploadResponse.data.file_url;
                    } else if (uploadResponse.data.url) {
                        actualPath = uploadResponse.data.url;
                    } else if (uploadResponse.data.path) {
                        actualPath = uploadResponse.data.path;
                    } else if (uploadResponse.data.location) {
                        actualPath = uploadResponse.data.location;
                    } else if (uploadResponse.data.filePath) {
                        actualPath = uploadResponse.data.filePath;
                    } else if (uploadResponse.data.file_path) {
                        actualPath = uploadResponse.data.file_path;
                    } else if (uploadResponse.data.publicUrl) {
                        actualPath = uploadResponse.data.publicUrl;
                    } else if (uploadResponse.data.public_url) {
                        actualPath = uploadResponse.data.public_url;
                    }
                }
                else if (uploadResponse && typeof uploadResponse === 'string') {
                    actualPath = uploadResponse;
                }
            }


            if (actualPath) {
                let fileObject;

                if (type === 'error_code') {
                    fileObject = {
                        name: file.name,
                        path_icon: actualPath,
                        uploadPath: actualPath,
                        url: actualPath,
                        size: file.size,
                        type: file.type,
                        fileExtension
                    };
                } else {
                    fileObject = {
                        name: file.name,
                        path_solution: actualPath,
                        uploadPath: actualPath,
                        type_solution: fileType,
                        size: file.size,
                        type: file.type
                    };
                }

                onFileUpload(fileObject);
                setUploadedFile(fileObject);

                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: `${file.name} berhasil diupload!`
                });

                setIsUploading(false);
                return false;
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: `Gagal mengupload ${file.name}. Tidak dapat menemukan path file dalam response.`,
                });
                setIsUploading(false);
                return false;
            }
        } catch (error) {
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: `Gagal mengupload ${file.name}. Silakan coba lagi.`,
            });
            setIsUploading(false);
            return false;
        }
    };

    const handleFileChange = ({ fileList }) => {
        if (fileList && fileList.length > 0 && fileList[0] && fileList[0].originFileObj) {
            handleFileUpload(fileList[0].originFileObj);
        }
    };

    const handleRemove = () => {
        if (existingFile && onFileRemove) {
            onFileRemove(existingFile);
        } else if (onFileRemove) {
            onFileRemove(null);
        }
    };

    const renderExistingFile = () => {
        const fileToShow = existingFile || uploadedFile;
        if (!fileToShow) {
            return null;
        }

        const filePath = fileToShow.uploadPath || fileToShow.url || fileToShow.path_icon || fileToShow.path_solution;
        const fileName = fileToShow.name || filePath?.split('/').pop() || 'Unknown file';
        const fileType = getFileType(fileName);
        const isImage = fileType === 'image';

        const handlePreview = () => {
            if (!showPreview || !filePath) return;

            if (isImage) {
                const folder = fileToShow.type_solution === 'pdf' ? 'pdf' : 'images';
                const filename = filePath.split('/').pop();
                const imageUrl = getFileUrl(folder, filename);

                if (imageUrl) {
                    setPreviewImage(imageUrl);
                    setPreviewOpen(true);
                    setPreviewTitle(fileName);
                } else {
                    NotifAlert({
                        icon: 'error',
                        title: 'Error',
                        message: 'Cannot generate image preview URL',
                    });
                }
            } else {
                const folder = fileToShow.type_solution === 'pdf' ? 'pdf' : 'images';
                const filename = filePath.split('/').pop();
                const fileUrl = getFileUrl(folder, filename);

                if (fileUrl) {
                    window.open(fileUrl, '_blank', 'noopener,noreferrer');
                } else {
                    NotifAlert({
                        icon: 'error',
                        title: 'Error',
                        message: 'Cannot generate file preview URL',
                    });
                }
            }
        };

        const getThumbnailUrl = () => {
            if (!isImage || !filePath) return null;

            const folder = fileToShow.type_solution === 'pdf' ? 'pdf' : 'images';
            const filename = filePath.split('/').pop();
            return getFileUrl(folder, filename);
        };

        const thumbnailUrl = getThumbnailUrl();

        return (
            <div style={{ marginTop: 12 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    backgroundColor: '#fafafa'
                }}>
                    {isImage ? (
                        <img
                            src={thumbnailUrl || filePath}
                            alt={fileName}
                            style={{
                                width: 50,
                                height: 50,
                                objectFit: 'cover',
                                border: '1px solid #d9d9d9',
                                borderRadius: 4,
                                cursor: showPreview ? 'pointer' : 'default'
                            }}
                            onClick={handlePreview}
                            onError={(e) => {
                                e.target.src = filePath;
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 50,
                                height: 50,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #d9d9d9',
                                borderRadius: 4,
                                backgroundColor: '#f5f5f5',
                                cursor: showPreview ? 'pointer' : 'default'
                            }}
                            onClick={handlePreview}
                        >
                            <FileOutlined style={{ fontSize: 24, color: '#666' }} />
                        </div>
                    )}

                    <div style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: 500 }}>
                            {fileName}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 10 }}>
                            {fileType === 'image' ? 'Image' : fileType === 'pdf' ? 'PDF' : 'File'}
                            {fileToShow.size && ` • ${(fileToShow.size / 1024).toFixed(1)} KB`}
                        </Text>
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                        {showPreview && (
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                size="small"
                                onClick={handlePreview}
                                title={isImage ? "Preview Image" : "Open File"}
                            />
                        )}

                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={handleRemove}
                            title="Remove File"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const uploadProps = {
        name: 'file',
        multiple: false,
        accept,
        disabled: disabled || isUploading,
        fileList: [],
        beforeUpload: () => false,
        onChange: handleFileChange,
        onPreview: handlePreview,
        maxCount,
    };

    return (
        <div style={{ ...containerStyle }}>
            {!existingFile && (
                <Upload {...uploadProps}>
                    {type === 'drag' ? (
                        <Upload.Dragger>
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">{uploadText}</p>
                            <p className="ant-upload-hint">{uploadHint}</p>
                        </Upload.Dragger>
                    ) : (
                        <Button
                            type={buttonType}
                            icon={<UploadOutlined />}
                            loading={isUploading}
                            style={{ ...buttonStyle }}
                        >
                            {isUploading ? 'Uploading...' : buttonText}
                        </Button>
                    )}
                </Upload>
            )}



            {showPreview && (
                <Modal
                    open={previewOpen}
                    title={previewTitle}
                    footer={null}
                    onCancel={() => setPreviewOpen(false)}
                    width={600}
                    style={{ top: 100 }}
                >
                    {previewImage && (
                        <img
                            alt={previewTitle}
                            style={{ width: '100%' }}
                            src={previewImage}
                        />
                    )}
                </Modal>
            )}
        </div>
    );
};

export default FileUploadHandler;