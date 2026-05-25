import { SendRequest } from '../components/Global/ApiRequest';

const getAllDevice = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `device?${queryParams.toString()}`,
    });

    return response.data;
};

const getDeviceById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `device/${id}`,
    });

    return response.data;
};

const createDevice = async (queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `device`,
        params: queryParams,
    });

    return response.data;
};

const updateDevice = async (id, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `device/${id}`,
        params: queryParams,
    });

    return response.data;
};

const deleteDevice = async (id) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `device/${id}`,
    });

    return response.data;
};

export { getAllDevice, getDeviceById, createDevice, updateDevice, deleteDevice };
