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
exports.VoteResolver = void 0;
const type_graphql_1 = require("type-graphql");
const schema_1 = require("../../database/schema");
const Vote_1 = require("../types/Vote");
const drizzle_orm_1 = require("drizzle-orm");
const types_1 = require("../types");
const Post_1 = require("../types/Post");
let VoteResponse = class VoteResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => Vote_1.Vote, { nullable: true }),
    __metadata("design:type", Object)
], VoteResponse.prototype, "vote", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Vote_1.Vote], { nullable: true }),
    __metadata("design:type", Array)
], VoteResponse.prototype, "votesArray", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [types_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], VoteResponse.prototype, "errors", void 0);
VoteResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], VoteResponse);
let VotedPostsResponse = class VotedPostsResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post], { nullable: true }),
    __metadata("design:type", Array)
], VotedPostsResponse.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [types_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], VotedPostsResponse.prototype, "errors", void 0);
VotedPostsResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], VotedPostsResponse);
let CreateVoteInput = class CreateVoteInput {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], CreateVoteInput.prototype, "postId", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], CreateVoteInput.prototype, "commentId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CreateVoteInput.prototype, "isUpvote", void 0);
CreateVoteInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateVoteInput);
let UpdateVoteInput = class UpdateVoteInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], UpdateVoteInput.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], UpdateVoteInput.prototype, "isUpvote", void 0);
UpdateVoteInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateVoteInput);
const PostsPartialObject = {
    id: schema_1.posts.id,
    title: schema_1.posts.title,
    content: schema_1.posts.content,
    createdAt: schema_1.posts.createdAt,
    updatedAt: schema_1.posts.updatedAt,
    authorId: schema_1.posts.authorId,
};
let VoteResolver = class VoteResolver {
    getUserVotedPosts(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = ctx.req.session.userId;
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "userId",
                            message: "You must be logged in to get your votes",
                        },
                    ],
                };
            }
            const allPosts = yield ctx.db
                .select(PostsPartialObject)
                .from(schema_1.posts)
                .innerJoin(schema_1.votes, (0, drizzle_orm_1.eq)((_a = schema_1.votes.postId) !== null && _a !== void 0 ? _a : -4, schema_1.posts.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.userId, userId), (0, drizzle_orm_1.eq)(schema_1.votes.isUpvote, true)));
            if (!allPosts || allPosts.length === 0) {
                return {
                    errors: [
                        {
                            field: "votes",
                            message: "No votes found",
                        },
                    ],
                };
            }
            return {
                posts: allPosts,
            };
        });
    }
    getPostVotes(ctx, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const allVotes = yield ctx.db
                .select()
                .from(schema_1.votes)
                .where((0, drizzle_orm_1.eq)(schema_1.votes.postId, postId));
            if (!allVotes) {
                return {
                    errors: [
                        {
                            field: "id",
                            message: "An error happened while fetching votes",
                        },
                    ],
                };
            }
            return {
                votesArray: allVotes,
            };
        });
    }
    getCommentVotes(ctx, commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const allVotes = yield ctx.db
                .select()
                .from(schema_1.votes)
                .where((0, drizzle_orm_1.eq)(schema_1.votes.commentId, commentId));
            if (!allVotes) {
                return {
                    errors: [
                        {
                            field: "id",
                            message: "An error happened while fetching votes",
                        },
                    ],
                };
            }
            return {
                votesArray: allVotes,
            };
        });
    }
    createVote(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isUpvote, postId, commentId } = options;
            if (!postId && !commentId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "You must provide a postId or commentId to create a vote",
                        },
                    ],
                };
            }
            if (postId && commentId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "You can only provide a postId or commentId, not both",
                        },
                    ],
                };
            }
            const authorId = ctx.req.session.userId;
            if (!authorId) {
                return {
                    errors: [
                        {
                            field: "authorId",
                            message: "You must be logged in to create a vote",
                        },
                    ],
                };
            }
            if (postId) {
                const post = yield ctx.db
                    .select()
                    .from(schema_1.posts)
                    .where((0, drizzle_orm_1.eq)(schema_1.posts.id, postId));
                if (!post || post.length === 0) {
                    return {
                        errors: [
                            {
                                field: "postId",
                                message: "No post found with that id",
                            },
                        ],
                    };
                }
                const existingVote = yield ctx.db
                    .select()
                    .from(schema_1.votes)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.userId, authorId), (0, drizzle_orm_1.eq)(schema_1.votes.postId, postId)));
                if (existingVote.length > 0) {
                    return {
                        errors: [
                            {
                                field: "postId",
                                message: "You have already voted on this post",
                            },
                        ],
                    };
                }
                const newVote = yield ctx.db
                    .insert(schema_1.votes)
                    .values({
                    userId: authorId,
                    postId: postId,
                    isUpvote: isUpvote,
                })
                    .returning();
                if (!newVote || newVote.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "An error happened while creating a vote",
                            },
                        ],
                    };
                }
                return {
                    vote: newVote[0],
                };
            }
            else if (commentId) {
                const comment = yield ctx.db
                    .select()
                    .from(schema_1.comments)
                    .where((0, drizzle_orm_1.eq)(schema_1.comments.id, commentId));
                if (!comment || comment.length === 0) {
                    return {
                        errors: [
                            {
                                field: "commentId",
                                message: "No comment found with that id",
                            },
                        ],
                    };
                }
                const existingVote = yield ctx.db
                    .select()
                    .from(schema_1.votes)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.userId, authorId), (0, drizzle_orm_1.eq)(schema_1.votes.commentId, commentId)));
                if (existingVote.length > 0) {
                    return {
                        errors: [
                            {
                                field: "commentId",
                                message: "You have already voted on this comment",
                            },
                        ],
                    };
                }
                const newVote = yield ctx.db
                    .insert(schema_1.votes)
                    .values({
                    userId: authorId,
                    commentId: commentId,
                    isUpvote: isUpvote,
                })
                    .returning();
                if (!newVote || newVote.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "An error happened while creating a vote",
                            },
                        ],
                    };
                }
                return {
                    vote: newVote[0],
                };
            }
            else {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "An error that should logically never happen, happened while creating a vote",
                        },
                    ],
                };
            }
        });
    }
    deleteVote(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = ctx.req.session.userId;
            if (!userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "userId",
                            message: "You must be logged in to delete a vote",
                        },
                    ],
                };
            }
            const result = yield ctx.db.select().from(schema_1.votes).where((0, drizzle_orm_1.eq)(schema_1.votes.id, id));
            if (!result || result.length === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "id",
                            message: "No vote found with that id",
                        },
                    ],
                };
            }
            const vote = result[0];
            if (vote.userId !== userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "userId",
                            message: "You are not authorized to delete this vote",
                        },
                    ],
                };
            }
            try {
                const result = yield ctx.db.delete(schema_1.votes).where((0, drizzle_orm_1.eq)(schema_1.votes.id, id));
                if (result.rowCount === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "No votes deleted",
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
    updateVote(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id, isUpvote } = options;
            const userId = ctx.req.session.userId;
            if (!userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to update a vote",
                        },
                    ],
                };
            }
            const result = yield ctx.db.select().from(schema_1.votes).where((0, drizzle_orm_1.eq)(schema_1.votes.id, id));
            if (!result || result.length === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "No vote found with that id",
                        },
                    ],
                };
            }
            const vote = result[0];
            if (vote.userId !== userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "userId",
                            message: "You are not authorized to update this vote",
                        },
                    ],
                };
            }
            if (vote.isUpvote === isUpvote) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "isUpvote",
                            message: "Vote is the same as the original",
                        },
                    ],
                };
            }
            try {
                const updatedVote = yield ctx.db
                    .update(schema_1.votes)
                    .set({
                    isUpvote,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.votes.id, id))
                    .returning();
                if (!updatedVote || updatedVote.length === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "An error happened while updating the vote",
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
exports.VoteResolver = VoteResolver;
__decorate([
    (0, type_graphql_1.Query)(() => VotedPostsResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "getUserVotedPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => VoteResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "getPostVotes", null);
__decorate([
    (0, type_graphql_1.Query)(() => VoteResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("commentId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "getCommentVotes", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => VoteResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateVoteInput]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "createVote", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => types_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "deleteVote", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => types_1.ConfirmResponse, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateVoteInput]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "updateVote", null);
exports.VoteResolver = VoteResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], VoteResolver);
//# sourceMappingURL=VoteResolver.js.map