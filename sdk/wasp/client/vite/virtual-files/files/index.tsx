// @ts-nocheck
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { getWaspApp } from "wasp/client/app";
import { routesMapping } from "/@wasp/routes.tsx"

import App_ext from './src/client/App'



const app = getWaspApp({
  rootElement: <App_ext />,
  routesMapping: routesMapping,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>{app}</React.StrictMode>,
);
