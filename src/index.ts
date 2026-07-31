#!/usr/bin/env node
/**
 * WDK Wallet Liquid MCP Server
 *
 * Exposes a Liquid network wallet (in-process LWK) to AI agents via the
 * Model Context Protocol.
 *
 * Transport:
 *   stdio (default)  — connect via Claude Desktop, kaleidoagent, or any MCP host
 *   HTTP             — set PORT to enable StreamableHTTP on that port
 *
 * Usage:
 *   LIQUID_MNEMONIC="word word ..." npx wdk-wallet-liquid-mcp
 *   PORT=3013 LIQUID_MNEMONIC="word word ..." npx wdk-wallet-liquid-mcp
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createServer } from './server.js'
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from 'node:http'

const MNEMONIC = process.env.LIQUID_MNEMONIC ?? ''
const NETWORK = process.env.LIQUID_NETWORK ?? 'testnet'
const ESPLORA_URL = process.env.LIQUID_ESPLORA_URL
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : null

async function main() {
  if (!MNEMONIC) {
    process.stderr.write('[wdk-wallet-liquid-mcp] Fatal: LIQUID_MNEMONIC env var is required\n')
    process.exit(1)
  }

  const mcpServer = createServer({ mnemonic: MNEMONIC, network: NETWORK, esploraUrl: ESPLORA_URL })

  if (PORT) {
    const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN ?? null
    // HTTP mode — one StreamableHTTP transport per request (stateless)
    const httpServer = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
      if (AUTH_TOKEN) {
        const auth = req.headers['authorization']
        if (auth !== `Bearer ${AUTH_TOKEN}`) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }
      }
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
      res.on('close', () => { transport.close().catch(() => {}) })
      await mcpServer.connect(transport)
      await transport.handleRequest(req, res)
    })
    httpServer.listen(PORT, '0.0.0.0', () => {
      process.stderr.write(`[wdk-wallet-liquid-mcp] HTTP transport listening on port ${PORT} — Liquid ${NETWORK}\n`)
    })
  } else {
    // stdio mode (default)
    const transport = new StdioServerTransport()
    await mcpServer.connect(transport)
    process.stderr.write(`[wdk-wallet-liquid-mcp] stdio transport connected — Liquid ${NETWORK}\n`)
  }
}

main().catch((err) => {
  process.stderr.write(`[wdk-wallet-liquid-mcp] Fatal error: ${err}\n`)
  process.exit(1)
})
