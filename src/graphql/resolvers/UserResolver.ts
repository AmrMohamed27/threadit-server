import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { returnedUser, users } from "../../database/schema";
import { User } from "../types/User";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { ConfirmResponse, FieldError, MyContext } from "../types";
import { env } from "../../env";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../../email/emailService";
import { checkMXRecords } from "../../email/checkMXRecords";

// Register input type
@InputType()
class RegisterInput {
  @Field()
  name: string;
  @Field()
  email: string;
  @Field()
  password: string;
}

// Login Input type
@InputType()
class LoginInput {
  @Field()
  email: string;
  @Field()
  password: string;
}

// Reset password input type
@InputType()
class ResetPasswordInput {
  @Field()
  newPassword: string;
  @Field()
  token: string;
  @Field()
  email: string;
}

@InputType()
class CheckTokenInput {
  @Field()
  token: string;
  @Field()
  email: string;
}

// Login Return Type
@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: returnedUser;
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

// Function to handle register errors
function registerErrorHandler(error: any): UserResponse {
  // Duplicate email error
  if (error.constraint === "users_email_unique") {
    return {
      errors: [
        {
          field: "email",
          message: "A user with this email already exists",
        },
      ],
    };
  }
  // Duplicate username error
  if (error.constraint === "users_name_unique") {
    return {
      errors: [
        {
          field: "name",
          message: "A user with this username already exists",
        },
      ],
    };
  }
  //   Generic error
  return {
    errors: [
      {
        field: "root",
        message: error.message,
      },
    ],
  };
}

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
    // Validate email provider
    const isValid = await checkMXRecords(email);
    if (!isValid) {
      return {
        errors: [
          {
            field: "email",
            message: "Email is not valid.",
          },
        ],
      };
    }
    // Hash password
    const hashedPassword = await argon2.hash(password);
    // Try to create a new user and handle errors
    try {
      // Create a new user
      const newUser = await ctx.db
        .insert(users)
        .values({ email, password: hashedPassword, name })
        .returning();
      // Store user id in session
      const user = newUser[0];
      ctx.req.session.userId = user.id;
      // Return the new user
      return { user };
      //   Catch errors
    } catch (error) {
      return registerErrorHandler(error);
    }
  }
  // Request a confirmation Code
  @Mutation(() => ConfirmResponse)
  async requestConfirmationCode(
    @Ctx() ctx: MyContext
  ): Promise<ConfirmResponse> {
    try {
      // Get email
      if (!ctx.req.session.userId) {
        return {
          success: false,
          errors: [
            {
              field: "user",
              message: "Please log in to confirm your email.",
            },
          ],
        };
      }
      const result = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, ctx.req.session.userId));
      const { email, confirmed } = result[0];
      if (confirmed) {
        return {
          success: false,
          errors: [
            {
              field: "confirmed",
              message: "User is already confirmed.",
            },
          ],
        };
      }
      // Generate confirmation code
      const confirmationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      // Save confirmation code to redis
      await ctx.redis.set(`confirmationCode:${email}`, confirmationCode, {
        EX: 300, // 5 minutes
      });
      // Send the confirmation email
      await sendEmail({
        to: email,
        subject: "Confirm your account",
        text: `Your confirmation code is: ${confirmationCode}`,
      });
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: error.message,
          },
        ],
      };
    }
  }

  // Confirm user
  @Mutation(() => ConfirmResponse)
  async confirmUser(
    @Ctx() ctx: MyContext,
    @Arg("code") code: string
  ): Promise<ConfirmResponse> {
    try {
      // Check if user id exists in session
      if (!ctx.req.session.userId) {
        return {
          success: false,
          errors: [
            {
              field: "session",
              message: "Please log in to confirm your email.",
            },
          ],
        };
      }
      // Get user with id from session
      const result = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, ctx.req.session.userId));
      // Destructure email and confirmed fields from returned user
      const { email, confirmed, id } = result[0];
      if (confirmed) {
        return {
          success: false,
          errors: [
            {
              field: "confirmed",
              message: "User is already confirmed.",
            },
          ],
        };
      }
      // Retrieve stored code from session
      const storedCode = await ctx.redis.get(`confirmationCode:${email}`);
      if (!storedCode || storedCode !== code) {
        return {
          success: false,
          errors: [
            {
              field: "code",
              message: "Invalid or expired confirmation code.",
            },
          ],
        };
      }
      // Mark user as confirmed in the database
      await ctx.db
        .update(users)
        .set({ confirmed: true })
        .where(eq(users.id, id));
      // Remove the code from session
      await ctx.redis.del(`confirmationCode:${email}`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: error.message,
          },
        ],
      };
    }
  }

  // Login a new user
  @Mutation(() => UserResponse)
  async loginUser(
    @Ctx() ctx: MyContext,
    @Arg("userData") userData: LoginInput
  ): Promise<UserResponse> {
    // Check if user is already logged in
    if (ctx.req.session.userId) {
      return {
        errors: [
          {
            field: "root",
            message: "User is already logged in.",
          },
        ],
      };
    }
    // Destructure email and password from userData
    const { email, password } = userData;
    // Check if email exists
    const userExists = await ctx.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    //   Email doesn't exist
    if (!userExists || userExists.length === 0) {
      return {
        errors: [
          {
            field: "email",
            message: "A user with this email does not exist",
          },
        ],
      };
    }
    const user = userExists[0];
    // Verify password
    const verified = await argon2.verify(user.password, password);
    //   Invalid credentials
    if (!verified) {
      return {
        errors: [{ field: "password", message: "Invalid credentials" }],
      };
    }
    // Store user id in session
    ctx.req.session.userId = user.id;
    // Return user if successful
    return { user };
  }

  // Request a password reset
  @Mutation(() => ConfirmResponse)
  async requestPasswordReset(
    @Ctx() ctx: MyContext,
    @Arg("email") email: string
  ): Promise<ConfirmResponse> {
    try {
      // Check if user is already logged in
      if (ctx.req.session.userId) {
        return {
          success: false,
          errors: [{ field: "root", message: "User is already logged in." }],
        };
      }
      // Check if a user with this email exists
      const result = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, email));
      if (result.length === 0) {
        return {
          success: false,
          errors: [
            {
              field: "email",
              message: "A user with this email does not exist.",
            },
          ],
        };
      }
      // Generate reset token
      const resetToken = uuidv4();
      // Store in redis
      await ctx.redis.set(`resetToken:${email}`, resetToken, { EX: 60 * 60 }); // 1 hour expiration
      // Send reset email
      await sendEmail({
        to: email,
        subject: "Password Reset",
        text: `Visit this link to reset your password: ${env.CORS_ORIGIN_FRONTEND}/forgot-password/${resetToken}?email=${email}`,
      });
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: "root", message: error.message }],
      };
    }
  }

  // Check if token exists
  @Query(() => ConfirmResponse)
  async checkToken(
    @Ctx() ctx: MyContext,
    @Arg("options") options: CheckTokenInput
  ): Promise<ConfirmResponse> {
    try {
      // Destructure input
      const { email, token } = options;
      // Get stored token from redis
      const storedToken = await ctx.redis.get(`resetToken:${email}`);
      if (!storedToken || storedToken !== token) {
        return {
          success: false,
          errors: [
            {
              field: "token",
              message: "Invalid or expired token.",
            },
          ],
        };
      }
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: error.message,
          },
        ],
      };
    }
  }

  // Reset password
  @Mutation(() => ConfirmResponse)
  async resetPassword(
    @Ctx() ctx: MyContext,
    @Arg("options") options: ResetPasswordInput
  ): Promise<ConfirmResponse> {
    try {
      // Destructure input
      const { email, newPassword, token } = options;
      // Get stored token from redis
      const storedToken = await ctx.redis.get(`resetToken:${email}`);
      if (!storedToken || storedToken !== token) {
        return {
          success: false,
          errors: [
            {
              field: "token",
              message: "Invalid or expired token.",
            },
          ],
        };
      }
      // Hash new password
      const hashedPassword = await argon2.hash(newPassword);
      // Update user's password in the database
      await ctx.db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, email));
      // Delete token from redis
      await ctx.redis.del(`resetToken:${email}`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: error.message,
          },
        ],
      };
    }
  }

  // Logout a user
  @Mutation(() => Boolean)
  async logoutUser(@Ctx() ctx: MyContext): Promise<boolean> {
    return new Promise((resolve) =>
      ctx.req.session.destroy((err) => {
        ctx.res.clearCookie(env.COOKIE_NAME);
        if (err) {
          console.error(err);
          resolve(false);
        }
        resolve(true);
      })
    );
  }

  // Toggle Confirmed field in users table
  @Mutation(() => Boolean)
  async toggleConfirmed(@Ctx() ctx: MyContext) {
    try {
      // Get user by id
      const id = ctx.req.session.userId;
      if (!id) {
        return false;
      }
      const user = await ctx.db.select().from(users).where(eq(users.id, id));
      // Toggle confirmed field
      const confirmed = !user[0].confirmed;
      await ctx.db.update(users).set({ confirmed }).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // Me query
  @Query(() => UserResponse)
  async me(@Ctx() ctx: MyContext): Promise<UserResponse> {
    // Check if user is logged in
    console.log("Session object:", ctx.req.session);
    console.log("User ID in session:", ctx.req.session.userId);
    if (!ctx.req.session.userId) {
      return {
        errors: [
          {
            field: "root",
            message: "User is not logged in",
          },
        ],
      };
    }
    // Get user by id
    const user = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.req.session.userId));
    // Return user
    return { user: user[0] };
  }
}
