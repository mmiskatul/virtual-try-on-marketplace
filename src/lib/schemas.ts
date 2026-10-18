import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Recipient full name must be at least 2 characters')
    .max(80, 'Full name cannot exceed 80 characters'),
  email: z
    .string()
    .email('Please enter a valid order confirmation email address'),
  address: z
    .string()
    .min(5, 'Delivery address must be at least 5 characters')
    .max(120, 'Address cannot exceed 120 characters'),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters'),
  postalCode: z
    .string()
    .min(3, 'Postal/ZIP code must be at least 3 characters')
    .regex(/^[A-Z0-9 -]+$/i, 'Please enter a valid alphanumeric postal code'),
  country: z
    .string()
});

export type ShippingAddressFormValues = z.infer<typeof shippingAddressSchema>;

export const customerAuthSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export type CustomerAuthFormValues = z.infer<typeof customerAuthSchema>;
