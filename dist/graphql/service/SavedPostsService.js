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
exports.SavedPostsService = void 0;
class SavedPostsService {
    constructor(repository) {
        this.repository = repository;
    }
    savePost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, userId, }) {
            if (!userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to save a post.",
                        },
                    ],
                };
            }
            const result = yield this.repository.savePost({ postId, userId });
            if (result.length === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "An error occurred while saving the post.",
                        },
                    ],
                };
            }
            return {
                success: true,
            };
        });
    }
    unsavePost(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, userId, }) {
            if (!userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to unsave a post.",
                        },
                    ],
                };
            }
            const result = yield this.repository.unsavePost({ postId, userId });
            if (result.length === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "An error occurred while unsaving the post.",
                        },
                    ],
                };
            }
            return {
                success: true,
            };
        });
    }
    getSavedPostIds(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            if (!userId) {
                return [];
            }
            const saved = yield this.repository.getSavedPostIds({ userId });
            return saved.map((h) => h.postId);
        });
    }
}
exports.SavedPostsService = SavedPostsService;
//# sourceMappingURL=SavedPostsService.js.map