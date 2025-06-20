"use client";

import { useEffect, useState } from "react";
import { Card, Spin, message, Row, Col, Statistic, Typography } from "antd";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useAuth } from "@/context/AuthContext"; // ✅ IMPORTANTE

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface EstadoMantenimiento {
  status: string;
  count: number;
}

export default function DashboardInicio() {
  const { user, loading: authLoading } = useAuth(); // ✅ usar loading de AuthContext
  const [loading, setLoading] = useState(true);
  const [totalMantenimientos, setTotalMantenimientos] = useState(0);
  const [totalEquipos, setTotalEquipos] = useState(0);
  const [porEstado, setPorEstado] = useState<EstadoMantenimiento[]>([]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (authLoading || !user) return; // ✅ no continuar hasta que se valide auth

    const fetchStats = async () => {
      try {
        const [resM, resE, resG] = await Promise.all([
          fetch("http://localhost:3000/api/stats/total-mantenimientos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/api/stats/total-equipos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/api/stats/estado-mantenimientos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const totalM = await resM.json();
        const totalE = await resE.json();
        const groupedEstado = await resG.json();

        setTotalMantenimientos(totalM.total);
        setTotalEquipos(totalE.total);
        setPorEstado(Array.isArray(groupedEstado) ? groupedEstado : []);
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        message.error("Error al obtener estadísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [authLoading, user, token]);

  const doughnutData = {
    labels: porEstado.map((e) => e.status),
    datasets: [
      {
        data: porEstado.map((e) => e.count),
        backgroundColor: ["#1890ff", "#52c41a", "#faad14"],
        borderWidth: 1,
      },
    ],
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" tip="Cargando datos..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Typography.Title level={2}>
        Bienvenido al panel de control
      </Typography.Title>

      {user?.name && (
        <Typography.Paragraph style={{ marginTop: "-8px" }} type="secondary">
          Hola, <strong>{user.name}</strong> 👋
        </Typography.Paragraph>
      )}

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={12}>
          <Card>
            <Statistic
              title="Mantenimientos totales"
              value={totalMantenimientos}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Statistic title="Equipos registrados" value={totalEquipos} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} md={24} lg={12}>
          <Card title="Distribución por estado">
            <Doughnut data={doughnutData} />
          </Card>
        </Col>
        <Col xs={24} md={24} lg={12}>
          <Card title="Recomendaciones">
            <p>🛠 Revisa mantenimientos pendientes y agendá revisiones.</p>
            <p>✅ Tené un control visual del estado de tu sistema.</p>
            <p>📦 Gestioná el stock y uso de equipos a tiempo.</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
