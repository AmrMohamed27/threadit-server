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
import { comments, posts, returnedComment } from "../../database/schema";
import { Comment } from "../types/Comment";
import { desc, eq } from "drizzle-orm";
import { ConfirmResponse, FieldError, MyContext } from "../types";

// Comment Response type
@ObjectType()
class CommentResponse {
  @Field(() => Comment, { nullable: true })
  comment?: returnedComment;
  @Field(() => [Comment], { nullable: true })
  commentsArray?: returnedComment[];
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
// Create Comment Input Type
@InputType()
class CreateCommentInput {
  @Field()
  content: string;
  @Field()
  postId: number;
}

// Update Comment Input Type
@InputType()
class UpdateCommentInput {
  @Field()
  id: number;
  @Field()
  content: string;
}

@Resolver()
export class CommentResolver {
  // Query to get all comments of a user
  @Query(() => CommentResponse)
  // Context object contains request and response headers and database connection, function returns an array of comments or errors
  async getUserComments(@Ctx() ctx: MyContext): Promise<CommentResponse> {
    const userId = ctx.req.session.userId;
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
    // Fetch all comments from database
    const allComments = await ctx.db
      .select()
      .from(comments)
      .where(eq(comments.authorId, userId))
      .orderBy(desc(comments.createdAt));
    // Handle not found error
    if (!allComments || allComments.length === 0) {
      return {
        errors: [
          {
            field: "comments",
            message: "No comments found",
          },
        ],
      };
    }
    // Return comments array
    return {
      commentsArray: allComments,
    };
  }

  // Query to get all comments of a post
  @Query(() => CommentResponse)
  async getPostComments(
    @Ctx() ctx: MyContext,
    @Arg("postId", () => Int) postId: number
  ): Promise<CommentResponse> {
    // Fetch comments by post id from database
    const allComments = await ctx.db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId));
    // Handle not found error
    if (!allComments) {
      return {
        errors: [
          {
            field: "id",
            message: "An error happened while fetching comments",
          },
        ],
      };
    }
    // Return comment
    return {
      commentsArray: allComments,
    };
  }

  // Query to get a comment by id
  @Query(() => CommentResponse)
  async getComment(
    @Ctx() ctx: MyContext,
    @Arg("id", () => Int) id: number
  ): Promise<CommentResponse> {
    // Fetch comment by id from database
    const result = await ctx.db
      .select()
      .from(comments)
      .where(eq(comments.id, id));
    // Handle not found error
    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "id",
            message: "No comment found with that id",
          },
        ],
      };
    }
    // Return comment
    return {
      comment: result[0],
    };
  }

  // Mutation to create a new comment
  @Mutation(() => CommentResponse)
  async createComment(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CreateCommentInput
  ): Promise<CommentResponse> {
    // Destructure input
    const { content, postId } = options;
    // Get author id from session
    const authorId = ctx.req.session.userId;
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
    // Check if the post exists
    const postExists = await ctx.db
      .select()
      .from(posts)
      .where(eq(posts.id, postId));
    if (!postExists || postExists.length === 0) {
      return {
        errors: [
          {
            field: "postId",
            message: "No post found with that id",
          },
        ],
      };
    }
    // Create new comment and insert it in database
    try {
      const newComment = await ctx.db
        .insert(comments)
        .values({ content, authorId, postId })
        .returning();
      // handle creation error
      if (!newComment || newComment.length === 0) {
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
        comment: newComment[0],
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
  // Mutation to delete a comment
  @Mutation(() => ConfirmResponse)
  async deleteComment(
    @Ctx() ctx: MyContext,
    @Arg("id") id: number
  ): Promise<ConfirmResponse> {
    const authorId = ctx.req.session.userId;
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
    const result = await ctx.db
      .select()
      .from(comments)
      .where(eq(comments.id, id));
    if (!result || result.length === 0) {
      return {
        success: false,
        errors: [
          {
            field: "id",
            message: "No comment found with that id",
          },
        ],
      };
    }
    const comment = result[0];
    if (comment.authorId !== authorId) {
      return {
        success: false,
        errors: [
          {
            field: "authorId",
            message: "You are not authorized to delete this comment",
          },
        ],
      };
    }
    try {
      const result = await ctx.db.delete(comments).where(eq(comments.id, id));
      if (result.rowCount === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message: "No comments deleted",
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
  // Mutation to update a comment
  @Mutation(() => ConfirmResponse, { nullable: true })
  async updateComment(
    @Ctx() ctx: MyContext,
    @Arg("options") options: UpdateCommentInput
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { id, content } = options;
    // Get author id from session
    const authorId = ctx.req.session.userId;
    // Check if user is logged in
    if (!authorId) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must be logged in to update a comment",
          },
        ],
      };
    }
    // Fetch comment by id from database
    const result = await ctx.db
      .select()
      .from(comments)
      .where(eq(comments.id, id));
    // Handle not found error
    if (!result || result.length === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "No comment found with that id",
          },
        ],
      };
    }
    // Check if user is authorized to update the comment
    const comment = result[0];
    if (comment.authorId !== authorId) {
      return {
        success: false,
        errors: [
          {
            field: "authorId",
            message: "You are not authorized to update this comment",
          },
        ],
      };
    }
    // Check if title or content is the same as the original
    if (comment.content === content) {
      return {
        success: false,
        errors: [
          {
            field: "content",
            message: "Content is the same as the original",
          },
        ],
      };
    }
    try {
      // Update comment
      const updatedComment = await ctx.db
        .update(comments)
        .set({
          content: content,
        })
        .where(eq(comments.id, id))
        .returning();
      if (!updatedComment || updatedComment.length === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message: "An error happened while updating the comment",
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
