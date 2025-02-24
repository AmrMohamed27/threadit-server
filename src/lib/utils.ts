import { ExtendedComment } from "@/graphql/resolvers/CommentResolver";

// Helper function to build a nested comment structure
export const buildCommentThread = (
  comments: ExtendedComment[]
): ExtendedComment[] => {
  const commentMap: Record<number, ExtendedComment> = {};
  const rootComments: ExtendedComment[] = [];

  // Map comments by ID
  comments.forEach((comment) => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });

  // Assign replies to their parents
  comments.forEach((comment) => {
    let flag = false;
    if (comment.parentCommentId) {
      const parent = commentMap[comment.parentCommentId];
      if (parent) {
        if (parent.parentCommentId) {
          const grandParent = commentMap[parent.parentCommentId];
          if (grandParent && grandParent.parentCommentId) {
            grandParent.replies?.push(commentMap[comment.id]);
            flag = true;
          }
        }
        if (!flag) {
          parent.replies?.push(commentMap[comment.id]);
        }
      }
    } else {
      // If no parent, it's a top-level comment
      rootComments.push(commentMap[comment.id]);
    }
  });

  return rootComments;
};
