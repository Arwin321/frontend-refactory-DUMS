import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Divider,
    Typography,
    Button,
    Steps,
    Form,
    Row,
    Col,
    Card,
    Spin,
    Tag,
    Space,
    ConfigProvider,
    Empty
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { NotifAlert } from '../../../components/Global/ToastNotif';
import { getBrandById, getErrorCodesByBrandId } from '../../../api/master-brand';
import { getFileUrl, getFolderFromFileType } from '../../../api/file-uploads';
import { SendRequest } from '../../../components/Global/ApiRequest';
import ListErrorCode from './component/ListErrorCode';
import BrandForm from './component/BrandForm';
import ErrorCodeForm from './component/ErrorCodeForm';
import SolutionForm from './component/SolutionForm';
import SparepartSelect from './component/SparepartSelect';

const { Title, Text } = Typography;
const { Step } = Steps;

const ViewBrandDevice = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const { setBreadcrumbItems } = useBreadcrumb();
    const [brandForm] = Form.useForm();
    const [errorCodeForm] = Form.useForm();
    const [solutionForm] = Form.useForm();

    const [brandData, setBrandData] = useState(null);
    const [errorCodes, setErrorCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedErrorCode, setSelectedErrorCode] = useState(null);
    const [selectedSparepartIds, setSelectedSparepartIds] = useState([]);
    const [errorCodeIcon, setErrorCodeIcon] = useState(null);
    const [trigerFilter, setTrigerFilter] = useState(false);
    const [searchText, setSearchText] = useState('');


    const [solutionFields, setSolutionFields] = useState([0]);
    const [solutionTypes, setSolutionTypes] = useState({ 0: 'text' });
    const [solutionStatuses, setSolutionStatuses] = useState({ 0: true });
    const [currentSolutionData, setCurrentSolutionData] = useState([]);


    const [brandInfo, setBrandInfo] = useState({});

    const resetSolutionFields = () => {
        if (solutionForm && solutionForm.resetFields) {
            solutionForm.resetFields();
            solutionForm.setFieldsValue({
                solution_items: {
                    0: {
                        name: '',
                        type: 'text',
                        text: '',
                        status: true
                    }
                }
            });
        }
        setCurrentSolutionData([]);
    };

    const getSolutionData = () => {
        if (!solutionForm) return [];
        try {
            const values = solutionForm.getFieldsValue(true);

            let solutions = [];

            if (values.solution_items) {
                if (Array.isArray(values.solution_items)) {
                    solutions = values.solution_items.filter(Boolean);
                } else if (typeof values.solution_items === 'object') {
                    solutions = Object.values(values.solution_items).filter(Boolean);
                }
            }

            return solutions;
        } catch (error) {
            return [];
        }
    };


    useEffect(() => {
        const savedPhase = location.state?.phase || localStorage.getItem(`brand_device_${id}_last_phase`);
        if (savedPhase) {
            setCurrentStep(parseInt(savedPhase));
            localStorage.removeItem(`brand_device_${id}_last_phase`);
        }
    }, [location.state, id]);


    useEffect(() => {
        setBreadcrumbItems([
            {
                title: <span style={{ fontSize: '14px', fontWeight: 'bold' }}>• Master</span>
            },
            {
                title: (
                    <span
                        style={{ fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => navigate('/master/brand-device')}
                    >
                        Brand Device
                    </span>
                ),
            },
            {
                title: (
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        View Brand Device
                    </span>
                ),
            },
        ]);
    }, [setBreadcrumbItems, navigate]);

    useEffect(() => {
        const fetchBrandData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            try {
                setLoading(true);
                const response = await getBrandById(id);

                if (response && response.statusCode === 200) {
                    const brandData = response.data;

                    const brandInfoData = {
                        brand_code: brandData.brand_code,
                        brand_name: brandData.brand_name,
                        brand_type: brandData.brand_type || '',
                        brand_manufacture: brandData.brand_manufacture || '',
                        brand_model: brandData.brand_model || '',
                        is_active: brandData.is_active
                    };

                    setBrandInfo(brandInfoData);
                    setBrandData(brandData);
                    brandForm.setFieldsValue(brandInfoData);

                    if (brandData.brand_id) {
                        try {
                            const errorCodesResponse = await getErrorCodesByBrandId(id || brandData.brand_id);
                            if (errorCodesResponse && errorCodesResponse.statusCode === 200) {
                                const apiErrorData = errorCodesResponse.data || [];
                                const existingCodes = apiErrorData.map(ec => ({
                                    ...ec,
                                    tempId: `existing_${ec.error_code_id}`,
                                    status: 'existing',
                                    solution: ec.solution || [],
                                    spareparts: ec.spareparts || []
                                }));
                                setErrorCodes(existingCodes);
                            }
                        } catch (error) {
                        }
                    }
                } else {
                    NotifAlert({
                        icon: 'error',
                        title: 'Error',
                        message: response?.message || 'Failed to fetch brand device data',
                    });
                }
            } catch (error) {
                NotifAlert({
                    icon: 'error',
                    title: 'Error',
                    message: error.message || 'Failed to fetch brand device data',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchBrandData();
    }, [id, navigate, brandForm]);

    useEffect(() => {
        if (currentStep === 1 && id) {
            setTrigerFilter(prev => !prev);
        }
    }, [currentStep, id]);


    useEffect(() => {
        if (currentStep === 1 && errorCodes.length > 0 && !selectedErrorCode) {
            handleErrorCodeSelect(errorCodes[0]);
        }
    }, [currentStep, errorCodes]);

    const setSolutionsForExistingRecord = (solutions, targetForm) => {

        if (!targetForm || !solutions || solutions.length === 0) {
            return;
        }

        targetForm.resetFields();

        const solutionItems = {};
        const newSolutionFields = [];
        const newSolutionTypes = {};
        const newSolutionStatuses = {};

        solutions.forEach((solution, index) => {
            const fieldKey = index;
            newSolutionFields.push(fieldKey);

            const isFileType = solution.type_solution && solution.type_solution !== 'text';
            newSolutionTypes[fieldKey] = isFileType ? 'file' : 'text';
            newSolutionStatuses[fieldKey] = solution.is_active;

            let fileObject = null;
            if (isFileType && (solution.path_solution || solution.path_document)) {
                fileObject = {
                    uploadPath: solution.path_solution || solution.path_document,
                    path_solution: solution.path_solution || solution.path_document,
                    name: solution.file_upload_name || (solution.path_solution || solution.path_document).split('/').pop() || 'File',
                    type_solution: solution.type_solution,
                    isExisting: true,
                    size: 0,
                    url: solution.path_solution || solution.path_document
                };
            }

            solutionItems[fieldKey] = {
                brand_code_solution_id: solution.brand_code_solution_id,
                name: solution.solution_name || '',
                type: isFileType ? 'file' : 'text',
                text: solution.text_solution || '',
                status: solution.is_active,
                file: fileObject,
                fileUpload: fileObject,
                path_solution: solution.path_solution || solution.path_document || null,
                fileName: solution.file_upload_name || null
            };
        });

        setSolutionFields(newSolutionFields);
        setSolutionTypes(newSolutionTypes);
        setSolutionStatuses(newSolutionStatuses);

        targetForm.resetFields();

        setTimeout(() => {
            targetForm.setFieldsValue({
                solution_items: solutionItems
            });

            setTimeout(() => {
                Object.keys(solutionItems).forEach(key => {
                    const solution = solutionItems[key];
                    targetForm.setFieldValue(['solution_items', key, 'name'], solution.name);
                    targetForm.setFieldValue(['solution_items', key, 'type'], solution.type);
                    targetForm.setFieldValue(['solution_items', key, 'text'], solution.text);
                    targetForm.setFieldValue(['solution_items', key, 'file'], solution.file);
                    targetForm.setFieldValue(['solution_items', key, 'fileUpload'], solution.fileUpload);
                    targetForm.setFieldValue(['solution_items', key, 'status'], solution.status);
                    targetForm.setFieldValue(['solution_items', key, 'path_solution'], solution.path_solution);
                    targetForm.setFieldValue(['solution_items', key, 'fileName'], solution.fileName);
                });

                const finalValues = targetForm.getFieldsValue();
            }, 100);
        }, 100);
    };

    const handleErrorCodeSelect = async (errorCode) => {

        setSelectedErrorCode(errorCode);

        try {

            const directResponse = await SendRequest({
                method: 'get',
                prefix: `error-code/${errorCode.error_code_id}`,
            });

            const apiResponse = directResponse.data;

            if (apiResponse && apiResponse.statusCode === 200 && apiResponse.data) {
                const fullErrorCodeData = {
                    ...apiResponse.data,
                    tempId: `existing_${apiResponse.data.error_code_id}`
                };

                const formValues = {
                    error_code: fullErrorCodeData.error_code,
                    error_code_name: fullErrorCodeData.error_code_name,
                    error_code_description: fullErrorCodeData.error_code_description || '',
                    error_code_color: fullErrorCodeData.error_code_color && fullErrorCodeData.error_code_color !== '' ? fullErrorCodeData.error_code_color : '#000000',
                    status: fullErrorCodeData.is_active,
                };

                errorCodeForm.setFieldsValue(formValues);

                if (fullErrorCodeData.path_icon && fullErrorCodeData.path_icon !== '') {
                    const iconData = {
                        name: fullErrorCodeData.path_icon.split('/').pop(),
                        uploadPath: fullErrorCodeData.path_icon,
                    };
                    setErrorCodeIcon(iconData);
                } else {
                    setErrorCodeIcon(null);
                }

                if (apiResponse.data.solution && apiResponse.data.solution.length > 0) {
                    setCurrentSolutionData(apiResponse.data.solution);
                    setSolutionsForExistingRecord(apiResponse.data.solution, solutionForm);
                }

                if (apiResponse.data.spareparts && apiResponse.data.spareparts.length > 0) {
                    setSelectedSparepartIds(apiResponse.data.spareparts.map(sp => sp.sparepart_id));
                } else {
                    setSelectedSparepartIds([]);
                }
            } else {
                const basicErrorCodeData = {
                    ...errorCode,
                    tempId: `existing_${errorCode.error_code_id}`
                };

                const formValues = {
                    error_code: basicErrorCodeData.error_code,
                    error_code_name: basicErrorCodeData.error_code_name,
                    error_code_description: basicErrorCodeData.error_code_description || '',
                    error_code_color: basicErrorCodeData.error_code_color && basicErrorCodeData.error_code_color !== '' ? basicErrorCodeData.error_code_color : '#000000',
                    status: basicErrorCodeData.is_active,
                };

                errorCodeForm.setFieldsValue(formValues);

                if (basicErrorCodeData.path_icon && basicErrorCodeData.path_icon !== '') {
                    const iconData = {
                        name: basicErrorCodeData.path_icon.split('/').pop(),
                        uploadPath: basicErrorCodeData.path_icon,
                    };
                    setErrorCodeIcon(iconData);
                } else {
                    setErrorCodeIcon(null);
                }

                resetSolutionFields();
                setSelectedSparepartIds([]);
            }
        } catch (error) {
            const basicErrorCodeData = {
                ...errorCode,
                tempId: `existing_${errorCode.error_code_id}`
            };

            const formValues = {
                error_code: basicErrorCodeData.error_code,
                error_code_name: basicErrorCodeData.error_code_name,
                error_code_description: basicErrorCodeData.error_code_description || '',
                error_code_color: basicErrorCodeData.error_code_color && basicErrorCodeData.error_code_color !== '' ? basicErrorCodeData.error_code_color : '#000000',
                status: basicErrorCodeData.is_active,
            };

            errorCodeForm.setFieldsValue(formValues);

            if (basicErrorCodeData.path_icon && basicErrorCodeData.path_icon !== '') {
                const iconData = {
                    name: basicErrorCodeData.path_icon.split('/').pop(),
                    uploadPath: basicErrorCodeData.path_icon,
                };
                setErrorCodeIcon(iconData);
            } else {
                setErrorCodeIcon(null);
            }

            resetSolutionFields();
            setSelectedSparepartIds([]);
        }
    };

    const handleBrandFormValuesChange = useCallback((changedValues, allValues) => {
        setBrandInfo(allValues);
    }, [setBrandInfo]);

    const handleSearch = () => {
        setTrigerFilter((prev) => !prev);
    };

    const handleSearchClear = () => {
        setSearchText('');
        setTrigerFilter((prev) => !prev);
    };

    const handleFileView = (fileName) => {
        try {
            let fileUrl = '';
            let actualFileName = '';

            const filePath = fileName || '';
            if (filePath) {
                actualFileName = filePath.split('/').pop();
            }

            if (actualFileName) {
                const fileExtension = actualFileName.split('.').pop()?.toLowerCase();
                const folder = getFolderFromFileType(fileExtension);
                fileUrl = getFileUrl(folder, actualFileName);
            }

            if (!fileUrl && filePath) {
                fileUrl = filePath.startsWith('http') ? filePath : `${import.meta.env.VITE_API_SERVER}/${filePath}`;
            }

            if (fileUrl && actualFileName) {
                const fileExtension = actualFileName.split('.').pop()?.toLowerCase();
                const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
                const pdfExtensions = ['pdf'];

                if (imageExtensions.includes(fileExtension) || pdfExtensions.includes(fileExtension)) {
                    const viewerUrl = `/image-viewer/${encodeURIComponent(actualFileName)}`;
                    window.open(viewerUrl, '_blank', 'noopener,noreferrer');
                } else {
                    window.open(fileUrl, '_blank', 'noopener,noreferrer');
                }
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Error',
                    message: 'File URL not found'
                });
            }
        } catch (error) {
            NotifAlert({
                icon: 'error',
                title: 'Error',
                message: 'Failed to open file preview'
            });
        }
    };

    const handleNextStep = () => {
        setCurrentStep(1);
    };

    const renderStepContent = () => {
        if (currentStep === 0) {
            return (
                <div style={{ position: 'relative' }}>
                    {loading && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 10,
                                borderRadius: '8px',
                            }}
                        >
                            <Spin size="large" />
                        </div>
                    )}
                    <BrandForm
                        form={brandForm}
                        onValuesChange={handleBrandFormValuesChange}
                        isEdit={false}
                        readOnly={true}
                    />
                </div>
            );
        }

        if (currentStep === 1) {
            return (
                <Row gutter={[16, 8]} style={{ minHeight: '70vh' }}>
                    <Col xs={24} md={8} lg={8}>
                        <ListErrorCode
                            brandId={id}
                            selectedErrorCode={selectedErrorCode}
                            onErrorCodeSelect={handleErrorCodeSelect}
                            tempErrorCodes={[]}
                            trigerFilter={trigerFilter}
                            searchText={searchText}
                            onSearchChange={(value) => {
                                setSearchText(value);
                                if (value === '') {
                                    setTrigerFilter((prev) => !prev);
                                }
                            }}
                            onSearch={handleSearch}
                            onSearchClear={handleSearchClear}
                            isReadOnly={true}
                        />
                    </Col>

                    <Col xs={24} md={16} lg={16}>
                        <div style={{
                            paddingLeft: '12px'
                        }}>
                            {selectedErrorCode ? (
                                <Card
                                    title={
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#262626',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{
                                                width: '4px',
                                                height: '20px',
                                                backgroundColor: '#23A55A',
                                                borderRadius: '2px'
                                            }}></span>
                                            Error Code Form
                                        </span>
                                    }
                                    style={{
                                        width: '100%',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        borderRadius: '12px'
                                    }}
                                    styles={{
                                        body: { padding: '16px 24px 12px 24px' },
                                        header: {
                                            padding: '16px 24px',
                                            borderBottom: '1px solid #f0f0f0',
                                            backgroundColor: '#fafafa'
                                        }
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{
                                            padding: '16px',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '10px',
                                            backgroundColor: '#ffffff',
                                            marginBottom: '0',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '12px',
                                                paddingBottom: '8px',
                                                borderBottom: '1px solid #f5f5f5'
                                            }}>
                                                <div style={{
                                                    width: '3px',
                                                    height: '16px',
                                                    backgroundColor: '#23A55A',
                                                    borderRadius: '2px'
                                                }}></div>
                                                <h4 style={{ margin: 0, color: '#262626', fontSize: '14px', fontWeight: '600' }}>
                                                    Error Code Details
                                                </h4>
                                            </div>
                                            <ErrorCodeForm
                                                errorCodeForm={errorCodeForm}
                                                isErrorCodeFormReadOnly={true}
                                                errorCodeIcon={errorCodeIcon}
                                                onErrorCodeIconUpload={() => { }}
                                                onErrorCodeIconRemove={() => { }}
                                                isEdit={true}
                                            />
                                        </div>

                                        <Row gutter={[20, 0]} style={{ marginTop: '0' }}>
                                            <Col xs={24} md={12} lg={12}>
                                                <div style={{
                                                    padding: '16px',
                                                    border: '1px solid #f0f0f0',
                                                    borderRadius: '10px',
                                                    backgroundColor: '#ffffff',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '12px',
                                                        paddingBottom: '8px',
                                                        borderBottom: '1px solid #f5f5f5'
                                                    }}>
                                                        <div style={{
                                                            width: '3px',
                                                            height: '16px',
                                                            backgroundColor: '#1890ff',
                                                            borderRadius: '2px'
                                                        }}></div>
                                                        <h4 style={{ margin: 0, color: '#262626', fontSize: '14px', fontWeight: '600' }}>
                                                            Solution
                                                        </h4>
                                                    </div>
                                                    <SolutionForm
                                                        solutionForm={solutionForm}
                                                        solutionFields={solutionFields}
                                                        solutionTypes={solutionTypes}
                                                        solutionStatuses={solutionStatuses}
                                                        onAddSolutionField={() => { }}
                                                        onRemoveSolutionField={() => { }}
                                                        onSolutionTypeChange={() => { }}
                                                        onSolutionStatusChange={() => { }}
                                                        onSolutionFileUpload={() => { }}
                                                        onFileView={(fileData) => {
                                                            if (fileData && (fileData.url || fileData.uploadPath)) {
                                                                window.open(fileData.url || fileData.uploadPath, '_blank');
                                                            }
                                                        }}
                                                        isReadOnly={true}
                                                        solutionData={currentSolutionData}
                                                    />
                                                </div>
                                            </Col>
                                            <Col xs={24} md={12} lg={12}>
                                                <div style={{
                                                    padding: '16px',
                                                    border: '1px solid #f0f0f0',
                                                    borderRadius: '10px',
                                                    backgroundColor: '#ffffff',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '12px',
                                                        paddingBottom: '8px',
                                                        borderBottom: '1px solid #f5f5f5'
                                                    }}>
                                                        <div style={{
                                                            width: '3px',
                                                            height: '16px',
                                                            backgroundColor: '#faad14',
                                                            borderRadius: '2px'
                                                        }}></div>
                                                        <h4 style={{ margin: 0, color: '#262626', fontSize: '14px', fontWeight: '600' }}>
                                                            Sparepart Selection
                                                        </h4>
                                                    </div>
                                                    <div style={{
                                                        maxHeight: '45vh',
                                                        overflow: 'auto',
                                                        border: '1px solid #e8e8e8',
                                                        borderRadius: '8px',
                                                        padding: '12px',
                                                        backgroundColor: '#fafafa'
                                                    }}>
                                                        <SparepartSelect
                                                            selectedSparepartIds={selectedSparepartIds}
                                                            onSparepartChange={() => { }}
                                                            isReadOnly={true}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </Card>
                            ) : (
                                <div style={{
                                    height: '100%', display: 'flex', flexDirection: 'column',
                                    justifyContent: 'center', alignItems: 'center',
                                    backgroundColor: '#ffffff', borderRadius: '12px',
                                    border: '1px dashed #d9d9d9', color: '#8c8c8c', padding: '48px'
                                }}>
                                    <Empty description="Select an error code to view details" />
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            );
        }
        return null;
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Switch: {
                        colorPrimary: '#23A55A',
                        colorPrimaryHover: '#23A55A',
                    },
                },
            }}
        >
            <Card>
                <Steps current={currentStep} style={{ marginBottom: 24 }}>
                    <Step title="Brand Device Details" />
                    <Step title="Error Codes & Solutions" />
                </Steps>
                {renderStepContent()}
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        {currentStep === 1 && (
                            <Button
                                onClick={() => setCurrentStep(0)}
                            >
                                Back to Brand Info
                            </Button>
                        )}
                    </div>
                    <div>
                        {currentStep === 0 && (
                            <Button
                                type="primary"
                                onClick={handleNextStep}
                                style={{
                                    backgroundColor: '#23A55A',
                                    borderColor: '#23A55A',
                                }}
                            >
                                Error Code
                            </Button>
                        )}
                        {currentStep === 1 && (
                            <Button
                                type="primary"
                                onClick={() => navigate('/master/brand-device')}
                                style={{
                                    backgroundColor: '#23A55A',
                                    borderColor: '#23A55A',
                                }}
                            >
                                Selesai
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </ConfigProvider>
    );
};

export default ViewBrandDevice;