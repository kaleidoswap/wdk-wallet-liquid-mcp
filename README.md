# wdk-wallet-liquid-mcp

> [!IMPORTANT]
> **This repository is archived.** All of its tools now ship in the unified
> [**kaleido-mcp**](https://github.com/kaleidoswap/kaleido-mcp) server (0.3.0+), together with
> KaleidoSwap DEX, RLN, Spark, Liquid and MPP/L402 tools. Use `npx -y kaleido-mcp` instead.

MCP server exposing a **Liquid network** wallet to AI agents, backed by
[`@kaleidorg/wdk-wallet-liquid`](../wdk-wallet-liquid) (an in-process LWK
wallet). No external daemon is required.

## Tools

| Tool | Description |
|------|-------------|
| `liquid_get_node_info` | Network, policy asset, receive address, chain tip. |
| `liquid_get_address` | A confidential (CT) receive address. |
| `liquid_get_balance` | Spendable L-BTC balance (satoshis). |
| `liquid_get_asset_balance` | Balance of a specific Liquid asset. |
| `liquid_list_assets` | All assets held with balances. |
| `liquid_list_transactions` | Transaction history. |
| `liquid_list_unspents` | Wallet UTXOs. |
| `liquid_send_btc` | Send L-BTC to a CT address. |
| `liquid_send_asset` | Send a Liquid asset (e.g. USDt-Liquid). |
| `liquid_get_fee_rates` | Suggested fee rates (sat/vB). |

## Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `LIQUID_MNEMONIC` | — (required) | BIP-39 mnemonic for the wallet. |
| `LIQUID_NETWORK` | `testnet` | `mainnet`, `testnet` or `regtest`. |
| `LIQUID_ESPLORA_URL` | network default | Esplora API base URL. |
| `PORT` | — | If set, serve over StreamableHTTP instead of stdio. |
| `MCP_AUTH_TOKEN` | — | Optional bearer token for HTTP mode. |

## Run

```sh
npm install
npm run build

# stdio (Claude Desktop, kaleidoagent, …)
LIQUID_MNEMONIC="word word ..." node dist/index.js

# HTTP
PORT=3013 LIQUID_MNEMONIC="word word ..." node dist/index.js
```

## License

Apache-2.0
