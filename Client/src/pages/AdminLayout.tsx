import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/admin/AdminNavbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <AdminNavbar />

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
