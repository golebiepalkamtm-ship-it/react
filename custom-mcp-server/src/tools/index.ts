import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerExampleTools } from "./example.js";
import { registerSaosTools } from "./saosTools.js";
import { registerIsapTools } from "./isapTools.js";

export function registerAllTools(server: McpServer): void {
  registerExampleTools(server);
  registerSaosTools(server);
  registerIsapTools(server);
}
