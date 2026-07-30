alter table public.rooms
  add column if not exists invite_token uuid;

update public.rooms
set invite_token = gen_random_uuid()
where invite_token is null;

alter table public.rooms
  alter column invite_token set not null,
  alter column invite_token set default gen_random_uuid();

create unique index if not exists rooms_invite_token_key
  on public.rooms (invite_token);
