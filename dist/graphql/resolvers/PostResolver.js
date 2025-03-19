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
const inputs_1 = require("../../types/inputs");
const resolvers_1 = require("../../types/resolvers");
let PostResolver = class PostResolver {
    getAllPosts(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit, sortBy } = options;
            const userId = ctx.userId;
            return yield ctx.Services.posts.fetchAllPosts({
                sortBy,
                userId,
                limit,
                page,
            });
        });
    }
    getUserCommunityPosts(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit, sortBy } = options;
            const userId = ctx.userId;
            return yield ctx.Services.posts.fetchUserCommunityPosts({
                sortBy,
                userId,
                limit,
                page,
            });
        });
    }
    getCommunityPosts(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { communityId, page, limit, sortBy } = options;
            const userId = ctx.userId;
            return yield ctx.Services.posts.fetchCommunityPosts({
                sortBy,
                userId,
                limit,
                page,
                communityId,
            });
        });
    }
    searchPosts(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchTerm, page, limit, sortBy } = options;
            const userId = ctx.userId;
            return yield ctx.Services.posts.fetchSearchPosts({
                sortBy,
                userId,
                limit,
                page,
                searchTerm,
            });
        });
    }
    getUserPosts(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, page, limit, sortBy = "New" } = options;
            const authorId = userId ? userId : ctx.userId;
            return yield ctx.Services.posts.fetchUserPosts({
                sortBy,
                userId,
                authorId,
                limit,
                page,
            });
        });
    }
    getUserHiddenPosts(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit, sortBy } = options;
            const userId = ctx.userId;
            return yield ctx.Services.posts.fetchUserHiddenPosts({
                sortBy,
                userId,
                limit,
                page,
            });
        });
    }
    getUserVotedPosts(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sortBy, limit, page, isUpvoted } = options;
            const userId = ctx.userId;
            return yield ctx.Services.posts.fetchUserVotedPosts({
                sortBy,
                userId,
                limit,
                page,
                isUpvoted,
            });
        });
    }
    getPost(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.userId;
            return yield ctx.Services.posts.fetchPostById({
                postId: id,
                userId,
            });
        });
    }
    createPost(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, content, communityId, media } = options;
            const authorId = ctx.userId;
            return yield ctx.Services.posts.createPost({
                title,
                content,
                communityId,
                authorId,
                media,
            });
        });
    }
    deletePost(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const authorId = ctx.userId;
            return yield ctx.Services.posts.deletePost({
                postId: id,
                authorId,
            });
        });
    }
    updatePost(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, title, content } = options;
            const authorId = ctx.userId;
            return yield ctx.Services.posts.updatePost({
                title,
                content,
                postId: id,
                authorId,
            });
        });
    }
};
exports.PostResolver = PostResolver;
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.GetAllPostsInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getAllPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.GetUserCommunityPostsInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getUserCommunityPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.GetCommunityPostsInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getCommunityPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.GetSearchResultInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "searchPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.GetUserPostsInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getUserPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.GetUserHiddenPostsInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getUserHiddenPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.GetUserVotedPostsOptions]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getUserVotedPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => inputs_1.PostResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.CreatePostInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.UpdatePostInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
exports.PostResolver = PostResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], PostResolver);
//# sourceMappingURL=PostResolver.js.map