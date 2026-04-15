ALTER TABLE public.inspections 
  ADD COLUMN data_teste text NOT NULL DEFAULT '',
  ADD COLUMN se_sim_qual text NOT NULL DEFAULT '',
  ADD COLUMN oque_foi_feito text NOT NULL DEFAULT '';