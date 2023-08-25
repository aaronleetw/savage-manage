import PageLoader from "@/components/PageLoader";
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Badge, Box, Button, ChakraProvider, Circle, Flex, Heading, HStack, Icon, Square, Text, useDisclosure } from "@chakra-ui/react";
import { format } from "date-fns";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiEdit, FiHelpCircle, FiTrash, FiXCircle } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { chakraTheme } from "@/theme";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { trpc } from "@/utils/trpc";

export default function EventView() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    
    const [rsvp, setRsvp] = useState<{row: any[], col: any[]}>({row: [], col: [
        { field: 'id', headerName: 'RSVP ID', width: 100 },
        { field: 'uid', headerName: 'User ID', width: 100 },
        { field: 'grade', headerName: 'Grade', width: 100 },
        { field: 'class', headerName: 'Class', width: 100 },
        { field: 'englishName', headerName: 'English Name', width: 180 },
        { field: 'chineseName', headerName: 'Chinese Name', width: 180 },
        { field: 'accountType', headerName: 'Account Type', cellRenderer: (params: any) => {
            return (
                    <Badge colorScheme={params.value.color} display="inline">{params.value.name}</Badge>
            )
        }, width: 130, comparator: (valueA: any, valueB: any) => {
            if (valueA.name === valueB.name) return 0;
            if (valueA.name < valueB.name) return -1;
            if (valueA.name > valueB.name) return 1;
        }},
        { field: 'roles', headerName: 'Roles', cellRenderer: (params: any) => {
            return (
                <>
                    {
                        params.value.map((value: any) => {
                            return (
                                <Badge colorScheme={value.color} mr="1" key={value.name} display="inline">{value.name}</Badge>
                            )
                        })
                    }
                </>
            )
        }, comparator: (valueA: any, valueB: any) => valueA.length - valueB.length},
        { field: 'status', headerName: 'Status', width: 200, cellRenderer: (params: any) => {
            return (
                <HStack>
                    <Icon
                        as={params.value == 2 ? FiCheckCircle : (params.value == 1 ? FiXCircle : FiHelpCircle)}
                        color={params.value == 2 ? "green.500" : (params.value == 1 ? "red.500" : "yellow.500")}
                        fontSize="2xl"
                        mr="1"
                    />
                    <Text>
                        {params.value == 2 ? "Will Attend" : (params.value == 1 ? "Will Not Attend" : "Not Responded Yet")}
                    </Text>
                </HStack>
            )
        }, comparator: (valueA: any, valueB: any) => valueA - valueB, sort: "desc" }
    ]});

    const { data: event, status: eventStatus } = trpc.planner.get.useQuery({
        id: parseInt(eventId as string),
    })

    useEffect(() => {
        if (eventStatus !== 'success') return;
        const rsvpData = event?.rsvp?.map((item) => {
            return {
                id: item.id,
                uid: item.user.id,
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
            if (rsvpData?.find((rsvpItem) => rsvpItem.uid === item.id)) return;
            rsvpData?.push({
                id: -1,
                uid: item.id,
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
    }, [eventStatus, event?.allowedUsers, event?.rsvp, rsvp.col])

    const defaultColDef = useMemo(() => ({
        sortable: true
    }), []);

    const deleteEvent = trpc.planner.delete.useMutation();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;

    if (eventStatus === 'loading') return <PageLoader />

    return (
    <>
        <Link to="/dashboard/planner">
            <Button leftIcon={<FiArrowLeft />} size="sm">Back to Calendar View</Button>
        </Link>
        <HStack mt="3" mb="3">
            <Square size="20px" rounded="5px" mr="1" bg={event?.color} />
            <Heading fontSize="4xl">{event?.name}</Heading>
        </HStack>
        <Text fontSize="xl" fontWeight="bold">
            {format(event?.startAt as Date, "EEEE, MM/dd HH:mm")}
            ~
            {
                event?.startAt.getFullYear() === event?.endAt.getFullYear() && event?.startAt.getMonth() === event?.endAt?.getMonth() && event?.startAt.getDate() === event?.endAt?.getDate() ? 
                    format(event?.endAt as Date, "HH:mm") : format(event?.endAt as Date, "EEEE, MM/dd HH:mm")
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
        <Box className="ag-theme-alpine" h="300px" w="full">
            <AgGridReact
                rowData={rsvp.row}
                columnDefs={rsvp.col}
                animateRows={true}
                defaultColDef={defaultColDef}
            />
        </Box>
        <Heading mt="5" fontSize="2xl">Attendance</Heading>
        {
            event?.useAttendance ? <>
                <Text mb="5">Attendance is used for this event.</Text>
            </> :
            <Text mb="5">Attendance is not used for this event.</Text>
        }
        <HStack>
            <Link to={`/dashboard/planner/${eventId}/edit`}>
                <Button leftIcon={<FiEdit />} colorScheme="blue">Edit Event</Button>
            </Link>
            <Button leftIcon={<FiTrash />} colorScheme="red" onClick={onOpen}>Delete Event</Button>
        </HStack>
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                    Delete Event
                    </AlertDialogHeader>

                    <AlertDialogBody>
                    Are you sure? You can&apos;t undo this action afterwards.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                    <Button onClick={onClose} ref={cancelRef as React.LegacyRef<HTMLButtonElement>}>
                        Cancel
                    </Button>
                    <Button colorScheme='red' onClick={() => {
                        deleteEvent.mutate({id: parseInt(eventId as string)},
                            {
                                onSuccess: () => {
                                    onClose();
                                    navigate('/dashboard/planner');
                                },
                                onError: (error) => {
                                    console.log(error);
                                    alert("An error has occured. Please try again later.")
                                }
                            }
                        );
                    }} ml={3}>
                        Delete
                    </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
      </AlertDialog>
    </>)
}