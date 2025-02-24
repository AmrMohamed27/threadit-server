import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import {
  votes,
  posts,
  ReturnedVote,
  comments,
  ReturnedPost,
} from "../../database/schema";
import { Vote } from "../types/Vote";
import { and, eq } from "drizzle-orm";
import { ConfirmResponse, FieldError, MyContext } from "../types";
import { Post } from "../types/Post";

// Vote Response type
@ObjectType()
class VoteResponse {
  @Field(() => Vote, { nullable: true })
  vote?: ReturnedVote;
  @Field(() => [Vote], { nullable: true })
  votesArray?: ReturnedVote[];
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
// Posts and Comments Response Type
@ObjectType()
class VotedPostsResponse {
  @Field(() => [Post], { nullable: true })
  posts?: ReturnedPost[];
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
// Create Vote Input Type
@InputType()
class CreateVoteInput {
  @Field({ nullable: true })
  postId?: number;
  @Field({ nullable: true })
  commentId?: number;
  @Field()
  isUpvote: boolean;
}

// Update Vote Input Type
@InputType()
class UpdateVoteInput {
  @Field()
  id: number;
  @Field()
  isUpvote: boolean;
}

const PostsPartialObject = {
  id: posts.id,
  title: posts.title,
  content: posts.content,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  authorId: posts.authorId,
  communityId: posts.communityId,
};

@Resolver()
export class VoteResolver {
  // Query to get all posts the user has upvoted
  @Query(() => VotedPostsResponse)
  // Context object contains request and response headers and database connection, function returns an array of votes or errors
  async getUserVotedPosts(@Ctx() ctx: MyContext): Promise<VotedPostsResponse> {
    // Check if user is logged in
    const userId = ctx.req.session.userId;
    if (!userId) {
      return {
        errors: [
          {
            field: "userId",
            message: "You must be logged in to get your votes",
          },
        ],
      };
    }
    // Fetch all votes from database
    const allPosts = await ctx.db
      .select(PostsPartialObject)
      .from(posts)
      .innerJoin(votes, eq(votes.postId ?? -4, posts.id))
      .where(and(eq(votes.userId, userId), eq(votes.isUpvote, true)));
    // Handle not found error
    if (!allPosts || allPosts.length === 0) {
      return {
        errors: [
          {
            field: "votes",
            message: "No votes found",
          },
        ],
      };
    }

    // Return votes array
    return {
      posts: allPosts,
    };
  }

  // Query to get all votes of a post
  @Query(() => VoteResponse)
  async getPostVotes(
    @Ctx() ctx: MyContext,
    @Arg("postId", () => Int) postId: number
  ): Promise<VoteResponse> {
    // Fetch votes by post id from database
    const allVotes = await ctx.db
      .select()
      .from(votes)
      .where(eq(votes.postId, postId));
    // Handle not found error
    if (!allVotes) {
      return {
        errors: [
          {
            field: "id",
            message: "An error happened while fetching votes",
          },
        ],
      };
    }
    // Return votes array
    return {
      votesArray: allVotes,
    };
  }
  // Query to get all votes of a comment
  @Query(() => VoteResponse)
  async getCommentVotes(
    @Ctx() ctx: MyContext,
    @Arg("commentId", () => Int) commentId: number
  ): Promise<VoteResponse> {
    // Fetch votes by comment id from database
    const allVotes = await ctx.db
      .select()
      .from(votes)
      .where(eq(votes.commentId, commentId));
    // Handle not found error
    if (!allVotes) {
      return {
        errors: [
          {
            field: "id",
            message: "An error happened while fetching votes",
          },
        ],
      };
    }
    // Return votes array
    return {
      votesArray: allVotes,
    };
  }

  // Mutation to create a new vote
  @Mutation(() => VoteResponse)
  async createVote(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CreateVoteInput
  ): Promise<VoteResponse> {
    // Destructure input
    const { isUpvote, postId, commentId } = options;
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
    // Get author id from session
    const authorId = ctx.req.session.userId;
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
      const post = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.id, postId));
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
      const existingVote = await ctx.db
        .select()
        .from(votes)
        .where(and(eq(votes.userId, authorId), eq(votes.postId, postId)));
      if (existingVote.length > 0) {
        // If the new vote is the same as the existing vote, delete the existing vote
        if (isUpvote === existingVote[0].isUpvote) {
          await ctx.db.delete(votes).where(eq(votes.id, existingVote[0].id));
        }
        // If the new vote is different from the existing vote, update the existing vote
        else {
          await ctx.db
            .update(votes)
            .set({
              isUpvote,
            })
            .where(eq(votes.id, existingVote[0].id));
        }
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
      const newVote = await ctx.db
        .insert(votes)
        .values({
          userId: authorId,
          postId: postId,
          isUpvote: isUpvote,
        })
        .returning();
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
      const comment = await ctx.db
        .select()
        .from(comments)
        .where(eq(comments.id, commentId));
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
      const existingVote = await ctx.db
        .select()
        .from(votes)
        .where(and(eq(votes.userId, authorId), eq(votes.commentId, commentId)));
      if (existingVote.length > 0) {
        await ctx.db.delete(votes).where(eq(votes.id, existingVote[0].id));
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
      const newVote = await ctx.db
        .insert(votes)
        .values({
          userId: authorId,
          commentId: commentId,
          isUpvote: isUpvote,
        })
        .returning();
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
    } else {
      // Handle a case that should never happen to make typescript happy
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
  // Mutation to delete a vote
  @Mutation(() => ConfirmResponse)
  async deleteVote(
    @Ctx() ctx: MyContext,
    @Arg("id", () => Int) id: number
  ): Promise<ConfirmResponse> {
    // Check if user is logged in
    const userId = ctx.req.session.userId;
    if (!userId) {
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
    // Check if the vote exists
    const result = await ctx.db.select().from(votes).where(eq(votes.id, id));
    if (!result || result.length === 0) {
      return {
        success: false,
        errors: [
          {
            field: "id",
            message: "No vote found with that id",
          },
        ],
      };
    }
    const vote = result[0];
    // Check if the user is authorized to delete the vote
    if (vote.userId !== userId) {
      return {
        success: false,
        errors: [
          {
            field: "userId",
            message: "You are not authorized to delete this vote",
          },
        ],
      };
    }
    try {
      const result = await ctx.db.delete(votes).where(eq(votes.id, id));
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
  // Mutation to update a vote
  @Mutation(() => ConfirmResponse, { nullable: true })
  async updateVote(
    @Ctx() ctx: MyContext,
    @Arg("options") options: UpdateVoteInput
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { id, isUpvote } = options;
    // Get author id from session
    const userId = ctx.req.session.userId;
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
    // Fetch vote by id from database
    const result = await ctx.db.select().from(votes).where(eq(votes.id, id));
    // Handle not found error
    if (!result || result.length === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "No vote found with that id",
          },
        ],
      };
    }
    // Check if user is authorized to update the vote
    const vote = result[0];
    if (vote.userId !== userId) {
      return {
        success: false,
        errors: [
          {
            field: "userId",
            message: "You are not authorized to update this vote",
          },
        ],
      };
    }
    // Check if vote is the same as the original
    if (vote.isUpvote === isUpvote) {
      return {
        success: false,
        errors: [
          {
            field: "isUpvote",
            message: "Vote is the same as the original",
          },
        ],
      };
    }
    try {
      // Update vote
      const updatedVote = await ctx.db
        .update(votes)
        .set({
          isUpvote,
        })
        .where(eq(votes.id, id))
        .returning();
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
