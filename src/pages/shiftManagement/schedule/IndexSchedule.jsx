import React, { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';

const { Text } = Typography;

const IndexSchedule = memo(function IndexSchedule() {
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setBreadcrumbItems([
                { title: <Text strong style={{ fontSize: '14px' }}>• Manajemen Shift</Text> },
                { title: <Text strong style={{ fontSize: '14px' }}>Jadwal Shift</Text> }
            ]);
        } else {
            navigate('/signin');
        }
    }, []);

    return (
        <div>
            <h1>Jadwal Shift Page</h1>
        </div>
    );
});

export default IndexSchedule;
