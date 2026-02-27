import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { getAdminContent, updateAdminContent } from "@/lib/admin-content"

export async function GET() {
  return NextResponse.json({
    data: getAdminContent(),
    meta: {
      authReady: true,
      authEnabled: false,
      note: "Auth not enabled yet. Protect this route before production.",
    },
  })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const updated = updateAdminContent(body)
    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Payload non valido", errors: error.flatten() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Errore interno durante il salvataggio" },
      { status: 500 }
    )
  }
}
