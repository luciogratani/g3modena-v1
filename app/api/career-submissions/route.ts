import { NextResponse } from "next/server"
import { ZodError } from "zod"
import {
  addCareerSubmission,
  listCareerSubmissions,
} from "@/lib/admin-submissions"

export async function GET() {
  return NextResponse.json({ data: listCareerSubmissions() })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = addCareerSubmission(body)
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Payload non valido", errors: error.flatten() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Errore durante il salvataggio candidatura" },
      { status: 500 }
    )
  }
}
