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
exports.ChatRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const utils_1 = require("../../lib/utils");
class ChatRepository {
    static getAllChatsWithFilters(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filters }) {
            const whereCondition = filters.length > 1 ? (0, drizzle_orm_1.and)(...filters) : filters[0];
            return yield db_1.db
                .select((0, utils_1.chatSelection)())
                .from(schema_1.chats)
                .where(whereCondition)
                .innerJoin(schema_1.chatParticipants, (0, drizzle_orm_1.eq)(schema_1.chats.id, schema_1.chatParticipants.chatId))
                .innerJoin(utils_1.chatCreator, (0, drizzle_orm_1.eq)(schema_1.chats.creatorId, utils_1.chatCreator.id))
                .groupBy(schema_1.chats.id, schema_1.chatParticipants.chatId, schema_1.chatParticipants.lastReadMessageId, utils_1.chatCreator.id)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.chats.updatedAt));
        });
    }
    static getChatIdsFromParticipant(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            return yield db_1.db
                .select({ chatId: schema_1.chatParticipants.chatId })
                .from(schema_1.chatParticipants)
                .where((0, drizzle_orm_1.eq)(schema_1.chatParticipants.userId, userId));
        });
    }
    static countAllChatsWithFilters(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filters }) {
            return yield db_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.chats)
                .where((0, drizzle_orm_1.and)(...filters));
        });
    }
    static createChat(_a) {
        return __awaiter(this, arguments, void 0, function* ({ creatorId, isGroupChat, name, image, }) {
            return yield db_1.db
                .insert(schema_1.chats)
                .values({ creatorId, name, image, isGroupChat })
                .returning({ id: schema_1.chats.id });
        });
    }
    static addChatParticipant(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, chatId, }) {
            return yield db_1.db
                .insert(schema_1.chatParticipants)
                .values({ userId, chatId })
                .returning();
        });
    }
    static removeChatParticipant(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, chatId, }) {
            return yield db_1.db
                .delete(schema_1.chatParticipants)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.chatParticipants.userId, userId), (0, drizzle_orm_1.eq)(schema_1.chatParticipants.chatId, chatId)));
        });
    }
    static getChatById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ chatId }) {
            return yield db_1.db.query.chats.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.chats.id, chatId),
                with: {
                    creator: true,
                },
            });
        });
    }
    static getChatParticipants(_a) {
        return __awaiter(this, arguments, void 0, function* ({ chatId }) {
            return yield db_1.db
                .select()
                .from(schema_1.chatParticipants)
                .where((0, drizzle_orm_1.eq)(schema_1.chatParticipants.chatId, chatId));
        });
    }
    static checkChatParticipant(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, chatId, }) {
            return yield db_1.db
                .select()
                .from(schema_1.chatParticipants)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.chatParticipants.chatId, chatId), (0, drizzle_orm_1.eq)(schema_1.chatParticipants.userId, userId)));
        });
    }
    static updateChat(_a) {
        return __awaiter(this, arguments, void 0, function* ({ creatorId, chatId, name, image, }) {
            return yield db_1.db
                .update(schema_1.chats)
                .set({
                name: name ? name : schema_1.chats.name,
                image: image ? image : schema_1.chats.image,
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.chats.id, chatId), (0, drizzle_orm_1.eq)(schema_1.chats.creatorId, creatorId)))
                .returning();
        });
    }
    static deleteChat(_a) {
        return __awaiter(this, arguments, void 0, function* ({ chatId, creatorId, }) {
            return yield db_1.db
                .delete(schema_1.chats)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.chats.id, chatId), (0, drizzle_orm_1.eq)(schema_1.chats.creatorId, creatorId)));
        });
    }
}
exports.ChatRepository = ChatRepository;
//# sourceMappingURL=ChatRepository.js.map