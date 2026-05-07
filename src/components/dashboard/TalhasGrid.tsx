import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Wrench } from "lucide-react";
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

  const hasFilter = !!(status || mes || search);

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header industrial */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/15 text-primary">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider">Talhas</h2>
            <p className="text-[11px] text-muted-foreground">{groups.length} TAG(s) • {data.length} inspeções</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-border bg-muted/30">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por TAG..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-background"
          />
        </div>
        <Select value={status || "__all__"} onValueChange={(v) => setStatus(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-[150px] h-9 bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Status</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={mes || "__all__"} onValueChange={(v) => setMes(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-[130px] h-9 bg-background"><SelectValue placeholder="Mês" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Mês</SelectItem>
            {meses.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilter && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStatus(""); setMes(""); }} className="gap-1.5 h-9">
            <X className="h-3.5 w-3.5" /> Limpar
          </Button>
        )}
        <p className="text-xs uppercase tracking-wider text-muted-foreground ml-auto font-semibold">
          {filtered.length} talha(s)
        </p>
      </div>

      {/* Grid */}
      <div className="p-5">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm">Nenhuma talha encontrada</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((g) => (
              <TalhaCard key={g.tag} group={g} onOpen={setActive} />
            ))}
          </div>
        )}
      </div>

      <TalhaDetailsDialog group={active} onClose={() => setActive(null)} />
    </section>
  );
}
