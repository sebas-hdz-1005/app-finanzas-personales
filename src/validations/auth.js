import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'El email es obligatorio').email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(80),
    email: z.string().trim().min(1, 'El email es obligatorio').email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const recoverSchema = z.object({
  email: z.string().trim().min(1, 'El email es obligatorio').email('Email inválido'),
});
