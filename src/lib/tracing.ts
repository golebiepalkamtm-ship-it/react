/**
 * Minimal OpenTelemetry setup for the browser (Vite + React).
 * Enabled via VITE_ENABLE_TRACING=true and VITE_OTEL_EXPORTER_ENDPOINT.
 */
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';

const enabled = (import.meta.env.VITE_ENABLE_TRACING === 'true');
if (!enabled) {
  // noop in prod unless explicitly enabled

  console.info('Browser tracing disabled (VITE_ENABLE_TRACING != true)');
} else {
  const serviceName = import.meta.env.VITE_OTEL_SERVICE_NAME || 'champion-pigeon-web';
  const endpoint = import.meta.env.VITE_OTEL_EXPORTER_ENDPOINT || 'http://localhost:4318/v1/traces';

  const provider = new WebTracerProvider({});
  const exporter = new OTLPTraceExporter({ url: endpoint });
  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  // In dev also log to console for quick verification
  if (import.meta.env.DEV) {
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  }

  provider.register();

  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        ignoreUrls: [/\/sockjs-node\//, /\.hot-update\./],
      }),
      new XMLHttpRequestInstrumentation(),
    ],
  });

  // global error -> span
  window.addEventListener('error', (ev) => {
    try {
      const tracer = provider.getTracer(serviceName);
      const span = tracer.startSpan('window.error');
      span.setAttribute('error.message', String((ev && (ev as any).message) || 'unknown'));
      span.end();
    } catch (e) {
      // ignore
    }
  });

  window.addEventListener('unhandledrejection', (ev) => {
    try {
      const tracer = provider.getTracer(serviceName);
      const span = tracer.startSpan('unhandledrejection');
      span.setAttribute('error.reason', String((ev && (ev as any).reason) || 'unknown'));
      span.end();
    } catch (e) {
      // ignore
    }
  });
}
