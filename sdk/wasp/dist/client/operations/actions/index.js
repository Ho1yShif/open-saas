import { createAction } from './core';
// PUBLIC API
export const updateIsUserAdminById = createAction('operations/update-is-user-admin-by-id', ['User']);
// PUBLIC API
export const generateGptResponse = createAction('operations/generate-gpt-response', ['User', 'Task', 'GptResponse']);
// PUBLIC API
export const createTask = createAction('operations/create-task', ['Task']);
// PUBLIC API
export const deleteTask = createAction('operations/delete-task', ['Task']);
// PUBLIC API
export const updateTask = createAction('operations/update-task', ['Task']);
// PUBLIC API
export const generateCheckoutSession = createAction('operations/generate-checkout-session', ['User']);
// PUBLIC API
export const createFileUploadUrl = createAction('operations/create-file-upload-url', ['User', 'File']);
// PUBLIC API
export const addFileToDb = createAction('operations/add-file-to-db', ['User', 'File']);
// PUBLIC API
export const deleteFile = createAction('operations/delete-file', ['User', 'File']);
//# sourceMappingURL=index.js.map