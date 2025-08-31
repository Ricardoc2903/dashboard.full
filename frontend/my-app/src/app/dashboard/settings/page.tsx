// // src/app/dashboard/settings/page.tsx
// "use client";

// import React, { useState } from "react";
// import withAuth from "@/hoc/withAuth";
// import {
//   Tabs,
//   Switch,
//   Button,
//   Input,
//   Divider,
//   Typography,
//   Tooltip,
//   Form,
//   message,
// } from "antd";
// import {
//   SettingOutlined,
//   UserOutlined,
//   GoogleOutlined,
//   GithubOutlined,
//   LogoutOutlined,
// } from "@ant-design/icons";
// import { useTheme } from "@/context/ThemeContext";
// import { useAuth } from "@/context/AuthContext";
// import axios from "axios";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL;
// const { Title, Text } = Typography;

// type PasswordFormValues = { currentPassword: string; newPassword: string };

// const UserSettings: React.FC = () => {
//   // Theme context
//   const {
//     theme,
//     compact,
//     primaryColor,
//     accessible,
//     largeText,
//     highContrast,
//     setTheme,
//     setCompact,
//     setPrimaryColor,
//     setAccessible,
//     setLargeText,
//     setHighContrast,
//   } = useTheme();

//   // Auth context: traemos usuario y logout
//   const { user, logout } = useAuth();

//   // Local state
//   const [isGoogleConnected, setGoogleConnected] = useState(false);
//   const [isGitHubConnected, setGitHubConnected] = useState(false);
//   const [loadingPassword, setLoadingPassword] = useState(false);

//   const toggleGoogle = () => setGoogleConnected((prev) => !prev);
//   const toggleGitHub = () => setGitHubConnected((prev) => !prev);

//   // 2) Cambiar contraseña (todos los usuarios autenticados)
//   const handleChangePassword = async (values: PasswordFormValues) => {
//     try {
//       setLoadingPassword(true);
//       const token = localStorage.getItem("token");
//       await axios.put(
//         `${API_BASE}/api/authProtegido/change-password`,
//         values,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       message.success("Contraseña actualizada exitosamente");
//     } catch (error) {
//       console.error("Error al cambiar contraseña:", error);
//       message.error("Error al cambiar la contraseña");
//     } finally {
//       setLoadingPassword(false);
//     }
//   };

//   // Formulario de creación de admin
//   const profileTab = (
//     <>
//       <Title level={4}>Seguridad</Title>
//       <Text>Cambia tu contraseña o cierra sesión.</Text>
//       <Divider />
//       <Form<PasswordFormValues>
//         layout="vertical"
//         style={{ maxWidth: 400 }}
//         onFinish={handleChangePassword}
//       >
//         <Form.Item
//           label="Contraseña actual"
//           name="currentPassword"
//           rules={[{ required: true, message: "Ingresa tu contraseña actual" }]}
//         >
//           <Input.Password placeholder="••••••••" />
//         </Form.Item>
//         <Form.Item
//           label="Nueva contraseña"
//           name="newPassword"
//           rules={[{ required: true, message: "Ingresa la nueva contraseña" }]}
//         >
//           <Input.Password placeholder="••••••••" />
//         </Form.Item>
//         <Form.Item>
//           <Button
//             type="primary"
//             htmlType="submit"
//             loading={loadingPassword}
//           >
//             Cambiar contraseña
//           </Button>
//         </Form.Item>
//       </Form>
//       <Divider />
//       <Button danger icon={<LogoutOutlined />} onClick={logout}>
//         Cerrar sesión
//       </Button>
//     </>
//   );

//   // Preferencias y conexiones externas (sin cambios)
//   const preferencesTab = (
//     <>
//       <Title level={4}>Preferencias de usuario</Title>
//       <Divider />

//       <div style={{ marginBottom: 16 }}>
//         <Text strong>Tema oscuro:</Text>
//         <Switch
//           checked={theme === "dark"}
//           onChange={(checked) => setTheme(checked ? "dark" : "light")}
//           style={{ marginLeft: 10 }}
//         />
//       </div>

//       <div style={{ marginBottom: 16 }}>
//         <Text strong>Modo compacto:</Text>
//         <Switch checked={compact} onChange={setCompact} style={{ marginLeft: 10}}/>
//       </div>

//       <div style={{ marginBottom: 16 }}>
//         <Text strong>Color primario:</Text>
//         <Input
//           type="color"
//           value={primaryColor}
//           onChange={(e) => setPrimaryColor(e.target.value)}
//           style={{ width: 60, marginLeft: 10 }}
//         />
//       </div>

//       <Divider />
//       <Title level={5}>Accesibilidad</Title>

