import { Formik, Form, Field } from "formik";
import { FormControl, FormLabel, FormHelperText, Input, FormErrorMessage, Textarea, Stack, StackDivider, Box, Button, Divider, Heading, Card, CardBody, CardHeader, HStack, InputLeftElement, InputGroup, Checkbox, Collapse, Badge, ChakraProvider, Square } from "@chakra-ui/react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useEffect, useMemo, useState } from "react";
import { chakraTheme } from "@/theme";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { trpc } from "@/utils/trpc";

export default function AddEvent() {
    const [users, setUsers] = useState<{row: any[], col: any[]}>({row: [], col: [
        { field: 'id', headerName: 'ID', width: 100, headerCheckboxSelection: true, checkboxSelection: true, sort: "asc" },
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
    ]});
    const sortable = useMemo(() => ({
        sortable: true
    }), []);
    const createEvent = trpc.planner.create.useMutation();

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
        }
    }, [getAllUsersStatus, getAllUsersQuery, users.col])

    const redirect = useNavigate();

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
                    initialValues={{
                        name: "",
                        description: "",
                        start: "",
                        end: "",
                        color: "blue",
                        useAttendance: false,
                        attendanceTimeout: 15,
                        useRSVP: false,
                        allowedUsers: [],
                        confirmedRSVP: [],
                        rsvpBefore: 3
                    }}
                    onSubmit={(values, actions) => {
                        createEvent.mutate(values, {
                            onSuccess: () => {
                                actions.resetForm();
                                redirect("/dashboard/planner");
                            },
                            onError: (err) => {
                                console.log(err);
                            },
                            onSettled: () => {
                                actions.setSubmitting(false);
                            }
                        });
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
                                        <FormControl isInvalid={!!errors.end && touched.end} isRequired>
                                            <FormLabel htmlFor="text">Event Length (HH:MM)</FormLabel>
                                            <Field
                                                as={Input}
                                                id="end"
                                                name="end"
                                                type="text"
                                                validate={(value: string) => {
                                                    let error;
                                                    if (!/^([0-9]+):([0-9]+)$/.test(value)) {
                                                        error = "Invalid time";
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
                                        <FormLabel>Users allowed to RSVP</FormLabel>
                                        <Box className="ag-theme-alpine" h="300px" w="full">
                                            <AgGridReact
                                                rowData={users.row}
                                                columnDefs={users.col}
                                                animateRows={true}
                                                rowSelection="multiple"
                                                defaultColDef={sortable}
                                                suppressRowClickSelection={true}
                                                onSelectionChanged={(event) => {
                                                    let selectedData = event.api.getSelectedRows().map((row: any) => {
                                                        return row.id;
                                                    });
                                                    setFieldValue("allowedUsers", selectedData);
                                                    return null;
                                                }}
                                            />
                                        </Box>
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
                                        <FormLabel>Confirmed Users</FormLabel>
                                        <Box className="ag-theme-alpine" h="300px" w="full">
                                            <AgGridReact
                                                rowData={users.row}
                                                columnDefs={users.col}
                                                animateRows={true}
                                                rowSelection="multiple"
                                                defaultColDef={sortable}
                                                suppressRowClickSelection={true}
                                                onSelectionChanged={(event) => {
                                                    let selectedData = event.api.getSelectedRows().map((row: any) => {
                                                        return row.id;
                                                    });
                                                    setFieldValue("confirmedRSVP", selectedData);
                                                    console.log(selectedData)
                                                    return null;
                                                }}
                                            />
                                        </Box>
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