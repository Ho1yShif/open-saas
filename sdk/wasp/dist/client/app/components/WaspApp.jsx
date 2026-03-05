import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getRouter } from '../router/router';
import { queryClientInitialized } from '../../operations/index';
export function WaspApp({ rootElement, routesMapping }) {
    const [queryClient, setQueryClient] = React.useState(null);
    React.useEffect(() => {
        queryClientInitialized.then(setQueryClient);
    }, []);
    if (!queryClient) {
        return null;
    }
    const router = getRouter({
        rootElement,
        routesMapping,
    });
    return (<QueryClientProvider client={queryClient}>
      {router}
    </QueryClientProvider>);
}
//# sourceMappingURL=WaspApp.jsx.map