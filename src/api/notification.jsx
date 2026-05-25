import { SendRequest } from '../components/Global/ApiRequest';

const getAllNotification = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `notification?${queryParams.toString()}`,
    });

    return response.data;
};

const getNotificationById = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `notification/${id}`,
    });

    return response.data;
};

const getNotificationDetail = async (id) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `notification/${id}`,
    });

    return response.data;
};

// Create new notification log
const createNotificationLog = async (data) => {
    const response = await SendRequest({
        method: 'post',
        prefix: 'notification-log',
        params: data,
    });
    return response.data;
};

// Get notification logs by notification_error_id
const getNotificationLogByNotificationId = async (notificationId) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `notification-log/notification_error/${notificationId}`,
    });
    return response.data;
};

// update is_read status
const updateIsRead = async (notificationId) => {
    const response = await SendRequest({
        method: 'put',
        prefix: `notification/${notificationId}`,
    });
    return response.data;
};

// Resend notification to specific user
const resendNotificationToUser = async (notificationId, userId) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `notification/${notificationId}/resend/${userId}`,
    });
    return response.data;
};

// Resend Chat by User
const resendChatByUser = async (notificationId, userPhone) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `notification-user/resend/${notificationId}/${userPhone}`,
    });
    return response.data;
};

// Resend Chat All User
const resendChatAllUser = async (notificationId) => {
    const response = await SendRequest({
        method: 'post',
        prefix: `notification/resend/${notificationId}`,
    });
    return response.data;
};

// Searching
const searchData = async (queryParams) => {
    const response = await SendRequest({
        method: 'get',
        prefix: `notification?criteria=${queryParams}`,
    });
    return response.data;
};

export {
    getAllNotification,
    getNotificationById,
    getNotificationDetail,
    createNotificationLog,
    getNotificationLogByNotificationId,
    updateIsRead,
    resendNotificationToUser,
    resendChatByUser,
    resendChatAllUser,
    searchData,
};
