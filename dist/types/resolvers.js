"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationResponse = exports.NotificationEnum = exports.VoteOptionsEnum = exports.ChatConfirmResponse = exports.ChatOperation = exports.ConfirmResponse = exports.FieldError = void 0;
const type_graphql_1 = require("type-graphql");
let FieldError = class FieldError {
};
exports.FieldError = FieldError;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
exports.FieldError = FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let ConfirmResponse = class ConfirmResponse {
};
exports.ConfirmResponse = ConfirmResponse;
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], ConfirmResponse.prototype, "success", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], ConfirmResponse.prototype, "errors", void 0);
exports.ConfirmResponse = ConfirmResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], ConfirmResponse);
let ChatOperation = class ChatOperation {
};
exports.ChatOperation = ChatOperation;
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], ChatOperation.prototype, "delete", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], ChatOperation.prototype, "addParticipant", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], ChatOperation.prototype, "removeParticipant", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], ChatOperation.prototype, "update", void 0);
exports.ChatOperation = ChatOperation = __decorate([
    (0, type_graphql_1.ObjectType)()
], ChatOperation);
let ChatConfirmResponse = class ChatConfirmResponse {
};
exports.ChatConfirmResponse = ChatConfirmResponse;
__decorate([
    (0, type_graphql_1.Field)(() => ChatOperation),
    __metadata("design:type", ChatOperation)
], ChatConfirmResponse.prototype, "operation", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], ChatConfirmResponse.prototype, "chatId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [type_graphql_1.Int], { nullable: true }),
    __metadata("design:type", Array)
], ChatConfirmResponse.prototype, "participantIds", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], ChatConfirmResponse.prototype, "errors", void 0);
exports.ChatConfirmResponse = ChatConfirmResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], ChatConfirmResponse);
var VoteOptionsEnum;
(function (VoteOptionsEnum) {
    VoteOptionsEnum["Upvote"] = "upvote";
    VoteOptionsEnum["Downvote"] = "downvote";
    VoteOptionsEnum["None"] = "none";
})(VoteOptionsEnum || (exports.VoteOptionsEnum = VoteOptionsEnum = {}));
(0, type_graphql_1.registerEnumType)(VoteOptionsEnum, {
    name: "VoteOptions",
    description: "Represents the user's vote status on a post",
});
var NotificationEnum;
(function (NotificationEnum) {
    NotificationEnum["NEW_REPLY"] = "NEW_REPLY";
    NotificationEnum["POST_ACTIVITY"] = "POST_ACTIVITY";
    NotificationEnum["DIRECT_MESSAGE"] = "DIRECT_MESSAGE";
})(NotificationEnum || (exports.NotificationEnum = NotificationEnum = {}));
(0, type_graphql_1.registerEnumType)(NotificationEnum, {
    name: "Notifications",
    description: "Represents the different types of notifications.",
});
let NotificationResponse = class NotificationResponse {
};
exports.NotificationResponse = NotificationResponse;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], NotificationResponse.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => NotificationEnum),
    __metadata("design:type", String)
], NotificationResponse.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], NotificationResponse.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], NotificationResponse.prototype, "senderId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], NotificationResponse.prototype, "senderName", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], NotificationResponse.prototype, "content", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], NotificationResponse.prototype, "entityId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], NotificationResponse.prototype, "entityType", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], NotificationResponse.prototype, "isRead", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], NotificationResponse.prototype, "createdAt", void 0);
exports.NotificationResponse = NotificationResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], NotificationResponse);
//# sourceMappingURL=resolvers.js.map