import { Job, CompleteFn } from "zeebe-node";
import Axios from "axios";
import * as micromustache from "micromustache";
import { SlackProfileList, SlackTaskHeaders, SlackProfile } from ".";

const isSlackProfileList = (
  slackProfiles: SlackProfile | SlackProfileList
): slackProfiles is SlackProfileList => slackProfiles.webhook != undefined;

export class SlackSender {
  logger: any;
  slackProfiles: any;
  constructor(
    slackProfiles: SlackProfileList | SlackProfile,
    logger = console
  ) {
    this.logger = logger;
    this.slackProfiles = isSlackProfileList(slackProfiles)
      ? slackProfiles
      : {
          default: slackProfiles
        };
  }

  async sendSlackMessage(
    job: Job<any, SlackTaskHeaders>,
    complete: CompleteFn<any>
  ) {
    const { variables, customHeaders } = job;

    const getConfig = (key: keyof SlackTaskHeaders) =>
      variables[key] || customHeaders[key];

    const profileRequested = getConfig("slack:profile") || "default";
    const profile: SlackProfile = this.slackProfiles[profileRequested];
    if (!profile) {
      return complete.failure(`Slack config ${profile} not found`);
    }

    const messageTemplate =
      getConfig("slack:message") ||
      profile?.templates?.[getConfig("slack:template")];

    if (!messageTemplate) {
      return complete.success();
    }

    let channel =
      getConfig("slack:channel") || profile.defaultChannel || "#general";
    if (channel.indexOf("#") !== 0) {
      channel = `#${channel}`;
    }

    const iconEmoji =
      getConfig("slack:icon_emoji") || profile.icon_emoji || ":ghost:";
    const webhook = profile.webhook;
    const text = micromustache.render(messageTemplate, variables);

    this.logger.info(`Sending "${text}" to ${channel}`, "Slack Worker");
    Axios.post(webhook, {
      channel,
      text,
      icon_emoji: iconEmoji
    })
      .then(res => {
        // Remove the message and template vars to prevent them overriding headers in future tasks
        complete.success({
          "slack:message": undefined,
          "slack:template": undefined
        });
        return res;
      })
      .catch(e => this.logError(e));
  }

  private logError(e: any) {
    this.logger.error(e.message, "Slack Worker");
  }
}
