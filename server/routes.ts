import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Mock auth user route for testing UI easily
  app.get(api.users.me.path, async (req, res) => {
    const usersList = await storage.getUsersByRole('customer');
    if (usersList.length > 0) {
      res.json(usersList[0]);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  app.get(api.users.list.path, async (req, res) => {
    const role = req.query.role as string | undefined;
    const usersList = role ? await storage.getUsersByRole(role) : await storage.getUsers();
    res.json(usersList);
  });

  app.get(api.services.list.path, async (req, res) => {
    const svcs = await storage.getServices();
    res.json(svcs);
  });

  app.get(api.bookings.list.path, async (req, res) => {
    const role = req.query.role as string | undefined;
    const userId = req.query.userId as string | undefined;
    
    let bks;
    if (role && userId) {
      bks = await storage.getUserBookings(parseInt(userId), role);
    } else {
      bks = await storage.getBookings();
    }
    res.json(bks);
  });

  app.post(api.bookings.create.path, async (req, res) => {
    try {
      const bodySchema = api.bookings.create.input.extend({
        customerId: z.coerce.number(),
        serviceId: z.coerce.number(),
        providerId: z.coerce.number().optional().nullable(),
      });
      const input = bodySchema.parse(req.body);
      const booking = await storage.createBooking(input);
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.patch(api.bookings.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.bookings.update.input.parse(req.body);
      const booking = await storage.updateBooking(id, input);
      res.json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.get(api.dashboard.stats.path, async (req, res) => {
    const bookingsList = await storage.getBookings();
    const providers = await storage.getUsersByRole('provider');
    res.json({
      totalBookings: bookingsList.length,
      revenue: bookingsList.length * 150, // Mock revenue calc
      activeProviders: providers.length,
      satisfaction: 4.8
    });
  });

  app.patch(api.users.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.users.update.input.parse(req.body);
      const user = await storage.updateUser(id, input);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.get(api.reviews.list.path, async (req, res) => {
    const providerId = req.query.providerId as string | undefined;
    if (providerId) {
      const reviews = await storage.getReviewsByProvider(parseInt(providerId));
      res.json(reviews);
    } else {
      res.json([]);
    }
  });

  app.post(api.reviews.create.path, async (req, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const review = await storage.createReview(input);
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.get(api.dashboard.stats.path, async (req, res) => {
    const bookingsList = await storage.getBookings();
    const providers = await storage.getUsersByRole('provider');
    const revenue = bookingsList.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
    
    // Mock trend data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const bookingsTrend = last7Days.map(date => ({
      date,
      count: Math.floor(Math.random() * 10) + 2
    }));

    const categoryStats = [
      { name: 'Nursing', value: 40 },
      { name: 'Therapy', value: 30 },
      { name: 'Recovery', value: 20 },
      { name: 'Personal Care', value: 10 },
    ];

    res.json({
      totalBookings: bookingsList.length,
      activeBookings: bookingsList.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length,
      completedBookings: bookingsList.filter(b => b.status === 'completed').length,
      revenue,
      activeProviders: providers.length,
      satisfaction: 4.8,
      bookingsTrend,
      categoryStats
    });
  });

  // Seed data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingUsers = await storage.getUsers();
  if (existingUsers.length === 0) {
    // Customers
    const customer = await storage.createUser({ role: 'customer', name: 'Alice Smith', email: 'alice@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=alice', address: '123 Health Ave, Wellness City', phone: '555-0101' });
    
    // Providers
    const provider1 = await storage.createUser({ role: 'provider', name: 'Dr. Sarah Jenkins', email: 'sarah@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=sarah', specialization: 'Home Nursing', bio: 'Expert home nursing with 10 years experience.', rating: 5 });
    const provider2 = await storage.createUser({ role: 'provider', name: 'Nurse Mark Don', email: 'mark@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=mark', specialization: 'Physiotherapy', bio: 'Compassionate care for all ages.', rating: 4 });
    
    // Admins
    await storage.createUser({ role: 'admin', name: 'Admin User', email: 'admin@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=admin' });

    // Services
    const service1 = await storage.createService({ name: 'Home Nursing Care', description: 'Professional nursing care in the comfort of your home.', category: 'Nursing', price: 15000, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80', isFeatured: 1 });
    const service2 = await storage.createService({ name: 'Physiotherapy Session', description: 'Expert physiotherapy to help you recover faster.', category: 'Therapy', price: 12000, durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80', isFeatured: 1 });
    const service3 = await storage.createService({ name: 'Post-Surgery Support', description: 'Comprehensive support after surgical procedures.', category: 'Recovery', price: 20000, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800&q=80', isFeatured: 0 });

    // Bookings
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    await storage.createBooking({ customerId: customer.id, providerId: provider1.id, serviceId: service1.id, status: 'completed', scheduledDate: yesterday, address: '123 Health Ave, Wellness City', notes: 'Initial checkup.', totalPrice: 15000, paymentStatus: 'paid' });
    await storage.createBooking({ customerId: customer.id, providerId: provider1.id, serviceId: service1.id, status: 'confirmed', scheduledDate: tomorrow, address: '123 Health Ave, Wellness City', notes: 'Please ring the bell twice.', totalPrice: 15000, paymentStatus: 'paid' });
    await storage.createBooking({ customerId: customer.id, providerId: provider2.id, serviceId: service2.id, status: 'pending', scheduledDate: nextWeek, address: '123 Health Ave, Wellness City', notes: 'Looking forward to the session.', totalPrice: 12000, paymentStatus: 'unpaid' });

    // Reviews
    await storage.createReview({ bookingId: 1, customerId: customer.id, providerId: provider1.id, rating: 5, comment: 'Excellent care, very professional!' });
  }
}
