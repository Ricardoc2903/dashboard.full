"use client";

import { Button, Typography } from "antd";
import { useRouter } from "next/navigation";
import Image from "next/image";

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-black">
      <div className="max-w-4xl w-full px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Texto de bienvenida */}
        <div className="flex-1">
          <Title level={1} style={{ fontSize: "2.5rem", color: "white"}}>
            Bienvenido a tu Sistema de Mantenimiento
          </Title>
          <Paragraph style={{ fontSize: "1.2rem", marginTop: "1rem", color: "white" }}>
            Gestiona tus equipos, mantenimientos, reportes y archivos de forma simple y rápida.
          </Paragraph>

          <div className="mt-6 flex gap-4">
            <Button type="primary" size="large" onClick={() => router.push("/auth")}>
              Iniciar sesión
            </Button>
            <Button size="large" onClick={() => router.push("/auth")}>
              Registrarse
            </Button>
          </div>
        </div>

        {/* Imagen decorativa */}
        <div className="hidden lg:block flex-1 text-center">
          <Image
            src="/undraw.svg"// 📌 Asegúrate de colocar esta imagen en public/
            alt="Gestión de mantenimiento"
            width={400}
            height={400}
            priority
          />
        </div>
      </div>
    </div>
  );
}
