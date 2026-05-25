import React from 'react';
import { Typography, Divider, Button, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SolutionFieldNew from './SolutionField';

const { Text } = Typography;

const SolutionForm = ({
    solutionForm,
    solutionFields,
    solutionTypes,
    solutionStatuses,
    onAddSolutionField,
    onRemoveSolutionField,
    onSolutionTypeChange,
    onSolutionStatusChange,
    onSolutionFileUpload,
    onFileView,
    fileList,
    isReadOnly = false,
    solutionData = [],
}) => {

    return (
        <div style={{ marginBottom: 0 }}>

            <Form form={solutionForm} layout="vertical">
                <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    paddingRight: '8px'
                }}>
                    {solutionFields.map((field, displayIndex) => (
                        <SolutionFieldNew
                            key={field}
                            fieldKey={field}
                            fieldName={['solution_items', field]}
                            index={displayIndex}
                            solutionType={solutionTypes[field]}
                            solutionStatus={solutionStatuses[field]}
                            onTypeChange={onSolutionTypeChange}
                            onStatusChange={onSolutionStatusChange}
                            onRemove={() => onRemoveSolutionField(field)}
                            onFileUpload={onSolutionFileUpload}
                            onFileView={onFileView}
                            fileList={fileList}
                            isReadOnly={isReadOnly}
                            canRemove={solutionFields.length > 1 && displayIndex > 0}
                            originalSolutionData={solutionData[displayIndex]}
                        />
                    ))}
                </div>

                {!isReadOnly && (
                    <div style={{ marginBottom: 8, marginTop: 12 }}>
                        <Button
                            type="dashed"
                            onClick={onAddSolutionField}
                            icon={<PlusOutlined />}
                            style={{
                                width: '100%',
                                borderColor: '#23A55A',
                                color: '#23A55A',
                                height: '32px',
                                fontSize: '12px'
                            }}
                        >
                            Add sollution
                        </Button>
                    </div>
                )}
            </Form>
        </div>
    );
};

export default SolutionForm;
