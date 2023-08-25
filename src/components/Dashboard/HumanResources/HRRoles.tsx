import { Box, Heading, Badge, ChakraProvider, HStack, Button, useToast, Text, FormControl, FormLabel, Input, FormErrorMessage, Icon, Flex, useDisclosure, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlusCircle, FiUsers } from "react-icons/fi";
import ErrorPage from "@/components/ErrorPage";
import { trpc } from "@/utils/trpc";

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles//ag-grid.css';
import 'ag-grid-community/styles//ag-theme-alpine.css';
import PageLoader from "@/components/PageLoader";
import { Field, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ZCreateAccType, ZCreateRole } from "@/utils/types";
import Alert from "@/components/Alert";

export default function HRRoles() {

    const toast = useToast();
    const editAccountTypeMutation = trpc.user.editAccountType.useMutation();
    const editRoleMutation = trpc.user.editRole.useMutation();

    const deleteAccountTypeMutation = trpc.user.deleteAccountType.useMutation();
    const deleteRoleMutation = trpc.user.deleteRole.useMutation();

    const createAccountTypeMutation = trpc.user.createAccountType.useMutation();
    const createRoleMutation = trpc.user.createRole.useMutation();
    const { data: roles, status: rolesStatus, refetch: roleRefetch } = trpc.user.getRolesWithPermissions.useQuery();
    const { data: accountTypes, status: accountTypesStatus, refetch: accountTypeRefetch } = trpc.user.getAccountTypes.useQuery();
    const { data: permissions } = trpc.user.getPermissions.useQuery();

    const [alert, setAlert] = useState({} as {
        title: string,
        message: string,
        action: () => void,
    });

    const { isOpen, onOpen, onClose } = useDisclosure();

    const col = [
        { field: 'id', headerName: 'ID', width: 80, editable: false, sort: "asc" },
        { field: 'name', headerName: 'Name', width: 120, editable: editAccountTypeMutation.isIdle || editAccountTypeMutation.isSuccess },
        { field: 'color', headerName: 'Color', width: 120, editable: editAccountTypeMutation.isIdle || editAccountTypeMutation.isSuccess },
        { field: 'userCount', headerName: 'User Count', width: 120, editable: false },
        { field: 'delete', headerName: 'Operation', width: 120 },
    ]
    const roleCol = [
        { field: 'id', headerName: 'ID', width: 50, editable: false },
        { field: 'priority', headerName: 'Priority', width: 110, editable: editRoleMutation.isIdle || editRoleMutation.isSuccess, sort: "asc" },
        { field: 'name', headerName: 'Name', width: 120, editable: editRoleMutation.isIdle || editRoleMutation.isSuccess },
        { field: 'color', headerName: 'Color', width: 120, editable: editRoleMutation.isIdle || editRoleMutation.isSuccess },
        { field: 'userCount', headerName: 'User Count', width: 120, editable: false },
        ...(Object.keys(permissions || []).map((key) => {
            return {
                field: key,
                // @ts-ignore
                headerName: permissions![key]!.name.replace("Allow ", ""),
                width: 120,
                editable: editRoleMutation.isIdle || editRoleMutation.isSuccess,
            }
        })),
        { field: 'delete', headerName: 'Operation', width: 120 }
    ]
    const defaultColDef = useMemo(() => ({
        sortable: true
    }), []);

    if (rolesStatus == "loading" || accountTypesStatus == "loading") {
        return <PageLoader />
    }
    if (rolesStatus == "error" || accountTypesStatus == "error") {
        return <ErrorPage />
    }

    return (
        <Box>
            <Link to="/dashboard/human-resources">
                <Button leftIcon={<FiArrowLeft />} size="sm" mb="3">Back to List View</Button>
            </Link>
            <Box>
                <HStack mb="5">
                    <Heading fontSize="6xl">Account Types</Heading>
                </HStack>
                <Box className="ag-theme-alpine" h="250px" w="full" maxWidth="800px">
                    <AgGridReact
                        rowData={accountTypes.map((aT) => {
                            return { ...aT, delete: "Delete" }
                        })}
                        // @ts-ignore
                        columnDefs={col}
                        animateRows={true}
                        defaultColDef={defaultColDef}
                        rowStyle={{ cursor: "pointer" }}
                        stopEditingWhenCellsLoseFocus={true}
                        onCellEditingStopped={(event) => {
                            if (event.valueChanged) {
                                editAccountTypeMutation.mutate({
                                    id: event.data?.id || -1,
                                    name: event.data?.name || "",
                                    color: event.data?.color || ""
                                }, {
                                    onSuccess: () => {
                                        toast({
                                            title: "Success",
                                            description: `Account Type updated for ${event.data?.name}`,
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
                                        await accountTypeRefetch();
                                    }
                                })
                            }
                        }} onCellClicked={(event) => {
                            if (event.colDef.field !== "delete") {
                                return;
                            }
                            setAlert({
                                title: `Account Type ${event.data?.name}`,
                                message: `This operation will set ${event.data?.userCount} users with this account type to the default account type.`,
                                action: () => {
                                    deleteAccountTypeMutation.mutate({
                                        id: event.data?.id || -1,
                                    }, {
                                        onSuccess: () => {
                                            toast({
                                                title: "Success",
                                                description: `Account Type deleted for ${event.data?.name}`,
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
                                            await accountTypeRefetch();
                                            onClose();
                                        }
                                    })
                                }
                            })
                            onOpen();
                        }} />
                </Box>
                <Box mt="3" maxWidth="800px">
                    <Formik
                        initialValues={{
                            name: "",
                            color: "",
                        }}
                        onSubmit={async (values, actions) => {
                            createAccountTypeMutation.mutate(values, {
                                onSuccess: () => {
                                    toast({
                                        title: "Success",
                                        description: `Account Type created for ${values.name}`,
                                        status: "success",
                                        duration: 5000,
                                        isClosable: true,
                                    })
                                    actions.resetForm();
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
                                    await accountTypeRefetch();
                                }
                            })
                        }}
                        validationSchema={toFormikValidationSchema(ZCreateAccType)}
                    >
                        {(ctx) => (
                            <form onSubmit={ctx.handleSubmit}>
                                <HStack spacing={4} align="flex-start">
                                    <FormControl isInvalid={!!ctx.errors.name && ctx.touched.name} flexGrow={1}>
                                        <Field
                                            as={Input}
                                            id="name"
                                            name="name"
                                            type="text"
                                            autoComplete="off"
                                            placeholder="Name"
                                        />
                                        <FormErrorMessage>{ctx.errors.name}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={!!ctx.errors.color && ctx.touched.color} flexGrow={1}>
                                        <Field
                                            as={Input}
                                            id="color"
                                            name="color"
                                            type="text"
                                            autoComplete="off"
                                            placeholder="Color"
                                        />
                                        <FormErrorMessage>{ctx.errors.color}</FormErrorMessage>
                                    </FormControl>
                                    <Button type="submit" colorScheme="blue" width="full" isLoading={ctx.isSubmitting}>
                                        <Icon as={FiPlusCircle} mr="2" />
                                        Create Account Type
                                    </Button>
                                </HStack>
                            </form>
                        )}
                    </Formik>
                </Box>
            </Box>
            <Box mt="5">
                <HStack mb="5">
                    <Heading fontSize="6xl">Roles</Heading>
                </HStack>
                <HStack gap={5} alignItems={"stretch"} flexDir={{base: "column", lg: "row"}}>
                    <Box className="ag-theme-alpine" w="full" h={{ base: "500px", lg: "unset" }}>
                        <AgGridReact
                            rowData={roles.map((r) => {
                                return { ...r, delete: "Delete" }
                            })}
                            // @ts-ignore
                            columnDefs={roleCol}
                            animateRows={true}
                            defaultColDef={defaultColDef}
                            rowStyle={{ cursor: "pointer" }}
                            stopEditingWhenCellsLoseFocus={true}
                            onCellEditingStopped={(event) => {
                                if (event.valueChanged) {
                                    console.log(event?.data)
                                    editRoleMutation.mutate({
                                        // @ts-ignore
                                        ...event?.data!
                                    }, {
                                        onSuccess: () => {
                                            toast({
                                                title: "Success",
                                                description: `Role updated for ${event.data?.name}`,
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
                                            await roleRefetch();
                                        }
                                    })
                                }
                            }} onCellClicked={(event) => {
                                if (event.colDef.field !== "delete") {
                                    return;
                                }
                                setAlert({
                                    title: `Role ${event.data?.name}`,
                                    message: `This operation will remove this role from ${event.data?.userCount} users.`,
                                    action: () => {
                                        deleteRoleMutation.mutate({
                                            id: event.data?.id || -1,
                                        }, {
                                            onSuccess: () => {
                                                toast({
                                                    title: "Success",
                                                    description: `Role deleted for ${event.data?.name}`,
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
                                                await roleRefetch();
                                                onClose();
                                            }
                                        })
                                    }
                                })
                                onOpen();
                            }} />
                    </Box>
                    <Box width={{base: "full", lg: "30vw"}}>
                        <Heading as="h2" fontSize="2xl">Permissions</Heading>
                        <Accordion mt="4" allowMultiple>
                            {
                                Object.keys(permissions || []).map((key) => {
                                    return (
                                        <AccordionItem key={key}>
                                            <h2>
                                                <AccordionButton>
                                                    <Box as="span" flex='1' textAlign='left'>
                                                        {/* @ts-ignore */}
                                                        {permissions![key].name}
                                                    </Box>
                                                    <AccordionIcon />
                                                </AccordionButton>
                                            </h2>
                                            <AccordionPanel pb={4}>
                                                {/* @ts-ignore */}
                                                {permissions![key].description}
                                            </AccordionPanel>
                                        </AccordionItem>
                                    )
                                })
                            }
                        </Accordion>
                    </Box>
                </HStack>
                <Box mt="3">
                    <Formik
                        initialValues={{
                            name: "",
                            priority: 0,
                            color: "",
                        }}
                        onSubmit={async (values, actions) => {
                            createRoleMutation.mutate(values, {
                                onSuccess: () => {
                                    toast({
                                        title: "Success",
                                        description: `Role created for ${values.name}`,
                                        status: "success",
                                        duration: 5000,
                                        isClosable: true,
                                    })
                                    actions.resetForm();
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
                                    await roleRefetch();
                                }
                            })
                        }}
                        validationSchema={toFormikValidationSchema(ZCreateRole)}
                    >
                        {(ctx) => (
                            <form onSubmit={ctx.handleSubmit}>
                                <HStack spacing={4} align="flex-start">
                                    <FormControl isInvalid={!!ctx.errors.name && ctx.touched.name} flexGrow={1}>
                                        <Field
                                            as={Input}
                                            id="name"
                                            name="name"
                                            type="text"
                                            autoComplete="off"
                                            placeholder="Name"
                                        />
                                        <FormErrorMessage>{ctx.errors.name}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={!!ctx.errors.priority && ctx.touched.priority} flexGrow={1}>
                                        <Field
                                            as={Input}
                                            id="priority"
                                            name="priority"
                                            type="number"
                                            autoComplete="off"
                                            placeholder="Priority"
                                        />
                                        <FormErrorMessage>{ctx.errors.priority}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={!!ctx.errors.color && ctx.touched.color} flexGrow={1}>
                                        <Field
                                            as={Input}
                                            id="color"
                                            name="color"
                                            type="text"
                                            autoComplete="off"
                                            placeholder="Color"
                                        />
                                        <FormErrorMessage>{ctx.errors.color}</FormErrorMessage>
                                    </FormControl>
                                    <Button type="submit" colorScheme="blue" width="full" isLoading={ctx.isSubmitting}>
                                        <Icon as={FiPlusCircle} mr="2" />
                                        Create Role
                                    </Button>
                                </HStack>
                            </form>
                        )}
                    </Formik>
                </Box>
            </Box>
            <Alert isOpen={isOpen} onClose={onClose} executeAction={alert.action} title={alert.title}>
                <>{alert.message}</>
            </Alert>
        </Box>
    )
}