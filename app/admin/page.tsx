"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import type { AdminContent } from "@/lib/admin-content"
import type {
  CareerSubmission,
  ContactSubmission,
} from "@/lib/admin-submissions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type CmsSectionId = "main" | "hero" | "about" | "clients" | "media"
type ContactSectionId = "contact-list"
type CareerSectionId = "career-list"
type AdminAreaId = "cms" | "contact-requests" | "career-applications"
type AdminSubsectionId = CmsSectionId | ContactSectionId | CareerSectionId

const adminAreas: Array<{ id: AdminAreaId; label: string }> = [
  { id: "cms", label: "CMS" },
  { id: "contact-requests", label: "Richieste contatto" },
  { id: "career-applications", label: "Candidature" },
]

const cmsTabs: Array<{ id: CmsSectionId; label: string }> = [
  { id: "main", label: "Principale" },
  { id: "hero", label: "Hero" },
  { id: "about", label: "Chi siamo" },
  { id: "clients", label: "Clienti selezionati" },
  { id: "media", label: "Media" },
]

const areaSubsections: Record<
  AdminAreaId,
  Array<{ id: AdminSubsectionId; label: string }>
> = {
  cms: cmsTabs,
  "contact-requests": [{ id: "contact-list", label: "Elenco richieste" }],
  "career-applications": [{ id: "career-list", label: "Elenco candidature" }],
}

const emptyForm: AdminContent = {
  heroTitle: "",
  heroSubtitle: "",
  aboutTitle: "",
  aboutBody: "",
  contactEmail: "",
  contactSecondaryEmail: "",
  contactPhone: "",
  footerCompanyName: "",
  footerAddressLine1: "",
  footerAddressLine2: "",
  footerVat: "",
  footerDirector: "",
  mediaHeroImage: "",
  mediaAboutImage: "",
  mediaLogoPrimary: "",
  mediaLogoAlt: "",
  selectedClients: [],
}

interface ApiResponse {
  data: AdminContent
}

interface ContactSubmissionsResponse {
  data: ContactSubmission[]
}

interface CareerSubmissionsResponse {
  data: CareerSubmission[]
}

