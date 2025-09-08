// "use client";

// import { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import {
//   Row,
//   Col,
//   Card,
//   Statistic,
//   Typography,
//   Table,
//   Tag,
//   Select,
//   message,
// } from "antd";
// // 👇 Import con namespace (clave para que TS no se confunda con JSX)
// import * as Recharts from "recharts";
// import { ToolOutlined, ApartmentOutlined } from "@ant-design/icons";
// import dayjs from "dayjs";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import withAuth from "@/hoc/withAuth";

// const { Title, Text } = Typography;
// const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

// interface UserLite { id: string; name: string; email: string; }
// interface GroupLite { id: string; name: string; }

// interface Equipment {
//   id: string;
//   name: string;
//   type: string;
//   location: string;
//   acquiredAt: string | null;
//   status: "ACTIVE" | "MAINTENANCE" | "OUT_OF_SERVICE";
//   group?: GroupLite | null;
//   user?: UserLite | null;
//   createdAt?: string;
// }

// interface Maintenance {
//   id: string;
//   name: string;
//   date: string; // ISO
//   status: string;
//   notes?: string;
//   equipment?: { id: string; name: string } | null;
//   user?: UserLite | null;
// }

// interface TopCreator { userId: string; name: string; email: string; count: number; }
// interface TrendPoint { day: string; count: number; }

// function ChartsPage() {
//   const router = useRouter();

//   const [loading, setLoading] = useState(true);
//   const [totalMaint, setTotalMaint] = useState(0);
//   const [totalEquip, setTotalEquip] = useState(0);
//   const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
//   const [trend, setTrend] = useState<TrendPoint[]>([]);
//   const [latestMaint, setLatestMaint] = useState<Maintenance[]>([]);
//   const [latestEquip, setLatestEquip] = useState<Equipment[]>([]);
//   const [days, setDays] = useState(30);

//   const authHeaders = () => {
//     const token = localStorage.getItem("token");
//     return { headers: { Authorization: `Bearer ${token}` } };
//   };

//   const fetchAll = async (d = days) => {
//     if (!API_BASE) {
//       message.error("Falta NEXT_PUBLIC_API_BASE_URL");
//       return;
//     }
//     setLoading(true);
//     try {
//       const [
//         totalM,
//         totalE,
//         top,
//         series,
//         lastM,
//         lastE,
//       ] = await Promise.all([
//         axios.get<{ total: number }>(`${API_BASE}/api/stats/total-mantenimientos`, authHeaders()).then(r => r.data),
//         axios.get<{ total: number }>(`${API_BASE}/api/stats/total-equipos`, authHeaders()).then(r => r.data),
//         axios.get<TopCreator[]>(`${API_BASE}/api/stats/top-creators?limit=5`, authHeaders()).then(r => r.data),
//         axios.get<TrendPoint[]>(`${API_BASE}/api/stats/maintenances-trend?days=${d}`, authHeaders()).then(r => r.data),
//         axios.get<Maintenance[]>(`${API_BASE}/api/stats/latest-maintenance?limit=5`, authHeaders()).then(r => r.data),
//         axios.get<Equipment[]>(`${API_BASE}/api/stats/latest-equipos?limit=5`, authHeaders()).then(r => r.data),
//       ]);

//       setTotalMaint(totalM.total);
//       setTotalEquip(totalE.total);
//       setTopCreators(top);
//       setTrend(series);
//       setLatestMaint(lastM);
//       setLatestEquip(lastE);
//     } catch (e) {
//       console.error(e);
//       message.error("Error al cargar estadísticas");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAll(days);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     (async () => {
//       if (!API_BASE) return;
//       try {
//         const series = await axios
//           .get<TrendPoint[]>(`${API_BASE}/api/stats/maintenances-trend?days=${days}`, authHeaders())
//           .then(r => r.data);
//         setTrend(series);
//       } catch {
//         message.error("Error al actualizar la tendencia");
//       }
//     })();
//   }, [days]);

//   const trendFormatted = useMemo(
//     () => trend.map(p => ({ ...p, label: dayjs(p.day).format("DD/MM") })),
//     [trend]
//   );

//   return (
//     <div style={{ padding: 24 }}>
//       <div style={{ marginBottom: 8 }}>
//         <Title level={3} style={{ marginBottom: 0 }}>Reportes & Gráficos</Title>
//         <Text type="secondary">Resumen visual de actividad y últimos cambios.</Text>
//       </div>

