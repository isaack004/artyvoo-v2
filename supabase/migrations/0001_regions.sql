-- ============================================================================
-- Migration 0001 — Régions génériques (26 cantons suisses)
-- Remplace la liste de cantons/villes codée en dur dans src/lib/constants.ts
-- par des tables extensibles sans déploiement de code.
-- ============================================================================

create table if not exists public.cantons (
  code text primary key,
  nom text not null
);

create table if not exists public.villes (
  id uuid primary key default uuid_generate_v4(),
  canton_code text not null references public.cantons (code),
  nom text not null,
  npa text,
  lat numeric(9, 6),
  lng numeric(9, 6),
  created_at timestamptz not null default now(),
  unique (canton_code, nom)
);

create index if not exists idx_villes_canton on public.villes (canton_code);

-- ----------------------------------------------------------------------------
-- Seed : les 26 cantons suisses
-- ----------------------------------------------------------------------------
insert into public.cantons (code, nom) values
  ('ZH', 'Zurich'), ('BE', 'Berne'), ('LU', 'Lucerne'), ('UR', 'Uri'),
  ('SZ', 'Schwyz'), ('OW', 'Obwald'), ('NW', 'Nidwald'), ('GL', 'Glaris'),
  ('ZG', 'Zoug'), ('FR', 'Fribourg'), ('SO', 'Soleure'), ('BS', 'Bâle-Ville'),
  ('BL', 'Bâle-Campagne'), ('SH', 'Schaffhouse'), ('AR', 'Appenzell Rhodes-Extérieures'),
  ('AI', 'Appenzell Rhodes-Intérieures'), ('SG', 'Saint-Gall'), ('GR', 'Grisons'),
  ('AG', 'Argovie'), ('TG', 'Thurgovie'), ('TI', 'Tessin'), ('VD', 'Vaud'),
  ('VS', 'Valais'), ('NE', 'Neuchâtel'), ('GE', 'Genève'), ('JU', 'Jura')
on conflict (code) do update set nom = excluded.nom;

