import { useState } from 'react'
import { Link, VStack, Box, Card, Alert, AlertIcon, AlertTitle, AlertDescription, CardBody } from '@chakra-ui/react'
import LoginAuth from './LoginAuth'
import ForgotAuth from './ForgotAuth'
import { MessageType } from './types'

export default function MyAuth() {
    const [method, setMethod] = useState('login')
    const [msg, setMsg] = useState({} as MessageType)

    return (
        <Box bg="white" p={6} rounded="md" w="100%">
            {(msg.status) &&
                <Alert status={msg.status} mb={5}>
                    <AlertIcon />
                    <AlertTitle>{msg.status && msg.status[0].toUpperCase() + msg.status.slice(1)}</AlertTitle>
                    <AlertDescription>{msg.msg}</AlertDescription>
                </Alert>
            }
            <Card>
                <CardBody>
                    {
                        method === 'login' ? (
                            <VStack spacing={4} alignItems="stretch">
                                <LoginAuth setMsg={setMsg} />
                                <Link onClick={() => setMethod('rstpswd')} textAlign="center">Forgot your password?</Link>
                            </VStack>
                        ) : (
                            <VStack spacing={4} alignItems="stretch">
                                <ForgotAuth setMsg={setMsg} />
                                <Link onClick={() => setMethod('login')} textAlign="center">Login with email</Link>
                            </VStack>
                        )
                    }
                </CardBody>
            </Card>
        </Box>
    )
}