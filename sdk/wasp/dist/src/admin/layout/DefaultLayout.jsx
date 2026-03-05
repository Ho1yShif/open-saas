import { useState } from "react";
import { Navigate } from "react-router";
import Header from "./Header";
import Sidebar from "./Sidebar";
const DefaultLayout = ({ children, user }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    if (!user.isAdmin) {
        return <Navigate to="/" replace/>;
    }
    return (<div className="bg-background text-foreground">
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        <div className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user}/>
          <main>
            <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>);
};
export default DefaultLayout;
//# sourceMappingURL=DefaultLayout.jsx.map