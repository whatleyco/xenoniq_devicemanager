import {
  GitHubBanner,
  Refine,
  Authenticated,
} from "@refinedev/core";
import {
  useNotificationProvider,
  ThemedLayoutV2,
  ErrorComponent,
  AuthPage,
  RefineThemes,
  ThemedLayoutContextProvider,
  ThemedHeaderV2,
} from "@refinedev/antd";
import { CustomSider } from "./components/CustomSider";
import {
  DatabaseOutlined,
  ShoppingCartOutlined,
  TabletOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

import { dataProvider, liveProvider } from "@refinedev/supabase";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import { App as AntdApp, ConfigProvider, Layout } from "antd";

import "@refinedev/antd/dist/reset.css";

import { supabaseClient } from "./utils/supabase";
import { DashboardPage } from "./pages/dashboard";

// Import our Serial Manifest pages
import { SerialManifestList, SerialManifestEdit, SerialManifestShow, SerialManifestCreate } from "./pages/serial-manifest";

// Import our Orders pages
import { OrdersList, OrdersEdit, OrdersShow, OrdersCreate } from "./pages/orders";

// Import our Devices pages  
import { DevicesList, DevicesEdit, DevicesShow, DevicesCreate } from "./pages/devices";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <GitHubBanner />
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <Refine
            dataProvider={dataProvider(supabaseClient)}
            liveProvider={liveProvider(supabaseClient)}
            authProvider={{
              login: async ({ email, password }) => {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                  email,
                  password,
                });

                if (error) {
        return {
                    success: false,
                    error,
        };
      }

                if (data?.user) {
        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
        error: {
          message: "Login failed",
          name: "Invalid email or password",
        },
      };
    },
              register: async ({ email, password }) => {
                const { data, error } = await supabaseClient.auth.signUp({
                  email,
                  password,
                });

                if (error) {
                  return {
                    success: false,
                    error,
                  };
                }

                if (data) {
        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
        error: {
          message: "Register failed",
          name: "Invalid email or password",
        },
      };
    },
              updatePassword: async ({ password }) => {
                const { data, error } = await supabaseClient.auth.updateUser({
                  password,
                });

                if (error) {
                  return {
                    success: false,
                    error,
                  };
                }

                if (data) {
        return {
          success: true,
        };
      }

      return {
        success: false,
        error: {
          message: "Update password failed",
          name: "Invalid password",
        },
      };
    },
              forgotPassword: async ({ email }) => {
                const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/update-password`,
                });

                if (error) {
                  return {
                    success: false,
                    error,
                  };
                }

                if (data) {
        return {
          success: true,
        };
      }

      return {
        success: false,
        error: {
          message: "Forgot password failed",
          name: "Invalid email",
        },
      };
    },
    logout: async () => {
                const { error } = await supabaseClient.auth.signOut();

                if (error) {
                  return {
                    success: false,
                    error,
                  };
                }

      return {
        success: true,
        redirectTo: "/login",
      };
    },
    onError: async (error) => {
                console.error(error);
                return { error };
              },
              check: async () => {
                const { data } = await supabaseClient.auth.getUser();
                const { user } = data;

                if (user) {
        return {
            authenticated: true,
                  };
                }

                return {
            authenticated: false,
            error: {
              message: "Check failed",
              name: "Not authenticated",
            },
            logout: true,
            redirectTo: "/login",
                };
          },
              getPermissions: async () => {
                const { data } = await supabaseClient.auth.getUser();
                const { user } = data;

                if (user) {
                  return user.role;
                }

                return null;
              },
              getIdentity: async () => {
                const { data } = await supabaseClient.auth.getUser();
                const { user } = data;

                if (user) {
                  return {
                    ...user,
                    name: user.email,
                  };
                }

                return null;
              },
            }}
            routerProvider={routerProvider}
            resources={[
              {
                name: "dashboard",
                list: "/",
                meta: {
                  label: "Dashboard",
                  icon: <DashboardOutlined />,
                },
              },
              {
                name: "serial_manifest",
                list: "/serial-manifest",
                create: "/serial-manifest/create",
                edit: "/serial-manifest/edit/:id",
                show: "/serial-manifest/show/:id",
                meta: {
                  label: "Serial Manifest",
                  icon: <DatabaseOutlined />,
                },
              },
              {
                name: "orders",
                list: "/orders",
                create: "/orders/create",
                edit: "/orders/edit/:id",
                show: "/orders/show/:id",
                meta: {
                  label: "Orders",
                  icon: <ShoppingCartOutlined />,
                },
              },
              {
                name: "devices",
                list: "/devices", 
                create: "/devices/create",
                edit: "/devices/edit/:id",
                show: "/devices/show/:id",
                meta: {
                  label: "Devices",
                  icon: <TabletOutlined />,
                },
              },
            ]}
            notificationProvider={useNotificationProvider}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated
                    key="authenticated-routes"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <ThemedLayoutContextProvider>
                      <Layout style={{ minHeight: "100vh" }}>
                        <CustomSider />
                        <Layout id="main-layout" style={{ marginLeft: 200 }}>
                          <ThemedHeaderV2 />
                          <Layout.Content style={{ padding: "24px" }}>
                      <Outlet />
                          </Layout.Content>
                        </Layout>
                      </Layout>
                    </ThemedLayoutContextProvider>
                  </Authenticated>
                }
              >
                <Route index element={<DashboardPage />} />

                {/* Serial Manifest routes */}
                <Route path="/serial-manifest">
                  <Route index element={<SerialManifestList />} />
                  <Route path="create" element={<SerialManifestCreate />} />
                  <Route path="edit/:id" element={<SerialManifestEdit />} />
                  <Route path="show/:id" element={<SerialManifestShow />} />
                </Route>
                
                {/* Orders routes */}
                <Route path="/orders">
                  <Route index element={<OrdersList />} />
                  <Route path="create" element={<OrdersCreate />} />
                  <Route path="edit/:id" element={<OrdersEdit />} />
                  <Route path="show/:id" element={<OrdersShow />} />
                </Route>
                
                {/* Devices routes */}
                <Route path="/devices">
                  <Route index element={<DevicesList />} />
                  <Route path="create" element={<DevicesCreate />} />
                  <Route path="edit/:id" element={<DevicesEdit />} />
                  <Route path="show/:id" element={<DevicesShow />} />
                </Route>
              </Route>

              <Route
                element={
                  <Authenticated key="auth-pages" fallback={<Outlet />}>
                    <NavigateToResource resource="serial_manifest" />
                  </Authenticated>
                }
              >
                <Route
                  path="/login"
                  element={<AuthPage type="login" />}
                />
                <Route
                  path="/register"
                  element={<AuthPage type="register" />}
                />
                <Route
                  path="/forgot-password"
                  element={<AuthPage type="forgotPassword" />}
                />
                <Route
                  path="/update-password"
                  element={<AuthPage type="updatePassword" />}
                />
              </Route>

              <Route
                element={
                  <Authenticated key="catch-all">
                    <ThemedLayoutContextProvider>
                      <Layout style={{ minHeight: "100vh" }}>
                        <CustomSider />
                        <Layout id="main-layout-2" style={{ marginLeft: 200 }}>
                          <ThemedHeaderV2 />
                          <Layout.Content style={{ padding: "24px" }}>
                      <Outlet />
                          </Layout.Content>
                        </Layout>
                      </Layout>
                    </ThemedLayoutContextProvider>
                  </Authenticated>
                }
              >
                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
