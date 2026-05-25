import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';
import ListStatus from './component/ListStatus';
import DetailStatus from './component/DetailStatus';

const { Text } = Typography;

const IndexStatus = memo(function IndexStatus() {
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
                {
                    title: (
                        <Text strong style={{ fontSize: '14px' }}>
                            • Master
                        </Text>
                    ),
                },
                {
                    title: (
                        <Text strong style={{ fontSize: '14px' }}>
                            Status
                        </Text>
                    ),
                },
            ]);
        } else {
            navigate('/signin');
        }
    }, []);

    return (
        <React.Fragment>
            <ListStatus
                actionMode={actionMode}
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
            />

            <DetailStatus
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

export default IndexStatus;
