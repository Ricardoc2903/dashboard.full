// src/app/dashboard/settings/page.tsx
"use client";

import React, { useState } from "react";
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
} from "antd";
import {
  SettingOutlined,
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  GithubOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const { Title, Text } = Typography;

type PasswordFormValues = { currentPassword: string; newPassword: string };

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
  const [isGoogleConnected, setGoogleConnected] = useState(false);
  const [isGitHubConnected, setGitHubConnected] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const toggleGoogle = () => setGoogleConnected((prev) => !prev);
  const toggleGitHub = () => setGitHubConnected((prev) => !prev);

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

  // Formulario de creación de admin
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

  // Preferencias y conexiones externas (sin cambios)
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
        <Switch checked={compact} onChange={setCompact} style={{ marginLeft: 10}}/>
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
            {isGoogleConnected ? "Desconectado" : "Conectar Google"}
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
            {isGitHubConnected ? "Desconectado" : "Conectar GitHub"}
          </Button>
        </Tooltip>
      </div>
    </>
  );

  // Armamos el array de pestañas según el rol
  const items = [
    // Solo admins ven la pestaña de creación de otros admins
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
        ]
      : []),
    {
      key: "security",
      label: (
        <span>
          <LockOutlined /> Seguridad
        </span>
      ),
    },
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
      defaultActiveKey={user?.role === "ADMIN" ? "profile" : "security"}
      items={items}
      tabPosition="top"
      style={{ padding: 24 }}
    />
  );
};

export default withAuth(UserSettings);
