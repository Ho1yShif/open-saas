
import { prisma } from 'wasp/server'
import {
  type UnauthenticatedOperationFor,
  createUnauthenticatedOperation,
  type AuthenticatedOperationFor,
  createAuthenticatedOperation,
} from '../wrappers.js'
import { updateIsUserAdminById as updateIsUserAdminById_ext } from 'wasp/src/user/operations'
import { generateGptResponse as generateGptResponse_ext } from 'wasp/src/demo-ai-app/operations'
import { createTask as createTask_ext } from 'wasp/src/demo-ai-app/operations'
import { deleteTask as deleteTask_ext } from 'wasp/src/demo-ai-app/operations'
import { updateTask as updateTask_ext } from 'wasp/src/demo-ai-app/operations'
import { generateCheckoutSession as generateCheckoutSession_ext } from 'wasp/src/payment/operations'
import { createFileUploadUrl as createFileUploadUrl_ext } from 'wasp/src/file-upload/operations'
import { addFileToDb as addFileToDb_ext } from 'wasp/src/file-upload/operations'
import { deleteFile as deleteFile_ext } from 'wasp/src/file-upload/operations'

// PRIVATE API
export type UpdateIsUserAdminById_ext = typeof updateIsUserAdminById_ext

// PUBLIC API
export const updateIsUserAdminById: AuthenticatedOperationFor<UpdateIsUserAdminById_ext> =
  createAuthenticatedOperation(
    updateIsUserAdminById_ext,
    {
      User: prisma.user,
    },
  )

// PRIVATE API
export type GenerateGptResponse_ext = typeof generateGptResponse_ext

// PUBLIC API
export const generateGptResponse: AuthenticatedOperationFor<GenerateGptResponse_ext> =
  createAuthenticatedOperation(
    generateGptResponse_ext,
    {
      User: prisma.user,
      Task: prisma.task,
      GptResponse: prisma.gptResponse,
    },
  )

// PRIVATE API
export type CreateTask_ext = typeof createTask_ext

// PUBLIC API
export const createTask: AuthenticatedOperationFor<CreateTask_ext> =
  createAuthenticatedOperation(
    createTask_ext,
    {
      Task: prisma.task,
    },
  )

// PRIVATE API
export type DeleteTask_ext = typeof deleteTask_ext

// PUBLIC API
export const deleteTask: AuthenticatedOperationFor<DeleteTask_ext> =
  createAuthenticatedOperation(
    deleteTask_ext,
    {
      Task: prisma.task,
    },
  )

// PRIVATE API
export type UpdateTask_ext = typeof updateTask_ext

// PUBLIC API
export const updateTask: AuthenticatedOperationFor<UpdateTask_ext> =
  createAuthenticatedOperation(
    updateTask_ext,
    {
      Task: prisma.task,
    },
  )

// PRIVATE API
export type GenerateCheckoutSession_ext = typeof generateCheckoutSession_ext

// PUBLIC API
export const generateCheckoutSession: AuthenticatedOperationFor<GenerateCheckoutSession_ext> =
  createAuthenticatedOperation(
    generateCheckoutSession_ext,
    {
      User: prisma.user,
    },
  )

// PRIVATE API
export type CreateFileUploadUrl_ext = typeof createFileUploadUrl_ext

// PUBLIC API
export const createFileUploadUrl: AuthenticatedOperationFor<CreateFileUploadUrl_ext> =
  createAuthenticatedOperation(
    createFileUploadUrl_ext,
    {
      User: prisma.user,
      File: prisma.file,
    },
  )

// PRIVATE API
export type AddFileToDb_ext = typeof addFileToDb_ext

// PUBLIC API
export const addFileToDb: AuthenticatedOperationFor<AddFileToDb_ext> =
  createAuthenticatedOperation(
    addFileToDb_ext,
    {
      User: prisma.user,
      File: prisma.file,
    },
  )

// PRIVATE API
export type DeleteFile_ext = typeof deleteFile_ext

// PUBLIC API
export const deleteFile: AuthenticatedOperationFor<DeleteFile_ext> =
  createAuthenticatedOperation(
    deleteFile_ext,
    {
      User: prisma.user,
      File: prisma.file,
    },
  )
