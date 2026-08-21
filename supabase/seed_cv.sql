-- ============================================================
--  SEED — CV / education entries
--  Run this once in the Supabase SQL Editor, after schema.sql.
--  Safe to re-run: each insert is skipped if an entry with the
--  same role + organization already exists (e.g. because you
--  edited it in /admin).
--
--  NOTE: the diploma's institute name and year weren't given, so
--  those fields are left blank below — fill them in from /admin
--  whenever you like, everything else (score, wording) is already set.
-- ============================================================

insert into public.cv_entries (section, role, organization, location, period, description, sort_order)
select * from (values
  (
    'education',
    'Studente di Fisica',
    'Università di Pisa',
    'Pisa, Italia',
    '2026 — in corso',
    'Immatricolato al corso di laurea in Fisica.',
    0
  ),
  (
    'education',
    'Diploma di Maturità',
    '',
    '',
    '',
    E'Conseguito con votazione **100/100**.',
    1
  )
) as v(section, role, organization, location, period, description, sort_order)
where not exists (
  select 1 from public.cv_entries e where e.role = v.role and e.organization = v.organization
);
