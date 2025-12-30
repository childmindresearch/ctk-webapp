import { NodeSDK } from "@opentelemetry/sdk-node"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto"
import { createAddHookMessageChannel } from "import-in-the-middle"
import { register } from "node:module"
import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter"
import { env } from "$env/dynamic/private"
import { dev } from "$app/environment"

const { registerOptions } = createAddHookMessageChannel()
register("import-in-the-middle/hook.mjs", import.meta.url, registerOptions)

const spanProcessors = [new BatchSpanProcessor(new OTLPTraceExporter())]
if (!dev) {
    spanProcessors.push(
        new BatchSpanProcessor(
            new AzureMonitorTraceExporter({ connectionString: env.APPLICATIONINSIGHTS_CONNECTION_STRING })
        )
    )
}
const sdk = new NodeSDK({
    serviceName: "ctk-tracing",
    spanProcessors: spanProcessors,
    instrumentations: [getNodeAutoInstrumentations()]
})

sdk.start()
