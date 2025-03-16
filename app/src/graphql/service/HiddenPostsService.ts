import { HiddenPostsRepository } from "../repositories/HiddenPostsRepository";
import { ConfirmResponse } from "../../types/resolvers";

export class HiddenPostsService {
  constructor(private repository: typeof HiddenPostsRepository) {}

  async hidePost({
    postId,
    userId,
  }: {
    postId: number;
    userId?: number;
  }): Promise<ConfirmResponse> {
    // Check if user is logged in
    if (!userId) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must be logged in to hide a post.",
          },
        ],
      };
    }
    const result = await this.repository.hidePost({ postId, userId });

    if (result.rowCount === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "An error occurred while hiding the post.",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }

  async unhidePost({
    postId,
    userId,
  }: {
    postId: number;
    userId?: number;
  }): Promise<ConfirmResponse> {
    // Check if user is logged in
    if (!userId) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must be logged in to unhide a post.",
          },
        ],
      };
    }

    const result = await this.repository.unhidePost({ postId, userId });
    if (result.rowCount === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "An error occurred while unhiding the post.",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }

  async fetchHiddenPostsIds({
    userId,
  }: {
    userId?: number;
  }): Promise<number[]> {
    // Check if user is logged in
    if (!userId) {
      return [];
    }
    const hidden = await this.repository.getHiddenPostsIds({ userId });

    return hidden.map((h) => h.postId);
  }
}
