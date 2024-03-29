import { Formik, Form, Field } from "formik";
import { FormControl, FormLabel, FormHelperText, Input, FormErrorMessage, Textarea, Stack, StackDivider, Box, Button, Divider, Heading, Card, CardBody, CardHeader, HStack, InputLeftElement, InputGroup, Checkbox, Collapse, Badge, ChakraProvider, Square, InputRightElement, Select, useToast } from "@chakra-ui/react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { FC, useEffect, useMemo, useState } from "react";
import { chakraTheme } from "@/theme";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { trpc } from "@/utils/trpc";
import { ZCreateUser } from "@/utils/types";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { MultiSelect, MultiSelectProps, useMultiSelect } from 'chakra-multiselect'

export default function HRCreateUser() {

    const redirect = useNavigate();

    const [showPassword, setShowPassword] = useState(true);

    const toast = useToast();

    const {data: roles} = trpc.user.getRoles.useQuery();
    const {data: accountTypes} = trpc.user.getAccountTypes.useQuery();

    const createUser = trpc.user.create.useMutation();

    return (
    <>
        <Link to="/dashboard/human-resources">
            <Button leftIcon={<FiArrowLeft />} size="sm" mb="3">Back to List View</Button>
        </Link>
        <Card mb="5" maxWidth="900px">
            <CardHeader><Heading fontSize="2xl">Create User</Heading></CardHeader>
            <Divider />
            <CardBody>
                <Formik
                    initialValues={{
                        grade: NaN,
                        class: "HO",
                        studentId: "",
                        password: Math.random().toString(36).slice(-8),
                        number: NaN,
                        chineseName: "",
                        englishName: "",
                        email: "",
                        roles: [],
                        accountType: "",
                        sendEmail: true,
                    }}
                    validationSchema={toFormikValidationSchema(ZCreateUser)}
                    onSubmit={(values, actions) => {
                        const v = ZCreateUser.parse(values)
                        createUser.mutate(v, {
                            onSuccess: () => {
                                toast({
                                    title: "Success",
                                    description: "User created successfully",
                                    status: "success",
                                    duration: 9000,
                                    isClosable: true,
                                });
                                redirect('/dashboard/human-resources')
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
                                    <FormControl isInvalid={!!ctx.errors.password && ctx.touched.password} isRequired mb="3">
                                        <FormLabel htmlFor="text">Password</FormLabel>
                                        <InputGroup>
                                            <Field
                                                as={Input}
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                            />
                                            <InputRightElement width='10.5rem'>
                                                <HStack>
                                                    <Button h='1.75rem' size='sm' onClick={() => {
                                                        setShowPassword(!showPassword)}
                                                    }>
                                                    {showPassword ? 'Hide' : 'Show'}
                                                    </Button>
                                                    <Button h='1.75rem' size='sm' onClick={() => {
                                                        ctx.setFieldValue("password", Math.random().toString(36).slice(-8))
                                                    }}>Generate</Button>
                                                </HStack>
                                            </InputRightElement>
                                        </InputGroup>
                                        <FormErrorMessage>{ctx.errors.password}</FormErrorMessage>  
                                    </FormControl>
                                    <FormControl isInvalid={!!ctx.errors.sendEmail && ctx.touched.sendEmail} mb="3">
                                        <Field
                                            as={Checkbox}
                                            id="sendEmail"
                                            name="sendEmail"
                                            isChecked={ctx.values.sendEmail}
                                        >Send creation email to user?</Field>
                                        <FormHelperText>Check this if you want to send a creation email to the user, including their password.</FormHelperText>
                                        <FormErrorMessage>{ctx.errors.sendEmail}</FormErrorMessage>
                                    </FormControl>
                                </Box>
                                <HStack spacing="3">
                                    <Button type="submit" colorScheme="blue" isLoading={ctx.isSubmitting}>
                                        Create User
                                    </Button>
                                    <Button type="button" colorScheme="red" isLoading={ctx.isSubmitting} onClick={() => {
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