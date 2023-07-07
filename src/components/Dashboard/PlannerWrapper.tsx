import { Heading, HStack, Icon } from "@chakra-ui/react";
import { FiCalendar } from "react-icons/fi";
import { Outlet } from "react-router-dom";

export default function PlannerWrapper() {

    return (
        <>
            <Outlet />
        </>
    );
};