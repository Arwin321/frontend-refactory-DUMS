import React, { memo, useState, useEffect } from 'react';
import { Button, Row, Col, Card, DatePicker, Select, Typography, Modal, Spin } from 'antd';
import dayjs from 'dayjs';
import { FileTextOutlined, LoadingOutlined } from '@ant-design/icons';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import './trending.css';
import { getAllPlantSection } from '../../../api/master-plant-section';
import { getAllHistoryValueTrendingPivot } from '../../../api/history-value';

const { Text } = Typography;

const ReportTrending = memo(function ReportTrending(props) {
    const dateNow = dayjs();
    const dateNowFormated = dateNow.format('YYYY-MM-DD');

    const [plantSubSection, setPlantSubSection] = useState(0);
    const [plantSubSectionList, setPlantSubSectionList] = useState([]);
    const [startDate, setStartDate] = useState(dateNow);
    const [endDate, setEndDate] = useState(dateNow);
    const [periode, setPeriode] = useState(60);
    const [isLoading, setIsLoading] = useState(false);

    const defaultFilter = {
        criteria: '',
        plant_sub_section_id: plantSubSection,
        from: dateNowFormated,
        to: dateNowFormated,
        interval: periode,
    };
    const [formDataFilter, setFormDataFilter] = useState(defaultFilter);

    const [trendingValue, setTrendingValue] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [metrics, setMetrics] = useState([]);

    // Palet warna
    const colorPalette = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
    ];

    const handleSearch = async () => {
        setIsLoading(true);
        
        try {
            const formattedDateStart = startDate.format('YYYY-MM-DD');
            const formattedDateEnd = endDate.format('YYYY-MM-DD');

            const newFilter = {
                criteria: '',
                plant_sub_section_id: plantSubSection,
                from: formattedDateStart,
                to: formattedDateEnd,
                interval: periode,
            };

            setFormDataFilter(newFilter);

            const param = new URLSearchParams(newFilter);
            const response = await getAllHistoryValueTrendingPivot(param);

            if (response?.data?.length > 0) {
                transformDataForRecharts(response.data);
            } else {
                setTrendingValue([]);
                setChartData([]);
                setMetrics([]);
            }
        } catch (error) {
            console.error('Error fetching trending data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const transformDataForRecharts = (nivoData) => {
        setTrendingValue(nivoData);

        const metricNames = nivoData.map(serie => serie.id);
        setMetrics(metricNames);

        const timeMap = new Map();

        nivoData.forEach(serie => {
            serie.data.forEach(point => {
                if (!timeMap.has(point.x)) {
                    timeMap.set(point.x, { time: point.x });
                }
                const entry = timeMap.get(point.x);
                entry[serie.id] = point.y !== null && point.y !== undefined
                    ? parseFloat(point.y)
                    : null;
            });
        });

        const transformedData = Array.from(timeMap.values()).sort((a, b) =>
            new Date(a.time) - new Date(b.time)
        );

        setChartData(transformedData);
    };

    const handleReset = () => {
        setPlantSubSection(0);
        setStartDate(dateNow);
        setEndDate(dateNow);
        setPeriode(60);
        setChartData([]);
        setMetrics([]);
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

    // Fungsi untuk menentukan apakah rentang tanggal lebih dari 1 hari
    const isMultipleDays = () => {
        return !startDate.isSame(endDate, 'day');
    };

    // Format sumbu X yang otomatis menyesuaikan
    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        // Jika rentang lebih dari 1 hari, tampilkan tanggal + waktu
        if (isMultipleDays()) {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            return `${day}/${month} ${hours}:${minutes}`;
        }
        
        // Jika hanya 1 hari, tampilkan waktu saja
        return `${hours}:${minutes}`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '8px' }}>
                        {new Date(label).toLocaleString('id-ID')}
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{
                            margin: '4px 0',
                            color: entry.color,
                            fontSize: '13px'
                        }}>
                            <strong>{entry.name}:</strong> {Number(entry.value).toFixed(4)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        if (!chartData || chartData.length === 0) {
            return (
                <div style={{
                    textAlign: 'center',
                    marginTop: '100px',
                    color: '#999',
                    fontSize: '16px'
                }}>
                    Tidak ada data untuk ditampilkan
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height={500}>
                <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 200, left: 80, bottom: 40 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 11 }}
                        tickFormatter={formatXAxis}
                        label={{
                            value: 'Waktu',
                            position: 'bottom',
                            offset: -50,
                            style: { fontSize: 14, fontWeight: 'bold' }
                        }}
                    />
                    <YAxis
                        tick={{ fontSize: 11 }}
                        label={{
                            value: 'Nilai',
                            angle: -90,
                            position: 'right',
                            offset: -70,
                            dy: 0,
                            style: { 
                                fontSize: 12, 
                                fontWeight: 'bold', 
                                fill: '#059669', 
                                textAnchor: 'middle'
                            }
                        }}
                        tickFormatter={(value) => Number(value).toFixed(2)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        wrapperStyle={{
                            position: 'absolute',
                            right: 150,
                            top: '35%',
                            transform: 'translateY(-50%)'
                        }}
                    />
                    {metrics.map((metric, index) => {
                        const color = colorPalette[index % colorPalette.length];
                        return (
                            <Line
                                key={metric}
                                type="monotone"
                                dataKey={metric}
                                stroke={color}
                                strokeWidth={2}
                                dot={chartData.length < 50}
                                name={metric}
                                connectNulls={true}
                            />
                        );
                    })}
                </LineChart>
            </ResponsiveContainer>
        );
    };

    useEffect(() => {
        getPlantSubSection();
    }, []);

    return (
        <React.Fragment>
            {/* Loading Modal */}
            <Modal
                open={isLoading}
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
                        System is generating trending data...
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
                                        options={[
                                            { value: 5, label: '5 Minute' },
                                            { value: 10, label: '10 Minute' },
                                            { value: 30, label: '30 Minute' },
                                            { value: 60, label: '1 Hour' },
                                            { value: 120, label: '2 Hour' },
                                        ]}
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
                                >
                                    Show
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

                    <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ marginTop: '24px' }}>
                        {renderChart()}
                    </Col>
                </Row>
            </Card>
        </React.Fragment>
    );
});

export default ReportTrending;