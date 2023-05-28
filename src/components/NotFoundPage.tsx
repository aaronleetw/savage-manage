// not found page

import { Box, Heading, Text, Button, Flex, Spacer, Image, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFoundPage() {
    return (
        <VStack minH={'80vh'} align={'center'} justify={'center'}>
            <Heading fontSize="7xl">404</Heading>
            <Box
                bgGradient="linear(to-r, red.400,pink.400)"
                bgClip="text"
                fontSize="7xl"
                fontWeight="extrabold">
                Page not found
            </Box>
            <Box>
                <Link to="/dashboard/home">
                    <Button leftIcon={<FiArrowLeft />}>Back to Home</Button>
                </Link>
            </Box>
        </VStack>
    );
}
