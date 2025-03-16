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
exports.UserRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../database/db");
const schema_1 = require("../database/schema");
class UserRepository {
    static registerUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, hashedPassword, name, }) {
            return yield db_1.db
                .insert(schema_1.users)
                .values({ email, password: hashedPassword, name })
                .returning();
        });
    }
    static getUserById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            return yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        });
    }
    static getUserByEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email }) {
            return yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        });
    }
    static getUserByName(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name }) {
            return yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.name, name));
        });
    }
    static getUserEmailAndConfirmed(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            return yield db_1.db
                .select({ email: schema_1.users.email, confirmed: schema_1.users.confirmed })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        });
    }
    static confirmUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            return yield db_1.db
                .update(schema_1.users)
                .set({ confirmed: true })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        });
    }
    static updatePassword(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, hashedPassword, }) {
            return db_1.db
                .update(schema_1.users)
                .set({ password: hashedPassword })
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        });
    }
    static setConfirmed(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, confirmed, }) {
            return yield db_1.db
                .update(schema_1.users)
                .set({
                confirmed,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        });
    }
    static searchUsers(_a) {
        return __awaiter(this, arguments, void 0, function* ({ searchTerm, limit, page, }) {
            return yield db_1.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.ilike)(schema_1.users.name, "%" + searchTerm + "%"))
                .limit(limit)
                .offset((page - 1) * limit)
                .orderBy((0, drizzle_orm_1.asc)(schema_1.users.name));
        });
    }
    static countUserSearchResults(_a) {
        return __awaiter(this, arguments, void 0, function* ({ searchTerm }) {
            return yield db_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.ilike)(schema_1.users.name, "%" + searchTerm + "%"));
        });
    }
    static updateUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name, image, userId, }) {
            return yield db_1.db
                .update(schema_1.users)
                .set({ name: name !== null && name !== void 0 ? name : schema_1.users.name, image: image !== null && image !== void 0 ? image : schema_1.users.image })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        });
    }
    static deleteUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            return yield db_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map