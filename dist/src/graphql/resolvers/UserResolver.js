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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const schema_1 = require("../../database/schema");
const User_1 = require("../types/User");
const argon2_1 = __importDefault(require("argon2"));
const drizzle_orm_1 = require("drizzle-orm");
const types_1 = require("../types");
const env_1 = require("../../env");
const uuid_1 = require("uuid");
const emailService_1 = require("../../email/emailService");
const checkMXRecords_1 = require("../../email/checkMXRecords");
let RegisterInput = class RegisterInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], RegisterInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], RegisterInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], RegisterInput.prototype, "password", void 0);
RegisterInput = __decorate([
    (0, type_graphql_1.InputType)()
], RegisterInput);
let LoginInput = class LoginInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], LoginInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], LoginInput.prototype, "password", void 0);
LoginInput = __decorate([
    (0, type_graphql_1.InputType)()
], LoginInput);
let ResetPasswordInput = class ResetPasswordInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ResetPasswordInput.prototype, "newPassword", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ResetPasswordInput.prototype, "token", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ResetPasswordInput.prototype, "email", void 0);
ResetPasswordInput = __decorate([
    (0, type_graphql_1.InputType)()
], ResetPasswordInput);
let CheckTokenInput = class CheckTokenInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CheckTokenInput.prototype, "token", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CheckTokenInput.prototype, "email", void 0);
CheckTokenInput = __decorate([
    (0, type_graphql_1.InputType)()
], CheckTokenInput);
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", Object)
], UserResponse.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [types_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
function registerErrorHandler(error) {
    if (error.constraint === "users_email_unique") {
        return {
            errors: [
                {
                    field: "email",
                    message: "A user with this email already exists",
                },
            ],
        };
    }
    if (error.constraint === "users_name_unique") {
        return {
            errors: [
                {
                    field: "name",
                    message: "A user with this username already exists",
                },
            ],
        };
    }
    return {
        errors: [
            {
                field: "root",
                message: error.message,
            },
        ],
    };
}
let UserResolver = class UserResolver {
    registerUser(ctx, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, name } = userData;
            const isValid = yield (0, checkMXRecords_1.checkMXRecords)(email);
            if (!isValid) {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "Email is not valid.",
                        },
                    ],
                };
            }
            const hashedPassword = yield argon2_1.default.hash(password);
            try {
                const newUser = yield ctx.db
                    .insert(schema_1.users)
                    .values({ email, password: hashedPassword, name })
                    .returning();
                const user = newUser[0];
                ctx.req.session.userId = user.id;
                return { user };
            }
            catch (error) {
                return registerErrorHandler(error);
            }
        });
    }
    requestConfirmationCode(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!ctx.req.session.userId) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "user",
                                message: "Please log in to confirm your email.",
                            },
                        ],
                    };
                }
                const result = yield ctx.db
                    .select()
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, ctx.req.session.userId));
                const { email, confirmed } = result[0];
                if (confirmed) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "confirmed",
                                message: "User is already confirmed.",
                            },
                        ],
                    };
                }
                const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
                yield ctx.redis.set(`confirmationCode:${email}`, confirmationCode, {
                    EX: 300,
                });
                yield (0, emailService_1.sendEmail)({
                    to: email,
                    subject: "Confirm your account",
                    text: `Your confirmation code is: ${confirmationCode}`,
                });
                return {
                    success: true,
                };
            }
            catch (error) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: error.message,
                        },
                    ],
                };
            }
        });
    }
    confirmUser(ctx, code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!ctx.req.session.userId) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "session",
                                message: "Please log in to confirm your email.",
                            },
                        ],
                    };
                }
                const result = yield ctx.db
                    .select()
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, ctx.req.session.userId));
                const { email, confirmed, id } = result[0];
                if (confirmed) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "confirmed",
                                message: "User is already confirmed.",
                            },
                        ],
                    };
                }
                const storedCode = yield ctx.redis.get(`confirmationCode:${email}`);
                if (!storedCode || storedCode !== code) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "code",
                                message: "Invalid or expired confirmation code.",
                            },
                        ],
                    };
                }
                yield ctx.db
                    .update(schema_1.users)
                    .set({ confirmed: true })
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
                yield ctx.redis.del(`confirmationCode:${email}`);
                return {
                    success: true,
                };
            }
            catch (error) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: error.message,
                        },
                    ],
                };
            }
        });
    }
    loginUser(ctx, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ctx.req.session.userId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "User is already logged in.",
                        },
                    ],
                };
            }
            const { email, password } = userData;
            const userExists = yield ctx.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
            if (!userExists || userExists.length === 0) {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "A user with this email does not exist",
                        },
                    ],
                };
            }
            const user = userExists[0];
            const verified = yield argon2_1.default.verify(user.password, password);
            if (!verified) {
                return {
                    errors: [{ field: "password", message: "Invalid credentials" }],
                };
            }
            ctx.req.session.userId = user.id;
            return { user };
        });
    }
    requestPasswordReset(ctx, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (ctx.req.session.userId) {
                    return {
                        success: false,
                        errors: [{ field: "root", message: "User is already logged in." }],
                    };
                }
                const result = yield ctx.db
                    .select()
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
                if (result.length === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "email",
                                message: "A user with this email does not exist.",
                            },
                        ],
                    };
                }
                const resetToken = (0, uuid_1.v4)();
                yield ctx.redis.set(`resetToken:${email}`, resetToken, { EX: 60 * 60 });
                yield (0, emailService_1.sendEmail)({
                    to: email,
                    subject: "Password Reset",
                    text: `Visit this link to reset your password: ${env_1.env.CORS_ORIGIN_FRONTEND}/forgot-password/${resetToken}?email=${email}`,
                });
                return {
                    success: true,
                };
            }
            catch (error) {
                return {
                    success: false,
                    errors: [{ field: "root", message: error.message }],
                };
            }
        });
    }
    checkToken(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, token } = options;
                const storedToken = yield ctx.redis.get(`resetToken:${email}`);
                if (!storedToken || storedToken !== token) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "token",
                                message: "Invalid or expired token.",
                            },
                        ],
                    };
                }
                return {
                    success: true,
                };
            }
            catch (error) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: error.message,
                        },
                    ],
                };
            }
        });
    }
    resetPassword(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, newPassword, token } = options;
                const storedToken = yield ctx.redis.get(`resetToken:${email}`);
                if (!storedToken || storedToken !== token) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "token",
                                message: "Invalid or expired token.",
                            },
                        ],
                    };
                }
                const hashedPassword = yield argon2_1.default.hash(newPassword);
                yield ctx.db
                    .update(schema_1.users)
                    .set({ password: hashedPassword })
                    .where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
                yield ctx.redis.del(`resetToken:${email}`);
                return {
                    success: true,
                };
            }
            catch (error) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: error.message,
                        },
                    ],
                };
            }
        });
    }
    logoutUser(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => ctx.req.session.destroy((err) => {
                ctx.res.clearCookie(env_1.env.COOKIE_NAME);
                if (err) {
                    console.error(err);
                    resolve(false);
                }
                resolve(true);
            }));
        });
    }
    toggleConfirmed(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = ctx.req.session.userId;
                if (!id) {
                    return false;
                }
                const user = yield ctx.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
                const confirmed = !user[0].confirmed;
                yield ctx.db.update(schema_1.users).set({ confirmed }).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
                return true;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    me(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Session object:", ctx.req.session);
            console.log("User ID in session:", ctx.req.session.userId);
            if (!ctx.req.session.userId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "User is not logged in",
                        },
                    ],
                };
            }
            const user = yield ctx.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, ctx.req.session.userId));
            return { user: user[0] };
        });
    }
};
exports.UserResolver = UserResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("userData")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RegisterInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "registerUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => types_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "requestConfirmationCode", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => types_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("code")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "confirmUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("userData")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, LoginInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "loginUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => types_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("email")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "requestPasswordReset", null);
__decorate([
    (0, type_graphql_1.Query)(() => types_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CheckTokenInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "checkToken", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => types_1.ConfirmResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ResetPasswordInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "resetPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
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
    (0, type_graphql_1.Query)(() => UserResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
exports.UserResolver = UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
//# sourceMappingURL=UserResolver.js.map