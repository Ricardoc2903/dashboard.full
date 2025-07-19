"use client";

import { useEffect, useState, useCallback } from "react";
import withAuth from "@/hoc/withAuth";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";
import {
  Table,
  Tag,
  Popconfirm,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  DatePicker,
} from "antd";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useAuth } from "@/context/AuthContext";

// Activar los plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Option } = Select;
const { RangePicker } = DatePicker;

interface Equipo {
  id: string;
  name: string;
}

interface Mantenimiento {
  id: string;
  name: string;
  date: string;
  status: string;
  notes?: string;
  equipmentId: string;
  equipment: {
    name: string;
  };
}

const getEstadoTagColor = (estado: string) => {
  switch (estado) {
    case "COMPLETED":
      return "green";
    case "PENDING":
      return "gold";
    case "IN_PROGRESS":
      return "blue";
    default:
      return "default";
  }
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const MaintenanceTable = () => {
  const [data, setData] = useState<Mantenimiento[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Mantenimiento | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [equipoFilter, setEquipoFilter] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );

  const { user } = useAuth();

  console.log("Usuario logueado:", user);

  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchEquipos = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/equipos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipos(response.data);
    } catch (error) {
      console.error("Error al obtener equipos", error);
      message.error("Error al obtener equipos");
    }
  }, [token]);

  const fetchMantenimientos = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/mantenimientos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error al obtener mantenimientos", error);
      message.error("Error al obtener mantenimientos");
    }
  }, [token]);

  useEffect(() => {
    fetchMantenimientos();
    fetchEquipos();
  }, [fetchMantenimientos, fetchEquipos]);

  useEffect(() => {
    fetchMantenimientos();
    fetchEquipos();
  }, [fetchMantenimientos, fetchEquipos]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/api/mantenimientos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMantenimientos();
      message.success("Mantenimiento eliminado");
    } catch (error) {
      console.error("Error al eliminar", error);
      message.error("Error al eliminar mantenimiento");
    }
  };

  const handleEdit = (record: Mantenimiento) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      nombre: record.name,
      fecha: dayjs(record.date),
      equipo: record.equipmentId,
      estado: record.status,
      notas: record.notes,
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      await axios.put(
        `${API_BASE}/api/mantenimientos/${editingRecord?.id}`,
        {
          name: values.nombre,
          date: values.fecha,
          equipmentId: values.equipo,
          status: values.estado,
          notes: values.notas,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditModalVisible(false);
      setEditingRecord(null);
      fetchMantenimientos();
      message.success("Mantenimiento actualizado");
    } catch (error) {
      console.error("Error al actualizar", error);
      message.error("Error al actualizar mantenimiento");
    }
  };

  const handleAddSubmit = async () => {
    try {
      const values = await form.validateFields();
      await axios.post(
        `${API_BASE}/api/mantenimientos`,
        {
          name: values.nombre,
          date: values.fecha,
          equipmentId: values.equipo,
          status: values.estado,
          notes: values.notas,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsAddModalVisible(false);
      form.resetFields();
      fetchMantenimientos();
      message.success("Mantenimiento creado");
    } catch (error) {
      console.error("Error al crear mantenimiento", error);
      message.error("Error al crear mantenimiento");
    }
  };

  const filteredData = data.filter((item) => {
    const search = searchText.toLowerCase();
    const matchText =
      item.name.toLowerCase().includes(search) ||
      item.status.toLowerCase().includes(search) ||
      (item.notes?.toLowerCase().includes(search) ?? false);

    const matchEquipo = equipoFilter ? item.equipmentId === equipoFilter : true;
    const matchEstado = estadoFilter ? item.status === estadoFilter : true;

    const matchDate =
      !dateRange || // Si no hay rango de fechas seleccionado
      (dayjs(item.date).isSameOrAfter(dateRange[0], "day") &&
        dayjs(item.date).isSameOrBefore(dateRange[1], "day"));

    return matchText && matchEquipo && matchEstado && matchDate;
  });

  // const columns = [
  //   {
  //     title: "Equipo",
  //     dataIndex: ["equipment", "name"],
  //     key: "equipment",
  //   },
  //   {
  //     title: "Fecha",
  //     dataIndex: "date",
  //     key: "date",
  //     render: (fecha: string) => dayjs(fecha).format("DD/MM/YYYY"),
  //   },
  //   {
  //     title: "Nombre",
  //     dataIndex: "name",
  //     key: "name",
  //   },
  //   {
  //     title: "Estado",
  //     dataIndex: "status",
  //     key: "status",
  //     render: (estado: string) => (
  //       <Tag
  //         color={getEstadoTagColor(estado)}
  //         style={{ textTransform: "capitalize" }}
  //       >
  //         {estado.replace("_", " ")}
  //       </Tag>
  //     ),
  //   },
  //   {
  //     title: "Notas",
  //     dataIndex: "notes",
  //     key: "notes",
  //     render: (notas: string) =>
  //       notas?.length > 20 ? `${notas.slice(0, 20)}...` : notas || "-",
  //   },
  //   {
  //     title: "Acciones",
  //     key: "acciones",
  //     render: (_: unknown, record: Mantenimiento) =>
  //       user?.role === "ADMIN" ? (
  //         <Space>
  //           <Button
  //             onClick={(e) => {
  //               e.stopPropagation();
  //               handleEdit(record);
  //             }}
  //           >
  //             Editar
  //           </Button>
  //           <Popconfirm
  //             title="¿Seguro que quieres eliminar este mantenimiento?"
  //             onConfirm={(e) => {
  //               e?.stopPropagation();
  //               handleDelete(record.id);
  //             }}
  //             okText="Sí"
  //             cancelText="No"
  //           >
  //             <Button danger onClick={(e) => e.stopPropagation()}>
  //               Eliminar
  //             </Button>
  //           </Popconfirm>
  //         </Space>
  //       ) : null, // 👈 si no es admin, no se muestra nada
  //   },
  // ];

  return (
    <>
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Buscar mantenimiento"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filtrar por equipo"
            allowClear
            value={equipoFilter || undefined}
            onChange={(val) => setEquipoFilter(val || null)}
            style={{ width: 200 }}
          >
            {equipos.map((equipo) => (
              <Option key={equipo.id} value={equipo.id}>
                {equipo.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Filtrar por estado"
            allowClear
            value={estadoFilter || undefined}
            onChange={(val) => setEstadoFilter(val || null)}
            style={{ width: 200 }}
          >
            <Option value="COMPLETED">Completado</Option>
            <Option value="PENDING">Pendiente</Option>
            <Option value="IN_PROGRESS">En proceso</Option>
          </Select>
          <RangePicker
            onChange={(dates) =>
              setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
            }
            style={{ width: 300 }}
          />
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setIsAddModalVisible(true)}
          ></Button>
        </div>
      </div>

      {/* <Table
        rowKey="id"
        pagination={false}
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={filteredData}
        onRow={(record) => ({
          onClick: () => router.push(`/dashboard/mantenimientos/${record.id}`),
          className: "cursor-pointer hover:bg-gray-100 transition",
        })}
      /> */}

      <Table
        dataSource={filteredData}
        rowKey="id"
        pagination={false}
        scroll={{ x: "max-content" }}
        onRow={(record) => ({
          onClick: () => router.push(`/dashboard/mantenimientos/${record.id}`),
        })}
        columns={[
          {
            title: "Equipo",
            dataIndex: ["equipment", "name"],
            key: "equipment",
            align: "center",
            render: (text: string) => (
              <div className="truncate max-w-[150px] overflow-hidden text-center">
                {text}
              </div>
            ),
          },
          {
            title: "Fecha",
            dataIndex: "date",
            key: "date",
            render: (fecha: string) => (
              <div className="truncate max-w-[150px] overflow-hidden text-center">
                {fecha ? dayjs(fecha).format("DD/MM/YYYY") : "-"}
              </div>
            ),
            align: "center",
          },
          {
            title: "Nombre",
            dataIndex: "name",
            key: "name",
            align: "center",
            render: (text: string) => (
              <div className="truncate max-w-[150px] overflow-hidden text-center">
                {text}
              </div>
            ),
          },
          {
            title: "Estado",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (estado: string) => (
              <Tag
                className="truncate max-w-[150px] overflow-hidden text-center"
                color={getEstadoTagColor(estado)}
                style={{ textTransform: "capitalize" }}
              >
                {estado.replace("_", " ")}
              </Tag>
            ),
          },
          {
            title: "Notas",
            dataIndex: "notes",
            key: "notes",
            align: "center",
            render: (notas: string) => (
              <div className="truncate max-w-[150px] overflow-hidden text-center">
                {notas?.length > 20 ? `${notas.slice(0, 20)}...` : notas || "-"}
              </div>
            ),
          },
          {
            title: "Acciones",
            key: "acciones",
            align: "center",
            render: (_: unknown, record: Mantenimiento) =>
              user?.role === "ADMIN" ? (
                <Space className="truncate max-w-[150px] overflow-hidden text-center">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(record);
                    }}
                  >
                    Editar
                  </Button>
                  <Popconfirm
                    title="¿Seguro que quieres eliminar este mantenimiento?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDelete(record.id);
                    }}
                    okText="Sí"
                    cancelText="No"
                  >
                    <Button danger onClick={(e) => e.stopPropagation()}>
                      Eliminar
                    </Button>
                  </Popconfirm>
                </Space>
              ) : null,
          },
        ]}
      />

      {/* Modal Editar */}
      <Modal
        title="Editar mantenimiento"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="equipo"
            label="Equipo relacionado"
            rules={[{ required: true }]}
          >
            <Select>
              {equipos.map((equipo) => (
                <Option key={equipo.id} value={equipo.id}>
                  {equipo.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
            <Select>
              <Option value="COMPLETED">Completado</Option>
              <Option value="PENDING">Pendiente</Option>
              <Option value="IN_PROGRESS">En proceso</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notas" label="Notas">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Agregar */}
      <Modal
        title="Agregar mantenimiento"
        open={isAddModalVisible}
        onOk={handleAddSubmit}
        onCancel={() => setIsAddModalVisible(false)}
        okText="Agregar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="equipo"
            label="Equipo relacionado"
            rules={[{ required: true }]}
          >
            <Select>
              {equipos.map((equipo) => (
                <Option key={equipo.id} value={equipo.id}>
                  {equipo.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
            <Select>
              <Option value="COMPLETED">Completado</Option>
              <Option value="PENDING">Pendiente</Option>
              <Option value="IN_PROGRESS">En proceso</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notas" label="Notas">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modales: agregar y editar */}
      {/* Puedes conservar tus modales existentes aquí (omitidos por brevedad) */}
    </>
  );
};

export default withAuth(MaintenanceTable);
