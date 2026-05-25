import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListContact from './component/ListContact';
import DetailContact from './component/DetailContact';
import { useBreadcrumb } from '../../layout/LayoutBreadcrumb';
import { Typography } from 'antd';

const { Text } = Typography;

const IndexContact = memo(function IndexContact() {
    const navigate = useNavigate();
    const { setBreadcrumbItems } = useBreadcrumb();

    const [actionMode, setActionMode] = useState('list');
    const [selectedData, setSelectedData] = useState(null);
    const [readOnly, setReadOnly] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [contactType, setContactType] = useState('operator');

    const setMode = (param) => {
        setShowModal(param !== 'list');
        setReadOnly(param === 'preview');
        setActionMode(param);
    };

    const handleContactSaved = (contactData, actionMode) => {
        setLastSavedContact({ contactData, actionMode });

        // Clear after processing
        setTimeout(() => setLastSavedContact(null), 100);
    };

    const [lastSavedContact, setLastSavedContact] = useState(null);

    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setBreadcrumbItems([
                { title: <Text strong style={{ fontSize: '14px' }}>• Contact</Text> },
            ]);
        } else {
            navigate('/signin');
        }
    }, [navigate, setBreadcrumbItems]);

    return (
        <React.Fragment>
            <ListContact
                actionMode={actionMode}
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
                lastSavedContact={lastSavedContact}
                setContactType={setContactType}
            />
            <DetailContact
                setActionMode={setMode}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                readOnly={readOnly}
                showModal={showModal}
                actionMode={actionMode}
                onContactSaved={handleContactSaved}
                contactType={contactType}
            />
        </React.Fragment>
    );
});

export default IndexContact;
