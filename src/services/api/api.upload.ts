import { Contacts } from "../../shared/contacts";
import { apiService } from "./api.config";

const API_PATH = Contacts.API_CONFIG;

export const uploadSingleImage = async (formData: FormData) => {
    try {
        const response = await apiService.post<{
            url: string;
            publicId: string;
        }>(API_PATH.UPLOAD.UPLOAD_SINGLE_IMAGE.URL, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response;
    } catch (err) {
        console.log("upload image error: ", err);
        return null;
    }
};
