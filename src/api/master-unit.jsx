import { SendRequest } from '../components/Global/ApiRequest';

const getAllUnit = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `unit?${queryParams.toString()}`,
    });

    return response.data;
};

const getUnitById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `unit/${id}`,
    });

    return response.data;
};

const createUnit = async (queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `unit`,
        params: queryParams,
    });

    return response.data;
};

const updateUnit = async (id, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `unit/${id}`,
        params: queryParams,
    });

    return response.data;
};

const deleteUnit = async (id) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `unit/${id}`,
    });

    return response.data;
};

export { getAllUnit, getUnitById, createUnit, updateUnit, deleteUnit };
