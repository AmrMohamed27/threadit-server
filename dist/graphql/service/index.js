"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Services = void 0;
const PostRespository_1 = require("../repositories/PostRespository");
const CommentRepository_1 = require("../repositories/CommentRepository");
const CommentService_1 = require("./CommentService");
const PostService_1 = require("./PostService");
const CommunityMembersService_1 = require("./CommunityMembersService");
const CommunityMembersRepository_1 = require("../repositories/CommunityMembersRepository");
const CommunityService_1 = require("./CommunityService");
const CommunityRepository_1 = require("../repositories/CommunityRepository");
const HiddenPostsService_1 = require("./HiddenPostsService");
const HiddenPostsRepository_1 = require("../repositories/HiddenPostsRepository");
const SavedPostsService_1 = require("./SavedPostsService");
const SavedPostsRepository_1 = require("../repositories/SavedPostsRepository");
const UserService_1 = require("./UserService");
const UserRepository_1 = require("../repositories/UserRepository");
const VoteService_1 = require("./VoteService");
const VoteRepository_1 = require("../repositories/VoteRepository");
const MessageService_1 = require("./MessageService");
const MessageRepository_1 = require("../repositories/MessageRepository");
const ChatService_1 = require("./ChatService");
const ChatRepository_1 = require("../repositories/ChatRepository");
exports.Services = {
    posts: new PostService_1.PostService(PostRespository_1.PostRepository),
    comments: new CommentService_1.CommentService(CommentRepository_1.CommentRepository),
    communityMembers: new CommunityMembersService_1.CommunityMembersService(CommunityMembersRepository_1.CommunityMembersRepository),
    communities: new CommunityService_1.CommunityService(CommunityRepository_1.CommunityRepository),
    hiddenPosts: new HiddenPostsService_1.HiddenPostsService(HiddenPostsRepository_1.HiddenPostsRepository),
    savedPosts: new SavedPostsService_1.SavedPostsService(SavedPostsRepository_1.SavedPostsRepository),
    users: new UserService_1.UserService(UserRepository_1.UserRepository),
    votes: new VoteService_1.VoteService(VoteRepository_1.VoteRepository, PostRespository_1.PostRepository, CommentRepository_1.CommentRepository),
    messages: new MessageService_1.MessageService(MessageRepository_1.MessageRepository),
    chats: new ChatService_1.ChatService(ChatRepository_1.ChatRepository, UserRepository_1.UserRepository),
};
//# sourceMappingURL=index.js.map