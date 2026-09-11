# 2026-09-11 Automation profile processing integrity

**Status:** Completed repository-controlled processing safeguard

## Finding

The profile/task association health projection identified altered or duplicate
profile-managed tasks, but processing required the same fail-closed
association check. The first implementation attempted to reread task state
while task processing held the task store's exclusive lock, which could wait
on itself.

## Implementation

Task processing now passes its already-held task state into the profile
association check. The check permits a profile-managed task only when its
profile is active and its retained task ID, profile key, and approved
definition match exactly and uniquely. Missing, renamed, altered, or duplicate
associations are not processed. Regression coverage proves the check does not
reopen the task store during processing.

## Boundary

This is a private internal processing safeguard. It does not create, approve,
schedule, execute, pause, resume, assign, delete, or externally transmit work.
It does not enable the scheduler.
