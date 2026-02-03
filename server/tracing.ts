import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const enabled = process.env.ENABLE_TRACING === 'true' || process.env.OTEL_ENABLED === 'true';
if (!enabled) {
  // No-op when tracing disabled
  console.info('Tracing disabled (ENABLE_TRACING != true)');
  process.exitCode = process.exitCode ?? 0; // keep module side-effect minimal
} else {
  const serviceName = process.env.OTEL_SERVICE_NAME || 'champion-pigeon-api';
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

  const exporter = new OTLPTraceExporter({ url: endpoint });

  const sdk = new NodeSDK({
    traceExporter: exporter,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  (async () => {
    try {
      // NodeSDK.start() may return a Promise depending on version — await to be safe
      await (sdk as any).start?.();
      console.info(`OpenTelemetry SDK started — exporter: ${endpoint}`);
    } catch (err: unknown) {
      console.error('Error starting OpenTelemetry SDK', err);
    }
  })();

  // graceful shutdown
  const shutdown = async () => {
    try {
      await (sdk as any).shutdown?.();
      console.info('OpenTelemetry SDK shut down');
    } catch (err: unknown) {
      console.error('Error shutting down OpenTelemetry SDK', err);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
