"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackSender = void 0;
const axios_1 = __importDefault(require("axios"));
const micromustache = __importStar(require("micromustache"));
const isSlackProfileList = (slackProfiles) => slackProfiles.defaultChannel === undefined || slackProfiles.webhook === undefined;
class SlackSender {
    constructor(slackProfiles, logger = console) {
        this.logger = logger;
        this.slackProfiles = isSlackProfileList(slackProfiles)
            ? slackProfiles
            : {
                default: slackProfiles
            };
    }
    sendSlackMessage(job) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { variables, customHeaders } = job;
            const getConfig = (key) => variables[key] || customHeaders[key];
            const profileRequested = getConfig("slack:profile") || "default";
            const profile = this.slackProfiles[profileRequested];
            if (!profile) {
                return job.fail(`Slack config ${profile} not found`);
            }
            const messageTemplate = getConfig("slack:message") ||
                ((_a = profile === null || profile === void 0 ? void 0 : profile.templates) === null || _a === void 0 ? void 0 : _a[getConfig("slack:template")]);
            if (!messageTemplate) {
                return job.complete();
            }
            let channel = getConfig("slack:channel") || profile.defaultChannel || "#general";
            if (channel.indexOf("#") !== 0) {
                channel = `#${channel}`;
            }
            const iconEmoji = getConfig("slack:icon_emoji") || profile.icon_emoji || ":ghost:";
            const webhook = profile.webhook;
            const text = micromustache.render(messageTemplate, variables);
            this.logger.info(`Sending "${text}" to ${channel}`, "Slack Worker");
            return axios_1.default.post(webhook, {
                channel,
                text,
                icon_emoji: iconEmoji
            })
                .then(res => 
            // Remove the message and template vars to prevent them overriding headers in future tasks
            job.complete({
                "slack:message": undefined,
                "slack:template": undefined
            }))
                .catch(e => {
                this.logError(e);
                return job.fail(e.toString());
            });
        });
    }
    logError(e) {
        this.logger.error(e.message, "Slack Worker");
    }
}
exports.SlackSender = SlackSender;
