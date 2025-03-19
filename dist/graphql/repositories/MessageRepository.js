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
exports.MessageRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const utils_1 = require("../../lib/utils");
class MessageRepository {
    static buildBaseQuery() {
        return db_1.db
            .select((0, utils_1.messageSelection)())
            .from(schema_1.messages)
            .innerJoin(utils_1.sender, (0, drizzle_orm_1.eq)(schema_1.messages.senderId, utils_1.sender.id))
            .groupBy(schema_1.messages.id, utils_1.sender.id)
            .orderBy((0, drizzle_orm_1.asc)(schema_1.messages.createdAt))
            .$dynamic();
    }
    static getAllMessagesWithFilters(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filters }) {
            let qb = this.buildBaseQuery();
            return yield qb.where((0, drizzle_orm_1.and)(...filters));
        });
    }
    static countAllMessagesWithFilters(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filters }) {
            return yield db_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.messages)
                .where((0, drizzle_orm_1.and)(...filters));
        });
    }
    static insertMessage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ senderId, chatId, content, media, }) {
            return yield db_1.db
                .insert(schema_1.messages)
                .values({ senderId, chatId, content, media })
                .returning({ id: schema_1.messages.id });
        });
    }
    static updateMessage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ content, messageId, senderId, }) {
            return yield db_1.db
                .update(schema_1.messages)
                .set({
                content,
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.messages.id, messageId), (0, drizzle_orm_1.eq)(schema_1.messages.senderId, senderId)))
                .returning();
        });
    }
    static deleteMessage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ messageId, senderId, }) {
            return yield db_1.db
                .delete(schema_1.messages)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.messages.id, messageId), (0, drizzle_orm_1.eq)(schema_1.messages.senderId, senderId)));
        });
    }
}
exports.MessageRepository = MessageRepository;
//# sourceMappingURL=MessageRepository.js.map