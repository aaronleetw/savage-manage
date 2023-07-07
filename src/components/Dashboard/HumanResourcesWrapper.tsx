import { Heading, HStack } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

export default function HumanResourcesWrapper() {
    return (<>
        <Outlet />
    </>);
}