import { Spinner, VStack, Image, Text } from '@chakra-ui/react'

export default function PageLoader() {
    return (
        <>
            <VStack display="flex" height="80vh" alignItems="center" justify="center" p={4}>
                <Image src="/logo.png" alt="SavageInventory Logo" width={200} mb={10} />
                <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="blue.500"
                    size="xl"
                />
            </VStack>
        </>
    )
}