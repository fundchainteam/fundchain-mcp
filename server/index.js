import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const FUNDCHAIN_API = "https://fundchain.ai/api";

const server = new McpServer({
  name: "fundchain",
  version: "1.0.0",
  description: "Create and manage crypto crowdfunding campaigns on Fundchain.ai"
});

// Tool 1: Create Campaign
server.tool(
  "create_campaign",
  {
    title: z.string().describe("Campaign title"),
    description: z.string().describe("Campaign description"),
    goal_amount: z.number().describe("Funding goal in USD"),
    token: z.enum(["ETH", "USDC"]).describe("Accepted token"),
    wallet_address: z.string().optional().describe("ETH wallet to receive funds"),
    category: z.enum([
      "AI_AGENT", "WEB3", "RESEARCH",
      "STARTUP", "CREATIVE", "PERSONAL", "OTHER"
    ]).optional().describe("Campaign category"),
    deadline_days: z.number().optional().describe("Campaign duration in days")
  },
  async ({ title, description, goal_amount, token, wallet_address, category, deadline_days }) => {
    try {
      const response = await fetch(`${FUNDCHAIN_API}/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          goal_amount,
          token,
          wallet_address,
          category: category || "AI_AGENT",
          deadline_days: deadline_days || 30
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          content: [{
            type: "text",
            text: `Failed to create campaign: ${error.message || response.statusText}\n\nYou can also create campaigns manually at https://fundchain.ai/create`
          }]
        };
      }

      const campaign = await response.json();
      return {
        content: [{
          type: "text",
          text: `Campaign created successfully!\n\nTitle: ${campaign.title || title}\nGoal: $${goal_amount} ${token}\nCampaign URL: ${campaign.url || `https://fundchain.ai/c/${campaign.id}`}\nWallet: ${wallet_address || "Set in dashboard"}\n\nShare your campaign to start receiving ${token} donations!\nDonors can contribute via x402 protocol - no friction, instant settlement.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Unable to connect to Fundchain API. Create your campaign manually at https://fundchain.ai/create\n\nError: ${error.message}`
        }]
      };
    }
  }
);

// Tool 2: Get Campaign Status
server.tool(
  "get_campaign",
  {
    campaign_id: z.string().describe("Campaign ID or URL slug")
  },
  async ({ campaign_id }) => {
    try {
      const response = await fetch(`${FUNDCHAIN_API}/campaigns/${campaign_id}`);

      if (!response.ok) {
        return {
          content: [{
            type: "text",
            text: `Campaign not found. Check your campaign at https://fundchain.ai`
          }]
        };
      }

      const campaign = await response.json();
      const progress = ((campaign.raised / campaign.goal) * 100).toFixed(1);

      return {
        content: [{
          type: "text",
          text: `Campaign Status\n\nTitle: ${campaign.title}\nGoal: $${campaign.goal}\nRaised: $${campaign.raised} (${progress}%)\nDonors: ${campaign.donor_count}\nToken: ${campaign.token}\nStatus: ${campaign.status}\nURL: https://fundchain.ai/c/${campaign_id}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Check campaign status at https://fundchain.ai/c/${campaign_id}`
        }]
      };
    }
  }
);

// Tool 3: List Campaigns
server.tool(
  "list_campaigns",
  {
    category: z.enum([
      "AI_AGENT", "WEB3", "RESEARCH",
      "STARTUP", "CREATIVE", "PERSONAL", "OTHER", "ALL"
    ]).optional().describe("Filter by category"),
    limit: z.number().optional().describe("Number of campaigns to return (default 10)")
  },
  async ({ category, limit }) => {
    try {
      const params = new URLSearchParams();
      if (category && category !== "ALL") params.append("category", category);
      params.append("limit", String(limit || 10));

      const response = await fetch(`${FUNDCHAIN_API}/campaigns?${params}`);
      const data = await response.json();

      if (!data.campaigns || data.campaigns.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No campaigns found. Browse all campaigns at https://fundchain.ai`
          }]
        };
      }

      const list = data.campaigns.map((c, i) =>
        `${i+1}. ${c.title}\n   Goal: $${c.goal} | Raised: $${c.raised} | Token: ${c.token}\n   URL: https://fundchain.ai/c/${c.id}`
      ).join("\n\n");

      return {
        content: [{
          type: "text",
          text: `Active Campaigns on Fundchain.ai\n\n${list}\n\nBrowse all: https://fundchain.ai`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Browse all campaigns at https://fundchain.ai`
        }]
      };
    }
  }
);

// Tool 4: Donate to Campaign (x402)
server.tool(
  "donate_to_campaign",
  {
    campaign_id: z.string().describe("Campaign ID to donate to"),
    amount: z.number().describe("Donation amount in USD"),
    token: z.enum(["ETH", "USDC"]).describe("Token to donate"),
    donor_address: z.string().optional().describe("Your ETH wallet address"),
    message: z.string().optional().describe("Optional message to campaign creator")
  },
  async ({ campaign_id, amount, token, donor_address, message }) => {
    return {
      content: [{
        type: "text",
        text: `To donate $${amount} ${token} to campaign ${campaign_id}:\n\n1. Visit: https://fundchain.ai/c/${campaign_id}\n2. Click "Donate"\n3. Connect your wallet\n4. Send ${amount} ${token}\n\nFor x402 autonomous donations, use the Fundchain SDK:\nnpm install fundchain-sdk\n\nconst fundchain = require('fundchain-sdk');\nawait fundchain.donate({\n  campaignId: "${campaign_id}",\n  amount: ${amount},\n  token: "${token}",\n  from: "${donor_address || 'YOUR_WALLET'}"\n});\n\nDonation URL: https://fundchain.ai/c/${campaign_id}/donate`
      }]
    };
  }
);

// Tool 5: Fundchain Info
server.tool(
  "fundchain_info",
  {},
  async () => {
    return {
      content: [{
        type: "text",
        text: `About Fundchain.ai\n\nFundchain is a crypto-native crowdfunding platform built on Ethereum.\n\n- Accept ETH and USDC donations\n- x402 protocol compatible (AI agents can donate autonomously)\n- No middleman - funds go directly to your wallet\n- Instant settlement on Ethereum\n- Built for AI agents and human creators\n\nUse Cases:\n- AI agent builders raising funds for projects\n- Autonomous agents creating and promoting campaigns\n- x402-compatible payments between agents\n- Web3 project crowdfunding\n\nGet Started: https://fundchain.ai\nCreate Campaign: https://fundchain.ai/create\nDocs: https://fundchain.ai/docs\nGitHub: https://github.com/fundchainteam`
      }]
    };
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Fundchain MCP Server running");
