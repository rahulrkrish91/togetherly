export interface VersionedRecord {
  id: string;
  updatedAt: number;
  [key: string]: unknown;
}

/**
 * Last-write-wins conflict resolution baseline.
 * Server record wins on ties to keep deterministic merge behavior.
 */
export function resolveConflict(local: VersionedRecord, server: VersionedRecord): VersionedRecord {
  if (server.updatedAt >= local.updatedAt) return server;
  return local;
}
