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
exports.CommentService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const utils_1 = require("../../lib/utils");
const schema_1 = require("../../database/schema");
class CommentService {
    constructor(repository) {
        this.repository = repository;
    }
    commentsFetcher(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, limit, page, filters, }) {
            const result = yield this.repository.getAllCommentsWithFilters({
                sortBy,
                userId,
                limit,
                page,
                filters,
            });
            if (!result || result.length === 0) {
                return {
                    errors: [{ field: "comments", message: "no comments found" }],
                };
            }
            const resultCount = yield this.repository.countAllCommentsWithFilters({
                filters,
            });
            return {
                commentsArray: (0, utils_1.mapCommentArrayResult)(result),
                count: resultCount[0].count,
            };
        });
    }
    fetchUserComments(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, sortBy, limit, page, }) {
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "userId",
                            message: "You must be logged in to get your comments",
                        },
                    ],
                };
            }
            const filters = [(0, drizzle_orm_1.eq)(schema_1.comments.authorId, userId)];
            const result = yield this.commentsFetcher({
                sortBy,
                limit,
                page,
                filters,
                userId,
            });
            const countResult = yield this.repository.countAllCommentsWithFilters({
                filters,
            });
            if (result.errors) {
                return result;
            }
            const flatList = result.commentsArray;
            const threadedComments = (0, utils_1.buildCommentThread)(flatList);
            return {
                commentsArray: threadedComments,
                count: countResult[0].count,
            };
        });
    }
    fetchPostComments(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, sortBy, searchTerm, userId, }) {
            const filters = [
                searchTerm
                    ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.comments.postId, postId), (0, drizzle_orm_1.ilike)(schema_1.comments.content, "%" + searchTerm + "%"))
                    : (0, drizzle_orm_1.eq)(schema_1.comments.postId, postId),
            ];
            const result = yield this.commentsFetcher({
                sortBy,
                limit: 1000,
                page: 1,
                filters,
                userId,
            });
            const countResult = yield this.repository.countAllCommentsWithFilters({
                filters,
            });
            if (result.errors) {
                return result;
            }
            const flatList = result.commentsArray;
            if (searchTerm) {
                return {
                    commentsArray: flatList,
                    count: countResult[0].count,
                };
            }
            else {
                const threadedComments = (0, utils_1.buildCommentThread)(flatList);
                return {
                    commentsArray: threadedComments,
                    count: countResult[0].count,
                };
            }
        });
    }
    fetchCommentById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ commentId, userId, }) {
            const filters = [
                (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.comments.id, commentId), (0, drizzle_orm_1.eq)(schema_1.comments.parentCommentId, commentId)),
            ];
            const result = yield this.commentsFetcher({
                userId,
                filters,
                limit: 1000,
                page: 1,
            });
            if (result.errors) {
                return result;
            }
            const flatList = result.commentsArray.map((comment) => {
                if (comment.id === commentId) {
                    return Object.assign(Object.assign({}, comment), { parentCommentId: null });
                }
                return comment;
            });
            const threadedComments = (0, utils_1.buildCommentThread)(flatList);
            const resultCount = yield this.repository.countAllCommentsWithFilters({
                filters,
            });
            return {
                commentsArray: threadedComments,
                count: resultCount[0].count,
            };
        });
    }
    createComment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ content, authorId, postId, parentCommentId, }) {
            var _b;
            if (!authorId) {
                return {
                    errors: [
                        {
                            field: "authorId",
                            message: "You must be logged in to create a comment",
                        },
                    ],
                };
            }
            try {
                const result = yield this.repository.insertComment({
                    content,
                    authorId,
                    postId,
                    parentCommentId,
                });
                if (!result || result.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "Error creating comment",
                            },
                        ],
                    };
                }
                return {
                    comment: result[0],
                };
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
    updateComment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ authorId, commentId, content, }) {
            if (!authorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "authorId",
                            message: "You must be logged in to delete a comment",
                        },
                    ],
                };
            }
            const result = yield this.repository.updateComment({
                content,
                commentId,
                authorId,
            });
            if (!result || result.length === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "Error updating comment",
                        },
                    ],
                };
            }
            return {
                success: true,
            };
        });
    }
    deleteComment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ authorId, commentId, }) {
            if (!authorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "authorId",
                            message: "You must be logged in to delete a comment",
                        },
                    ],
                };
            }
            const result = yield this.repository.deleteComment({
                commentId,
                authorId,
            });
            if (!result || result.length === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "Error deleting comment",
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
exports.CommentService = CommentService;
//# sourceMappingURL=CommentService.js.map