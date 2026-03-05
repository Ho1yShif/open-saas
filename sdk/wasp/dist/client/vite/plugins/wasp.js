import react from "@vitejs/plugin-react";
import { validateEnv } from "./validateEnv.js";
import { envFile } from "./envFile.js";
import { detectServerImports } from "./detectServerImports.js";
import { waspVirtualModules } from "./virtualModules.js";
import { waspHtmlDev } from "./html/dev.js";
import { waspHtmlBuild } from "./html/build.js";
import { typescriptCheck } from "./typescriptCheck.js";
import { waspConfig } from "./waspConfig.js";
export function wasp(options) {
    return [
        /**
        * Plugins running before core plugins (enforce: 'pre').
        */
        // The `wasp:config` plugin must come first because
        // other plugins may depend on its configuration.
        waspConfig(),
        waspVirtualModules(),
        envFile(),
        detectServerImports(),
        /**
         * Plugins running after core Vite plugins.
         */
        typescriptCheck(),
        waspHtmlDev(),
        waspHtmlBuild(),
        validateEnv(),
        react(options?.reactOptions),
    ];
}
//# sourceMappingURL=wasp.js.map