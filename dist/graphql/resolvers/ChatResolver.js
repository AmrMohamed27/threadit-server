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
exports.ChatResolver = void 0;
const type_graphql_1 = require("type-graphql");
const pubsub_1 = require("../../redis/pubsub");
const inputs_1 = require("../../types/inputs");
const resolvers_1 = require("../../types/resolvers");
let ChatResolver = class ChatResolver {
    getUserChats(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.userId;
            return yield ctx.Services.chats.fetchUserChats({ userId });
        });
    }
    getChatParticipants(chatId, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ctx.Services.chats.fetchChatParticipants({ chatId });
        });
    }
    getChatById(chatId, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ctx.Services.chats.fetchChatById({ chatId });
        });
    }
    checkChatParticipant(chatId, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.userId;
            return yield ctx.Services.chats.checkChatParticipant({
                userId,
                chatId,
            });
        });
    }
    getChatMessages(chatId, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ctx.Services.messages.fetchChatMessages({ chatId });
        });
    }
    createChat(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, image, isGroupChat, participantIds } = options;
            const creatorId = ctx.userId;
            let result;
            if (isGroupChat === true) {
                result = yield ctx.Services.chats.createGroupChat({
                    creatorId,
                    name,
                    image,
                    participantIds,
                });
            }
            else {
                result = yield ctx.Services.chats.createConversation({
                    name,
                    creatorId,
                    image,
                    participantIds,
                });
            }
            if (result.chat) {
                const { chat: joinedChat } = yield ctx.Services.chats.fetchChatById({
                    chatId: result.chat.id,
                });
                yield ctx.pubSub.publish(pubsub_1.SubscriptionTopics.NEW_CHAT, {
                    chat: joinedChat,
                    errors: result.errors,
                });
            }
            return result;
        });
    }
    updateChat(options, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chatId, image, name } = options;
            const creatorId = ctx.userId;
            const result = yield ctx.Services.chats.updateChat({
                chatId,
                name,
                image,
                creatorId,
            });
            yield ctx.pubSub.publish(pubsub_1.SubscriptionTopics.CHAT_UPDATED, result);
            return result;
        });
    }
    deleteChat(chatId, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const creatorId = ctx.userId;
            const result = yield ctx.Services.chats.deleteChat({
                chatId,
                creatorId,
            });
            if (!result.errors) {
                yield ctx.pubSub.publish(pubsub_1.SubscriptionTopics.CHAT_DELETED, result);
            }
            return result;
        });
    }
    addChatParticipant(options, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chatId, participantId } = options;
            const result = yield ctx.Services.chats.addChatParticipant({
                chatId,
                participantId,
            });
            if (!result.errors) {
                yield ctx.pubSub.publish(pubsub_1.SubscriptionTopics.CHAT_PARTICIPANT_ADDED, result);
            }
            return result;
        });
    }
    removeChatParticipant(options, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chatId, participantId } = options;
            const result = yield ctx.Services.chats.removeChatParticipant({
                chatId,
                participantId,
            });
            if (!result.errors) {
                yield ctx.pubSub.publish(pubsub_1.SubscriptionTopics.CHAT_PARTICIPANT_REMOVED, result);
            }
            return result;
        });
    }
    newChat(response, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.userId;
            if (userId && response.chat) {
                if (response.chat.creatorId === userId) {
                    return response;
                }
                const result = yield ctx.Services.chats.checkChatParticipant({
                    userId,
                    chatId: response.chat.id,
                });
                if (result.success) {
                    return response;
                }
                return null;
            }
            return response;
        });
    }
    chatUpdates(response, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.userId;
            const { operation, participantIds, errors } = response;
            if (userId && operation && participantIds && !errors) {
                return response;
            }
            else {
                return null;
            }
        });
    }
};
exports.ChatResolver = ChatResolver;
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.ChatResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "getUserChats", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.UserResponse),
    __param(0, (0, type_graphql_1.Arg)("chatId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "getChatParticipants", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.ChatResponse),
    __param(0, (0, type_graphql_1.Arg)("chatId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "getChatById", null);
__decorate([
    (0, type_graphql_1.Query)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Arg)("chatId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "checkChatParticipant", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.MessageResponse),
    __param(0, (0, type_graphql_1.Arg)("chatId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "getChatMessages", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => inputs_1.ChatResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.CreateChatInput]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "createChat", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => inputs_1.ChatResponse),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputs_1.UpdateChatInput, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "updateChat", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ChatConfirmResponse),
    __param(0, (0, type_graphql_1.Arg)("chatId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "deleteChat", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ChatConfirmResponse),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputs_1.AddChatParticipantInput, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "addChatParticipant", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ChatConfirmResponse),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputs_1.AddChatParticipantInput, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "removeChatParticipant", null);
__decorate([
    (0, type_graphql_1.Subscription)(() => inputs_1.ChatResponse, {
        subscribe: () => pubsub_1.redisRealPubSub.asyncIterator([pubsub_1.SubscriptionTopics.NEW_CHAT]),
    }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputs_1.ChatResponse, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "newChat", null);
__decorate([
    (0, type_graphql_1.Subscription)(() => resolvers_1.ChatConfirmResponse, {
        subscribe: () => pubsub_1.redisRealPubSub.asyncIterator([
            pubsub_1.SubscriptionTopics.CHAT_UPDATED,
            pubsub_1.SubscriptionTopics.CHAT_DELETED,
            pubsub_1.SubscriptionTopics.CHAT_PARTICIPANT_ADDED,
            pubsub_1.SubscriptionTopics.CHAT_PARTICIPANT_REMOVED,
        ]),
    }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resolvers_1.ChatConfirmResponse, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "chatUpdates", null);
exports.ChatResolver = ChatResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], ChatResolver);
//# sourceMappingURL=ChatResolver.js.map