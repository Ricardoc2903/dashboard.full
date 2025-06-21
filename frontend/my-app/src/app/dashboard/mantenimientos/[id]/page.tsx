"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  Descriptions,
  Button,
  Spin,
  message,
} from "antd";
import dayjs from "dayjs";

interface Archivo {
  id: string;
  filename: string;
  url: string;  // Viene del backend: puede ser absoluta o relativa
}

interface Mantenimiento {
  id: string;
  name: string;
  date: string;
  status: string;
  notes?: string;
  equipment: { name: string };
  archivos?: Archivo[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const MantenimientoDetalle = () => {
  const { id } = useParams();
  const router = useRouter();

  const [mantenimiento, setMantenimiento] = useState<Mantenimiento | null>(null);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 1) Traer detalle con `archivos: {id, filename, url}[]`
  const fetchMantenimiento = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await axios.get<Mantenimiento>(
        `${API_BASE}/api/mantenimientos/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMantenimiento(data);
    } catch (err) {
      console.error(err);
      message.error("Error al cargar el mantenimiento");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchMantenimiento();
  }, [fetchMantenimiento]);

  if (loading || !mantenimiento) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Button onClick={() => router.push("/dashboard/mantenimientos")}>
        Volver a la lista
      </Button>

      <Card title="Detalle del Mantenimiento" className="mt-4">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Nombre">
            {mantenimiento.name}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha">
            {dayjs(mantenimiento.date).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Equipo">
            {mantenimiento.equipment.name}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            {mantenimiento.status.replace("_", " ")}
          </Descriptions.Item>
          <Descriptions.Item label="Notas">
            {mantenimiento.notes || "Sin notas"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

    </div>
  );
};

export default MantenimientoDetalle;
