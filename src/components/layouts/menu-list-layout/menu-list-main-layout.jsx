import { Outlet } from "react-router-dom";
import { HeaderHome } from "../home-layout/header-home";
import { FooterHome } from "../home-layout/footer-home";

export const MenuListMainLayout = () => {
    return (
        <>
            <HeaderHome />
            <Outlet />
            <FooterHome/>
        </>
    );
};