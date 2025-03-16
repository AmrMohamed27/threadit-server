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
exports.SavedPostsRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../database/db");
const schema_1 = require("../database/schema");
class SavedPostsRepository {
    static savePost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, userId, }) {
            return yield db_1.db.insert(schema_1.savedPosts).values({ postId, userId });
        });
    }
    static unsavePost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, userId, }) {
            return yield db_1.db
                .delete(schema_1.savedPosts)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.savedPosts.postId, postId), (0, drizzle_orm_1.eq)(schema_1.savedPosts.userId, userId)));
        });
    }
    static getSavedPostIds(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            return yield db_1.db
                .select({ postId: schema_1.savedPosts.postId })
                .from(schema_1.savedPosts)
                .where((0, drizzle_orm_1.eq)(schema_1.savedPosts.userId, userId));
        });
    }
}
exports.SavedPostsRepository = SavedPostsRepository;
//# sourceMappingURL=SavedPostsRepository.js.map