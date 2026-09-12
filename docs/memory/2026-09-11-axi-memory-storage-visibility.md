# 2026-09-11 AXI memory storage visibility

**Status:** Completed repository-controlled capacity-observation foundation

## Finding

AXI retained private memory and operating records but did not expose their
current data-directory size or a configurable early warning before host
storage became low.

## Implementation

The private engine now reports AXI data-directory used bytes and file count,
plus host-reported filesystem total and available bytes where supported.
`AXIOM_MEMORY_WARNING_BYTES` is an optional positive-integer monitoring
threshold. Reaching it creates a private monitoring attention signal without
deleting, compacting, capping, or otherwise discarding AXI memory. The
protected console exposes the same read-only report.

## Boundary

Host-reported filesystem capacity is an operational signal, not proof of a
configured production volume, independent backup durability, or recoverable
runtime state. This change does not configure storage, deploy AXI, enable the
scheduler, process a task, or perform an external action.
