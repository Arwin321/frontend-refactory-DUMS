import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFileUrl, getFolderFromFileType } from '../api/file-uploads';

const ImageViewer = () => {
    const { fileName } = useParams();
    const [fileUrl, setFileUrl] = useState('');
    const [error, setError] = useState('');
    const [zoom, setZoom] = useState(1);
    const [isImage, setIsImage] = useState(false);

    useEffect(() => {
        if (!fileName) {
            setError('No file specified');
            return;
        }

        try {
            const decodedFileName = decodeURIComponent(fileName);
            const fileExtension = decodedFileName.split('.').pop()?.toLowerCase();
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

            setIsImage(imageExtensions.includes(fileExtension));

            const folder = getFolderFromFileType(fileExtension);

            const url = getFileUrl(folder, decodedFileName);
            setFileUrl(url);

            document.title = `File Viewer - ${decodedFileName}`;
        } catch (error) {

            setError('Failed to load file');
        }
    }, [fileName]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isImage) return;

            if (e.key === '+' || e.key === '=') {
                setZoom(prev => Math.min(prev + 0.1, 3));
            } else if (e.key === '-' || e.key === '_') {
                setZoom(prev => Math.max(prev - 0.1, 0.1));
            } else if (e.key === '0') {
                setZoom(1);
            } else if (e.key === 'Escape') {
                window.close();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isImage]);


    const handleWheel = (e) => {
        if (!isImage || !e.ctrlKey) return;

        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.min(Math.max(prev + delta, 0.1), 3));
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.1));
    const handleResetZoom = () => setZoom(1);

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#f5f5f5'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1>Error</h1>
                    <p>{error}</p>
                </div>
            </div>
        );
    }


    if (!isImage) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#f5f5f5'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1>File Type Not Supported</h1>
                    <p>Image viewer only supports image files.</p>
                    <p>Please use direct file preview for PDFs and other documents.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                margin: 0,
                padding: 0,
                height: '100vh',
                width: '100vw',
                backgroundColor: '#000',
                overflow: 'hidden',
                position: 'relative'
            }}
            onWheel={handleWheel}
        >

            {isImage && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    display: 'flex',
                    gap: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: '10px',
                    borderRadius: '8px',
                    zIndex: 1000
                }}>
                    <button
                        onClick={handleZoomOut}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                        title="Zoom Out (-)"
                    >
                        −
                    </button>
                    <span style={{
                        color: '#fff',
                        padding: '8px 12px',
                        minWidth: '60px',
                        textAlign: 'center',
                        fontSize: '14px'
                    }}>
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                        title="Zoom In (+)"
                    >
                        +
                    </button>
                    <button
                        onClick={handleResetZoom}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                        title="Reset Zoom (0)"
                    >
                        Reset
                    </button>
                </div>
            )}


            {isImage && fileUrl ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    overflow: 'auto'
                }}>
                    <img
                        src={fileUrl}
                        alt={decodeURIComponent(fileName)}
                        style={{
                            maxWidth: 'none',
                            maxHeight: 'none',
                            transform: `scale(${zoom})`,
                            transformOrigin: 'center',
                            transition: 'transform 0.1s ease-out',
                            cursor: zoom > 1 ? 'move' : 'default'
                        }}
                        onError={() => setError('Failed to load image')}
                        draggable={false}
                    />
                </div>
            ) : isImage ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    color: '#fff',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <p>Loading image...</p>
                </div>
            ) : null}


            {isImage && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    zIndex: 1000
                }}>
                    <div>Mouse wheel + Ctrl: Zoom</div>
                    <div>Keyboard: +/− Zoom, 0: Reset, ESC: Close</div>
                </div>
            )}
        </div>
    );
};

export default ImageViewer;