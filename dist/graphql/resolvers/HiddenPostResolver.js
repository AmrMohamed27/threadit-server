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
exports.HiddenPostsResolver = void 0;
const type_graphql_1 = require("type-graphql");
const types_1 = require("../types");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
let HiddenPostsResolver = class HiddenPostsResolver {
    hidePost(postId, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session.userId;
            if (!userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to hide a post.",
                        },
                    ],
                };
            }
            const result = yield ctx.db.insert(schema_1.hiddenPosts).values({
                userId,
                postId,
            });
            if (result.rowCount === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "An error occurred while hiding the post.",
                        },
                    ],
                };
            }
            return {
                success: true,
            };
        });
    }
    unhidePost(postId, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session.userId;
            if (!userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to unhide a post.",
                        },
                    ],
                };
            }
            const result = yield ctx.db
                .delete(schema_1.hiddenPosts)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.hiddenPosts.postId, postId), (0, drizzle_orm_1.eq)(schema_1.hiddenPosts.userId, userId)));
            if (result.rowCount === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "An error occurred while unhiding the post.",
                        },
                    ],
                };
            }
            return {
                success: true,
            };
        });
    }
    getHiddenPosts(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.req.session.userId;
            if (!userId) {
                return [];
            }
            const hidden = yield ctx.db
                .select({ postId: schema_1.hiddenPosts.postId })
                .from(schema_1.hiddenPosts)
                .where((0, drizzle_orm_1.eq)(schema_1.hiddenPosts.userId, userId));
            return hidden.map((h) => h.postId);
        });
    }
};
exports.HiddenPostsResolver = HiddenPostsResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => types_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Arg)("postId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], HiddenPostsResolver.prototype, "hidePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => types_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Arg)("postId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], HiddenPostsResolver.prototype, "unhidePost", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Number]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HiddenPostsResolver.prototype, "getHiddenPosts", null);
exports.HiddenPostsResolver = HiddenPostsResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], HiddenPostsResolver);
//# sourceMappingURL=HiddenPostResolver.js.map