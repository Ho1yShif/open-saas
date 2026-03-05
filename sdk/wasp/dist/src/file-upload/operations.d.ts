import { type File } from "wasp/entities";
import { type AddFileToDb, type CreateFileUploadUrl, type DeleteFile, type GetAllFilesByUser, type GetDownloadFileSignedURL } from "wasp/server/operations";
import * as z from "zod";
declare const createFileInputSchema: z.ZodObject<{
    fileType: z.ZodEnum<["image/jpeg", "image/png", "application/pdf", "text/*", "video/quicktime", "video/mp4"]>;
    fileName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fileName: string;
    fileType: "image/jpeg" | "image/png" | "application/pdf" | "text/*" | "video/quicktime" | "video/mp4";
}, {
    fileName: string;
    fileType: "image/jpeg" | "image/png" | "application/pdf" | "text/*" | "video/quicktime" | "video/mp4";
}>;
type CreateFileInput = z.infer<typeof createFileInputSchema>;
export declare const createFileUploadUrl: CreateFileUploadUrl<CreateFileInput, {
    s3UploadUrl: string;
    s3UploadFields: Record<string, string>;
    s3Key: string;
}>;
declare const addFileToDbInputSchema: z.ZodObject<{
    s3Key: z.ZodString;
    fileType: z.ZodEnum<["image/jpeg", "image/png", "application/pdf", "text/*", "video/quicktime", "video/mp4"]>;
    fileName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    s3Key: string;
    fileName: string;
    fileType: "image/jpeg" | "image/png" | "application/pdf" | "text/*" | "video/quicktime" | "video/mp4";
}, {
    s3Key: string;
    fileName: string;
    fileType: "image/jpeg" | "image/png" | "application/pdf" | "text/*" | "video/quicktime" | "video/mp4";
}>;
type AddFileToDbInput = z.infer<typeof addFileToDbInputSchema>;
export declare const addFileToDb: AddFileToDb<AddFileToDbInput, File>;
export declare const getAllFilesByUser: GetAllFilesByUser<void, File[]>;
declare const getDownloadFileSignedURLInputSchema: z.ZodObject<{
    s3Key: z.ZodString;
}, "strip", z.ZodTypeAny, {
    s3Key: string;
}, {
    s3Key: string;
}>;
type GetDownloadFileSignedURLInput = z.infer<typeof getDownloadFileSignedURLInputSchema>;
export declare const getDownloadFileSignedURL: GetDownloadFileSignedURL<GetDownloadFileSignedURLInput, string>;
declare const deleteFileInputSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;
export declare const deleteFile: DeleteFile<DeleteFileInput, File>;
export {};
//# sourceMappingURL=operations.d.ts.map