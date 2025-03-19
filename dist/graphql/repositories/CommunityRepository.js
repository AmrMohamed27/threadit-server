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
exports.CommunityRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const utils_1 = require("../../lib/utils");
class CommunityRepository {
    static buildBaseQuery({ userId }) {
        return db_1.db
            .selectDistinct((0, utils_1.communitySelection)({ userId }))
            .from(schema_1.communities)
            .leftJoin(schema_1.posts, (0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.posts.communityId))
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.communities.creatorId, schema_1.users.id))
            .leftJoin(schema_1.communityMembers, (0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.communityMembers.communityId))
            .groupBy(schema_1.communities.id, schema_1.posts.id, schema_1.users.id, schema_1.communityMembers.communityId)
            .$dynamic();
    }
    static withPagination(_a) {
        return __awaiter(this, arguments, void 0, function* ({ qb, page, limit, sortBy, }) {
            return yield qb
                .limit(limit)
                .offset((page - 1) * limit)
                .orderBy(sortBy === "New"
                ? (0, drizzle_orm_1.desc)(schema_1.communities.createdAt)
                : sortBy === "Old"
                    ? (0, drizzle_orm_1.asc)(schema_1.communities.createdAt)
                    : schema_1.communities.name);
        });
    }
    static getAllCommunitiesWithFilters(_a) {
        return __awaiter(this, arguments, void 0, function* ({ sortBy, userId, limit, page, filters, }) {
            let qb = this.buildBaseQuery({ userId });
            qb = qb.where((0, drizzle_orm_1.and)(...filters));
            if (limit && page) {
                return yield this.withPagination({
                    qb,
                    limit,
                    page,
                    sortBy: sortBy !== null && sortBy !== void 0 ? sortBy : "Top",
                });
            }
            return yield qb;
        });
    }
    static countAllCommunitiesWithFilters(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filters, isExplore = false, }) {
            if (isExplore) {
                return yield db_1.db
                    .select({ count: (0, drizzle_orm_1.count)() })
                    .from(schema_1.communities)
                    .leftJoin(schema_1.communityMembers, (0, drizzle_orm_1.eq)(schema_1.communities.id, schema_1.communityMembers.communityId))
                    .where((0, drizzle_orm_1.and)(...filters));
            }
            else {
                return yield db_1.db
                    .select({ count: (0, drizzle_orm_1.count)() })
                    .from(schema_1.communities)
                    .where((0, drizzle_orm_1.and)(...filters));
            }
        });
    }
    static createCommunity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name, description, image, isPrivate, creatorId, }) {
            return yield db_1.db
                .insert(schema_1.communities)
                .values({ name, description, image, creatorId, isPrivate })
                .returning();
        });
    }
    static updateCommunity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, name, description, image, creatorId, }) {
            return yield db_1.db
                .update(schema_1.communities)
                .set({
                name: name === undefined ? schema_1.communities.name : name,
                description: description === undefined ? schema_1.communities.description : description,
                image: image === undefined ? schema_1.communities.image : image,
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communities.id, id), (0, drizzle_orm_1.eq)(schema_1.communities.creatorId, creatorId)))
                .returning();
        });
    }
    static deleteCommunity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ communityId, creatorId, }) {
            return yield db_1.db
                .delete(schema_1.communities)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communities.id, communityId), (0, drizzle_orm_1.eq)(schema_1.communities.creatorId, creatorId)));
        });
    }
}
exports.CommunityRepository = CommunityRepository;
//# sourceMappingURL=CommunityRepository.js.map