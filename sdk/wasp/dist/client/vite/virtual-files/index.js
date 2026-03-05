import fs from "node:fs";
export function getIndexTsxContent() {
    return getFileContentFromRelativePath("./files/index.tsx");
}
export function getRoutesTsxContent() {
    return getFileContentFromRelativePath("./files/routes.tsx");
}
export function getIndexHtmlContent() {
    return getFileContentFromRelativePath("./files/index.html");
}
function getFileContentFromRelativePath(relativePath) {
    return fs.readFileSync(new URL(relativePath, import.meta.url), "utf-8");
}
//# sourceMappingURL=index.js.map