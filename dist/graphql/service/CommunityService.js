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
exports.CommunityService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const utils_1 = require("../../lib/utils");
const schema_1 = require("../../database/schema");
const db_1 = require("../../database/db");
const CommunityMembersRepository_1 = require("../repositories/CommunityMembersRepository");
class CommunityService {
    constructor(repository) {
        this.repository = repository;
    }
    communityArrayFetcher(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, limit, page, filters, isExplore, }) {
            const result = yield this.repository.getAllCommunitiesWithFilters({
                sortBy,
                userId,
                limit,
                page,
                filters,
            });
            if (!result || result.length === 0) {
                return {
                    errors: [{ field: "community", message: "No communities found" }],
                };
            }
            const resultCount = yield this.repository.countAllCommunitiesWithFilters({
                filters,
                isExplore,
            });
            return {
                communitiesArray: (0, utils_1.mapCommunitiesResult)(result),
                count: resultCount[0].count,
            };
        });
    }
    communityFetcher(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, filters, }) {
            const result = yield this.repository.getAllCommunitiesWithFilters({
                userId,
                filters,
            });
            if (!result || result.length === 0) {
                return {
                    errors: [{ field: "community", message: "No communities found" }],
                };
            }
            return {
                community: (0, utils_1.mapCommunitiesResult)(result)[0],
                count: 1,
            };
        });
    }
    fetchCommunityByName(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, name, }) {
            const filters = [(0, drizzle_orm_1.eq)(schema_1.communities.name, name)];
            return yield this.communityFetcher({
                userId,
                filters,
            });
        });
    }
    fetchAllCommunities(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, sortBy, }) {
            return yield this.communityArrayFetcher({
                userId,
                filters: [],
                sortBy,
            });
        });
    }
    fetchExploreCommunities(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, sortBy, limit, }) {
            const filters = [
                (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.communityMembers.communityId), (0, drizzle_orm_1.notExists)(db_1.db
                    .select()
                    .from(schema_1.communityMembers)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communityMembers.communityId, schema_1.communities.id), (0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, userId !== null && userId !== void 0 ? userId : 0))))),
            ];
            return yield this.communityArrayFetcher({
                userId,
                filters,
                limit,
                page: 1,
                sortBy,
                isExplore: true,
            });
        });
    }
    searchCommunities(_a) {
        return __awaiter(this, arguments, void 0, function* ({ searchTerm, page, limit, userId, sortBy, }) {
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
            const filters = [(0, drizzle_orm_1.ilike)(schema_1.communities.name, "%" + searchTerm + "%")];
            return yield this.communityArrayFetcher({
                userId,
                filters,
                limit,
                page,
                sortBy,
            });
        });
    }
    fetchUserCommunities(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, sortBy, }) {
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
            const filters = [
                (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.communityMembers.communityId), (0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, userId)),
            ];
            return yield this.communityArrayFetcher({
                userId,
                filters,
                sortBy,
                isExplore: true,
            });
        });
    }
    createCommunity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name, description, image, isPrivate, creatorId, }) {
            var _b;
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
                const result = yield this.repository.createCommunity({
                    name,
                    description,
                    image,
                    isPrivate,
                    creatorId,
                });
                if (!result || result.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "Error creating community",
                            },
                        ],
                    };
                }
                const createMemberResult = yield CommunityMembersRepository_1.CommunityMembersRepository.joinCommunity(result[0].id, creatorId);
                if (createMemberResult.length === 0) {
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
                    community: result[0],
                    count: 1,
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
    updateCommunity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ communityId, name, description, image, creatorId, }) {
            var _b;
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
            try {
                const updatedCommunity = yield this.repository.updateCommunity({
                    id: communityId,
                    name,
                    description,
                    image,
                    creatorId,
                });
                if (!updatedCommunity || updatedCommunity.length === 0) {
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
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during update",
                        },
                    ],
                };
            }
        });
    }
    deleteCommunity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ communityId, creatorId, }) {
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
            const result = yield this.repository.deleteCommunity({
                communityId,
                creatorId,
            });
            if (result.length === 0) {
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
}
exports.CommunityService = CommunityService;
//# sourceMappingURL=CommunityService.js.map