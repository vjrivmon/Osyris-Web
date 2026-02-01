'use client'

import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { CircularDigitalWizard } from '@/components/familia/circular-digital/CircularDigitalWizard'
import { Suspense } from 'react'

function CircularDetallePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const circularId = Number(params.id)
  const educandoId = Number(searchParams.get('educandoId'))

  if (!circularId || !educandoId) {
    return <div className="p-8 text-center text-red-500">Parámetros inválidos</div>
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <CircularDigitalWizard
        actividadId={circularId}
        educandoId={educandoId}
        onComplete={() => router.push('/familia/circulares')}
        onCancel={() => router.back()}
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <CircularDetallePage />
    </Suspense>
  )
}
