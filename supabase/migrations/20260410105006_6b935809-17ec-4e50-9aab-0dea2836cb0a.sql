
CREATE TABLE public.inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipamento TEXT NOT NULL DEFAULT '',
  modelo TEXT NOT NULL DEFAULT '',
  fabricacao TEXT NOT NULL DEFAULT '',
  ano_fabricacao TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT '',
  capacidade_elevacao TEXT NOT NULL DEFAULT '',
  carga_teste TEXT NOT NULL DEFAULT '',
  motivo_inspecao TEXT NOT NULL DEFAULT '',
  pecas_substituidas TEXT NOT NULL DEFAULT '',
  defeito TEXT NOT NULL DEFAULT '',
  obs TEXT NOT NULL DEFAULT '',
  colaborador TEXT NOT NULL DEFAULT '',
  qtd INTEGER NOT NULL DEFAULT 1,
  apto_uso BOOLEAN NOT NULL DEFAULT false,
  nao_apto BOOLEAN NOT NULL DEFAULT false,
  sucata BOOLEAN NOT NULL DEFAULT false,
  mes TEXT NOT NULL DEFAULT '',
  obs_checklist TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Apto',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read inspections" ON public.inspections FOR SELECT USING (true);
CREATE POLICY "Anyone can insert inspections" ON public.inspections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update inspections" ON public.inspections FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete inspections" ON public.inspections FOR DELETE USING (true);
