import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListShift from './component/ListShift';
import DetailShift from './component/DetailShift';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';

const { Text } = Typography;

const IndexShift = memo(function IndexShift() {
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();

    const [actionMode, setActionMode] = useState('list');
    const [selectedData, setSelectedData] = useState(null);
    const [readOnly, setReadOnly] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const setMode = (param) => {
        setActionMode(param);
        switch (param) {
            case 'add':
                setReadOnly(false);
                setShowModal(true);
                break;

            case 'edit':
                setReadOnly(false);
                setShowModal(true);
                break;

            case 'preview':
                setReadOnly(true);
                setShowModal(true);
                break;

            default:
                setShowModal(false);
                break;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setBreadcrumbItems([
                { title: <Text strong style={{ fontSize: '14px' }}>• Master</Text> },
                { title: <Text strong style={{ fontSize: '14px' }}>Shift</Text> }
            ]);
        } else {
            navigate('/signin');
        }
    }, []);

    return (
        <React.Fragment>
            <ListShift
                actionMode={actionMode}
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
            />
            <DetailShift
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

export default IndexShift;
