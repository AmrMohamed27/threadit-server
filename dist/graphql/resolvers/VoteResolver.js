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
const inputs_1 = require("../../types/inputs");
const resolvers_1 = require("../../types/resolvers");
let VoteResolver = class VoteResolver {
    createVote(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isUpvote, postId, commentId } = options;
            const authorId = ctx.userId;
            return yield ctx.Services.votes.createVote({
                postId,
                commentId,
                isUpvote,
                authorId,
            });
        });
    }
    deleteVote(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId, commentId } = options;
            const authorId = ctx.userId;
            return yield ctx.Services.votes.deleteVote({ postId, commentId, authorId });
        });
    }
    updateVote(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId, commentId, isUpvote } = options;
            const userId = ctx.userId;
            return yield ctx.Services.votes.updateVote({
                userId,
                isUpvote,
                postId,
                commentId,
            });
        });
    }
};
exports.VoteResolver = VoteResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => inputs_1.VoteResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.CreateVoteInput]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "createVote", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.DeleteVoteOptions]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "deleteVote", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.UpdateVoteInput]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "updateVote", null);
exports.VoteResolver = VoteResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], VoteResolver);
//# sourceMappingURL=VoteResolver.js.map