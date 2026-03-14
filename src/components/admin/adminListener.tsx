import { setNewNotification } from "../../redux/slice/admin-notification.slice";
import { useAppDispatch } from "../../redux/store";
import type { INotification } from "../../shared/models/notification-model";
import useSocket from "../../socket/useSocket";

const AdminListenSocket = () => {
    const dispatch = useAppDispatch();

    useSocket({
        namespace: "admin",
        listener: (socket) => {
            socket.on("admin:new-notification", (response: INotification) => {
                try {
                    if (!response) throw new Error("response is empty");
                    dispatch(setNewNotification(response));
                } catch (err) {
                    console.log(err);
                }
            });
        },
    });

    return null;
};
export default AdminListenSocket;
