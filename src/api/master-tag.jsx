import { SendRequest } from '../components/Global/ApiRequest';

const getAllTag = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `tags?${queryParams.toString()}`,
    });

    return response.data;
};

const getTagById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `tags/${id}`,
    });

    return response.data;
};

const createTag = async (queryParams) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `tags`,
        params: queryParams,
    });

    return response.data;
};

const updateTag = async (id, queryParams) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `tags/${id}`,
        params: queryParams,
    });

    return response.data;
};

const deleteTag = async (id) => {
    const response = await SendRequest({
        method: 'delete',
        prefix: `tags/${id}`,
    });

    return response.data;
};

export { getAllTag, getTagById, createTag, updateTag, deleteTag };
