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
exports.MessageService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
class MessageService {
    constructor(repository) {
        this.repository = repository;
    }
    messagesFetcher(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filters, }) {
            const result = yield this.repository.getAllMessagesWithFilters({
                filters,
            });
            if (!result || result.length === 0) {
                return {
                    errors: [{ field: "messages", message: "no messages found" }],
                };
            }
            const resultCount = yield this.repository.countAllMessagesWithFilters({
                filters,
            });
            return {
                messagesArray: result,
                count: resultCount[0].count,
            };
        });
    }
    singleMessageFetcher(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filters, }) {
            const result = yield this.repository.getAllMessagesWithFilters({
                filters,
            });
            if (!result || result.length === 0) {
                return {
                    errors: [{ field: "messages", message: "no messages found" }],
                };
            }
            return {
                message: result[0],
            };
        });
    }
    createMessage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ senderId, chatId, content, media, }) {
            var _b;
            if (!senderId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to create a message",
                        },
                    ],
                };
            }
            if (!chatId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "You must provide a chatId to create a message",
                        },
                    ],
                };
            }
            try {
                const result = yield this.repository.insertMessage({
                    senderId,
                    chatId,
                    content,
                    media,
                });
                if (!result || result.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "Error creating message",
                            },
                        ],
                    };
                }
                return yield this.singleMessageFetcher({
                    filters: [(0, drizzle_orm_1.eq)(schema_1.messages.id, result[0].id)],
                });
            }
            catch (error) {
                console.error(error);
                return {
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during creation",
                        },
                    ],
                };
            }
        });
    }
    updateMessage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ senderId, messageId, content, }) {
            var _b;
            if (!senderId) {
                return {
                    errors: [
                        {
                            field: "senderId",
                            message: "You must be logged in to update a message",
                        },
                    ],
                };
            }
            try {
                const result = yield this.repository.updateMessage({
                    content,
                    messageId,
                    senderId,
                });
                if (!result || result.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "Error updating message, make sure you are updating a message you sent and the message exists.",
                            },
                        ],
                    };
                }
                return this.singleMessageFetcher({
                    filters: [(0, drizzle_orm_1.eq)(schema_1.messages.id, messageId)],
                });
            }
            catch (error) {
                console.error(error);
                return {
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during update",
                        },
                    ],
                };
            }
        });
    }
    deleteMessage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ senderId, messageId, }) {
            var _b;
            if (!senderId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "senderId",
                            message: "You must be logged in to delete a message",
                        },
                    ],
                };
            }
            try {
                const result = yield this.repository.deleteMessage({
                    messageId,
                    senderId,
                });
                if (!result) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "Error deleting message, make sure you are deleting a message you sent and the message exists.",
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
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during deletion",
                        },
                    ],
                };
            }
        });
    }
    fetchChatMessages(_a) {
        return __awaiter(this, arguments, void 0, function* ({ chatId, }) {
            var _b;
            try {
                const filters = [(0, drizzle_orm_1.eq)(schema_1.messages.chatId, chatId)];
                return yield this.messagesFetcher({ filters });
            }
            catch (error) {
                console.error(error);
                return {
                    errors: [
                        {
                            field: "root",
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during getting chat messages",
                        },
                    ],
                };
            }
        });
    }
}
exports.MessageService = MessageService;
//# sourceMappingURL=MessageService.js.map