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
import { posts, returnedPost } from "../../database/schema";
import { Post } from "../types/Post";
import { desc, eq } from "drizzle-orm";
import { ConfirmResponse, FieldError, MyContext } from "../types";

// Post Response type
@ObjectType()
class PostResponse {
  @Field(() => Post, { nullable: true })
  post?: returnedPost;
  @Field(() => [Post], { nullable: true })
  postsArray?: returnedPost[];
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

// Create Post Input Type
@InputType()
class CreatePostInput {
  @Field()
  title: string;
  @Field()
  content: string;
}
// Update Post Input Type
@InputType()
class UpdatePostInput {
  @Field()
  id: number;
  @Field({ nullable: true })
  title?: string;
  @Field({ nullable: true })
  content?: string;
}
// Get User's Posts Input Type
@InputType()
class GetUserPostsInput {
  @Field({ nullable: true })
  userId?: number;
}

@Resolver()
export class PostResolver {
  // Query to get all posts
  @Query(() => PostResponse)
  // Context object contains request and response headers and database connection, function returns an array of posts or errors
  async getAllPosts(@Ctx() ctx: MyContext): Promise<PostResponse> {
    // Fetch all posts from database
    const allPosts = await ctx.db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));
    // Handle not found error
    if (!allPosts || allPosts.length === 0) {
      return {
        errors: [
          {
            field: "posts",
            message: "No posts found",
          },
        ],
      };
    }
    // Return posts array
    return {
      postsArray: allPosts,
    };
  }

  // Query to get all the user's posts
  @Query(() => PostResponse)
  // Context object contains request and response headers and database connection, function returns an array of posts or errors
  async getUserPosts(
    @Ctx() ctx: MyContext,
    @Arg("userId", { nullable: true }) userId?: number
  ): Promise<PostResponse> {
    const authorId = userId ? userId : ctx.req.session.userId;
    if (!authorId) {
      return {
        errors: [
          {
            field: "authorId",
            message: "You must be logged in to get your posts",
          },
        ],
      };
    }
    // Fetch all posts from database
    const allPosts = await ctx.db
      .select()
      .from(posts)
      .where(eq(posts.authorId, authorId))
      .orderBy(desc(posts.createdAt));
    // Handle not found error
    if (!allPosts || allPosts.length === 0) {
      return {
        errors: [
          {
            field: "posts",
            message: "No posts found",
          },
        ],
      };
    }
    // Return posts array
    return {
      postsArray: allPosts,
    };
  }

  // Query to get a post by id
  @Query(() => PostResponse)
  async getPost(
    @Ctx() ctx: MyContext,
    @Arg("id", () => Int) id: number
  ): Promise<PostResponse> {
    // Fetch post by id from database
    const result = await ctx.db.select().from(posts).where(eq(posts.id, id));
    // Handle not found error
    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "id",
            message: "No post found with that id",
          },
        ],
      };
    }
    // Return post
    return {
      post: result[0],
    };
  }

  // Mutation to create a new post
  @Mutation(() => PostResponse)
  async createPost(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CreatePostInput
  ): Promise<PostResponse> {
    // Destructure input
    const { title, content } = options;
    // Get author id from session
    const authorId = ctx.req.session.userId;
    // Check if user is logged in
    if (!authorId) {
      return {
        errors: [
          {
            field: "authorId",
            message: "You must be logged in to create a post",
          },
        ],
      };
    }
    console.log(authorId);
    // Create new post and insert it in database
    try {
      const newPost = await ctx.db
        .insert(posts)
        .values({ title, content, authorId })
        .returning();
      // handle creation error
      if (!newPost || newPost.length === 0) {
        return {
          errors: [
            {
              field: "root",
              message: "Error creating post",
            },
          ],
        };
      }
      // Return the created post
      return {
        post: newPost[0],
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

  // Mutation to delete a post
  @Mutation(() => ConfirmResponse)
  async deletePost(
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
            message: "You must be logged in to delete a post",
          },
        ],
      };
    }
    const result = await ctx.db.select().from(posts).where(eq(posts.id, id));
    if (!result || result.length === 0) {
      return {
        success: false,
        errors: [
          {
            field: "id",
            message: "No post found with that id",
          },
        ],
      };
    }
    const post = result[0];
    if (post.authorId !== authorId) {
      return {
        success: false,
        errors: [
          {
            field: "authorId",
            message: "You are not authorized to delete this post",
          },
        ],
      };
    }
    try {
      const result = await ctx.db.delete(posts).where(eq(posts.id, id));
      console.log(result);
      if (result.rowCount === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message: "No posts deleted",
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

  // Mutation to update a post
  @Mutation(() => ConfirmResponse)
  async updatePost(
    @Ctx() ctx: MyContext,
    @Arg("options") options: UpdatePostInput
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { id, title, content } = options;
    // Check if title or content is provided
    if (!title && !content) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must provide a title or content to update",
          },
        ],
      };
    }
    // Get author id from session
    const authorId = ctx.req.session.userId;
    // Check if user is logged in
    if (!authorId) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must be logged in to update a post",
          },
        ],
      };
    }
    // Fetch post by id from database
    const result = await ctx.db.select().from(posts).where(eq(posts.id, id));
    // Handle not found error
    if (!result || result.length === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "No post found with that id",
          },
        ],
      };
    }
    // Check if user is authorized to update the post
    const post = result[0];
    if (post.authorId !== authorId) {
      return {
        success: false,
        errors: [
          {
            field: "authorId",
            message: "You are not authorized to update this post",
          },
        ],
      };
    }
    // Check if title or content is the same as the original
    if (!title && post.content === content) {
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
    if (!content && post.title === title) {
      return {
        success: false,
        errors: [
          {
            field: "title",
            message: "Title is the same as the original",
          },
        ],
      };
    }
    try {
      // Update post
      const updatedPost = await ctx.db
        .update(posts)
        .set({
          title: title === undefined ? post.title : title,
          content: content === undefined ? post.content : content,
        })
        .where(eq(posts.id, id))
        .returning();
      if (!updatedPost || updatedPost.length === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message: "An error happened while updating the post",
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
