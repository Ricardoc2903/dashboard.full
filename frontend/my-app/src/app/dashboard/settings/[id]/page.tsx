"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Grid,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
  Input,
  Select,
  DatePicker,
} from "antd";
import {
  ArrowLeftOutlined,
  MailOutlined,
  UserOutlined,
  ApartmentOutlined,
  ToolOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

type Role = "ADMIN" | "USER";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  createdAt?: string;
  userId?: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  acquiredAt: string | null;
  status: "ACTIVE" | "MAINTENANCE" | "OUT_OF_SERVICE";
  groupId?: string | null;
  userId: string;
  createdAt?: string;
  group?: Group | null;
}

interface MaintenanceFile {
  id: string;
  filename: string;
  url: string;
}

interface Maintenance {
  id: string;
  name: string;
  date: string; // ISO
  status: string;
  notes?: string;
  equipmentId: string;
  userId: string;
  files?: MaintenanceFile[];
  equipment?: Equipment & { group?: Group | null };
}

export default function UserOverviewWithClientFilters() {
  const screens = useBreakpoint();
  const router = useRouter();
  const params = useParams();

  const userId: string | undefined = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id as string | undefined);

  // raw collections
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [allEquipos, setAllEquipos] = useState<Equipment[]>([]);
  const [allManttos, setAllManttos] = useState<Maintenance[]>([]);
  const [allGrupos, setAllGrupos] = useState<Group[]>([]);

  const [loading, setLoading] = useState(true);

  // UI filters
  const [search, setSearch] = useState<string>("");
  const [estado, setEstado] = useState<Equipment["status"] | "ALL">("ALL");
  const [rango, setRango] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  // helper GET with token
  const apiGet = async <T,>(path: string) => {
    if (!API_BASE) throw new Error("Falta NEXT_PUBLIC_API_BASE_URL");
    const token = localStorage.getItem("token");
    const { data } = await axios.get<T>(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  };

  // fetch all once
  useEffect(() => {
    const run = async () => {
      try {
        if (!userId) return;

        const [u, e, m, g] = await Promise.all([
          apiGet<UserData[]>("/api/users"),
          apiGet<Equipment[]>("/api/equipos"),
          apiGet<Maintenance[]>("/api/mantenimientos"),
          apiGet<Group[]>("/api/grupos"),
        ]);

        setAllUsers(u);
        setAllEquipos(e);
        setAllManttos(m);
        setAllGrupos(g);

        // validar que exista el usuario
        const found = u.find((x) => x.id === userId);
        if (!found) {
          message.error("Usuario no encontrado");
          router.push("/dashboard/settings");
          return;
        }
      } catch (err: unknown) {
        const msg =
          (axios.isAxiosError(err) &&
            (err.response?.data as { message?: string })?.message) ||
          (axios.isAxiosError(err) && err.message) ||
          (err instanceof Error && err.message) ||
          "Error al cargar datos";
        message.error(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [userId, router]);

  // entity: current user
  const user: UserData | null = useMemo(
    () => (userId ? allUsers.find((u) => u.id === userId) ?? null : null),
    [allUsers, userId]
  );

  // derived filtered lists
  const equipos = useMemo(() => {
    let base = allEquipos.filter((e) => e.userId === userId);

    if (estado !== "ALL") base = base.filter((e) => e.status === estado);

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }

    const [from, to] = rango;
    if (from || to) {
      base = base.filter((e) => {
        const d = e.createdAt ? dayjs(e.createdAt) : e.acquiredAt ? dayjs(e.acquiredAt) : null;
        if (!d) return false;
        if (from && d.isBefore(from, "day")) return false;
        if (to && d.isAfter(to, "day")) return false;
        return true;
      });
    }

    return base.sort((a, b) => {
      const da = dayjs(a.createdAt ?? a.acquiredAt ?? 0).valueOf();
      const db = dayjs(b.createdAt ?? b.acquiredAt ?? 0).valueOf();
      return db - da;
    });
  }, [allEquipos, userId, estado, search, rango]);

  const mantenimientos = useMemo(() => {
    let base = allManttos.filter((m) => m.userId === userId);

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.notes?.toLowerCase().includes(q) ||
          m.equipment?.name?.toLowerCase().includes(q)
      );
    }

    const [from, to] = rango;
    if (from || to) {
      base = base.filter((m) => {
        const d = dayjs(m.date);
        if (from && d.isBefore(from, "day")) return false;
        if (to && d.isAfter(to, "day")) return false;
        return true;
      });
    }

    return base.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  }, [allManttos, userId, search, rango]);

  // groups by equipment of user
  const grupos = useMemo(() => {
    const groupIds = new Set(
      allEquipos.filter((e) => e.userId === userId && e.groupId).map((e) => e.groupId as string)
    );
    let base = allGrupos.filter((g) => groupIds.has(g.id));

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter((g) => g.name.toLowerCase().includes(q));
    }

    return base;
  }, [allGrupos, allEquipos, userId, search]);

  // KPIs
  const kpis = useMemo(
    () => [
      { key: "equipos", title: "Equipos creados", value: equipos.length, icon: <ApartmentOutlined /> },
      { key: "mantenimientos", title: "Mantenimientos", value: mantenimientos.length, icon: <ToolOutlined /> },
      { key: "grupos", title: "Grupos relacionados", value: grupos.length, icon: <FolderOpenOutlined /> },
    ],
    [equipos.length, mantenimientos.length, grupos.length]
  );

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Spin />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Usuario no encontrado" />
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => router.push("/dashboard/settings")}>
          Volver a configuración
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Breadcrumb
          items={[
            { title: <a onClick={() => router.push("/dashboard")}>Dashboard</a> },
            { title: <a onClick={() => router.push("/dashboard/settings")}>Configuración</a> },
            { title: "Usuario" },
          ]}
        />
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Volver
        </Button>
      </Space>

      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <Title level={3} style={{ marginBottom: 0 }}>
          <UserOutlined /> {user.name}
        </Title>
        <Text type="secondary">
          <MailOutlined /> {user.email} &nbsp;•&nbsp; Rol:{" "}
          <Tag color={user.role === "ADMIN" ? "gold" : "blue"}>{user.role}</Tag>
        </Text>
      </div>

      {/* Filtros */}
      <Card style={{ marginTop: 12, marginBottom: 12 }}>
        <Space wrap>
          <Input
            placeholder="Buscar (nombre, tipo, ubicación, notas…) "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />
          <Select
            value={estado}
            onChange={(v) => setEstado(v)}
            style={{ width: 220 }}
            options={[
              { value: "ALL", label: "Todos los estados (equipos)" },
              { value: "ACTIVE", label: "Activo" },
              { value: "MAINTENANCE", label: "Mantenimiento" },
              { value: "OUT_OF_SERVICE", label: "Fuera de servicio" },
            ]}
          />
          <DatePicker.RangePicker
            value={rango}
            onChange={(vals) => setRango([vals?.[0] ?? null, vals?.[1] ?? null])}
            allowEmpty={[true, true]}
          />
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {kpis.map((k) => (
          <Col xs={24} sm={12} md={8} key={k.key}>
            <Card>
              <Space size="small">
                {k.icon}
                <Text type="secondary">{k.title}</Text>
              </Space>
              <Title level={screens.md ? 3 : 4} style={{ marginTop: 8 }}>
                {k.value}
              </Title>
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="Datos del usuario">
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="Nombre">{user.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              <Descriptions.Item label="Rol">
                <Tag color={user.role === "ADMIN" ? "gold" : "blue"}>{user.role}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Creado">
                {new Date(user.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Equipos creados (filtrados)">
            <Table<Equipment>
              dataSource={equipos}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: "Nombre", dataIndex: "name" },
                { title: "Tipo", dataIndex: "type" },
                { title: "Ubicación", dataIndex: "location" },
                {
                  title: "Estado",
                  dataIndex: "status",
                  render: (s: Equipment["status"]) => {
                    const color = s === "ACTIVE" ? "green" : s === "MAINTENANCE" ? "orange" : "red";
                    return <Tag color={color}>{s}</Tag>;
                  },
                },
                {
                  title: "Grupo",
                  dataIndex: ["group", "name"],
                  render: (_: unknown, r: Equipment) => r.group?.name || <Text type="secondary">—</Text>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Mantenimientos (filtrados)">
            <Table<Maintenance>
              dataSource={mantenimientos}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: "Nombre", dataIndex: "name" },
                {
                  title: "Fecha",
                  dataIndex: "date",
                  render: (d: string) => new Date(d).toLocaleString(),
                },
                {
                  title: "Estado",
                  dataIndex: "status",
                  render: (s: string) => <Tag>{s}</Tag>,
                },
                {
                  title: "Equipo",
                  dataIndex: ["equipment", "name"],
                  render: (_: unknown, r: Maintenance) => r.equipment?.name || <Text type="secondary">—</Text>,
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Grupos relacionados (por equipos filtrados)">
            <Table<Group>
              dataSource={grupos}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: "Nombre", dataIndex: "name" },
                {
                  title: "Creado",
                  dataIndex: "createdAt",
                  render: (d?: string) =>
                    d ? new Date(d).toLocaleString() : <Text type="secondary">—</Text>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
