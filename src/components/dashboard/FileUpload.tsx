import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onFile: (file: File) => void;
  hasData: boolean;
}

export function FileUpload({ onFile, hasData }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    if (ref.current) ref.current.value = "";
  };

  return (
    <div>
      <input ref={ref} type="file" accept=".xlsx,.xls" onChange={handleChange} className="hidden" />
      <Button variant={hasData ? "outline" : "default"} size="sm" onClick={() => ref.current?.click()} className="gap-2">
        <Upload className="h-4 w-4" />
        {hasData ? "Atualizar Planilha" : "Importar Planilha Excel"}
      </Button>
    </div>
  );
}
