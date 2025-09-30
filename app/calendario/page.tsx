"use client"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { CalendarView } from "@/components/ui/calendar-view"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, Phone, Mail } from "lucide-react"

// Calendario sin datos mock - se conectará con la API en el futuro
const activities: any[] = []

export default function CalendarioPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      <main className="flex-1 overflow-hidden">
        <div className="h-full p-4">
          <div className="h-full max-w-7xl mx-auto">
            <CalendarView events={activities} className="h-full" />
          </div>
        </div>
      </main>
    </div>
  )
}