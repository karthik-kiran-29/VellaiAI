# 🧠 Resume-Job Matcher with PostgreSQL + MCP + Web scraping

A powerful job search tool that scrapes fresh listings from job portals and matches them with your resume using LLM and MCP Arcitectur. The system uses:

- A TypeScript-based web scraper
- A PostgreSQL database 
- A Node.js MCP API to serve matches to LLM like Claude Desktop

---

## 🧩 Project Modules

### 1. 🔎 Web Scraper (TypeScript)
- Scrapes job listings from Google Jobs(Demo).
- Cleans, standardizes, and stores data in PostgreSQL

### 2. 🧠 PostgreSQL + MCP Server
- Matches a given resume with jobs using LLM
- Retrieves only neccessary data using MCP protocol
- Supports hybrid filters (e.g. location, experience)

---

## 🧰 Tech Stack

| Layer       | Tech                         |
|-------------|------------------------------|
| Scraper     | TypeScript + Puppeteer       |
| Storage     | PostgreSQL                   |
| API Server  | postgress mcp server         |
| ORM         | node-postgress               |

---

## 🖥️ Claude Desktop Integration

Claude can connect to the MCP server via localhost API to query:

## Also Checkout the other branch

The plan was to create a full stack app leveraging custom MCP server with resources and tools but I will do that in future.
