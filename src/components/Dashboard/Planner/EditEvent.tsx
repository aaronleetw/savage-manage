import { Formik, Form, Field } from "formik";
import { FormControl, FormLabel, FormHelperText, Input, FormErrorMessage, Textarea, Stack, StackDivider, Box, Button, Divider, Heading, Card, CardBody, CardHeader, HStack, InputLeftElement, InputGroup, Checkbox, Collapse, Badge, ChakraProvider, Square, Icon, Text, useToast } from "@chakra-ui/react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useEffect, useMemo, useState } from "react";
import { chakraTheme } from "@/theme";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiHelpCircle, FiSlash, FiXCircle } from "react-icons/fi";
import { trpc } from "@/utils/trpc";
import { data } from "autoprefixer";
import PageLoader from "@/components/PageLoader";
import { format } from "date-fns";
import StatusEditor from "./EditEventStatusSelect";

export default function EditEvent() {
    const { eventId } = useParams();
    const toast = useToast();

    const { data: getAllUsersQuery, status: getAllUsersStatus, refetch: userRefetch, isRefetching: userIsRefetching } = trpc.user.all.useQuery();
    const { data: event, status: eventStatus, refetch: eventRefetch, isRefetching: eventIsRefetching } = trpc.planner.get.useQuery({
        id: parseInt(eventId as string),
    })
    const adminEditRsvpMutation = trpc.planner.adminEditRsvp.useMutation();
    const editEventMutation = trpc.planner.edit.useMutation();

    const [rsvp, setRsvp] = useState<{row: any[], col: any[]}>({row: [], col: [
        { field: 'id', headerName: 'RSVP ID', width: 90 },
        { field: 'uid', headerName: 'User ID', width: 90 },
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
                        as={params.value == 2 ? FiCheckCircle : (params.value == 1 ? FiXCircle : (params.value == 0 ? FiHelpCircle : FiSlash))}
                        color={params.value == 2 ? "green.500" : (params.value == 1 ? "red.500" : (params.value == 0 ? "yellow.500" : "red.500"))}
                        fontSize="2xl"
                        mr="1"
                    />
                    <Text>
                        {params.value == 2 ? "Will Attend" : (params.value == 1 ? "Will Not Attend" : (params.value == 0 ? "Not Responded Yet" : "Not Allowed"))}
                    </Text>
                </HStack>
            )},
            cellEditor: StatusEditor,
            cellEditorPopup: true,
            editable: true,
            singleClickEdit: true,
            cellStyle: {cursor: 'pointer'},
            sort: "desc",
            comparator: (valueA: any, valueB: any) => valueA - valueB
        }
    ]});
    const sortable = useMemo(() => ({
        sortable: true
    }), []);


    useEffect(() => {
        if (eventStatus !== 'success' || getAllUsersStatus !== 'success') return;
        console.log(event?.rsvp)
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
        getAllUsersQuery.forEach((item) => {
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
                status: -1
            })
        })
        setRsvp({row: rsvpData as any, col: rsvp.col});
    }, [eventStatus, getAllUsersStatus, userIsRefetching, eventIsRefetching, getAllUsersQuery, event?.allowedUsers, event?.rsvp, rsvp.col])

    const redirect = useNavigate();

    if (eventStatus === "loading" || eventStatus === "error") {
        return (
            <PageLoader></PageLoader>
        )
    }

    return (
    <>
        <Link to={`/dashboard/planner/${eventId}/view`}>
            <Button leftIcon={<FiArrowLeft />} size="sm" mb="3">Back to Event View</Button>
        </Link>
        <Card mb="5">
            <CardHeader><Heading fontSize="2xl">Edit Event: {event?.name}</Heading></CardHeader>
            <Divider />
            <CardBody>
                <Formik
                    initialValues={{
                        id: parseInt(eventId as string),
                        name: event?.name,
                        description: event?.description,
                        start: event?.startAt.toString(),
                        end: event?.endAt.toString(),
                        color: event?.color,
                        useAttendance: event?.useAttendance,
                        attendanceTimeout: event?.attendanceTimeout,
                        useRSVP: event?.useRSVP,
                        rsvpBefore: event?.rsvpBefore,
                    }}
                    onSubmit={(values, actions) => {
                        // @ts-ignore
                        editEventMutation.mutate(values, {
                            onSuccess: () => {
                                actions.resetForm();
                                redirect(`/dashboard/planner/${eventId}/view`);
                            },
                            onError: (err) => {
                                toast({
                                    title: "Error",
                                    description: err.message,
                                    status: "error",
                                    duration: 5000,
                                    isClosable: true,
                                })
                            },
                            onSettled: () => {
                                actions.setSubmitting(false);
                            }
                        })
                        console.log(values)
                        actions.setSubmitting(false);
                    }}
                >
                    {({isSubmitting, handleSubmit, errors, touched, resetForm, values, setFieldValue}) => (
                        <Form onSubmit={handleSubmit}>
                            <Stack divider={<StackDivider />} spacing='4' mb="4">
                                <Box>
                                    <FormControl isInvalid={!!errors.name && touched.name} isRequired mb="3">
                                        <FormLabel htmlFor="text">Event Name</FormLabel>
                                        <Field
                                            as={Input}
                                            id="name"
                                            name="name"
                                            type="text"
                                            validate={(value: string) => {
                                                let error;

                                                if (value.length <= 0) {
                                                    error = "You must enter a name";
                                                }

                                                return error;
                                            }}
                                        />
                                        <FormErrorMessage>{errors.name}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={!!errors.description && touched.description}>
                                        <FormLabel htmlFor="text">Description</FormLabel>
                                        <Field
                                            as={Textarea}
                                            id="description"
                                            name="description"
                                            type="text"
                                        />
                                        <FormErrorMessage>{errors.description}</FormErrorMessage>
                                    </FormControl>
                                </Box>
                                <Box>
                                    <HStack spacing="8">
                                        <FormControl isInvalid={!!errors.start && touched.start} isRequired>
                                            <FormLabel htmlFor="text">Start Date/Time (Comma-Separated)</FormLabel>
                                            <Field
                                                as={Input}
                                                id="start"
                                                name="start"
                                                type="text"
                                                validate={(value: string) => {
                                                    let error = "";
                                                    let date = new Date(value);
                                                    if (date.toString() === "Invalid Date") {
                                                        error = "Invalid date/time";
                                                    }
                                                    return error;
                                                }}
                                            />
                                            <FormErrorMessage>{errors.start}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isInvalid={!!errors.end && touched.end} isRequired>
                                            <FormLabel htmlFor="text">End Time</FormLabel>
                                            <Field
                                                as={Input}
                                                id="end"
                                                name="end"
                                                type="text"
                                                validate={(value: string) => {
                                                    let error = "";
                                                    let date = new Date(value);
                                                    if (date.toString() === "Invalid Date") {
                                                        error = "Invalid date/time";
                                                    }
                                                    return error;
                                                }}
                                            />
                                            <FormErrorMessage>{errors.end}</FormErrorMessage>
                                        </FormControl>
                                    </HStack>
                                </Box>
                                <Box>
                                    <FormControl isInvalid={!!errors.color && touched.color} mb="3" isRequired>
                                        <FormLabel htmlFor="text">Color</FormLabel>
                                        <HStack>
                                            <Square size="30px" bg={values.color} borderRadius="md" />
                                            <Field
                                                as={Input}
                                                id="color"
                                                name="color"
                                                type="text"
                                                validate={(value: string) => {
                                                    let error;
                                                    if (value.length <= 0) {
                                                        error = "You must enter a color";
                                                    }
                                                    return error
                                                }}
                                            />
                                        </HStack>
                                        <FormErrorMessage>{errors.color}</FormErrorMessage>
                                    </FormControl>
                                </Box>
                                <Box>
                                    <FormControl isInvalid={!!errors.useAttendance && touched.useAttendance} mb="3">
                                        <Field
                                            as={Checkbox}
                                            id="useAttendance"
                                            name="useAttendance"
                                            isChecked={values.useAttendance}
                                            validate={(value: boolean) => {
                                                let error;
                                                if (value === undefined) {
                                                    error = "You must enter a useAttendance";
                                                }
                                                return error
                                            }}
                                        >Use Attendance</Field>
                                        <FormHelperText>Check this if you want to record attendance status for this event.</FormHelperText>
                                        <FormErrorMessage>{errors.useAttendance}</FormErrorMessage>
                                    </FormControl>
                                    <Collapse in={values.useAttendance}>
                                        <FormControl isInvalid={!!errors.attendanceTimeout && touched.attendanceTimeout}>
                                            <FormLabel htmlFor="text">Attendance Timeout</FormLabel>
                                            <Field
                                                as={Input}
                                                id="attendanceTimeout"
                                                name="attendanceTimeout"
                                                type="number"
                                                validate={(value: number) => {
                                                    let error;
                                                    if (value === undefined) {
                                                        error = "You must enter a attendanceTimeout";
                                                    }
                                                    return error
                                                }}
                                            />
                                            <FormHelperText>How long before and after the event starts should attendance be recorded? This is in minutes.</FormHelperText>
                                            <FormErrorMessage>{errors.attendanceTimeout}</FormErrorMessage>
                                        </FormControl>
                                    </Collapse>
                                </Box>
                                <Box>
                                    <FormControl isInvalid={!!errors.useRSVP && touched.useRSVP} mb="3">
                                        <Field
                                            as={Checkbox}
                                            id="useRSVP"
                                            name="useRSVP"
                                            isChecked={values.useRSVP}
                                            validate={(value: boolean) => {
                                                let error;
                                                if (value === undefined) {
                                                    error = "You must enter a useRSVP";
                                                }
                                                return error
                                            }}
                                        >Use RSVP</Field>
                                        <FormHelperText>Check this if you want to allow users to RSVP to this event.</FormHelperText>
                                        <FormErrorMessage>{errors.useRSVP}</FormErrorMessage>
                                    </FormControl>
                                    <Collapse in={values.useRSVP}>
                                        <FormControl isInvalid={!!errors.rsvpBefore && touched.rsvpBefore} mt="3">
                                            <FormLabel htmlFor="text">RSVP Before</FormLabel>
                                            <Field
                                                as={Input}
                                                id="rsvpBefore"
                                                name="rsvpBefore"
                                                type="number"
                                                validate={(value: number) => {
                                                    let error;
                                                    if (value === undefined) {
                                                        error = "You must enter a rsvpBefore";
                                                    }
                                                    return error
                                                }}
                                            />
                                            <FormHelperText>How long before the event starts should RSVPs be allowed? This is in days.</FormHelperText>
                                            <FormErrorMessage>{errors.rsvpBefore}</FormErrorMessage>
                                        </FormControl>
                                    </Collapse>
                                </Box>
                                <Box>
                                    <FormControl>
                                        <FormLabel><Heading as="h3" fontSize="2xl">Attending Users</Heading></FormLabel>
                                        <Box className="ag-theme-alpine" h="300px" w="full">
                                            <AgGridReact
                                                rowData={rsvp.row}
                                                columnDefs={rsvp.col}
                                                animateRows={true}
                                                defaultColDef={sortable}
                                                suppressRowClickSelection={true}
                                                stopEditingWhenCellsLoseFocus={true}
                                                onCellEditingStopped={(event) => {
                                                    if (event.valueChanged) {
                                                        adminEditRsvpMutation.mutate({
                                                            eventId: parseInt(eventId as string),
                                                            userId: event.data.uid,
                                                            status: event.newValue
                                                        }, {
                                                            onSuccess: () => {
                                                                toast({
                                                                    title: "Success",
                                                                    description: `RSVP status updated for ${event.data.englishName}`,
                                                                    status: "success",
                                                                    duration: 5000,
                                                                    isClosable: true,
                                                                })
                                                            },
                                                            onError: (error) => {
                                                                toast({
                                                                    title: "Error",
                                                                    description: error.message,
                                                                    status: "error",
                                                                    duration: 5000,
                                                                    isClosable: true,
                                                                })
                                                            },
                                                            onSettled: async () => {
                                                                await eventRefetch();
                                                                await userRefetch();
                                                            }
                                                        })
                                                    }
                                                }}
                                            />
                                        </Box>
                                        <FormHelperText>Click on any cell in the Status column to modify records.</FormHelperText>
                                    </FormControl>
                                </Box>
                                <HStack spacing="3">
                                    <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
                                        Edit Event
                                    </Button>
                                    <Button type="button" colorScheme="red" isLoading={isSubmitting} onClick={() => {
                                        return redirect(`/dashboard/planner/${eventId}/view`)
                                    }}>Cancel</Button>
                                </HStack>
                            </Stack>
                        </Form>
                    )}
                </Formik>
            </CardBody>
        </Card>
    </>
    )
}