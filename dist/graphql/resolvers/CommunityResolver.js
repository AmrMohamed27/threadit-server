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
exports.CommunityResolver = void 0;
const type_graphql_1 = require("type-graphql");
const inputs_1 = require("../../types/inputs");
const resolvers_1 = require("../../types/resolvers");
let CommunityResolver = class CommunityResolver {
    getCommunityByName(ctx, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session.userId;
            return yield ctx.Services.communities.fetchCommunityByName({
                userId,
                name,
            });
        });
    }
    getAllCommunities(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session.userId;
            return yield ctx.Services.communities.fetchAllCommunities({
                userId,
                sortBy: "New",
            });
        });
    }
    getExploreCommunities(ctx, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session.userId;
            return yield ctx.Services.communities.fetchExploreCommunities({
                userId,
                sortBy: "New",
                limit,
            });
        });
    }
    searchCommunities(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchTerm, page, limit } = options;
            const userId = ctx.req.session.userId;
            return yield ctx.Services.communities.searchCommunities({
                userId,
                page,
                limit,
                searchTerm,
                sortBy: "Top",
            });
        });
    }
    getUserCommunities(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session.userId;
            return yield ctx.Services.communities.fetchUserCommunities({
                userId,
                sortBy: "New",
            });
        });
    }
    createCommunity(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description, image, isPrivate = false } = options;
            const creatorId = ctx.req.session.userId;
            return yield ctx.Services.communities.createCommunity({
                name,
                description,
                image,
                isPrivate,
                creatorId,
            });
        });
    }
    updateCommunity(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, name, description, image } = options;
            const creatorId = ctx.req.session.userId;
            return yield ctx.Services.communities.updateCommunity({
                communityId: id,
                creatorId,
                name,
                description,
                image,
            });
        });
    }
    deleteCommunity(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const creatorId = ctx.req.session.userId;
            return yield ctx.Services.communities.deleteCommunity({
                communityId: id,
                creatorId,
            });
        });
    }
};
exports.CommunityResolver = CommunityResolver;
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.CommunityResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "getCommunityByName", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.CommunityResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "getAllCommunities", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.CommunityResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "getExploreCommunities", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.CommunityResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.GetSearchResultInput]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "searchCommunities", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.CommunityResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "getUserCommunities", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => inputs_1.CommunityResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.CreateCommunityInput]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "createCommunity", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.UpdateCommunityInput]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "updateCommunity", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "deleteCommunity", null);
exports.CommunityResolver = CommunityResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], CommunityResolver);
//# sourceMappingURL=CommunityResolver.js.map