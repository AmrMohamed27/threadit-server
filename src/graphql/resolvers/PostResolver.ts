// TODO: Fix Get All Posts Query Performance

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
  comments,
  posts,
  returnedPost,
  returnedUserWithoutPassword,
  users,
  votes,
} from "../../database/schema";
import { Post } from "../types/Post";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { ConfirmResponse, FieldError, MyContext, voteOptions } from "../types";

export type extendedPost = returnedPost & {
  upvotesCount?: number;
  commentsCount?: number;
  isUpvoted?: voteOptions;
  author?: returnedUserWithoutPassword | null;
};

interface selectionProps {
  ctx: MyContext;
  userId: number | undefined;
}

interface searchSelectionProps extends selectionProps {
  searchTerm: string;
}

const postSelection = ({ ctx, userId }: selectionProps) => ({
  id: posts.id,
  title: posts.title,
  content: posts.content,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  authorId: posts.authorId,
  // Author Details
  author: {
    id: users.id,
    name: users.name,
    image: users.image,
    email: users.email,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    confirmed: users.confirmed,
  },
  // Upvote Count
  upvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, true))
  ),
  // Downvote Count
  downvotesCount: ctx.db.$count(
    votes,
    and(eq(votes.postId, posts.id), eq(votes.isUpvote, false))
  ),
  // If the current user has upvoted
  isUpvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, true)
    )
  ),
  // If the current user has downvoted
  isDownvoted: ctx.db.$count(
    votes,
    and(
      eq(votes.postId, posts.id),
      eq(votes.userId, userId ?? 0),
      eq(votes.isUpvote, false)
    )
  ),
  // Comment Count
  commentsCount: count(comments),
  // Posts count
  postsCount: ctx.db.$count(posts),
});

const searchSelection = ({
  ctx,
  userId,
  searchTerm,
}: searchSelectionProps) => ({
  ...postSelection({ ctx, userId }),
  totalCount: ctx.db.$count(
    posts,
    or(
      ilike(posts.content, "%" + searchTerm + "%"),
      ilike(posts.title, "%" + searchTerm + "%")
    )
  ),
});

// Post Response type
@ObjectType()
class PostResponse {
  @Field(() => Post, { nullable: true })
  post?: extendedPost;
  @Field(() => [Post], { nullable: true })
  postsArray?: extendedPost[];
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => Int, { nullable: true })
  count?: number;
}

// Get All Posts Input Type
@InputType()
class GetAllPostsInput {
  @Field()
  page: number;
  @Field()
  limit: number;
}
// Get Search Result Input Type
@InputType()
class GetSearchResultInput {
  @Field()
  searchTerm: string;
  @Field()
  page: number;
  @Field()
  limit: number;
}
@InputType()
class GetUserPostsInput {
  @Field()
  userId: number;
  @Field()
  page: number;
  @Field()
  limit: number;
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

@Resolver()
export class PostResolver {
  // Query to get all posts
  @Query(() => PostResponse)
  // Context object contains request and response headers and database connection, function returns an array of posts or errors
  async getAllPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetAllPostsInput
  ): Promise<PostResponse> {
    // Destructure input
    const { page, limit } = options;
    // Get user id from session if logged in
    const userId = ctx.req.session.userId;
    // Fetch posts with author, upvote count, user upvoted status, and comment count
    const result = await ctx.db
      .select(postSelection({ ctx, userId }))
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .groupBy(posts.id, users.id) // Group by to avoid duplicates
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    if (!result || result.length === 0) {
      return {
        errors: [{ field: "posts", message: "No posts found" }],
      };
    }

    return {
      postsArray: result.map(
        ({
          isUpvoted,
          isDownvoted,
          postsCount,
          upvotesCount,
          downvotesCount,
          ...post
        }) => ({
          ...post,
          isUpvoted:
            isUpvoted > 0 ? "upvote" : isDownvoted > 0 ? "downvote" : "none",
          upvotesCount: upvotesCount - downvotesCount,
        })
      ),
      count: result[0].postsCount,
    };
  }

  // Query to search for posts using a search term
  @Query(() => PostResponse)
  async searchPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetSearchResultInput
  ): Promise<PostResponse> {
    // Destructure input
    const { searchTerm, page, limit } = options;
    if (searchTerm.length === 0) {
      return {
        errors: [
          {
            field: "searchTerm",
            message: "Search term cannot be empty",
          },
        ],
      };
    }
    // Get user id from session
    const userId = ctx.req.session.userId;
    // Fetch all posts from database
    const result = await ctx.db
      .select(searchSelection({ ctx, userId, searchTerm }))
      .from(posts)
      .where(
        or(
          ilike(posts.content, "%" + searchTerm + "%"),
          ilike(posts.title, "%" + searchTerm + "%")
        )
      )
      .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .groupBy(posts.id, users.id) // Group by to avoid duplicates
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
    // Handle not found error
    if (!result || result.length === 0) {
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
      postsArray: result.map(
        ({
          isUpvoted,
          isDownvoted,
          postsCount,
          upvotesCount,
          downvotesCount,
          ...post
        }) => ({
          ...post,
          isUpvoted:
            isUpvoted > 0 ? "upvote" : isDownvoted > 0 ? "downvote" : "none",
          upvotesCount: upvotesCount - downvotesCount,
        })
      ),
      count: result[0].totalCount,
    };
  }

  // Query to get the count of posts
  @Query(() => Int)
  async getPostsCount(@Ctx() ctx: MyContext): Promise<number> {
    // Fetch all posts from database
    const countResult = await ctx.db.select({ count: count() }).from(posts);
    return countResult[0].count;
  }

  // Query to get all the user's posts
  @Query(() => PostResponse)
  // Context object contains request and response headers and database connection, function returns an array of posts or errors
  async getUserPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetUserPostsInput
  ): Promise<PostResponse> {
    // Destructure input
    const { userId, page, limit } = options;
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
      .select(postSelection({ ctx, userId: authorId }))
      .from(posts)
      .where(eq(posts.authorId, authorId))
      .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .groupBy(posts.id, users.id) // Group by to avoid duplicates
      .limit(limit)
      .offset((page - 1) * limit)
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
      postsArray: allPosts.map(
        ({
          isUpvoted,
          isDownvoted,
          postsCount,
          upvotesCount,
          downvotesCount,
          ...post
        }) => ({
          ...post,
          isUpvoted:
            isUpvoted > 0 ? "upvote" : isDownvoted > 0 ? "downvote" : "none",
          upvotesCount: upvotesCount - downvotesCount,
        })
      ),
      count: allPosts[0].postsCount,
    };
  }

  // Query to get a post by id
  @Query(() => PostResponse)
  async getPost(
    @Ctx() ctx: MyContext,
    @Arg("id", () => Int) id: number
  ): Promise<PostResponse> {
    // Get user id from session
    const userId = ctx.req.session.userId;
    // Fetch post by id from database
    const result = await ctx.db
      .select(postSelection({ ctx, userId }))
      .from(posts)
      .where(eq(posts.id, id))
      .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .groupBy(posts.id, users.id); // Group by to avoid duplicates
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
    const post = result[0];
    // Return post
    return {
      post: {
        ...post,
        isUpvoted:
          post.isUpvoted > 0
            ? "upvote"
            : post.isDownvoted > 0
            ? "downvote"
            : "none",
        upvotesCount: post.upvotesCount - post.downvotesCount,
      },
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
