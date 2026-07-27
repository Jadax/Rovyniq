export interface AuditEvent { id: string; occurredAt: string; actorId: string; action: string; entityType: string; entityId: string; tenantId: string; correlationId: string; metadata: Readonly<Record<string, string | number | boolean>>; }
export interface OutboxEvent { id: string; type: string; aggregateId: string; occurredAt: string; payload: Readonly<Record<string, string>>; }
export function createAuditEvent(input: Omit<AuditEvent, "id" | "occurredAt">, clock = new Date()): AuditEvent {
  return { ...input, id: crypto.randomUUID(), occurredAt: clock.toISOString() };
}
