import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';
import ReportTrending from './ReportTrending';

const { Text } = Typography;

const IndexTrending = memo(function IndexTrending() {
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setBreadcrumbItems([
                {
                    title: (
                        <Text strong style={{ fontSize: '14px' }}>
                            • Trending
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
            <ReportTrending/>
        </React.Fragment>
    );
});

export default IndexTrending;
