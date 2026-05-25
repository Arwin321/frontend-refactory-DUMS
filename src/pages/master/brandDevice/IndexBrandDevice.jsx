import React, { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListBrandDevice from './component/ListBrandDevice';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';

const { Text } = Typography;

const IndexBrandDevice = memo(function IndexBrandDevice() {
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setBreadcrumbItems([
                { title: <Text strong style={{ fontSize: '14px' }}>• Master</Text> },
                { title: <Text strong style={{ fontSize: '14px' }}>Brand Device</Text> }
            ]);
        } else {
            navigate('/signin');
        }
    }, []);

    return (
        <React.Fragment>
            <ListBrandDevice />
        </React.Fragment>
    );
});

export default IndexBrandDevice;