//       <div style={{ marginBottom: 16 }}>
//         <Text strong>Modo accesible:</Text>
//         <Switch
//           checked={accessible}
//           onChange={setAccessible}
//           style={{ marginLeft: 10 }}
//         />
//       </div>
//       <div style={{ marginBottom: 16 }}>
//         <Text strong>Texto grande:</Text>
//         <Switch
//           checked={largeText}
//           onChange={setLargeText}
//           style={{ marginLeft: 10 }}
//         />
//       </div>
//       <div style={{ marginBottom: 16 }}>
//         <Text strong>Alto contraste:</Text>
//         <Switch
//           checked={highContrast}
//           onChange={setHighContrast}
//           style={{ marginLeft: 10 }}
//         />
//       </div>

//       <Divider />
//       <Title level={5}>Cuentas asociadas</Title>
//       <div style={{ display: "flex", gap: 16 }}>
//         <Tooltip
//           title={isGoogleConnected ? "Desconectar Google" : "Conectar Google"}
//         >
//           <Button
//             type={isGoogleConnected ? "default" : "primary"}
//             icon={<GoogleOutlined />}
//             onClick={toggleGoogle}
//           >
//             {isGoogleConnected ? "Desconectado" : "Conectar Google"}
//           </Button>
//         </Tooltip>
//         <Tooltip
//           title={isGitHubConnected ? "Desconectar GitHub" : "Conectar GitHub"}
//         >
//           <Button
//             type={isGitHubConnected ? "default" : "primary"}
//             icon={<GithubOutlined />}
//             onClick={toggleGitHub}
//           >
//             {isGitHubConnected ? "Desconectado" : "Conectar GitHub"}
//           </Button>
//         </Tooltip>
//       </div>
//     </>
//   );

//   // Armamos el array de pestañas según el rol
//   const items = [
//     // Solo admins ven la pestaña de creación de otros admins
//     ...(user?.role === "ADMIN"
//       ? [
//           {
//             key: "profile",
//             label: (
//               <span>
//                 <UserOutlined /> Perfil
//               </span>
//             ),
//             children: profileTab,
//           },
//         ]
//       : []),
//     {
//       key: "preferences",
//       label: (
//         <span>
//           <SettingOutlined /> Preferencias
//         </span>
//       ),
//       children: preferencesTab,
//     },
//   ];

//   return (
//     <Tabs
//       defaultActiveKey={user?.role === "ADMIN" ? "profile" : "security"}
//       items={items}
//       tabPosition="top"
//       style={{ padding: 24 }}
//     />
//   );
// };

// export default withAuth(UserSettings);

// src/app/dashboard/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import withAuth from "@/hoc/withAuth";
import {
  Tabs,
  Switch,
  Button,
  Input,
  Divider,
  Typography,
  Tooltip,
  Form,
  message,
  Table,
  Modal,
  Popconfirm,
  Select,
} from "antd";
import {
  SettingOutlined,
  UserOutlined,
  GoogleOutlined,
  GithubOutlined,
  LogoutOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const { Title, Text } = Typography;

type PasswordFormValues = { currentPassword: string; newPassword: string };

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
}

