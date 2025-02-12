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
import { returnedUserWithoutPassword, users } from "../../database/schema";
import { User } from "../types/User";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { MyContext } from "../types";
import { env } from "../../env";

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

// Error Type
@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

// Login Return Type
@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: returnedUserWithoutPassword;
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

// Function to handle register errors
function registerErrorhandler(error: any): UserResponse {
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
          field: "username",
          message: "A user with this username already exists",
        },
      ],
    };
  }
  //   Generic error
  return {
    errors: [
      {
        field: "register",
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
    // Hash password
    const hashedPassword = await argon2.hash(password);
    // Try to create a new user and handle errors
    try {
      // Create a new user
      const newUser = await ctx.db
        .insert(users)
        .values({ email, password: hashedPassword, name })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          image: users.image,
        });
      // Store user id in session
      const user = newUser[0];
      ctx.req.session.userId = user.id;
      // Return the new user
      return { user };
      //   Catch errors
    } catch (error) {
      return registerErrorhandler(error);
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
            field: "session",
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

  // Me query
  @Query(() => UserResponse)
  async me(@Ctx() ctx: MyContext): Promise<UserResponse> {
    // Check if user is logged in
    if (!ctx.req.session.userId) {
      return {
        errors: [
          {
            field: "user",
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
