import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListTag from './component/ListTag';
import DetailTag from './component/DetailTag';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';

const { Text } = Typography;

const IndexTag = memo(function IndexTag() {
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();

    const [actionMode, setActionMode] = useState('list');
    const [selectedData, setSelectedData] = useState(null);
    const [readOnly, setReadOnly] = useState(false);
    const [showModal, setShowmodal] = useState(false);

    const setMode = (param) => {
        setActionMode(param);
        switch (param) {
            case 'add':
                setReadOnly(false);
                setShowmodal(true);
                break;

            case 'edit':
                setReadOnly(false);
                setShowmodal(true);
                break;

            case 'preview':
                setReadOnly(true);
                setShowmodal(true);
                break;

            default:
                setShowmodal(false);
                break;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setBreadcrumbItems([
                { title: <Text strong style={{ fontSize: '14px' }}>• Master</Text> },
                { title: <Text strong style={{ fontSize: '14px' }}>Tag</Text> }
            ]);
        } else {
            navigate('/signin');
        }
    }, []);

    return (
        <React.Fragment>
            <ListTag
                actionMode={actionMode}
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
            />
            <DetailTag
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

export default IndexTag;
