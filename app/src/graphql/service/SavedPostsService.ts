import { SavedPostsRepository } from "../repositories/SavedPostsRepository";
import { ConfirmResponse } from "../../types/resolvers";

export class SavedPostsService {
  constructor(private repository: typeof SavedPostsRepository) {}

  async savePost({
    postId,
    userId,
  }: {
    postId: number;
    userId?: number;
  }): Promise<ConfirmResponse> {
    if (!userId) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must be logged in to save a post.",
          },
        ],
      };
    }
    const result = await this.repository.savePost({ postId, userId });
    if (result.rowCount === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "An error occurred while saving the post.",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }

  async unsavePost({
    postId,
    userId,
  }: {
    postId: number;
    userId?: number;
  }): Promise<ConfirmResponse> {
    if (!userId) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must be logged in to unsave a post.",
          },
        ],
      };
    }
    const result = await this.repository.unsavePost({ postId, userId });
    if (result.rowCount === 0) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "An error occurred while unsaving the post.",
          },
        ],
      };
    }
    return {
      success: true,
    };
  }

  async getSavedPostIds({ userId }: { userId?: number }): Promise<number[]> {
    if (!userId) {
      return [];
    }
    const saved = await this.repository.getSavedPostIds({ userId });
    return saved.map((h) => h.postId);
  }
}
