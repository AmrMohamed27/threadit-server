import { PostRepository } from "../repositories/PostRespository";
import { CommentRepository } from "../repositories/CommentRepository";
import { CommentService } from "./CommentService";
import { PostService } from "./PostService";

export const Services = {
  posts: new PostService(PostRepository),
  comments: new CommentService(CommentRepository),
};
