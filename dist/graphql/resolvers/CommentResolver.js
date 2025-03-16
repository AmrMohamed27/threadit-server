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
const inputs_1 = require("../../types/inputs");
const resolvers_1 = require("../../types/resolvers");
let CommentResolver = class CommentResolver {
    getUserComments(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId: passedUserId, sortBy, page, limit } = options;
            const loggedInUserId = ctx.req.session.userId;
            const userId = passedUserId ? passedUserId : loggedInUserId;
            return yield ctx.Services.comments.fetchUserComments({
                userId,
                sortBy,
                limit,
                page,
            });
        });
    }
    getPostComments(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId, sortBy, searchTerm } = options;
            const userId = ctx.req.session.userId;
            return yield ctx.Services.comments.fetchPostComments({
                userId,
                sortBy,
                searchTerm,
                postId,
            });
        });
    }
    getComment(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { commentId } = options;
            const userId = ctx.req.session.userId;
            return yield ctx.Services.comments.fetchCommentById({
                userId,
                commentId,
            });
        });
    }
    createComment(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { content, postId, parentCommentId } = options;
            const authorId = ctx.req.session.userId;
            return yield ctx.Services.comments.createComment({
                content,
                authorId,
                postId,
                parentCommentId,
            });
        });
    }
    deleteComment(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const authorId = ctx.req.session.userId;
            return yield ctx.Services.comments.deleteComment({
                authorId,
                commentId: id,
            });
        });
    }
    updateComment(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, content } = options;
            const authorId = ctx.req.session.userId;
            return yield ctx.Services.comments.updateComment({
                authorId,
                commentId: id,
                content,
            });
        });
    }
};
exports.CommentResolver = CommentResolver;
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.CommentResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.GetUserCommentsInput]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getUserComments", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.CommentResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.GetPostCommentsInput]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getPostComments", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.CommentResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.GetCommentByIdInput]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getComment", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => inputs_1.CommentResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.CreateCommentInput]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "createComment", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "deleteComment", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.UpdateCommentInput]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "updateComment", null);
exports.CommentResolver = CommentResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], CommentResolver);
//# sourceMappingURL=CommentResolver.js.map