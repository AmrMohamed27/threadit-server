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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.MessageResolver = void 0;
const type_graphql_1 = require("type-graphql");
const pubsub_1 = require("../../redis/pubsub");
const inputs_1 = require("../../types/inputs");
const resolvers_1 = require("../../types/resolvers");
let MessageResolver = class MessageResolver {
    createMessage(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chatId, content, media } = options;
            const senderId = ctx.userId;
            const result = yield ctx.Services.messages.createMessage({
                senderId,
                chatId,
                content,
                media,
            });
            yield ctx.pubSub.publish(pubsub_1.SubscriptionTopics.NEW_MESSAGE, result);
            yield ctx.pubSub.publish(pubsub_1.SubscriptionTopics.DIRECT_MESSAGE_NOTIFICATION, result);
            return result;
        });
    }
    updateMessage(options, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { content, messageId } = options;
            const senderId = ctx.userId;
            const result = yield ctx.Services.messages.updateMessage({
                messageId,
                content,
                senderId,
            });
            yield ctx.pubSub.publish(pubsub_1.SubscriptionTopics.MESSAGE_UPDATED, result);
            return result;
        });
    }
    deleteMessage(messageId, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const senderId = ctx.userId;
            const result = yield ctx.Services.messages.deleteMessage({
                messageId,
                senderId,
            });
            if (result.success) {
                yield ctx.pubSub.publish(pubsub_1.SubscriptionTopics.MESSAGE_DELETED, result);
            }
            return result;
        });
    }
    newMessage(response, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.userId;
            if (userId && response.message) {
                if (response.message.senderId === userId) {
                    return response;
                }
                const chatId = response.message.chatId;
                const result = yield ctx.Services.chats.checkChatParticipant({
                    userId,
                    chatId,
                });
                if (result.success) {
                    return response;
                }
                return null;
            }
            return response;
        });
    }
};
exports.MessageResolver = MessageResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => inputs_1.MessageResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.CreateMessageInput]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "createMessage", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputs_1.UpdateMessageInput, Object]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "updateMessage", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Arg)("messageId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "deleteMessage", null);
__decorate([
    (0, type_graphql_1.Subscription)(() => inputs_1.MessageResponse, {
        subscribe: () => pubsub_1.redisRealPubSub.asyncIterator([pubsub_1.SubscriptionTopics.NEW_MESSAGE]),
    }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputs_1.MessageResponse, Object]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "newMessage", null);
exports.MessageResolver = MessageResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], MessageResolver);
//# sourceMappingURL=MessageResolver.js.map