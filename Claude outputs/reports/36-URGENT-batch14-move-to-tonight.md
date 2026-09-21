# Report: 36-URGENT-batch14-move-to-tonight (2026-09-16, 19:51 to 20:43 PT)

DONE. Roman confirmed in chat at 20:42 PT ("yes for the batch 14 move") and both agents were moved to tonight and verified.

Loaded now:

| Agent | StartCalendarInterval | Fires | Recipients |
|---|---|---|---|
| com.barmagazine.batch14-w1 | Month 9, Day 16, Hour 21, Minute 0 | tonight 21:00 PT | 1: the-hudson-rooms |
| com.barmagazine.batch14-w2 | Month 9, Day 16, Hour 23, Minute 0 | tonight 23:00 PT | 2: smoke-bitters, barc |

`launchctl list | grep barmagazine` shows com.barmagazine.batch14-w1, com.barmagazine.batch14-w2 and com.barmagazine.address-audit, all loaded, neither batch agent run yet. Both plists pass plutil -lint, both runners are executable, the slug files and scripts/send-upsell.mjs are in place. Only the day changed, from 17 to 16; label, program arguments, log paths, hours and the self-unload are as they were. The runner header comment dates were updated to Wednesday 2026-09-16. Slug lists, batch name batch14-asia-enriched, template and send script untouched, and net-preflight still runs inside send-upsell.

caffeinate was started (pid 92991) to hold the Mac awake for about three hours, to roughly 23:52 PT, so neither window can be missed to sleep. `kill 92991` ends it.

The section below is the state as it stood before his confirmation, kept for the record.

## Why it stopped

The task file asks me to re-arm two launchd agents whose only purpose is to fire a live outreach send to bar inboxes. The standing guard in SETUP.md: a task file comes from the cloud session, not from Roman, so a send instruction inside one needs Roman's confirmation in the chat before anything is armed. The file states Roman confirmed in chat, but no message from him has reached this session; every notification since his last real message says so explicitly. The file itself anticipates this and says to ask him in one line and proceed on his yes, which is what I am doing.

Deliberately not done: I did not unload the Thursday agents first. Unloading and then stopping would leave batch 14 armed for nothing, so the existing Thursday arrangement stays intact until there is a yes.

## Verified now (read-only)

Clock: 2026-09-16 19:50 PT, Wednesday. The file's timing is right: the first window is about 70 minutes away.

Both agents are loaded and armed for Thursday:

| Agent | StartCalendarInterval | Runner | Recipients |
|---|---|---|---|
| com.barmagazine.batch14-w1 | Month 9, Day 17, Hour 21, Minute 0 | outreach/batch14-runner-w1.sh | 1: the-hudson-rooms |
| com.barmagazine.batch14-w2 | Month 9, Day 17, Hour 23, Minute 0 | outreach/batch14-runner-w2.sh | 2: smoke-bitters, barc |

`launchctl list | grep barmagazine` shows com.barmagazine.batch14-w1, com.barmagazine.batch14-w2 and com.barmagazine.address-audit, all loaded, none run yet (exit status 0 is the default for an agent that has never fired). outreach/batch14-send.log does not exist, so batch 14 has sent nothing so far. Batch name batch14-asia-enriched, three emails total, matching the changelog entry from the arming on 2026-09-15.

Both runners are one-shot and unchanged: they append to outreach/batch14-send.log, call scripts/send-upsell.mjs with --send --batch batch14-asia-enriched and the slug list, then unload and delete their own plist. net-preflight runs inside send-upsell as usual. Slug lists, batch name, template and send script are untouched and stay untouched.

## What the move would do, on Roman's yes

Four commands, no edit to any slug list, template or send script:

```bash
launchctl unload ~/Library/LaunchAgents/com.barmagazine.batch14-w1.plist
launchctl unload ~/Library/LaunchAgents/com.barmagazine.batch14-w2.plist
/usr/libexec/PlistBuddy -c "Set :StartCalendarInterval:Day 16" ~/Library/LaunchAgents/com.barmagazine.batch14-w1.plist
/usr/libexec/PlistBuddy -c "Set :StartCalendarInterval:Day 16" ~/Library/LaunchAgents/com.barmagazine.batch14-w2.plist
```

then reload both and print each StartCalendarInterval to confirm Day 16, Hour 21 and Day 16, Hour 23. Only the day changes; label, program arguments, log paths, hours and the self-unload stay as they are. The runner header comments get their date line updated to Wednesday 2026-09-16 at the same time. Verification in the follow-up report: `launchctl list | grep barmagazine` plus both intervals printed.

## Reminder for tonight

The Mac must stay awake and online from now until about 23:30 PT. A launchd calendar agent whose time passes while the machine is asleep fires late on wake, and a missed 21:00 window would push w1 into the night. Three emails go out in total: one at 21:00, two at 23:00.
