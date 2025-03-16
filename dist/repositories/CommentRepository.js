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
exports.CommentRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../database/db");
const schema_1 = require("../database/schema");
const utils_1 = require("../lib/utils");
class CommentRepository {
    static buildBaseQuery({ userId }) {
        return db_1.db
            .select((0, utils_1.commentSelection)({ userId }))
            .from(schema_1.comments)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.comments.authorId, schema_1.users.id))
            .leftJoin(schema_1.votes, (0, drizzle_orm_1.eq)(schema_1.comments.id, schema_1.votes.commentId))
            .groupBy(schema_1.comments.id, schema_1.users.id)
            .$dynamic();
    }
    static withPagination(_a) {
        return __awaiter(this, arguments, void 0, function* ({ qb, page, limit, sortBy, }) {
            return yield qb
                .limit(limit)
                .offset((page - 1) * limit)
                .orderBy((0, utils_1.commentsSorter)(sortBy));
        });
    }
    static getAllCommentsWithFilters(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, limit, page, filters, isSingle, }) {
            let qb = this.buildBaseQuery({ userId });
            qb = qb.where((0, drizzle_orm_1.and)(...filters));
            if (isSingle) {
                return yield qb.execute();
            }
            return yield this.withPagination({
                qb,
                limit,
                page,
                sortBy: sortBy !== null && sortBy !== void 0 ? sortBy : "Best",
            });
        });
    }
    static countAllCommentsWithFilters(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filters }) {
            return yield db_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.comments)
                .where((0, drizzle_orm_1.and)(...filters));
        });
    }
    static withCommentJoins(_a) {
        return __awaiter(this, arguments, void 0, function* ({ qb }) {
            return yield qb
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.comments.authorId, schema_1.users.id))
                .leftJoin(schema_1.votes, (0, drizzle_orm_1.eq)(schema_1.comments.id, schema_1.votes.commentId))
                .groupBy(schema_1.comments.id, schema_1.users.id);
        });
    }
    static getSingleComment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, commentId, filters, }) {
            const qb = db_1.db
                .select((0, utils_1.commentSelection)({ userId }))
                .from(schema_1.comments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.comments.id, commentId), (0, drizzle_orm_1.and)(...filters)))
                .$dynamic();
            return yield this.withCommentJoins({ qb });
        });
    }
    static insertComment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ content, authorId, postId, parentCommentId, }) {
            return yield db_1.db
                .insert(schema_1.comments)
                .values({ content, authorId, postId, parentCommentId })
                .returning();
        });
    }
    static updateComment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ content, commentId, authorId, }) {
            return yield db_1.db
                .update(schema_1.comments)
                .set({
                content,
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.comments.id, commentId), (0, drizzle_orm_1.eq)(schema_1.comments.authorId, authorId)));
        });
    }
    static deleteComment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ commentId, authorId, }) {
            return yield db_1.db
                .delete(schema_1.comments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.comments.id, commentId), (0, drizzle_orm_1.eq)(schema_1.comments.authorId, authorId)));
        });
    }
}
exports.CommentRepository = CommentRepository;
//# sourceMappingURL=CommentRepository.js.map