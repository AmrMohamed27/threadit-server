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
exports.VoteRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
class VoteRepository {
    static getIfUserVotedOnPost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, authorId, }) {
            return yield db_1.db
                .select()
                .from(schema_1.votes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.userId, authorId), (0, drizzle_orm_1.eq)(schema_1.votes.postId, postId)));
        });
    }
    static getIfUserVotedOnComment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ commentId, authorId, }) {
            return yield db_1.db
                .select()
                .from(schema_1.votes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.userId, authorId), (0, drizzle_orm_1.eq)(schema_1.votes.commentId, commentId)));
        });
    }
    static getVoteById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ voteId }) {
            return yield db_1.db.select().from(schema_1.votes).where((0, drizzle_orm_1.eq)(schema_1.votes.id, voteId));
        });
    }
    static deleteVote(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, commentId, authorId, }) {
            return yield db_1.db
                .delete(schema_1.votes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.userId, authorId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.votes.postId, postId !== null && postId !== void 0 ? postId : 0), (0, drizzle_orm_1.eq)(schema_1.votes.commentId, commentId !== null && commentId !== void 0 ? commentId : 0))));
        });
    }
    static updateVote(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, commentId, isUpvote, userId, }) {
            return yield db_1.db
                .update(schema_1.votes)
                .set({
                isUpvote,
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.userId, userId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.votes.postId, postId !== null && postId !== void 0 ? postId : 0), (0, drizzle_orm_1.eq)(schema_1.votes.commentId, commentId !== null && commentId !== void 0 ? commentId : 0))));
        });
    }
    static createVote(_a) {
        return __awaiter(this, arguments, void 0, function* ({ isUpvote, postId, commentId, authorId, }) {
            return yield db_1.db
                .insert(schema_1.votes)
                .values({
                userId: authorId,
                postId,
                commentId,
                isUpvote,
            })
                .returning();
        });
    }
}
exports.VoteRepository = VoteRepository;
//# sourceMappingURL=VoteRepository.js.map