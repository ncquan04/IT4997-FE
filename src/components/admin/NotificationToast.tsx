import { useEffect } from "react";
import type { INotification } from "../../shared/models/notification-model";
import { NotificationIcon } from "../../icons/NotificationIcons";

type Props = {
    notification: INotification | null;
    onClose: () => void;
};

const NotificationToast = ({ notification, onClose }: Props) => {
    useEffect(() => {
        if (!notification) return;

        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [notification, onClose]);

    if (!notification) return null;

    return (
        <div
            className="
                    fixed top-20 right-6 z-50
                    w-80 bg-white border border-gray-100
                    rounded-xl
                    shadow-lg hover:shadow-xl
                    transition-all duration-300
                    animate-slide-in
                "
        >
            <div className="relative flex gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <NotificationIcon />
                </div>

                <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-500 leading-snug">{notification.message}</p>
                </div>

                <button
                    onClick={onClose}
                    className="
                        absolute top-2 right-2
                        w-6 h-6 flex items-center justify-center
                        rounded-full
                        text-gray-400
                        hover:bg-gray-100 hover:text-gray-700
                        transition
                    "
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default NotificationToast;
