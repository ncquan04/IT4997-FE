import { createAsyncThunk } from "@reduxjs/toolkit";
import type { INotification } from "../../shared/models/notification-model";
import type { NotiPaginationType } from "../../types/admin-notification.types";
import {
    getCountNotificationUnread,
    getNotifications,
    putSendNotification,
} from "../../services/api/api.admin-notification";

class AdminNotification {
    fetchNotifications = createAsyncThunk<
        {
            data: (INotification & { readed: boolean })[];
            pagination: NotiPaginationType;
        },
        { page: number },
        { rejectValue: any }
    >("admin-noti/fetch-noti", async (payload: { page: number }, { rejectWithValue }) => {
        try {
            const response = await getNotifications({ page: payload.page });
            if (!response) throw new Error("");
            return response;
        } catch (err) {
            return rejectWithValue({
                error: "fetch noti error",
            });
        }
    });
    countUnread = createAsyncThunk<number, void, { rejectValue: any }>(
        "admin-noti/count-unread",
        async (_, { rejectWithValue }) => {
            try {
                const count = await getCountNotificationUnread();
                if (!count) throw new Error("");
                return count;
            } catch (err) {
                return rejectWithValue({
                    error: "count unread error",
                });
            }
        },
    );
    sendNotiUnread = createAsyncThunk<boolean, { notificationId: string }, { rejectValue: any }>(
        "admin-noti/send",
        async (payload: { notificationId: string }, { rejectWithValue }) => {
            try {
                const response = await putSendNotification({
                    notificationId: payload.notificationId,
                });
                if (!response) throw new Error("");
                return response;
            } catch (err) {
                return rejectWithValue({
                    error: "send error",
                });
            }
        },
    );
}

const adminNotification = new AdminNotification();
export default adminNotification;
