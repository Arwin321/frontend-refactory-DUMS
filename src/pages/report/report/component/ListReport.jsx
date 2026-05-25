import React, { memo, useState, useEffect } from 'react';
import { Button, Row, Col, Card, DatePicker, Select, Typography, Table, Spin, Modal } from 'antd';
import dayjs from 'dayjs';
import { FileTextOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import {
    getAllHistoryValueReportPivot,
    getAllHistoryValueReport,
} from '../../../../api/history-value';
import { getAllPlantSection } from '../../../../api/master-plant-section';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const { Text } = Typography;

const ListReport = memo(function ListReport(props) {
    const dateNow = dayjs();
    const dateNowFormated = dateNow.format('YYYY-MM-DD');

    const [isLoadingModal, setIsLoadingModal] = useState(false);
    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [pivotData, setPivotData] = useState([]);
    const [valueReportData, setValueReportData] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [plantSubSection, setPlantSubSection] = useState(0);
    const [plantSubSectionList, setPlantSubSectionList] = useState([]);
    const [startDate, setStartDate] = useState(dateNow);
    const [endDate, setEndDate] = useState(dateNow);
    const [periode, setPeriode] = useState(30);

    const generateFullDayTimes = (dateString, intervalMinutes) => {
        const times = [];
        const startOfDay = dayjs(dateString).startOf('day');
        const endOfDay = dayjs(dateString).endOf('day');

        let currentTime = startOfDay;

        while (currentTime.isBefore(endOfDay) || currentTime.isSame(endOfDay)) {
            times.push(currentTime.format('YYYY-MM-DD HH:mm:ss'));
            currentTime = currentTime.add(intervalMinutes, 'minute');

            if (currentTime.isAfter(endOfDay)) {
                break;
            }
        }

        return times;
    };

    const fetchData = async (page = 1, pageSize = 10, showModal = false) => {
        // if (!plantSubSection) {
        //     return;
        // }

        if (showModal) {
            setIsLoadingModal(true);
        } else {
            setIsLoadingTable(true);
        }
        try {
            const formattedDateStart = startDate.format('YYYY-MM-DD');
            const formattedDateEnd = endDate.format('YYYY-MM-DD');

            const params = new URLSearchParams({
                plant_sub_section_id: plantSubSection,
                from: formattedDateStart,
                to: formattedDateEnd,
                interval: periode,
                page: 1,
                limit: 1000,
            });

            const pivotResponse = await getAllHistoryValueReportPivot(params);
            const valueReportResponse = await getAllHistoryValueReportPivot(params);

            if (pivotResponse && pivotResponse.data) {
                console.log('API Pivot Response:', pivotResponse);
                setPivotData(pivotResponse.data);

                if (valueReportResponse && valueReportResponse.data) {
                    console.log('API Value Report Response:', valueReportResponse);
                    setValueReportData(valueReportResponse.data);
                }

                // Buat struktur pivot: waktu sebagai baris, tag sebagai kolom
                const timeMap = new Map();
                const tagSet = new Set();

                // Kumpulkan semua waktu unik dan tag unik
                pivotResponse.data.forEach((row) => {
                    const tagName = row.id;
                    tagSet.add(tagName);

                    const dataPoints = row.data || [];
                    dataPoints.forEach((item) => {
                        if (item && typeof item === 'object' && 'x' in item && 'y' in item) {
                            const datetime = item.x;
                            if (!timeMap.has(datetime)) {
                                timeMap.set(datetime, {});
                            }
                            timeMap.get(datetime)[tagName] = item.y;
                        }
                    });
                });

                // Konversi ke array dan sort berdasarkan waktu
                const sortedTimes = Array.from(timeMap.keys()).sort();
                const sortedTags = Array.from(tagSet).sort();

                // Buat data untuk table
                const pivotTableData = sortedTimes.map((datetime, index) => {
                    const rowData = {
                        key: index,
                        datetime: datetime,
                    };

                    sortedTags.forEach((tagName) => {
                        rowData[tagName] = timeMap.get(datetime)[tagName];
                    });

                    return rowData;
                });

                console.log('Pivot table data sample:', pivotTableData.slice(0, 5));
                console.log('Total pivot rows:', pivotTableData.length);

                // Buat kolom dinamis
                const dynamicColumns = [
                    {
                        title: 'No',
                        key: 'no',
                        width: 60,
                        align: 'center',
                        fixed: 'left',
                        render: (_, __, index) => {
                            return (page - 1) * pageSize + index + 1;
                        },
                    },
                    {
                        title: 'Datetime',
                        dataIndex: 'datetime',
                        key: 'datetime',
                        width: 180,
                        fixed: 'left',
                        sorter: (a, b) => new Date(a.datetime) - new Date(b.datetime),
                    },
                    ...sortedTags.map((tagName) => ({
                        title: tagName,
                        dataIndex: tagName,
                        key: tagName,
                        width: 120,
                        align: 'center',
                        render: (value) => {
                            if (value === null || value === undefined) {
                                return '-';
                            }
                            return Number(value).toFixed(2);
                        },
                    })),
                ];

                setColumns(dynamicColumns);

                // Pagination
                const total = pivotTableData.length;
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedData = pivotTableData.slice(startIndex, endIndex);

                setTableData(paginatedData);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: total,
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            if (showModal) {
                setIsLoadingModal(false);
            } else {
                setIsLoadingTable(false);
            }
        }
    };

    const handleTableChange = (pagination, filters, sorter) => {
        fetchData(pagination.current, pagination.pageSize, false);
    };

    const handleSearch = async () => {
        setIsLoadingModal(true);

        try {
            const formattedDateStart = startDate.format('YYYY-MM-DD');
            const formattedDateEnd = endDate.format('YYYY-MM-DD');

            const params = new URLSearchParams({
                plant_sub_section_id: plantSubSection,
                from: formattedDateStart,
                to: formattedDateEnd,
                interval: periode,
                page: 1,
                limit: 1000,
            });

            const pivotResponse = await getAllHistoryValueReportPivot(params);

            // Jika response sukses, proses data
            if (pivotResponse && pivotResponse.data) {
                await fetchData(1, pagination.pageSize, false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            // Error akan ditangkap oleh api-request.js dan muncul Swal otomatis
        } finally {
            setIsLoadingModal(false);
        }
    };

    const handleReset = () => {
        setPlantSubSection(0);
        setStartDate(dateNow);
        setEndDate(dateNow);
        setPeriode(30);
        setTableData([]);
        setColumns([]);
        setPivotData([]);
        setValueReportData([]);
        setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
        });
    };

    const getPlantSubSection = async () => {
        const params = new URLSearchParams({ page: 1 });
        const response = await getAllPlantSection(params);

        if (response && response.data) {
            const activePlantSubSections = response.data.filter(
                (section) => section.is_active === true
            );
            setPlantSubSectionList(activePlantSubSections);
        }
    };

    useEffect(() => {
        getPlantSubSection();
    }, []);

    const isWithinOneDay = startDate.isSame(endDate, 'day');

    useEffect(() => {
        if (!isWithinOneDay && periode < 60) {
            setPeriode(60);
        }
    }, [startDate, endDate, periode, isWithinOneDay]);

    const periodeOptions = [
        { value: 5, label: '5 Minute', disabled: !isWithinOneDay },
        { value: 10, label: '10 Minute', disabled: !isWithinOneDay },
        { value: 30, label: '30 Minute', disabled: !isWithinOneDay },
        { value: 60, label: '1 Hour', disabled: false },
        { value: 120, label: '2 Hour', disabled: false },
    ];

    const exportToExcel = async () => {
        if (pivotData.length === 0) {
            alert('No data to export');
            return;
        }

        const tagMapping = {};
        valueReportData.forEach(item => {
            if (item.tag_name && item.tag_number) {
                tagMapping[item.tag_name] = item.tag_number;
            }
        });

        const selectedSection = plantSubSectionList.find(
            item => item.plant_sub_section_id === plantSubSection
        );
        const sectionName = selectedSection ? selectedSection.plant_sub_section_name : 'Unknown';

        // Buat struktur pivot yang sama seperti di tabel
        const timeMap = new Map();
        const tagSet = new Set();

        pivotData.forEach((row) => {
            const tagName = row.id;
            tagSet.add(tagName);

            const dataPoints = row.data || [];
            dataPoints.forEach((item) => {
                if (item && typeof item === 'object' && 'x' in item && 'y' in item) {
                    const datetime = item.x;
                    if (!timeMap.has(datetime)) {
                        timeMap.set(datetime, {});
                    }
                    timeMap.get(datetime)[tagName] = item.y;
                }
            });
        });

        const sortedTimes = Array.from(timeMap.keys()).sort();
        const sortedTags = Array.from(tagSet).sort();

        const pivotTableData = sortedTimes.map((datetime) => {
            const rowData = {
                datetime: datetime,
            };

            sortedTags.forEach((tagName) => {
                rowData[tagName] = timeMap.get(datetime)[tagName];
            });

            return rowData;
        });

        console.log('Excel Pivot data:', pivotTableData.slice(0, 5));
        console.log('Total rows for Excel:', pivotTableData.length);

        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet('Pivot Report');

        // Buat header info (3 baris pertama)
        ws.addRow(['PT. PUPUK INDONESIA UTILITAS']);
        ws.addRow(['GRESIK GAS COGENERATION PLANT']);
        ws.addRow([`${sectionName}`]);
        ws.addRow([]); // Baris kosong sebagai pemisah

        // Buat header kolom dengan tag number
        const headerRow = [
            'Datetime',
            ...sortedTags.map(tag => tagMapping[tag] || tag)
        ];
        ws.addRow(headerRow);

        // Buat data rows - PERBAIKAN: Simpan sebagai number murni
        pivotTableData.forEach((rowData) => {
            const row = [dayjs(rowData.datetime).format('DD-MM-YYYY HH:mm')];
            sortedTags.forEach((tagName) => {
                const value = rowData[tagName];
                // Simpan sebagai number, bukan string
                if (value !== undefined && value !== null) {
                    row.push(Number(value));
                } else {
                    row.push('-');
                }
            });
            ws.addRow(row);
        });

        // Set column widths
        ws.getColumn(1).width = 18; // Datetime column
        for (let i = 2; i <= sortedTags.length + 1; i++) {
            ws.getColumn(i).width = 12; // Tag columns
        }

        // Merge cells untuk header info
        const totalCols = sortedTags.length + 1;
        ws.mergeCells(1, 1, 1, totalCols); // Baris 1
        ws.mergeCells(2, 1, 2, totalCols); // Baris 2
        ws.mergeCells(3, 1, 3, totalCols); // Baris 3

        // Style untuk header info (3 baris pertama - bold dan center)
        for (let i = 1; i <= 3; i++) {
            const cell = ws.getCell(i, 1);
            cell.font = { bold: true, size: 12 };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        }

        // Style untuk header kolom (bold, background color, center, border)
        const headerRowIndex = 5; // Baris header
        for (let col = 1; col <= totalCols; col++) {
            const cell = ws.getCell(headerRowIndex, col);
            cell.font = { bold: true, size: 11 };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDCDCDC' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        }

        // Style untuk data cells (border dan alignment) - PERBAIKAN: Format number dengan 2 desimal
        for (let row = headerRowIndex + 1; row <= ws.rowCount; row++) {
            for (let col = 1; col <= totalCols; col++) {
                const cell = ws.getCell(row, col);

                cell.alignment = {
                    horizontal: 'center',
                    vertical: 'middle',
                    wrapText: true
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };

                // Format number dengan 2 desimal untuk kolom value (kolom 2 dst)
                if (col > 1) {
                    const cellValue = cell.value;
                    // Hanya set format number jika cell berisi angka
                    if (typeof cellValue === 'number') {
                        cell.numFmt = '0.00';
                    }
                }
            }
        }

        // Generate file name
        const fileName = `Report_Pivot_${startDate.format('DD-MM-YYYY')}_to_${endDate.format('DD-MM-YYYY')}.xlsx`;

        // Save file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, fileName);
    };

    const exportToPDF = async () => {
        if (pivotData.length === 0) {
            alert('No data to export');
            return;
        }

        const tagMapping = {};
        valueReportData.forEach(item => {
            if (item.tag_name && item.tag_number) {
                tagMapping[item.tag_name] = item.tag_number;
            }
        });

        const selectedSection = plantSubSectionList.find(item => item.plant_sub_section_id === plantSubSection);
        const sectionName = selectedSection ? selectedSection.plant_sub_section_name : 'Unknown';

        // Buat struktur pivot yang sama seperti di tabel
        const timeMap = new Map();
        const tagSet = new Set();

        pivotData.forEach((row) => {
            const tagName = row.id;
            tagSet.add(tagName);

            const dataPoints = row.data || [];
            dataPoints.forEach((item) => {
                if (item && typeof item === 'object' && 'x' in item && 'y' in item) {
                    const datetime = item.x;
                    if (!timeMap.has(datetime)) {
                        timeMap.set(datetime, {});
                    }
                    timeMap.get(datetime)[tagName] = item.y;
                }
            });
        });

        const sortedTimes = Array.from(timeMap.keys()).sort();
        const sortedTags = Array.from(tagSet).sort();

        const pivotTableData = sortedTimes.map((datetime) => {
            const rowData = {
                datetime: datetime,
            };

            sortedTags.forEach((tagName) => {
                rowData[tagName] = timeMap.get(datetime)[tagName];
            });

            return rowData;
        });

        console.log('PDF Pivot data:', pivotTableData.slice(0, 5));
        console.log('Total rows for PDF:', pivotTableData.length);

        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        };

        let logo1, logo2;
        try {
            logo1 = await loadImage('/assets/pupuk-indonesia-2.jpg');
            logo2 = await loadImage('/assets/pupuk-indonesia-1.png');
        } catch (error) {
            console.error('Error loading logos:', error);
        }

        const doc = new jsPDF({ orientation: 'landscape' });
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const marginLeft = 10;
        const marginRight = 10;
        const tableWidth = pageWidth - marginLeft - marginRight;

        const DATETIME_COLUMN_WIDTH = 25;
        const HEADER_LEFT_COLUMN_WIDTH = 40;
        const MAX_TAG_COLUMNS_PER_PAGE = 15;

        const drawFullHeader = (doc) => {
            doc.setLineWidth(0.5);
            doc.line(marginLeft, 10, marginLeft + tableWidth, 10);
            doc.line(marginLeft, 10, marginLeft, 50);
            doc.line(marginLeft + tableWidth, 10, marginLeft + tableWidth, 50);

            const col1Width = HEADER_LEFT_COLUMN_WIDTH;
            const col3Width = tableWidth * 0.20;
            const col2Width = tableWidth - col1Width - col3Width;

            doc.line(marginLeft + col1Width, 10, marginLeft + col1Width, 30);
            doc.line(marginLeft + tableWidth - col3Width, 10, marginLeft + tableWidth - col3Width, 30);
            doc.line(marginLeft, 30, marginLeft + tableWidth, 30);

            if (logo1) {
                const maxLogoHeight = 18;
                const maxLogoWidth = col1Width - 4;
                const logoAspectRatio = logo1.width / logo1.height;
                let logoWidth, logoHeight;

                if (logoAspectRatio > (maxLogoWidth / maxLogoHeight)) {
                    logoWidth = maxLogoWidth;
                    logoHeight = logoWidth / logoAspectRatio;
                } else {
                    logoHeight = maxLogoHeight;
                    logoWidth = logoHeight * logoAspectRatio;
                }

                const logoX = marginLeft + (col1Width - logoWidth) / 2;
                const logoY = 10 + (20 - logoHeight) / 2;

                doc.addImage(logo1, 'JPEG', logoX, logoY, logoWidth, logoHeight);
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('PT. PUPUK INDONESIA UTILITAS', marginLeft + col1Width + col2Width / 2, 17, { align: 'center' });
            doc.line(marginLeft + col1Width, 21, marginLeft + tableWidth - col3Width, 21);
            doc.setFontSize(11);
            doc.text('GRESIK GAS COGENERATION PLANT', marginLeft + col1Width + col2Width / 2, 27, { align: 'center' });

            if (logo2) {
                const maxLogoHeight = 18;
                const maxLogoWidth = col3Width - 4;
                const logoAspectRatio = logo2.width / logo2.height;
                let logoWidth, logoHeight;

                if (logoAspectRatio > (maxLogoWidth / maxLogoHeight)) {
                    logoWidth = maxLogoWidth;
                    logoHeight = logoWidth / logoAspectRatio;
                } else {
                    logoHeight = maxLogoHeight;
                    logoWidth = logoHeight * logoAspectRatio;
                }

                const logoX = marginLeft + tableWidth - col3Width + (col3Width - logoWidth) / 2;
                const logoY = 10 + (20 - logoHeight) / 2;

                doc.addImage(logo2, 'PNG', logoX, logoY, logoWidth, logoHeight);
            }

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(`${sectionName}`, marginLeft + col1Width + col2Width / 2, 38, { align: 'center' });
        };

        // Hitung total kolom tag chunks
        const totalTagColumns = sortedTags.length;
        const totalTagChunks = Math.ceil(totalTagColumns / MAX_TAG_COLUMNS_PER_PAGE);

        // PERBAIKAN: Variabel untuk tracking total halaman yang sebenarnya
        let actualTotalPages = 0;
        const pageInfoArray = []; // Array untuk menyimpan info setiap page

        // Loop pertama: hitung dulu total halaman yang akan dibuat
        for (let pageChunk = 0; pageChunk < totalTagChunks; pageChunk++) {
            const startTagIndex = pageChunk * MAX_TAG_COLUMNS_PER_PAGE;
            const endTagIndex = Math.min(startTagIndex + MAX_TAG_COLUMNS_PER_PAGE, totalTagColumns);
            const pageTagColumns = sortedTags.slice(startTagIndex, endTagIndex);
            const isFirstPage = (pageChunk === 0);

            // Simulasi autoTable untuk menghitung jumlah halaman
            const tempDoc = new jsPDF({ orientation: 'landscape' });
            const headerRow = ['Datetime', ...pageTagColumns.map(tag => tagMapping[tag] || tag)];

            const pdfRows = pivotTableData.map((rowData) => {
                const row = [dayjs(rowData.datetime).format('DD-MM-YYYY HH:mm')];
                pageTagColumns.forEach((tagName) => {
                    const value = rowData[tagName];
                    row.push(value !== undefined && value !== null ? Number(value).toFixed(2) : '-');
                });
                return row;
            });

            const availableWidthForTags = tableWidth - DATETIME_COLUMN_WIDTH;
            const TAG_COLUMN_WIDTH = availableWidthForTags / pageTagColumns.length;

            const tagColumnStyles = {};
            for (let i = 0; i < pageTagColumns.length; i++) {
                tagColumnStyles[i + 1] = {
                    cellWidth: TAG_COLUMN_WIDTH,
                    halign: 'center'
                };
            }

            let pagesForThisChunk = 0;

            autoTable(tempDoc, {
                head: [headerRow],
                body: pdfRows,
                startY: isFirstPage ? 50 : 15,
                theme: 'grid',
                rowPageBreak: 'avoid',
                styles: {
                    fontSize: 7,
                    cellPadding: 1.5,
                    minCellHeight: 8,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1,
                    halign: 'center',
                    valign: 'middle',
                    overflow: 'linebreak',
                },
                headStyles: {
                    fillColor: [220, 220, 220],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle',
                    lineColor: [0, 0, 0],
                    lineWidth: 0.3,
                },
                columnStyles: {
                    0: {
                        cellWidth: DATETIME_COLUMN_WIDTH,
                        fontStyle: 'bold',
                        halign: 'center',
                        valign: 'middle'
                    },
                    ...tagColumnStyles
                },
                margin: { left: marginLeft, right: marginRight, top: 15 },
                tableWidth: tableWidth,
                pageBreak: 'auto',
                didDrawPage: () => {
                    pagesForThisChunk++;
                }
            });

            pageInfoArray.push({
                chunkIndex: pageChunk,
                pagesCount: pagesForThisChunk,
                startPage: actualTotalPages + 1
            });

            actualTotalPages += pagesForThisChunk;
        }

        console.log('Total pages akan dibuat:', actualTotalPages);

        // Loop kedua: buat PDF yang sebenarnya dengan nomor halaman yang benar
        let globalPageNumber = 1;

        for (let pageChunk = 0; pageChunk < totalTagChunks; pageChunk++) {
            if (pageChunk > 0) {
                doc.addPage();
            }

            const startTagIndex = pageChunk * MAX_TAG_COLUMNS_PER_PAGE;
            const endTagIndex = Math.min(startTagIndex + MAX_TAG_COLUMNS_PER_PAGE, totalTagColumns);
            const pageTagColumns = sortedTags.slice(startTagIndex, endTagIndex);
            const isFirstPage = (pageChunk === 0);

            if (isFirstPage) {
                drawFullHeader(doc);
            }

            const headerRow = ['Datetime', ...pageTagColumns.map(tag => tagMapping[tag] || tag)];

            const pdfRows = pivotTableData.map((rowData) => {
                const row = [dayjs(rowData.datetime).format('DD-MM-YYYY HH:mm')];

                pageTagColumns.forEach((tagName) => {
                    const value = rowData[tagName];
                    row.push(value !== undefined && value !== null ? Number(value).toFixed(2) : '-');
                });

                return row;
            });

            const availableWidthForTags = tableWidth - DATETIME_COLUMN_WIDTH;
            const TAG_COLUMN_WIDTH = availableWidthForTags / pageTagColumns.length;

            const tagColumnStyles = {};
            for (let i = 0; i < pageTagColumns.length; i++) {
                tagColumnStyles[i + 1] = {
                    cellWidth: TAG_COLUMN_WIDTH,
                    halign: 'center'
                };
            }

            autoTable(doc, {
                head: [headerRow],
                body: pdfRows,
                startY: isFirstPage ? 43 : 15,
                theme: 'grid',
                rowPageBreak: 'avoid',
                styles: {
                    fontSize: 7,
                    cellPadding: 1.5,
                    minCellHeight: 8,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5,
                    halign: 'center',
                    valign: 'middle',
                    overflow: 'linebreak',
                },
                headStyles: {
                    fillColor: [220, 220, 220],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle',
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5,
                },
                columnStyles: {
                    0: {
                        cellWidth: DATETIME_COLUMN_WIDTH,
                        fontStyle: 'bold',
                        halign: 'center',
                        valign: 'middle'
                    },
                    ...tagColumnStyles
                },
                margin: { left: marginLeft, right: marginRight, top: 15 },
                tableWidth: tableWidth,
                pageBreak: 'auto',
                didDrawPage: (data) => {
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'normal');
                    doc.text(
                        `Page ${globalPageNumber} of ${actualTotalPages}`,
                        doc.internal.pageSize.width / 2,
                        doc.internal.pageSize.height - 10,
                        { align: 'center' }
                    );
                    globalPageNumber++;
                },
            });
        }

        doc.save(`Report_Pivot_${startDate.format('DD-MM-YYYY')}_to_${endDate.format('DD-MM-YYYY')}.pdf`);
    };

    return (
        <React.Fragment>
            <Modal
                open={isLoadingModal}
                footer={null}
                closable={false}
                centered
                width={400}
                bodyStyle={{
                    textAlign: 'center',
                    padding: '40px 20px'
                }}
            >
                <Spin
                    indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />}
                />
                <div style={{ marginTop: '24px' }}>
                    <Typography.Title level={4} style={{ marginBottom: '8px' }}>
                        Please Wait
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        System is generating report data...
                    </Typography.Text>
                </div>
            </Modal>

            <Card>
                <Row>
                    <Col xs={24}>
                        <Row gutter={16} style={{ marginTop: '16px' }}>
                            <Col xs={24} sm={12} md={6}>
                                <div className="filter-item">
                                    <Text style={{ fontSize: '12px', color: '#666' }}>
                                        Plant Sub Section
                                    </Text>
                                    <Select
                                        value={plantSubSection}
                                        onChange={(value) => setPlantSubSection(value)}
                                        style={{ width: '100%', marginTop: '4px' }}
                                    >
                                        <Select.Option key={0} value={0}>
                                            Pilih Plant Sub Section
                                        </Select.Option>
                                        {plantSubSectionList.map((item) => (
                                            <Select.Option
                                                key={item.plant_sub_section_id}
                                                value={item.plant_sub_section_id}
                                            >
                                                {item.plant_sub_section_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <div className="filter-item">
                                    <Text style={{ fontSize: '12px', color: '#666' }}>
                                        Tanggal Mulai
                                    </Text>
                                    <DatePicker
                                        value={startDate}
                                        onChange={setStartDate}
                                        format="DD-MM-YYYY"
                                        style={{ width: '100%', marginTop: '4px' }}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <div className="filter-item">
                                    <Text style={{ fontSize: '12px', color: '#666' }}>
                                        Tanggal Akhir
                                    </Text>
                                    <DatePicker
                                        value={endDate}
                                        onChange={setEndDate}
                                        format="DD-MM-YYYY"
                                        style={{ width: '100%', marginTop: '4px' }}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <div className="filter-item">
                                    <Text style={{ fontSize: '12px', color: '#666' }}>Periode</Text>
                                    <Select
                                        value={periode}
                                        onChange={setPeriode}
                                        style={{ width: '100%', marginTop: '4px' }}
                                        options={periodeOptions}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row gutter={8} style={{ marginTop: '16px' }}>
                            <Col>
                                <Button
                                    type="primary"
                                    danger
                                    icon={<FileTextOutlined />}
                                    onClick={handleSearch}
                                    disabled={false}
                                >
                                    Show
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={exportToPDF}
                                    disabled={pivotData.length === 0}
                                    style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                                >
                                    Export PDF
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={exportToExcel}
                                    disabled={pivotData.length === 0}
                                    style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
                                >
                                    Export Excel
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    onClick={handleReset}
                                    style={{ backgroundColor: '#6c757d', color: 'white' }}
                                >
                                    Reset
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={24} style={{ marginTop: '16px' }}>
                        <Spin spinning={isLoadingTable}>
                            <div style={{ overflowX: 'auto', width: '100%' }}>
                                <Table
                                    columns={columns}
                                    dataSource={tableData}
                                    pagination={{
                                        ...pagination,
                                        showSizeChanger: true,
                                        showTotal: (total) => `Total ${total} data`,
                                        pageSizeOptions: ['10', '20', '50', '100'],
                                    }}
                                    onChange={handleTableChange}
                                    scroll={{ x: 'max-content', y: 500 }}
                                    bordered
                                    size="small"
                                    sticky
                                />
                            </div>
                        </Spin>
                    </Col>
                </Row>
            </Card>
        </React.Fragment>
    );
});

export default ListReport;