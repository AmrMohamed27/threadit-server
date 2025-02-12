import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { posts, returnedPost } from "../../database/schema";
import { Post } from "../types/Post";
import { desc, eq } from "drizzle-orm";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
  // Query to get all posts
  @Query(() => [Post])
  // Context object contains request and response headers and database connection, function returns an array of posts
  async getAllPosts(@Ctx() ctx: MyContext): Promise<returnedPost[]> {
    return await ctx.db.select().from(posts).orderBy(desc(posts.createdAt));
  }
  // Query to get a post by id
  @Query(() => Post, { nullable: true })
  async getPost(
    @Ctx() ctx: MyContext,
    @Arg("id", () => Int) id: number
  ): Promise<returnedPost | null> {
    const result = await ctx.db.select().from(posts).where(eq(posts.id, id));
    return result[0];
  }
  // Mutation to create a new post
  @Mutation(() => Post)
  async createPost(
    @Ctx() ctx: MyContext,
    @Arg("title") title: string,
    @Arg("content") content: string
  ): Promise<returnedPost> {
    const newPost = await ctx.db
      .insert(posts)
      .values({ title, content })
      .returning();
    return newPost[0];
  }
  // Mutation to delete a post
  @Mutation(() => Boolean)
  async deletePost(
    @Ctx() ctx: MyContext,
    @Arg("id") id: number
  ): Promise<boolean> {
    try {
      const result = await ctx.db.delete(posts).where(eq(posts.id, id));
      if (result.rowCount === 0) {
        return false;
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  // Mutation to update a post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Ctx() ctx: MyContext,
    @Arg("id") id: number,
    @Arg("title") title?: string
  ): Promise<returnedPost | null> {
    const updatedPost = await ctx.db
      .update(posts)
      .set({ title })
      .where(eq(posts.id, id))
      .returning();
    if (updatedPost.length === 0) {
      return null;
    }
    return updatedPost[0];
  }
}
