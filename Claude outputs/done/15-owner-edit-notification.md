# Email Roman when an owner submits a profile edit

Roman: the Holiday owner's photo and hours edits appeared in the admin approval page today but no email reached office@barmagazine.com. Check first whether a notification exists and failed (Resend logs for today 13:40 PT), or whether none is sent.

Then: on every owner-submitted pending edit (photos, details, any field), send one email through Resend from the existing sender to office@barmagazine.com. Subject: "Edit to approve: <Bar name> (<field>)". Body, plain text, short: bar name and city, owner email, field, the proposed value (or "1 photo"), and the direct link to the admin approval page. One email per submission; if an owner submits several fields within a minute, batch them into one email. Do not email the owner anything new in this task.

Test with a staging submission (do not create real pending edits on live bars; use the existing test bar or a dry-run flag), confirm delivery, deploy, report the commit and what the Holiday check found.
