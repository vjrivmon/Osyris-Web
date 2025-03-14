import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Event {
  id: number
  title: string
  date: string
  location: string
  description: string
  image: string
  section: string
}

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <div className="relative h-48 w-full">
        <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">{event.section}</Badge>
      </div>
      <CardContent className="pt-6 flex-grow">
        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <CalendarDays className="h-4 w-4 mr-2" />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{event.location}</span>
        </div>
        <p className="text-sm text-muted-foreground">{event.description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/eventos/${event.id}`}>Ver detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

