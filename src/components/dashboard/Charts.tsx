import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, LabelList,
} from "recharts";
import type { InspectionRecord } from "@/types/inspection";
import { getMonthLabel, getMonthOrder } from "@/utils/parseExcel";

/* ── Color palette ── */
const STATUS_COLORS: Record<string, string> = {
  "Apto": "hsl(152, 60%, 40%)",
  "Não Apto": "hsl(0, 68%, 52%)",
  "Sucata": "hsl(220, 8%, 52%)",
};

const BAR_PALETTE = [
  "hsl(215, 75%, 50%)",
  "hsl(200, 80%, 50%)",
  "hsl(190, 70%, 42%)",
  "hsl(175, 55%, 45%)",
  "hsl(160, 50%, 42%)",
  "hsl(36, 90%, 52%)",
  "hsl(25, 80%, 50%)",
  "hsl(262, 55%, 55%)",
];

/* ── Shared tooltip style ── */
const tooltipStyle = {
  contentStyle: {
    background: "hsl(0, 0%, 100%)",
    border: "1px solid hsl(220, 15%, 91%)",
    borderRadius: "10px",
    boxShadow: "0 8px 30px -12px rgba(0,0,0,0.12)",
    fontSize: 12,
    padding: "10px 14px",
  },
  cursor: { fill: "hsl(215, 75%, 50%, 0.04)" },
};

const gridStroke = "hsl(220, 15%, 92%)";
const axisStyle = { fontSize: 11, fill: "hsl(220, 10%, 46%)" };

/* ── Custom tooltip ── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle.contentStyle}>
      <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 12 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill, fontSize: 12, margin: "2px 0" }}>
          {p.name || "Qtd"}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ── Helpers ── */
function countBy(data: InspectionRecord[], key: keyof InspectionRecord) {
  const map: Record<string, number> = {};
  data.forEach((d) => {
    const k = String(d[key]) || "N/A";
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

/* ── Wrapper Card ── */
function ChartCard({ title, subtitle, children, className = "h-72" }: { title: string; subtitle?: string; children: React.ReactElement; className?: string }) {
  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow print:break-inside-avoid print:shadow-none">
      <CardHeader className="pb-2 pt-4 px-5 border-b border-border/60">
        <CardTitle className="text-sm font-bold tracking-wide uppercase text-foreground flex items-center gap-2">
          <span className="inline-block h-3 w-1 rounded-sm bg-primary" />
          {title}
        </CardTitle>
        {subtitle && <p className="text-[11px] text-muted-foreground font-medium">{subtitle}</p>}
      </CardHeader>
      <CardContent className={`px-3 pt-3 pb-4 ${className}`}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ── Value label renderer ── */
const renderBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (!value) return null;
  return (
    <text x={x + width + 6} y={y + height / 2} fill="hsl(220, 10%, 46%)" fontSize={11} fontWeight={600} dominantBaseline="central">
      {value}
    </text>
  );
};

const renderVerticalBarLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 8} fill="hsl(220, 10%, 46%)" fontSize={11} fontWeight={600} textAnchor="middle">
      {value}
    </text>
  );
};

/* ── 1. Inspeções por Equipamento ── */
export function ChartInspecoesPorEquipamento({ data }: { data: InspectionRecord[] }) {
  const chartData = countBy(data, "equipamento").sort((a, b) => b.value - a.value);
  return (
    <ChartCard title="Inspeções por Equipamento">
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 40, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
        <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={90} tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name="Inspeções" radius={[0, 6, 6, 0]} barSize={20}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
          ))}
          <LabelList dataKey="value" content={renderBarLabel} />
        </Bar>
      </BarChart>
    </ChartCard>
  );
}

/* ── 2. Status Pizza ── */
export function ChartStatusPizza({ data }: { data: InspectionRecord[] }) {
  const chartData = countBy(data, "status");
  const total = chartData.reduce((s, d) => s + d.value, 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="#fff">
        {value} ({`${(percent * 100).toFixed(0)}%`})
      </text>
    );
  };

  return (
    <ChartCard title="Status dos Equipamentos">
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} labelLine={false} label={renderLabel} strokeWidth={2} stroke="hsl(0,0%,100%)">
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#999"} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(value: string) => {
          const item = chartData.find(d => d.name === value);
          const pct = total > 0 && item ? ((item.value / total) * 100).toFixed(1) : "0";
          return <span style={{ fontSize: 12, color: "hsl(220, 10%, 46%)" }}>{value} — {item?.value || 0} ({pct}%)</span>;
        }} />
      </PieChart>
    </ChartCard>
  );
}

