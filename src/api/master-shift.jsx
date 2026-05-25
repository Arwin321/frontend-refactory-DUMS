import { SendRequest } from '../components/Global/ApiRequest';

const getAllShift = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `shift?${queryParams.toString()}`,
    });

    return response.data;
};

const getShiftById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `shift/${id}`,
    });

    return response.data;
};

const createShift = async (queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `shift`,
        params: queryParams,
    });

    return response.data;
};

const updateShift = async (id, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `shift/${id}`,
        params: queryParams,
    });

    return response.data;
};

const deleteShift = async (id) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `shift/${id}`,
    });

    return response.data;
};

export { getAllShift, getShiftById, createShift, updateShift, deleteShift };
