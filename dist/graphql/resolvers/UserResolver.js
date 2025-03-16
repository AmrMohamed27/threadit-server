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
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const inputs_1 = require("../../types/inputs");
const resolvers_1 = require("../../types/resolvers");
let UserResolver = class UserResolver {
    registerUser(ctx, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, name } = userData;
            return yield ctx.Services.users.registerUser({
                email,
                password,
                name,
            });
        });
    }
    requestConfirmationCode(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.userId;
            return yield ctx.Services.users.requestConfirmationCode({ userId });
        });
    }
    confirmUser(ctx, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.userId;
            return yield ctx.Services.users.confirmUser({ userId, code });
        });
    }
    loginUser(ctx, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.userId;
            const { email, password } = userData;
            return yield ctx.Services.users.loginUser({
                userId,
                email,
                password,
            });
        });
    }
    requestPasswordReset(ctx, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.userId;
            return yield ctx.Services.users.requestPasswordReset({
                userId,
                email,
            });
        });
    }
    checkToken(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, token } = options;
            return yield ctx.Services.users.checkToken({ token, email });
        });
    }
    resetPassword(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, newPassword, token } = options;
            return yield ctx.Services.users.resetPassword({
                email,
                newPassword,
                token,
            });
        });
    }
    logoutUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    toggleConfirmed(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.userId;
            return yield ctx.Services.users.toggleConfirmed({ userId });
        });
    }
    me(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.userId;
            return yield ctx.Services.users.me({ userId });
        });
    }
    getUserById(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ctx.Services.users.fetchUserById({ userId: id });
        });
    }
    searchForUser(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchTerm, page, limit } = options;
            return yield ctx.Services.users.fetchUserSearchResults({
                searchTerm,
                page,
                limit,
            });
        });
    }
    getUserByName(ctx, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ctx.Services.users.fetchUserByName({ name });
        });
    }
    updateUserImage(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { image } = options;
            const userId = ctx.userId;
            return yield ctx.Services.users.updateUser({ image, userId });
        });
    }
    updateUserName(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = options;
            const userId = ctx.userId;
            return yield ctx.Services.users.updateUser({ name, userId });
        });
    }
};
exports.UserResolver = UserResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => inputs_1.UserResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("userData")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.RegisterInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "registerUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "requestConfirmationCode", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("code")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "confirmUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => inputs_1.UserResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("userData")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.LoginInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "loginUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("email")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "requestPasswordReset", null);
__decorate([
    (0, type_graphql_1.Query)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.CheckTokenInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "checkToken", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.ResetPasswordInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "resetPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logoutUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "toggleConfirmed", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.UserResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.UserResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUserById", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.UserResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.GetSearchResultInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "searchForUser", null);
__decorate([
    (0, type_graphql_1.Query)(() => inputs_1.UserResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("name", () => String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUserByName", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.UpdateUserImageInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUserImage", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => resolvers_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputs_1.UpdateUserNameInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUserName", null);
exports.UserResolver = UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
//# sourceMappingURL=UserResolver.js.map