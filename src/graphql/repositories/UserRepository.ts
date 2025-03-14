import { asc, count, eq, ilike } from "drizzle-orm";
import { db } from "../../database/db";
import { users } from "../../database/schema";

export class UserRepository {
  static async registerUser({
    email,
    hashedPassword,
    name,
  }: {
    email: string;
    hashedPassword: string;
    name: string;
  }) {
    return await db
      .insert(users)
      .values({ email, password: hashedPassword, name })
      .returning();
  }
  static async getUserById({ userId }: { userId: number }) {
    return await db.select().from(users).where(eq(users.id, userId));
  }

  static async getUserByEmail({ email }: { email: string }) {
    return await db.select().from(users).where(eq(users.email, email));
  }

  static async getUserByName({ name }: { name: string }) {
    return await db.select().from(users).where(eq(users.name, name));
  }
  static async getUserEmailAndConfirmed({ userId }: { userId: number }) {
    return await db
      .select({
        email: users.email,
        confirmed: users.confirmed,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, userId));
  }
  static async confirmUser({ userId }: { userId: number }) {
    return await db
      .update(users)
      .set({ confirmed: true })
      .where(eq(users.id, userId));
  }
  static async updatePassword({
    email,
    hashedPassword,
  }: {
    email: string;
    hashedPassword: string;
  }) {
    return db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, email));
  }
  static async setConfirmed({
    userId,
    confirmed,
  }: {
    userId: number;
    confirmed: boolean;
  }) {
    return await db
      .update(users)
      .set({
        confirmed,
      })
      .where(eq(users.id, userId));
  }
  static async searchUsers({
    searchTerm,
    limit,
    page,
  }: {
    searchTerm: string;
    limit: number;
    page: number;
  }) {
    return await db
      .select()
      .from(users)
      .where(ilike(users.name, "%" + searchTerm + "%"))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(asc(users.name));
  }
  static async countUserSearchResults({ searchTerm }: { searchTerm: string }) {
    return await db
      .select({ count: count() })
      .from(users)
      .where(ilike(users.name, "%" + searchTerm + "%"));
  }
  static async updateUser({
    name,
    image,
    userId,
  }: {
    name?: string;
    image?: string;
    userId: number;
  }) {
    return await db
      .update(users)
      .set({ name: name ?? users.name, image: image ?? users.image })
      .where(eq(users.id, userId));
  }
  static async deleteUser({ userId }: { userId: number }) {
    return await db.delete(users).where(eq(users.id, userId));
  }
}
