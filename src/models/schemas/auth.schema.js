const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(2, 'Name must be at least 2 characters'),
  last_name: z.string().min(2, 'Name must be at least 2 characters'),
  roles: z.array(z.enum(['client', 'investigator']))
    .min(1, 'At least one role is required')
    .refine(
      (roles) => roles.every(role => ['client', 'investigator'].includes(role)),
      { message: 'Each role must be either client or investigator' }
    )
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

module.exports = {
  registerSchema,
  loginSchema
}; 