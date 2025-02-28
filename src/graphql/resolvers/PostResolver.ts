import {
  and,
  count,
  eq,
  exists,
  ilike,
  isNull,
  notExists,
  or,
} from "drizzle-orm";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import {
  comments,
  communities,
  communityMembers,
  hiddenPosts,
  posts,
  users,
  votes,
} from "../../database/schema";
import {
  communityPostSelection,
  communitySelection,
  hiddenPostSelection,
  postSelection,
  postsSorter,
  searchSelection,
  votedPostSelection,
  userPostsSelection,
} from "../../lib/utils";
import {
  CreatePostInput,
  GetAllPostsInput,
  GetCommunityPostsInput,
  GetSearchResultInput,
  GetUserCommunityPostsInput,
  GetUserHiddenPostsInput,
  GetUserPostsInput,
  GetUserVotedPostsOptions,
  PostResponse,
  UpdatePostInput,
} from "../../types/inputs";
import { ConfirmResponse, MyContext } from "../../types/resolvers";

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
    const { page, limit, sortBy } = options;
    // Get user id from session if logged in
    const userId = ctx.req.session.userId;
    // Fetch posts with author, upvote count, user upvoted status, and comment count
    const result = await ctx.db
      .select(postSelection({ ctx, userId }))
      .from(posts)
      .where(
        // Exclude posts where there is a match in hiddenPosts
        notExists(
          ctx.db
            .select()
            .from(hiddenPosts)
            .where(
              and(
                eq(hiddenPosts.postId, posts.id),
                eq(hiddenPosts.userId, userId ?? 0)
              )
            )
        )
      )
      .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .leftJoin(communities, eq(posts.communityId, communities.id)) // Join communities to get community details
      .leftJoin(
        communityMembers,
        eq(posts.communityId, communityMembers.communityId)
      ) // Join community members to get community member count
      .groupBy(posts.id, users.id, communities.id, communityMembers.communityId) // Group by to avoid duplicates
      .orderBy(postsSorter(sortBy ?? "Best"))
      .limit(limit)
      .offset((page - 1) * limit);

    if (!result || result.length === 0) {
      return {
        errors: [{ field: "posts", message: "No posts found" }],
      };
    }

    const resultCount = await ctx.db
      .select({ count: count() })
      .from(posts)
      .where(
        // Exclude posts where there is a match in hiddenPosts
        notExists(
          ctx.db
            .select()
            .from(hiddenPosts)
            .where(
              and(
                eq(hiddenPosts.postId, posts.id),
                eq(hiddenPosts.userId, userId ?? 0)
              )
            )
        )
      );
    return {
      postsArray: result.map(
        ({
          isUpvoted,
          isDownvoted,
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
      count: resultCount[0].count,
    };
  }

  // Query to get all posts in the communities where the user is a member
  @Query(() => PostResponse)
  async getUserCommunityPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetUserCommunityPostsInput
  ): Promise<PostResponse> {
    // Destructure input
    const { page, limit, sortBy } = options;
    // Get user id from session
    const userId = ctx.req.session.userId;
    // If user is not logged in, return all posts
    if (!userId) {
      const result = await ctx.db
        .select(postSelection({ ctx }))
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
        .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
        .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
        .leftJoin(communities, eq(posts.communityId, communities.id)) // Join communities to get community details
        .leftJoin(
          communityMembers,
          eq(posts.communityId, communityMembers.communityId)
        ) // Join community members to get community member count
        .groupBy(
          posts.id,
          users.id,
          communities.id,
          communityMembers.communityId
        ) // Group by to avoid duplicates
        .orderBy(postsSorter(sortBy ?? "Best"))
        .limit(limit)
        .offset((page - 1) * limit);

      if (!result || result.length === 0) {
        return {
          errors: [{ field: "posts", message: "No posts found" }],
        };
      }
      const resultCount = await ctx.db.select({ count: count() }).from(posts);
      return {
        postsArray: result.map(
          ({
            isUpvoted,
            isDownvoted,
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
        count: resultCount[0].count,
      };
    }
    // Else, return posts from only the user's communities
    else {
      // Fetch posts with author, upvote count, user upvoted status, and comment count
      const result = await ctx.db
        .select(postSelection({ ctx, userId }))
        .from(posts)
        .where(
          and(
            // Exclude posts where there is a match in hiddenPosts
            notExists(
              ctx.db
                .select()
                .from(hiddenPosts)
                .where(
                  and(
                    eq(hiddenPosts.postId, posts.id),
                    eq(hiddenPosts.userId, userId ?? 0)
                  )
                )
            ),
            // Post is in a community where the user is a member
            and(
              eq(communityMembers.userId, userId ?? 0),
              eq(posts.communityId, communityMembers.communityId)
            )
          )
        )
        .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
        .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
        .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
        .leftJoin(communities, eq(posts.communityId, communities.id)) // Join communities to get community details
        .leftJoin(
          communityMembers,
          and(
            eq(posts.communityId, communityMembers.communityId),
            eq(communityMembers.userId, userId ?? 0)
          )
        ) // Join community members to get community member count
        .groupBy(
          posts.id,
          users.id,
          communities.id,
          communityMembers.communityId,
          communityMembers.userId
        ) // Group by to avoid duplicates
        .orderBy(postsSorter(sortBy ?? "Best"))
        .limit(limit)
        .offset((page - 1) * limit);
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
      const resultCount = await ctx.db
        .select({ count: count() })
        .from(posts)
        .leftJoin(
          hiddenPosts,
          and(eq(hiddenPosts.postId, posts.id), eq(hiddenPosts.userId, userId))
        )
        .where(
          and(
            isNull(hiddenPosts.postId), // Exclude hidden posts
            exists(
              ctx.db
                .select()
                .from(communityMembers)
                .where(
                  and(
                    eq(communityMembers.userId, userId),
                    eq(communityMembers.communityId, posts.communityId)
                  )
                )
            )
          )
        );
      return {
        postsArray: result.map(
          ({
            isUpvoted,
            isDownvoted,
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
        count: resultCount[0].count,
      };
    }
  }

  // Query to get all posts in a community
  @Query(() => PostResponse)
  async getCommunityPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetCommunityPostsInput
  ): Promise<PostResponse> {
    // Destructure input
    const { communityId, page, limit, sortBy } = options;
    // Get user id from session
    const userId = ctx.req.session.userId;
    const communityResult = await ctx.db
      .selectDistinct(communitySelection({ ctx, userId }))
      .from(communities)
      .where(eq(communities.id, communityId))
      .leftJoin(posts, eq(communities.id, posts.communityId))
      .leftJoin(users, eq(communities.creatorId, users.id))
      .leftJoin(
        communityMembers,
        eq(communities.id, communityMembers.communityId)
      )
      .groupBy(
        communities.id,
        posts.id,
        users.id,
        communityMembers.communityId
      );

    if (communityResult.length === 0) {
      return {
        errors: [
          {
            field: "communityId",
            message: "No community with this id found.",
          },
        ],
      };
    }
    const community = communityResult[0];
    if (!community.isJoined && community.isPrivate) {
      return {
        errors: [
          {
            field: "communityId",
            message:
              "This community is private. You must be a member to see posts.",
          },
        ],
      };
    }
    // Fetch all posts from database
    const result = await ctx.db
      .select(communityPostSelection({ ctx, userId, communityId }))
      .from(posts)
      .where(
        and(
          eq(posts.communityId, communityId),
          notExists(
            ctx.db
              .select()
              .from(hiddenPosts)
              .where(
                and(
                  eq(hiddenPosts.postId, posts.id),
                  eq(hiddenPosts.userId, userId ?? 0)
                )
              )
          )
        )
      )
      .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .leftJoin(communities, eq(posts.communityId, communities.id)) // Join communities to get community details
      .leftJoin(
        communityMembers,
        eq(posts.communityId, communityMembers.communityId)
      ) // Join community members to get community member count
      .groupBy(posts.id, users.id, communities.id, communityMembers.communityId) // Group by to avoid duplicates
      .orderBy(postsSorter(sortBy ?? "Best"))
      .limit(limit)
      .offset((page - 1) * limit);

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
    return {
      postsArray: result.map(
        ({
          isUpvoted,
          isDownvoted,
          count,
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
      count: result[0].count,
    };
  }

  // Query to search for posts using a search term
  @Query(() => PostResponse)
  async searchPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetSearchResultInput
  ): Promise<PostResponse> {
    // Destructure input
    const { searchTerm, page, limit, sortBy } = options;
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
        and(
          or(
            ilike(posts.content, "%" + searchTerm + "%"),
            ilike(posts.title, "%" + searchTerm + "%")
          ), // Exclude hidden posts
          notExists(
            ctx.db
              .select()
              .from(hiddenPosts)
              .where(
                and(
                  eq(hiddenPosts.postId, posts.id),
                  eq(hiddenPosts.userId, userId ?? 0)
                )
              )
          )
        )
      )
      .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .leftJoin(communities, eq(posts.communityId, communities.id)) // Join communities to get community details
      .leftJoin(
        communityMembers,
        eq(posts.communityId, communityMembers.communityId)
      ) // Join community members to get community member count
      .groupBy(posts.id, users.id, communities.id, communityMembers.communityId) // Group by to avoid duplicates
      .orderBy(postsSorter(sortBy ?? "Best"))
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
    const count = await ctx.db
      .select({ count: ctx.db.$count(posts) })
      .from(posts)
      .where(
        and(
          or(
            ilike(posts.content, "%" + searchTerm + "%"),
            ilike(posts.title, "%" + searchTerm + "%")
          ), // Exclude hidden posts
          notExists(
            ctx.db
              .select()
              .from(hiddenPosts)
              .where(
                and(
                  eq(hiddenPosts.postId, posts.id),
                  eq(hiddenPosts.userId, userId ?? 0)
                )
              )
          )
        )
      );
    // Return posts array
    return {
      postsArray: result.map(
        ({
          isUpvoted,
          isDownvoted,
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
      count: count[0].count,
    };
  }

  // Query to get all the user's posts
  @Query(() => PostResponse)
  // Context object contains request and response headers and database connection, function returns an array of posts or errors
  async getUserPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetUserPostsInput
  ): Promise<PostResponse> {
    // Destructure input
    const { userId, page, limit, sortBy = "New" } = options;
    const authorId = userId ? userId : ctx.req.session.userId;
    if (!authorId) {
      return {
        errors: [
          {
            field: "authorId",
            message: "Please provide a user id to get his posts",
          },
        ],
      };
    }
    // Fetch all posts from database
    const allPosts = await ctx.db
      .select(userPostsSelection({ ctx, userId: authorId }))
      .from(posts)
      .where(eq(posts.authorId, authorId))
      .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .leftJoin(communities, eq(posts.communityId, communities.id)) // Join communities to get community details
      .leftJoin(
        communityMembers,
        eq(posts.communityId, communityMembers.communityId)
      ) // Join community members to get community member count
      .groupBy(posts.id, users.id, communities.id, communityMembers.communityId) // Group by to avoid duplicates
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(postsSorter(sortBy));
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

  // Query to get the user's hidden posts
  @Query(() => PostResponse)
  async getUserHiddenPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetUserHiddenPostsInput
  ): Promise<PostResponse> {
    // Destructure input
    const { page, limit, sortBy } = options;
    // Get user id from session
    const userId = ctx.req.session.userId;
    if (!userId) {
      return {
        errors: [
          {
            field: "root",
            message: "You must be logged in to get your hidden posts",
          },
        ],
      };
    }
    // Fetch posts with author, upvote count, user upvoted status, and comment count
    const result = await ctx.db
      .select(hiddenPostSelection({ ctx, userId }))
      .from(posts)
      .where(
        and(eq(posts.id, hiddenPosts.postId), eq(hiddenPosts.userId, userId))
      )
      .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .leftJoin(communities, eq(posts.communityId, communities.id)) // Join communities to get community details
      .leftJoin(
        communityMembers,
        eq(posts.communityId, communityMembers.communityId)
      ) // Join community members to get community member count
      .leftJoin(hiddenPosts, eq(posts.id, hiddenPosts.postId)) // Join hidden posts to get hidden post
      .groupBy(posts.id, users.id, communities.id, communityMembers.communityId) // Group by to avoid duplicates
      .orderBy(postsSorter(sortBy ?? "Best"))
      .limit(limit)
      .offset((page - 1) * limit);
    // Handle not found error
    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "posts",
            message: "No hidden posts found",
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
      count: result[0].postsCount,
    };
  }
  // Query to get all posts the user has upvoted or downvoted
  @Query(() => PostResponse)
  async getUserVotedPosts(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetUserVotedPostsOptions
  ): Promise<PostResponse> {
    // Destructure options
    const { sortBy, limit, page, isUpvoted } = options;
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
    // Fetch all upvoted posts from database
    const result = await ctx.db
      .select(votedPostSelection({ ctx, userId, isUpvoted }))
      .from(posts)
      .where(
        and(
          eq(posts.id, votes.postId),
          eq(votes.userId, userId),
          eq(votes.isUpvote, isUpvoted)
        )
      )
      .leftJoin(users, eq(posts.authorId, users.id)) // Join users table to get author details
      .leftJoin(votes, eq(posts.id, votes.postId)) // Join votes to get upvote count
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .leftJoin(communities, eq(posts.communityId, communities.id)) // Join communities to get community details
      .leftJoin(
        communityMembers,
        eq(posts.communityId, communityMembers.communityId)
      ) // Join community members to get community member count
      .leftJoin(hiddenPosts, eq(posts.id, hiddenPosts.postId)) // Join hidden posts to get hidden post
      .groupBy(posts.id, users.id, communities.id, communityMembers.communityId) // Group by to avoid duplicates
      .orderBy(postsSorter(sortBy ?? "Best"))
      .limit(limit)
      .offset((page - 1) * limit);
    // Handle not found error
    if (!result || result.length === 0) {
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
      .leftJoin(communities, eq(posts.communityId, communities.id)) // Join communities to get community details
      .leftJoin(comments, eq(posts.id, comments.postId)) // Join comments to get comment count
      .leftJoin(
        communityMembers,
        eq(posts.communityId, communityMembers.communityId)
      ) // Join community members to get community member count
      .groupBy(
        posts.id,
        users.id,
        communities.id,
        communityMembers.communityId
      ); // Group by to avoid duplicates
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
    const { title, content, communityId } = options;
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
    // Create new post and insert it in database
    try {
      const newPost = await ctx.db
        .insert(posts)
        .values({ title, content, authorId, communityId })
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
    try {
      const result = await ctx.db
        .delete(posts)
        .where(and(eq(posts.id, id), eq(posts.authorId, authorId)));
      if (result.rowCount === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message:
                "No posts deleted. Please make sure a post with this id exists and you have permission to delete it.",
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
    if (!title || !content) {
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
    try {
      // Update post
      const updatedPost = await ctx.db
        .update(posts)
        .set({
          title,
          content,
        })
        .where(and(eq(posts.id, id), eq(posts.authorId, authorId)))
        .returning();
      if (!updatedPost || updatedPost.length === 0) {
        return {
          success: false,
          errors: [
            {
              field: "root",
              message:
                "An error happened while updating the post. Please make sure the post exists and you have permission to update it.",
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
