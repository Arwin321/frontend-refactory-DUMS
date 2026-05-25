import { SendRequest } from '../components/Global/ApiRequest';

const getAllStatuss = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `status?${queryParams.toString()}`,
    });

    return response.data;
};

const getStatusById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `status/${id}`,
    });

    return response.data;
};

const createStatus = async (queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `status`,
        params: queryParams,
    });

    return response.data;
};

const updateStatus = async (id, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `status/${id}`,
        params: queryParams,
    });

    return response.data;
};

const deleteStatus = async (id) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `status/${id}`,
    });

    return response.data;
};

export { getAllStatuss, getStatusById, createStatus, updateStatus, deleteStatus };
