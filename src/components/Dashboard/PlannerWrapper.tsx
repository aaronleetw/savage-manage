import { Heading, HStack, Icon } from "@chakra-ui/react";
import { FiCalendar } from "react-icons/fi";
import { Outlet } from "react-router-dom";

export default function PlannerWrapper() {

    return (
        <>
            <HStack mb="5">
                <Icon as={FiCalendar} fontSize="5xl" />
                <Heading fontSize="6xl">Planner</Heading>
            </HStack>
            <Outlet />
        </>
    );
};