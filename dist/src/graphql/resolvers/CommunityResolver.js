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
const utils_1 = require("../../lib/utils");
const drizzle_orm_1 = require("drizzle-orm");
const type_graphql_1 = require("type-graphql");
const schema_1 = require("../../database/schema");
const resolvers_1 = require("../../types/resolvers");
const index_1 = require("../../../constants/index");
const inputs_1 = require("../../types/inputs");
let CommunityResolver = class CommunityResolver {
    getCommunityByName(ctx, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session.userId;
            const result = yield ctx.db
                .selectDistinct((0, utils_1.communitySelection)({ ctx, userId }))
                .from(schema_1.communities)
                .where((0, drizzle_orm_1.eq)(schema_1.communities.name, name))
                .leftJoin(schema_1.posts, (0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.posts.communityId))
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.communities.creatorId, schema_1.users.id))
                .leftJoin(schema_1.communityMembers, (0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.communityMembers.communityId))
                .groupBy(schema_1.communities.id, schema_1.posts.id, schema_1.users.id, schema_1.communityMembers.communityId);
            if (!result || result.length === 0) {
                return {
                    errors: [
                        {
                            field: "name",
                            message: "No community found with that name",
                        },
                    ],
                };
            }
            return {
                community: Object.assign(Object.assign({}, result[0]), { isJoined: result[0].isJoined > 0 }),
                count: 1,
            };
        });
    }
    getAllCommunities(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session.userId;
            const allCommunities = yield ctx.db
                .selectDistinct((0, utils_1.communitySelection)({ ctx, userId }))
                .from(schema_1.communities)
                .leftJoin(schema_1.posts, (0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.posts.communityId))
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.communities.creatorId, schema_1.users.id))
                .leftJoin(schema_1.communityMembers, (0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.communityMembers.communityId))
                .groupBy(schema_1.communities.id, schema_1.posts.id, schema_1.users.id)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.communities.createdAt));
            if (!allCommunities || allCommunities.length === 0) {
                return {
                    errors: [{ field: "communities", message: "No communities found" }],
                };
            }
            return {
                communitiesArray: allCommunities.map((c) => (Object.assign(Object.assign({}, c), { isJoined: c.isJoined > 0 }))),
                count: allCommunities.length,
            };
        });
    }
    getExploreCommunities(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session.userId;
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "userId",
                            message: "You must be logged in to get your communities",
                        },
                    ],
                };
            }
            const result = yield ctx.db
                .selectDistinct((0, utils_1.communitySelection)({ ctx, userId }))
                .from(schema_1.communities)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.communityMembers.communityId), (0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, userId !== null && userId !== void 0 ? userId : 0)))
                .leftJoin(schema_1.posts, (0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.posts.communityId))
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.communities.creatorId, schema_1.users.id))
                .leftJoin(schema_1.communityMembers, (0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.communityMembers.communityId))
                .groupBy(schema_1.communities.id, schema_1.posts.id, schema_1.users.id)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.communities.updatedAt))
                .limit(index_1.EXPLORE_COMMUNITIES_COUNT);
            if (!result || result.length === 0) {
                return {
                    errors: [
                        {
                            field: "communities",
                            message: "No communities found",
                        },
                    ],
                };
            }
            return {
                communitiesArray: result.map((c) => (Object.assign(Object.assign({}, c), { isJoined: true }))),
                count: result.length,
            };
        });
    }
    getUserCommunities(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session.userId;
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "userId",
                            message: "You must be logged in to get your communities",
                        },
                    ],
                };
            }
            const result = yield ctx.db
                .selectDistinct((0, utils_1.communitySelection)({ ctx, userId }))
                .from(schema_1.communities)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.communityMembers.communityId), (0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, userId)))
                .leftJoin(schema_1.posts, (0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.posts.communityId))
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.communities.creatorId, schema_1.users.id))
                .leftJoin(schema_1.communityMembers, (0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.communityMembers.communityId))
                .groupBy(schema_1.communities.id, schema_1.posts.id, schema_1.users.id, schema_1.communityMembers.communityId)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.communities.createdAt));
            if (!result || result.length === 0) {
                return {
                    errors: [
                        {
                            field: "communities",
                            message: "No communities found",
                        },
                    ],
                };
            }
            return {
                communitiesArray: result.map((c) => (Object.assign(Object.assign({}, c), { isJoined: true }))),
                count: result.length,
            };
        });
    }
    createCommunity(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { name, description, image } = options;
            const creatorId = ctx.req.session.userId;
            if (!creatorId) {
                return {
                    errors: [
                        {
                            field: "creatorId",
                            message: "You must be logged in to create a community",
                        },
                    ],
                };
            }
            try {
                const newCommunity = yield ctx.db
                    .insert(schema_1.communities)
                    .values({ name, description, image, creatorId })
                    .returning();
                if (!newCommunity || newCommunity.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "Error creating community",
                            },
                        ],
                    };
                }
                const createMemberResult = yield ctx.db
                    .insert(schema_1.communityMembers)
                    .values({ communityId: newCommunity[0].id, userId: creatorId });
                if (createMemberResult.rowCount === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "Error joining the created community. Please make sure the community was created correctly.",
                            },
                        ],
                    };
                }
                return {
                    community: newCommunity[0],
                    count: 1,
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
    updateCommunity(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id, name, description, image } = options;
            if (!name && !description) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must provide a name or description to update",
                        },
                    ],
                };
            }
            const creatorId = ctx.req.session.userId;
            if (!creatorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to update a community",
                        },
                    ],
                };
            }
            try {
                const updatedCommunity = yield ctx.db
                    .update(schema_1.communities)
                    .set({
                    name: name === undefined ? schema_1.communities.name : name,
                    description: description === undefined ? schema_1.communities.description : description,
                    image: image === undefined ? schema_1.communities.image : image,
                })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communities.id, id), (0, drizzle_orm_1.eq)(schema_1.communities.creatorId, creatorId)));
                if (!updatedCommunity || updatedCommunity.rowCount === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "An error happened while updating the community",
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
    deleteCommunity(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const creatorId = ctx.req.session.userId;
            if (!creatorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "creatorId",
                            message: "You must be logged in to delete a community",
                        },
                    ],
                };
            }
            const result = yield ctx.db
                .delete(schema_1.communities)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communities.id, id), (0, drizzle_orm_1.eq)(schema_1.communities.creatorId, creatorId)));
            if (result.rowCount === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "No communities deleted. Please make sure a community with this id exists and you have permission to delete it.",
                        },
                    ],
                };
            }
            return {
                success: true,
            };
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "getExploreCommunities", null);
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