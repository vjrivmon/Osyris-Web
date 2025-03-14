"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const mockTeamMembers = [
  {
    id: "1",
    name: "Ana García",
    role: "Guía de Patrulla",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "AG",
  },
  {
    id: "2",
    name: "Carlos Martínez",
    role: "Subguía",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "CM",
  },
  {
    id: "3",
    name: "Laura Sánchez",
    role: "Tesorera",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "LS",
  },
  {
    id: "4",
    name: "Miguel Fernández",
    role: "Secretario",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "MF",
  },
  {
    id: "5",
    name: "Lucía Rodríguez",
    role: "Intendente",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "LR",
  },
  {
    id: "6",
    name: "Pablo Navarro",
    role: "Miembro",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "PN",
  },
]

export function TeamMembers() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockTeamMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.name}</p>
                <Badge variant="outline" className="mt-1">
                  {member.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

