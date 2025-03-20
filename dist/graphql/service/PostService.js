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
exports.PostService = void 0;
const utils_1 = require("../../lib/utils");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
const db_1 = require("../../database/db");
class PostService {
    constructor(repository) {
        this.repository = repository;
    }
    postsFetcher(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, limit, page, filters, communityOnly, hiddenOnly, votesOnly, }) {
            const result = yield this.repository.getAllPostsWithFilters({
                sortBy,
                userId,
                limit,
                page,
                filters,
                communityOnly,
                hiddenOnly,
            });
            if (!result || result.length === 0) {
                return {
                    errors: [{ field: "posts", message: "No posts found" }],
                };
            }
            const resultCount = yield this.repository.countAllPostsWithFilters({
                filters,
                hiddenOnly,
                communityOnly,
                votesOnly,
            });
            return {
                postsArray: (0, utils_1.mapPostArrayResult)(result),
                count: resultCount[0].count,
            };
        });
    }
    singlePostFetcher(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, postId, filters, }) {
            const result = yield this.repository.getSinglePost({
                userId,
                postId,
                filters,
            });
            if (!result || result.length === 0) {
                return {
                    errors: [{ field: "post", message: "No posts found" }],
                };
            }
            return {
                post: (0, utils_1.mapSinglePostResult)(result[0]),
                count: 1,
            };
        });
    }
    fetchAllPosts(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, limit, page, }) {
            const filters = [
                (0, utils_1.excludeHiddenPosts)(userId !== null && userId !== void 0 ? userId : 0),
            ];
            return yield this.postsFetcher({
                sortBy,
                userId,
                limit,
                page,
                filters,
            });
        });
    }
    fetchUserCommunityPosts(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, limit, page, }) {
            const filters = userId
                ? [
                    (0, utils_1.excludeHiddenPosts)(userId),
                    (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.communityId, schema_1.communityMembers.communityId), (0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, userId)),
                ]
                : [];
            return yield this.postsFetcher({
                sortBy,
                limit,
                page,
                userId,
                filters,
                communityOnly: !!userId,
            });
        });
    }
    fetchPostById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, userId, }) {
            return yield this.singlePostFetcher({ userId, postId, filters: [] });
        });
    }
    fetchCommunityPosts(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, limit, page, communityId, }) {
            const filters = [
                (0, drizzle_orm_1.eq)(schema_1.posts.communityId, communityId),
                (0, drizzle_orm_1.eq)(schema_1.communityMembers.communityId, communityId),
                (0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, userId !== null && userId !== void 0 ? userId : 0),
                (0, utils_1.excludeHiddenPosts)(userId !== null && userId !== void 0 ? userId : 0),
            ];
            return yield this.postsFetcher({
                sortBy,
                limit,
                page,
                userId,
                filters,
                communityOnly: !!userId,
            });
        });
    }
    fetchSearchPosts(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, limit, page, searchTerm, }) {
            if (searchTerm.trim().length === 0) {
                return {
                    errors: [
                        {
                            field: "searchTerm",
                            message: "Search term cannot be empty",
                        },
                    ],
                };
            }
            const filters = [
                (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.posts.content, "%" + searchTerm + "%"), (0, drizzle_orm_1.ilike)(schema_1.posts.title, "%" + searchTerm + "%")),
                (0, utils_1.excludeHiddenPosts)(userId !== null && userId !== void 0 ? userId : 0),
            ];
            return yield this.postsFetcher({ sortBy, limit, page, userId, filters });
        });
    }
    fetchUserPosts(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, authorId, limit, page, }) {
            if (!authorId) {
                return {
                    errors: [
                        {
                            field: "authorId",
                            message: "Please provide a user id to get their posts",
                        },
                    ],
                };
            }
            const filters = [
                (0, utils_1.excludeHiddenPosts)(userId !== null && userId !== void 0 ? userId : 0),
                (0, drizzle_orm_1.eq)(schema_1.posts.authorId, authorId),
            ];
            return yield this.postsFetcher({ sortBy, limit, page, userId, filters });
        });
    }
    fetchUserHiddenPosts(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, limit, page, }) {
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "userId",
                            message: "Please log in to see your hidden posts",
                        },
                    ],
                };
            }
            const filters = [
                (0, drizzle_orm_1.eq)(schema_1.posts.id, schema_1.hiddenPosts.postId),
                (0, drizzle_orm_1.eq)(schema_1.hiddenPosts.userId, userId),
            ];
            return yield this.postsFetcher({
                sortBy,
                limit,
                page,
                userId,
                filters,
                hiddenOnly: true,
            });
        });
    }
    fetchUserVotedPosts(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, limit, page, isUpvoted, }) {
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "userId",
                            message: "You must be logged in to get your voted",
                        },
                    ],
                };
            }
            const filters = [
                (0, utils_1.excludeHiddenPosts)(userId),
                (0, drizzle_orm_1.eq)(schema_1.posts.id, schema_1.votes.postId),
                (0, drizzle_orm_1.eq)(schema_1.votes.userId, userId),
                (0, drizzle_orm_1.eq)(schema_1.votes.isUpvote, isUpvoted),
            ];
            return yield this.postsFetcher({
                sortBy,
                limit,
                page,
                userId,
                filters,
                votesOnly: true,
            });
        });
    }
    fetchUserSavedPosts(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, page, limit, sortBy, }) {
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to get your saved posts",
                        },
                    ],
                };
            }
            const filters = [
                (0, drizzle_orm_1.exists)(db_1.db
                    .select()
                    .from(schema_1.savedPosts)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.savedPosts.postId, schema_1.posts.id), (0, drizzle_orm_1.eq)(schema_1.savedPosts.userId, userId !== null && userId !== void 0 ? userId : 0)))),
            ];
            return yield this.postsFetcher({
                sortBy,
                filters,
                limit,
                page,
                userId,
            });
        });
    }
    createPost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ title, content, communityId, authorId, media, video, }) {
            if (!authorId) {
                return {
                    errors: [
                        {
                            field: "authorId",
                            message: "You must be logged in to create a post",
                        },
                    ],
                };
            }
            const newPost = yield this.repository.insertPost({
                title,
                content,
                authorId,
                communityId,
                media,
                video,
            });
            if (!newPost || newPost.length === 0) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "Error creating post",
                        },
                    ],
                };
            }
            return {
                post: newPost[0],
                count: 1,
            };
        });
    }
    updatePost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ title, content, postId, authorId, }) {
            if (!authorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "authorId",
                            message: "You must be logged in to update a post",
                        },
                    ],
                };
            }
            const result = yield this.repository.updatePost({
                title,
                content,
                authorId,
                postId,
            });
            if (!result || result.length === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "Error updating post",
                        },
                    ],
                };
            }
            return {
                success: true,
            };
        });
    }
    deletePost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, authorId, }) {
            if (!authorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "authorId",
                            message: "You must be logged in to delete a post",
                        },
                    ],
                };
            }
            const result = yield this.repository.deletePost({
                postId,
                authorId,
            });
            if (!result) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "Error deleting post",
                        },
                    ],
                };
            }
            return {
                success: true,
            };
        });
    }
}
exports.PostService = PostService;
//# sourceMappingURL=PostService.js.map