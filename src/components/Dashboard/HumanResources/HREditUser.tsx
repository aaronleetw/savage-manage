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
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ZEditUser } from "@/utils/types";
import { MultiSelect } from "chakra-multiselect";

export default function HREditUser() {
    const { userId } = useParams();

    const editUser = trpc.user.edit.useMutation();

    const { data: userInfo, status: userInfoStatus } = trpc.user.get.useQuery({ id: parseInt(userId as string) });

    const {data: roles} = trpc.user.getRoles.useQuery();
    const {data: accountTypes} = trpc.user.getAccountTypes.useQuery();

    const toast = useToast();
    const navigate = useNavigate();

    if (userInfoStatus == "loading") return <PageLoader />

    return (
    <>
        <Link to={`/dashboard/human-resources/${userId}/view`}>
            <Button leftIcon={<FiArrowLeft />} size="sm" mb="3">Back to User View</Button>
        </Link>
        <Card mb="5" maxWidth="900px">
            <CardHeader><Heading fontSize="2xl">Edit {userInfo?.englishName} [{userInfo?.chineseName}]</Heading></CardHeader>
            <Divider />
            <CardBody>
                <Formik
                    initialValues={{
                        id: userInfo?.id,
                        grade: userInfo?.grade,
                        class: userInfo?.class,
                        studentId: userInfo?.studentId,
                        number: userInfo?.number,
                        chineseName: userInfo?.chineseName,
                        englishName: userInfo?.englishName,
                        email: userInfo?.email,
                        roles: userInfo?.roles.map((role) => role.name) || [],
                        accountType: userInfo?.accountType?.name || "",
                        sendEmail: false,
                    }}
                    validationSchema={toFormikValidationSchema(ZEditUser)}
                    onSubmit={(values, actions) => {
                        const v = ZEditUser.parse(values)
                        editUser.mutate(v, {
                            onSuccess: () => {
                                toast({
                                    title: "Success",
                                    description: "User edited successfully",
                                    status: "success",
                                    duration: 9000,
                                    isClosable: true,
                                });
                                navigate(`/dashboard/human-resources/${userId}/view`)
                            },
                            onError: (error) => {
                                toast({
                                    title: "Error",
                                    description: error.message,
                                    status: "error",
                                    duration: 9000,
                                    isClosable: true,
                                })
                            },
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}>
                    {(ctx) => (
                        <Form onSubmit={ctx.handleSubmit}>
                            <Stack divider={<StackDivider />} spacing='4' mb="4">
                                <Box>
                                    <HStack>
                                        <FormControl isInvalid={!!ctx.errors.grade && ctx.touched.grade} isRequired mb="3">
                                            <FormLabel htmlFor="text">Grade</FormLabel>
                                            <Field
                                                as={Input}
                                                id="grade"
                                                name="grade"
                                                type="number"
                                            />
                                            <FormErrorMessage>{ctx.errors.grade}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isInvalid={!!ctx.errors.class && ctx.touched.class} isRequired mb="3">
                                            <FormLabel htmlFor="text">Class</FormLabel>
                                            <Field
                                                as={Input}
                                                id="class"
                                                name="class"
                                                type="text"
                                            />
                                            <FormErrorMessage>{ctx.errors.class}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isInvalid={!!ctx.errors.number && ctx.touched.number} isRequired mb="3">
                                            <FormLabel htmlFor="text">Number</FormLabel>
                                            <Field
                                                as={Input}
                                                id="number"
                                                name="number"
                                                type="number"
                                            />
                                            <FormErrorMessage>{ctx.errors.number}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isInvalid={!!ctx.errors.accountType && ctx.touched.accountType} isRequired mb="3">
                                            <MultiSelect
                                                options={accountTypes?.map((accountType) => {
                                                    return { label: accountType.name, value: accountType.name }
                                                })}
                                                required
                                                value={ctx.values.accountType}
                                                label='Account Type'
                                                placeholder="Select Account Type"
                                                onChange={(e) => {
                                                    ctx.setFieldValue('accountType', e)
                                                }}
                                                single
                                            />
                                            <FormErrorMessage>{ctx.errors.accountType}</FormErrorMessage>
                                        </FormControl>
                                    </HStack>
                                    <FormControl isInvalid={(!!ctx.errors.roles && ctx.touched.roles) as boolean} isRequired mb="3">
                                        <MultiSelect
                                            options={roles?.map((role) => {
                                                return { label: role.name, value: role.name }
                                            })}
                                            required
                                            value={ctx.values.roles}
                                            label='Roles'
                                            placeholder="Select Roles"
                                            onChange={(e) => {
                                                ctx.setFieldValue('roles', e)
                                            }}
                                        />
                                        <FormErrorMessage>{ctx.errors.roles}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={!!ctx.errors.studentId && ctx.touched.studentId} isRequired mb="3">
                                        <FormLabel htmlFor="text">Student ID</FormLabel>
                                        <Field
                                            as={Input}
                                            id="studentId"
                                            name="studentId"
                                            type="text"
                                        />
                                        <FormErrorMessage>{ctx.errors.studentId}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={!!ctx.errors.email && ctx.touched.email} isRequired mb="3">
                                        <FormLabel htmlFor="text">Email</FormLabel>
                                        <Field
                                            as={Input}
                                            id="email"
                                            name="email"
                                            type="text"
                                        />
                                        <FormErrorMessage>{ctx.errors.email}</FormErrorMessage>
                                    </FormControl>
                                </Box>
                                <HStack>
                                    <FormControl isInvalid={!!ctx.errors.englishName && ctx.touched.englishName} isRequired mb="3">
                                        <FormLabel htmlFor="text">English Name</FormLabel>
                                        <Field
                                            as={Input}
                                            id="englishName"
                                            name="englishName"
                                            type="text"
                                        />
                                        <FormErrorMessage>{ctx.errors.englishName}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={!!ctx.errors.chineseName && ctx.touched.chineseName} isRequired mb="3">
                                        <FormLabel htmlFor="text">Chinese Name</FormLabel>
                                        <Field
                                            as={Input}
                                            id="chineseName"
                                            name="chineseName"
                                            type="text"
                                        />
                                        <FormErrorMessage>{ctx.errors.chineseName}</FormErrorMessage>
                                    </FormControl>
                                </HStack>
                                <Box>
                                    <FormControl isInvalid={!!ctx.errors.sendEmail && ctx.touched.sendEmail} mb="3">
                                        <Field
                                            as={Checkbox}
                                            id="sendEmail"
                                            name="sendEmail"
                                            isChecked={ctx.values.sendEmail}
                                        >Send edit email to user?</Field>
                                        <FormHelperText>Check this if you want to send a edit email to the user, notifying them that their information has been changed.</FormHelperText>
                                        <FormErrorMessage>{ctx.errors.sendEmail}</FormErrorMessage>
                                    </FormControl>
                                </Box>
                                <HStack spacing="3">
                                    <Button type="submit" colorScheme="blue" isLoading={ctx.isSubmitting}>
                                        Edit User
                                    </Button>
                                    <Button type="button" colorScheme="red" isLoading={ctx.isSubmitting} onClick={() => {
                                        return navigate(`/dashboard/human-resources/${userId}/view`)
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