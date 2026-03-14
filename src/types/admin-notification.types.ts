import type { INotification } from "../shared/models/notification-model";

export interface NotiPaginationType {
    page: number;
    total: number;
    totalPages: number;
    limit: number;
}

export interface IAdminNotificationInitialState {
    notifications: (INotification & { readed: boolean })[];
    pagiantion: NotiPaginationType;
    newNotification: INotification;
    countUnread: number;
    isloading: boolean;
    error: boolean;
}
