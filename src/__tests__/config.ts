import { SlackProfileList, SlackProfile } from "../";

export const singleSlackProfile: SlackProfile = {
  defaultChannel: "#general",
  icon_emoji: ":ghost:",
  webhook: "http://localhost:3001"
};

export const slackProfiles: SlackProfileList = {
  default: {
    defaultChannel: "#general",
    icon_emoji: ":ghost:",
    webhook: "http://localhost:3001"
  },
  ops: {
    defaultChannel: "#ops",
    icon_emoji: ":ghost:",
    webhook: "http://localhost:3001"
  }
};
