"use client";

import React, { useState } from "react";
import {
  DesktopOutlined,
  SettingOutlined,
  ToolOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, Drawer } from "antd";
import { useRouter } from "next/navigation";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import Image from "next/image";

const { Sider } = Layout;

const SideNav: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
    if (isMobile) setMobileOpen(false);
  };

  const items = [
    {
      key: "/dashboard",
      icon: <DesktopOutlined />,
      label: <span>Inicio</span>,
    },
    {
      key: "sub-servicios",
      icon: <ToolOutlined />,
      label: "Servicios",
      children: [
        {
          key: "/dashboard/equipos",
          label: "Equipos",
        },
        {
          key: "/dashboard/mantenimientos",
          label: "Mantenimientos",
        },
      ],
    },
    {
      key: "/dashboard/settings",
      icon: <SettingOutlined />,
      label: <span>Configuración</span>,
    },
  ];

  if (isMobile) {
    return (
      <>
        <Button
          type="primary"
          icon={mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ position: "fixed", top: 16, left: 16, zIndex: 1000 }}
        />
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setMobileOpen(false)}
          open={mobileOpen}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            theme="dark"
            mode="inline"
            onClick={handleMenuClick}
            defaultSelectedKeys={["/dashboard"]}
            items={items}
          />
        </Drawer>
      </>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      style={{
        height: "100vh",
        backgroundColor: "#001529",
        position: "sticky",
        top: 0,
        left: 0,
        overflow: "auto",
      }}
    >
      <div
        style={{
          height: 64,
          margin: 16,
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: 6,
        }}
      >
        <Image src="../public/logo_oscuro.png" alt="logo" />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        onClick={handleMenuClick}
        defaultSelectedKeys={["/dashboard"]}
        items={items}
      />
    </Sider>
  );
};

export default SideNav;
