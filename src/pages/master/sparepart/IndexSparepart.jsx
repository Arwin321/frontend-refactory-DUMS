import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';
import ListSparepart from './component/ListSparepart';
import DetailSparepart from './component/DetailSparepart';

const { Text } = Typography;

const IndexSparepart = memo(function IndexSparepart() {
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();

    const [actionMode, setActionMode] = useState('list');
    const [selectedData, setSelectedData] = useState(null);
    const [readOnly, setReadOnly] = useState(false);
    const [showModal, setShowmodal] = useState(false);

    const setMode = (param) => {
        setShowmodal(true);
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
                setShowmodal(false);
                break;
        }
        setActionMode(param);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setBreadcrumbItems([
                { title: <Text strong style={{ fontSize: '14px' }}>• Master</Text> },
                { title: <Text strong style={{ fontSize: '14px' }}>Sparepart</Text> }
            ]);
        } else {
            navigate('/signin');
        }
    }, []);

    return (
        <React.Fragment>
            <ListSparepart
                actionMode={actionMode}
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
            />
            <DetailSparepart
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
                showModal={showModal}
                permitDefault={false}
                actionMode={actionMode}
            />
        </React.Fragment>
    );
});

export default IndexSparepart;