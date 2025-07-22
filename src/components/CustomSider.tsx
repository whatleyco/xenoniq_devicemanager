import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router";
import { useGetIdentity, useLogout, useActiveAuthProvider } from "@refinedev/core";
import { 
  DatabaseOutlined, 
  ShoppingCartOutlined, 
  TabletOutlined, 
  DashboardOutlined,
  LogoutOutlined 
} from "@ant-design/icons";

const { Sider } = Layout;

export const CustomSider: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: identity } = useGetIdentity();
  const authProvider = useActiveAuthProvider();
  const { mutate: logout } = useLogout({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  const menuItems = React.useMemo(() => {
    const items = [
      {
        key: "/",
        icon: <DashboardOutlined />,
        label: "Dashboard",
        onClick: () => navigate("/"),
      },
      {
        key: "/serial-manifest",
        icon: <DatabaseOutlined />,
        label: "Serial Manifest",
        onClick: () => navigate("/serial-manifest"),
      },
      {
        key: "/orders",
        icon: <ShoppingCartOutlined />,
        label: "Orders",
        onClick: () => navigate("/orders"),
      },
      {
        key: "/devices",
        icon: <TabletOutlined />,
        label: "Devices",
        onClick: () => navigate("/devices"),
      },
    ];

    // Add logout item if user is authenticated
    if (identity) {
      items.push({
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        onClick: () => logout(),
      });
    }

    return items;
  }, [navigate, identity, logout]);

  // Determine selected key based on current path
  const selectedKey = React.useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/serial-manifest")) return "/serial-manifest";
    if (path.startsWith("/orders")) return "/orders";
    if (path.startsWith("/devices")) return "/devices";
    return "/";
  }, [location.pathname]);

  // Set margin for main content based on collapsed state
  React.useEffect(() => {
    const mainLayout1 = document.getElementById('main-layout');
    const mainLayout2 = document.getElementById('main-layout-2');
    const margin = collapsed ? '80px' : '200px';
    
    if (mainLayout1) {
      mainLayout1.style.marginLeft = margin;
    }
    if (mainLayout2) {
      mainLayout2.style.marginLeft = margin;
    }
  }, [collapsed]);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        {collapsed ? "XQ" : "XenonIQ"}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
}; 