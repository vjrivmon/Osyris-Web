'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CircularCrearForm } from '@/components/admin/circulares/CircularCrearForm'
import { CircularEstadoDashboard } from '@/components/admin/circulares/CircularEstadoDashboard'
import { FileText, PlusCircle, BarChart3 } from 'lucide-react'

export default function AdminCircularesPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Gestión de Circulares Digitales</h1>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="crear" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Crear Circular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <CircularEstadoDashboard key={refreshKey} />
        </TabsContent>

        <TabsContent value="crear" className="mt-4">
          <CircularCrearForm onCreated={() => setRefreshKey(k => k + 1)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