/* ── 3. Motivo ── */
export function ChartMotivo({ data }: { data: InspectionRecord[] }) {
  const chartData = countBy(data, "motivoInspecao").sort((a, b) => b.value - a.value);
  return (
    <ChartCard title="Inspeções por Motivo">
      <BarChart data={chartData} margin={{ left: 0, right: 16, top: 20, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name="Inspeções" radius={[6, 6, 0, 0]} barSize={36}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
          ))}
          <LabelList dataKey="value" content={renderVerticalBarLabel} />
        </Bar>
      </BarChart>
    </ChartCard>
  );
}

/* ── 4. Evolução Mensal ── */
export function ChartEvolucaoMensal({ data }: { data: InspectionRecord[] }) {
  const map: Record<string, { apto: number; naoApto: number; sucata: number; total: number }> = {};
  data.forEach((d) => {
    const label = getMonthLabel(d.mes);
    if (!map[label]) map[label] = { apto: 0, naoApto: 0, sucata: 0, total: 0 };
    map[label].total++;
    if (d.status === "Apto") map[label].apto++;
    else if (d.status === "Não Apto") map[label].naoApto++;
    else map[label].sucata++;
  });
  const chartData = Object.entries(map)
    .map(([name, v]) => ({ name, ...v, order: getMonthOrder(name) }))
    .sort((a, b) => a.order - b.order);

  return (
    <ChartCard title="Evolução Mensal por Status">
      <LineChart data={chartData} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(value: string) => <span style={{ fontSize: 12, color: "hsl(220, 10%, 46%)" }}>{value}</span>} />
        <Line type="monotone" dataKey="apto" name="Apto" stroke="hsl(152,60%,40%)" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }}>
          <LabelList dataKey="apto" position="top" style={{ fontSize: 10, fontWeight: 600, fill: "hsl(152,60%,40%)" }} />
        </Line>
        <Line type="monotone" dataKey="naoApto" name="Não Apto" stroke="hsl(0,68%,52%)" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }}>
          <LabelList dataKey="naoApto" position="top" style={{ fontSize: 10, fontWeight: 600, fill: "hsl(0,68%,52%)" }} />
        </Line>
        <Line type="monotone" dataKey="sucata" name="Sucata" stroke="hsl(220,8%,52%)" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }}>
          <LabelList dataKey="sucata" position="top" style={{ fontSize: 10, fontWeight: 600, fill: "hsl(220,8%,52%)" }} />
        </Line>
      </LineChart>
    </ChartCard>
  );
}

/* ── 5. Defeitos ── */
export function ChartDefeitos({ data }: { data: InspectionRecord[] }) {
  const map: Record<string, number> = {};
  data.forEach((d) => {
    if (d.defeito) map[d.defeito] = (map[d.defeito] || 0) + 1;
  });
  const chartData = Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <ChartCard title="Defeitos Mais Frequentes">
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 40, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
        <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={130} tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name="Ocorrências" radius={[0, 6, 6, 0]} barSize={18}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={`hsl(0, ${60 + i * 3}%, ${48 + i * 2}%)`} />
          ))}
          <LabelList dataKey="value" content={renderBarLabel} />
        </Bar>
      </BarChart>
    </ChartCard>
  );
}

/* ── 6. Inspeções por Colaborador ── */
export function ChartColaborador({ data }: { data: InspectionRecord[] }) {
  const chartData = countBy(data, "colaborador").sort((a, b) => b.value - a.value);
  return (
    <ChartCard title="Inspeções por Colaborador">
      <BarChart data={chartData} margin={{ left: 0, right: 16, top: 20, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name="Inspeções" radius={[6, 6, 0, 0]} barSize={36}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
          ))}
          <LabelList dataKey="value" content={renderVerticalBarLabel} />
        </Bar>
      </BarChart>
    </ChartCard>
  );
}

export function ChartTalhasCriticas({
  data,
}: {
  data: InspectionRecord[];
}) {
  const map: Record<string, number> = {};

  data.forEach((d) => {
    if (
      d.status === "Não Apto" ||
      d.status === "Sucata"
    ) {
      map[d.equipamento] =
        (map[d.equipamento] || 0) + 1;
    }
  });

  const chartData = Object.entries(map)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <ChartCard
      title="Top 10 Talhas Críticas"
      subtitle="Equipamentos com maior número de reprovações"
    >
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{
          left: 10,
          right: 40,
          top: 10,
          bottom: 10,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={gridStroke}
          horizontal={false}
        />

        <XAxis
          type="number"
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />

        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          content={<CustomTooltip />}
        />

        <Bar
          dataKey="value"
          name="Ocorrências"
          radius={[0, 6, 6, 0]}
          barSize={22}
        >
          {chartData.map((_, index) => (
            <Cell
              key={index}
              fill={`hsl(0, ${
                70 + index * 2
              }%, ${
                55 - index
              }%)`}
            />
          ))}

          <LabelList
            dataKey="value"
            content={renderBarLabel}
          />
        </Bar>
      </BarChart>
    </ChartCard>
  );
}
