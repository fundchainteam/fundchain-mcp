# Fundchain MCP Server

Let your AI agent create and manage crypto crowdfunding campaigns on [Fundchain.ai](https://fundchain.ai).

## What is this?

Fundchain MCP gives Claude and other AI agents the ability to:
- Create crowdfunding campaigns that accept ETH and USDC
- Check campaign status and donations
- Browse active campaigns
- Accept donations via x402 protocol

## Installation

### Claude Desktop (one click)
Download and install: [fundchain.mcpb](https://fundchain.ai/mcp)

### Manual
```bash
npm install fundchain-mcp
```

Add to claude_desktop_config.json:
```json
{
  "mcpServers": {
    "fundchain": {
      "command": "node",
      "args": ["path/to/fundchain-mcp/server/index.js"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| create_campaign | Create a new crowdfunding campaign |
| get_campaign | Check campaign status and donations |
| list_campaigns | Browse active campaigns |
| donate_to_campaign | Get donation instructions |
| fundchain_info | Learn about Fundchain.ai |

## Example Usage

Tell Claude:
> "Create a Fundchain campaign for my AI trading bot project, goal $5000 USDC"

Claude will use the create_campaign tool automatically.

## x402 Integration

Fundchain is x402 protocol compatible — AI agents can donate autonomously:

```javascript
const fundchain = require('fundchain-sdk');
await fundchain.donate({
  campaignId: "my-campaign",
  amount: 10,
  token: "USDC"
});
```

## Built on Ethereum

All campaigns run on Ethereum mainnet. Donations go directly to your wallet — no middleman.

---

Built by [Fundchain.ai](https://fundchain.ai)
