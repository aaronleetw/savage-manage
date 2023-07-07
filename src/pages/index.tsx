import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, Divider, Flex, Heading, Image, Input, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import PageLoader from '@/components/PageLoader'
import { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import MyAuth from '@/components/Auth/MyAuth';
import { trpc } from '@/utils/trpc';

interface StringToString {
  [key: string]: string
}

export default function Index() {
  const router = useRouter()
  const [errHeading, setErrHeading] = useState("")
  const [errMessage, setErrMessage] = useState("")
  const errors = errHeading && errMessage ? `${errHeading}: ${errMessage}` : ""
  const validQuery = trpc.auth.isValid.useQuery()

  useEffect(() =>{
    if (router.query.error) {
      setErrHeading(router.query.error as string)
    }
    console.log(router.query.error)
  }, [router])

  useEffect(() => {
    if (!validQuery.isLoading && validQuery.data === true) {
      router.push("/dashboard/home")
    }
  }, [validQuery, router])

  if (validQuery.isLoading) {
    return <PageLoader />
  }
 
  return (
    <Flex w={"100%"} justify="center" p="40px">
      <VStack spacing={4} maxW="700px" width="100%">
        <Image src="/logo.png" alt="SavageTumaz Logo" width={200} />
        <Heading textAlign="center" mb={4}>SavageManage</Heading>
        { router.query.logout === "true" && <Alert status='info'>
          <AlertIcon />
          You have been signed out
        </Alert> }
        <MyAuth  />
      </VStack>
    </Flex>
  );
}
