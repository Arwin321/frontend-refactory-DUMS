import React, { memo, useState, useEffect, useRef } from 'react';
import { Table, Pagination, Row, Col, Card, Grid, Button, Typography, Tag, Segmented } from 'antd';
import { MacCommandOutlined, TableOutlined } from '@ant-design/icons';
import CardList from './CardList';

const { Text } = Typography;

const TableList = memo(function TableList({
    getData,
    queryParams,
    columns,
    triger,
    mobile,
    rowSelection = null,
    header = 'name',
    showPreviewModal,
    showEditModal,
    showDeleteDialog,
    cardColor,
    fieldColor,
    firstLoad = true,
    columnDynamic = false,
    cardComponent, // New prop for custom card component
    onStockUpdate, // Prop to pass to card component
    onGetData, // Callback to execute when data is received
}) {
    const [gridLoading, setGridLoading] = useState(false);

    const [data, setData] = useState([]);

    const [pagination, setPagination] = useState({
        current_page: 1,
        current_limit: 10,
        total_limit: 0,
        total_page: 1,
    });

    const [columnsDynamic, setColumnsDynamic] = useState(columns);

    const [viewMode, setViewMode] = useState('table');

    const { useBreakpoint } = Grid;

    const [renderCount, setRenderCount] = useState(firstLoad ? 1 : 0);

    useEffect(() => {
        if (renderCount < 1) {
            setRenderCount(renderCount + 1);
            return;
        } else {
            filter(1, pagination.current_limit);
        }
    }, [triger]);

    const filter = async (currentPage, pageSize) => {
        setGridLoading(true);

        const paging = {
            page: Number(currentPage),
            limit: Number(pageSize),
        };

        const param = new URLSearchParams({ ...paging, ...queryParams });
        const resData = await getData(param);

        if (columnDynamic && resData) {
            const columnsApi = resData[columnDynamic] ?? '';

            // Pisahkan string menjadi array kolom
            const colArray = columnsApi.split(',').map((c) => c.trim());

            // Kolom default datetime di awal
            const defaultColumns = [
                {
                    title: 'No',
                    key: 'no',
                    width: '5%',
                    align: 'center',
                    render: (_, __, index) => index + 1,
                },
                {
                    title: 'Datetime',
                    dataIndex: 'datetime',
                    key: 'datetime',
                    width: '15%',
                    // render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
                },
            ];

            // Buat kolom numerik dengan format 4 angka di belakang koma
            const numericColumns = colArray.map((colName) => ({
                title: colName,
                dataIndex: colName,
                key: colName,
                align: 'right',
                width: 'auto',
                render: (value) => {
                    if (typeof value === 'number') {
                        return value.toFixed(4);
                    }
                    return value ?? '-';
                },
            }));

            // Gabungkan default + API columns
            setColumnsDynamic([...defaultColumns, ...numericColumns]);
        }

        const fetchedData = resData?.data ?? [];

        // Panggil callback jika disediakan
        if (onGetData && typeof onGetData === 'function') {
            onGetData(fetchedData);
        }

        setData(fetchedData);

        const pagingData = resData?.paging;

        if (pagingData) {
            setPagination((prev) => ({
                ...prev,
                current_page: pagingData.current_page || 1,
                current_limit: pagingData.current_limit || 10,
                total_limit: pagingData.total_limit || 0,
                total_page: pagingData.total_page || 1,
            }));
        }

        setGridLoading(false);

        if (resData) {
            setTimeout(() => {
                setGridLoading(false);
            }, 900);
        } else {
            setGridLoading(false);
            return;
        }
    };

    const handlePaginationChange = (page, pageSize) => {
        setPagination((prev) => ({
            ...prev,
            current: page,
            limit: pageSize,
        }));
        filter(page, pageSize);
    };

    const screens = useBreakpoint();

    const isMobile = !screens.md; // kalau kurang dari md (768px) dianggap mobile

    // Use the custom card component if provided, otherwise default to CardList
    const CardViewComponent = cardComponent || CardList;

    return (
        <div>
            <Segmented
                options={[
                    { value: 'table', icon: <TableOutlined /> },
                    { value: 'card', icon: <MacCommandOutlined /> },
                ]}
                value={viewMode}
                onChange={setViewMode}
            />
            {(isMobile && mobile) || viewMode === 'card' ? (
                <CardViewComponent
                    cardColor={cardColor}
                    fieldColor={fieldColor}
                    data={data}
                    column={columnsDynamic}
                    header={header}
                    showPreviewModal={showPreviewModal}
                    showEditModal={showEditModal}
                    showDeleteDialog={showDeleteDialog}
                    onStockUpdate={onStockUpdate}
                />
            ) : (
                <Row gutter={24} style={{ marginTop: '16px' }}>
                    <Table
                        rowSelection={rowSelection || null}
                        columns={columnsDynamic}
                        dataSource={data.map((item, index) => ({ ...item, key: index }))}
                        pagination={false}
                        loading={gridLoading}
                        scroll={{ y: 520 }}
                        size="small"
                    />
                </Row>
            )}
            {/* PAGINATION */}
            <Row justify="space-between" align="middle">
                <Col>
                    <div>
                        Menampilkan {pagination.current_limit} data halaman{' '}
                        {pagination.current_page} dari total {pagination.total_limit} data
                    </div>
                </Col>
                <Col>
                    <Pagination
                        showSizeChanger
                        onChange={handlePaginationChange}
                        onShowSizeChange={handlePaginationChange}
                        current={pagination.current_page}
                        pageSize={pagination.current_limit}
                        total={pagination.total_limit}
                    />
                </Col>
            </Row>
        </div>
    );
});

export default TableList;

