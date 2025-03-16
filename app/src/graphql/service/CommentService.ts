import { and, eq, ilike, or, SQL } from "drizzle-orm";
import { buildCommentThread, mapCommentArrayResult } from "../../lib/utils";
import { comments } from "../../database/schema";
import { CommentRepository } from "../repositories/CommentRepository";
import { SortOptions } from "../../types/resolvers";

export class CommentService {
  constructor(private repository: typeof CommentRepository) {}
  private async commentsFetcher({
    sortBy,
    userId,
    limit,
    page,
    filters,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    limit: number;
    page: number;
    filters: SQL[];
  }) {
    const result = await this.repository.getAllCommentsWithFilters({
      sortBy,
      userId,
      limit,
      page,
      filters,
    });
    if (!result || result.length === 0) {
      return {
        errors: [{ field: "comments", message: "no comments found" }],
      };
    }
    const resultCount = await this.repository.countAllCommentsWithFilters({
      filters,
    });
    return {
      commentsArray: mapCommentArrayResult(result),
      count: resultCount[0].count,
    };
  }

  async fetchUserComments({
    userId,
    sortBy,
    limit,
    page,
  }: {
    userId?: number;
    sortBy?: SortOptions;
    limit: number;
    page: number;
  }) {
    // Check if user is logged in
    if (!userId) {
      return {
        errors: [
          {
            field: "userId",
            message: "You must be logged in to get your comments",
          },
        ],
      };
    }
    const filters = [eq(comments.authorId, userId)];
    const result = await this.commentsFetcher({
      sortBy,
      limit,
      page,
      filters,
      userId,
    });
    const countResult = await this.repository.countAllCommentsWithFilters({
      filters,
    });
    if (result.errors) {
      return result;
    }
    const flatList = result.commentsArray;
    const threadedComments = buildCommentThread(flatList);
    return {
      commentsArray: threadedComments,
      count: countResult[0].count,
    };
  }

  async fetchPostComments({
    postId,
    sortBy,
    searchTerm,
    userId,
  }: {
    postId: number;
    sortBy?: SortOptions;
    searchTerm?: string;
    userId?: number;
  }) {
    const filters = [
      searchTerm
        ? and(
            eq(comments.postId, postId),
            ilike(comments.content, "%" + searchTerm + "%")
          )!
        : eq(comments.postId, postId),
    ];
    const result = await this.commentsFetcher({
      sortBy,
      limit: 1000,
      page: 1,
      filters,
      userId,
    });
    const countResult = await this.repository.countAllCommentsWithFilters({
      filters,
    });
    if (result.errors) {
      return result;
    }
    const flatList = result.commentsArray;
    if (searchTerm) {
      // For search results just return a flat list
      return {
        commentsArray: flatList,
        count: countResult[0].count,
      };
    } else {
      const threadedComments = buildCommentThread(flatList);
      return {
        commentsArray: threadedComments,
        count: countResult[0].count,
      };
    }
  }

  async fetchCommentById({
    commentId,
    userId,
  }: {
    commentId: number;
    userId?: number;
  }) {
    const filters: SQL[] = [
      or(eq(comments.id, commentId), eq(comments.parentCommentId, commentId))!,
    ];
    const result = await this.commentsFetcher({
      userId,
      filters,
      limit: 1000,
      page: 1,
    });
    if (result.errors) {
      return result;
    }
    const flatList = result.commentsArray.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, parentCommentId: null };
      }
      return comment;
    });
    const threadedComments = buildCommentThread(flatList);
    const resultCount = await this.repository.countAllCommentsWithFilters({
      filters,
    });
    return {
      commentsArray: threadedComments,
      count: resultCount[0].count,
    };
  }

  async createComment({
    content,
    authorId,
    postId,
    parentCommentId,
  }: {
    content: string;
    authorId?: number;
    postId: number;
    parentCommentId?: number;
  }) {
    // Check if user is logged in
    if (!authorId) {
      return {
        errors: [
          {
            field: "authorId",
            message: "You must be logged in to create a comment",
          },
        ],
      };
    }
    try {
      const result = await this.repository.insertComment({
        content,
        authorId,
        postId,
        parentCommentId,
      });
      // handle creation error
      if (!result || result.length === 0) {
        return {
          errors: [
            {
              field: "root",
              message: "Error creating comment",
            },
          ],
        };
      }
      // Return the created comment
      return {
        comment: result[0],
      };
    } catch (error) {
      console.error(error);
      return {
        errors: [
          {
            field: "root",
            message: error.message ?? "An Error occurred during creation",
          },
        ],
      };
    }
  }

  async updateComment({
    authorId,
    commentId,
    content,
  }: {
    authorId?: number;
    commentId: number;
    content: string;
  }) {
    if (!authorId) {
      return {
        success: false,
        errors: [
          {
            field: "authorId",
            message: "You must be logged in to delete a comment",
          },
        ],
      };
    }
    const result = await this.repository.updateComment({
      content,
      commentId,
      authorId,
    });
    // handle update error
    if (!result || result.rowCount === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "Error updating comment",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }

  async deleteComment({
    authorId,
    commentId,
  }: {
    authorId?: number;
    commentId: number;
  }) {
    if (!authorId) {
      return {
        success: false,
        errors: [
          {
            field: "authorId",
            message: "You must be logged in to delete a comment",
          },
        ],
      };
    }
    const result = await this.repository.deleteComment({
      commentId,
      authorId,
    });
    // handle deletion error
    if (!result || result.rowCount === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "Error deleting comment",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }
}
