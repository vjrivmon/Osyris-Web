"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { TrendingUp } from "lucide-react"

interface ActivityData {
  date: string
  usuarios: number
  actividades: number
  mensajes: number
}

interface ActivityChartProps {
  data: ActivityData[]
  title?: string
  description?: string
  className?: string
}

export function ActivityChart({
  data,
  title = "Actividad de la Última Semana",
  description = "Usuarios activos, actividades y mensajes",
  className
}: ActivityChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c41e3a" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#c41e3a" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorActividades" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorMensajes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="usuarios"
                stroke="#c41e3a"
                fillOpacity={1}
                fill="url(#colorUsuarios)"
                strokeWidth={2}
                name="Usuarios Activos"
              />
              <Area
                type="monotone"
                dataKey="actividades"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorActividades)"
                strokeWidth={2}
                name="Actividades"
              />
              <Area
                type="monotone"
                dataKey="mensajes"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorMensajes)"
                strokeWidth={2}
                name="Mensajes"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}