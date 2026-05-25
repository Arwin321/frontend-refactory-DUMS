import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Spin, Alert, Space } from 'antd';
import { NotifAlert } from '../../../components/Global/ToastNotif';
import { ArrowLeftOutlined, FilePdfOutlined, FileImageOutlined, DownloadOutlined } from '@ant-design/icons';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { getBrandById } from '../../../api/master-brand';
import {
    downloadFile,
    getFile,
    getFileUrl,
    getFolderFromFileType,
} from '../../../api/file-uploads';

const { Title } = Typography;

const ViewFilePage = () => {
    const params = useParams();
    const { id, fileType, fileName } = params;
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [brandData, setBrandData] = useState(null);
    const [actualFileName, setActualFileName] = useState('');
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    const isFromEdit = window.location.pathname.includes('/edit/');

    let fallbackId = id;
    let fallbackFileType = fileType;
    let fallbackFileName = fileName;

    if (!fileName || !fileType || !id) {

        const urlParts = window.location.pathname.split('/');

        const viewIndex = urlParts.indexOf('view');
        const editIndex = urlParts.indexOf('edit');
        const actionIndex = viewIndex !== -1 ? viewIndex : editIndex;

        if (actionIndex !== -1 && urlParts.length > actionIndex + 4) {
            fallbackId = urlParts[actionIndex + 1];
            fallbackFileType = urlParts[actionIndex + 3];
            fallbackFileName = decodeURIComponent(urlParts[actionIndex + 4]);
        }
    }

    useEffect(() => {
        setPdfBlobUrl(null);
        setPdfLoading(false);
        setError(null);

        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            try {
                const actualId = fallbackId || id;
                const actualFileName = fallbackFileName || fileName;

                const brandResponse = await getBrandById(actualId);
                if (brandResponse && brandResponse.statusCode === 200) {
                    setBrandData(brandResponse.data);
                }

                const decodedFileName = decodeURIComponent(actualFileName);
                setActualFileName(decodedFileName);

                const fileExtension = decodedFileName.split('.').pop().toLowerCase();
                if (fileExtension === 'pdf') {
                    setPdfLoading(true);
                    const folder = getFolderFromFileType('pdf');
                    try {
                        const blobData = await getFile(folder, decodedFileName);
                        const blobUrl = window.URL.createObjectURL(blobData);
                        setPdfBlobUrl(blobUrl);
                    } catch (pdfError) {
                        setError('Failed to load PDF file: ' + (pdfError.message || pdfError));
                        setPdfBlobUrl(null);
                    } finally {
                        setPdfLoading(false);
                    }
                }

                setLoading(false);
            } catch (error) {
                setError('Failed to load data');
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            if (pdfBlobUrl) {
                window.URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [id, fileName, fileType, navigate]);

    useEffect(() => {
        if (brandData) {
            const breadcrumbItems = [
                { title: <strong style={{ fontSize: '14px' }}>• Master</strong> },
                {
                    title: <strong style={{ fontSize: '14px' }} onClick={() => navigate('/master/brand-device')}>Brand Device</strong>
                }
            ];

            if (isFromEdit) {
                breadcrumbItems.push({
                    title: <strong style={{ fontSize: '14px' }} onClick={() => navigate(`/master/brand-device/edit/${fallbackId || id}`)}>Edit Brand Device</strong>
                });
            } else {
                breadcrumbItems.push({
                    title: <strong style={{ fontSize: '14px' }} onClick={() => navigate(`/master/brand-device/view/${fallbackId || id}`)}>View Brand Device</strong>
                });
            }

            breadcrumbItems.push({ title: <strong style={{ fontSize: '14px' }}>View Document</strong> });

            setBreadcrumbItems(breadcrumbItems);
        }
    }, [brandData, id, isFromEdit, fallbackId, navigate, setBreadcrumbItems]);

    const handleBack = () => {
        if (isFromEdit) {
            const savedPhase = localStorage.getItem(`brand_device_edit_${fallbackId || id}_last_phase`);

            if (savedPhase) {
                localStorage.removeItem(`brand_device_edit_${fallbackId || id}_last_phase`);
            }

            const targetPhase = savedPhase ? parseInt(savedPhase) : 1;

            navigate(`/master/brand-device/edit/${fallbackId || id}`, {
                state: { phase: targetPhase, fromFileViewer: true },
                replace: true
            });
        } else {
            navigate(`/master/brand-device/view/${fallbackId || id}`, {
                state: { phase: 1 },
                replace: true
            });
        }
    };

    const renderContent = () => {
        if (error) {
            return (
                <Alert
                    message="Error Loading File"
                    description={error}
                    type="error"
                    showIcon
                    style={{ margin: '20px 0' }}
                />
            );
        }

        const displayFileName = actualFileName || 'Loading...';
        const fileExtension = displayFileName.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
        const isPdf = fileExtension === 'pdf';


        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    {isImage ? (
                        <div style={{
                            width: '100%',
                            height: '300px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #d9d9d9',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: '#999'
                        }}>
                            <div>
                                <FileImageOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                                <div>Loading image...</div>
                            </div>
                        </div>
                    ) : isPdf ? (
                        <div style={{
                            width: '100%',
                            height: '400px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #d9d9d9',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: '#999'
                        }}>
                            <div>
                                <FilePdfOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                                <div>Loading PDF...</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '200px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #d9d9d9',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: '#999'
                        }}>
                            <div>
                                <FilePdfOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                                <div>Loading file...</div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (isImage) {
            return (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <img
                        src={getFileUrl(getFolderFromFileType(fallbackFileType || fileType), actualFileName)}
                        alt={actualFileName}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '70vh',
                            objectFit: 'contain',
                            border: '1px solid #d9d9d9',
                            borderRadius: '8px'
                        }}
                        onError={() => setError('Failed to load image')}
                    />
                </div>
            );
        }

        if (isPdf) {
            const displayUrl = pdfBlobUrl || getFileUrl(getFolderFromFileType(fallbackFileType || fileType), actualFileName);

            return (
                <div style={{ height: '75vh', width: '100%', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                    {pdfBlobUrl ? (
                        <iframe
                            src={pdfBlobUrl}
                            title={actualFileName}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                borderRadius: '8px'
                            }}
                            onError={() => {
                                setError('Failed to load PDF. Please try downloading the file.');
                            }}
                        />
                    ) : pdfLoading ? (
                        <div style={{
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                            gap: '16px',
                            backgroundColor: '#f5f5f5'
                        }}>
                            <Spin size="large" />
                            <div style={{ fontSize: '16px', color: '#666', textAlign: 'center' }}>
                                <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Memuat PDF...</div>
                                <div>Silakan tunggu sebentar</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                            gap: '16px',
                            backgroundColor: '#f5f5f5'
                        }}>
                            <FilePdfOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
                            <div style={{ fontSize: '16px', color: '#666', textAlign: 'center' }}>
                                <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>PDF tidak dapat dimuat</div>
                                <div>Silakan download file untuk melihat kontennya</div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        const folder = getFolderFromFileType(fallbackFileType || fileType);
                                        downloadFile(folder, actualFileName);
                                    }}
                                    icon={<DownloadOutlined />}
                                >
                                    Download PDF
                                </Button>
                                <Button
                                    onClick={() => {
                                        setPdfLoading(true);
                                        const folder = getFolderFromFileType('pdf');
                                        getFile(folder, actualFileName)
                                            .then(blobData => {
                                                const blobUrl = window.URL.createObjectURL(blobData);
                                                setPdfBlobUrl(blobUrl);
                                            })
                                            .catch(error => {
                                                setError('Failed to load PDF file: ' + (error.message || error));
                                                setPdfBlobUrl(null);
                                            })
                                            .finally(() => {
                                                setPdfLoading(false);
                                            });
                                    }}
                                >
                                    Coba Lagi
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <FilePdfOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>Preview tidak tersedia untuk jenis file ini</div>
                <div style={{ color: '#666', marginBottom: '16px' }}>{actualFileName}</div>
                <div style={{ marginTop: '16px' }}>
                    <Button type="primary" href={getFileUrl(getFolderFromFileType(fallbackFileType || fileType), actualFileName)} target="_blank" rel="noopener noreferrer">
                        Buka di Tab Baru
                    </Button>
                </div>
            </div>
        );
    };

    const getFileIcon = () => {
        const displayFileName = actualFileName || 'Loading...';
        const fileExtension = displayFileName.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
        const isPdf = fileExtension === 'pdf';

        if (isImage) return <FileImageOutlined style={{ color: '#1890ff', fontSize: '20px' }} />;
        if (isPdf) return <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />;
        return <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />;
    };

    const getFileTypeColor = () => {
        const displayFileName = actualFileName || 'Loading...';
        const fileExtension = displayFileName.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
        const isPdf = fileExtension === 'pdf';

        if (isImage) return '#1890ff';
        if (isPdf) return '#ff4d4f';
        return '#ff4d4f';
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {getFileIcon()}
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                                {actualFileName || 'Loading...'}
                            </Title>
                            {brandData ? (
                                <div style={{ color: '#666', fontSize: '14px' }}>
                                    Brand: {brandData.brand_name} | ID: {brandData.brand_id}
                                </div>
                            ) : (
                                <div style={{ color: '#666', fontSize: '14px' }}>
                                    Loading brand information...
                                </div>
                            )}
                        </div>
                    </div>
                    <Space>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleBack}
                        >
                            Kembali
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                const folder = getFolderFromFileType(fallbackFileType || fileType);
                                downloadFile(folder, actualFileName);
                            }}
                            disabled={loading}
                        >
                            Download File
                        </Button>
                    </Space>
                </div>


                <div style={{ marginBottom: '16px' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        backgroundColor: getFileTypeColor() + '15',
                        border: `1px solid ${getFileTypeColor()}30`,
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: getFileTypeColor()
                    }}>
                        {(fallbackFileType || fileType || 'FILE')?.toUpperCase()}
                    </div>
                </div>

                <div style={{ position: 'relative' }}>

                    {loading && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(0.8px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 5,
                            borderRadius: '8px'
                        }}>
                            <Spin size="large" />
                        </div>
                    )}

                    <div style={{ filter: loading ? 'blur(0.5px)' : 'none', transition: 'filter 0.3s ease' }}>
                        {renderContent()}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ViewFilePage;