import { apiService } from "./api.config";
import { Contacts } from "../../shared/contacts";
import type { INotification } from "../../shared/models/notification-model";
import type { NotiPaginationType } from "../../types/admin-notification.types";

const API_PATH = Contacts.API_CONFIG;

export const getNotifications = async ({ page }: { page: number }) => {
    try {
        const params = new URLSearchParams();
        params.append("page", page.toString());

        const response = await apiService.get<{
            data: (INotification & { readed: boolean })[];
            pagination: NotiPaginationType;
        }>(API_PATH.NOTI.GET_ALL.URL + "?" + params.toString());
        return response;
    } catch (err) {
        console.log("get notifications error: ", err);
        return null;
    }
};

export const getCountNotificationUnread = () => {
    try {
        const count = apiService.get<number>(API_PATH.NOTI.COUNT_UNREAD.URL);
        return count;
    } catch (err) {
        console.log("get count unread error: ", err);
        return null;
    }
};

export const putSendNotification = ({ notificationId }: { notificationId: string }) => {
    try {
        const response = apiService.put<boolean>(API_PATH.NOTI.SEND.URL, {
            notificationId,
        });
        return response;
    } catch (err) {
        console.log("put send notification error: ", err);
        return null;
    }
};
