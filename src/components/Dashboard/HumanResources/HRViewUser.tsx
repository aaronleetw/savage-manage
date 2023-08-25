import ErrorPage from "@/components/ErrorPage";
import PageLoader from "@/components/PageLoader";
import { trpc } from "@/utils/trpc";
import { Card, CardBody, CardHeader, Divider, Heading, HStack, Image, Box, Badge, Link as ChakraLink, Icon, Button, VStack, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, useDisclosure } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function HRViewUser() {
    const { userId } = useParams();
    const { data: userInfo, status: userInfoStatus } = trpc.user.get.useQuery({ id: parseInt(userId as string) });

    const deleteUser = trpc.user.delete.useMutation();

    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;

    const navigate = useNavigate();

    return (
        <>
            <Link to="/dashboard/human-resources">
                <Button leftIcon={<FiArrowLeft />} size="sm" mb="3">Back to List View</Button>
            </Link>
            {
                userInfoStatus == "success" ? (
                    <Card>
                        <CardHeader><Heading>{userInfo.englishName} [{userInfo.chineseName}] <Badge colorScheme={userInfo.accountType?.color} fontSize="20px">{userInfo.accountType?.name}</Badge></Heading></CardHeader>
                        <Divider></Divider>
                        <CardBody>
                            <HStack align="top" gap="3" mb="3">
                                <Image src='TODO: it is currently a placeholder' fallbackSrc='https://placehold.co/300x400' w={[100, 200, 200]} h={[133, 266, 266]} alt="User image" />
                                <VStack w="100%" justify={"start"} alignItems={"start"} gap={0}>
                                    <HStack gap="1" mb="3">
                                        {
                                            userInfo.roles.map((value: any) => {
                                                return (
                                                    <Badge colorScheme={value.color} fontSize="15" key={value.name}>{value.name}</Badge>
                                                )
                                            })
                                        }
                                    </HStack>
                                    <Heading fontSize="2xl" mb="2">Class: {userInfo.grade} {userInfo.class}</Heading>
                                    <Heading fontSize="2xl" mb="2">Number: {userInfo.number}</Heading>
                                    <Heading fontSize="2xl" mb="2" flexGrow={1}>Email: <ChakraLink href="mailto:{userInfo.email}" color="blue.500">{userInfo.email} <Icon as={FiExternalLink} /> </ChakraLink></Heading>
                                    <HStack>
                                        <Link to={`/dashboard/human-resources/${userId}/edit`}>
                                            <Button colorScheme="blue">Edit</Button>
                                        </Link>
                                        <Button colorScheme="red" onClick={onOpen}>Delete</Button>
                                        <AlertDialog
                                            isOpen={isOpen}
                                            leastDestructiveRef={cancelRef}
                                            onClose={onClose}
                                        >
                                            <AlertDialogOverlay>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                                        Delete User
                                                    </AlertDialogHeader>

                                                    <AlertDialogBody>
                                                        Are you sure? You can&apos;t undo this action afterwards.
                                                    </AlertDialogBody>

                                                    <AlertDialogFooter>
                                                        <Button onClick={onClose} ref={cancelRef as React.LegacyRef<HTMLButtonElement>}>
                                                            Cancel
                                                        </Button>
                                                        <Button colorScheme='red' onClick={() => {
                                                            deleteUser.mutate({ id: parseInt(userId as string) },
                                                                {
                                                                    onSuccess: () => {
                                                                        onClose();
                                                                        navigate('/dashboard/human-resources');
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
                                    </HStack>
                                </VStack>
                            </HStack>
                            <Divider></Divider>
                            <Heading mt="3" mb="3" fontSize="3xl">Attendance (/)</Heading>
                            <Divider></Divider>
                            <Heading mt="3" mb="3" fontSize="3xl">Offenses: #</Heading>
                        </CardBody>
                    </Card>) : (
                    userInfoStatus == "loading" ? <PageLoader />
                        : <ErrorPage code="500" message="Internal Server Error" description="Something went wrong. Please try again later." />
                )
            }</>);
}