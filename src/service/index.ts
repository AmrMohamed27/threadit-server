import { PostRepository } from "../repositories/PostRespository";
import { CommentRepository } from "../repositories/CommentRepository";
import { CommentService } from "./CommentService";
import { PostService } from "./PostService";
import { CommunityMembersService } from "./CommunityMembersService";
import { CommunityMembersRepository } from "../repositories/CommunityMembersRepository";
import { CommunityService } from "./CommunityService";
import { CommunityRepository } from "../repositories/CommunityRepository";

export const Services = {
  posts: new PostService(PostRepository),
  comments: new CommentService(CommentRepository),
  communityMembers: new CommunityMembersService(CommunityMembersRepository),
  communities: new CommunityService(CommunityRepository),
};
