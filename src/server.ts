import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { LiquidAccount } from '@kaleidorg/wdk-wallet-liquid'

export interface LiquidServerConfig {
  mnemonic: string
  network?: string
  esploraUrl?: string
}

export function createServer(config: LiquidServerConfig): McpServer {
  const account = new (LiquidAccount as any)({
    mnemonic: config.mnemonic,
    network: config.network ?? 'testnet',
    esploraUrl: config.esploraUrl,
  })

  const server = new McpServer({
    name: 'wdk-wallet-liquid',
    version: '1.0.0',
  })

  // -----------------------------------------------------------------------
  // Tool: liquid_get_node_info
  // -----------------------------------------------------------------------
  server.tool(
    'liquid_get_node_info',
    'Get the Liquid wallet network summary: network name, policy (L-BTC) asset id, current receive address, and the chain tip height. Call this first to confirm the wallet is reachable.',
    {},
    async () => {
      const info = await account.getNetworkInfo()
      return text(JSON.stringify(info, null, 2))
    }
  )

  // -----------------------------------------------------------------------
  // Tool: liquid_get_address
  // -----------------------------------------------------------------------
  server.tool(
    'liquid_get_address',
    'Get a Liquid confidential (CT) receive address for depositing L-BTC or Liquid assets.',
    {},
    async () => {
      const address = await account.getAddress()
      return text(JSON.stringify({ address }, null, 2))
    }
  )

  // -----------------------------------------------------------------------
  // Tool: liquid_get_balance
  // -----------------------------------------------------------------------
  server.tool(
    'liquid_get_balance',
    'Get the spendable L-BTC balance of the Liquid wallet, in satoshis. Syncs with the chain before returning.',
    {},
    async () => {
      const balance = await account.getBalance()
      return text(JSON.stringify({ lbtc_balance_sats: balance.toString() }, null, 2))
    }
  )

  // -----------------------------------------------------------------------
  // Tool: liquid_get_asset_balance
  // -----------------------------------------------------------------------
  server.tool(
    'liquid_get_asset_balance',
    'Get the balance of a specific Liquid asset (e.g. USDt-Liquid) by its asset id, in the asset smallest unit.',
    {
      asset_id: z.string().describe('Liquid asset id (64 hex characters)'),
    },
    async ({ asset_id }) => {
      const balance = await account.getTokenBalance(asset_id)
      return text(JSON.stringify({ asset_id, balance: balance.toString() }, null, 2))
    }
  )

  // -----------------------------------------------------------------------
  // Tool: liquid_list_assets
  // -----------------------------------------------------------------------
  server.tool(
    'liquid_list_assets',
    'List every Liquid asset held by the wallet with its satoshi balance.',
    {},
    async () => {
      const assets = await account.listAssets()
      return text(JSON.stringify(assets, null, 2))
    }
  )

  // -----------------------------------------------------------------------
  // Tool: liquid_list_transactions
  // -----------------------------------------------------------------------
  server.tool(
    'liquid_list_transactions',
    'List the wallet transaction history (newest first): txid, type, fee, block height and timestamp.',
    {},
    async () => {
      const txs = await account.listTransactions()
      return text(JSON.stringify(txs, null, 2))
    }
  )

  // -----------------------------------------------------------------------
  // Tool: liquid_list_unspents
  // -----------------------------------------------------------------------
  server.tool(
    'liquid_list_unspents',
    'List the wallet unspent transaction outputs (UTXOs): txid, vout, asset id, value and confirmation height.',
    {},
    async () => {
      const utxos = await account.listUnspents()
      return text(JSON.stringify(utxos, null, 2))
    }
  )

  // -----------------------------------------------------------------------
  // Tool: liquid_send_btc
  // -----------------------------------------------------------------------
  server.tool(
    'liquid_send_btc',
    'Send L-BTC on the Liquid network to a confidential address. Returns the broadcast txid and fee.',
    {
      recipient: z.string().describe('Liquid confidential (CT) destination address'),
      amount_sats: z.number().int().positive().describe('Amount to send, in satoshis'),
      fee_rate: z.number().positive().optional().describe('Fee rate in sat/vB (default: network minimum)'),
    },
    async ({ recipient, amount_sats, fee_rate }) => {
      const result = await account.transfer({ recipient, amount: amount_sats, feeRate: fee_rate })
      return text(JSON.stringify({ txid: result.hash, fee_sats: result.fee.toString() }, null, 2))
    }
  )

  // -----------------------------------------------------------------------
  // Tool: liquid_send_asset
  // -----------------------------------------------------------------------
  server.tool(
    'liquid_send_asset',
    'Send a non-L-BTC Liquid asset (e.g. USDt-Liquid) to a confidential address. Returns the broadcast txid and fee.',
    {
      asset_id: z.string().describe('Liquid asset id (64 hex characters)'),
      recipient: z.string().describe('Liquid confidential (CT) destination address'),
      amount: z.number().int().positive().describe('Amount to send, in the asset smallest unit'),
      fee_rate: z.number().positive().optional().describe('Fee rate in sat/vB (default: network minimum)'),
    },
    async ({ asset_id, recipient, amount, fee_rate }) => {
      const result = await account.sendAsset({ assetId: asset_id, recipient, amount, feeRate: fee_rate })
      return text(JSON.stringify({ txid: result.hash, fee_sats: result.fee.toString() }, null, 2))
    }
  )

  // -----------------------------------------------------------------------
  // Tool: liquid_get_fee_rates
  // -----------------------------------------------------------------------
  server.tool(
    'liquid_get_fee_rates',
    'Get suggested Liquid fee rates in sat/vB. Liquid fees are low and stable — the network minimum is almost always sufficient.',
    {},
    async () => {
      return text(JSON.stringify({ normal_sat_vb: 1, fast_sat_vb: 1 }, null, 2))
    }
  )

  return server
}

// ---------------------------------------------------------------------------

function text(content: string) {
  return { content: [{ type: 'text' as const, text: content }] }
}
