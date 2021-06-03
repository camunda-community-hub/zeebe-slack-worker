import { ZBClient, ZBClientOptions, ZeebeJob } from "zeebe-node";
import { SlackSender } from "./slack-sender";

export interface SlackTaskHeaders {
  "slack:message"?: string;
  "slack:template"?: string;
  "slack:profile": string;
  "slack:channel"?: string;
  "slack:icon_emoji"?: string;
}

export interface SlackProfile {
  webhook: string;
  defaultChannel: string;
  icon_emoji?: string;
  templates?: {
    [templateName: string]: string;
  };
}

export interface SlackProfileList {
  [profileName: string]: SlackProfile;
}

export class SlackWorker {
  zbc: ZBClient;
  constructor({
    ZBConfig,
    SlackProfiles,
    Logger = console
  }: {
    ZBConfig?: ZBClientOptions;
    SlackProfiles: SlackProfileList | SlackProfile;
    Logger: any;
  }) {
    this.zbc = new ZBClient(ZBConfig);

    const slackSender = new SlackSender(SlackProfiles, Logger);
    this.zbc.createWorker({
      taskHandler: (job: ZeebeJob<any, SlackTaskHeaders>) =>
        slackSender.sendSlackMessage(job),
      taskType: "slack:message",
    });
  }

  close() {
    this.zbc.close();
  }
}
