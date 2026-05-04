import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, AlertTriangle } from "lucide-react";
import { TalhaCard } from "./TalhaCard";
import { TalhaDetailsDialog } from "./TalhaDetailsDialog";
import { groupByTag, type TalhaGroup, type TalhaStatus } from "@/utils/talhaStatus";
import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
}

const STATUS_OPTIONS: TalhaStatus[] = ["Apto", "Atenção", "Vencido", "Sucata"];

export function TalhasGrid({ data }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [mes, setMes] = useState<string>("");
  const [active, setActive] = useState<TalhaGroup | null>(null);

  const groups = useMemo(() => groupByTag(data), [data]);
  const meses = useMemo(
    () => [...new Set(groups.map((g) => g.latest.mes).filter(Boolean))].sort(),
    [groups]
  );

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      if (status && g.status !== status) return false;
      if (mes && g.latest.mes !== mes) return false;
      if (search && !g.tag.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [groups, status, mes, search]);

  const criticas = groups.filter((g) => g.status === "Vencido");
  const hasFilter = !!(status || mes || search);

  return (
    <div className="space-y-6">
      {criticas.length > 0 && (
        <section className="rounded-xl border border-[hsl(var(--status-vencido))]/30 bg-[hsl(var(--status-vencido-bg))]/40 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--status-vencido))]" />
            <h2 className="text-base font-bold text-[hsl(var(--status-vencido))] tracking-tight">
              Talhas críticas ({criticas.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {criticas.slice(0, 8).map((g) => (
              <TalhaCard key={g.tag} group={g} onOpen={setActive} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por TAG..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <Select value={status || "__all__"} onValueChange={(v) => setStatus(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-[160px] bg-card"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Status</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={mes || "__all__"} onValueChange={(v) => setMes(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-[140px] bg-card"><SelectValue placeholder="Mês" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Mês</SelectItem>
            {meses.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilter && (
          <Button variant="outline" size="sm" onClick={() => { setSearch(""); setStatus(""); setMes(""); }} className="gap-1.5 h-10">
            <X className="h-3.5 w-3.5" /> Limpar
          </Button>
        )}
        <p className="text-xs text-muted-foreground ml-auto">{filtered.length} talha(s)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((g) => (
          <TalhaCard key={g.tag} group={g} onOpen={setActive} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">Nenhuma talha encontrada</p>
      )}

      <TalhaDetailsDialog group={active} onClose={() => setActive(null)} />
    </div>
  );
}
