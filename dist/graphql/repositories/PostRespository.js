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
exports.PostRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const utils_1 = require("../../lib/utils");
class PostRepository {
    static buildBaseQuery({ userId }) {
        return db_1.db
            .select((0, utils_1.postSelection)({ userId }))
            .from(schema_1.posts)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.posts.authorId, schema_1.users.id))
            .leftJoin(schema_1.votes, (0, drizzle_orm_1.eq)(schema_1.posts.id, schema_1.votes.postId))
            .leftJoin(schema_1.communities, (0, drizzle_orm_1.eq)(schema_1.posts.communityId, schema_1.communities.id))
            .leftJoin(schema_1.comments, (0, drizzle_orm_1.eq)(schema_1.posts.id, schema_1.comments.postId))
            .$dynamic();
    }
    static withPagination(_a) {
        return __awaiter(this, arguments, void 0, function* ({ qb, page, limit, sortBy, }) {
            return yield qb
                .groupBy(schema_1.posts.id, schema_1.users.id, schema_1.communities.id, schema_1.communityMembers.communityId)
                .limit(limit)
                .offset((page - 1) * limit)
                .orderBy((0, utils_1.postsSorter)(sortBy));
        });
    }
    static withPostJoins(_a) {
        return __awaiter(this, arguments, void 0, function* ({ qb }) {
            return yield qb
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.posts.authorId, schema_1.users.id))
                .leftJoin(schema_1.votes, (0, drizzle_orm_1.eq)(schema_1.posts.id, schema_1.votes.postId))
                .leftJoin(schema_1.communities, (0, drizzle_orm_1.eq)(schema_1.posts.communityId, schema_1.communities.id))
                .leftJoin(schema_1.comments, (0, drizzle_orm_1.eq)(schema_1.posts.id, schema_1.comments.postId))
                .leftJoin(schema_1.communityMembers, (0, drizzle_orm_1.eq)(schema_1.posts.communityId, schema_1.communityMembers.communityId))
                .groupBy(schema_1.posts.id, schema_1.users.id, schema_1.communities.id, schema_1.communityMembers.communityId);
        });
    }
    static getAllPostsWithFilters(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, limit, page, filters, communityOnly, hiddenOnly, }) {
            let qb = this.buildBaseQuery({ userId });
            if (hiddenOnly && userId) {
                qb = qb.leftJoin(schema_1.hiddenPosts, (0, drizzle_orm_1.eq)(schema_1.posts.id, schema_1.hiddenPosts.postId));
            }
            if (communityOnly && userId) {
                qb = qb.leftJoin(schema_1.communityMembers, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.communityId, schema_1.communityMembers.communityId), (0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, userId)));
            }
            else {
                qb = qb.leftJoin(schema_1.communityMembers, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.communityId, schema_1.communityMembers.communityId)));
            }
            qb = qb.where((0, drizzle_orm_1.and)(...filters));
            return yield this.withPagination({
                qb,
                limit,
                page,
                sortBy: sortBy !== null && sortBy !== void 0 ? sortBy : "Best",
            });
        });
    }
    static countAllPostsWithFilters(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filters, communityOnly, hiddenOnly, votesOnly, }) {
            if (communityOnly) {
                return yield db_1.db
                    .select({ count: (0, drizzle_orm_1.count)() })
                    .from(schema_1.posts)
                    .leftJoin(schema_1.communityMembers, (0, drizzle_orm_1.eq)(schema_1.posts.communityId, schema_1.communityMembers.communityId))
                    .where((0, drizzle_orm_1.and)(...filters));
            }
            else if (hiddenOnly) {
                return yield db_1.db
                    .select({ count: (0, drizzle_orm_1.count)() })
                    .from(schema_1.posts)
                    .leftJoin(schema_1.hiddenPosts, (0, drizzle_orm_1.eq)(schema_1.posts.id, schema_1.hiddenPosts.postId))
                    .where((0, drizzle_orm_1.and)(...filters));
            }
            else if (votesOnly) {
                return yield db_1.db
                    .select({ count: (0, drizzle_orm_1.count)() })
                    .from(schema_1.posts)
                    .leftJoin(schema_1.votes, (0, drizzle_orm_1.eq)(schema_1.posts.id, schema_1.votes.postId))
                    .where((0, drizzle_orm_1.and)(...filters));
            }
            else {
                return yield db_1.db
                    .select({ count: (0, drizzle_orm_1.count)() })
                    .from(schema_1.posts)
                    .where((0, drizzle_orm_1.and)(...filters));
            }
        });
    }
    static getSinglePost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, postId, filters, }) {
            const qb = db_1.db
                .select((0, utils_1.postSelection)({ userId }))
                .from(schema_1.posts)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.id, postId), (0, drizzle_orm_1.and)(...filters)))
                .$dynamic();
            return yield this.withPostJoins({ qb });
        });
    }
    static insertPost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ title, content, authorId, communityId, media, }) {
            return yield db_1.db
                .insert(schema_1.posts)
                .values({ title, content, authorId, communityId, media })
                .returning();
        });
    }
    static updatePost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ title, content, postId, authorId, }) {
            return yield db_1.db
                .update(schema_1.posts)
                .set({
                title,
                content,
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.id, postId), (0, drizzle_orm_1.eq)(schema_1.posts.authorId, authorId)))
                .returning();
        });
    }
    static deletePost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, authorId, }) {
            return yield db_1.db
                .delete(schema_1.posts)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.id, postId), (0, drizzle_orm_1.eq)(schema_1.posts.authorId, authorId)));
        });
    }
}
exports.PostRepository = PostRepository;
//# sourceMappingURL=PostRespository.js.map