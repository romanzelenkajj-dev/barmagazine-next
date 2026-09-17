-- email_optouts (2026-09-17): addresses that asked not to be emailed again,
-- recorded by the one-click unsubscribe rather than by hand.
--
-- Why a table. Today the only opt-out is "reply 'unsubscribe'", and the list
-- lives in outreach/optout.txt, a repo file. A reply costs the recipient
-- effort, and a recipient who cannot opt out easily presses the spam button
-- instead. Spam complaints are what actually damage a sending domain, and we
-- are emailing more US bars every week.
--
-- A web route cannot append to a file in the repo, so the one-click
-- unsubscribe needs somewhere to write. outreach/optout.txt is NOT replaced:
-- it stays the hand-maintained record with its reasons, and the send script
-- refuses an address found in either.
--
-- The standing rule is unchanged and applies to this table too: never remove
-- an address without the recipient's renewed consent.

create table if not exists public.email_optouts (
  email text primary key,
  created_at timestamptz not null default now(),
  source text,            -- 'one-click' | 'reply' | 'manual'
  bar_slug text,          -- the listing the email was about, when known
  user_agent text
);

comment on table public.email_optouts is
  'Addresses that opted out of listing emails. Never delete a row without renewed consent from that address.';

-- The send script asks "is this address here", nothing else.
create index if not exists email_optouts_email_idx on public.email_optouts (lower(email));

-- The unsubscribe route writes with the service role only; nothing public reads it.
alter table public.email_optouts enable row level security;
