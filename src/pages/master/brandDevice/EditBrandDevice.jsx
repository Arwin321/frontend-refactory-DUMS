import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
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
    Input,
    ConfigProvider
} from 'antd';
import { NotifAlert, NotifOk, NotifConfirmDialog } from '../../../components/Global/ToastNotif';
import { useBreadcrumb } from '../../../layout/LayoutBreadcrumb';
import { getBrandById, updateBrand, getErrorCodesByBrandId, deleteErrorCode, updateErrorCode as updateErrorCodeAPI, createErrorCode as createErrorCodeAPI } from '../../../api/master-brand';
import { getFileUrl } from '../../../api/file-uploads';
import { SendRequest } from '../../../components/Global/ApiRequest';
import BrandForm from './component/BrandForm';
import ErrorCodeForm from './component/ErrorCodeForm';
import SolutionForm from './component/SolutionForm';
import SparepartSelect from './component/SparepartSelect';
import ListErrorCode from './component/ListErrorCode';

const { Title } = Typography;
const { Step } = Steps;

const EditBrandDevice = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { setBreadcrumbItems } = useBreadcrumb();
    const [brandForm] = Form.useForm();
    const [errorCodeForm] = Form.useForm();
    const [solutionForm] = Form.useForm();
    const [errorCodeIcon, setErrorCodeIcon] = useState(null);
    const [selectedSparepartIds, setSelectedSparepartIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const tab = searchParams.get('tab');
    const [currentStep, setCurrentStep] = useState(tab === 'error-codes' ? 1 : 0);
    const [editingErrorCodeKey, setEditingErrorCodeKey] = useState(null);
    const [isErrorCodeFormReadOnly, setIsErrorCodeFormReadOnly] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [apiErrorCodes, setApiErrorCodes] = useState([]);
    const [trigerFilter, setTrigerFilter] = useState(false);
    const [brandInfo, setBrandInfo] = useState({});
    const [tempErrorCodes, setTempErrorCodes] = useState([]);
    const [existingErrorCodes, setExistingErrorCodes] = useState([]);
    const [selectedErrorCode, setSelectedErrorCode] = useState(null);
    const [solutionFields, setSolutionFields] = useState([0]);
    const [solutionTypes, setSolutionTypes] = useState({ 0: 'text' });
    const [solutionStatuses, setSolutionStatuses] = useState({ 0: true });
    const [currentSolutionData, setCurrentSolutionData] = useState([]);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const getSolutionData = () => {
        if (!solutionForm) return [];
        try {
            const values = solutionForm.getFieldsValue(true);
            const solutions = [];

            solutionFields.forEach(fieldKey => {
                let solution = null;

                if (values.solution_items && values.solution_items[fieldKey]) {
                    solution = values.solution_items[fieldKey];
                }

                if (!solution || !solution.name || solution.name.trim() === '') {
                    return;
                }

                const solutionType = solutionTypes[fieldKey] || solution.type || 'text';
                let isValid = true;

                if (solutionType === 'text') {
                    isValid = solution.text && solution.text.trim() !== '';
                } else if (solutionType === 'file') {
                    const hasPathSolution = solution.path_solution && solution.path_solution.trim() !== '';
                    const hasFileUpload = (solution.fileUpload && typeof solution.fileUpload === 'object' && Object.keys(solution.fileUpload).length > 0);
                    const hasFile = (solution.file && typeof solution.file === 'object' && Object.keys(solution.file).length > 0);
                    isValid = hasPathSolution || hasFileUpload || hasFile;
                }

                if (isValid) {
                    solutions.push(solution);
                }
            });

            return solutions;
        } catch (error) {
            return [];
        }
    };

    const resetSolutionFields = () => {
        setSolutionFields([0]);
        setSolutionTypes({ 0: 'text' });
        setSolutionStatuses({ 0: true });

        if (solutionForm && solutionForm.resetFields) {
            solutionForm.resetFields();
            setTimeout(() => {
                solutionForm.setFieldsValue({
                    solution_items: {
                        0: {
                            name: '',
                            type: 'text',
                            text: '',
                            status: true,
                            file: null,
                            fileUpload: null
                        }
                    }
                });
            }, 100);
        }
        setCurrentSolutionData([]);
    };

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

    const handleAddSolutionField = () => {
        const newKey = Math.max(...solutionFields, 0) + 1;
        setSolutionFields(prev => [...prev, newKey]);
        setSolutionTypes(prev => ({ ...prev, [newKey]: 'text' }));
        setSolutionStatuses(prev => ({ ...prev, [newKey]: true }));
    };

    const handleRemoveSolutionField = (fieldKey) => {
        if (solutionFields.length > 1) {
            setSolutionFields(prev => prev.filter(key => key !== fieldKey));
            const newTypes = { ...solutionTypes };
            const newStatuses = { ...solutionStatuses };
            delete newTypes[fieldKey];
            delete newStatuses[fieldKey];
            setSolutionTypes(newTypes);
            setSolutionStatuses(newStatuses);

            const currentValues = solutionForm.getFieldsValue();
            if (currentValues.solution_items && currentValues.solution_items[fieldKey]) {
                delete currentValues.solution_items[fieldKey];
                solutionForm.setFieldsValue(currentValues);
            }
        }
    };

    const handleSolutionTypeChange = (fieldKey, type) => {
        setSolutionTypes(prev => ({ ...prev, [fieldKey]: type }));

        if (type === 'file') {
            solutionForm.setFieldValue(['solution_items', fieldKey, 'text'], '');
        }

        if (type === 'text') {
            solutionForm.setFieldValue(['solution_items', fieldKey, 'file'], null);
            solutionForm.setFieldValue(['solution_items', fieldKey, 'fileUpload'], null);
        }
    };

    const handleSolutionStatusChange = (fieldKey, status) => {
        setSolutionStatuses(prev => ({ ...prev, [fieldKey]: status }));
    };

    useEffect(() => {
        errorCodeForm.setFieldsValue({
            status: true,
        });

        const fetchBrandData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            const tab = searchParams.get('tab') || 'brand';

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
                            Edit Brand Device
                        </span>
                    ),
                },
            ]);

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
                                setExistingErrorCodes(existingCodes);
                                setApiErrorCodes(existingCodes);
                            }
                        } catch (error) {
                        }
                    }

                    setCurrentStep(tab === 'brand' ? 0 : 1);
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
    }, [id, navigate]);

    useEffect(() => {
        const tab = searchParams.get('tab') || 'brand';
        setCurrentStep(tab === 'brand' ? 0 : 1);
    }, [searchParams]);


    useEffect(() => {
        if (currentStep === 1 && id) {
            setTrigerFilter(prev => !prev);
        }
    }, [currentStep, id]);


    useEffect(() => {
        if (location.state?.refreshErrorCodes) {

            setTrigerFilter(prev => !prev);


            const state = { ...location.state };
            delete state.refreshErrorCodes;
            navigate(location.pathname + location.search, {
                replace: true,
                state
            });
        }
    }, [location, navigate]);





    const handleNextStep = async () => {
        try {
            setConfirmLoading(true);

            const brandValues = brandForm.getFieldsValue();

            if (!brandValues.brand_name || brandValues.brand_name.trim() === '') {
                NotifAlert({
                    icon: 'warning',
                    title: 'Perhatian',
                    message: 'Brand Name wajib diisi!',
                });
                return;
            }

            if (!brandValues.brand_manufacture || brandValues.brand_manufacture.trim() === '') {
                NotifAlert({
                    icon: 'warning',
                    title: 'Perhatian',
                    message: 'Manufacturer wajib diisi!',
                });
                return;
            }

            const brandApiData = {
                brand_name: brandValues.brand_name.trim(),
                brand_type: brandValues.brand_type || '',
                brand_manufacture: brandValues.brand_manufacture.trim(),
                brand_model: brandValues.brand_model || '',
                is_active: brandValues.is_active !== undefined ? brandValues.is_active : true
            };

            const response = await updateBrand(id, brandApiData);

            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: 'Brand device berhasil diupdate.',
                });

                const currentBrandId = id;
                if (currentBrandId) {
                    navigate(`/master/brand-device/edit/${currentBrandId}?tab=error-codes`);
                }
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: response?.message || 'Gagal mengupdate brand device',
                });
            }
        } catch (error) {
            NotifAlert({
                icon: 'error',
                title: 'Gagal',
                message: error.message || 'Gagal mengupdate brand device',
            });
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/master/brand-device');
    };



    const handleErrorCodeIconUpload = (iconData) => {
        setErrorCodeIcon(iconData);
    };

    const handleErrorCodeIconRemove = () => {
        setErrorCodeIcon(null);
    };

    const resetErrorCodeForm = () => {
        errorCodeForm.resetFields();
        errorCodeForm.setFieldsValue({
            status: true,
        });
        setErrorCodeIcon(null);
        resetSolutionFields();
        setIsErrorCodeFormReadOnly(false);
        setEditingErrorCodeKey(null);
        setSelectedSparepartIds([]);
        setSelectedErrorCode(null);
    };

    const handleSaveErrorCode = async () => {
        try {
            setConfirmLoading(true);
            const errorCodeValues = await errorCodeForm.validateFields();
            const solutionData = getSolutionData();

            if (!errorCodeValues.error_code || !errorCodeValues.error_code_name) {
                NotifAlert({
                    icon: 'warning',
                    title: 'Perhatian',
                    message: 'Error code dan error name wajib diisi!',
                });
                return;
            }

            // if (!solutionData || solutionData.length === 0) {
            //     NotifAlert({
            //         icon: 'warning',
            //         title: 'Perhatian',
            //         message: 'Setiap error code harus memiliki minimal 1 solution!',
            //     });
            //     return;
            // }

            const formattedSolutions = solutionData.map(solution => {
                const solutionType = solution.type || 'text';

                let typeSolution = solutionType === 'text' ? 'text' : 'image';
                if (solution.file && solution.file.type_solution) {
                    typeSolution = solution.file.type_solution;
                } else if (solution.fileUpload && solution.fileUpload.type_solution) {
                    typeSolution = solution.fileUpload.type_solution;
                }

                const formattedSolution = {
                    solution_name: solution.name,
                    type_solution: typeSolution,
                    is_active: solution.status !== false,
                };

                if (typeSolution === 'text') {
                    formattedSolution.text_solution = solution.text || '';
                    formattedSolution.path_solution = '';
                } else {
                    formattedSolution.text_solution = '';

                    formattedSolution.path_solution = solution.path_solution || solution.file?.uploadPath || solution.fileUpload?.uploadPath || '';
                }

                if (formattedSolution.brand_code_solution_id) {
                    delete formattedSolution.brand_code_solution_id;
                }

                return formattedSolution;
            });

            const payload = {
                error_code: errorCodeValues.error_code,
                error_code_name: errorCodeValues.error_code_name,
                error_code_description: errorCodeValues.error_code_description || '',
                error_code_color: errorCodeValues.error_code_color || '#000000',
                path_icon: errorCodeIcon?.uploadPath || '',
                is_active: errorCodeValues.status === undefined ? true : errorCodeValues.status,
                solution: formattedSolutions,
                spareparts: selectedSparepartIds || []
            };

            let response;

            if (editingErrorCodeKey && editingErrorCodeKey.startsWith('existing_')) {
                const errorCodeId = editingErrorCodeKey.replace('existing_', '');
                response = await updateErrorCodeAPI(id, errorCodeId, payload);
            } else {
                response = await createErrorCodeAPI(id, payload);
            }


            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                NotifOk({
                    icon: 'success',
                    title: 'Berhasil',
                    message: editingErrorCodeKey ? 'Error code berhasil diupdate!' : 'Error code berhasil ditambahkan!',
                });

                setTrigerFilter(prev => !prev);
                resetErrorCodeForm();
            } else {
                NotifAlert({
                    icon: 'error',
                    title: 'Gagal',
                    message: response?.message || 'Gagal menyimpan error code',
                });
            }
        } catch (error) {
            NotifAlert({
                icon: 'warning',
                title: 'Perhatian',
                message: error.message || 'Harap isi semua kolom wajib!',
            });
        } finally {
            setConfirmLoading(false);
        }
    };

    const loadErrorCodeData = (errorCode, isPreview = false) => {
        if (errorCode) {

            const formValues = {
                error_code: errorCode.error_code,
                error_code_name: errorCode.error_code_name,
                error_code_description: errorCode.error_code_description || '',
                error_code_color: errorCode.error_code_color && errorCode.error_code_color !== '' ? errorCode.error_code_color : '#000000',
                status: errorCode.is_active,
            };

            errorCodeForm.setFieldsValue(formValues);

            if (errorCode.path_icon && errorCode.path_icon !== '') {
                const iconData = {
                    name: errorCode.path_icon.split('/').pop(),
                    uploadPath: errorCode.path_icon,
                };
                setErrorCodeIcon(iconData);
            } else {
                setErrorCodeIcon(null);
            }

            setIsErrorCodeFormReadOnly(isPreview);

            const editingKey = errorCode.tempId || `existing_${errorCode.error_code_id}`;
            setEditingErrorCodeKey(editingKey);

        }
    };

    const handleSearch = () => {
        setTrigerFilter((prev) => !prev);
    };

    const handleSearchClear = () => {
        setSearchText('');
        setTrigerFilter((prev) => !prev);
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
                        isEdit={true}
                    />
                </div>
            );
        }

        if (currentStep === 1) {
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
                        loadErrorCodeData(fullErrorCodeData, false);

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
                        loadErrorCodeData(basicErrorCodeData, false);
                        resetSolutionFields();
                        setSelectedSparepartIds([]);
                    }
                } catch (error) {
                    const basicErrorCodeData = {
                        ...errorCode,
                        tempId: `existing_${errorCode.error_code_id}`
                    };
                    loadErrorCodeData(basicErrorCodeData, false);
                }
            };

            const handleAddNew = () => {
                setSelectedErrorCode(null);
                resetErrorCodeForm();
            };

            return (
                <Row gutter={[16, 8]} style={{ minHeight: '70vh' }}>
                    <Col xs={24} md={8} lg={8}>
                        <ListErrorCode
                            brandId={id}
                            selectedErrorCode={selectedErrorCode}
                            onErrorCodeSelect={handleErrorCodeSelect}
                            tempErrorCodes={tempErrorCodes}
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
                        />
                    </Col>

                    <Col xs={24} md={16} lg={16}>
                        <div style={{
                            paddingLeft: '12px'
                        }}>
                            <Card
                                title={
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }}>
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
                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={handleSaveErrorCode}
                                            loading={confirmLoading}
                                            style={{
                                                backgroundColor: '#23A55A',
                                                borderColor: '#23A55A',
                                                borderRadius: '8px',
                                                height: '40px',
                                                padding: '0 24px',
                                                fontWeight: '500',
                                                boxShadow: '0 2px 4px rgba(35, 165, 90, 0.2)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.boxShadow = '0 4px 8px rgba(35, 165, 90, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.boxShadow = '0 2px 4px rgba(35, 165, 90, 0.2)';
                                            }}
                                        >
                                            {editingErrorCodeKey ? 'Update Error Code' : 'Save Error Code'}
                                        </Button>
                                    </div>
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
                                        <ErrorCodeForm
                                            errorCodeForm={errorCodeForm}
                                            isErrorCodeFormReadOnly={isErrorCodeFormReadOnly}
                                            errorCodeIcon={errorCodeIcon}
                                            onErrorCodeIconUpload={handleErrorCodeIconUpload}
                                            onErrorCodeIconRemove={handleErrorCodeIconRemove}
                                            isEdit={editingErrorCodeKey !== null}
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
                                                    onAddSolutionField={handleAddSolutionField}
                                                    onRemoveSolutionField={handleRemoveSolutionField}
                                                    onSolutionTypeChange={handleSolutionTypeChange}
                                                    onSolutionStatusChange={handleSolutionStatusChange}
                                                    onSolutionFileUpload={(fileData) => {
                                                    }}
                                                    onFileView={(fileData) => {
                                                        if (fileData && (fileData.url || fileData.uploadPath)) {
                                                            window.open(fileData.url || fileData.uploadPath, '_blank');
                                                        }
                                                    }}
                                                    isReadOnly={false}
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
                                                        onSparepartChange={setSelectedSparepartIds}
                                                        isReadOnly={isErrorCodeFormReadOnly}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '16px 0 0 0',
                                        borderTop: '1px solid #f0f0f0',
                                        marginTop: '12px'
                                    }}>

                                        {editingErrorCodeKey && (
                                            <Button
                                                size="large"
                                                onClick={() => {
                                                    resetErrorCodeForm();
                                                    resetSolutionFields();
                                                }}
                                                style={{
                                                    backgroundColor: '#fff',
                                                    borderColor: '#d9d9d9',
                                                    color: '#666',
                                                    borderRadius: '8px',
                                                    height: '40px',
                                                    padding: '0 24px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.borderColor = '#ff4d4f';
                                                    e.target.style.color = '#ff4d4f';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.borderColor = '#d9d9d9';
                                                    e.target.style.color = '#666';
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
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
                                onClick={() => navigate(`/master/brand-device/edit/${id}?tab=brand`)}
                                style={{ marginLeft: 8 }}
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
                                loading={confirmLoading}
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
                                onClick={handleCancel}
                                style={{
                                    backgroundColor: '#23A55A',
                                    borderColor: '#23A55A',
                                }}
                            >
                                Done
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </ConfigProvider>
    );
};

export default EditBrandDevice;