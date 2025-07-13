"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Button,
  Card,
  Descriptions,
  Modal,
  message,
  Tag,
  Table,
  Form,
  Input,
  Select,
  DatePicker,
  Popconfirm,
} from "antd";
import dayjs from "dayjs";
import { useAuth } from "@/context/AuthContext";
import withAuth from "@/hoc/withAuth";
import { useRouter } from "next/navigation";

interface Grupo {
  id: string;
  name: string;
}

interface Equipo {
  id: string;
  name: string;
  type: string;
  location: string;
  acquiredAt?: string;
  status: "ACTIVE" | "MAINTENANCE" | "OUT_OF_SERVICE";
  group?: {
    id: string;
    name: string;
  };
}

interface Mantenimiento {
  id: string;
  name: string;
  date: string;
  status: "COMPLETED" | "PENDING" | "IN_PROGRESS";
  notes?: string;
}

const estadoColor: Record<string, string> = {
  ACTIVE: "green",
  MAINTENANCE: "gold",
  OUT_OF_SERVICE: "red",
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;




function EquipoDetalle() {
  const { id } = useParams();
  const { user } = useAuth();

  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchEquipo = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/equipos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipo(res.data);
    } catch {
      message.error("Error al obtener el equipo");
    }
  }, [id, token]);

  interface EquipoFormValues {
    name: string;
    type: string;
    location: string;
    acquiredAt?: dayjs.Dayjs;
    status: "ACTIVE" | "MAINTENANCE" | "OUT_OF_SERVICE";
    groupId?: string;
  }

  const router = useRouter();

  const handleDeleteEquipo = async (equipoId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/equipos/${equipoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMessage = data?.message || "Error al eliminar equipo";
        message.error(errorMessage);
        return;
      }

      message.success("Equipo eliminado correctamente");
      // Redireccionar o recargar datos
      router.push("/dashboard/equipos");
    } catch (error) {
      console.error("Error al eliminar equipo:", error);
      message.error("Error al eliminar equipo");
    }
  };

  const fetchMantenimientos = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/mantenimientos/by-equipo/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMantenimientos(res.data);
    } catch {
      message.error("Error al obtener los mantenimientos");
    }
  }, [id, token]);

  const fetchGrupos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/grupos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrupos(res.data);
    } catch {
      message.error("Error al obtener grupos");
    }
  }, [token]);

  const handleSubmitEditar = async (values: EquipoFormValues) => {
    try {
      await axios.put(`${API_BASE}/api/equipos/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Equipo actualizado");
      setIsEditModalOpen(false);
      fetchEquipo();
    } catch (error) {
      console.error("Error al actualizar equipo:", error);
      message.error("Error al actualizar equipo");
    }
  };

  useEffect(() => {
    if (equipo) {
      form.setFieldsValue({
        name: equipo.name,
        type: equipo.type,
        location: equipo.location,
        acquiredAt: equipo.acquiredAt ? dayjs(equipo.acquiredAt) : null,
        status: equipo.status,
        groupId: equipo.group?.id,
      });
    }
  }, [equipo, form]);

  useEffect(() => {
    if (id) {
      fetchEquipo();
      fetchMantenimientos();
      fetchGrupos();
    }
  }, [id, fetchEquipo, fetchMantenimientos, fetchGrupos]);

  return (
    <div className="space-y-4">
      {equipo && (
        <Card
          title={equipo.name}
          extra={
            user?.role === "ADMIN" && (
              <div className="space-x-2">
                <Button onClick={() => setIsEditModalOpen(true)}>Editar</Button>
                <Popconfirm
                  title="¿Seguro que quieres eliminar este equipo?"
                  onConfirm={() => handleDeleteEquipo(equipo.id)}
                  okText="Sí"
                  cancelText="No"
                >
                  <Button danger>Eliminar</Button>
                </Popconfirm>
              </div>
            )
          }
        >
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Tipo">{equipo.type}</Descriptions.Item>
            <Descriptions.Item label="Ubicación">
              {equipo.location}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={estadoColor[equipo.status]}>
                {equipo.status.replace("_", " ")}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de adquisición">
              {equipo.acquiredAt
                ? dayjs(equipo.acquiredAt).format("DD/MM/YYYY")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Grupo">
              {equipo.group?.name || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card title="Mantenimientos del equipo">
        <Table
          rowKey="id"
          dataSource={mantenimientos}
          pagination={false}
          columns={[
            { title: "Nombre", dataIndex: "name" },
            {
              title: "Fecha",
              dataIndex: "date",
              render: (d: string) => dayjs(d).format("DD/MM/YYYY"),
            },
            {
              title: "Estado",
              dataIndex: "status",
              render: (estado: string) => (
                <Tag color={estadoColor[estado] || "default"}>
                  {estado.replace("_", " ")}
                </Tag>
              ),
            },
            { title: "Notas", dataIndex: "notes" },
          ]}
        />
      </Card>

      <Modal
        title="Editar equipo"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitEditar}>
          <Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Tipo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="location"
            label="Ubicación"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="acquiredAt" label="Fecha de adquisición">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="status" label="Estado" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="ACTIVE">Activo</Select.Option>
              <Select.Option value="MAINTENANCE">
                En mantenimiento
              </Select.Option>
              <Select.Option value="OUT_OF_SERVICE">
                Fuera de servicio
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="groupId" label="Grupo">
            <Select allowClear placeholder="Seleccionar grupo">
              {grupos.map((grupo) => (
                <Select.Option key={grupo.id} value={grupo.id}>
                  {grupo.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default withAuth(EquipoDetalle);
