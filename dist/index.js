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

            const askConfirmation = () => {
                return __awaiter(this, void 0, void 0, function* () {
                    yield web.chat.postMessage({
                        channel: channel_id,
                        text: "Are you sure you want to proceed?",
                        blocks: [
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": "Confirmation Dialog\nAre you sure you want to proceed?"
                                }
                            },
                            {
                                "type": "actions",
                                "elements": [
                                    {
                                        "type": "button",
                                        "text": {
                                            "type": "plain_text",
                                            "text": "Yes",
                                            "emoji": true
                                        },
                                        "style": "primary",
                                        "value": "confirm"
                                    },
                                    {
                                        "type": "button",
                                        "text": {
                                            "type": "plain_text",
                                            "text": "No",
                                            "emoji": true
                                        },
                                        "style": "danger",
                                        "value": "cancel"
                                    }
                                ]
                            }
                        ]
                    });
                });
            };

            (() => __awaiter(this, void 0, void 0, function* () {
                yield web.chat.postMessage({
                    channel: channel_id,
                    text: "ARE ALL SMOKE GROUPS GREEN?",
                    blocks: [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": `Hey @${actor} 🌪️\nPlease verify all smoke groups are green. If not, sort the issue by fixing bugs and re-running the group. Proceed only after that.`,
                            }
                        },
                        {
                            "type": "section",
                            "fields": [
                                {
                                    "type": "mrkdwn",
                                    "text": `*Actions URL:*\n${actionsUrl}`
                                },
                            ]
                        }
                    ]
                });
                const result = yield app.client.dialog.open({
                    token: token,
                    trigger_id: "TRIGGER_ID",
                    dialog: {
                        callback_id: "initial_dialog",
                        title: "Confirmation Dialog",
                        submit_label: "Submit",
                        notify_on_cancel: false,
                        elements: [
                            {
                                label: "Are you sure?",
                                type: "select",
                                name: "confirmation",
                                options: [
                                    {
                                        label: "Yes",
                                        value: "yes"
                                    },
                                    {
                                        label: "No",
                                        value: "no"
                                    }
                                ]
                            }
                        ]
                    }
                });
                console.log(result);
                if (result.submission && result.submission.confirmation === "yes") {
                    yield askConfirmation();
                } else {
                    // Handle "No" response
                    // Go back to initial dialog box and wait
                    run();
                }
            }))();

            app.action('confirm', ({ ack }) => __awaiter(this, void 0, void 0, function* () {
                yield ack();
                // Handle "Yes" response
                // Proceed with the approval process
                (() => __awaiter(this, void 0, void 0, function* () {
                    yield web.chat.postMessage({
                        channel: channel_id,
                        text: "ARE ALL SMOKE GROUPS GREEN?",
                        blocks: [
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": `Hey @${actor} 🌪️\nPlease verify all smoke groups are green. If not, sort the issue by fixing bugs and re-running the group. Proceed only after that.`,
                                }
                            },
                            {
                                "type": "section",
                                "fields": [
                                    {
                                        "type": "mrkdwn",
                                        "text": `*Actions URL:*\n${actionsUrl}`
                                    },
                                ]
                            }
                        ]
                    });
                }))();
            }));

            app.action('cancel', ({ ack }) => __awaiter(this, void 0, void 0, function* () {
                yield ack();
                // Handle "No" response
                // Go back to initial dialog box and wait
                run();
            }));

            yield app.start();
        } catch (error) {
            core.setFailed(error.message);
        }
    });
}

run();
