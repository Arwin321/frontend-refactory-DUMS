import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListRole from './component/ListRole';
import DetailRole from './component/DetailRole';
import { useBreadcrumb } from '../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';

const { Text } = Typography;

const IndexRole = memo(function IndexRole() {
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();

    const [actionMode, setActionMode] = useState('list');
    const [selectedData, setSelectedData] = useState(null);
    const [readOnly, setReadOnly] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const setMode = (param) => {
        setShowModal(true);
        switch (param) {
            case 'add':
                setReadOnly(false);
                break;
            case 'edit':
                setReadOnly(false);
                break;
            case 'preview':
                setReadOnly(true);
                break;
            default:
                setShowModal(false);
                break;
        }
        setActionMode(param);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setBreadcrumbItems([
                { title: <Text strong style={{ fontSize: '14px' }}>• Role</Text> },
            ]);
        } else {
            navigate('/signin');
        }
    }, [navigate, setBreadcrumbItems]);

    return (
        <React.Fragment>
            <ListRole
                actionMode={actionMode}
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
            />
            <DetailRole
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
                showModal={showModal}
                actionMode={actionMode}
            />
        </React.Fragment>
    );
});

export default IndexRole;