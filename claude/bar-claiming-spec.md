# Bar claiming — verification spec
*2026-08-24. Decisions: verified auto-claim + manual fallback; claiming is FREE; auth moves to Supabase magic links; owner-written copy is AI-drafted into house style, never auto-published.*

## The problem
The moderation half was built; the claiming half never was. `bar_owners`, `bars.owner_id`, the owner dashboard, the `owner_submissions` queue and the admin review API all exist — but **no code path sets `owner_id`**. An owner can register, log in, and see an empty dashboard forever. `/claim-your-bar` 308-redirects to `/feature-your-bar`.

## Two independent gates (verified in code)
1. **Verification** decides who may claim a bar.
2. **Moderation** decides what publishes — already working. `/api/owner/bars` PUT touches `bars` only with `SELECT`s to confirm ownership; its sole write is `owner_submissions.insert({status:'pending'})`. Photos behave identically. `/api/admin/submissions` implements approve/reject and writes to `bars` only on approval.
**An owner cannot change anything live without an explicit approval.**

## Contact-data coverage (1,217 active bars)
| Field | Bars | Share |
|---|---|---|
| Website | 843 | 69% |
| Instagram | 855 | 70% |
| Phone | 781 | 64% |
| **Email** | **215** | **18%** |
| Instagram-only | 113 | 9% |

`contact_on_file` covers only 18% today, so `domain_match` carries most of the automation.

## Claim routes
**A · domain_match** — the domain of the email the claimant types equals the registrable domain of the bar's `website` (strip scheme, strip leading `www.`, compare case-insensitively; ignore paths). Magic link goes to that typed address. Auto-approve on click.

**B · contact_on_file** — the bar has a non-empty `email`. The magic link goes **to the stored address**, never to one the claimant supplies; the UI shows it masked (first char + `•••••` + `@domain`). Auto-approve on click.

**C · manual** — neither A nor B. Status `pending_review`, claimant uploads proof (business registration, an email signature on the bar's domain, or a dated photo inside the venue). Roman approves in the admin queue.

Precedence: A, then B, then C. If A and B both apply, prefer A (the claimant proves control of the bar's own domain).

**Token/lifetime:** the Supabase magic link is the token; set link expiry to 30 minutes. A `bar_claims` row in `awaiting_verification` older than 24h is swept to `expired`.

**Legal status transitions:** `awaiting_verification` → `approved` | `expired`; `pending_review` → `approved` | `rejected`. Nothing returns to `awaiting_verification`. Rows are never deleted — a disputed bar needs its history.

**On approval:** set `bars.owner_id`, `bars.claimed_at = now()`, claim `status='approved'`, `verified_at`/`reviewed_at` as appropriate.

**Transfers:** a claim on a bar that already has `owner_id` sets `is_transfer=true` and ALWAYS goes to `pending_review` — never auto-approves, regardless of route. Bars change hands often.

**Rate limits:** max 3 claim starts per email per hour and 10 per IP per hour; on exceed return the same generic "if this bar is yours, check your inbox" response as a success, so the endpoint cannot be used to enumerate which bars have emails on file.

## Field allowlist — enforce at BOTH ends
Owners MAY submit: `address`, `phone`, `website`, `instagram`, `email`, `opening_hours`, `reservation_url`, `whatsapp`, `menu_url`, `menu_sections`, `photos`.
Owners may NOT touch: `description`, `accolades`, `tier`, `is_active`, `is_verified`, `wp_article_slug`, `name`, `slug`, `city`, `country`, `lat`, `lng`.
Filter on submission **and again on approval** — the approve path spreads a fields object into `bars.update()`, so an unfiltered key would apply on a fast approval click.

## Owner-written copy → AI editorial draft (never auto-published)
Owners will want to describe their own bar. Rejecting that outright wastes willing input; publishing it raw wrecks the editorial voice. So:
1. Owner submits free text in a `proposed_description` field. It is stored on the submission, NOT on the bar.
2. An admin action "draft editorial version" sends it to the Claude API with the house-style prompt below and stores the result as `suggested_description` on the submission.
3. Roman sees three panes — owner's original, AI draft, current live description — edits freely, then approves. **Only Roman's click ever writes `bars.description`.**

**House style (the prompt):** 2–3 sentences, present tense, third person. State what the bar is, where it sits, and what is distinctive about the drinks or the room. Prefer concrete specifics (a technique, an ingredient, a designer, a year, a neighbourhood) over adjectives. Never use: hidden gem, nestled, must-visit, iconic, world-class, unique, vibrant, elevate, curated (of drinks), a feast for the senses. No exclamation marks, no second person, no direct address to the reader.

**The critical rule — rewrite voice, never launder claims.** The model must not carry over unverifiable assertions ("the best bar in Madrid", "award-winning", "voted #1", "world-famous"). It strips them and returns them separately as a `claims_removed` list shown to Roman, who can verify and add a real accolade if one exists. Accolades never come from owner input; they require a source URL. The AI removes writing labour, not editorial judgement.

Requires `ANTHROPIC_API_KEY` in the Vercel environment. Same pipeline can later draft Featured onboarding copy.

## Safety additions
- **Notify on new submission** — email Roman on every claim and edit. A queue only protects if it is seen.
- **Un-claim / revoke** — admin action clearing `owner_id` and rejecting that owner's open submissions.
- **Never expose a full on-file email** in any API response or UI.

## Schema (migration `add_bar_claims`, APPLIED — do not alter)
```
bar_claims(
  id uuid pk, bar_id uuid → bars, owner_id uuid → bar_owners,
  claimant_email text not null, claimant_name text, claimant_role text,
  method text check (domain_match | contact_on_file | manual),
  status text default 'awaiting_verification'
    check (awaiting_verification | pending_review | approved | rejected | expired),
  evidence jsonb, admin_notes text, is_transfer boolean default false,
  created_at, verified_at, reviewed_at )
```
Plus `bars.claimed_at timestamptz`. Partial unique index blocks duplicate open claims per (bar, email).
For the AI copy flow, add to `owner_submissions`: `proposed_description text`, `suggested_description text`, `claims_removed jsonb`.

## Auth
Replace `bar_owners.password_hash` + the localStorage `owner_token` with Supabase magic links. `bar_owners` currently has **0 rows** and 0 bars are owned — the "map existing accounts" step is a no-op. That is expected, not a wrong environment: nobody ever registered because the dashboard was unreachable without a claim flow.

## The redirect — must ship WITH the new page
`next.config.mjs` lines 147–148 send `/claim-your-bar` and `/claim-your-bar/` to `/feature-your-bar`. Deleting them before the search-and-claim page exists would expose the stale pricing content still sitting in `src/app/claim-your-bar/page.tsx`. Same commit, or not at all. 308s cache hard — test with a fresh profile.

## Build order (safe to ship independently, in this order)
1. Field allowlist at submission + approval — highest-value safety fix, no dependencies.
2. Email notification on new submissions.
3. Magic-link auth.
4. `/api/claim/*` + rebuilt `/claim-your-bar` + redirect removal (one commit).
5. Admin: claim review, transfer review, revoke.
6. AI editorial draft flow.

## Open items
- Instagram DM verification for the 113 IG-only bars — deferred, manual for now.
