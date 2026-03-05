import { Outlet } from 'react-router';
import { initializeQueryClient } from '../operations';
import { WaspApp } from './components/WaspApp';
const DefaultRootComponent = () => <Outlet />;
let isAppInitialized = false;
// PRIVATE API (web-app)
export function getWaspApp({ rootElement = <DefaultRootComponent />, routesMapping, }) {
    if (!isAppInitialized) {
        initializeQueryClient();
        isAppInitialized = true;
    }
    return <WaspApp rootElement={rootElement} routesMapping={routesMapping}/>;
}
// PRIVATE API (web-app)
export { createAuthRequiredPage } from './pages/createAuthRequiredPage';
//# sourceMappingURL=index.jsx.map