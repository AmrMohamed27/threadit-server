import { PostRepository } from "../repositories/PostRespository";
import { CommentRepository } from "../repositories/CommentRepository";
import { CommentService } from "./CommentService";
import { PostService } from "./PostService";
import { CommunityMembersService } from "./CommunityMembersService";
import { CommunityMembersRepository } from "../repositories/CommunityMembersRepository";
import { CommunityService } from "./CommunityService";
import { CommunityRepository } from "../repositories/CommunityRepository";
import { HiddenPostsService } from "./HiddenPostsService";
import { HiddenPostsRepository } from "../repositories/HiddenPostsRepository";
import { SavedPostsService } from "./SavedPostsService";
import { SavedPostsRepository } from "../repositories/SavedPostsRepository";
import { UserService } from "./UserService";
import { UserRepository } from "../repositories/UserRepository";
import { VoteService } from "./VoteService";
import { VoteRepository } from "../repositories/VoteRepository";

export const Services = {
  posts: new PostService(PostRepository),
  comments: new CommentService(CommentRepository),
  communityMembers: new CommunityMembersService(CommunityMembersRepository),
  communities: new CommunityService(CommunityRepository),
  hiddenPosts: new HiddenPostsService(HiddenPostsRepository),
  savedPosts: new SavedPostsService(SavedPostsRepository),
  users: new UserService(UserRepository),
  votes: new VoteService(VoteRepository, PostRepository, CommentRepository),
};
