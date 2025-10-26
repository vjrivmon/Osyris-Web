'use client'

import { AprobarDocumentosPanel } from '@/components/admin/familiares/aprobar-documentos'

export default function AdminFamiliaresDocumentosPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Documentos Familiares</h1>
          <p className="text-muted-foreground">
            Revisa y aprueba los documentos subidos por las familias
          </p>
        </div>
      </div>

      {/* Panel de documentos */}
      <AprobarDocumentosPanel />
    </div>
  )
}