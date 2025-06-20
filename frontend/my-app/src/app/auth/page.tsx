// src/app/auth/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import axios from "axios";
import { Form, Input, Button, Typography, message, Divider } from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Definimos la forma esperada del body de error
interface AuthErrorResponse {
  message?: string;
  reason?: "invalid_credentials" | "email_taken";
  missingFields?: string[];
}

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form] = Form.useForm();
  const { login } = useAuth();
  const router = useRouter();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    form.resetFields();
  };

  type AuthFormValues = {
    name?: string;
    email: string;
    password: string;
  };

  const handleSubmit = async (values: AuthFormValues) => {
  try {
    const endpoint = isLogin
      ? "http://localhost:3000/api/auth/login"
      : "http://localhost:3000/api/auth/register";

    const { data } = await axios.post(endpoint, values);
    login(data.token, data.user);
  } catch (error: unknown) {
    console.error("Error en la autenticación", error);

    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status as number;
      const respData = error.response.data as AuthErrorResponse;

      // ——— Manejo LOGIN: si es 400, mostramos siempre el mensaje genérico ———
      if (isLogin && status === 400) {
        message.error("Usuario o contraseña incorrectos");
        return;
      }

      // ——— Manejo REGISTER: validaciones específicas ———
      if (!isLogin) {
        const missingFields = respData.missingFields;
        const reason = respData.reason;

        if (status === 400 && Array.isArray(missingFields)) {
          message.error(
            `Faltan campos obligatorios: ${missingFields.join(", ")}.`
          );
          return;
        }
        if (status === 400 && reason === "email_taken") {
          message.error("Ese correo ya está registrado.");
          return;
        }
        message.error(respData.message || "Error al registrar la cuenta.");
        return;
      }
    }

    // Cualquier otro caso (network, 500, etc.)
    message.error("Error inesperado de red o de servidor.");
  }
};


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-950 to-black relative">
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 text-white hover:text-blue-400 transition-colors duration-200 text-xl z-10"
        aria-label="Volver al inicio"
      >
        <ArrowLeftOutlined />
      </button>

      <div className="hidden md:flex items-center justify-center w-1/2 p-8">
        <div className="relative w-full max-w-md h-[400px]">
          <Image
            src="/undrawps.svg"
            alt="Decoración login"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-lg shadow-md">
          <Title level={3} className="text-center text-white mb-6">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            requiredMark="optional"
          >
            {!isLogin && (
              <Form.Item
                label="Nombre"
                name="name"
                rules={[
                  { required: true, message: "Por favor ingresa tu nombre" },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Juan Pérez" />
              </Form.Item>
            )}

            <Form.Item
              label="Correo electrónico"
              name="email"
              rules={[
                { required: true, message: "Por favor ingresa tu email" },
                { type: "email", message: "Correo inválido" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="correo@email.com" />
            </Form.Item>

            <Form.Item
              label="Contraseña"
              name="password"
              rules={[
                { required: true, message: "Por favor ingresa tu contraseña" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="••••••••"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {isLogin ? "Ingresar" : "Registrarse"}
              </Button>
            </Form.Item>
          </Form>

          <Divider className="bg-white/20" />

          <Text className="block text-center text-white">
            {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
            <Button
              type="link"
              onClick={toggleForm}
              className="p-0 text-blue-400"
            >
              {isLogin ? "Regístrate aquí" : "Inicia sesión"}
            </Button>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
