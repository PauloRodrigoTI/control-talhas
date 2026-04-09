import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import type { InspectionRecord } from "@/types/inspection";
import { getMonthLabel, getMonthOrder } from "@/utils/parseExcel";

const COLORS_STATUS: Record<string, string> = {
  "Apto": "hsl(145, 63%, 42%)",
  "Não Apto": "hsl(0, 72%, 51%)",
  "Sucata": "hsl(215, 10%, 55%)",
};

function countBy(data: InspectionRecord[], key: keyof InspectionRecord) {
  const map: Record<string, number> = {};
  data.forEach((d) => {
    const k = String(d[key]) || "N/A";
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function ChartInspecoesPorEquipamento({ data }: { data: InspectionRecord[] }) {
  const chartData = countBy(data, "equipamento");
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Inspeções por Equipamento</CardTitle></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(210,70%,45%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ChartStatusPizza({ data }: { data: InspectionRecord[] }) {
  const chartData = countBy(data, "status");
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Status dos Equipamentos</CardTitle></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={COLORS_STATUS[entry.name] || "#999"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ChartMotivo({ data }: { data: InspectionRecord[] }) {
  const chartData = countBy(data, "motivoInspecao");
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Inspeções por Motivo</CardTitle></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(210,70%,45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ChartEvolucaoMensal({ data }: { data: InspectionRecord[] }) {
  const map: Record<string, { apto: number; naoApto: number; sucata: number }> = {};
  data.forEach((d) => {
    const label = getMonthLabel(d.mes);
    if (!map[label]) map[label] = { apto: 0, naoApto: 0, sucata: 0 };
    if (d.status === "Apto") map[label].apto++;
    else if (d.status === "Não Apto") map[label].naoApto++;
    else map[label].sucata++;
  });
  const chartData = Object.entries(map)
    .map(([name, v]) => ({ name, ...v, order: getMonthOrder(name) }))
    .sort((a, b) => a.order - b.order);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Evolução Mensal</CardTitle></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="apto" name="Apto" stroke="hsl(145,63%,42%)" strokeWidth={2} />
            <Line type="monotone" dataKey="naoApto" name="Não Apto" stroke="hsl(0,72%,51%)" strokeWidth={2} />
            <Line type="monotone" dataKey="sucata" name="Sucata" stroke="hsl(215,10%,55%)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

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
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Defeitos Mais Frequentes</CardTitle></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(0,72%,51%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
