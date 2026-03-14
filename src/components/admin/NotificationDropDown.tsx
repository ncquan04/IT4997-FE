import { useEffect, useRef } from "react";
import { NotificationIcon } from "../../icons/NotificationIcons";
import type { INotification } from "../../shared/models/notification-model";
import { useAppDispatch, useAppSelector, type RootState } from "../../redux/store";
import adminNotification from "../../redux/async-thunk/admin-notification.thunk";
import { setReadedNoti } from "../../redux/slice/admin-notification.slice";

type Props = {
    open: boolean;
    onClose: () => void;
};

const NotificationDropdown = ({ open, onClose }: Props) => {
    const dispatch = useAppDispatch();
    const { notifications, pagiantion, isloading } = useAppSelector(
        (state: RootState) => state.adminNotification,
    );
    const ref = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open, onClose]);

    useEffect(() => {
        if (open) {
            dispatch(
                adminNotification.fetchNotifications({
                    page: 1,
                }),
            );
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        if (!listRef.current || !loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !isloading && pagiantion.page < pagiantion.totalPages) {
                    dispatch(
                        adminNotification.fetchNotifications({
                            page: pagiantion.page + 1,
                        }),
                    );
                }
            },
            {
                root: listRef.current,
                threshold: 0.1,
            },
        );

        observer.observe(loadMoreRef.current);

        return () => {
            observer.disconnect();
        };
    }, [open, isloading, pagiantion.page, pagiantion.totalPages]);

    if (!open) return null;

    return (
        <div
            ref={ref}
            className="
                absolute right-[64px] mt-3 w-96
                bg-white rounded-xl
                shadow-[0_10px_30px_rgba(0,0,0,0.15)]
                border border-gray-100 z-50
            "
        >
            {/* Header */}
            <div className="px-4 py-3 font-semibold text-lg border-b border-gray-100">
                Notifications
            </div>
            {notifications.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-600">Notification is empty</div>
            ) : (
                <>
                    {/* List */}
                    <div ref={listRef} className="max-h-[420px] overflow-y-auto">
                        {notifications.map((n, idx) => (
                            <div
                                key={n._id}
                                ref={idx === notifications.length - 1 ? loadMoreRef : null}
                                className={`
                                    flex gap-3 px-4 py-3 cursor-pointer
                                    transition rounded-lg mx-2 my-1
                                    ${
                                        n.readed
                                            ? "hover:bg-gray-100"
                                            : "bg-blue-50 hover:bg-blue-100"
                                    }
                                `}
                                onClick={() => {
                                    if (!n.readed) {
                                        dispatch(
                                            adminNotification.sendNotiUnread({
                                                notificationId: n._id,
                                            }),
                                        );
                                        dispatch(setReadedNoti(n._id));
                                    }
                                }}
                            >
                                {/* Icon */}
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <NotificationIcon />
                                    </div>
                                    {!n.readed && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-sm">
                                    <p className="font-medium text-gray-900">{n.title}</p>
                                    <p className="text-gray-600">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{n.createdAt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {isloading && (
                        <div className="py-2 text-center text-xs text-gray-400">
                            Loading more...
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
