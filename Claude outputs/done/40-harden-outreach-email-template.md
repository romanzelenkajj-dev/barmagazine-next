# Harden the outreach email so it survives clients that strip background colours (before batch 16)

Context. Roman saw a reply where our email's wordmark and both CTA buttons were invisible. Diagnosed: the template is correct (rendered from scripts/send-upsell.mjs TMPL, black header with logo-white.png, black SEE YOUR PROFILE pill, gold CLAIM YOUR FREE LISTING pill, bgcolor plus inline background-color plus MSO VML on both). The reply came from Yahoo Mail for iPhone, which strips background colours from quoted text; white logo and white button labels on stripped backgrounds disappear. So this affects quoted replies, and any recipient whose client does the same.

Two changes to scripts/send-upsell.mjs, and to the claim email template if it shares the same pattern (src/lib/claim-email.ts, emailCta):

1. Logo that survives background stripping. Create an email logo PNG with the black background baked into the image itself, at 2x for retina (for example public/email/logo-black-bg.png, roughly 560x68 at 2x, wordmark centred left with the same padding the header td has now), and point the header img at it. Keep the header td's background:#0a0a0a as well, so nothing changes when backgrounds are honoured. Keep width and height attributes on the img and alt="BarMagazine".

2. A plain text fallback link under each button, in the body text style, small and muted, so the action survives even if the pill is invisible:
   - under SEE YOUR PROFILE: "or open barmagazine.com/bars/{{BAR_SLUG}}" linked to {{PROFILE_URL}}
   - under CLAIM YOUR FREE LISTING: "or claim it at barmagazine.com/claim" linked to {{CLAIM_URL}}
   Use the gold link colour already in the template (#8a6a24), Arial, about 13px, margin 6px top. No dashes anywhere.

Then:
3. Render the filled template to an HTML file and screenshot it at 700px to confirm nothing else moved.
4. Simulate the stripping: render a second copy with every background-color, bgcolor and background declaration removed, and confirm the wordmark is still legible and both fallback links are visible and clickable. Put both screenshots in the report.
5. Send one test email to zelenka@barmagazine.com (Roman's own address, not a bar) so he can look at it in Roundcube before batch 16 goes out. This is a test to Roman himself, not outreach; if your guard requires a confirmation for any send at all, say so in one line in the report rather than blocking, and leave the batch unarmed.

Do not send batch 16 in this task. Report the commit, the two screenshots and whether the test send went.