//       {/* KPIs */}
//       <Row gutter={[16, 16]}>
//         <Col xs={24} md={12}>
//           <Card>
//             <Statistic
//               title="Mantenimientos totales"
//               value={totalMaint}
//               prefix={<ToolOutlined />}
//               loading={loading}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} md={12}>
//           <Card>
//             <Statistic
//               title="Equipos totales"
//               value={totalEquip}
//               prefix={<ApartmentOutlined />}
//               loading={loading}
//             />
//           </Card>
//         </Col>
//       </Row>

//       {/* Charts */}
//       <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
//         <Col xs={24} lg={12}>
//           <Card
//             title="Mayores creadores de mantenimientos"
//             extra={<Text type="secondary">Top 5</Text>}
//             loading={loading}
//           >
//             <div style={{ width: "100%", height: 320 }}>
//               <Recharts.ResponsiveContainer>
//                 <Recharts.BarChart data={topCreators} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
//                   <Recharts.CartesianGrid strokeDasharray="3 3" />
//                   <Recharts.XAxis dataKey="name" />
//                   <Recharts.YAxis allowDecimals={false} />
//                   <Recharts.Tooltip />
//                   <Recharts.Bar dataKey="count" />
//                 </Recharts.BarChart>
//               </Recharts.ResponsiveContainer>
//             </div>
//           </Card>
//         </Col>

//         <Col xs={24} lg={12}>
//           <Card
//             title="Últimos mantenimientos"
//             extra={
//               <Select
//                 size="small"
//                 value={days}
//                 onChange={setDays}
//                 options={[
//                   { value: 7, label: "7 días" },
//                   { value: 14, label: "14 días" },
//                   { value: 30, label: "30 días" },
//                   { value: 60, label: "60 días" },
//                 ]}
//               />
//             }
//             loading={loading}
//           >
//             <div style={{ width: "100%", height: 320 }}>
//               <Recharts.ResponsiveContainer>
//                 <Recharts.AreaChart data={trendFormatted} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
//                   <defs>
//                     <linearGradient id="colorCnt" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="var(--ant-primary-color, #1677ff)" stopOpacity={0.4}/>
//                       <stop offset="95%" stopColor="var(--ant-primary-color, #1677ff)" stopOpacity={0.05}/>
//                     </linearGradient>
//                   </defs>
//                   <Recharts.CartesianGrid strokeDasharray="3 3" />
//                   <Recharts.XAxis dataKey="label" />
//                   <Recharts.YAxis allowDecimals={false} />
//                   <Recharts.Tooltip />
//                   <Recharts.Area type="monotone" dataKey="count" stroke="var(--ant-primary-color, #1677ff)" fill="url(#colorCnt)" />
//                 </Recharts.AreaChart>
//               </Recharts.ResponsiveContainer>
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       {/* Últimos 5 */}
//       <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
//         <Col xs={24} lg={12}>
//           <Card title="Últimos 5 mantenimientos" loading={loading}>
//             <Table<Maintenance>
//               dataSource={latestMaint}
//               rowKey="id"
//               size="small"
//               pagination={false}
//               onRow={(record) => ({
//                 onClick: () => router.push(`/dashboard/mantenimientos/${record.id}`),
//                 style: { cursor: "pointer" },
//               })}
//               columns={[
//                 {
//                   title: "Nombre",
//                   dataIndex: "name",
//                   render: (_: unknown, r) => (
//                     <Link
//                       href={`/dashboard/mantenimientos/${r.id}`}
//                       style={{ color: "inherit", textDecoration: "none" }}
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       {r.name}
//                     </Link>
//                   ),
//                 },
//                 {
//                   title: "Fecha",
//                   dataIndex: "date",
//                   render: (d: string) => dayjs(d).format("DD/MM/YYYY HH:mm"),
//                 },
//                 {
//                   title: "Usuario",
//                   dataIndex: ["user", "name"],
//                   render: (_: unknown, r) =>
//                     r.user ? (
//                       <Link
//                         href={`/dashboard/settings/${r.user.id}`}
//                         style={{ color: "inherit", textDecoration: "none" }}
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         {r.user.name}
//                       </Link>
//                     ) : (
//                       <Text type="secondary">—</Text>
//                     ),
//                 },
//                 {
//                   title: "Equipo",
//                   dataIndex: ["equipment", "name"],
//                   render: (_: unknown, r) =>
//                     r.equipment ? (
//                       <Link
//                         href={`/dashboard/equipos/${r.equipment.id}`}
//                         style={{ color: "inherit", textDecoration: "none" }}
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         {r.equipment.name}
//                       </Link>
//                     ) : (
//                       <Text type="secondary">—</Text>
//                     ),
//                 },
//                 {
//                   title: "Estado",
//                   dataIndex: "status",
//                   render: (s: string) => <Tag>{s}</Tag>,
//                 },
//               ]}
//             />
//           </Card>
//         </Col>

