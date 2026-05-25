import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';
import ListReport from './component/ListReport';

const { Text } = Typography;

const IndexReport = memo(function IndexReport() {
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
                            • Report
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
            <ListReport selectedData={selectedData} setSelectedData={setSelectedData} />
        </React.Fragment>
    );
});

export default IndexReport;
