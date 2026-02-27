import { NextResponse } from "next/server"
import { ZodError } from "zod"
import {
  addContactSubmission,
  listContactSubmissions,
} from "@/lib/admin-submissions"

export async function GET() {
  return NextResponse.json({ data: listContactSubmissions() })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = addContactSubmission(body)
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Payload non valido", errors: error.flatten() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Errore durante il salvataggio richiesta contatto" },
      { status: 500 }
    )
  }
}
