import { Button, Heading, HStack } from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useEffect, useState } from "react";
import { add } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus, FiPlusCircle, FiPlusSquare } from "react-icons/fi";
import { trpc } from "@/utils/trpc";

export default function Calendar() {
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    const navigate = useNavigate();

    const { data: events, status: eventsStatus } = trpc.planner.getMany.useQuery({
        startAt: start,
        endAt: end
    })

    return (
        <>
            <HStack mb="5">
                <Heading fontSize="6xl">Calendar View</Heading>
            </HStack>
            <Link to="/dashboard/planner/create">
                <Button leftIcon={<FiPlusCircle />} colorScheme="blue" mb="4">Add Event</Button>
            </Link>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                weekends={true}
                events={
                    events?.map((event: any) => {
                        return {
                            id: event.id,
                            title: event.name,
                            start: new Date(event.startAt),
                            end: new Date(event.endAt),
                            backgroundColor: event.color,
                        }
                    })
                }
                eventClick={
                    (info) => {
                        navigate(`/dashboard/planner/${info.event.id}/view`)
                    }
                }
                datesSet={({ start, end }) => {
                    setStart(start);
                    setEnd(end);
                }}
                height="auto"
            />
        </>
    )
}