export default function AdminPage() {
  const [form, setForm] = useState<AdminContent>(emptyForm)
  const [initial, setInitial] = useState<AdminContent>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeArea, setActiveArea] = useState<AdminAreaId>("cms")
  const [activeSubsections, setActiveSubsections] = useState<
    Record<AdminAreaId, AdminSubsectionId>
  >({
    cms: "main",
    "contact-requests": "contact-list",
    "career-applications": "career-list",
  })
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>(
    []
  )
  const [careerSubmissions, setCareerSubmissions] = useState<CareerSubmission[]>([])
  const [selectedCareer, setSelectedCareer] = useState<CareerSubmission | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/content", { cache: "no-store" })
        if (!response.ok) throw new Error("Impossibile caricare i contenuti admin")
        const payload = (await response.json()) as ApiResponse
        setForm(payload.data)
        setInitial(payload.data)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Errore durante il caricamento"
        )
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const loadContactSubmissions = async () => {
    try {
      const response = await fetch("/api/contact-submissions", { cache: "no-store" })
      if (!response.ok) throw new Error("Impossibile caricare le richieste contatto")
      const payload = (await response.json()) as ContactSubmissionsResponse
      setContactSubmissions(payload.data)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Errore durante il caricamento richieste contatto"
      )
    }
  }

  const loadCareerSubmissions = async () => {
    try {
      const response = await fetch("/api/career-submissions", { cache: "no-store" })
      if (!response.ok) throw new Error("Impossibile caricare le candidature")
      const payload = (await response.json()) as CareerSubmissionsResponse
      setCareerSubmissions(payload.data)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Errore durante il caricamento candidature"
      )
    }
  }

  useEffect(() => {
    if (activeArea === "contact-requests") {
      void loadContactSubmissions()
    }
    if (activeArea === "career-applications") {
      void loadCareerSubmissions()
    }
  }, [activeArea])

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initial),
    [form, initial]
  )

  const handleChange =
    (key: keyof AdminContent) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { value } = event.target
      setForm((prev) => ({ ...prev, [key]: value }))
    }

  const setFieldValue = (key: keyof AdminContent, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.message || "Salvataggio non riuscito")
      }

      const payload = (await response.json()) as ApiResponse
      setForm(payload.data)
      setInitial(payload.data)
      setLastSavedAt(new Date())
      toast.success("Contenuti aggiornati")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Errore salvataggio")
    } finally {
      setSaving(false)
    }
  }

  const handleClientFieldChange = (
    index: number,
    key: "name" | "location",
    value: string
  ) => {
    setForm((prev) => {
      const nextClients = [...prev.selectedClients]
      nextClients[index] = { ...nextClients[index], [key]: value }
      return { ...prev, selectedClients: nextClients }
    })
  }

  const handleAddClient = () => {
    setForm((prev) => ({
      ...prev,
      selectedClients: [...prev.selectedClients, { name: "", location: "" }],
    }))
  }

  const handleRemoveClient = (index: number) => {
    setForm((prev) => ({
      ...prev,
      selectedClients: prev.selectedClients.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <p className="text-sm text-muted-foreground">Caricamento contenuti admin...</p>
      </div>
    )
  }

  const lastSavedLabel = lastSavedAt
    ? lastSavedAt.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Non ancora salvato"

  const areaMeta: Record<AdminAreaId, { title: string; description: string }> = {
    cms: {
      title: "Gestione contenuti",
      description: "Modifica i contenuti pubblici del sito per sezioni.",
    },
    "contact-requests": {
      title: "Richieste contatto",
      description: "Consultazione richieste inviate dal form contatti.",
    },
    "career-applications": {
      title: "Candidature",
      description: "Consultazione candidature inviate dal form lavora con noi.",
    },
  }

  const currentAreaMeta = areaMeta[activeArea]
  const currentSubsections = areaSubsections[activeArea]
  const activeSubsection = activeSubsections[activeArea]
  const activeCmsSection = activeSubsections.cms as CmsSectionId

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-[11px] font-medium text-slate-500">
          Backoffice
        </p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Pannello amministrazione</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <p className="mb-2 px-2 text-[11px] font-medium text-slate-500">
              Aree
            </p>
            <nav className="space-y-1">
              {adminAreas.map((area) => {
                const active = area.id === activeArea
                return (
                  <button
                    key={area.id}
                    onClick={() => setActiveArea(area.id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {area.label}
                  </button>
                )
              })}
            </nav>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <p className="mb-2 px-2 text-[11px] font-medium text-slate-500">
              Sottosezioni
            </p>
            <nav className="space-y-1">
              {currentSubsections.map((subsection) => {
                const active = subsection.id === activeSubsection
                return (
                  <button
                    key={`${activeArea}-${subsection.id}`}
                    onClick={() =>
                      setActiveSubsections((prev) => ({
                        ...prev,
                        [activeArea]: subsection.id,
                      }))
                    }
                    className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {subsection.label}
                  </button>
                )
              })}
            </nav>
          </section>

          {activeArea === "cms" && (
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-600">
                {hasChanges ? "Modifiche non salvate" : "Tutto salvato"}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Ultimo salvataggio: {lastSavedLabel}
              </p>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="mt-3 w-full rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Salvataggio..." : "Salva"}
              </button>
            </section>
          )}
        </aside>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {currentAreaMeta.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {currentAreaMeta.description}
                </p>
              </div>
              {activeArea === "contact-requests" && (
                <button
                  onClick={() => void loadContactSubmissions()}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Aggiorna
                </button>
              )}
              {activeArea === "career-applications" && (
                <button
                  onClick={() => void loadCareerSubmissions()}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Aggiorna
                </button>
              )}
            </div>
          </div>

          {activeArea === "cms" && activeCmsSection === "main" && (
            <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Principale</h2>
          <p className="text-sm text-slate-600">
            Campi prioritari: contatti, VAT e informazioni footer.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Email principale"
              value={form.contactEmail}
              onChange={handleChange("contactEmail")}
              type="email"
            />
            <Field
              label="Email secondaria"
              value={form.contactSecondaryEmail}
              onChange={handleChange("contactSecondaryEmail")}
              type="email"
            />
            <Field
              label="Telefono principale"
              value={form.contactPhone}
              onChange={handleChange("contactPhone")}
              type="tel"
            />
            <Field
              label="Ragione sociale footer"
              value={form.footerCompanyName}
              onChange={handleChange("footerCompanyName")}
            />
            <Field
              label="Indirizzo footer - Riga 1"
              value={form.footerAddressLine1}
              onChange={handleChange("footerAddressLine1")}
            />
            <Field
              label="Indirizzo footer - Riga 2"
              value={form.footerAddressLine2}
              onChange={handleChange("footerAddressLine2")}
            />
            <Field
              label="VAT / Codice Fiscale"
              value={form.footerVat}
              onChange={handleChange("footerVat")}
            />
            <Field
              label="Direzione / Referente footer"
              value={form.footerDirector}
              onChange={handleChange("footerDirector")}
            />
          </div>
            </section>
          )}

          {activeArea === "cms" && activeCmsSection === "hero" && (
            <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Hero</h2>
          <Field
            label="Titolo hero"
            value={form.heroTitle}
            onChange={handleChange("heroTitle")}
          />
          <TextareaField
            label="Sottotitolo hero"
            value={form.heroSubtitle}
            onChange={handleChange("heroSubtitle")}
          />
            </section>
          )}

          {activeArea === "cms" && activeCmsSection === "about" && (
            <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Chi siamo</h2>
          <Field
            label="Titolo sezione"
            value={form.aboutTitle}
            onChange={handleChange("aboutTitle")}
          />
          <TextareaField
            label="Testo descrittivo"
            value={form.aboutBody}
            onChange={handleChange("aboutBody")}
          />
            </section>
          )}

          {activeArea === "cms" && activeCmsSection === "clients" && (
            <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Clienti selezionati
            </h2>
            <button
              onClick={handleAddClient}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Aggiungi cliente
            </button>
          </div>

          <p className="text-sm text-slate-600">
            Gestisci la lista mostrata nella sezione pubblica "Clienti selezionati".
          </p>

          <div className="space-y-3">
            {form.selectedClients.map((client, index) => (
              <div
                key={`${client.name}-${index}`}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Field
                  label="Nome cliente"
                  value={client.name}
                  onChange={(event) =>
                    handleClientFieldChange(index, "name", event.target.value)
                  }
                />
                <Field
                  label="Località"
                  value={client.location}
                  onChange={(event) =>
                    handleClientFieldChange(index, "location", event.target.value)
                  }
                />
                <div className="flex items-end">
                  <button
                    onClick={() => handleRemoveClient(index)}
                    className="rounded-md border border-rose-300 px-3 py-2 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            ))}

            {form.selectedClients.length === 0 && (
              <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                Nessun cliente inserito. Aggiungi almeno una voce.
              </p>
            )}
          </div>
            </section>
          )}

          {activeArea === "cms" && activeCmsSection === "media" && (
            <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Media</h2>
          <p className="text-sm text-slate-600">
            Percorsi immagini e testi logo utilizzati nel sito pubblico.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <MediaUploadField
              label="Immagine Hero (path/URL)"
              value={form.mediaHeroImage}
              onChange={handleChange("mediaHeroImage")}
              onUploadPath={(uploadedPath) =>
                setFieldValue("mediaHeroImage", uploadedPath)
              }
            />
            <MediaUploadField
              label="Immagine Chi siamo (path/URL)"
              value={form.mediaAboutImage}
              onChange={handleChange("mediaAboutImage")}
              onUploadPath={(uploadedPath) =>
                setFieldValue("mediaAboutImage", uploadedPath)
              }
            />
            <Field
              label="Logo principale (testo)"
              value={form.mediaLogoPrimary}
              onChange={handleChange("mediaLogoPrimary")}
            />
            <Field
              label="Logo secondario (testo)"
              value={form.mediaLogoAlt}
              onChange={handleChange("mediaLogoAlt")}
            />
          </div>
            </section>
          )}

          {activeArea === "contact-requests" && (
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              {contactSubmissions.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                  Nessuna richiesta contatto ricevuta al momento.
                </p>
              ) : (
                <div className="space-y-3">
                  {contactSubmissions.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-md border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-medium text-slate-900">{item.fullName}</h3>
                        <span className="text-[11px] text-slate-500">
                          {new Date(item.createdAt).toLocaleString("it-IT")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {item.email} · {item.phone}
                      </p>
                      {item.company && (
                        <p className="mt-1 text-sm text-slate-600">
                          Azienda: {item.company}
                        </p>
                      )}
                      {item.city && (
                        <p className="mt-1 text-sm text-slate-600">
                          Città: {item.city}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-slate-800">{item.message}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeArea === "career-applications" && (
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              {careerSubmissions.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                  Nessuna candidatura ricevuta al momento.
                </p>
              ) : (
                <div className="space-y-3">
                  {careerSubmissions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedCareer(item)}
                      className="w-full rounded-md border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-slate-400"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.profilePhotoDataUrl}
                            alt={`Foto profilo ${item.fullName}`}
                            className="h-12 w-12 rounded-full object-cover ring-1 ring-border"
                          />
                          <h3 className="font-medium text-slate-900">{item.fullName}</h3>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {new Date(item.createdAt).toLocaleString("it-IT")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {item.email} · {item.phone}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Età: {item.age} · Disponibilità: {item.availability}
                      </p>
                      {item.city && (
                        <p className="mt-1 text-sm text-slate-600">Città: {item.city}</p>
                      )}
                      {item.cvFileName && (
                        <p className="mt-1 text-sm text-slate-600">CV: {item.cvFileName}</p>
                      )}
                      {item.message && (
                        <p className="mt-2 text-sm text-slate-800">{item.message}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(selectedCareer)}
        onOpenChange={(open) => {
          if (!open) setSelectedCareer(null)
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-slate-200 bg-white">
          {selectedCareer && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCareer.fullName}</DialogTitle>
                <DialogDescription>
                  {selectedCareer.email} · {selectedCareer.phone}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 md:grid-cols-[280px_1fr]">
                <div className="space-y-3">
                  <img
                    src={selectedCareer.profilePhotoDataUrl}
                    alt={`Foto profilo ${selectedCareer.fullName}`}
                    className="h-72 w-full rounded-lg object-cover ring-1 ring-slate-300"
                  />
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    <p>Età: {selectedCareer.age}</p>
                    <p>Disponibilità: {selectedCareer.availability}</p>
                    {selectedCareer.city && <p>Città: {selectedCareer.city}</p>}
                    {selectedCareer.cvFileName && <p>CV: {selectedCareer.cvFileName}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedCareer.message && (
                    <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                      {selectedCareer.message}
                    </p>
                  )}

                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      Anteprima CV
                    </p>
                    {selectedCareer.cvPreviewUrl ? (
                      <iframe
                        src={selectedCareer.cvPreviewUrl}
                        title={`Anteprima CV ${selectedCareer.fullName}`}
                        className="h-[440px] w-full rounded-md border border-slate-200"
                      />
                    ) : (
                      <div className="rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-600">
                        Anteprima non disponibile. Carica un CV in formato PDF per la preview.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  type?: React.HTMLInputTypeAttribute
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  )
}

function TextareaField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <textarea
        rows={5}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  )
}

function MediaUploadField({
  label,
  value,
  onChange,
  onUploadPath,
}: {
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onUploadPath: (uploadedPath: string) => void
}) {
  const inputId = `media-upload-${label.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`

  const handleUploadSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const uploadedPath = `/images/${file.name}`
    onUploadPath(uploadedPath)
    toast.success(`Upload simulato completato: ${file.name}`)

    event.target.value = ""
  }

  return (
    <div className="space-y-2">
      <Field label={label} value={value} onChange={onChange} />
      <div className="-mt-1 flex items-center gap-3">
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Carica file
        </label>
        <span className="text-[11px] text-slate-500">
          Simula upload e imposta automaticamente il path in `/images/...`
        </span>
      </div>
      <input
        id={inputId}
        type="file"
        className="sr-only"
        onChange={handleUploadSelection}
      />
    </div>
  )
}
