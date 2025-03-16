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
exports.CommunityMembersService = void 0;
const db_1 = require("../database/db");
const schema_1 = require("../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class CommunityMembersService {
    constructor(repository) {
        this.repository = repository;
    }
    joinCommunity(communityId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "creatorId",
                            message: "You must be logged in to join a community",
                        },
                    ],
                };
            }
            try {
                const result = yield this.repository.joinCommunity(communityId, userId);
                if (result.rowCount === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "Error joining community",
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
                            message: (_a = error.message) !== null && _a !== void 0 ? _a : "An Error occurred during creation",
                        },
                    ],
                };
            }
        });
    }
    leaveCommunity(communityId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "userId",
                            message: "You must be logged in to leave a community",
                        },
                    ],
                };
            }
            const result = yield db_1.db
                .select()
                .from(schema_1.communities)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communities.id, communityId), (0, drizzle_orm_1.eq)(schema_1.communities.creatorId, userId)));
            if (result.length > 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You cannot leave your own community",
                        },
                    ],
                };
            }
            try {
                const result = yield this.repository.leaveCommunity(communityId, userId);
                if (result.rowCount === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "Couldn't leave community. Please make sure a community with this id exists and you are a member of it.",
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
}
exports.CommunityMembersService = CommunityMembersService;
//# sourceMappingURL=CommunityMembersService.js.map