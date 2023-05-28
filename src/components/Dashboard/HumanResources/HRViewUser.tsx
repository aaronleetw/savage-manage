import ErrorPage from "@/components/ErrorPage";
import PageLoader from "@/components/PageLoader";
import { trpc } from "@/utils/trpc";
import { Card, CardBody, CardHeader, Divider, Heading, HStack, Image, Box, Badge, Link as ChakraLink, Icon, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";

export default function HRViewUser() {
    const { userId } = useParams();
    const [loading, setLoading] = useState(1);
    const { data: userInfo, status: userInfoStatus } = trpc.user.get.useQuery({id: parseInt(userId as string)});

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
                        <Image src='TODO: it is currently a placeholder' fallbackSrc='https://placehold.co/300x400' w={[100,200,200]} h={[133,266,266]} />
                        <Box w="100%">
                            <HStack gap="1" mb="3">
                                {
                                    userInfo.roles.map((value: any) => {
                                        return (
                                            <Badge colorScheme={value.color} fontSize="15">{value.name}</Badge>
                                        )
                                    })
                                }
                            </HStack>
                            <Heading fontSize="2xl" mb="2">Class: {userInfo.grade} {userInfo.class}</Heading>
                            <Heading fontSize="2xl" mb="2">Email: <ChakraLink href="mailto:{userInfo.email}" color="blue.500">{userInfo.email} <Icon as={FiExternalLink} /> </ChakraLink></Heading>
                        </Box>
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