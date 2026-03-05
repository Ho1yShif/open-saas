import axios from "axios";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "./validation";
export async function uploadFileWithProgress({ file, s3UploadUrl, s3UploadFields, setUploadProgressPercent, }) {
    const formData = getFileUploadFormData(file, s3UploadFields);
    return axios.post(s3UploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
                const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                setUploadProgressPercent(percentage);
            }
        },
    });
}
function getFileUploadFormData(file, s3UploadFields) {
    const formData = new FormData();
    Object.entries(s3UploadFields).forEach(([key, value]) => {
        formData.append(key, value);
    });
    formData.append("file", file);
    return formData;
}
export function validateFile(file) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.`);
    }
    if (!isFileWithAllowedFileType(file)) {
        throw new Error(`File type '${file.type}' is not supported.`);
    }
    return file;
}
function isFileWithAllowedFileType(file) {
    return ALLOWED_FILE_TYPES.includes(file.type);
}
//# sourceMappingURL=fileUploading.js.map