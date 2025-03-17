"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddChatParticipantInput = exports.UpdateChatInput = exports.CreateChatInput = exports.UpdateMessageInput = exports.CreateMessageInput = exports.DeleteVoteOptions = exports.UpdateVoteInput = exports.CreateVoteInput = exports.VoteResponse = exports.UserResponse = exports.CheckTokenInput = exports.ResetPasswordInput = exports.LoginInput = exports.RegisterInput = exports.LeaveCommunityInput = exports.JoinCommunityInput = exports.UpdateUserNameInput = exports.GetUserVotedPostsOptions = exports.GetUserHiddenPostsInput = exports.GetUserCommentsInput = exports.GetPostCommentsInput = exports.UpdateCommentInput = exports.CreateCommentInput = exports.GetCommentByIdInput = exports.CommentResponse = exports.UpdateUserImageInput = exports.GetCommunityPostsInput = exports.UpdateCommunityInput = exports.CreateCommunityInput = exports.CommunityResponse = exports.GetUserCommunityPostsInput = exports.UpdatePostInput = exports.CreatePostInput = exports.GetUserPostsInput = exports.GetSearchResultInput = exports.GetAllPostsInput = exports.ChatResponse = exports.MessageResponse = exports.PostResponse = void 0;
const type_graphql_1 = require("type-graphql");
const Chat_1 = require("../graphql/types/Chat");
const Comment_1 = require("../graphql/types/Comment");
const Community_1 = require("../graphql/types/Community");
const Message_1 = require("../graphql/types/Message");
const Post_1 = require("../graphql/types/Post");
const User_1 = require("../graphql/types/User");
const Vote_1 = require("../graphql/types/Vote");
const resolvers_1 = require("./resolvers");
let PostResponse = class PostResponse {
};
exports.PostResponse = PostResponse;
__decorate([
    (0, type_graphql_1.Field)(() => Post_1.Post, { nullable: true }),
    __metadata("design:type", Object)
], PostResponse.prototype, "post", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post], { nullable: true }),
    __metadata("design:type", Array)
], PostResponse.prototype, "postsArray", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [resolvers_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], PostResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], PostResponse.prototype, "count", void 0);
exports.PostResponse = PostResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], PostResponse);
let MessageResponse = class MessageResponse {
};
exports.MessageResponse = MessageResponse;
__decorate([
    (0, type_graphql_1.Field)(() => Message_1.Message, { nullable: true }),
    __metadata("design:type", Object)
], MessageResponse.prototype, "message", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Message_1.Message], { nullable: true }),
    __metadata("design:type", Array)
], MessageResponse.prototype, "messagesArray", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [resolvers_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], MessageResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], MessageResponse.prototype, "count", void 0);
exports.MessageResponse = MessageResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], MessageResponse);
let ChatResponse = class ChatResponse {
};
exports.ChatResponse = ChatResponse;
__decorate([
    (0, type_graphql_1.Field)(() => Chat_1.Chat, { nullable: true }),
    __metadata("design:type", Object)
], ChatResponse.prototype, "chat", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Chat_1.Chat], { nullable: true }),
    __metadata("design:type", Array)
], ChatResponse.prototype, "chatsArray", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [resolvers_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], ChatResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], ChatResponse.prototype, "count", void 0);
exports.ChatResponse = ChatResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], ChatResponse);
let GetAllPostsInput = class GetAllPostsInput {
};
exports.GetAllPostsInput = GetAllPostsInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetAllPostsInput.prototype, "page", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetAllPostsInput.prototype, "limit", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GetAllPostsInput.prototype, "sortBy", void 0);
exports.GetAllPostsInput = GetAllPostsInput = __decorate([
    (0, type_graphql_1.InputType)()
], GetAllPostsInput);
let GetSearchResultInput = class GetSearchResultInput {
};
exports.GetSearchResultInput = GetSearchResultInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], GetSearchResultInput.prototype, "searchTerm", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetSearchResultInput.prototype, "page", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetSearchResultInput.prototype, "limit", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GetSearchResultInput.prototype, "sortBy", void 0);
exports.GetSearchResultInput = GetSearchResultInput = __decorate([
    (0, type_graphql_1.InputType)()
], GetSearchResultInput);
let GetUserPostsInput = class GetUserPostsInput {
};
exports.GetUserPostsInput = GetUserPostsInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], GetUserPostsInput.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetUserPostsInput.prototype, "page", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetUserPostsInput.prototype, "limit", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GetUserPostsInput.prototype, "sortBy", void 0);
exports.GetUserPostsInput = GetUserPostsInput = __decorate([
    (0, type_graphql_1.InputType)()
], GetUserPostsInput);
let CreatePostInput = class CreatePostInput {
};
exports.CreatePostInput = CreatePostInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePostInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePostInput.prototype, "content", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], CreatePostInput.prototype, "communityId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreatePostInput.prototype, "media", void 0);
exports.CreatePostInput = CreatePostInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreatePostInput);
let UpdatePostInput = class UpdatePostInput {
};
exports.UpdatePostInput = UpdatePostInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], UpdatePostInput.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "content", void 0);
exports.UpdatePostInput = UpdatePostInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdatePostInput);
let GetUserCommunityPostsInput = class GetUserCommunityPostsInput {
};
exports.GetUserCommunityPostsInput = GetUserCommunityPostsInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetUserCommunityPostsInput.prototype, "page", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetUserCommunityPostsInput.prototype, "limit", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GetUserCommunityPostsInput.prototype, "sortBy", void 0);
exports.GetUserCommunityPostsInput = GetUserCommunityPostsInput = __decorate([
    (0, type_graphql_1.InputType)()
], GetUserCommunityPostsInput);
let CommunityResponse = class CommunityResponse {
};
exports.CommunityResponse = CommunityResponse;
__decorate([
    (0, type_graphql_1.Field)(() => Community_1.Community, { nullable: true }),
    __metadata("design:type", Object)
], CommunityResponse.prototype, "community", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Community_1.Community], { nullable: true }),
    __metadata("design:type", Array)
], CommunityResponse.prototype, "communitiesArray", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [resolvers_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], CommunityResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CommunityResponse.prototype, "count", void 0);
exports.CommunityResponse = CommunityResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], CommunityResponse);
let CreateCommunityInput = class CreateCommunityInput {
};
exports.CreateCommunityInput = CreateCommunityInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCommunityInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCommunityInput.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCommunityInput.prototype, "image", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], CreateCommunityInput.prototype, "isPrivate", void 0);
exports.CreateCommunityInput = CreateCommunityInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateCommunityInput);
let UpdateCommunityInput = class UpdateCommunityInput {
};
exports.UpdateCommunityInput = UpdateCommunityInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], UpdateCommunityInput.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCommunityInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCommunityInput.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCommunityInput.prototype, "image", void 0);
exports.UpdateCommunityInput = UpdateCommunityInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateCommunityInput);
let GetCommunityPostsInput = class GetCommunityPostsInput {
};
exports.GetCommunityPostsInput = GetCommunityPostsInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetCommunityPostsInput.prototype, "communityId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetCommunityPostsInput.prototype, "page", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetCommunityPostsInput.prototype, "limit", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GetCommunityPostsInput.prototype, "sortBy", void 0);
exports.GetCommunityPostsInput = GetCommunityPostsInput = __decorate([
    (0, type_graphql_1.InputType)()
], GetCommunityPostsInput);
let UpdateUserImageInput = class UpdateUserImageInput {
};
exports.UpdateUserImageInput = UpdateUserImageInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UpdateUserImageInput.prototype, "image", void 0);
exports.UpdateUserImageInput = UpdateUserImageInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateUserImageInput);
let CommentResponse = class CommentResponse {
};
exports.CommentResponse = CommentResponse;
__decorate([
    (0, type_graphql_1.Field)(() => Comment_1.Comment, { nullable: true }),
    __metadata("design:type", Object)
], CommentResponse.prototype, "comment", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Comment_1.Comment], { nullable: true }),
    __metadata("design:type", Array)
], CommentResponse.prototype, "commentsArray", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [resolvers_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], CommentResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CommentResponse.prototype, "count", void 0);
exports.CommentResponse = CommentResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], CommentResponse);
let GetCommentByIdInput = class GetCommentByIdInput {
};
exports.GetCommentByIdInput = GetCommentByIdInput;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], GetCommentByIdInput.prototype, "commentId", void 0);
exports.GetCommentByIdInput = GetCommentByIdInput = __decorate([
    (0, type_graphql_1.InputType)()
], GetCommentByIdInput);
let CreateCommentInput = class CreateCommentInput {
};
exports.CreateCommentInput = CreateCommentInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCommentInput.prototype, "content", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], CreateCommentInput.prototype, "postId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateCommentInput.prototype, "parentCommentId", void 0);
exports.CreateCommentInput = CreateCommentInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateCommentInput);
let UpdateCommentInput = class UpdateCommentInput {
};
exports.UpdateCommentInput = UpdateCommentInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], UpdateCommentInput.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UpdateCommentInput.prototype, "content", void 0);
exports.UpdateCommentInput = UpdateCommentInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateCommentInput);
let GetPostCommentsInput = class GetPostCommentsInput {
};
exports.GetPostCommentsInput = GetPostCommentsInput;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], GetPostCommentsInput.prototype, "postId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GetPostCommentsInput.prototype, "sortBy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GetPostCommentsInput.prototype, "searchTerm", void 0);
exports.GetPostCommentsInput = GetPostCommentsInput = __decorate([
    (0, type_graphql_1.InputType)()
], GetPostCommentsInput);
let GetUserCommentsInput = class GetUserCommentsInput {
};
exports.GetUserCommentsInput = GetUserCommentsInput;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], GetUserCommentsInput.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GetUserCommentsInput.prototype, "sortBy", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetUserCommentsInput.prototype, "limit", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetUserCommentsInput.prototype, "page", void 0);
exports.GetUserCommentsInput = GetUserCommentsInput = __decorate([
    (0, type_graphql_1.InputType)()
], GetUserCommentsInput);
let GetUserHiddenPostsInput = class GetUserHiddenPostsInput {
};
exports.GetUserHiddenPostsInput = GetUserHiddenPostsInput;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GetUserHiddenPostsInput.prototype, "sortBy", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetUserHiddenPostsInput.prototype, "limit", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetUserHiddenPostsInput.prototype, "page", void 0);
exports.GetUserHiddenPostsInput = GetUserHiddenPostsInput = __decorate([
    (0, type_graphql_1.InputType)()
], GetUserHiddenPostsInput);
let GetUserVotedPostsOptions = class GetUserVotedPostsOptions {
};
exports.GetUserVotedPostsOptions = GetUserVotedPostsOptions;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GetUserVotedPostsOptions.prototype, "sortBy", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetUserVotedPostsOptions.prototype, "limit", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], GetUserVotedPostsOptions.prototype, "page", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], GetUserVotedPostsOptions.prototype, "isUpvoted", void 0);
exports.GetUserVotedPostsOptions = GetUserVotedPostsOptions = __decorate([
    (0, type_graphql_1.InputType)()
], GetUserVotedPostsOptions);
let UpdateUserNameInput = class UpdateUserNameInput {
};
exports.UpdateUserNameInput = UpdateUserNameInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UpdateUserNameInput.prototype, "name", void 0);
exports.UpdateUserNameInput = UpdateUserNameInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateUserNameInput);
let JoinCommunityInput = class JoinCommunityInput {
};
exports.JoinCommunityInput = JoinCommunityInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], JoinCommunityInput.prototype, "communityId", void 0);
exports.JoinCommunityInput = JoinCommunityInput = __decorate([
    (0, type_graphql_1.InputType)()
], JoinCommunityInput);
let LeaveCommunityInput = class LeaveCommunityInput {
};
exports.LeaveCommunityInput = LeaveCommunityInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], LeaveCommunityInput.prototype, "communityId", void 0);
exports.LeaveCommunityInput = LeaveCommunityInput = __decorate([
    (0, type_graphql_1.InputType)()
], LeaveCommunityInput);
let RegisterInput = class RegisterInput {
};
exports.RegisterInput = RegisterInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], RegisterInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], RegisterInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], RegisterInput.prototype, "password", void 0);
exports.RegisterInput = RegisterInput = __decorate([
    (0, type_graphql_1.InputType)()
], RegisterInput);
let LoginInput = class LoginInput {
};
exports.LoginInput = LoginInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], LoginInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], LoginInput.prototype, "password", void 0);
exports.LoginInput = LoginInput = __decorate([
    (0, type_graphql_1.InputType)()
], LoginInput);
let ResetPasswordInput = class ResetPasswordInput {
};
exports.ResetPasswordInput = ResetPasswordInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ResetPasswordInput.prototype, "newPassword", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ResetPasswordInput.prototype, "token", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ResetPasswordInput.prototype, "email", void 0);
exports.ResetPasswordInput = ResetPasswordInput = __decorate([
    (0, type_graphql_1.InputType)()
], ResetPasswordInput);
let CheckTokenInput = class CheckTokenInput {
};
exports.CheckTokenInput = CheckTokenInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CheckTokenInput.prototype, "token", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CheckTokenInput.prototype, "email", void 0);
exports.CheckTokenInput = CheckTokenInput = __decorate([
    (0, type_graphql_1.InputType)()
], CheckTokenInput);
let UserResponse = class UserResponse {
};
exports.UserResponse = UserResponse;
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", Object)
], UserResponse.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [User_1.User], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "userArray", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserResponse.prototype, "token", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [resolvers_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UserResponse.prototype, "count", void 0);
exports.UserResponse = UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let VoteResponse = class VoteResponse {
};
exports.VoteResponse = VoteResponse;
__decorate([
    (0, type_graphql_1.Field)(() => Vote_1.Vote, { nullable: true }),
    __metadata("design:type", Object)
], VoteResponse.prototype, "vote", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Vote_1.Vote], { nullable: true }),
    __metadata("design:type", Array)
], VoteResponse.prototype, "votesArray", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [resolvers_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], VoteResponse.prototype, "errors", void 0);
exports.VoteResponse = VoteResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], VoteResponse);
let CreateVoteInput = class CreateVoteInput {
};
exports.CreateVoteInput = CreateVoteInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], CreateVoteInput.prototype, "postId", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], CreateVoteInput.prototype, "commentId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CreateVoteInput.prototype, "isUpvote", void 0);
exports.CreateVoteInput = CreateVoteInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateVoteInput);
let UpdateVoteInput = class UpdateVoteInput {
};
exports.UpdateVoteInput = UpdateVoteInput;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateVoteInput.prototype, "postId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateVoteInput.prototype, "commentId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], UpdateVoteInput.prototype, "isUpvote", void 0);
exports.UpdateVoteInput = UpdateVoteInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateVoteInput);
let DeleteVoteOptions = class DeleteVoteOptions {
};
exports.DeleteVoteOptions = DeleteVoteOptions;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], DeleteVoteOptions.prototype, "postId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], DeleteVoteOptions.prototype, "commentId", void 0);
exports.DeleteVoteOptions = DeleteVoteOptions = __decorate([
    (0, type_graphql_1.InputType)()
], DeleteVoteOptions);
let CreateMessageInput = class CreateMessageInput {
};
exports.CreateMessageInput = CreateMessageInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreateMessageInput.prototype, "content", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateMessageInput.prototype, "media", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], CreateMessageInput.prototype, "chatId", void 0);
exports.CreateMessageInput = CreateMessageInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateMessageInput);
let UpdateMessageInput = class UpdateMessageInput {
};
exports.UpdateMessageInput = UpdateMessageInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UpdateMessageInput.prototype, "content", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], UpdateMessageInput.prototype, "messageId", void 0);
exports.UpdateMessageInput = UpdateMessageInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateMessageInput);
let CreateChatInput = class CreateChatInput {
};
exports.CreateChatInput = CreateChatInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreateChatInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateChatInput.prototype, "image", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], CreateChatInput.prototype, "isGroupChat", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [type_graphql_1.Int]),
    __metadata("design:type", Array)
], CreateChatInput.prototype, "participantIds", void 0);
exports.CreateChatInput = CreateChatInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateChatInput);
let UpdateChatInput = class UpdateChatInput {
};
exports.UpdateChatInput = UpdateChatInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], UpdateChatInput.prototype, "chatId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateChatInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateChatInput.prototype, "image", void 0);
exports.UpdateChatInput = UpdateChatInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateChatInput);
let AddChatParticipantInput = class AddChatParticipantInput {
};
exports.AddChatParticipantInput = AddChatParticipantInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], AddChatParticipantInput.prototype, "chatId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], AddChatParticipantInput.prototype, "participantId", void 0);
exports.AddChatParticipantInput = AddChatParticipantInput = __decorate([
    (0, type_graphql_1.InputType)()
], AddChatParticipantInput);
//# sourceMappingURL=inputs.js.map