import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, CalendarCheck, Eye, Wrench } from "lucide-react";
import { formatDate, type TalhaGroup } from "@/utils/talhaStatus";

interface Props {
  group: TalhaGroup;
  onOpen: (g: TalhaGroup) => void;
}

const STATUS_STYLE: Record<TalhaGroup["status"], { badge: string; ring: string; label: string }> = {
  "Apto":     { badge: "status-apto",     ring: "border-l-[hsl(var(--status-apto))]",    label: "Apto" },
  "Atenção":  { badge: "status-atencao",  ring: "border-l-[hsl(var(--status-atencao))]", label: "Atenção" },
  "Vencido":  { badge: "status-vencido",  ring: "border-l-[hsl(var(--status-vencido))]", label: "Vencido" },
  "Sucata":   { badge: "status-sucata",   ring: "border-l-[hsl(var(--status-sucata))]",  label: "Sucata" },
};

export function TalhaCard({ group, onOpen }: Props) {
  const s = STATUS_STYLE[group.status];
  const daysText =
    group.daysLeft === null
      ? "Sem data registrada"
      : group.daysLeft < 0
        ? `Vencida há ${Math.abs(group.daysLeft)} dia(s)`
        : group.daysLeft === 0
          ? "Vence hoje"
          : `Vence em ${group.daysLeft} dia(s)`;

  return (
    <Card className={`rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 ${s.ring}`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">TAG</p>
            <h3 className="text-xl font-bold tracking-tight truncate">{group.tag}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {group.equipamento}{group.modelo ? ` • ${group.modelo}` : ""}
            </p>
          </div>
          <Badge className={`${s.badge} text-xs font-semibold border-0`}>{s.label}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[11px] uppercase text-muted-foreground font-medium">Capacidade</p>
            <p className="font-semibold truncate">{group.capacidade || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground font-medium">Inspeções</p>
            <p className="font-semibold flex items-center gap-1">
              <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
              {group.records.length}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground font-medium flex items-center gap-1">
              <CalendarCheck className="h-3 w-3" /> Última
            </p>
            <p className="font-semibold">{formatDate(group.lastDate)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground font-medium flex items-center gap-1">
              <CalendarClock className="h-3 w-3" /> Próxima
            </p>
            <p className="font-semibold">{formatDate(group.nextDate)}</p>
          </div>
        </div>

        <p className={`text-xs font-medium ${
          group.status === "Vencido" ? "text-[hsl(var(--status-vencido))]"
          : group.status === "Atenção" ? "text-[hsl(var(--status-atencao))]"
          : "text-muted-foreground"
        }`}>
          {daysText}
        </p>

        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onOpen(group)}>
          <Eye className="h-3.5 w-3.5" /> Ver detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
