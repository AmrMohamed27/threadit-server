import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import {
  CheckTokenInput,
  GetSearchResultInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateUserImageInput,
  UpdateUserNameInput,
  UserResponse,
} from "../../types/inputs";
import { ConfirmResponse, MyContext } from "../../types/resolvers";

@Resolver()
export class UserResolver {
  // Register a new user
  @Mutation(() => UserResponse)
  async registerUser(
    @Ctx() ctx: MyContext,
    @Arg("userData") userData: RegisterInput
  ): Promise<UserResponse> {
    // Destructure email, password, and name from userData
    const { email, password, name } = userData;
    return await ctx.Services.users.registerUser({
      email,
      password,
      name,
    });
  }
  // Request a confirmation Code
  @Mutation(() => ConfirmResponse)
  async requestConfirmationCode(
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
    // Get email
    const userId = ctx.userId;
    return await ctx.Services.users.requestConfirmationCode({ userId });
  }

  // Confirm user
  @Mutation(() => ConfirmResponse)
  async confirmUser(
    @Ctx() ctx: MyContext,
    @Arg("code") code: string
  ): Promise<ConfirmResponse> {
    const userId = ctx.userId;
    return await ctx.Services.users.confirmUser({ userId, code });
  }

  // Login a new user
  @Mutation(() => UserResponse)
  async loginUser(
    @Ctx() ctx: MyContext,
    @Arg("userData") userData: LoginInput
  ): Promise<UserResponse> {
    const userId = ctx.userId;
    // Destructure email and password from userData
    const { email, password } = userData;
    return await ctx.Services.users.loginUser({
      userId,
      email,
      password,
    });
  }

  // Request a password reset
  @Mutation(() => ConfirmResponse)
  async requestPasswordReset(
    @Ctx() ctx: MyContext,
    @Arg("email") email: string
  ): Promise<ConfirmResponse> {
    const userId = ctx.userId;
    return await ctx.Services.users.requestPasswordReset({
      userId,
      email,
    });
  }

  // Check if token exists
  @Query(() => ConfirmResponse)
  async checkToken(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CheckTokenInput
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { email, token } = options;
    return await ctx.Services.users.checkToken({ token, email });
  }

  // Reset password
  @Mutation(() => ConfirmResponse)
  async resetPassword(
    @Ctx() ctx: MyContext,
    @Arg("options") options: ResetPasswordInput
  ): Promise<ConfirmResponse> {
    // Destructure input
    const { email, newPassword, token } = options;
    return await ctx.Services.users.resetPassword({
      email,
      newPassword,
      token,
    });
  }

  // Logout a user
  @Mutation(() => Boolean)
  async logoutUser(): Promise<boolean> {
    return true;
  }

  // Toggle Confirmed field in users table
  @Mutation(() => Boolean)
  async toggleConfirmed(@Ctx() ctx: MyContext) {
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.users.toggleConfirmed({ userId });
  }

  // Me query
  @Query(() => UserResponse)
  async me(@Ctx() ctx: MyContext): Promise<UserResponse> {
    const userId = ctx.userId;
    return await ctx.Services.users.me({ userId });
  }

  // Get user by id
  @Query(() => UserResponse)
  async getUserById(@Ctx() ctx: MyContext, @Arg("id", () => Int) id: number) {
    return await ctx.Services.users.fetchUserById({ userId: id });
  }

  // Query to search for a user with a search term
  @Query(() => UserResponse)
  async searchForUser(
    @Ctx() ctx: MyContext,
    @Arg("options") options: GetSearchResultInput
  ): Promise<UserResponse> {
    // Destructure input
    const { searchTerm, page, limit } = options;
    return await ctx.Services.users.fetchUserSearchResults({
      searchTerm,
      page,
      limit,
    });
  }

  // Get user by name
  @Query(() => UserResponse)
  async getUserByName(
    @Ctx() ctx: MyContext,
    @Arg("name", () => String) name: string
  ) {
    return await ctx.Services.users.fetchUserByName({ name });
  }

  // Update user profile picture
  @Mutation(() => ConfirmResponse)
  async updateUserImage(
    @Ctx() ctx: MyContext,
    @Arg("options") options: UpdateUserImageInput
  ): Promise<ConfirmResponse> {
    // Destructure email and password from userData
    const { image } = options;
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.users.updateUser({ image, userId });
  }

  // Update user name
  @Mutation(() => ConfirmResponse)
  async updateUserName(
    @Ctx() ctx: MyContext,
    @Arg("options") options: UpdateUserNameInput
  ): Promise<ConfirmResponse> {
    // Destructure email and password from userData
    const { name } = options;
    // Get user id from session
    const userId = ctx.userId;
    return await ctx.Services.users.updateUser({ name, userId });
  }
}
