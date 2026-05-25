import { SendRequest } from '../components/Global/ApiRequest';

const getAllRole = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `roles?${queryParams.toString()}`,
    });

    return response.data;
};

const getRoleById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `roles/${id}`,
    });

    return response.data;
};

const createRole = async (queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `roles`,
        params: queryParams,
    });

    return response.data;
};

const updateRole = async (id, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `roles/${id}`,
        params: queryParams,
    });

    return response.data;
};

const deleteRole = async (id) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `roles/${id}`,
    });

    return response.data;
};

export { getAllRole, getRoleById, createRole, updateRole, deleteRole };
