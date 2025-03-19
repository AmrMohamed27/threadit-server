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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const argon2_1 = __importDefault(require("argon2"));
const redis_1 = require("../../redis");
const uuid_1 = require("uuid");
const checkMXRecords_1 = require("../../email/checkMXRecords");
const emailService_1 = require("../../email/emailService");
const env_1 = require("../../env");
const utils_1 = require("../../lib/utils");
const emailTemplates_1 = require("../../email/emailTemplates");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserService {
    constructor(repository) {
        this.repository = repository;
    }
    verifyJwt(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
                return decoded;
            }
            catch (error) {
                console.error("Error verifying JWT:", error);
                return null;
            }
        });
    }
    registerUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, password, name, }) {
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
                const newUser = yield this.repository.registerUser({
                    email,
                    hashedPassword,
                    name,
                });
                const user = newUser[0];
                const token = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.env.JWT_SECRET, {
                    expiresIn: "30d",
                });
                yield this.requestConfirmationCode({ userId: user.id });
                return { user, token };
            }
            catch (error) {
                return (0, utils_1.registerErrorHandler)(error);
            }
        });
    }
    requestConfirmationCode(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, }) {
            if (!userId) {
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
            try {
                const result = yield this.repository.getUserEmailAndConfirmed({ userId });
                if (!result || result.length === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "user",
                                message: "No user found with that id.",
                            },
                        ],
                    };
                }
                const { email, confirmed, name } = result[0];
                if (confirmed === true) {
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
                yield redis_1.redisClient.set(`confirmationCode:${email}`, confirmationCode, {
                    EX: 300,
                });
                yield (0, emailService_1.sendEmail)({
                    to: email,
                    subject: "Confirm your account",
                    html: (0, emailTemplates_1.confirmEmailTemplate)({ name, confirmationCode }),
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
    confirmUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, code }) {
            try {
                if (!userId) {
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
                const result = yield this.repository.getUserEmailAndConfirmed({ userId });
                if (!result || result.length === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "user",
                                message: "No user found with that id.",
                            },
                        ],
                    };
                }
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
                const storedCode = yield redis_1.redisClient.get(`confirmationCode:${email}`);
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
                yield this.repository.confirmUser({ userId });
                yield redis_1.redisClient.del(`confirmationCode:${email}`);
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
    loginUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, email, password, }) {
            if (userId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "User is already logged in.",
                        },
                    ],
                };
            }
            const result = yield this.repository.getUserByEmail({ email });
            if (!result || result.length === 0) {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "A user with this email does not exist",
                        },
                    ],
                };
            }
            const user = result[0];
            const verified = yield argon2_1.default.verify(user.password, password);
            if (!verified) {
                return {
                    errors: [{ field: "password", message: "Invalid credentials" }],
                };
            }
            if (!user.confirmed) {
                yield this.requestConfirmationCode({ userId: user.id });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.env.JWT_SECRET, {
                expiresIn: "30d",
            });
            return { user, token };
        });
    }
    requestPasswordReset(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, email, }) {
            try {
                if (userId) {
                    return {
                        success: false,
                        errors: [{ field: "root", message: "User is already logged in." }],
                    };
                }
                const result = yield this.repository.getUserByEmail({ email });
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
                yield redis_1.redisClient.set(`resetToken:${email}`, resetToken, { EX: 60 * 60 });
                yield (0, emailService_1.sendEmail)({
                    to: email,
                    subject: "Password Reset",
                    html: (0, emailTemplates_1.resetPasswordTemplate)({
                        name: result[0].name,
                        actionUrl: `${env_1.env.CORS_ORIGIN_FRONTEND}/forgot-password/${resetToken}?email=${email}`,
                    }),
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
    checkToken(_a) {
        return __awaiter(this, arguments, void 0, function* ({ token, email }) {
            try {
                const storedToken = yield redis_1.redisClient.get(`resetToken:${email}`);
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
    resetPassword(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, newPassword, token, }) {
            var _b;
            try {
                const storedToken = yield redis_1.redisClient.get(`resetToken:${email}`);
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
                yield this.repository.updatePassword({ email, hashedPassword });
                yield redis_1.redisClient.del(`resetToken:${email}`);
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
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An error occurred during password reset",
                        },
                    ],
                };
            }
        });
    }
    toggleConfirmed(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            try {
                if (!userId) {
                    return false;
                }
                const user = yield this.repository.getUserById({ userId });
                const confirmed = !user[0].confirmed;
                yield this.repository.setConfirmed({ userId, confirmed });
                return true;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    me(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "User is not logged in",
                        },
                    ],
                };
            }
            const result = yield this.repository.getUserById({ userId });
            if (!result || result.length === 0) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "No user found with that id -which should not happen-",
                        },
                    ],
                };
            }
            return {
                user: result[0],
            };
        });
    }
    fetchUserById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            const result = yield this.repository.getUserById({ userId });
            if (!result || result.length === 0) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "No user found with that id.",
                        },
                    ],
                };
            }
            return {
                user: result[0],
            };
        });
    }
    fetchUserByName(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name }) {
            const result = yield this.repository.getUserByName({ name });
            if (!result || result.length === 0) {
                return {
                    errors: [
                        {
                            field: "name",
                            message: "No user found with that name.",
                        },
                    ],
                };
            }
            return {
                user: result[0],
            };
        });
    }
    fetchUserSearchResults(_a) {
        return __awaiter(this, arguments, void 0, function* ({ searchTerm, page, limit, }) {
            const result = yield this.repository.searchUsers({
                searchTerm,
                limit,
                page,
            });
            if (!result || result.length === 0) {
                return {
                    errors: [
                        {
                            field: "posts",
                            message: "No users found",
                        },
                    ],
                };
            }
            const resultCount = yield this.repository.countUserSearchResults({
                searchTerm,
            });
            return {
                userArray: result,
                count: resultCount[0].count,
            };
        });
    }
    updateUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ image, name, userId, }) {
            var _b;
            if (!userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to update a user",
                        },
                    ],
                };
            }
            try {
                yield this.repository.updateUser({ image, name, userId });
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
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An error occurred during changing profile picture",
                        },
                    ],
                };
            }
        });
    }
    deleteUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            var _b;
            try {
                yield this.repository.deleteUser({ userId });
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
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An error occurred during changing profile picture",
                        },
                    ],
                };
            }
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map