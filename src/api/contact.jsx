import { SendRequest } from '../components/Global/ApiRequest';

const getAllContact = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `contact?${queryParams.toString()}`,
    });

    return response.data;
};

const getContactById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `contact/${id}`,
    });

    return response.data;
};

const createContact = async (queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `contact`,
        params: queryParams,
    });

    return response.data;
};

const updateContact = async (id, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `contact/${id}`,
        params: queryParams,
    });

    return response.data;
};

const deleteContact = async (id) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `contact/${id}`,
    });

    return response.data;
};

export {
    getAllContact,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
};