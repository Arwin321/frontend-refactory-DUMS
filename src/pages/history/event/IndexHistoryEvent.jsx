import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';
import ListHistoryEvent from './component/ListHistoryEvent';

const { Text } = Typography;

const IndexHistoryEvent = memo(function IndexHistoryEvent() {
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();
    const [selectedData, setSelectedData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setBreadcrumbItems([
                {
                    title: (
                        <Text strong style={{ fontSize: '14px' }}>
                            • History Event
                        </Text>
                    ),
                },
            ]);
        } else {
            navigate('/signin');
        }
    }, [navigate, setBreadcrumbItems]);

    return (
        <React.Fragment>
            <ListHistoryEvent selectedData={selectedData} setSelectedData={setSelectedData} />
        </React.Fragment>
    );
});

export default IndexHistoryEvent;
