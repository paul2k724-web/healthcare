import { db } from "./db";
import { users, services, bookings, reviews, type User, type InsertUser, type Service, type InsertService, type Booking, type InsertBooking, type UpdateBookingRequest, type Review, type InsertReview } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  // Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getUserBookings(userId: number, role: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, updates: UpdateBookingRequest): Promise<Booking>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByProvider(providerId: number): Promise<Review[]>;
}

export class DatabaseStorage implements IStorage {
  async getUsers(): Promise<User[]> { return await db.select().from(users); }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getServices(): Promise<Service[]> { return await db.select().from(services); }
  
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }
  
  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async getBookings(): Promise<Booking[]> { 
    return await db.select().from(bookings).orderBy(desc(bookings.scheduledDate)); 
  }
  
  async getUserBookings(userId: number, role: string): Promise<Booking[]> {
    if (role === 'customer') {
      return await db.select().from(bookings).where(eq(bookings.customerId, userId)).orderBy(desc(bookings.scheduledDate));
    } else if (role === 'provider') {
      return await db.select().from(bookings).where(eq(bookings.providerId, userId)).orderBy(desc(bookings.scheduledDate));
    }
    return this.getBookings();
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }
  
  async updateBooking(id: number, updates: UpdateBookingRequest): Promise<Booking> {
    const [booking] = await db.update(bookings).set(updates).where(eq(bookings.id, id)).returning();
    return booking;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async getReviewsByProvider(providerId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.providerId, providerId)).orderBy(desc(reviews.createdAt));
  }
}

export const storage = new DatabaseStorage();
