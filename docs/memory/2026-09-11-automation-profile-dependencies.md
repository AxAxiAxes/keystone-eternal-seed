# 2026-09-11 Automation profile dependency evidence

**Status:** Completed repository-controlled dependency safeguard

## Finding

Founder-configured profile templates identified dependencies as completed task
IDs, but the profile layer previously verified only their UUID shape before
preflight or draft creation.

## Implementation

Profile preflight, draft creation, and activation now require every declared
dependency to resolve to an existing retained task with `completed` status.
An unknown, pending, blocked, failed, cancelled, or malformed dependency
returns an explicit error before a profile plan is reported as executable or a
profile-managed task is created.

## Boundary

This is internal dependency validation only. It does not execute, approve,
schedule, resume, pause, assign, or delete any task or profile. It does not
enable the scheduler or perform an external action.
