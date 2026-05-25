import { SendRequest } from '../components/Global/ApiRequest';

const getAllBrands = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `brand?${queryParams.toString()}`,
    });

    return response.data;
};

const getBrandById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `brand/${id}`,
    });

    return response.data;
};

const createBrand = async (queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `brand`,
        params: queryParams,
    });

    return response.data;
};

const updateBrand = async (id, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `brand/${id}`,
        params: queryParams,
    });

    return response.data;
};

const deleteBrand = async (id) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `brand/${id}`,
    });

    return response.data;
};

const getErrorCodesByBrandId = async (brandId, queryParams) => {
    const query = queryParams ? `?${queryParams.toString()}` : '';
    const response = await SendRequest({
        method: 'get',
        prefix: `error-code/brand/${brandId}${query}`,
    });

    return response.data;
};

const getErrorCodeById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `error-code/${id}`,
    });

    return response.data;
};

const createErrorCode = async (brandId, queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `error-code/brand/${brandId}`,
        params: queryParams,
    });

    return response.data;
};

const updateErrorCode = async (brandId, errorCodeId, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `error-code/brand/${brandId}/${errorCodeId}`,
        params: queryParams,
    });

    return response.data;
};

const deleteErrorCode = async (brandId, errorCode) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `error-code/brand/${brandId}/${errorCode}`,
    });

    return response.data;
};

export {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    getErrorCodesByBrandId,
    getErrorCodeById,
    createErrorCode,
    updateErrorCode,
    deleteErrorCode
};
