"use client";

import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api-utils";
import { Bell, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ConfigNotificacion {
  id: number;
  tipo_notificacion: string;
  es_urgente: boolean;
  descripcion: string;
  updated_at: string;
}

export default function ConfigNotificacionesPage() {
  const [configs, setConfigs] = useState<ConfigNotificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const API_URL = getApiUrl();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/notificaciones/config`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConfigs(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUrgente = async (tipo: string, currentValue: boolean) => {
    setUpdating(tipo);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/notificaciones/config/${tipo}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ es_urgente: !currentValue }),
        }
      );

      if (response.ok) {
        setConfigs((prev) =>
          prev.map((c) =>
            c.tipo_notificacion === tipo
              ? { ...c, es_urgente: !currentValue }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Error updating config:", err);
    } finally {
      setUpdating(null);
    }
  };

  const formatTipo = (tipo: string) =>
    tipo
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Configuracion de notificaciones
        </h1>
        <p className="text-muted-foreground mt-1">
          Controla que tipos de notificacion se marcan como urgentes y generan
          un modal al iniciar sesion.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead className="text-center">Urgente</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell className="font-medium">
                  {formatTipo(config.tipo_notificacion)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {config.descripcion}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={config.es_urgente}
                      onCheckedChange={() =>
                        toggleUrgente(
                          config.tipo_notificacion,
                          config.es_urgente
                        )
                      }
                      disabled={updating === config.tipo_notificacion}
                    />
                    {config.es_urgente ? (
                      <Badge variant="destructive" className="text-xs">
                        Urgente
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Normal
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {configs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                >
                  No hay tipos de notificacion configurados. Ejecuta la
                  migracion de base de datos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
