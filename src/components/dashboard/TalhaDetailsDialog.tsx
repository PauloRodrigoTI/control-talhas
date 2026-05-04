import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate, parseInspectionDate, type TalhaGroup } from "@/utils/talhaStatus";

interface Props {
  group: TalhaGroup | null;
  onClose: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  "Apto": "status-apto",
  "Não Apto": "status-vencido",
  "Sucata": "status-sucata",
};

export function TalhaDetailsDialog({ group, onClose }: Props) {
  return (
    <Dialog open={!!group} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        {group && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl tracking-tight">TAG {group.tag}</DialogTitle>
              <DialogDescription>
                {group.equipamento}{group.modelo ? ` • ${group.modelo}` : ""} • Capacidade: {group.capacidade || "—"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2">
              <Stat label="Total inspeções" value={String(group.records.length)} />
              <Stat label="Última inspeção" value={formatDate(group.lastDate)} />
              <Stat label="Próxima inspeção" value={formatDate(group.nextDate)} />
              <Stat label="Fabricação" value={group.latest.fabricacao || "—"} />
            </div>

            <h4 className="text-sm font-semibold mt-2">Histórico de inspeções</h4>
            <ScrollArea className="max-h-[45vh] pr-3">
              <div className="space-y-3">
                {group.records.map((r, i) => {
                  const d = parseInspectionDate(r.dataTeste);
                  return (
                    <div key={i} className="rounded-lg border border-border/60 p-4 bg-card/50">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <div className="text-sm font-semibold">{formatDate(d) !== "—" ? formatDate(d) : (r.dataTeste || "Data não informada")}</div>
                        <Badge className={`${STATUS_BADGE[r.status] ?? "status-apto"} border-0 text-xs`}>{r.status}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <Field label="Motivo" value={r.motivoInspecao} />
                        <Field label="Colaborador" value={r.colaborador} />
                        <Field label="Defeito" value={r.defeito} />
                        <Field label="O que foi feito" value={r.oqueFoiFeito} />
                        <Field label="Peças substituídas" value={r.pecasSubstituidas} />
                        <Field label="Se sim, qual" value={r.seSimQual} />
                        <Field label="Carga de teste" value={r.cargaTeste} />
                        <Field label="Mês" value={r.mes} />
                        <Field label="Observações" value={r.obsChecklist} full />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  if (!value || !value.trim()) return null;
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
