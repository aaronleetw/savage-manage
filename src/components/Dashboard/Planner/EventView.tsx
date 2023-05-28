import PageLoader from "@/components/PageLoader";
import { Badge, Button, ChakraProvider, Circle, Heading, HStack, Icon, Square, Text } from "@chakra-ui/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiEdit, FiHelpCircle, FiTrash, FiXCircle } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { chakraTheme, muiTheme } from "@/theme";
import { DataGrid } from "@mui/x-data-grid";
import { trpc } from "@/utils/trpc";
import ErrorPage from "@/components/ErrorPage";

export default function EventView() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    
    const [rsvp, setRsvp] = useState<{row: any[], col: any[]}>({row: [], col: [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'grade', headerName: 'Grade', width: 70 },
        { field: 'class', headerName: 'Class', width: 70 },
        { field: 'englishName', headerName: 'English Name', width: 130 },
        { field: 'chineseName', headerName: 'Chinese Name', width: 130 },
        { field: 'accountType', headerName: 'Account Type', width: 130, renderCell: (params: any) => {
            return (
                <ChakraProvider theme={chakraTheme}>
                    <Badge colorScheme={params.value.color}>{params.value.name}</Badge>
                </ChakraProvider>
            )
        }},
        { field: 'roles', headerName: 'Roles', width: 200, renderCell: (params: any) => {
            return (
                <ChakraProvider theme={chakraTheme}>
                    {
                        params.value.map((value: any) => {
                            return (
                                <Badge colorScheme={value.color} mr="1">{value.name}</Badge>
                            )
                        })
                    }
                </ChakraProvider>
            )
        }},
        { field: 'status', headerName: 'Status', width: 200, renderCell: (params: any) => {
            return (
                <ChakraProvider theme={chakraTheme}>
                    <Icon
                        as={params.value == 2 ? FiCheckCircle : (params.value == 1 ? FiXCircle : FiHelpCircle)}
                        color={params.value == 2 ? "green.500" : (params.value == 1 ? "red.500" : "yellow.500")}
                        fontSize="2xl"
                        mr="2"
                    />
                    <Text>
                        {params.value == 2 ? "Will Attend" : (params.value == 1 ? "Will Not Attend" : "Not Responded Yet")}
                    </Text>
                </ChakraProvider>
            )
        }}
    ]});

    const { data: event, status: eventStatus } = trpc.planner.get.useQuery({
        id: parseInt(eventId as string),
    })

    useEffect(() => {
        if (eventStatus !== 'success') return;
        const rsvpData = event?.rsvp?.map((item) => {
            return {
                id: item.id,
                grade: item.user.grade,
                class: item.user.class,
                englishName: item.user.englishName,
                chineseName: item.user.chineseName,
                accountType: item.user.accountType,
                roles: item.user.roles,
                status: item.confirmed ? 2 : 1
            }
        })
        event?.allowedUsers?.forEach((item) => {
            if (rsvpData?.find((rsvpItem) => rsvpItem.id === item.id)) return;
            rsvpData?.push({
                id: item.id,
                grade: item.grade,
                class: item.class,
                englishName: item.englishName,
                chineseName: item.chineseName,
                accountType: item.accountType,
                roles: item.roles,
                status: 0
            })
        })
        setRsvp({row: rsvpData as any, col: rsvp.col});
    }, [eventStatus])

    const deleteEvent = trpc.planner.delete.useMutation();

    if (eventStatus === 'loading') return <PageLoader />

    return (
    <>
        <Link to="/dashboard/planner">
            <Button leftIcon={<FiArrowLeft />} size="sm">Back to Calendar View</Button>
        </Link>
        <HStack>
            <Square size="20px" rounded="5px" mr="1" display="inline-block" bg={event?.color} />
            <Heading mb="3" fontSize="4xl">{event?.name}</Heading>
        </HStack>
        <Text fontSize="xl" fontWeight="bold">
            {format(event?.startAt as Date, "EEEE, MM/dd HH:MM")}
            ~
            {
                event?.startAt.getFullYear() === event?.endAt.getFullYear() && event?.startAt.getMonth() === event?.endAt?.getMonth() && event?.startAt.getDate() === event?.endAt?.getDate() ? 
                    format(event?.endAt as Date, "HH:MM") : format(event?.endAt as Date, "EEEE, MM/dd HH:MM")
            }
        </Text>
        <Text mb="5">{event?.description}</Text>
        <Heading fontSize="2xl">Attending Users</Heading>
        {
            event?.useRSVP ? <>
                <Text mb="5">RSVP is used for this event.</Text>
            </> :
            <>
                <Text mb="5">RSVP is not used for this event.</Text>
            </>
        }
        <ThemeProvider theme={muiTheme}>
            <DataGrid rows={rsvp.row} columns={rsvp.col} autoHeight />
        </ThemeProvider>
        <Heading mt="5" fontSize="2xl">Attendance</Heading>
        {
            event?.useAttendance ? <>
                <Text mb="5">Attendance is used for this event.</Text>
            </> :
            <Text mb="5">Attendance is not used for this event.</Text>
        }
        {/* add two buttons, edit event and delete event */}
        <HStack>
            <Link to={`/dashboard/planner/event/${eventId}/edit`}>
                <Button leftIcon={<FiEdit />} colorScheme="blue">Edit Event</Button>
            </Link>
            <Button leftIcon={<FiTrash />} colorScheme="red" onClick={() => {
                deleteEvent.mutateAsync({id: parseInt(eventId as string)}).then(() => {
                    navigate('/dashboard/planner');
                }).catch((err) => {
                    console.log(err);
                })
            }}>Delete Event</Button>
        </HStack>
    </>)
}