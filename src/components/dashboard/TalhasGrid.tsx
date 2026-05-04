import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, AlertTriangle, LayoutGrid, ChevronDown, ChevronUp } from "lucide-react";
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
  const [showCards, setShowCards] = useState(false);
  const [showCriticas, setShowCriticas] = useState(false);

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
    <div className="space-y-4">
      {/* Toolbar industrial */}
      <div className="rounded-lg border border-border bg-card p-3 flex flex-wrap items-center gap-3 shadow-sm">
        <Button
          variant={showCards ? "default" : "outline"}
          size="sm"
          onClick={() => setShowCards((v) => !v)}
          className="gap-2 h-9 font-semibold uppercase tracking-wide text-xs"
        >
          <LayoutGrid className="h-4 w-4" />
          Visualizar Talhas
          {showCards ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>

        {criticas.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCriticas((v) => !v)}
            className="gap-2 h-9 text-xs font-semibold uppercase tracking-wide border-[hsl(var(--status-vencido))]/40 text-[hsl(var(--status-vencido))] hover:bg-[hsl(var(--status-vencido-bg))]"
          >
            <AlertTriangle className="h-4 w-4" />
            Críticas ({criticas.length})
          </Button>
        )}

        <div className="ml-auto text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {groups.length} TAG(s) • {data.length} inspeções
        </div>
      </div>

      {/* Críticas */}
      {showCriticas && criticas.length > 0 && (
        <section className="rounded-lg border-l-4 border-l-[hsl(var(--status-vencido))] border border-border bg-[hsl(var(--status-vencido-bg))]/30 p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--status-vencido))]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--status-vencido))]">
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

      {/* Visualização cards */}
      {showCards && (
        <div className="space-y-4 rounded-lg border border-border bg-card/40 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por TAG..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Select value={status || "__all__"} onValueChange={(v) => setStatus(v === "__all__" ? "" : v)}>
              <SelectTrigger className="w-[160px] bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Status</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={mes || "__all__"} onValueChange={(v) => setMes(v === "__all__" ? "" : v)}>
              <SelectTrigger className="w-[140px] bg-background"><SelectValue placeholder="Mês" /></SelectTrigger>
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
            <p className="text-xs uppercase tracking-wider text-muted-foreground ml-auto font-medium">{filtered.length} talha(s)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((g) => (
              <TalhaCard key={g.tag} group={g} onOpen={setActive} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">Nenhuma talha encontrada</p>
          )}
        </div>
      )}

      <TalhaDetailsDialog group={active} onClose={() => setActive(null)} />
    </div>
  );
}
