import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { posts, returnedPost } from "../../database/schema";
import { db } from "../../database/db";
import { Post } from "../types/Post";
import { eq } from "drizzle-orm";

@Resolver()
export class PostResolver {
  // Query to get all posts
  @Query(() => [Post])
  async getAllPosts(): Promise<returnedPost[]> {
    return await db.select().from(posts);
  }
  // Mutation to create a new post
  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Arg("content") content: string
  ): Promise<returnedPost> {
    const newPost = await db
      .insert(posts)
      .values({ title, content })
      .returning();
    return newPost[0];
  }
  // Mutation to delete a post
  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await db.delete(posts).where(eq(posts.id, id));
    return true;
  }
}
