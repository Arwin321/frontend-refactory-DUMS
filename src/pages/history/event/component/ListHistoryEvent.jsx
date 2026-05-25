import React, { memo, useState, useEffect } from 'react';
import { Button, Row, Col, Card, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import TableList from '../../../../components/Global/TableList';
import { getAllHistoryEvent } from '../../../../api/history-value';

const ListHistoryEvent = memo(function ListHistoryEvent(props) {
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
            dataIndex: 'tagname',
            key: 'tagname',
            width: '40%',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: '20%',
            render: (_, record) => (
                <Button type="text" style={{ backgroundColor: record.status_color, width: '100%' }}>
                    {record.description}
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
                            getData={getAllHistoryEvent}
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

export default ListHistoryEvent;
