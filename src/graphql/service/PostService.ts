import {
  excludeHiddenPosts,
  mapPostArrayResult,
  mapSinglePostResult,
} from "../../lib/utils";
import { PostResponse } from "../../types/inputs";
import { and, eq, exists, ilike, or, SQL } from "drizzle-orm";
import {
  communityMembers,
  hiddenPosts,
  posts,
  savedPosts,
  votes,
} from "../../database/schema";
import { PostRepository } from "../repositories/PostRespository";
import { ConfirmResponse, SortOptions } from "../../types/resolvers";
import { db } from "../../database/db";

export class PostService {
  constructor(private repository: typeof PostRepository) {}

  private async postsFetcher({
    sortBy,
    userId,
    limit,
    page,
    filters,
    communityOnly,
    hiddenOnly,
    votesOnly,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    limit: number;
    page: number;
    filters: SQL[];
    communityOnly?: boolean;
    hiddenOnly?: boolean;
    votesOnly?: boolean;
  }) {
    const result = await this.repository.getAllPostsWithFilters({
      sortBy,
      userId,
      limit,
      page,
      filters,
      communityOnly,
      hiddenOnly,
    });
    if (!result || result.length === 0) {
      return {
        errors: [{ field: "posts", message: "No posts found" }],
      };
    }
    const resultCount = await this.repository.countAllPostsWithFilters({
      filters,
      hiddenOnly,
      communityOnly,
      votesOnly,
    });
    return {
      postsArray: mapPostArrayResult(result),
      count: resultCount[0].count,
    };
  }
  private async singlePostFetcher({
    userId,
    postId,
    filters,
  }: {
    userId?: number;
    postId: number;
    filters: SQL[];
  }) {
    const result = await this.repository.getSinglePost({
      userId,
      postId,
      filters,
    });
    if (!result || result.length === 0) {
      return {
        errors: [{ field: "post", message: "No posts found" }],
      };
    }
    return {
      post: mapSinglePostResult(result[0]),
      count: 1,
    };
  }
  async fetchAllPosts({
    sortBy,
    userId,
    limit,
    page,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    limit: number;
    page: number;
  }): Promise<PostResponse> {
    const filters = [
      // Exclude posts where there is a match in hiddenPosts
      excludeHiddenPosts(userId ?? 0),
    ];
    return await this.postsFetcher({
      sortBy,
      userId,
      limit,
      page,
      filters,
    });
  }

  async fetchUserCommunityPosts({
    sortBy,
    userId,
    limit,
    page,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    limit: number;
    page: number;
  }): Promise<PostResponse> {
    // If user is not logged in, return all posts
    const filters = userId
      ? [
          // Exclude posts where there is a match in hiddenPosts
          excludeHiddenPosts(userId),
          // Only include posts from the user's communities
          and(
            eq(posts.communityId, communityMembers.communityId),
            eq(communityMembers.userId, userId)
          )!,
        ]
      : [];
    return await this.postsFetcher({
      sortBy,
      limit,
      page,
      userId,
      filters,
      communityOnly: !!userId,
    });
  }

  async fetchPostById({
    postId,
    userId,
  }: {
    postId: number;
    userId?: number;
  }): Promise<PostResponse> {
    return await this.singlePostFetcher({ userId, postId, filters: [] });
  }

  async fetchCommunityPosts({
    sortBy,
    userId,
    limit,
    page,
    communityId,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    limit: number;
    page: number;
    communityId: number;
  }): Promise<PostResponse> {
    const filters = [
      eq(posts.communityId, communityId),
      eq(communityMembers.communityId, communityId),
      eq(communityMembers.userId, userId ?? 0),
      excludeHiddenPosts(userId ?? 0),
    ];
    return await this.postsFetcher({
      sortBy,
      limit,
      page,
      userId,
      filters,
      communityOnly: !!userId,
    });
  }

  async fetchSearchPosts({
    sortBy,
    userId,
    limit,
    page,
    searchTerm,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    limit: number;
    page: number;
    searchTerm: string;
  }): Promise<PostResponse> {
    // Check if search term is empty
    if (searchTerm.trim().length === 0) {
      return {
        errors: [
          {
            field: "searchTerm",
            message: "Search term cannot be empty",
          },
        ],
      };
    }
    // Ignore undefined type to make typescript happy
    const filters = [
      or(
        ilike(posts.content, "%" + searchTerm + "%"),
        ilike(posts.title, "%" + searchTerm + "%")
      )!,
      // Exclude hidden posts
      excludeHiddenPosts(userId ?? 0),
    ];
    return await this.postsFetcher({ sortBy, limit, page, userId, filters });
  }

