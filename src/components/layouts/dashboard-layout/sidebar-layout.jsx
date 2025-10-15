import { NavLink, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Users, Settings, TrendingUp, Package, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const SidebarLayOut = ({ role }) => {
  const navigate = useNavigate();

  const menuItems = [
    { to: "list-acc", label: "Danh Sách Tài Khoản", icon: Home, allowedRoles: ["ADMIN"] },
    { to: "list-shop", label: "Danh Sách Cửa Hàng", icon: ShoppingBag, allowedRoles: ["ADMIN"] },
    { to: "settings", label: "Cài đặt", icon: Settings, allowedRoles: ["ADMIN"] },

    { to: "list-order", label: "Danh Sách Tài Khoản", icon: Home, allowedRoles: ["SELLER_STAFF"] },
    { to: "list-menu-stock", label: "Danh Sách Tài Khoản", icon: Home, allowedRoles: ["SELLER_STAFF"] },
    
    { to: "menu", label: "Thực đơn", icon: Package, allowedRoles: ["MANAGER", "SELLER_STAFF"] },
    { to: "analytics", label: "Thống kê", icon: TrendingUp, allowedRoles: ["MANAGER"] },
    { to: "customers", label: "Khách hàng", icon: Users, allowedRoles: ["MANAGER"] },
  ];

  const filteredMenu = menuItems.filter(item => item.allowedRoles.includes(role));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    navigate("/auth/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-orange-200 min-h-[calc(100vh-73px)] sticky top-[73px] flex flex-col justify-between">
      <nav className="p-4 space-y-2">
        {filteredMenu.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition justify-start ${
                isActive ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
            {badge && (
              <Badge variant="destructive" className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {badge}
              </Badge>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 m-4 rounded-lg text-gray-700 hover:bg-red-500 hover:text-white transition"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Đăng xuất</span>
      </button>
    </aside>
  );
};
