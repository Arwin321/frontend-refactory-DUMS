import React, { useState, useEffect } from 'react';
import { Select, Typography, Tag, Spin, Empty, Button } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckOutlined, EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { getAllSparepart } from '../../../../api/sparepart';
import CustomSparepartCard from './CustomSparepartCard';

const { Text, Title } = Typography;
const { Option } = Select;

const SparepartSelect = ({
    selectedSparepartIds = [],
    onSparepartChange,
    isReadOnly = false
}) => {
    const [spareparts, setSpareparts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSpareparts, setSelectedSpareparts] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        fetchSpareparts();
    }, []);

    useEffect(() => {
        if (selectedSparepartIds && selectedSparepartIds.length > 0) {
            const fullSelectedSpareparts = spareparts.filter(sp =>
                selectedSparepartIds.includes(sp.sparepart_id)
            );
            setSelectedSpareparts(fullSelectedSpareparts);
        } else {
            setSelectedSpareparts([]);
        }
    }, [selectedSparepartIds, spareparts]);

    const fetchSpareparts = async (searchQuery = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('limit', '10');

            if (searchQuery && searchQuery.trim() !== '') {
                params.set('criteria', searchQuery.trim());
            }

            const response = await getAllSparepart(params);
            if (response && (response.statusCode === 200 || response.data)) {
                const sparepartData = response.data?.data || response.data || [];
                setSpareparts(sparepartData);
            } else {
                setSpareparts([]);
            }
        } catch (error) {
            setSpareparts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSparepartSelect = (sparepartId) => {
        const selectedSparepart = spareparts.find(sp => sp.sparepart_id === sparepartId);

        if (selectedSparepart) {
            const isAlreadySelected = selectedSpareparts.some(sp => sp.sparepart_id === sparepartId);

            if (!isAlreadySelected) {
                const newSelectedSpareparts = [...selectedSpareparts, selectedSparepart];
                setSelectedSpareparts(newSelectedSpareparts);

                const newSelectedIds = newSelectedSpareparts.map(sp => sp.sparepart_id);
                onSparepartChange(newSelectedIds);
            }
        }
        setDropdownOpen(false);
    };

    const handleSearch = (value) => {
        fetchSpareparts(value);
    };

    const onDropdownOpenChange = (open) => {
        setDropdownOpen(open);
        if (open) {
            fetchSpareparts();
        }
    };

    const handleRemoveSparepart = (sparepartId) => {
        const newSelectedSpareparts = selectedSpareparts.filter(sp => sp.sparepart_id !== sparepartId);
        setSelectedSpareparts(newSelectedSpareparts);

        const newSelectedIds = newSelectedSpareparts.map(sp => sp.sparepart_id);
        onSparepartChange(newSelectedIds);
    };

    const renderSparepartCard = (sparepart, isSelected = false) => {
        const isAlreadySelected = selectedSpareparts.some(sp => sp.sparepart_id === sparepart.sparepart_id);

        return (
            <CustomSparepartCard
                key={sparepart.sparepart_id}
                sparepart={sparepart}
                isSelected={isSelected}
                isReadOnly={isReadOnly}
                showPreview={true}
                showDelete={isAlreadySelected && !isReadOnly}
                onCardClick={!isAlreadySelected && !isReadOnly ? () => handleSparepartSelect(sparepart.sparepart_id) : undefined}
                onDelete={() => handleRemoveSparepart(sparepart.sparepart_id)}
            />
        );
    };

    return (
        <>

            {!isReadOnly && (
                <div style={{
                    marginBottom: 16,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: 'white',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <Select
                        placeholder="search and select sparepart"
                        style={{ width: '100%' }}
                        loading={loading}
                        onSelect={handleSparepartSelect}
                        value={null}
                        showSearch
                        onSearch={handleSearch}
                        filterOption={false}
                        open={dropdownOpen}
                        onOpenChange={onDropdownOpenChange}
                        suffixIcon={<PlusOutlined />}
                    >
                        {spareparts
                            .filter(sparepart => !selectedSpareparts.some(sp => sp.sparepart_id === sparepart.sparepart_id))
                            .slice(0, 10)
                            .map((sparepart) => (
                                <Option key={sparepart.sparepart_id} value={sparepart.sparepart_id}>
                                    <div>
                                        <Text strong>{sparepart.sparepart_name || sparepart.name || 'Unnamed'}</Text>
                                        <Text type="secondary" style={{ marginLeft: 8 }}>
                                            ({sparepart.sparepart_code || 'No code'})
                                        </Text>
                                    </div>
                                </Option>
                            ))}
                    </Select>
                </div>
            )}


            <div>
                {selectedSpareparts.length > 0 ? (
                    <div>
                        <Title level={5} style={{ marginBottom: 16 }}>
                            Selected Spareparts ({selectedSpareparts.length})
                        </Title>
                        <div>
                            {selectedSpareparts.map(sparepart => renderSparepartCard(sparepart, true))}
                        </div>
                    </div>
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No spareparts selected"
                        style={{ margin: '20px 0' }}
                    />
                )}
            </div>
        </>
    );
};

export default SparepartSelect;