-- ----------------------------------------------------------------------------
-- Seed : villes principales par canton (liste curatée, extensible en usage —
-- voir src/lib/regions.ts pour l'ajout dynamique à l'inscription artisan)
-- ----------------------------------------------------------------------------
insert into public.villes (canton_code, nom, lat, lng) values
  -- Genève
  ('GE', 'Genève', 46.2044, 6.1432),
  ('GE', 'Carouge', 46.1825, 6.1378),
  ('GE', 'Lancy', 46.1897, 6.1122),
  ('GE', 'Meyrin', 46.2314, 6.0778),
  ('GE', 'Vernier', 46.2144, 6.0850),
  ('GE', 'Onex', 46.1878, 6.1000),
  ('GE', 'Thônex', 46.1919, 6.1858),
  -- Vaud
  ('VD', 'Lausanne', 46.5197, 6.6323),
  ('VD', 'Yverdon-les-Bains', 46.7785, 6.6413),
  ('VD', 'Montreux', 46.4312, 6.9107),
  ('VD', 'Nyon', 46.3833, 6.2333),
  ('VD', 'Vevey', 46.4628, 6.8419),
  ('VD', 'Renens', 46.5378, 6.5883),
  ('VD', 'Morges', 46.5089, 6.4975),
  -- Jura
  ('JU', 'Delémont', 47.3644, 7.3444),
  ('JU', 'Porrentruy', 47.4167, 7.0750),
  ('JU', 'Saignelégier', 47.2519, 6.9986),
  -- Valais
  ('VS', 'Sion', 46.2331, 7.3606),
  ('VS', 'Martigny', 46.1022, 7.0731),
  ('VS', 'Sierre', 46.2919, 7.5350),
  ('VS', 'Monthey', 46.2547, 6.9483),
  ('VS', 'Fully', 46.1319, 7.1131),
  -- Berne (dont Jura bernois)
  ('BE', 'Berne', 46.9480, 7.4474),
  ('BE', 'Bienne', 47.1368, 7.2468),
  ('BE', 'Thoune', 46.7580, 7.6280),
  ('BE', 'Köniz', 46.9241, 7.4144),
  ('BE', 'Berthoud', 47.0592, 7.6229),
  ('BE', 'Langenthal', 47.2136, 7.7936),
  ('BE', 'Moutier', 47.2789, 7.3712),
  ('BE', 'Tavannes', 47.2461, 7.1936),
  ('BE', 'Saint-Imier', 47.1590, 6.9971),
  -- Zurich
  ('ZH', 'Zurich', 47.3769, 8.5417),
  ('ZH', 'Winterthur', 47.5001, 8.7241),
  ('ZH', 'Uster', 47.3467, 8.7208),
  ('ZH', 'Dübendorf', 47.3979, 8.6183),
  ('ZH', 'Dietikon', 47.4020, 8.4004),
  ('ZH', 'Wetzikon', 47.3216, 8.7982),
  ('ZH', 'Kloten', 47.4508, 8.5834),
  ('ZH', 'Wädenswil', 47.2296, 8.6721),
  -- Lucerne
  ('LU', 'Lucerne', 47.0502, 8.3093),
  ('LU', 'Kriens', 47.0333, 8.2833),
  ('LU', 'Emmen', 47.0810, 8.3030),
  ('LU', 'Horw', 47.0136, 8.3103),
  ('LU', 'Sursee', 47.1706, 8.1097),
  ('LU', 'Willisau', 47.1225, 7.9989),
  ('LU', 'Ebikon', 47.0736, 8.3417),
  -- Uri
  ('UR', 'Altdorf', 46.8808, 8.6436),
  ('UR', 'Erstfeld', 46.8194, 8.6389),
  ('UR', 'Schattdorf', 46.8664, 8.6339),
  ('UR', 'Bürglen', 46.8722, 8.6206),
  -- Schwyz
  ('SZ', 'Schwyz', 47.0207, 8.6530),
  ('SZ', 'Freienbach', 47.2000, 8.7500),
  ('SZ', 'Küssnacht', 47.0847, 8.4453),
  ('SZ', 'Einsiedeln', 47.1289, 8.7461),
  ('SZ', 'Arth', 47.0656, 8.5306),
  -- Obwald
  ('OW', 'Sarnen', 46.8969, 8.2458),
  ('OW', 'Kerns', 46.8894, 8.2317),
  ('OW', 'Sachseln', 46.8619, 8.2331),
  ('OW', 'Alpnach', 46.9367, 8.2733),
  -- Nidwald
  ('NW', 'Stans', 46.9578, 8.3672),
  ('NW', 'Hergiswil', 46.9906, 8.3125),
  ('NW', 'Buochs', 46.9756, 8.4136),
  ('NW', 'Ennetbürgen', 46.9797, 8.3931),
  -- Glaris
  ('GL', 'Glaris', 47.0403, 9.0678),
  ('GL', 'Näfels', 47.1064, 9.0672),
  ('GL', 'Netstal', 47.0511, 9.0525),
  ('GL', 'Mollis', 47.0836, 9.0797),
  -- Zoug
  ('ZG', 'Zoug', 47.1662, 8.5155),
  ('ZG', 'Baar', 47.1958, 8.5306),
  ('ZG', 'Cham', 47.1811, 8.4614),
  ('ZG', 'Steinhausen', 47.1747, 8.4917),
  ('ZG', 'Risch', 47.1594, 8.4581),
  -- Fribourg
  ('FR', 'Fribourg', 46.8065, 7.1620),
  ('FR', 'Bulle', 46.6189, 7.0578),
  ('FR', 'Villars-sur-Glâne', 46.7936, 7.1247),
  ('FR', 'Düdingen', 46.8489, 7.2028),
  ('FR', 'Marly', 46.7736, 7.1494),
  ('FR', 'Estavayer-le-Lac', 46.8514, 6.8494),
  -- Soleure
  ('SO', 'Soleure', 47.2088, 7.5323),
  ('SO', 'Olten', 47.3500, 7.9036),
  ('SO', 'Granges', 47.1917, 7.3958),
  ('SO', 'Zuchwil', 47.1958, 7.5556),
  ('SO', 'Biberist', 47.1833, 7.5606),
  -- Bâle-Ville
  ('BS', 'Bâle', 47.5596, 7.5886),
  ('BS', 'Riehen', 47.5847, 7.6497),
  ('BS', 'Bettingen', 47.5836, 7.6789),
  -- Bâle-Campagne
  ('BL', 'Liestal', 47.4839, 7.7333),
  ('BL', 'Allschwil', 47.5486, 7.5372),
  ('BL', 'Reinach', 47.4922, 7.5919),
  ('BL', 'Muttenz', 47.5228, 7.6461),
  ('BL', 'Pratteln', 47.5225, 7.6931),
  ('BL', 'Binningen', 47.5397, 7.5719),
  -- Schaffhouse
  ('SH', 'Schaffhouse', 47.6959, 8.6349),
  ('SH', 'Neuhausen am Rheinfall', 47.6819, 8.6156),
  ('SH', 'Stein am Rhein', 47.6597, 8.8611),
  ('SH', 'Beringen', 47.6906, 8.5822),
  -- Appenzell Rhodes-Extérieures
  ('AR', 'Herisau', 47.3861, 9.2792),
  ('AR', 'Teufen', 47.3775, 9.3097),
  ('AR', 'Speicher', 47.4083, 9.3319),
  ('AR', 'Heiden', 47.4394, 9.5378),
  -- Appenzell Rhodes-Intérieures
  ('AI', 'Appenzell', 47.3319, 9.4092),
  ('AI', 'Gonten', 47.3369, 9.3606),
  ('AI', 'Oberegg', 47.4103, 9.5514),
  -- Saint-Gall
  ('SG', 'Saint-Gall', 47.4245, 9.3767),
  ('SG', 'Rapperswil-Jona', 47.2267, 8.8175),
  ('SG', 'Wil', 47.4611, 9.0450),
  ('SG', 'Gossau', 47.4147, 9.2528),
  ('SG', 'Buchs', 47.1667, 9.4750),
  ('SG', 'Uzwil', 47.4389, 9.1358),
  -- Grisons
  ('GR', 'Coire', 46.8499, 9.5320),
  ('GR', 'Davos', 46.8027, 9.8360),
  ('GR', 'Saint-Moritz', 46.4908, 9.8355),
  ('GR', 'Landquart', 46.9633, 9.5583),
  ('GR', 'Ilanz', 46.7767, 9.2044),
  ('GR', 'Poschiavo', 46.3239, 10.0664),
  -- Argovie
  ('AG', 'Aarau', 47.3925, 8.0442),
  ('AG', 'Baden', 47.4739, 8.3064),
  ('AG', 'Wettingen', 47.4667, 8.3167),
  ('AG', 'Wohlen', 47.3506, 8.2764),
  ('AG', 'Zofingue', 47.2881, 7.9436),
  ('AG', 'Lenzbourg', 47.3900, 8.1758),
  -- Thurgovie
  ('TG', 'Frauenfeld', 47.5561, 8.8981),
  ('TG', 'Kreuzlingen', 47.6469, 9.1758),
  ('TG', 'Arbon', 47.5158, 9.4331),
  ('TG', 'Amriswil', 47.5486, 9.2986),
  ('TG', 'Weinfelden', 47.5678, 9.1039),
  -- Tessin
  ('TI', 'Lugano', 46.0037, 8.9511),
  ('TI', 'Bellinzone', 46.1944, 9.0175),
  ('TI', 'Locarno', 46.1670, 8.7943),
  ('TI', 'Mendrisio', 45.8697, 8.9814),
  ('TI', 'Chiasso', 45.8306, 9.0289),
  ('TI', 'Ascona', 46.1547, 8.7714),
  -- Neuchâtel
  ('NE', 'Neuchâtel', 46.9900, 6.9293),
  ('NE', 'La Chaux-de-Fonds', 47.0999, 6.8252),
  ('NE', 'Le Locle', 47.0592, 6.7492),
  ('NE', 'Peseux', 46.9925, 6.8858),
  ('NE', 'Boudry', 46.9506, 6.8394)
on conflict (canton_code, nom) do nothing;

-- ----------------------------------------------------------------------------
-- Row Level Security : lecture publique, écriture réservée au service-role
-- (l'ajout dynamique de nouvelles villes se fait via une route serveur
-- utilisant la clé service-role, cf. onboarding artisan)
-- ----------------------------------------------------------------------------
alter table public.cantons enable row level security;
alter table public.villes enable row level security;

create policy "cantons: lecture publique" on public.cantons
  for select using (true);
create policy "villes: lecture publique" on public.villes
  for select using (true);
