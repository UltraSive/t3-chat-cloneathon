import { z } from 'zod';

const traitSchema = z.string().max(100);

export const customizeSchema = z.object({
  nickname: z.string()
    .max(50, "Name must be at most 50 characters long")
    .optional()
    .default(""),
  occupation: z.string()
    .max(100, "Occupation must be at most 100 characters long")
    .optional()
    .default(""),
  traits: z.array(traitSchema)
    .max(50, "You can list at most 50 traits")
    .optional()
    .default([]),
  additionalInfo: z.string()
    .max(3000, "Additional info must be at most 3000 characters long")
    .optional()
    .default(""),
});

export type CustomizeSchema = typeof customizeSchema;