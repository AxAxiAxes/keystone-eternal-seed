# 2026-09-11 Automation profile history

**Status:** Completed repository-controlled visibility enhancement

## Finding

Automation Profiles retained hash-linked lifecycle records, but the protected
operator view showed only each profile's current state rather than a concise
sequence of its transitions.

## Implementation

The private profile service and protected portal now expose payload-free
history for draft creation, activation, pause, and resume records. Each entry
contains its immutable sequence, timestamp, profile ID, template, transition,
retained-task count, and recorded recovery state. Task templates and payloads
are excluded from this history projection.

## Boundary

The history route is protected and read-only. It does not create, assign,
approve, process, schedule, resume, or pause work; it does not enable the
scheduler or perform an external action.
