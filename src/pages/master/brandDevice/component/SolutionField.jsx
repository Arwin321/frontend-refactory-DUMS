import React, { useState } from 'react';
import { Form, Input, Button, Switch, Radio, Typography, Space, Card, ConfigProvider } from 'antd';
import { DeleteOutlined, EyeOutlined, FileOutlined } from '@ant-design/icons';
import FileUploadHandler from './FileUploadHandler';
import { NotifAlert } from '../../../../components/Global/ToastNotif';
import { getFileUrl, getFolderFromFileType } from '../../../../api/file-uploads';

const { Text } = Typography;
const { TextArea } = Input;

const SolutionFieldNew = ({
    fieldKey,
    fieldName,
    index,
    solutionType,
    solutionStatus,
    isReadOnly = false,
    canRemove = true,
    onTypeChange,
    onStatusChange,
    onRemove,
    onFileUpload,
    onFileView,
    fileList = [],
    originalSolutionData = null
}) => {
    const form = Form.useFormInstance();
    const [currentFile, setCurrentFile] = useState(null);
    const [isDeleted, setIsDeleted] = useState(false);

    const fileUpload = Form.useWatch(['solution_items', fieldKey, 'fileUpload'], form);
    const file = Form.useWatch(['solution_items', fieldKey, 'file'], form);
    const nameValue = Form.useWatch(['solution_items', fieldKey, 'name'], form);
    const fileNameValue = Form.useWatch(['solution_items', fieldKey, 'fileName'], form);
    const statusValue = Form.useWatch(['solution_items', fieldKey, 'status'], form) ?? true;

    const pathSolution = Form.useWatch(['solution_items', fieldKey, 'path_solution'], form);

    const [deleteCounter, setDeleteCounter] = useState(0);
    
    React.useEffect(() => {
        if (!nameValue || nameValue === '') {
            setCurrentFile(null);
            setIsDeleted(false);
            setDeleteCounter(prev => prev + 1);
        }
    }, [nameValue]);

    React.useEffect(() => {
        const getFileFromFormValues = () => {
            const hasValidFileUpload = fileUpload && typeof fileUpload === 'object' && Object.keys(fileUpload).length > 0;
            const hasValidFile = file && typeof file === 'object' && Object.keys(file).length > 0;
            const hasValidPath = pathSolution && pathSolution.trim() !== '';

            const wasExplicitlyDeleted =
                (fileUpload === null || file === null || pathSolution === null) &&
                !hasValidFileUpload &&
                !hasValidFile &&
                !hasValidPath;

            if (wasExplicitlyDeleted) {
                return null;
            }

            if (solutionType === 'text') {
                return null;
            }

            if (hasValidFileUpload) {
                return fileUpload;
            }
            if (hasValidFile) {
                return file;
            }
            if (hasValidPath) {
                return {
                    name: fileNameValue || pathSolution.split('/').pop() || 'File',
                    uploadPath: pathSolution,
                    url: pathSolution,
                    path: pathSolution
                };
            }

            return null;
        };

        const fileFromForm = getFileFromFormValues();

        if (JSON.stringify(currentFile) !== JSON.stringify(fileFromForm)) {
            setCurrentFile(fileFromForm);
        }
    }, [fileUpload, file, pathSolution, solutionType, deleteCounter, fileNameValue, fieldKey]);


    const renderSolutionContent = () => {
        if (solutionType === 'text') {
            return (
                <Form.Item
                    name={['solution_items', fieldKey, 'text']}
                    rules={[{ required: true, message: 'Text solution wajib diisi!' }]}
                >
                    <TextArea
                        placeholder="Enter solution text"
                        rows={3}
                        disabled={isReadOnly}
                        style={{ fontSize: 12 }}
                    />
                </Form.Item>
            );
        }

        if (solutionType === 'file') {
            const hasOriginalFile = originalSolutionData && (
                originalSolutionData.path_solution ||
                originalSolutionData.path_document
            );

            let displayFile = null;

            if (currentFile && Object.keys(currentFile).length > 0) {
                displayFile = currentFile;
            }
            else if (hasOriginalFile && !isDeleted) {
                displayFile = {
                    name: originalSolutionData.file_upload_name ||
                        (originalSolutionData.path_solution || originalSolutionData.path_document)?.split('/').pop() ||
                        'File',
                    uploadPath: originalSolutionData.path_solution || originalSolutionData.path_document,
                    url: originalSolutionData.path_solution || originalSolutionData.path_document,
                    path: originalSolutionData.path_solution || originalSolutionData.path_document,
                    isExisting: true
                };
            }
            else if (fileUpload && typeof fileUpload === 'object' && Object.keys(fileUpload).length > 0) {
                displayFile = fileUpload;
            }
            else if (file && typeof file === 'object' && Object.keys(file).length > 0) {
                displayFile = file;
            }
            else if (pathSolution && pathSolution.trim() !== '') {
                displayFile = {
                    name: pathSolution.split('/').pop() || 'File',
                    uploadPath: pathSolution,
                    url: pathSolution,
                    path: pathSolution
                };
            }

  
            if (displayFile) {
                const getFileNameFromPath = () => {
                    const filePath = displayFile.uploadPath || displayFile.url || displayFile.path || '';
                    if (filePath) {
                        const fileName = filePath.split('/').pop();
                        return fileName || 'Uploaded File';
                    }
                    return displayFile.name || 'Uploaded File';
                };

                const displayFileName = getFileNameFromPath();

                return (
                    <Card
                        style={{
                            marginBottom: 8,
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
                                    {displayFile.size ? `${(displayFile.size / 1024).toFixed(1)} KB` : 'File uploaded'}
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
                                            let fileUrl = '';
                                            let actualFileName = '';

                                            const filePath = displayFile.uploadPath || displayFile.url || displayFile.path || '';

                                            if (filePath) {
                                                actualFileName = filePath.split('/').pop();

                                                if (actualFileName) {
                                                    const fileExtension = actualFileName.split('.').pop()?.toLowerCase();
                                                    const folder = getFolderFromFileType(fileExtension);

                                                    fileUrl = getFileUrl(folder, actualFileName);

                                                }
                                            }

                                            if (!fileUrl && filePath) {
                                                fileUrl = filePath.startsWith('http') ? filePath : `${import.meta.env.VITE_API_SERVER}/${filePath}`;
                                            }

                                            if (fileUrl && actualFileName) {
                                                const fileExtension = actualFileName.split('.').pop()?.toLowerCase();
                                                const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

                                                if (imageExtensions.includes(fileExtension)) {
                                                    const viewerUrl = `/image-viewer/${encodeURIComponent(actualFileName)}`;
                                                    window.open(viewerUrl, '_blank', 'noopener,noreferrer');
                                                } else {
                                                    window.open(fileUrl, '_blank', 'noopener,noreferrer');
                                                }
                                            } else {
                                                NotifAlert({
                                                    icon: 'error',
                                                    title: 'Error',
                                                    message: 'File URL not found'
                                                });
                                            }
                                        } catch (error) {
                                            NotifAlert({
                                                icon: 'error',
                                                title: 'Error',
                                                message: 'Failed to open file preview'
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
                                    onClick={() => {
                                        setIsDeleted(true);

                                        form.setFieldValue(['solution_items', fieldKey, 'fileUpload'], null);
                                        form.setFieldValue(['solution_items', fieldKey, 'file'], null);
                                        form.setFieldValue(['solution_items', fieldKey, 'path_solution'], null);
                                        form.setFieldValue(['solution_items', fieldKey, 'fileName'], null);

                                        setCurrentFile(null);

                                        if (onFileUpload && typeof onFileUpload === 'function') {
                                            onFileUpload(null);
                                        }

                                        setDeleteCounter(prev => prev + 1);

                                        setTimeout(() => {
                                            form.validateFields(['solution_items', fieldKey]);
                                        }, 50);
                                    }}
                                />
                            </div>
                        </div>
                    </Card>
                );
            } else {
                return (
                    <FileUploadHandler
                        type="solution"
                        existingFile={null}
                        clearSignal={deleteCounter}
                        debugProps={{
                            currentFile: !!currentFile,
                            deleteCounter,
                            shouldClear: !currentFile && deleteCounter > 0
                        }}
                        onFileUpload={(fileObject) => {
                            setIsDeleted(false);

                            const filePath = fileObject.path_solution || fileObject.uploadPath || fileObject.path || fileObject.url;

                            const fileWithKey = {
                                ...fileObject,
                                solutionId: fieldKey,
                                path_solution: filePath,
                                uploadPath: filePath
                            };

                            if (onFileUpload && typeof onFileUpload === 'function') {
                                onFileUpload(fileWithKey);
                            }

                            form.setFieldValue(['solution_items', fieldKey, 'fileUpload'], fileWithKey);
                            form.setFieldValue(['solution_items', fieldKey, 'file'], fileWithKey);
                            form.setFieldValue(['solution_items', fieldKey, 'type'], 'file');
                            form.setFieldValue(['solution_items', fieldKey, 'path_solution'], filePath);
                            form.setFieldValue(['solution_items', fieldKey, 'fileName'], fileObject.name);

                            setTimeout(() => {
                                const values = form.getFieldValue(['solution_items', fieldKey]);
                                const pathSolutionValue = form.getFieldValue(['solution_items', fieldKey, 'path_solution']);
                            }, 100);

                            setCurrentFile(fileWithKey);
                        }}
                        onFileRemove={() => {
                            form.setFieldValue(['solution_items', fieldKey, 'fileUpload'], null);
                            form.setFieldValue(['solution_items', fieldKey, 'file'], null);
                            form.setFieldValue(['solution_items', fieldKey, 'path_solution'], null);

                            setCurrentFile(null);

                            if (onFileUpload && typeof onFileUpload === 'function') {
                                onFileUpload(null);
                            }

                            setDeleteCounter(prev => prev + 1);
                        }}
                        disabled={isReadOnly}
                        buttonText="Upload File"
                        buttonStyle={{ width: '100%', fontSize: 12 }}
                        uploadText="Upload solution file (includes images, PDF, documents)"
                        acceptFileTypes="*"
                    />
                );
            }
        }

        return null;
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
            <div style={{
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                padding: 12,
                marginBottom: 12,
                backgroundColor: isReadOnly ? '#f5f5f5' : 'white'
            }}>
            <div style={{
                marginBottom: 8,
                gap: 8
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong style={{
                        fontSize: 12,
                        color: '#262626',
                        display: 'block'
                    }}>
                        Solution #{index + 1}
                    </Text>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Form.Item name={['solution_items', fieldKey, 'status']} valuePropName="checked" noStyle>
                                <Switch
                                    size="small"
                                    disabled={isReadOnly}
                                    onChange={(checked) => {
                                        onStatusChange(fieldKey, checked);
                                    }}
                                />
                            </Form.Item>
                            <Text style={{
                                fontSize: 11,
                                color: '#666',
                                whiteSpace: 'nowrap'
                            }}>
                                {statusValue ? 'Active' : 'Inactive'}
                            </Text>
                        </div>

                        {canRemove && !isReadOnly && (
                            <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={onRemove}
                                style={{
                                    fontSize: 12,
                                    padding: '2px 4px',
                                    height: '24px'
                                }}
                            />
                        )}
                    </div>
                </div>

                <Form.Item
                    name={['solution_items', fieldKey, 'name']}
                    rules={[{ required: true, message: 'Solution name wajib diisi!' }]}
                    style={{ margin: 0 }}
                >
                    <Input
                        placeholder="Solution name"
                        disabled={isReadOnly}
                        size="default"
                        style={{ fontSize: 13 }}
                    />
                </Form.Item>

            </div>

            <Form.Item
                name={['solution_items', fieldKey, 'type']}
                rules={[{ required: true, message: 'Solution type wajib diisi!' }]}
                style={{ marginBottom: 8 }}
                initialValue={solutionType || 'text'}
            >
                <Radio.Group
                    onChange={(e) => {
                        const newType = e.target.value;

                        if (newType === 'text') {
                            form.setFieldValue(['solution_items', fieldKey, 'fileUpload'], null);
                            form.setFieldValue(['solution_items', fieldKey, 'file'], null);
                            form.setFieldValue(['solution_items', fieldKey, 'path_solution'], null);
                            form.setFieldValue(['solution_items', fieldKey, 'fileName'], null);
                            setCurrentFile(null);
                            setIsDeleted(true);

                            if (onFileUpload && typeof onFileUpload === 'function') {
                                onFileUpload(null);
                            }
                        } else if (newType === 'file') {
                            form.setFieldValue(['solution_items', fieldKey, 'text'], null);
                            setIsDeleted(false);
                        }

                        onTypeChange(fieldKey, newType);
                    }}
                    disabled={isReadOnly}
                    size="small"
                >
                    <Radio value="text" style={{ fontSize: 12 }}>Text</Radio>
                    <Radio value="file" style={{ fontSize: 12 }}>File</Radio>
                </Radio.Group>
            </Form.Item>

            <Form.Item
                name={['solution_items', fieldKey, 'status']}
                initialValue={solutionStatus !== false ? true : false}
                noStyle
            >
                <input type="hidden" />
            </Form.Item>

            {renderSolutionContent()}
            </div>
        </ConfigProvider>
    );
};

export default SolutionFieldNew;