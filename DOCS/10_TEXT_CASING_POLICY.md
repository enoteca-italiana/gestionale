# Text Casing Policy (obbligatoria)

Ultimo aggiornamento: **16/03/2026 16:35 CET**.

## Regole vincolanti

Queste regole valgono sempre in tutta l'app (input, import CSV, visualizzazione, informazioni, export, script SQL):

1. `categoria`, `nome`, `provenienza`:
   - sempre in **MAIUSCOLO**.
2. `produttore`, `fornitore`:
   - sempre con **iniziale maiuscola** (stile `Initcap`).

## Punti di enforcement nel codice

- `src/domain/normalizeWineText.ts`
  - normalizzazione centralizzata:
    - `normalizeWineCategory`
    - `normalizeWineName`
    - `normalizeWineProducer`
    - `normalizeWineSupplier`
- `src/domain/normalizeOrigin.ts`
  - provenienza sempre uppercase.
- `src/data/wineRepository.ts`
  - normalizzazione in lettura/scrittura (`toWine`, `normalizeInput`, payload Supabase/legacy, import massivo).
- `src/data/archiveCsv.ts`
  - normalizzazione durante `parseArchiveCsv` e durante export CSV.
- `src/data/categoryRepository.ts`
  - categorie gestite sempre uppercase.
- `src/data/supplierRepository.ts`
  - fornitori gestiti sempre initcap.
- `src/data/dischargeRepository.ts`
  - snapshot sessioni (`wine_name`, `wine_category`, `wine_producer`, `wine_origin`, `wine_supplier`) coerenti con policy.
- `src/domain/formatWineInfoLine.ts`
  - riga informativa sempre renderizzata con policy corretta.

## Supabase / SQL Editor

Script versionato:

- `scripts/sql/supabase_text_casing_policy.sql`

Cosa fa:

- applica trigger `BEFORE INSERT/UPDATE` su `wines`;
- normalizza retroattivamente i record in `wines`;
- applica trigger coerenti anche su registry (`categories`, `suppliers`, `origins`) se presenti.

## Regola operativa per script SQL futuri

Quando vengono preparati script SQL di insert/update manuali, usare sempre questa convenzione:

- `UPPER(...)` per `categoria`, `nome`, `provenienza`;
- `INITCAP(LOWER(...))` per `produttore`, `fornitore`;
- `TRIM + collapse spazi` prima della trasformazione.

In caso di dubbi, fare riferimento a questo file e allo script SQL versionato sopra.

Template SQL (insert manuale su `public.wines`):

```sql
insert into public.wines (
  category, name, producer, origin, supplier, qty
) values (
  upper(regexp_replace(trim(:category), '\s+', ' ', 'g')),
  upper(regexp_replace(trim(:name), '\s+', ' ', 'g')),
  initcap(lower(regexp_replace(trim(:producer), '\s+', ' ', 'g'))),
  upper(regexp_replace(trim(:origin), '\s+', ' ', 'g')),
  initcap(lower(regexp_replace(trim(:supplier), '\s+', ' ', 'g'))),
  :qty
);
```