  async fetchUserPosts({
    sortBy,
    userId,
    authorId,
    limit,
    page,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    authorId?: number;
    limit: number;
    page: number;
  }): Promise<PostResponse> {
    // Check if user is logged in
    if (!authorId) {
      return {
        errors: [
          {
            field: "authorId",
            message: "Please provide a user id to get their posts",
          },
        ],
      };
    }
    const filters = [
      // Exclude posts where there is a match in hiddenPosts
      excludeHiddenPosts(userId ?? 0),
      eq(posts.authorId, authorId),
    ];
    return await this.postsFetcher({ sortBy, limit, page, userId, filters });
  }

  async fetchUserHiddenPosts({
    sortBy,
    userId,
    limit,
    page,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    limit: number;
    page: number;
  }): Promise<PostResponse> {
    // Check if user is logged in
    if (!userId) {
      return {
        errors: [
          {
            field: "userId",
            message: "Please log in to see your hidden posts",
          },
        ],
      };
    }
    const filters: SQL[] = [
      eq(posts.id, hiddenPosts.postId),
      eq(hiddenPosts.userId, userId),
    ];
    return await this.postsFetcher({
      sortBy,
      limit,
      page,
      userId,
      filters,
      hiddenOnly: true,
    });
  }

  async fetchUserVotedPosts({
    sortBy,
    userId,
    limit,
    page,
    isUpvoted,
  }: {
    sortBy?: SortOptions;
    userId?: number;
    limit: number;
    page: number;
    isUpvoted: boolean;
  }): Promise<PostResponse> {
    // Check if user is logged in
    if (!userId) {
      return {
        errors: [
          {
            field: "userId",
            message: "You must be logged in to get your voted",
          },
        ],
      };
    }
    const filters = [
      excludeHiddenPosts(userId),
      eq(posts.id, votes.postId),
      eq(votes.userId, userId),
      eq(votes.isUpvote, isUpvoted),
    ];
    return await this.postsFetcher({
      sortBy,
      limit,
      page,
      userId,
      filters,
      votesOnly: true,
    });
  }

  async fetchUserSavedPosts({
    userId,
    page,
    limit,
    sortBy,
  }: {
    userId?: number;
    page: number;
    limit: number;
    sortBy?: SortOptions;
  }): Promise<PostResponse> {
    // check if user is logged in
    if (!userId) {
      return {
        errors: [
          {
            field: "root",
            message: "You must be logged in to get your saved posts",
          },
        ],
      };
    }
    const filters: SQL[] = [
      exists(
        db
          .select()
          .from(savedPosts)
          .where(
            and(
              eq(savedPosts.postId, posts.id),
              eq(savedPosts.userId, userId ?? 0)
            )
          )
      ),
    ];
    return await this.postsFetcher({
      sortBy,
      filters,
      limit,
      page,
      userId,
    });
  }

  async createPost({
    title,
    content,
    communityId,
    authorId,
    media,
  }: {
    title: string;
    content: string;
    communityId: number;
    authorId?: number;
    media?: string[];
  }): Promise<PostResponse> {
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
    const newPost = await this.repository.insertPost({
      title,
      content,
      authorId,
      communityId,
      media,
    });
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
    return {
      post: newPost[0],
      count: 1,
    };
  }
  async updatePost({
    title,
    content,
    postId,
    authorId,
  }: {
    title: string;
    content: string;
    postId: number;
    authorId?: number;
  }): Promise<ConfirmResponse> {
    // Check if user is logged in
    if (!authorId) {
      return {
        success: false,
        errors: [
          {
            field: "authorId",
            message: "You must be logged in to update a post",
          },
        ],
      };
    }
    const result = await this.repository.updatePost({
      title,
      content,
      authorId,
      postId,
    });
    // handle update error
    if (!result || result.length === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "Error updating post",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }

  async deletePost({
    postId,
    authorId,
  }: {
    postId: number;
    authorId?: number;
  }): Promise<ConfirmResponse> {
    // Check if user is logged in
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
    const result = await this.repository.deletePost({
      postId,
      authorId,
    });
    // handle deletion error
    if (!result || result.length === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "Error deleting post",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }
}