//         <Col xs={24} lg={12}>
//           <Card title="Últimos 5 equipos" loading={loading}>
//             <Table<Equipment>
//               dataSource={latestEquip}
//               rowKey="id"
//               size="small"
//               pagination={false}
//               onRow={(record) => ({
//                 onClick: () => router.push(`/dashboard/equipos/${record.id}`),
//                 style: { cursor: "pointer" },
//               })}
//               columns={[
//                 {
//                   title: "Nombre",
//                   dataIndex: "name",
//                   render: (_: unknown, r) => (
//                     <Link
//                       href={`/dashboard/equipos/${r.id}`}
//                       style={{ color: "inherit", textDecoration: "none" }}
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       {r.name}
//                     </Link>
//                   ),
//                 },
//                 { title: "Tipo", dataIndex: "type" },
//                 {
//                   title: "Creado",
//                   dataIndex: "createdAt",
//                   render: (d?: string) =>
//                     d ? dayjs(d).format("DD/MM/YYYY HH:mm") : <Text type="secondary">—</Text>,
//                 },
//                 {
//                   title: "Usuario",
//                   dataIndex: ["user", "name"],
//                   render: (_: unknown, r) =>
//                     r.user ? (
//                       <Link
//                         href={`/dashboard/settings/${r.user.id}`}
//                         style={{ color: "inherit", textDecoration: "none" }}
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         {r.user.name}
//                       </Link>
//                     ) : (
//                       <Text type="secondary">—</Text>
//                     ),
//                 },
//                 {
//                   title: "Grupo",
//                   dataIndex: ["group", "name"],
//                   render: (_: unknown, r) => r.group?.name ?? <Text type="secondary">—</Text>,
//                 },
//                 {
//                   title: "Estado",
//                   dataIndex: "status",
//                   render: (s: Equipment["status"]) => {
//                     const color = s === "ACTIVE" ? "green" : s === "MAINTENANCE" ? "orange" : "red";
//                     return <Tag color={color}>{s}</Tag>;
//                   },
//                 },
//               ]}
//             />
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// }

// export default withAuth(ChartsPage);

