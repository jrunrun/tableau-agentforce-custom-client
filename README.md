# Agentforce Custom Client Demo

This is a custom chat interface implementation for the Agentforce Service Agent using Salesforce's Messaging for In-App and Web APIs using React + Typescript.

Note: You need to create a Custom Client deployment of your Service Agent to get your `SALESFORCE_SCRT_URL` and `SALESFORCE_DEVELOPER_NAME`. To build an agent:

1. **Create and deploy your agent.** You can follow along with the [codeLive: How To Set Up Agentforce Service Agent From Scratch
   ](https://www.youtube.com/live/1vuZfPEtuUM?si=ucN5ToM3flDwSUit) Youtube tutorial or complete the [Configure an Agentforce Service Agent](https://trailhead.salesforce.com/content/learn/projects/quick-start-build-your-first-agent-with-agentforce/configure-an-agentforce-service-agent?trail_id=get-ready-for-agentforce) Trailhead module.
2. **Create a Custom Client.** [Create a Custom Client](https://help.salesforce.com/s/articleView?id=service.miaw_deployment_custom.htm&type=5) using the messaging channel you created in Step 1.

## Prerequisites

- Node.js (v20.x)
- pnpm (v8.x)
- Salesforce org with Messaging for In-App and Web configured

## Local Development

1. Clone and install dependencies:

```bash
git clone <repository-url>
cd <repository-url>
pnpm install
```

2. Configure environment:

```bash
cd server
cp .env.example .env
```

3. Update `.env`:

```
SALESFORCE_SCRT_URL=your-scrt-url
SALESFORCE_ORG_ID=your-org-id
SALESFORCE_DEVELOPER_NAME=your-developer-name
PORT=8080
```

4. Start development:

```bash
# In server directory
pnpm dev

# In client directory (new terminal)
pnpm dev
```

Client runs at `http://localhost:5173`, server at `http://localhost:8080`

## Production Build

Build and start:

```bash
pnpm build
pnpm start
```

## Project Structure

```
agentforce-custom-client/
├── client/          # React frontend
├── server/          # Fastify backend
└── package.json     # Workspace config
```

## Available Scripts

- `pnpm dev:client` - Start client in dev
- `pnpm dev:server` - Start backend in dev
- `pnpm build:client` - Build client and copy to server
- `pnpm build:server` - Build server
- `pnpm build` - Build both
- `pnpm start` - Start production server

## Environment Variables

Required in `server/.env`:

- `SALESFORCE_SCRT_URL` - Salesforce SCRT URL
- `SALESFORCE_ORG_ID` - Salesforce Org ID
- `SALESFORCE_DEVELOPER_NAME` - Salesforce Developer Name
- `PORT` - Server port (default: 8080)
