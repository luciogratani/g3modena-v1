import { z } from "zod"

const clientSchema = z.object({
  name: z.string().min(2),
  location: z.string().min(2),
})

export const adminContentSchema = z.object({
  heroTitle: z.string().min(3),
  heroSubtitle: z.string().min(3),
  aboutTitle: z.string().min(3),
  aboutBody: z.string().min(10),
  contactEmail: z.string().email(),
  contactSecondaryEmail: z.string().email(),
  contactPhone: z.string().min(6),
  footerCompanyName: z.string().min(3),
  footerAddressLine1: z.string().min(3),
  footerAddressLine2: z.string().min(3),
  footerVat: z.string().min(3),
  footerDirector: z.string().min(3),
  mediaHeroImage: z.string().min(3),
  mediaAboutImage: z.string().min(3),
  mediaLogoPrimary: z.string().min(1),
  mediaLogoAlt: z.string().min(1),
  selectedClients: z.array(clientSchema),
})

export type AdminContent = z.infer<typeof adminContentSchema>

const defaultContent: AdminContent = {
  heroTitle: "Il nostro team. Il tuo stile.",
  heroSubtitle: "Direzione di sala e servizio premium per catering di alto livello",
  aboutTitle: "Due decenni di eccellenza nel servizio di sala",
  aboutBody:
    "Con sede a Modena, G3 ha costruito oltre vent'anni di esperienza nel settore del catering, con un servizio strutturato, elegante e affidabile.",
  contactEmail: "info@g3modena.com",
  contactSecondaryEmail: "mediterraneo@g3modena.com",
  contactPhone: "+39 349 1767260",
  footerCompanyName: "G3 Servizio & Esperienza per LA VELA SRL",
  footerAddressLine1: "Viale dell'Industria 23/A",
  footerAddressLine2: "35129 Padova",
  footerVat: "P. IVA / Codice Fiscale: 05640030283",
  footerDirector: "Lino Salemme — Amministratore unico",
  mediaHeroImage: "/images/hero.jpg",
  mediaAboutImage: "/images/about.jpg",
  mediaLogoPrimary: "G3",
  mediaLogoAlt: "Servizio & Esperienza",
  selectedClients: [
    { name: "Massimo Bottura", location: "Casa Maria Luigia, Modena" },
    { name: "Domenico Stile", location: "Enoteca La Torre, Roma" },
    { name: "Alajmo Group", location: "Padova" },
    { name: "ALMA", location: "Scuola Int. di Cucina Italiana, Parma" },
    { name: "Zerobriciole", location: "Milano" },
    { name: "Viola Morlino", location: "Milano" },
    { name: "Roots", location: "Modena" },
    { name: "AKitchen", location: "Sassari" },
    { name: "Tavola della Signoria", location: "Bologna" },
  ],
}

let inMemoryContent: AdminContent = defaultContent

export function getAdminContent(): AdminContent {
  return inMemoryContent
}

export function updateAdminContent(nextValue: unknown): AdminContent {
  const parsed = adminContentSchema.parse(nextValue)
  inMemoryContent = parsed
  return inMemoryContent
}
