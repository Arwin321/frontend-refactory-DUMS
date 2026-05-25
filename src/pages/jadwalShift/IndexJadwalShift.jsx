import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListJadwalShift from './component/ListJadwalShift';
import DetailJadwalShift from './component/DetailJadwalShift';
import { useBreadcrumb } from '../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';

const { Text } = Typography;

const IndexJadwalShift = memo(function IndexJadwalShift() {
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
                { title: <Text strong style={{ fontSize: '14px' }}>• Jadwal</Text> },
                { title: <Text strong style={{ fontSize: '14px' }}>Jadwal Shift</Text> }
            ]);
        } else {
            navigate('/signin');
        }
    }, []);

    return (
        <React.Fragment>
            <ListJadwalShift
                actionMode={actionMode}
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
            />
            <DetailJadwalShift
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

export default IndexJadwalShift;