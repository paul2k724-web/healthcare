import { z } from 'zod';
import { insertBookingSchema, insertUserSchema, insertReviewSchema, users, services, bookings, reviews } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  users: {
    me: {
      method: 'GET' as const,
      path: '/api/users/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/users' as const,
      input: z.object({ role: z.string().optional() }).optional(),
      responses: { 200: z.array(z.custom<typeof users.$inferSelect>()) },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/users/:id' as const,
      input: insertUserSchema.partial(),
      responses: { 200: z.custom<typeof users.$inferSelect>(), 404: errorSchemas.notFound },
    }
  },
  services: {
    list: {
      method: 'GET' as const,
      path: '/api/services' as const,
      responses: { 200: z.array(z.custom<typeof services.$inferSelect>()) },
    }
  },
  bookings: {
    list: {
      method: 'GET' as const,
      path: '/api/bookings' as const,
      input: z.object({ 
        role: z.enum(['customer', 'provider', 'admin']),
        userId: z.string().optional()
      }).optional(),
      responses: { 200: z.array(z.custom<typeof bookings.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookings' as const,
      input: insertBookingSchema,
      responses: { 201: z.custom<typeof bookings.$inferSelect>(), 400: errorSchemas.validation },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id' as const,
      input: insertBookingSchema.partial(),
      responses: { 200: z.custom<typeof bookings.$inferSelect>(), 404: errorSchemas.notFound },
    }
  },
  reviews: {
    create: {
      method: 'POST' as const,
      path: '/api/reviews' as const,
      input: insertReviewSchema,
      responses: { 201: z.custom<typeof reviews.$inferSelect>(), 400: errorSchemas.validation },
    },
    list: {
      method: 'GET' as const,
      path: '/api/reviews' as const,
      input: z.object({ providerId: z.string().optional() }).optional(),
      responses: { 200: z.array(z.custom<typeof reviews.$inferSelect>()) },
    }
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          totalBookings: z.number(),
          activeBookings: z.number(),
          completedBookings: z.number(),
          revenue: z.number(),
          activeProviders: z.number(),
          satisfaction: z.number(),
          bookingsTrend: z.array(z.object({ date: z.string(), count: z.number() })),
          categoryStats: z.array(z.object({ name: z.string(), value: z.number() })),
        })
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
