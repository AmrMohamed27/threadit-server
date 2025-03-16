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
exports.CommentResolver = void 0;
const type_graphql_1 = require("type-graphql");
const schema_1 = require("../../database/schema");
const Comment_1 = require("../types/Comment");
const drizzle_orm_1 = require("drizzle-orm");
const types_1 = require("../types");
let CommentResponse = class CommentResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => Comment_1.Comment, { nullable: true }),
    __metadata("design:type", Object)
], CommentResponse.prototype, "comment", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Comment_1.Comment], { nullable: true }),
    __metadata("design:type", Array)
], CommentResponse.prototype, "commentsArray", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [types_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], CommentResponse.prototype, "errors", void 0);
CommentResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], CommentResponse);
let CreateCommentInput = class CreateCommentInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCommentInput.prototype, "content", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], CreateCommentInput.prototype, "postId", void 0);
CreateCommentInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateCommentInput);
let UpdateCommentInput = class UpdateCommentInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], UpdateCommentInput.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UpdateCommentInput.prototype, "content", void 0);
UpdateCommentInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateCommentInput);
let CommentResolver = class CommentResolver {
    getUserComments(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session.userId;
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
            const allComments = yield ctx.db
                .select()
                .from(schema_1.comments)
                .where((0, drizzle_orm_1.eq)(schema_1.comments.authorId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.comments.createdAt));
            if (!allComments || allComments.length === 0) {
                return {
                    errors: [
                        {
                            field: "comments",
                            message: "No comments found",
                        },
                    ],
                };
            }
            return {
                commentsArray: allComments,
            };
        });
    }
    getPostComments(ctx, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const allComments = yield ctx.db
                .select()
                .from(schema_1.comments)
                .where((0, drizzle_orm_1.eq)(schema_1.comments.postId, postId));
            if (!allComments) {
                return {
                    errors: [
                        {
                            field: "id",
                            message: "An error happened while fetching comments",
                        },
                    ],
                };
            }
            return {
                commentsArray: allComments,
            };
        });
    }
    getComment(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield ctx.db
                .select()
                .from(schema_1.comments)
                .where((0, drizzle_orm_1.eq)(schema_1.comments.id, id));
            if (!result || result.length === 0) {
                return {
                    errors: [
                        {
                            field: "id",
                            message: "No comment found with that id",
                        },
                    ],
                };
            }
            return {
                comment: result[0],
            };
        });
    }
    createComment(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { content, postId } = options;
            const authorId = ctx.req.session.userId;
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
            const postExists = yield ctx.db
                .select()
                .from(schema_1.posts)
                .where((0, drizzle_orm_1.eq)(schema_1.posts.id, postId));
            if (!postExists || postExists.length === 0) {
                return {
                    errors: [
                        {
                            field: "postId",
                            message: "No post found with that id",
                        },
                    ],
                };
            }
            try {
                const newComment = yield ctx.db
                    .insert(schema_1.comments)
                    .values({ content, authorId, postId })
                    .returning();
                if (!newComment || newComment.length === 0) {
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
                    comment: newComment[0],
                };
            }
            catch (error) {
                console.error(error);
                return {
                    errors: [
                        {
                            field: "root",
                            message: (_a = error.message) !== null && _a !== void 0 ? _a : "An Error occurred during creation",
                        },
                    ],
                };
            }
        });
    }
    deleteComment(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const authorId = ctx.req.session.userId;
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
            const result = yield ctx.db
                .select()
                .from(schema_1.comments)
                .where((0, drizzle_orm_1.eq)(schema_1.comments.id, id));
            if (!result || result.length === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "id",
                            message: "No comment found with that id",
                        },
                    ],
                };
            }
            const comment = result[0];
            if (comment.authorId !== authorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "authorId",
                            message: "You are not authorized to delete this comment",
                        },
                    ],
                };
            }
            try {
                const result = yield ctx.db.delete(schema_1.comments).where((0, drizzle_orm_1.eq)(schema_1.comments.id, id));
                if (result.rowCount === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "No comments deleted",
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
                            message: (_a = error.message) !== null && _a !== void 0 ? _a : "An Error occurred during deletion",
                        },
                    ],
                };
            }
        });
    }
    updateComment(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id, content } = options;
            const authorId = ctx.req.session.userId;
            if (!authorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to update a comment",
                        },
                    ],
                };
            }
            const result = yield ctx.db
                .select()
                .from(schema_1.comments)
                .where((0, drizzle_orm_1.eq)(schema_1.comments.id, id));
            if (!result || result.length === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "No comment found with that id",
                        },
                    ],
                };
            }
            const comment = result[0];
            if (comment.authorId !== authorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "authorId",
                            message: "You are not authorized to update this comment",
                        },
                    ],
                };
            }
            if (comment.content === content) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "content",
                            message: "Content is the same as the original",
                        },
                    ],
                };
            }
            try {
                const updatedComment = yield ctx.db
                    .update(schema_1.comments)
                    .set({
                    content: content,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.comments.id, id))
                    .returning();
                if (!updatedComment || updatedComment.length === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "An error happened while updating the comment",
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
                            message: (_a = error.message) !== null && _a !== void 0 ? _a : "An Error occurred during update",
                        },
                    ],
                };
            }
        });
    }
};
exports.CommentResolver = CommentResolver;
__decorate([
    (0, type_graphql_1.Query)(() => CommentResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getUserComments", null);
__decorate([
    (0, type_graphql_1.Query)(() => CommentResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getPostComments", null);
__decorate([
    (0, type_graphql_1.Query)(() => CommentResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getComment", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => CommentResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateCommentInput]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "createComment", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => types_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "deleteComment", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => types_1.ConfirmResponse, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateCommentInput]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "updateComment", null);
exports.CommentResolver = CommentResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], CommentResolver);
//# sourceMappingURL=CommentResolver.js.map