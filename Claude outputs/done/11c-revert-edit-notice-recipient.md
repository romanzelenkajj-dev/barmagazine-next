# Revert the owner-edit notice recipient (Roman)

Commit 8b35f93 (task 15) moved the owner-edit notice from NOTIFICATION_EMAIL (Roman's Gmail, where he was already receiving and reading them) to office@barmagazine.com. That task was based on a misunderstanding on the cloud side; Roman: "Everything was fine."

Send the notice to NOTIFICATION_EMAIL again, exactly as before 8b35f93. Simplest is to revert 8b35f93 in full (including the package.json addition and the test scripts) unless the revert is messy, in which case restore only the recipient and the original subject and body. No email to anyone in this task, no test send. Deploy and report the commit and the recipient now in effect.
