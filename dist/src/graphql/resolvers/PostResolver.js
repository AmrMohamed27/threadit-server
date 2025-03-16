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
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const schema_1 = require("../../database/schema");
const Post_1 = require("../types/Post");
const drizzle_orm_1 = require("drizzle-orm");
const types_1 = require("../types");
let PostResponse = class PostResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => Post_1.Post, { nullable: true }),
    __metadata("design:type", Object)
], PostResponse.prototype, "post", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post], { nullable: true }),
    __metadata("design:type", Array)
], PostResponse.prototype, "postsArray", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [types_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], PostResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], PostResponse.prototype, "count", void 0);
PostResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], PostResponse);
let GetAllPostsInput = class GetAllPostsInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetAllPostsInput.prototype, "page", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetAllPostsInput.prototype, "limit", void 0);
GetAllPostsInput = __decorate([
    (0, type_graphql_1.InputType)()
], GetAllPostsInput);
let GetSearchResultInput = class GetSearchResultInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], GetSearchResultInput.prototype, "searchTerm", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetSearchResultInput.prototype, "page", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetSearchResultInput.prototype, "limit", void 0);
GetSearchResultInput = __decorate([
    (0, type_graphql_1.InputType)()
], GetSearchResultInput);
let CreatePostInput = class CreatePostInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePostInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePostInput.prototype, "content", void 0);
CreatePostInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreatePostInput);
let UpdatePostInput = class UpdatePostInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], UpdatePostInput.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "content", void 0);
UpdatePostInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdatePostInput);
let PostResolver = class PostResolver {
    getAllPosts(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit } = options;
            const countResult = yield ctx.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.posts);
            const postsCount = countResult[0].count;
            const totalPages = Math.ceil(postsCount / limit);
            if (page < 1 || page > totalPages) {
                return {
                    errors: [
                        {
                            field: "page",
                            message: `Page number must be >= 1 and <= ${totalPages}`,
                        },
                    ],
                };
            }
            const allPosts = yield ctx.db
                .select()
                .from(schema_1.posts)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.posts.createdAt))
                .limit(limit)
                .offset((page - 1) * env.POSTS_PER_PAGE);
            if (!allPosts || allPosts.length === 0) {
                return {
                    errors: [
                        {
                            field: "posts",
                            message: "No posts found",
                        },
                    ],
                };
            }
            return {
                postsArray: allPosts,
            };
        });
    }
    searchPosts(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchTerm, page, limit } = options;
            const allPosts = yield ctx.db
                .select({
                posts: {
                    id: schema_1.posts.id,
                    title: schema_1.posts.title,
                    content: schema_1.posts.content,
                    createdAt: schema_1.posts.createdAt,
                    updatedAt: schema_1.posts.updatedAt,
                    authorId: schema_1.posts.authorId,
                },
                totalCount: ctx.db.$count(schema_1.posts, (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.posts.content, "%" + searchTerm + "%"), (0, drizzle_orm_1.ilike)(schema_1.posts.title, "%" + searchTerm + "%"))),
            })
                .from(schema_1.posts)
                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.posts.content, "%" + searchTerm + "%"), (0, drizzle_orm_1.ilike)(schema_1.posts.title, "%" + searchTerm + "%")))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.posts.createdAt))
                .limit(limit)
                .offset((page - 1) * env.POSTS_PER_PAGE);
            if (!allPosts || allPosts.length === 0) {
                return {
                    errors: [
                        {
                            field: "posts",
                            message: "No posts found",
                        },
                    ],
                };
            }
            return {
                postsArray: allPosts.map((result) => result.posts),
                count: allPosts[0].totalCount,
            };
        });
    }
    getPostsCount(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const countResult = yield ctx.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.posts);
            return countResult[0].count;
        });
    }
    getUserPosts(ctx, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const authorId = userId ? userId : ctx.req.session.userId;
            if (!authorId) {
                return {
                    errors: [
                        {
                            field: "authorId",
                            message: "You must be logged in to get your posts",
                        },
                    ],
                };
            }
            const allPosts = yield ctx.db
                .select()
                .from(schema_1.posts)
                .where((0, drizzle_orm_1.eq)(schema_1.posts.authorId, authorId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.posts.createdAt));
            if (!allPosts || allPosts.length === 0) {
                return {
                    errors: [
                        {
                            field: "posts",
                            message: "No posts found",
                        },
                    ],
                };
            }
            return {
                postsArray: allPosts,
            };
        });
    }
    getPost(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield ctx.db.select().from(schema_1.posts).where((0, drizzle_orm_1.eq)(schema_1.posts.id, id));
            if (!result || result.length === 0) {
                return {
                    errors: [
                        {
                            field: "id",
                            message: "No post found with that id",
                        },
                    ],
                };
            }
            return {
                post: result[0],
            };
        });
    }
    createPost(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { title, content } = options;
            const authorId = ctx.req.session.userId;
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
            console.log(authorId);
            try {
                const newPost = yield ctx.db
                    .insert(schema_1.posts)
                    .values({ title, content, authorId })
                    .returning();
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
    deletePost(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const authorId = ctx.req.session.userId;
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
            const result = yield ctx.db.select().from(schema_1.posts).where((0, drizzle_orm_1.eq)(schema_1.posts.id, id));
            if (!result || result.length === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "id",
                            message: "No post found with that id",
                        },
                    ],
                };
            }
            const post = result[0];
            if (post.authorId !== authorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "authorId",
                            message: "You are not authorized to delete this post",
                        },
                    ],
                };
            }
            try {
                const result = yield ctx.db.delete(schema_1.posts).where((0, drizzle_orm_1.eq)(schema_1.posts.id, id));
                console.log(result);
                if (result.rowCount === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "No posts deleted",
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
    updatePost(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id, title, content } = options;
            if (!title && !content) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must provide a title or content to update",
                        },
                    ],
                };
            }
            const authorId = ctx.req.session.userId;
            if (!authorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to update a post",
                        },
                    ],
                };
            }
            const result = yield ctx.db.select().from(schema_1.posts).where((0, drizzle_orm_1.eq)(schema_1.posts.id, id));
            if (!result || result.length === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "No post found with that id",
                        },
                    ],
                };
            }
            const post = result[0];
            if (post.authorId !== authorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "authorId",
                            message: "You are not authorized to update this post",
                        },
                    ],
                };
            }
            if (!title && post.content === content) {
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
            if (!content && post.title === title) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "title",
                            message: "Title is the same as the original",
                        },
                    ],
                };
            }
            try {
                const updatedPost = yield ctx.db
                    .update(schema_1.posts)
                    .set({
                    title: title === undefined ? post.title : title,
                    content: content === undefined ? post.content : content,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.posts.id, id))
                    .returning();
                if (!updatedPost || updatedPost.length === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "An error happened while updating the post",
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
exports.PostResolver = PostResolver;
__decorate([
    (0, type_graphql_1.Query)(() => PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, GetAllPostsInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getAllPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, GetSearchResultInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "searchPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => type_graphql_1.Int),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPostsCount", null);
__decorate([
    (0, type_graphql_1.Query)(() => PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("userId", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getUserPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreatePostInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => types_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => types_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdatePostInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
exports.PostResolver = PostResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], PostResolver);
//# sourceMappingURL=PostResolver.js.map