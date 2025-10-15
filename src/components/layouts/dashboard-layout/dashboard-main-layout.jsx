import { Navigate, Outlet } from "react-router-dom";
import { SidebarLayOut } from "./sidebar-layout";

export const DashboardMainLayout = ({ allowedRoles }) => {
  const role = localStorage.getItem("userRole"); // lấy role từ localStorage

  // Route guard
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="flex">
      <SidebarLayOut role={role} /> {/* truyền role xuống Sidebar */}
      <main className="flex-1 p-4">
        <Outlet /> {/* render các route con */}
      </main>
    </div>
  );
};
