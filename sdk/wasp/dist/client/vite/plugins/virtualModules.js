import { getIndexTsxContent, getRoutesTsxContent, } from "../virtual-files/index.js";
import { makeVirtualFilesResolver } from "../virtual-files/resolver.js";
const resolveVirtualFiles = makeVirtualFilesResolver([
    { id: "/@wasp/client-entry.tsx", load: getIndexTsxContent },
    { id: "/@wasp/routes.tsx", load: getRoutesTsxContent },
]);
export function waspVirtualModules() {
    let virtualFiles;
    return {
        name: "wasp:virtual-modules",
        enforce: "pre",
        configResolved(config) {
            virtualFiles = resolveVirtualFiles(config.root);
        },
        resolveId: (id) => virtualFiles.ids.get(id),
        load(id) {
            const loader = virtualFiles.loaders.get(id);
            return loader?.();
        },
    };
}
//# sourceMappingURL=virtualModules.js.map