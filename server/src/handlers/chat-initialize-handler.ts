import axios from "axios";
// import crypto from "crypto";
import crypto from "node:crypto";
import { SalesforceConfig } from "../types";

export async function handleInitialize(salesforceConfig: SalesforceConfig) {
  console.log('Initializing chat with config:', {
    orgId: salesforceConfig.orgId,
    esDeveloperName: salesforceConfig.esDeveloperName,
    scrtUrl: salesforceConfig.scrtUrl
  });

  const tokenResponse = await axios.post(
    `https://${salesforceConfig.scrtUrl}/iamessage/api/v2/authorization/unauthenticated/access-token`,
    {
      orgId: salesforceConfig.orgId,
      esDeveloperName: salesforceConfig.esDeveloperName,
      capabilitiesVersion: "1",
      platform: "Web",
      context: {
        appName: "DemoMessagingClient",
        clientVersion: "1.0.0",
      },
    }
  );

  console.log('Token response received:', {
    accessToken: tokenResponse.data.accessToken ? '(token exists)' : '(no token)',
    lastEventId: tokenResponse.data.lastEventId
  });

  const accessToken = tokenResponse.data.accessToken;
  const lastEventId = tokenResponse.data.lastEventId;
  const conversationId = crypto.randomUUID().toLowerCase();

  console.log('Generated conversation ID:', conversationId);

  await axios.post(
    `https://${salesforceConfig.scrtUrl}/iamessage/api/v2/conversation`,
    {
      conversationId,
      esDeveloperName: salesforceConfig.esDeveloperName,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return { accessToken, conversationId, lastEventId };
}
