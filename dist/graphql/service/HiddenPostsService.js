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
exports.HiddenPostsService = void 0;
class HiddenPostsService {
    constructor(repository) {
        this.repository = repository;
    }
    hidePost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, userId, }) {
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
            const result = yield this.repository.hidePost({ postId, userId });
            if (!result || result.length === 0) {
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
    unhidePost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, userId, }) {
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
            const result = yield this.repository.unhidePost({ postId, userId });
            if (!result) {
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
    fetchHiddenPostsIds(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, }) {
            if (!userId) {
                return [];
            }
            const hidden = yield this.repository.getHiddenPostsIds({ userId });
            return hidden.map((h) => h.postId);
        });
    }
}
exports.HiddenPostsService = HiddenPostsService;
//# sourceMappingURL=HiddenPostsService.js.map