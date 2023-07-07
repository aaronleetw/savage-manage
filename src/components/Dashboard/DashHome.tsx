import { trpc } from "@/utils/trpc";
import { Heading } from "@chakra-ui/react";
import { useState, useEffect } from "react";

export default function Home() {
    const [name, setName] = useState<string>()
    const { data: sessionQuery, status: sessionQueryStatus } = trpc.auth.getSession.useQuery();

    useEffect(() => {
        if (sessionQueryStatus === 'success' && sessionQuery) {
            setName(sessionQuery.englishName);
        }
    }, [sessionQueryStatus, sessionQuery])

    return (
        <>
            <Heading fontSize="6xl">Hello, {name}</Heading>
        </>
    );
}