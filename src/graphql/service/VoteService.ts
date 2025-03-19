import { VoteResponse } from "../../types/inputs";
import { VoteRepository } from "../repositories/VoteRepository";
import { PostRepository } from "../repositories/PostRespository";
import { CommentRepository } from "../repositories/CommentRepository";

export class VoteService {
  constructor(
    private repository: typeof VoteRepository,
    private postRepository: typeof PostRepository,
    private commentRepository: typeof CommentRepository
  ) {}

  async createVote({
    postId,
    commentId,
    authorId,
    isUpvote,
  }: {
    postId?: number;
    commentId?: number;
    authorId?: number;
    isUpvote: boolean;
  }): Promise<VoteResponse> {
    // Check if postId or commentId is provided
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
    // Check if both postId and commentId are provided
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
    // Check if user is logged in
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
    // Voting for a post
    if (postId) {
      // Fetch post by id from database
      const post = await this.postRepository.getSinglePost({
        postId,
        userId: authorId,
        filters: [],
      });
      // Handle not found error
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
      //   Check if a vote already exists
      const existingVote = await this.repository.getIfUserVotedOnPost({
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
      // Create vote
      const newVote = await this.repository.createVote({
        isUpvote,
        postId,
        authorId,
      });
      // Handle insertion error
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
      // Return vote
      return {
        vote: newVote[0],
      };
    }
    // Voting for a comment
    else if (commentId) {
      // Fetch comment by id from database
      const comment = await this.commentRepository.getSingleComment({
        userId: authorId,
        commentId,
        filters: [],
      });
      // Handle not found error
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
      //   Check if a vote already exists
      const existingVote = await this.repository.getIfUserVotedOnComment({
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
      // Create vote
      const newVote = await this.repository.createVote({
        isUpvote,
        commentId,
        authorId,
      });
      // Handle insertion error
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
      // Return vote
      return {
        vote: newVote[0],
      };
    }
    // Handle a case that should never happen to make typescript happy
    else {
      return {
        errors: [
          {
            field: "root",
            message:
              "An error that should logically never happen, happened while creating a vote",
          },
        ],
      };
    }
  }

  async deleteVote({
    authorId,
    postId,
    commentId,
  }: {
    authorId?: number;
    postId?: number;
    commentId?: number;
  }) {
    // Check if post id or comment id is provided
    if (!postId && !commentId) {
      return {
        success: false,
        errors: [
          {
            field: "postId",
            message:
              "You must provide a post id or comment id to delete a vote",
          },
        ],
      };
    }
    // Check if both post id and comment id are provided
    if (postId && commentId) {
      return {
        success: false,
        errors: [
          {
            field: "postId",
            message:
              "You cannot provide both a post id and a comment id to delete a vote",
          },
        ],
      };
    }
    // Check if user is logged in
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
      const result = await this.repository.deleteVote({
        postId,
        commentId,
        authorId,
      });
      if (!result) {
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
    } catch (error) {
      console.error(error);
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: error.message ?? "An Error occurred during deletion",
          },
        ],
      };
    }
  }
  async updateVote({
    userId,
    isUpvote,
    postId,
    commentId,
  }: {
    userId?: number;
    postId?: number;
    commentId?: number;
    isUpvote: boolean;
  }) {
    // Check if user is logged in
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
    // Check if postId or commentId is provided
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
    // Check if both postId and commentId are provided
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
      // Update vote
      const updatedVote = await this.repository.updateVote({
        postId,
        commentId,
        isUpvote,
        userId,
      });
      if (!updatedVote || updatedVote.length === 0) {
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
    } catch (error) {
      console.error(error);
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: error.message ?? "An Error occurred during update",
          },
        ],
      };
    }
  }
}
