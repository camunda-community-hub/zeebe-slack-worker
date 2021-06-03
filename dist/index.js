"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackWorker = void 0;
const zeebe_node_1 = require("zeebe-node");
const slack_sender_1 = require("./slack-sender");
class SlackWorker {
    constructor({ ZBConfig, SlackProfiles, Logger = console }) {
        this.zbc = new zeebe_node_1.ZBClient(ZBConfig);
        const slackSender = new slack_sender_1.SlackSender(SlackProfiles, Logger);
        this.zbc.createWorker({
            taskHandler: (job) => slackSender.sendSlackMessage(job),
            taskType: "slack:message",
        });
    }
    close() {
        this.zbc.close();
    }
}
exports.SlackWorker = SlackWorker;
