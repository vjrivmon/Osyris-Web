"use client";

import { AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface NotificacionUrgente {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  fecha_creacion: string;
  metadata?: Record<string, unknown>;
}

interface NotificacionesUrgentesModalProps {
  isOpen: boolean;
  notificaciones: NotificacionUrgente[];
  onClose: () => void;
}

export function NotificacionesUrgentesModal({
  isOpen,
  notificaciones,
  onClose,
}: NotificacionesUrgentesModalProps) {
  if (notificaciones.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Notificaciones urgentes
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-3 pr-2">
            {notificaciones.map((notif) => (
              <div
                key={notif.id}
                className="rounded-lg border border-amber-200 bg-amber-50 p-3"
              >
                <p className="font-medium text-sm text-amber-900">
                  {notif.titulo}
                </p>
                <p className="text-sm text-amber-800 mt-1">{notif.mensaje}</p>
                <p className="text-xs text-amber-600 mt-1.5">
                  {formatDistanceToNow(new Date(notif.fecha_creacion), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
