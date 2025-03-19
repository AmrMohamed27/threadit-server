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
exports.CommunityMembersRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
class CommunityMembersRepository {
    static joinCommunity(communityId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db
                .insert(schema_1.communityMembers)
                .values({
                communityId,
                userId,
            })
                .returning();
        });
    }
    static leaveCommunity(communityId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db
                .delete(schema_1.communityMembers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.communityMembers.communityId, communityId), (0, drizzle_orm_1.eq)(schema_1.communityMembers.userId, userId)));
        });
    }
}
exports.CommunityMembersRepository = CommunityMembersRepository;
//# sourceMappingURL=CommunityMembersRepository.js.map