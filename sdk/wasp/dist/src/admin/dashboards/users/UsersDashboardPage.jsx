import Breadcrumb from "../../layout/Breadcrumb";
import DefaultLayout from "../../layout/DefaultLayout";
import UsersTable from "./UsersTable";
const Users = ({ user }) => {
    return (<DefaultLayout user={user}>
      <Breadcrumb pageName="Users"/>
      <div className="flex flex-col gap-10">
        <UsersTable />
      </div>
    </DefaultLayout>);
};
export default Users;
//# sourceMappingURL=UsersDashboardPage.jsx.map