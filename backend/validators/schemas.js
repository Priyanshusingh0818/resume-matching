import { z } from 'zod';

export const ResumeParseResultSchema = z.object({
  skills: z.array(z.string()).default([]),
  experience: z.string().default('Not specified'),
  education: z.string().default('Not specified'),
  experience_entries: z.array(z.object({
    title: z.string().optional().default(''),
    company: z.string().optional().default(''),
    duration: z.string().optional().default(''),
    description: z.string().optional().default(''),
  })).optional().default([]),
  education_entries: z.array(z.object({
    degree: z.string().optional().default(''),
    field: z.string().optional().default(''),
    school: z.string().optional().default(''),
    year: z.string().optional().default(''),
    gpa: z.string().optional().default(''),
  })).optional().default([]),
  certifications: z.array(z.string()).optional().default([]),
  summary: z.string().optional().default(''),
  recommendations: z.array(z.string()).default([]),
});

export const JobCreateSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  skills: z.array(z.string().min(1)).min(1, 'At least one skill is required'),
  company: z.string().min(1, 'Company name is required'),
});

export const UserRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'admin']).default('student'),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  education: z.array(z.object({
    title: z.string().optional(),
    school: z.string().optional(),
    degree: z.string().optional(),
    spec: z.string().optional(),
    year: z.string().optional(),
    gpa: z.string().optional(),
  })).optional(),
  preferences: z.record(z.any()).optional(),
});
