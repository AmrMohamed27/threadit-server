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
exports.VoteService = void 0;
class VoteService {
    constructor(repository, postRepository, commentRepository) {
        this.repository = repository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }
    createVote(_a) {
        return __awaiter(this, arguments, void 0, function* ({ postId, commentId, authorId, isUpvote, }) {
            if (!postId && !commentId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "You must provide a postId or commentId to create a vote",
                        },
                    ],
                };
            }
            if (postId && commentId) {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "You can only provide a postId or commentId, not both",
                        },
                    ],
                };
            }
            if (!authorId) {
                return {
                    errors: [
                        {
                            field: "authorId",
                            message: "You must be logged in to create a vote",
                        },
                    ],
                };
            }
            if (postId) {
                const post = yield this.postRepository.getSinglePost({
                    postId,
                    userId: authorId,
                    filters: [],
                });
                if (!post || post.length === 0) {
                    return {
                        errors: [
                            {
                                field: "postId",
                                message: "No post found with that id",
                            },
                        ],
                    };
                }
                const existingVote = yield this.repository.getIfUserVotedOnPost({
                    postId,
                    authorId,
                });
                if (existingVote.length > 0) {
                    return {
                        errors: [
                            {
                                field: "postId",
                                message: "You have already voted on this post",
                            },
                        ],
                    };
                }
                const newVote = yield this.repository.createVote({
                    isUpvote,
                    postId,
                    authorId,
                });
                if (!newVote || newVote.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "An error happened while creating a vote",
                            },
                        ],
                    };
                }
                return {
                    vote: newVote[0],
                };
            }
            else if (commentId) {
                const comment = yield this.commentRepository.getSingleComment({
                    userId: authorId,
                    commentId,
                    filters: [],
                });
                if (!comment || comment.length === 0) {
                    return {
                        errors: [
                            {
                                field: "commentId",
                                message: "No comment found with that id",
                            },
                        ],
                    };
                }
                const existingVote = yield this.repository.getIfUserVotedOnComment({
                    authorId,
                    commentId,
                });
                if (existingVote.length > 0) {
                    return {
                        errors: [
                            {
                                field: "commentId",
                                message: "You have already voted on this comment",
                            },
                        ],
                    };
                }
                const newVote = yield this.repository.createVote({
                    isUpvote,
                    commentId,
                    authorId,
                });
                if (!newVote || newVote.length === 0) {
                    return {
                        errors: [
                            {
                                field: "root",
                                message: "An error happened while creating a vote",
                            },
                        ],
                    };
                }
                return {
                    vote: newVote[0],
                };
            }
            else {
                return {
                    errors: [
                        {
                            field: "root",
                            message: "An error that should logically never happen, happened while creating a vote",
                        },
                    ],
                };
            }
        });
    }
    deleteVote(_a) {
        return __awaiter(this, arguments, void 0, function* ({ authorId, postId, commentId, }) {
            var _b;
            if (!postId && !commentId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "postId",
                            message: "You must provide a post id or comment id to delete a vote",
                        },
                    ],
                };
            }
            if (postId && commentId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "postId",
                            message: "You cannot provide both a post id and a comment id to delete a vote",
                        },
                    ],
                };
            }
            if (!authorId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "userId",
                            message: "You must be logged in to delete a vote",
                        },
                    ],
                };
            }
            try {
                const result = yield this.repository.deleteVote({
                    postId,
                    commentId,
                    authorId,
                });
                if (result.rowCount === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "No votes deleted",
                            },
                        ],
                    };
                }
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
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during deletion",
                        },
                    ],
                };
            }
        });
    }
    updateVote(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, isUpvote, postId, commentId, }) {
            var _b;
            if (!userId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must be logged in to update a vote",
                        },
                    ],
                };
            }
            if (!postId && !commentId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You must provide a postId or commentId to update a vote",
                        },
                    ],
                };
            }
            if (postId && commentId) {
                return {
                    success: false,
                    errors: [
                        {
                            field: "root",
                            message: "You can only provide a postId or commentId, not both",
                        },
                    ],
                };
            }
            try {
                const updatedVote = yield this.repository.updateVote({
                    postId,
                    commentId,
                    isUpvote,
                    userId,
                });
                if (!updatedVote || updatedVote.rowCount === 0) {
                    return {
                        success: false,
                        errors: [
                            {
                                field: "root",
                                message: "An error happened while updating the vote",
                            },
                        ],
                    };
                }
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
                            message: (_b = error.message) !== null && _b !== void 0 ? _b : "An Error occurred during update",
                        },
                    ],
                };
            }
        });
    }
}
exports.VoteService = VoteService;
//# sourceMappingURL=VoteService.js.map