// src/server.ts

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"; // core MCP server API :contentReference[oaicite:0]{index=0}
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";      // stdio transport for local IPC :contentReference[oaicite:1]{index=1}
import { pool } from "./db";




// 2. Instantiate the MCP server
const server = new McpServer({
  name: "JobService",
  version: "1.0.0",
});

// 3. Define a resource template for listing jobs
//    We’re not expecting any parameters here, but Zod could validate filters if added.
const listJobsTemplate = new ResourceTemplate(
  "jobs://list",
  { list: () => ({}) }    // no URI params
);

// 4. Register the "jobs:list" resource
server.resource(
  "jobs:list",
  listJobsTemplate,
  async (uri, _params) => {
    // Query all rows from job_details
    const result = await pool.query(
      `SELECT
         id,
         title,
         company,
         location,
         description,
         posted_at AS "postedAt",
         qualifications,
         responsibilities
       FROM job_details;`
    );

    // Return each row as a text content block or JSON as needed
    return {
      contents: result.rows.map(row => ({
        uri: uri.href,
        // Here we emit a JSON payload; you could split into text blocks instead.
        json: row
      }))
    };
  }
);

// 5. Wire up stdio transport & start the server
const transport = new StdioServerTransport();
(async () => {
  await server.connect(transport);
  console.log("🚀 JobService MCP server listening (stdio)");
})();
