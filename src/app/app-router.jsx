import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  AuthLayout,
  HomeMainLayout,
  MenuListMainLayout,
  DetailMainLayout,
  DashboardMainLayout,
  CheckOutMainLayout
  

} from "@/components/layouts";

import {
  HomePage,
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  MenuListPage,
  DetailPage,
  AccountManagement,
  ShopManagement,
  CheckOutPage,
  HistoryPage,
  FavoritePage,
  ProfilePage,
  CartPage,
  
  OrderManagement,
  MenuStockManagement

} from "@/pages";

const router = createBrowserRouter([
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginForm/>,
      },
      {
        path: "register",
        element: <RegisterForm/>,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordForm/>,
      }
    ],
  },
  {
    path: "/",
    element: <HomeMainLayout />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      
    ],
  },
    {
    path: "menu",
    element: <MenuListMainLayout />,
    children: [
      {
        path: "list/:category",
        element: <MenuListPage/>,
      },
      
    ],
  },
  {
    path: "shops",
    element: <DetailMainLayout />,
    children: [
      {
        path: ":shopId",
        element: <DetailPage/>,
      },
      {
        path: "history",
        element: <HistoryPage/>,
      },
      {
        path: "favorite",
        element: <FavoritePage/>,
      },
      {
        path: "profile",
        element: <ProfilePage/>,
      },
      {
        path:"cart",
        element:<CartPage/>,
      }
    ],
  },
  {
    path: "admin",
    element: <DashboardMainLayout allowedRoles={["ADMIN"]} />,
    children: [
      {
        path: "list-acc",
        element: <AccountManagement/>,
      },
      {
        path: "list-shop",
        element: <ShopManagement/>,
      },
    ],
  },
  {
    path: "staff",
    element: <DashboardMainLayout allowedRoles={["SELLER_STAFF"]} />,
    children: [
      {
        path: "list-order",
        element: <OrderManagement/>,
      },
      {
        path: "list-menu-stock",
        element: <MenuStockManagement/>,
      },
    ],
  },
  {
    path: "manager",
    element: <DashboardMainLayout allowedRoles={["MANAGER"]} />,
    children: [
      {
        path: "list-user",
        element: <AccountManagement/>,
      },
    ],
  },
  {
    path: "checkout",
    element: <CheckOutMainLayout />,
    children: [
      {
        path: "",
        element: <CheckOutPage/>,
      },
      {
        path: "product",
        element: <div>Đây là product page</div>,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