const UserSettings: React.FC = () => {
  // Theme context
  const {
    theme,
    compact,
    primaryColor,
    accessible,
    largeText,
    highContrast,
    setTheme,
    setCompact,
    setPrimaryColor,
    setAccessible,
    setLargeText,
    setHighContrast,
  } = useTheme();

  // Auth context: traemos usuario y logout
  const { user, logout } = useAuth();

  // Local state
  const [isGoogleConnected, setGoogleConnected] = useState<boolean>(false);
  const [isGitHubConnected, setGitHubConnected] = useState<boolean>(false);
  const [loadingPassword, setLoadingPassword] = useState<boolean>(false);

  const toggleGoogle = () =>
    setGoogleConnected((prev: boolean) => !prev);
  const toggleGitHub = () =>
    setGitHubConnected((prev: boolean) => !prev);

  // Gestión de usuarios (solo admins)
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editForm] = Form.useForm<UserData>();

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem("token");
      const res = await axios.get<UserData[]>(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch {
      message.error("Error al obtener usuarios");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [user]);

  const handleEdit = (record: UserData) => {
    setEditingUser(record);
    editForm.setFieldsValue(record);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Usuario eliminado");
      fetchUsers();
    } catch {
      message.error("Error al eliminar usuario");
    }
  };

  const submitEdit = async () => {
    try {
      const values = await editForm.validateFields();
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/api/users/${editingUser!.id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Usuario actualizado");
      setEditingUser(null);
      fetchUsers();
    } catch {
      message.error("Error al actualizar usuario");
    }
  };

  // 2) Cambiar contraseña (todos los usuarios autenticados)
  const handleChangePassword = async (values: PasswordFormValues) => {
    try {
      setLoadingPassword(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/authProtegido/change-password`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Contraseña actualizada exitosamente");
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      message.error("Error al cambiar la contraseña");
    } finally {
      setLoadingPassword(false);
    }
  };

  // Pestaña Perfil / Seguridad
  const profileTab = (
    <>
      <Title level={4}>Seguridad</Title>
      <Text>Cambia tu contraseña o cierra sesión.</Text>
      <Divider />
      <Form<PasswordFormValues>
        layout="vertical"
        style={{ maxWidth: 400 }}
        onFinish={handleChangePassword}
      >
        <Form.Item
          label="Contraseña actual"
          name="currentPassword"
          rules={[{ required: true, message: "Ingresa tu contraseña actual" }]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>
        <Form.Item
          label="Nueva contraseña"
          name="newPassword"
          rules={[{ required: true, message: "Ingresa la nueva contraseña" }]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loadingPassword}
          >
            Cambiar contraseña
          </Button>
        </Form.Item>
      </Form>
      <Divider />
      <Button danger icon={<LogoutOutlined />} onClick={logout}>
        Cerrar sesión
      </Button>
    </>
  );

  // Preferencias y conexiones externas
  const preferencesTab = (
    <>
      <Title level={4}>Preferencias de usuario</Title>
      <Divider />

      <div style={{ marginBottom: 16 }}>
        <Text strong>Tema oscuro:</Text>
        <Switch
          checked={theme === "dark"}
          onChange={(checked) => setTheme(checked ? "dark" : "light")}
          style={{ marginLeft: 10 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>Modo compacto:</Text>
        <Switch checked={compact} onChange={setCompact} style={{ marginLeft: 10 }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>Color primario:</Text>
        <Input
          type="color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          style={{ width: 60, marginLeft: 10 }}
        />
      </div>

      <Divider />
      <Title level={5}>Accesibilidad</Title>

      <div style={{ marginBottom: 16 }}>
        <Text strong>Modo accesible:</Text>
        <Switch
          checked={accessible}
          onChange={setAccessible}
          style={{ marginLeft: 10 }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Texto grande:</Text>
        <Switch
          checked={largeText}
          onChange={setLargeText}
          style={{ marginLeft: 10 }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Alto contraste:</Text>
        <Switch
          checked={highContrast}
          onChange={setHighContrast}
          style={{ marginLeft: 10 }}
        />
      </div>

      <Divider />
      <Title level={5}>Cuentas asociadas</Title>
      <div style={{ display: "flex", gap: 16 }}>
        <Tooltip
          title={isGoogleConnected ? "Desconectar Google" : "Conectar Google"}
        >
          <Button
            type={isGoogleConnected ? "default" : "primary"}
            icon={<GoogleOutlined />}
            onClick={toggleGoogle}
          >
            {isGoogleConnected ? "Desconectar Google" : "Conectar Google"}
          </Button>
        </Tooltip>
        <Tooltip
          title={isGitHubConnected ? "Desconectar GitHub" : "Conectar GitHub"}
        >
          <Button
            type={isGitHubConnected ? "default" : "primary"}
            icon={<GithubOutlined />}
            onClick={toggleGitHub}
          >
            {isGitHubConnected ? "Desconectar GitHub" : "Conectar GitHub"}
          </Button>
        </Tooltip>
      </div>
    </>
  );

  // Pestaña de usuarios (solo admins)
  const usersTab = (
    <>
      <Title level={4}>Usuarios</Title>
      <Table<UserData>
        dataSource={users}
        rowKey="id"
        loading={loadingUsers}
        columns={[
          { title: "Nombre", dataIndex: "name" },
          { title: "Email", dataIndex: "email" },
          { title: "Rol", dataIndex: "role" },
          {
            title: "Acciones",
            render: (_: unknown, record: UserData) => (
              <>
                <Button type="link" onClick={() => handleEdit(record)}>
                  Editar
                </Button>
                <Popconfirm
                  title="¿Eliminar usuario?"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Button type="link" danger>
                    Eliminar
                  </Button>
                </Popconfirm>
              </>
            ),
          },
        ]}
      />

      <Modal
        open={!!editingUser}
        title="Editar usuario"
        onCancel={() => setEditingUser(null)}
        onOk={submitEdit}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: "Ingresa el nombre" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email", message: "Email inválido" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Rol" name="role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="ADMIN">ADMIN</Select.Option>
              <Select.Option value="USER">USER</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );

  // Armamos el array de pestañas según el rol
  const items = [
    ...(user?.role === "ADMIN"
      ? [
          {
            key: "profile",
            label: (
              <span>
                <UserOutlined /> Perfil
              </span>
            ),
            children: profileTab,
          },
          {
            key: "users",
            label: (
              <span>
                <TeamOutlined /> Usuarios
              </span>
            ),
            children: usersTab,
          },
        ]
      : []),
    {
      key: "preferences",
      label: (
        <span>
          <SettingOutlined /> Preferencias
        </span>
      ),
      children: preferencesTab,
    },
  ];

  return (
    <Tabs
      defaultActiveKey={user?.role === "ADMIN" ? "profile" : "preferences"}
      items={items}
      tabPosition="top"
      style={{ padding: 24 }}
    />
  );
};

export default withAuth(UserSettings);
