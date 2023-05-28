import { Heading } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

export default function HumanResourcesWrapper() {
    return (<>
        <Heading fontSize="6xl" mb="5">Human Resources</Heading>
        <Outlet />
    </>);
}