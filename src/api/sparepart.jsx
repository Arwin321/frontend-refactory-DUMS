import { SendRequest } from '../components/Global/ApiRequest';

const getAllSparepart = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `sparepart?${queryParams.toString()}`,
    });

    return response.data;
};

const getSparepartById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `sparepart/${id}`,
    });

    return response.data;
};

const createSparepart = async (queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `sparepart`,
        params: queryParams,
    });

    return response.data;
};

const updateSparepart = async (id, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `sparepart/${id}`,
        params: queryParams,
    });

    return response.data;
};

const deleteSparepart = async (id) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `sparepart/${id}`,
    });

    return response.data;
};

export { getAllSparepart, getSparepartById, createSparepart, updateSparepart, deleteSparepart };