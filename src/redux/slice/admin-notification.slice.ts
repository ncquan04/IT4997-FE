import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
    IAdminNotificationInitialState,
    NotiPaginationType,
} from "../../types/admin-notification.types";
import type { INotification } from "../../shared/models/notification-model";
import adminNotification from "../async-thunk/admin-notification.thunk";

const initialState: IAdminNotificationInitialState = {
    notifications: [],
    newNotification: {
        _id: "",
        notificationType: "",
        title: "",
        message: "",
        referenceId: "",
        userId: "",
        readBy: [],
    },
    countUnread: 0,
    pagiantion: {
        page: 1,
        total: 0,
        totalPages: 0,
        limit: 10,
    },
    error: false,
    isloading: false,
};

const adminNotificationSlice = createSlice({
    name: "admin-notification",
    initialState,
    reducers: {
        setNewNotification: (state, action: PayloadAction<INotification>) => {
            state.newNotification = action.payload;
        },
        setReadedNoti: (state, action: PayloadAction<string>) => {
            const noti = state.notifications.find((e) => e._id === action.payload);

            if (noti) {
                noti.readed = true;
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(adminNotification.fetchNotifications.pending, (state) => {
            state.error = false;
            state.isloading = true;
        });
        builder.addCase(
            adminNotification.fetchNotifications.fulfilled,
            (
                state,
                action: PayloadAction<{
                    data: (INotification & { readed: boolean })[];
                    pagination: NotiPaginationType;
                }>,
            ) => {
                if (action.payload.pagination.page === 1) {
                    state.notifications = action.payload.data;
                } else {
                    state.notifications.push(...action.payload.data);
                }
                state.pagiantion = { ...state.pagiantion, ...action.payload.pagination };
                state.error = false;
                state.isloading = false;
            },
        );
        builder.addCase(adminNotification.fetchNotifications.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });

        builder.addCase(adminNotification.countUnread.pending, (state) => {
            state.error = false;
            state.isloading = true;
        });
        builder.addCase(
            adminNotification.countUnread.fulfilled,
            (state, action: PayloadAction<number>) => {
                state.countUnread = action.payload;
                state.error = false;
                state.isloading = false;
            },
        );
        builder.addCase(adminNotification.countUnread.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });

        builder.addCase(adminNotification.sendNotiUnread.pending, (state) => {
            state.error = false;
            state.isloading = true;
        });
        builder.addCase(adminNotification.sendNotiUnread.fulfilled, (state) => {
            state.countUnread--;
            state.error = false;
            state.isloading = false;
        });
        builder.addCase(adminNotification.sendNotiUnread.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });
    },
});

export const { setNewNotification, setReadedNoti } = adminNotificationSlice.actions;
export default adminNotificationSlice.reducer;
