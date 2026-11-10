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

const strongPasswordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Za-z]/, 'Password must include at least one letter')
  .regex(/[0-9]/, 'Password must include at least one number');

export const customerRegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(80, 'Full name cannot exceed 80 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: strongPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type CustomerRegisterFormValues = z.infer<typeof customerRegisterSchema>;

export const verifyEmailSchema = z.object({
  email: z.string().email('Please enter your registered email address'),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: strongPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
