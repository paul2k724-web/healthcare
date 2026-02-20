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
  private async getDb() {
    const { db } = await import("./db");
    return db;
  }

  async getUsers(): Promise<User[]> {
    const db = await this.getDb();
    return await db.select().from(users);
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    const db = await this.getDb();
    return await db.select().from(users).where(eq(users.role, role));
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.getDb();
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const db = await this.getDb();
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getServices(): Promise<Service[]> {
    const db = await this.getDb();
    return await db.select().from(services);
  }
  
  async getService(id: number): Promise<Service | undefined> {
    const db = await this.getDb();
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }
  
  async createService(insertService: InsertService): Promise<Service> {
    const db = await this.getDb();
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async getBookings(): Promise<Booking[]> { 
    const db = await this.getDb();
    return await db.select().from(bookings).orderBy(desc(bookings.scheduledDate)); 
  }
  
  async getUserBookings(userId: number, role: string): Promise<Booking[]> {
    const db = await this.getDb();
    if (role === 'customer') {
      return await db.select().from(bookings).where(eq(bookings.customerId, userId)).orderBy(desc(bookings.scheduledDate));
    } else if (role === 'provider') {
      return await db.select().from(bookings).where(eq(bookings.providerId, userId)).orderBy(desc(bookings.scheduledDate));
    }
    return this.getBookings();
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const db = await this.getDb();
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }
  
  async updateBooking(id: number, updates: UpdateBookingRequest): Promise<Booking> {
    const db = await this.getDb();
    const [booking] = await db.update(bookings).set(updates).where(eq(bookings.id, id)).returning();
    return booking;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const db = await this.getDb();
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async getReviewsByProvider(providerId: number): Promise<Review[]> {
    const db = await this.getDb();
    return await db.select().from(reviews).where(eq(reviews.providerId, providerId)).orderBy(desc(reviews.createdAt));
  }
}

export class MemoryStorage implements IStorage {
  private usersData: User[] = [];
  private servicesData: Service[] = [];
  private bookingsData: Booking[] = [];
  private reviewsData: Review[] = [];

  private nextUserId = 1;
  private nextServiceId = 1;
  private nextBookingId = 1;
  private nextReviewId = 1;

  private notFound(message: string) {
    const error = new Error(message) as Error & { status?: number };
    error.status = 404;
    return error;
  }

  async getUsers(): Promise<User[]> {
    return this.usersData;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.find((user) => user.id === id);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return this.usersData.filter((user) => user.role === role);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      role: insertUser.role,
      name: insertUser.name,
      email: insertUser.email,
      avatarUrl: insertUser.avatarUrl ?? null,
      phone: insertUser.phone ?? null,
      address: insertUser.address ?? null,
      bio: insertUser.bio ?? null,
      specialization: insertUser.specialization ?? null,
      rating: insertUser.rating ?? 5,
    };
    this.usersData.push(user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const user = this.usersData.find((item) => item.id === id);
    if (!user) {
      throw this.notFound("User not found");
    }
    Object.assign(user, updates);
    return user;
  }

  async getServices(): Promise<Service[]> {
    return this.servicesData;
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.servicesData.find((service) => service.id === id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const service: Service = {
      id: this.nextServiceId++,
      name: insertService.name,
      description: insertService.description,
      category: insertService.category,
      price: insertService.price,
      durationMinutes: insertService.durationMinutes,
      imageUrl: insertService.imageUrl ?? null,
      isFeatured: insertService.isFeatured ?? 0,
    };
    this.servicesData.push(service);
    return service;
  }

  async getBookings(): Promise<Booking[]> {
    return [...this.bookingsData].sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
  }

  async getUserBookings(userId: number, role: string): Promise<Booking[]> {
    const all = await this.getBookings();
    if (role === 'customer') {
      return all.filter((booking) => booking.customerId === userId);
    }
    if (role === 'provider') {
      return all.filter((booking) => booking.providerId === userId);
    }
    return all;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const booking: Booking = {
      id: this.nextBookingId++,
      customerId: insertBooking.customerId,
      providerId: insertBooking.providerId ?? null,
      serviceId: insertBooking.serviceId,
      status: insertBooking.status ?? 'pending',
      scheduledDate: insertBooking.scheduledDate,
      address: insertBooking.address,
      notes: insertBooking.notes ?? null,
      totalPrice: insertBooking.totalPrice,
      paymentStatus: insertBooking.paymentStatus ?? 'unpaid',
      createdAt: new Date(),
    };
    this.bookingsData.push(booking);
    return booking;
  }

  async updateBooking(id: number, updates: UpdateBookingRequest): Promise<Booking> {
    const booking = this.bookingsData.find((item) => item.id === id);
    if (!booking) {
      throw this.notFound("Booking not found");
    }
    Object.assign(booking, updates);
    return booking;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const review: Review = {
      id: this.nextReviewId++,
      bookingId: insertReview.bookingId,
      customerId: insertReview.customerId,
      providerId: insertReview.providerId,
      rating: insertReview.rating,
      comment: insertReview.comment ?? null,
      createdAt: new Date(),
    };
    this.reviewsData.push(review);
    return review;
  }

  async getReviewsByProvider(providerId: number): Promise<Review[]> {
    return this.reviewsData
      .filter((review) => review.providerId === providerId)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }
}

export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemoryStorage();
