"use client";
import { useEffect, useState, useCallback } from "react";
import withAuth from "@/hoc/withAuth";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Popconfirm,
  Tag,
  message,
  Space,
} from "antd";
import { PlusOutlined, FolderAddOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
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
  groupId?: string;
  group?: Grupo;
}

const estadoColor = {
  ACTIVE: "green",
  MAINTENANCE: "gold",
  OUT_OF_SERVICE: "red",
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const EquiposTable = () => {
  const router = useRouter();

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [form] = Form.useForm();
  const [groupForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    undefined
  );
  const [selectedEstado, setSelectedEstado] = useState<string | undefined>(
    undefined
  );
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchEquipos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/equipos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEquipos(data);
    } catch {
      message.error("Error al cargar los equipos.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchGrupos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/grupos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // Si viene 401 o cualquier otro estatus ≠ 2xx, ZANJAMOS y forzamos array vacío
        message.error("No autorizado al obtener grupos");
        setGrupos([]);
        return;
      }
      const data = await res.json();
      // Garantizamos que data sea un array (por si acaso viene algo raro)
      setGrupos(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("Error al cargar los grupos:", err);
      message.error("Error al cargar los grupos.");
      setGrupos([]);
    }
  }, [token]);

  const handleCreateOrUpdate = async (values: {
    name: string;
    type: string;
    location: string;
    acquiredAt?: Date | null;
    status: "ACTIVE" | "MAINTENANCE" | "OUT_OF_SERVICE";
    groupId?: string | null;
  }) => {
    console.log("Valores enviados al backend:", values);

    const isEditing = !!editingEquipo;
    const url = isEditing
      ? `${API_BASE}/api/equipos/${editingEquipo.id}`
      : `${API_BASE}/api/equipos`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: values.name,
          type: values.type,
          location: values.location,
          acquiredAt: values.acquiredAt
            ? values.acquiredAt.toISOString()
            : null,
          status: values.status,
          groupId: values.groupId || null,
        }),
      });

      if (!res.ok) throw new Error();
      message.success(isEditing ? "Equipo actualizado" : "Equipo creado");
      setIsModalOpen(false);
      form.resetFields();
      setEditingEquipo(null);
      fetchEquipos();
    } catch {
      message.error("Hubo un error al guardar");
    }
  };

  const handleCreateGroup = async () => {
    try {
      const values = await groupForm.validateFields();
      const res = await fetch(`${API_BASE}/api/grupos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error();

      message.success("Grupo creado");
      setIsGroupModalOpen(false);
      groupForm.resetFields();
      fetchGrupos();
    } catch {
      message.error("No se pudo crear el grupo");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/grupos/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 400) {
        const data = await res.json();
        message.warning(data.message || "No se pudo eliminar el grupo");
      } else if (!res.ok) {
        throw new Error();
      } else {
        message.success("Grupo eliminado");
        fetchGrupos(); // actualiza la lista de grupos
      }
    } catch (err) {
      console.error("Error al eliminar grupo:", err);
      message.error("Error al eliminar grupo");
    }
  };

  useEffect(() => {
    fetchEquipos();
    fetchGrupos();
  }, [fetchEquipos, fetchGrupos]);

  const filteredEquipos = equipos.filter((equipo) => {
    const search = searchText.toLowerCase();
    const matchesSearch =
      equipo.name.toLowerCase().includes(search) ||
      equipo.type.toLowerCase().includes(search) ||
      equipo.location.toLowerCase().includes(search);
    const matchesGroup = selectedGroupId
      ? equipo.groupId === selectedGroupId
      : true;
    const matchesEstado = selectedEstado
      ? equipo.status === selectedEstado
      : true;
    return matchesSearch && matchesGroup && matchesEstado;
  });

  return (
    <>
      <div className="flex flex-wrap gap-4">
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Input
            placeholder="Buscar equipo"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            allowClear
            placeholder="Filtrar por grupo"
            value={selectedGroupId}
            onChange={(value) => setSelectedGroupId(value)}
            style={{ width: 200 }}
            dropdownStyle={{ padding: "8px" }}
          >
            {grupos.map((grupo) => (
              <Select.Option key={grupo.id} value={grupo.id}>
                <div className="flex justify-between items-center">
                  <span>{grupo.name}</span>
                  <Popconfirm
                    title="¿Seguro que quieres eliminar este grupo?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDeleteGroup(grupo.id);
                    }}
                    okText="Sí"
                    cancelText="No"
                  >
                    <Button
                      danger
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                    >
                      X
                    </Button>
                  </Popconfirm>
                </div>
              </Select.Option>
            ))}
          </Select>

          <Select
            allowClear
            placeholder="Filtrar por estado"
            value={selectedEstado}
            onChange={(value) => setSelectedEstado(value)}
            style={{ width: 200 }}
          >
            <Select.Option value="ACTIVO">Activo</Select.Option>
            <Select.Option value="MAINTENANCE">En mantenimiento</Select.Option>
            <Select.Option value="OUT_OF_SERVICE">
              Fuera de servicio
            </Select.Option>
          </Select>
          <Space>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                form.resetFields();
                setEditingEquipo(null);
                setIsModalOpen(true);
              }}
            >
              Nuevo equipo
            </Button>
            <Button
              icon={<FolderAddOutlined />}
              onClick={() => setIsGroupModalOpen(true)}
            >
              Crear grupo
            </Button>
          </Space>
        </div>
      </div>

      {/* <Table
        rowKey="id"
        dataSource={filteredEquipos}
        scroll={{ x: "max-content" }}
        loading={loading}
        columns={[
          {
            title: "Nombre",
            dataIndex: "name",
            render: (text: string) => (
              <div className="ellipsis-cell">{text}</div>
            ),
          },
          {
            title: "Tipo",
            dataIndex: "type",
            render: (text: string) => (
              <div className="ellipsis-cell">{text}</div>
            ),
          },
          {
            title: "Ubicación",
            dataIndex: "location",
            render: (text: string) => (
              <div className="ellipsis-cell">{text}</div>
            ),
          },
          {
            title: "Fecha de adquisición",
            dataIndex: "acquiredAt",
            render: (fecha: string) =>
              fecha ? dayjs(fecha).format("DD/MM/YYYY") : "-",
          },
          {
            title: "Estado",
            dataIndex: "status",
            render: (estado: string) => (
              <Tag
                className="ellipsis-cell"
                color={estadoColor[estado as keyof typeof estadoColor]}
              >
                {estado.replace("_", " ")}
              </Tag>
            ),
          },
          {
            title: "Grupo",
            dataIndex: ["group", "name"],
            render: (grupo: string) => grupo || "-",
          },
        ]}
        onRow={(record) => ({
          onClick: () => {
            router.push(`/dashboard/equipos/${record.id}`);
          },
          className:
            "cursor-pointer hover:bg-gray-100 transition",
        })}
      /> */}

      <Table
        rowKey="id"
        dataSource={filteredEquipos}
        scroll={{ x: "max-content" }}
        loading={loading}
        columns={[
          {
            title: "Nombre",
            dataIndex: "name",
            render: (text: string) => (
              <div className="truncate max-w-[150px] overflow-hidden text-center">
                {text}
              </div>
            ),
          },
          {
            title: "Tipo",
            dataIndex: "type",
            render: (text: string) => (
              <div className="truncate max-w-[150px] overflow-hidden text-center">
                {text}
              </div>
            ),
          },
          {
            title: "Ubicación",
            dataIndex: "location",
            render: (text: string) => (
              <div className="truncate max-w-[150px] overflow-hidden text-center">
                {text}
              </div>
            ),
          },
          {
            title: "Fecha de adquisición",
            dataIndex: "acquiredAt",
            render: (fecha: string) =>
              fecha ? dayjs(fecha).format("DD/MM/YYYY") : "-",
          },
          {
            title: "Estado",
            dataIndex: "status",
            render: (estado: string) => (
              <Tag
                className="truncate max-w-[150px] overflow-hidden text-center"
                color={estadoColor[estado as keyof typeof estadoColor]}
              >
                {estado.replace("_", " ")}
              </Tag>
            ),
          },
          {
            title: "Grupo",
            dataIndex: ["group", "name"],
            render: (grupo: string) => (
              <div className="truncate max-w-[150px] overflow-hidden text-center">
                {grupo || "-"}
              </div>
            ),
          },
        ]}
        onRow={(record) => ({
          onClick: () => {
            router.push(`/dashboard/equipos/${record.id}`);
          },
          className: "cursor-pointer hover:bg-gray-100 transition",
        })}
      />

      <Modal
        title={editingEquipo ? "Editar equipo" : "Nuevo equipo"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingEquipo(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingEquipo ? "Guardar cambios" : "Crear"}
      >
        <Form layout="vertical" form={form} onFinish={handleCreateOrUpdate}>
          <Form.Item label="Nombre" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Tipo" name="type" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Ubicación"
            name="location"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Fecha de adquisición" name="acquiredAt">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Estado" name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Activo", value: "ACTIVE" },
                { label: "En mantenimiento", value: "MAINTENANCE" },
                { label: "Fuera de servicio", value: "OUT_OF_SERVICE" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Grupo" name="groupId">
            <Select allowClear placeholder="Seleccionar grupo (opcional)">
              {grupos.map((grupo) => (
                <Select.Option key={grupo.id} value={grupo.id}>
                  {grupo.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Crear nuevo grupo"
        open={isGroupModalOpen}
        onCancel={() => {
          setIsGroupModalOpen(false);
          groupForm.resetFields();
        }}
        onOk={() => groupForm.submit()}
        okText="Crear"
      >
        <Form layout="vertical" form={groupForm} onFinish={handleCreateGroup}>
          <Form.Item
            name="name"
            label="Nombre del grupo"
            rules={[{ required: true }]}
          >
            <Input placeholder="Ej. Fábrica de helados" />
          </Form.Item>
        </Form>

        <div className="mt-4">
          <h4 style={{ marginBottom: 8 }}>Grupos existentes</h4>
          {grupos.map((grupo) => (
            <div
              key={grupo.id}
              className="flex justify-between items-center border p-2 rounded mb-2"
            >
              <span>{grupo.name}</span>
              <Popconfirm
                title="¿Seguro que quieres eliminar este grupo?"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDeleteGroup(grupo.id); // ✅ esto sí existe
                }}
                okText="Sí"
                cancelText="No"
              >
                <Button danger onClick={(e) => e.stopPropagation()}>
                  Eliminar
                </Button>
              </Popconfirm>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default withAuth(EquiposTable);
