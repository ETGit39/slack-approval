"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const bolt_1 = require("@slack/bolt");
const web_api_1 = require("@slack/web-api");
const token = process.env.SLACK_BOT_TOKEN || "";
const signingSecret = process.env.SLACK_SIGNING_SECRET || "";
const slackAppToken = process.env.SLACK_APP_TOKEN || "";
const channel_id = process.env.SLACK_CHANNEL_ID || "";
const environment = process.env.ENVIRONMENT || "";
const url = process.env.URL || "";
const app = new bolt_1.App({
    token: token,
    signingSecret: signingSecret,
    appToken: slackAppToken,
    socketMode: true,
    port: 3000,
    logLevel: bolt_1.LogLevel.DEBUG,
});
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const web = new web_api_1.WebClient(token);
            const github_server_url = process.env.GITHUB_SERVER_URL || "";
            const github_repos = process.env.GITHUB_REPOSITORY || "";
            const run_id = process.env.GITHUB_RUN_ID || "";
            const actionsUrl = `${github_server_url}/${github_repos}/actions/runs/${run_id}`;
            const runnerOS = process.env.RUNNER_OS || "";
            const actor = process.env.USER_NAME || "";
            const initialMessage = {
                channel: "CHANNEL_ID",
                text: "ARE ALL SMOKE GROUPS GREEN?",
                blocks: [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: `Hey @${actor} 🐝\nPlease verify all smoke groups are green. If not, sort the issue by fixing bugs and re-running the group. Proceed only after that.`,
                    },
                  },
                  {
                    type: "section",
                    fields: [
                      {
                        type: "mrkdwn",
                        text: `*Actions URL:*\n${actionsUrl}`,
                      },
                    ],
                  },
                  {
                    type: "actions",
                    elements: [
                      {
                        type: "button",
                        text: {
                          type: "plain_text",
                          emoji: true,
                          text: "Approve",
                        },
                        style: "primary",
                        value: "approve",
                        action_id: "slack-approval-approve",
                      },
                      {
                        type: "button",
                        text: {
                          type: "plain_text",
                          emoji: true,
                          text: "Reject",
                        },
                        style: "danger",
                        value: "reject",
                        action_id: "slack-approval-reject",
                      },
                    ],
                  },
                ],
              };
            
              app.action("slack-approval-approve", async ({ ack, body, client }) => {
                try {
                  await ack();
            
                  const confirmationModal = {
                    type: "modal",
                    title: {
                      type: "plain_text",
                      text: "Confirmation",
                    },
                    blocks: [
                      {
                        type: "section",
                        text: {
                          type: "mrkdwn",
                          text: `Are you sure you want to approve?`,
                        },
                      },
                      {
                        type: "actions",
                        elements: [
                          {
                            type: "button",
                            text: {
                              type: "plain_text",
                              text: "Confirm",
                            },
                            style: "primary",
                            value: "approve-confirm",
                          },
                          {
                            type: "button",
                            text: {
                              type: "plain_text",
                              text: "Reject",
                            },
                            style: "danger",
                            value: "approve-reject",
                          },
                        ],
                      },
                    ],
                  };
            
                  const result = await client.views.open({
                    trigger_id: body.trigger_id,
                    view: confirmationModal,
                  });
            
                  console.log("Confirmation dialog opened", result);
                } catch (error) {
                  console.error(error);
                }
              });
            
              app.action("approve-confirm", async ({ ack, body, client }) => {
                try {
                  await ack();
            
                  const responseBlocks = body.message.blocks;
                  responseBlocks.pop();
                  responseBlocks.push({
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: `Approved by <@${body.user.id}>`,
                    },
                  });
            
                  await client.chat.update({
                    channel: body.channel.id,
                    ts: body.message.ts,
                    blocks: responseBlocks,
                  });
            
                  // Other actions to be performed after approval confirmation
                } catch (error) {
                  console.error(error);
                }
                process.exit(0);
              });
            
              app.action("approve-reject", async ({ ack, body, client }) => {
                try {
                    await ack();
              
                    await client.chat.postMessage(initialMessage);
              
                    console.log("Flow restarted");
                  } catch (error) {
                    console.error(error);
                  }
                });
              
                (async () => {
                  await app.start(3000);
                  console.log("Waiting for approval reaction...");
                  await client.chat.postMessage(initialMessage);
                  console.log("Initial message sent");
                })();
            
              app.action("slack-approval-reject", async ({ ack, body, client }) => {
                try {
                  await ack();
            
                  const confirmationModal = {
                    type: "modal",
                    title: {
                      type: "plain_text",
                      text: "Confirmation",
                    },
                    blocks: [
                      {
                        type: "section",
                        text: {
                          type: "mrkdwn",
                          text: `Are you sure you want to cancel?`,
                        },
                      },
                      {
                        type: "actions",
                        elements: [
                          {
                            type: "button",
                            text: {
                              type: "plain_text",
                              text: "Confirm",
                            },
                            style: "primary",
                            value: "reject-confirm",
                          },
                          {
                            type: "button",
                            text: {
                              type: "plain_text",
                              text: "Go Back",
                            },
                            style: "danger",
                            value: "reject-cancel",
                          },
                        ],
                      },
                    ],
                  };
            
                  const result = await client.views.open({
                    trigger_id: body.trigger_id,
                    view: confirmationModal,
                  });
            
                  console.log("Confirmation dialog opened", result);
                } catch (error) {
                  console.error(error);
                }
              });
            
              app.action("reject-confirm", async ({ ack, body, client }) => {
                try {
                  await ack();
            
                  const responseBlocks = body.message.blocks;
                  responseBlocks.pop();
                  responseBlocks.push({
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: `Rejected by <@${body.user.id}>`,
                    },
                  });
            
                  await client.chat.update({
                    channel: body.channel.id,
                    ts: body.message.ts,
                    blocks: responseBlocks,
                  });
            
                  // Other actions to be performed after rejection confirmation
                } catch (error) {
                  console.error(error);
                }
                process.exit(1);
              });
            
              app.action("reject-cancel", async ({ ack, client }) => {
                try {
                  await ack();
            
                  await client.chat.postMessage(initialMessage);
            
                  console.log("Flow restarted");
                } catch (error) {
                  console.error(error);
                }
              });
            
              (async () => {
                await app.start(3000);
                console.log("Waiting for approval reaction...");
                await client.chat.postMessage(initialMessage);
                console.log("Initial message sent");
              })();
            }
            catch (error) {
                if (error instanceof Error)
                    core.setFailed(error.message);
        }
    });
}
          
run();