import React, { memo, useState, useEffect } from 'react';
import { Button, Row, Col, Card, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import TableList from '../../../../components/Global/TableList';
import { getAllHistoryAlarm } from '../../../../api/history-value';

const ListHistoryAlarm = memo(function ListHistoryAlarm(props) {
    const columns = [
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
            // render: (_, record) => toAppDateTimezoneFormatter(record.datetime),
        },
        {
            title: 'Tag Name',
            dataIndex: 'tag_name',
            key: 'tag_name',
            width: '40%',
        },
        {
            title: 'Value',
            dataIndex: 'new_val',
            key: 'new_val',
            width: '10%',
            render: (_, record) => Number(record.new_val).toFixed(4),
        },
        {
            title: 'Threshold',
            dataIndex: 'threshold',
            key: 'threshold',
            width: '10%',
            render: (_, record) => {
                switch (record.status) {
                    case 1:
                        return (
                            <span>
                                {record.lim_low} : {record.lim_high}
                            </span>
                        );
                    case 2:
                        return <span>{`< ${record.lim_low_crash}`}</span>;
                    case 3:
                        return (
                            <span>
                                {record.lim_low_crash} : {record.lim_low}
                            </span>
                        );
                    case 4:
                        return (
                            <span>
                                {record.lim_high} : {record.lim_high_crash}
                            </span>
                        );
                    case 5:
                        return <span>{`> ${record.lim_high_crash}`}</span>;
                    default:
                        return <span>Undefined</span>;
                }
            },
        },
        {
            title: 'Condition',
            dataIndex: 'condition',
            key: 'condition',
            width: '20%',
            render: (_, record) => (
                <Button type="text" style={{ backgroundColor: record.status_color, width: '100%' }}>
                    {record.condition}
                </Button>
            ),
        },
        {
            title: 'Stat',
            dataIndex: 'status',
            key: 'status',
            width: '5%',
        },
    ];

    const [trigerFilter, setTrigerFilter] = useState(false);

    const defaultFilter = { criteria: '' };
    const [formDataFilter, setFormDataFilter] = useState(defaultFilter);
    const [searchValue, setSearchValue] = useState('');

    const handleSearch = () => {
        setFormDataFilter({ criteria: searchValue });
        setTrigerFilter((prev) => !prev);
    };

    const handleSearchClear = () => {
        setSearchValue('');
        setFormDataFilter({ criteria: '' });
        setTrigerFilter((prev) => !prev);
    };

    return (
        <React.Fragment>
            <Card>
                <Row>
                    <Col xs={24}>
                        <Row justify="space-between" align="middle" gutter={[8, 8]}>
                            <Col xs={24} sm={24} md={12} lg={12}>
                                <Input.Search
                                    placeholder="Search ..."
                                    value={searchValue}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchValue(value);
                                        if (value === '') {
                                            handleSearchClear();
                                        }
                                    }}
                                    onSearch={handleSearch}
                                    allowClear={{
                                        clearIcon: <span onClick={handleSearchClear}>✕</span>,
                                    }}
                                    enterButton={
                                        <Button
                                            type="primary"
                                            icon={<SearchOutlined />}
                                            style={{
                                                backgroundColor: '#23A55A',
                                                borderColor: '#23A55A',
                                            }}
                                        >
                                            Search
                                        </Button>
                                    }
                                    size="large"
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ marginTop: '16px' }}>
                        <TableList
                            getData={getAllHistoryAlarm}
                            queryParams={formDataFilter}
                            columns={columns}
                            triger={trigerFilter}
                        />
                    </Col>
                </Row>
            </Card>
        </React.Fragment>
    );
});

export default ListHistoryAlarm;
