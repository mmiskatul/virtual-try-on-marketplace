import { trace } from '@opentelemetry/api';

export interface EdgeTelemetryConfig {
  serviceName: string;
  environment: string;
}

/**
 * Initialize Edge Runtime OpenTelemetry Instrumentation
 * Runs inside the V8 Edge Runtime (Edge routes, edge middleware, edge SSR).
 */
export async function initEdgeTelemetry(config: EdgeTelemetryConfig): Promise<void> {
  const tracer = trace.getTracer(config.serviceName);
  const edgeBootSpan = tracer.startSpan('nextjs.edge.boot');

  edgeBootSpan.setAttribute('service.name', config.serviceName);
  edgeBootSpan.setAttribute('deployment.environment', config.environment);
  edgeBootSpan.setAttribute('runtime.name', 'vercel-edge-v8');
  edgeBootSpan.setAttribute('dd.service', config.serviceName);
  edgeBootSpan.setAttribute('dd.env', config.environment);

  edgeBootSpan.end();
}
