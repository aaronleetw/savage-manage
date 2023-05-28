import { Box, Heading, Text, Button, Flex, Spacer, Image, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

export default function ErrorPage({code = "500", message = "Internal Server Error", description = "Welp! Something went wrong!"}: 
                                    {code?:string, message?:string, description?:string}) {
    const router = useRouter()
    return (
        <VStack minH={'80vh'} align={'center'} justify={'center'}>
            <Heading fontSize="7xl">{code}</Heading>
            <Box
                bgGradient="linear(to-r, blue.500,green.500)"
                bgClip="text"
                fontSize="7xl"
                fontWeight="extrabold">
                {message}
            </Box>
            <Text fontSize="2xl">{description}</Text>
            <Box>
                <Link to="/dashboard/home">
                    <Button leftIcon={<FiArrowLeft />}>Back to Home</Button>
                </Link>
                <Button leftIcon={<FiRefreshCw />} onClick={() => {
                    router.reload()
                }}>Try again</Button>
            </Box>
        </VStack>
    );
}
