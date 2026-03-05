import { HttpError } from "wasp/server";
import * as z from "zod";
import { ensureArgsSchemaOrThrowHttpError } from "../server/validation";
import { checkFileExistsInS3, deleteFileFromS3, getDownloadFileSignedURLFromS3, getUploadFileSignedURLFromS3, } from "./s3Utils";
import { ALLOWED_FILE_TYPES } from "./validation";
const createFileInputSchema = z.object({
    fileType: z.enum(ALLOWED_FILE_TYPES),
    fileName: z.string().nonempty(),
});
export const createFileUploadUrl = async (rawArgs, context) => {
    if (!context.user) {
        throw new HttpError(401);
    }
    const { fileType, fileName } = ensureArgsSchemaOrThrowHttpError(createFileInputSchema, rawArgs);
    return await getUploadFileSignedURLFromS3({
        fileType,
        fileName,
        userId: context.user.id,
    });
};
const addFileToDbInputSchema = z.object({
    s3Key: z.string(),
    fileType: z.enum(ALLOWED_FILE_TYPES),
    fileName: z.string(),
});
export const addFileToDb = async (args, context) => {
    if (!context.user) {
        throw new HttpError(401);
    }
    const fileExists = await checkFileExistsInS3({ s3Key: args.s3Key });
    if (!fileExists) {
        throw new HttpError(404, "File not found in S3.");
    }
    return context.entities.File.create({
        data: {
            name: args.fileName,
            s3Key: args.s3Key,
            type: args.fileType,
            user: { connect: { id: context.user.id } },
        },
    });
};
export const getAllFilesByUser = async (_args, context) => {
    if (!context.user) {
        throw new HttpError(401);
    }
    return context.entities.File.findMany({
        where: {
            user: {
                id: context.user.id,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
const getDownloadFileSignedURLInputSchema = z.object({
    s3Key: z.string().nonempty(),
});
export const getDownloadFileSignedURL = async (rawArgs, _context) => {
    const { s3Key } = ensureArgsSchemaOrThrowHttpError(getDownloadFileSignedURLInputSchema, rawArgs);
    return await getDownloadFileSignedURLFromS3({ s3Key });
};
const deleteFileInputSchema = z.object({
    id: z.string(),
});
export const deleteFile = async (args, context) => {
    if (!context.user) {
        throw new HttpError(401);
    }
    const deletedFile = await context.entities.File.delete({
        where: {
            id: args.id,
            user: {
                id: context.user.id,
            },
        },
    });
    try {
        await deleteFileFromS3({ s3Key: deletedFile.s3Key });
    }
    catch (error) {
        console.error(`S3 deletion failed. Orphaned file s3Key: ${deletedFile.s3Key}`, error);
    }
    return deletedFile;
};
//# sourceMappingURL=operations.js.map