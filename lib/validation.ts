import { z } from 'zod';

// Auth validation
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Link validation
export const CreateLinkSchema = z.object({
  name: z.string().min(1, 'Link name is required').max(100),
  destinationUrl: z
    .string()
    .url('Invalid URL')
    .refine((url) => {
      const disallowedSchemes = ['javascript:', 'data:', 'file:'];
      return !disallowedSchemes.some((scheme) => url.startsWith(scheme));
    }, 'Invalid URL scheme'),
  retentionDays: z.number().int().min(7).max(365).default(30),
  expiresAt: z.string().datetime().optional(),
});

export const UpdateLinkSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  retentionDays: z.number().int().min(7).max(365).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

// Visitor validation
export const LocationConsentSchema = z.object({
  consentGiven: z.boolean(),
});

export const PreciseLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateLinkInput = z.infer<typeof CreateLinkSchema>;
export type UpdateLinkInput = z.infer<typeof UpdateLinkSchema>;