"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Table,
  Tag,
  Select,
  message,
  theme,
} from "antd";
import * as Recharts from "recharts";
import { ToolOutlined, ApartmentOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";

const { Title, Text } = Typography;
const { useToken } = theme;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

interface UserLite {
  id: string;
  name: string;
  email: string;
}
interface GroupLite {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  acquiredAt: string | null;
  status: "ACTIVE" | "MAINTENANCE" | "OUT_OF_SERVICE";
  group?: GroupLite | null;
  user?: UserLite | null;
  createdAt?: string;
}

interface Maintenance {
  id: string;
  name: string;
  date: string; // ISO
  status: string;
  notes?: string;
  equipment?: { id: string; name: string } | null;
  user?: UserLite | null;
}

interface TopCreator {
  userId: string;
  name: string;
  email: string;
  count: number;
}
interface TrendPoint {
  day: string;
  count: number;
}

function ChartsPage() {
  const router = useRouter();
  const { token } = useToken();

  // Colores desde el tema (fallbacks por si acaso)
  const PRIMARY = token.colorPrimary || "#1677ff";
  const GRID = token.colorSplit || "#f0f0f0";
  const TEXT = token.colorText || "#1f1f1f";

  const [loading, setLoading] = useState(true);
  const [totalMaint, setTotalMaint] = useState(0);
  const [totalEquip, setTotalEquip] = useState(0);
  const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [latestMaint, setLatestMaint] = useState<Maintenance[]>([]);
  const [latestEquip, setLatestEquip] = useState<Equipment[]>([]);
  const [days, setDays] = useState(30);

  const authHeaders = () => {
    const tokenLS = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${tokenLS}` } };
  };

  const fetchAll = async (d = days) => {
    if (!API_BASE) {
      message.error("Falta NEXT_PUBLIC_API_BASE_URL");
      return;
    }
    setLoading(true);
    try {
      const [totalM, totalE, top, series, lastM, lastE] = await Promise.all([
        axios
          .get<{ total: number }>(
            `${API_BASE}/api/stats/total-mantenimientos`,
            authHeaders()
          )
          .then((r) => r.data),
        axios
          .get<{ total: number }>(
            `${API_BASE}/api/stats/total-equipos`,
            authHeaders()
          )
          .then((r) => r.data),
        axios
          .get<TopCreator[]>(
            `${API_BASE}/api/stats/top-creators?limit=5`,
            authHeaders()
          )
          .then((r) => r.data),
        axios
          .get<TrendPoint[]>(
            `${API_BASE}/api/stats/maintenances-trend?days=${d}`,
            authHeaders()
          )
          .then((r) => r.data),
        axios
          .get<Maintenance[]>(
            `${API_BASE}/api/stats/latest-maintenance?limit=5`,
            authHeaders()
          )
          .then((r) => r.data),
        axios
          .get<Equipment[]>(
            `${API_BASE}/api/stats/latest-equipos?limit=5`,
            authHeaders()
          )
          .then((r) => r.data),
      ]);

      setTotalMaint(totalM.total);
      setTotalEquip(totalE.total);
      setTopCreators(top);
      setTrend(series);
      setLatestMaint(lastM);
      setLatestEquip(lastE);
    } catch (e) {
      console.error(e);
      message.error("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      if (!API_BASE) return;
      try {
        const series = await axios
          .get<TrendPoint[]>(
            `${API_BASE}/api/stats/maintenances-trend?days=${days}`,
            authHeaders()
          )
          .then((r) => r.data);
        setTrend(series);
      } catch {
        message.error("Error al actualizar la tendencia");
      }
    })();
  }, [days]);

  const trendFormatted = useMemo(
    () => trend.map((p) => ({ ...p, label: dayjs(p.day).format("DD/MM") })),
    [trend]
  );

  // Helpers tooltip
  const fmtNumber = (n: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 8 }}>
        <Title level={3} style={{ marginBottom: 0 }}>
          Reportes & Gráficos
        </Title>
        <Text type="secondary">
          Resumen visual de actividad y últimos cambios.
        </Text>
      </div>

      {/* KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card>
            <Statistic
              title="Mantenimientos totales"
              value={totalMaint}
              prefix={<ToolOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Statistic
              title="Equipos totales"
              value={totalEquip}
              prefix={<ApartmentOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Mayores creadores de mantenimientos"
            extra={<Text type="secondary">Top 5</Text>}
            loading={loading}
            bodyStyle={{ paddingBottom: 0 }}
          >
            <div style={{ width: "100%", height: 320 }}>
              <Recharts.ResponsiveContainer>
                <Recharts.BarChart
                  data={topCreators}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Recharts.CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                  <Recharts.XAxis dataKey="name" tick={{ fill: TEXT }} />
                  <Recharts.YAxis
                    allowDecimals={false}
                    tick={{ fill: TEXT }}
                    tickFormatter={(v) => fmtNumber(v as number)}
                  />
                  <Recharts.Tooltip
                    contentStyle={{ borderRadius: 8, borderColor: GRID }}
                    // ⬇️ Solo usamos value
                    formatter={(value) => {
                      const v = Array.isArray(value) ? value[0] : value;
                      return [fmtNumber(Number(v)), "Mantenimientos"];
                    }}
                    labelFormatter={(label) => `Usuario: ${label}`}
                  />

                  <Recharts.Bar
                    dataKey="count"
                    fill={PRIMARY}
                    radius={[6, 6, 0, 0]}
                  />
                </Recharts.BarChart>
              </Recharts.ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Últimos mantenimientos"
            extra={
              <Select
                size="small"
                value={days}
                onChange={setDays}
                options={[
                  { value: 7, label: "7 días" },
                  { value: 14, label: "14 días" },
                  { value: 30, label: "30 días" },
                  { value: 60, label: "60 días" },
                ]}
              />
            }
            loading={loading}
            bodyStyle={{ paddingBottom: 0 }}
          >
            <div style={{ width: "100%", height: 320 }}>
              <Recharts.ResponsiveContainer>
                <Recharts.AreaChart
                  data={trendFormatted}
                  margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCnt" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={PRIMARY}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor={PRIMARY}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <Recharts.CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                  <Recharts.XAxis dataKey="label" tick={{ fill: TEXT }} />
                  <Recharts.YAxis
                    allowDecimals={false}
                    tick={{ fill: TEXT }}
                    tickFormatter={(v) => fmtNumber(v as number)}
                  />
                  <Recharts.Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: GRID,
                    }}
                    formatter={(value) => [
                      fmtNumber(Number(value)),
                      "Mantenimientos",
                    ]}
                    labelFormatter={(lbl, payload) => {
                      const p = payload && payload[0];
                      const original = p?.payload?.day as string | undefined;
                      return original
                        ? `Fecha: ${dayjs(original).format("DD/MM/YYYY")}`
                        : `Día: ${lbl}`;
                    }}
                  />
                  <Recharts.Area
                    type="monotone"
                    dataKey="count"
                    stroke={PRIMARY}
                    strokeWidth={2}
                    fill="url(#colorCnt)"
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </Recharts.AreaChart>
              </Recharts.ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Últimos 5 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Últimos 5 mantenimientos"
            loading={loading}
            bodyStyle={{ paddingBottom: 0 }}
          >
            <Table<Maintenance>
              dataSource={latestMaint}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: true }} // ✅ evita overflow
              onRow={(record) => ({
                onClick: () =>
                  router.push(`/dashboard/mantenimientos/${record.id}`),
                style: { cursor: "pointer" },
              })}
              columns={[
                {
                  title: "Nombre",
                  dataIndex: "name",
                  ellipsis: true,
                  render: (_: string, r) => (
                    <Link
                      href={`/dashboard/mantenimientos/${r.id}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {r.name}
                    </Link>
                  ),
                },
                {
                  title: "Fecha",
                  dataIndex: "date",
                  width: 180,
                  render: (d: string) => dayjs(d).format("DD/MM/YYYY HH:mm"),
                },
                {
                  title: "Usuario",
                  dataIndex: ["user", "name"],
                  ellipsis: true,
                  responsive: ["md"], // ✅ oculta en mobile
                  render: (_: string | undefined, r) =>
                    r.user ? (
                      <Link
                        href={`/dashboard/settings/${r.user.id}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.user.name}
                      </Link>
                    ) : (
                      <Text type="secondary">—</Text>
                    ),
                },
                {
                  title: "Equipo",
                  dataIndex: ["equipment", "name"],
                  ellipsis: true,
                  responsive: ["lg"], // ✅ oculta en tablets chicas
                  render: (_: string | undefined, r) =>
                    r.equipment ? (
                      <Link
                        href={`/dashboard/equipos/${r.equipment.id}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.equipment.name}
                      </Link>
                    ) : (
                      <Text type="secondary">—</Text>
                    ),
                },
                {
                  title: "Estado",
                  dataIndex: "status",
                  width: 120,
                  render: (s: string) => <Tag>{s}</Tag>,
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Últimos 5 equipos"
            loading={loading}
            bodyStyle={{ paddingBottom: 0 }}
          >
            <Table<Equipment>
              dataSource={latestEquip}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: true }} // ✅ evita overflow
              onRow={(record) => ({
                onClick: () => router.push(`/dashboard/equipos/${record.id}`),
                style: { cursor: "pointer" },
              })}
              columns={[
                {
                  title: "Nombre",
                  dataIndex: "name",
                  ellipsis: true,
                  render: (_: string, r) => (
                    <Link
                      href={`/dashboard/equipos/${r.id}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {r.name}
                    </Link>
                  ),
                },
                {
                  title: "Tipo",
                  dataIndex: "type",
                  ellipsis: true,
                  responsive: ["md"],
                },
                {
                  title: "Creado",
                  dataIndex: "createdAt",
                  width: 180,
                  render: (d?: string) =>
                    d ? (
                      dayjs(d).format("DD/MM/YYYY HH:mm")
                    ) : (
                      <Text type="secondary">—</Text>
                    ),
                },
                {
                  title: "Usuario",
                  dataIndex: ["user", "name"],
                  ellipsis: true,
                  responsive: ["lg"],
                  render: (_: string | undefined, r) =>
                    r.user ? (
                      <Link
                        href={`/dashboard/settings/${r.user.id}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.user.name}
                      </Link>
                    ) : (
                      <Text type="secondary">—</Text>
                    ),
                },
                {
                  title: "Grupo",
                  dataIndex: ["group", "name"],
                  ellipsis: true,
                  responsive: ["lg"],
                  render: (_: string | undefined, r) =>
                    r.group?.name ?? <Text type="secondary">—</Text>,
                },
                {
                  title: "Estado",
                  dataIndex: "status",
                  width: 120,
                  render: (s: Equipment["status"]) => {
                    const color =
                      s === "ACTIVE"
                        ? "green"
                        : s === "MAINTENANCE"
                        ? "orange"
                        : "red";
                    return <Tag color={color}>{s}</Tag>;
                  },
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default withAuth(ChartsPage);
