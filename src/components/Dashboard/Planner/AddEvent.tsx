import { Formik, Form, Field } from "formik";
import { FormControl, FormLabel, FormHelperText, Input, FormErrorMessage, Textarea, Stack, StackDivider, Box, Button, Divider, Heading, Card, CardBody, CardHeader, HStack, InputLeftElement, InputGroup, Checkbox, Collapse, Badge, ChakraProvider } from "@chakra-ui/react";
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material";
import { chakraTheme, muiTheme } from "@/theme";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { trpc } from "@/utils/trpc";

export default function AddEvent() {
    const [users, setUsers] = useState<{row: any[], col: any[]}>({row: [], col: [
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
    ]});
    const [usersLoading, setUsersLoading] = useState(true);
    const redirect = useNavigate();

    const { data: getAllUsersQuery, status: getAllUsersStatus } = trpc.user.all.useQuery();
    useEffect(() => {
        if (getAllUsersStatus == "success") {
            setUsers({
                row: getAllUsersQuery?.map((user) => {
                    return {
                        id: user.id,
                        grade: user.grade,
                        class: user.class,
                        chineseName: user.chineseName,
                        englishName: user.englishName,
                        accountType: user.accountType,
                        roles: user.roles
                    }
                }), col: users.col});
            setUsersLoading(false);
        }
    }, [getAllUsersStatus])

    return (
    <>
        <Link to="/dashboard/planner">
            <Button leftIcon={<FiArrowLeft />} size="sm" mb="3">Back to Calendar View</Button>
        </Link>
        <Card mb="5">
            <CardHeader><Heading fontSize="2xl">Add Event</Heading></CardHeader>
            <Divider />
            <CardBody>
                <Formik
                /*
                    {
                        "name": String
                        "description": String
                        "start": Date
                        "end": Date
                        "color": String
                        "useAttendance": Boolean
                        "attendanceTimeout": Number?

                        "useRSVP": Boolean        
                        "allowedUsers": [Number]?
                        "rsvpBefore": DateTime?

                        "confirmedRSVP": [Number]? // User IDs
                    }
                */
                    initialValues={{
                        name: "",
                        description: "",
                        start: "",
                        end: "",
                        color: "blue",
                        useAttendance: false,
                        attendanceTimeout: 0,
                        useRSVP: false,
                        allowedUsers: "[]",
                        confirmedRSVP: "[]",
                        rsvpBefore: ""
                    }}
                    onSubmit={(values, actions) => {
                        // TODO:
                        // fetch(`${API_URL}/planner/create`, {
                        //     method: "POST",
                        //     headers: {
                        //         "Authorization": "Bearer " + localStorage.getItem("token"),
                        //         "Content-Type": "application/json",
                        //     },
                        //     body: JSON.stringify(values)
                        // }).then((res) => res.json())
                        //     .then((data) => {
                        //         if (data.success) {
                        //             actions.resetForm();
                        //             redirect("/dashboard/planner");
                        //         }
                        //     }).catch((err) => {
                        //         console.log(err)
                        //     }).finally(() => {
                        //         actions.setSubmitting(false);
                        //     })
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
                                            validate={(value: string) => {
                                                let error;
                                                return error;
                                            }}
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
                                                    let error;
                                                    if (value.length <= 0) {
                                                        error = "You must enter a start date/time";
                                                    }
                                                    value.split(',').map((val: string) => {
                                                        let date = new Date(val);
                                                        if (date.toString() === "Invalid Date") {
                                                            error = "Invalid date/time";
                                                        }
                                                    })
                                                    return error;
                                                }}
                                            />
                                            <FormErrorMessage>{errors.start}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isInvalid={!!errors.end && touched.end}>
                                            <FormLabel htmlFor="text">Elapsed Time (HH:MM)</FormLabel>
                                            <Field
                                                as={Input}
                                                id="end"
                                                name="end"
                                                type="text"
                                                validate={(value: string) => {
                                                    let error;
                                                    if (!value) {
                                                        return error;
                                                    }
                                                    if (value.split(':').length !== 2) {
                                                        error = "You must enter a valid time";
                                                    }
                                                    let hours = parseInt(value.split(':')[0]);
                                                    let minutes = parseInt(value.split(':')[1]);
                                                    if (isNaN(hours) || isNaN(minutes)) {
                                                        error = "You must enter a valid time";
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
                                            <FormHelperText>How long before and after the event starts should attendance be recorded?</FormHelperText>
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
                                        <FormLabel>Users allowed to RSVP</FormLabel>
                                        <ThemeProvider theme={muiTheme}>
                                            <DataGrid rows={users.row} columns={users.col} loading={usersLoading} autoHeight checkboxSelection onRowSelectionModelChange={
                                                (e) => {
                                                    setFieldValue("allowedUsers", JSON.stringify(e))
                                                }
                                            }/>
                                        </ThemeProvider>
                                        <FormControl isInvalid={!!errors.rsvpBefore && touched.rsvpBefore} mt="3">
                                            <FormLabel htmlFor="text">RSVP Before</FormLabel>
                                            <Field
                                                as={Input}
                                                id="rsvpBefore"
                                                name="rsvpBefore"
                                                type="text"
                                                validate={(value: number) => {
                                                    let error;
                                                    if (value === undefined) {
                                                        error = "You must enter a rsvpBefore";
                                                    }
                                                    return error
                                                }}
                                            />
                                            <FormHelperText>How long before the event starts should RSVPs be allowed?</FormHelperText>
                                            <FormErrorMessage>{errors.rsvpBefore}</FormErrorMessage>
                                        </FormControl>
                                    </Collapse>
                                </Box>
                                <Box>
                                    <FormControl>
                                        <FormLabel>Confirmed Users</FormLabel>
                                        <ThemeProvider theme={muiTheme}>
                                            <DataGrid rows={users.row} columns={users.col} loading={usersLoading} autoHeight checkboxSelection onRowSelectionModelChange={
                                                (e) => {
                                                    setFieldValue("confirmedRSVP", JSON.stringify(e))
                                                }
                                            }/>
                                        </ThemeProvider>
                                        <FormHelperText>Users who are already confirmed to attend the event.</FormHelperText>
                                    </FormControl>
                                </Box>
                                <HStack spacing="3">
                                    <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
                                        Add Event
                                    </Button>
                                    <Button type="button" colorScheme="red" isLoading={isSubmitting} onClick={() => {
                                        return redirect("/dashboard/planner")
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