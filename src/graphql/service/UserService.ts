import argon2 from "argon2";
import { redisClient } from "../../redis";
import { v4 as uuidv4 } from "uuid";
import { checkMXRecords } from "../../email/checkMXRecords";
import { sendEmail } from "../../email/emailService";
import { env } from "../../env";
import { registerErrorHandler } from "../../lib/utils";
import { UserRepository } from "../repositories/UserRepository";
import { UserResponse } from "../../types/inputs";
import { ConfirmResponse } from "../../types/resolvers";

export class UserService {
  constructor(private repository: typeof UserRepository) {}

  async registerUser({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }): Promise<UserResponse> {
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
      const newUser = await this.repository.registerUser({
        email,
        hashedPassword,
        name,
      });
      // Store user id in session
      const user = newUser[0];
      // Return the new user
      return { user };
      //   Catch errors
    } catch (error) {
      return registerErrorHandler(error);
    }
  }

  async requestConfirmationCode({
    userId,
  }: {
    userId?: number;
  }): Promise<ConfirmResponse> {
    if (!userId) {
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
    try {
      const result = await this.repository.getUserEmailAndConfirmed({ userId });
      if (!result || result.length === 0) {
        return {
          success: false,
          errors: [
            {
              field: "user",
              message: "No user found with that id.",
            },
          ],
        };
      }
      const { email, confirmed } = result[0];
      if (confirmed === true) {
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
      await redisClient.set(`confirmationCode:${email}`, confirmationCode, {
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

  async confirmUser({ userId, code }: { userId?: number; code: string }) {
    try {
      // Check if user is logged in
      if (!userId) {
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
      const result = await this.repository.getUserEmailAndConfirmed({ userId });
      if (result.length === 0) {
        return {
          success: false,
          errors: [
            {
              field: "user",
              message: "No user found with that id.",
            },
          ],
        };
      }
      // Destructure email and confirmed fields from returned user
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
      // Retrieve stored code from session
      const storedCode = await redisClient.get(`confirmationCode:${email}`);
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
      await this.repository.confirmUser({ userId });
      // Remove the code from session
      await redisClient.del(`confirmationCode:${email}`);
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

  async loginUser({
    userId,
    email,
    password,
  }: {
    userId?: number;
    email: string;
    password: string;
  }) {
    // Check if user is already logged in
    if (userId) {
      return {
        errors: [
          {
            field: "root",
            message: "User is already logged in.",
          },
        ],
      };
    }
    // Check if email exists
    const result = await this.repository.getUserByEmail({ email });
    //   Email doesn't exist
    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "email",
            message: "A user with this email does not exist",
          },
        ],
      };
    }
    const user = result[0];
    // Verify password
    const verified = await argon2.verify(user.password, password);
    //   Invalid credentials
    if (!verified) {
      return {
        errors: [{ field: "password", message: "Invalid credentials" }],
      };
    }

    // Return user if successful
    return { user };
  }

  async requestPasswordReset({
    userId,
    email,
  }: {
    userId?: number;
    email: string;
  }): Promise<ConfirmResponse> {
    try {
      // Check if user is already logged in
      if (userId) {
        return {
          success: false,
          errors: [{ field: "root", message: "User is already logged in." }],
        };
      }
      // Check if a user with this email exists
      const result = await this.repository.getUserByEmail({ email });
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
      await redisClient.set(`resetToken:${email}`, resetToken, { EX: 60 * 60 }); // 1 hour expiration
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

  async checkToken({ token, email }: { token: string; email: string }) {
    try {
      // Get stored token from redis
      const storedToken = await redisClient.get(`resetToken:${email}`);
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

  async resetPassword({
    email,
    newPassword,
    token,
  }: {
    email: string;
    newPassword: string;
    token: string;
  }) {
    try {
      // Get stored token from redis
      const storedToken = await redisClient.get(`resetToken:${email}`);
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
      await this.repository.updatePassword({ email, hashedPassword });
      // Delete token from redis
      await redisClient.del(`resetToken:${email}`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: error.message ?? "An error occurred during password reset",
          },
        ],
      };
    }
  }

  async toggleConfirmed({ userId }: { userId?: number }) {
    try {
      if (!userId) {
        return false;
      }
      const user = await this.repository.getUserById({ userId });
      // Toggle confirmed field
      const confirmed = !user[0].confirmed;
      await this.repository.setConfirmed({ userId, confirmed });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async me({ userId }: { userId?: number }): Promise<UserResponse> {
    // Check if user is logged in
    if (!userId) {
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
    const result = await this.repository.getUserById({ userId });
    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "root",
            message: "No user found with that id -which should not happen-",
          },
        ],
      };
    }
    return {
      user: result[0],
    };
  }

  async fetchUserById({ userId }: { userId: number }) {
    const result = await this.repository.getUserById({ userId });
    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "root",
            message: "No user found with that id.",
          },
        ],
      };
    }
    return {
      user: result[0],
    };
  }

  async fetchUserByName({ name }: { name: string }) {
    const result = await this.repository.getUserByName({ name });
    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "name",
            message: "No user found with that name.",
          },
        ],
      };
    }
    return {
      user: result[0],
    };
  }

  async fetchUserSearchResults({
    searchTerm,
    page,
    limit,
  }: {
    searchTerm: string;
    page: number;
    limit: number;
  }) {
    // Fetch users from database
    const result = await this.repository.searchUsers({
      searchTerm,
      limit,
      page,
    });
    // Handle not found error
    if (!result || result.length === 0) {
      return {
        errors: [
          {
            field: "posts",
            message: "No users found",
          },
        ],
      };
    }
    const resultCount = await this.repository.countUserSearchResults({
      searchTerm,
    });
    // Return users
    return {
      userArray: result,
      count: resultCount[0].count,
    };
  }

  async updateUser({
    image,
    name,
    userId,
  }: {
    image?: string;
    name?: string;
    userId?: number;
  }): Promise<ConfirmResponse> {
    // Check if user is logged in
    if (!userId) {
      return {
        success: false,
        errors: [
          {
            field: "root",
            message: "You must be logged in to update a user",
          },
        ],
      };
    }
    // Update user's data
    try {
      await this.repository.updateUser({ image, name, userId });
      return {
        success: true,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        errors: [
          {
            field: "root",
            message:
              error.message ??
              "An error occurred during changing profile picture",
          },
        ],
      };
    }
  }

  async deleteUser({ userId }: { userId: number }): Promise<ConfirmResponse> {
    // delete user's data
    try {
      await this.repository.deleteUser({ userId });
      return {
        success: true,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        errors: [
          {
            field: "root",
            message:
              error.message ??
              "An error occurred during changing profile picture",
          },
        ],
      };
    }
  }
}
