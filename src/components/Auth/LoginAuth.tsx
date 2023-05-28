import { Formik, Field } from 'formik'
import { FormControl, Input, Button, FormLabel, FormErrorMessage, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router';
import { MessageType } from './types';
import { trpc } from '@/utils/trpc';
import { z } from 'zod';

export default function LoginAuth({ setMsg }: { setMsg: (msg: MessageType) => void }) {
    const router = useRouter();
    const loginMutation = trpc.auth.login.useMutation({
        onError: (error) => {
            setMsg({ status: "error", msg: error.message });
        },
        onSuccess: (data) => {
            setMsg({ status: "success", msg: "Logged in successfully" });
            router.push("/dashboard/home")
        }
    });

    return (
        <Formik
            initialValues={{
                email: "",
                password: "",
            }}
            onSubmit={async ({ email, password }) => {
                await loginMutation.mutateAsync(z.object({
                    email: z.string().email(),
                    password: z.string().min(6),
                }).parse({email, password}))
            }}
        >
            {({ isSubmitting, handleSubmit, errors, touched }) => (
                <form onSubmit={handleSubmit}>
                    <VStack spacing={4} align="flex-start">
                        <FormControl isInvalid={!!errors.email && touched.email}>
                            <FormLabel htmlFor="email">Email Address</FormLabel>
                            <Field
                                as={Input}
                                id="email"
                                name="email"
                                type="email"
                                variant="filled"
                                validate={(value: string) => {
                                    return RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).test(value) ? null : "Invalid email address";
                                }}
                                autoComplete="off"
                            />
                            <FormErrorMessage>{errors.email}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={!!errors.password && touched.password}>
                            <FormLabel htmlFor="password">Password</FormLabel>
                            <Field
                                as={Input}
                                id="password"
                                name="password"
                                type="password"
                                variant="filled"
                                validate={(value: string) => {
                                    let error;

                                    if (value.length < 6) {
                                        error = "Password must contain at least 6 characters";
                                    }

                                    return error;
                                }}
                            />
                            <FormErrorMessage>{errors.password}</FormErrorMessage>
                        </FormControl>
                        <Button type="submit" colorScheme="blue" width="full" isLoading={isSubmitting}>
                            Login
                        </Button>
                    </VStack>
                </form>
            )}
        </Formik>
    )
}