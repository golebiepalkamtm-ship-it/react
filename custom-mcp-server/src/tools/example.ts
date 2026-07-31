import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerExampleTools(server: McpServer): void {
  // Tool 1: Calculate metrics (Mathematical / analytical utility)
  server.registerTool(
    "calculate_metrics",
    {
      title: "Calculate Array Metrics",
      description: "Calculates summary statistics (mean, median, min, max, sum, standard deviation) for a list of numbers.",
      inputSchema: z.object({
        numbers: z.array(z.number())
          .min(1, "Array must contain at least one number")
          .describe("List of numeric values to analyze")
      }).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ numbers }) => {
      const count = numbers.length;
      const sum = numbers.reduce((acc, curr) => acc + curr, 0);
      const mean = sum / count;
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);

      const sorted = [...numbers].sort((a, b) => a - b);
      const mid = Math.floor(count / 2);
      const median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

      const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
      const stdDev = Math.sqrt(variance);

      const metrics = {
        count,
        sum,
        mean: Number(mean.toFixed(4)),
        median,
        min,
        max,
        stdDev: Number(stdDev.toFixed(4))
      };

      const markdownOutput = [
        "### Metrics Calculation Results",
        `- **Count**: ${metrics.count}`,
        `- **Sum**: ${metrics.sum}`,
        `- **Mean**: ${metrics.mean}`,
        `- **Median**: ${metrics.median}`,
        `- **Min**: ${metrics.min}`,
        `- **Max**: ${metrics.max}`,
        `- **Std Dev**: ${metrics.stdDev}`
      ].join("\n");

      return {
        content: [
          {
            type: "text",
            text: markdownOutput
          }
        ],
        structuredContent: metrics
      };
    }
  );

  // Tool 2: System info / status tool
  server.registerTool(
    "system_status",
    {
      title: "Get Custom MCP Server Status",
      description: "Returns health status, server timestamp, and runtime metrics for custom-mcp-server.",
      inputSchema: z.object({}).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => {
      const status = {
        status: "healthy",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        memoryUsageMB: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        }
      };

      return {
        content: [
          {
            type: "text",
            text: `Server Status: ${status.status.toUpperCase()}\nUptime: ${status.uptimeSeconds}s\nNode: ${status.nodeVersion}\nTimestamp: ${status.timestamp}`
          }
        ],
        structuredContent: status
      };
    }
  );
}
