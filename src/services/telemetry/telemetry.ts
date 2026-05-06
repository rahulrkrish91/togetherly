export type TelemetryLevel = 'info' | 'warning' | 'error';

export interface TelemetryEvent {
  name: string;
  level: TelemetryLevel;
  ts: string;
  context?: Record<string, unknown>;
}

const queue: TelemetryEvent[] = [];

export function trackEvent(name: string, context?: Record<string, unknown>) {
  const event: TelemetryEvent = { name, context, level: 'info', ts: new Date().toISOString() };
  queue.push(event);
  console.log('[telemetry:event]', event);
}

export function trackError(name: string, error: unknown, context?: Record<string, unknown>) {
  const event: TelemetryEvent = {
    name,
    level: 'error',
    ts: new Date().toISOString(),
    context: {
      ...context,
      message: error instanceof Error ? error.message : String(error),
    },
  };
  queue.push(event);
  console.error('[telemetry:error]', event);
}

export function getTelemetryQueue() {
  return [...queue];
}

export function clearTelemetryQueue() {
  queue.length = 0;
}
