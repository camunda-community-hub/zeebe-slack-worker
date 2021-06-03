import { singleSlackProfile, slackProfiles } from "./config";

import * as http from "./http";
import { SlackSender } from "../slack-sender";
import { Server } from "http";

describe("SlackSender", () => {
  let server: Server;
  beforeAll(() => {
    server = http.server();
  });
  afterAll(done => {
    server.close(() => done());
  });
  describe("with a single profile", () => {
    const sender = new SlackSender(singleSlackProfile);
    it("Sends a message");
  });
});
