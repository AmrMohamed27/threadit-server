"use strict";
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
exports.ChatService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
class ChatService {
    constructor(repository, userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }
    chatsFetcher(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filters }) {
            const result = yield this.repository.getAllChatsWithFilters({
                filters,
            });
            if (!result || result.length === 0) {
                return {
                    errors: [{ field: "chats", message: "no chats found" }],
                };
            }
            const resultCount = yield this.repository.countAllChatsWithFilters({
                filters,
            });
            return {
                chatsArray: result,
                count: resultCount[0].count,
            };
        });
    }
    singleChatFetcher(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filters, }) {
            const result = yield this.repository.getAllChatsWithFilters({
                filters,
            });
            if (!result || result.length === 0) {
                return {
                    errors: [{ field: "chats", message: "no chats found" }],
                };
            }
            return {
                chat: result[0],
            };
        });
    }
    fetchUserChats(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            var _b;
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to get user chats",
                        },
                    ],
                };
            }
            try {
                const chatIds = yield this.repository.getChatIdsFromParticipant({
                    userId,
                });
                if (chatIds.length === 0) {
                    return {
                        chatsArray: [],
                        count: 0,
                        errors: [
                            {
                                field: "root",
                                message: "No chats found for user.",
                            },
                        ],
                    };
                }
                const filters = [];
                chatIds.forEach(({ chatId }) => filters.push((0, drizzle_orm_1.eq)(schema_1.chats.id, chatId)));
                const orFilter = [(0, drizzle_orm_1.or)(...filters)];
                return yield this.chatsFetcher({ filters: orFilter });
            }
            catch (error) {
                console.error(error);
                return {
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during getting user chats",
                        },
                    ],
                };
            }
        });
    }
    fetchChatById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ chatId }) {
            var _b;
            try {
                const filters = [(0, drizzle_orm_1.eq)(schema_1.chats.id, chatId)];
                return yield this.singleChatFetcher({ filters });
            }
            catch (error) {
                console.error(error);
                return {
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during getting chat by id",
                        },
                    ],
                };
            }
        });
    }
    fetchChatParticipants(_a) {
        return __awaiter(this, arguments, void 0, function* ({ chatId, }) {
            var _b;
            try {
                const result = yield this.repository.getChatParticipants({ chatId });
                const users = yield Promise.all(result.map((_a) => __awaiter(this, [_a], void 0, function* ({ userId }) {
                    const result = yield this.userRepository.getUserById({ userId });
                    return result[0];
                })));
                if (users.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "No users found for specified chat",
                            },
                        ],
                    };
                }
                return {
                    userArray: users,
                    count: users.length,
                };
            }
            catch (error) {
                console.error(error);
                return {
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during getting chat participants",
                        },
                    ],
                };
            }
        });
    }
    createGroupChat(_a) {
        return __awaiter(this, arguments, void 0, function* ({ creatorId, name, image, participantIds, }) {
            var _b;
            if (!creatorId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to create a chat",
                        },
                    ],
                };
            }
            try {
                const isGroupChat = participantIds.length > 1;
                const result = yield this.repository.createChat({
                    creatorId,
                    name,
                    image,
                    isGroupChat,
                });
                if (!result || result.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "Error creating chat",
                            },
                        ],
                    };
                }
                const createdChat = result[0];
                participantIds.forEach((id) => __awaiter(this, void 0, void 0, function* () {
                    yield this.repository.addChatParticipant({
                        userId: id,
                        chatId: createdChat.id,
                    });
                }));
                return yield this.singleChatFetcher({
                    filters: [(0, drizzle_orm_1.eq)(schema_1.chats.id, createdChat.id)],
                });
            }
            catch (error) {
                console.error(error);
                return {
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during chat creation",
                        },
                    ],
                };
            }
        });
    }
    createConversation(_a) {
        return __awaiter(this, arguments, void 0, function* ({ creatorId, name, image, participantIds, }) {
            var _b;
            if (!creatorId || !participantIds) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to create a chat",
                        },
                    ],
                };
            }
            const participantIdsFiltered = participantIds.filter((id) => id !== creatorId);
            const chateeId = participantIdsFiltered[0];
            const filters = [
                (0, drizzle_orm_1.eq)(schema_1.chats.isGroupChat, false),
                (0, drizzle_orm_1.or)((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.chats.creatorId, creatorId), (0, drizzle_orm_1.eq)(schema_1.chatParticipants.chatId, schema_1.chats.id), (0, drizzle_orm_1.eq)(schema_1.chatParticipants.userId, chateeId)), (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.chats.creatorId, chateeId), (0, drizzle_orm_1.eq)(schema_1.chatParticipants.chatId, schema_1.chats.id), (0, drizzle_orm_1.eq)(schema_1.chatParticipants.userId, creatorId))),
            ];
            const chatExists = yield this.repository.getAllChatsWithFilters({
                filters,
            });
            if (chatExists.length > 0) {
                return {
                    chat: chatExists[0],
                    errors: [
                        {
                            field: "chat_exists",
                            message: "You already have a chat with this user",
                        },
                    ],
                };
            }
            try {
                const isGroupChat = false;
                const result = yield this.repository.createChat({
                    creatorId,
                    name,
                    image,
                    isGroupChat,
                });
                if (!result || result.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "Error creating chat",
                            },
                        ],
                    };
                }
                const createdChat = result[0];
                yield this.repository.addChatParticipant({
                    userId: creatorId,
                    chatId: createdChat.id,
                });
                yield this.repository.addChatParticipant({
                    userId: chateeId,
                    chatId: createdChat.id,
                });
                return yield this.singleChatFetcher({
                    filters: [(0, drizzle_orm_1.eq)(schema_1.chats.id, createdChat.id)],
                });
            }
            catch (error) {
                console.error(error);
                return {
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during chat creation",
                        },
                    ],
                };
            }
        });
    }
    updateChat(_a) {
        return __awaiter(this, arguments, void 0, function* ({ creatorId, chatId, name, image, }) {
            var _b;
            if (!creatorId) {
                return {
                    errors: [
                        {
                            field: "creatorId",
                            message: "You must be logged in to update a chat",
                        },
                    ],
                };
            }
            try {
                const result = yield this.repository.updateChat({
                    creatorId,
                    chatId,
                    name,
                    image,
                });
                if (!result || result.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "Error updating chat, make sure you are updating a chat you created and the chat exists.",
                            },
                        ],
                    };
                }
                return {
                    chat: result[0],
                };
            }
            catch (error) {
                console.error(error);
                return {
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during updating chat",
                        },
                    ],
                };
            }
        });
    }
    deleteChat(_a) {
        return __awaiter(this, arguments, void 0, function* ({ creatorId, chatId, }) {
            var _b;
            const operation = { delete: true };
            if (!creatorId) {
                return {
                    operation,
                    chatId,
                    errors: [
                        {
                            field: "creatorId",
                            message: "You must be logged in to delete a chat",
                        },
                    ],
                };
            }
            try {
                const participants = yield this.repository.getChatParticipants({
                    chatId,
                });
                const participantIds = participants.map((p) => p.userId);
                yield this.repository.deleteChat({
                    chatId,
                    creatorId,
                });
                return {
                    operation,
                    chatId,
                    participantIds,
                };
            }
            catch (error) {
                console.error(error);
                return {
                    operation,
                    chatId,
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during deletion",
                        },
                    ],
                };
            }
        });
    }
    addChatParticipant(_a) {
        return __awaiter(this, arguments, void 0, function* ({ chatId, participantId, }) {
            var _b;
            const operation = { addParticipant: true };
            try {
                const result = yield this.repository.addChatParticipant({
                    userId: participantId,
                    chatId,
                });
                if (!result || result.length === 0) {
                    return {
                        operation,
                        chatId,
                        errors: [
                            {
                                field: "root",
                                message: "Error adding participant to chat",
                            },
                        ],
                    };
                }
                const participants = yield this.repository.getChatParticipants({
                    chatId,
                });
                const participantIds = participants.map((p) => p.userId);
                return {
                    operation,
                    chatId,
                    participantIds,
                };
            }
            catch (error) {
                console.error(error);
                return {
                    operation,
                    chatId,
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during adding participant to chat",
                        },
                    ],
                };
            }
        });
    }
    removeChatParticipant(_a) {
        return __awaiter(this, arguments, void 0, function* ({ chatId, participantId, }) {
            var _b;
            const operation = { removeParticipant: true };
            try {
                const participants = yield this.repository.getChatParticipants({
                    chatId,
                });
                const participantIds = participants.map((p) => p.userId);
                const result = yield this.repository.removeChatParticipant({
                    userId: participantId,
                    chatId,
                });
                if (!result) {
                    return {
                        operation,
                        chatId,
                        errors: [
                            {
                                field: "root",
                                message: "Error removing participant from chat",
                            },
                        ],
                    };
                }
                return {
                    operation,
                    chatId,
                    participantIds,
                };
            }
            catch (error) {
                console.error(error);
                return {
                    operation,
                    chatId,
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during removing participant from chat",
                        },
                    ],
                };
            }
        });
    }
    checkChatParticipant(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, chatId, }) {
            var _b;
            if (!userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to check if a user is a participant in a chat",
                        },
                    ],
                };
            }
            try {
                const result = yield this.repository.checkChatParticipant({
                    userId,
                    chatId,
                });
                if (!result || result.length === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "User is not a participant in chat",
                            },
                        ],
                    };
                }
                return {
                    success: true,
                };
            }
            catch (error) {
                console.error(error);
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during checking if user is a participant in chat",
                        },
                    ],
                };
            }
        });
    }
}
exports.ChatService = ChatService;
//# sourceMappingURL=ChatService.js.map