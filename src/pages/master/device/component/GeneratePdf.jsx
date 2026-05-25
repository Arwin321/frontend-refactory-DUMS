import React, { useEffect, useState } from 'react';
import { Modal, Button, ConfigProvider } from 'antd';
import { jsPDF } from 'jspdf';
import logoPiEnergi from '../../../../assets/images/logo/pi-energi.png';
import { kopReportPdf } from '../../../../components/Global/KopReport';

const GeneratePdf = (props) => {
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            generatePdf();
        } else {
            navigate('/signin');
        }
    }, []);

    const handleCancel = () => {
        props.setSelectedData(null);
        props.setActionMode('list');
    };

    const generatePdf = async () => {
        const { images, title } = await kopReportPdf(logoPiEnergi, 'COLD WORK PERMIT');

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const width = 45;
        const height = 23;
        const marginTop = 6;
        const marginLeft = 10;
        doc.addImage(images, 'PNG', marginLeft, marginTop, width, height);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(25);
        doc.setTextColor(35, 165, 90);
        doc.setTextColor('#00b0f0');
        doc.text(title, 100, 25);
        doc.setTextColor('#000000');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        doc.setLineWidth(0.2);
        doc.line(10, 32, 200, 32);
        doc.setLineWidth(0.6);
        doc.line(10, 32.8, 200, 32.8);

        doc.text('Tanggal Pengajuan', 10, 42);
        doc.text(':', 59, 42);

        doc.text('Deskripsi Pekerjaan', 10, 48);
        doc.text(':', 59, 48);

        doc.text('No. Permit', 10, 54);
        doc.text(':', 59, 54);
        doc.text('Spesifik Lokasi', 120, 54);
        doc.text(':', 160, 54);

        doc.text('No. Order', 10, 60);
        doc.text(':', 59, 60);
        doc.text('Jum. Personil Terlihat', 120, 60);
        doc.text(':', 160, 60);

        doc.text('Peralatan yang digunakan', 10, 66);
        doc.text(':', 59, 66);

        doc.text('Jenis APD yang digunakan', 10, 72);
        doc.text(':', 59, 72);

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);

        setPdfUrl(url);

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    };

    return (
        <Modal
            width="60%"
            title="Preview PDF"
            open={props.showPdf}
            // open={true}
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
                </>,
            ]}
        >
            {pdfUrl && (
                <iframe
                    src={`${pdfUrl}#zoom=100`}
                    title="PDF Viewer"
                    width="100%"
                    height="600px"
                    style={{ marginTop: '20px', border: '1px solid #ccc' }}
                />
            )}
        </Modal>
    );
};

export default GeneratePdf;
