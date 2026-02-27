import { z } from "zod"
import mockSubmissions from "@/data/mock-submissions.json"

export const contactSubmissionSchema = z.object({
  fullName: z.string().min(2),
  company: z.string().optional().default(""),
  email: z.string().email(),
  phone: z.string().min(6),
  city: z.string().optional().default(""),
  message: z.string().min(2),
})

export const careerSubmissionSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  age: z.string().min(1),
  city: z.string().optional().default(""),
  availability: z.string().min(1),
  profilePhotoFileName: z.string().optional().default(""),
  profilePhotoDataUrl: z.string().min(1),
  cvFileName: z.string().optional().default(""),
  cvPreviewUrl: z.string().optional().default(""),
  message: z.string().optional().default(""),
})

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>
export type CareerSubmissionInput = z.infer<typeof careerSubmissionSchema>

export interface ContactSubmission extends ContactSubmissionInput {
  id: string
  createdAt: string
}

export interface CareerSubmission extends CareerSubmissionInput {
  id: string
  createdAt: string
}

const contactSubmissionRecordSchema = contactSubmissionSchema.extend({
  id: z.string(),
  createdAt: z.string(),
})

const careerSubmissionRecordSchema = careerSubmissionSchema.extend({
  id: z.string(),
  createdAt: z.string(),
})

const mockSubmissionDbSchema = z.object({
  contactSubmissions: z.array(contactSubmissionRecordSchema),
  careerSubmissions: z.array(careerSubmissionRecordSchema),
})

const seededMockDb = mockSubmissionDbSchema.parse(mockSubmissions)

let contactSubmissions: ContactSubmission[] = [...seededMockDb.contactSubmissions]
let careerSubmissions: CareerSubmission[] = [...seededMockDb.careerSubmissions]

export function listContactSubmissions(): ContactSubmission[] {
  return contactSubmissions
}

export function addContactSubmission(input: unknown): ContactSubmission {
  const parsed = contactSubmissionSchema.parse(input)
  const nextItem: ContactSubmission = {
    ...parsed,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  contactSubmissions = [nextItem, ...contactSubmissions]
  return nextItem
}

export function listCareerSubmissions(): CareerSubmission[] {
  return careerSubmissions
}

export function addCareerSubmission(input: unknown): CareerSubmission {
  const parsed = careerSubmissionSchema.parse(input)
  const nextItem: CareerSubmission = {
    ...parsed,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  careerSubmissions = [nextItem, ...careerSubmissions]
  return nextItem
}
