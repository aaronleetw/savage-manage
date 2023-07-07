import { Box, Heading, Badge, ChakraProvider, HStack, Button } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlusCircle } from "react-icons/fi";
import ErrorPage from "@/components/ErrorPage";
import { trpc } from "@/utils/trpc";

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles//ag-grid.css';
import 'ag-grid-community/styles//ag-theme-alpine.css';

export default function HRList() {
    const [users, setUsers] = useState<{row: any[], col: any[]}>({row: [], col: [
        { field: 'id', name: 'ID', width: 80 },
        { field: 'grade', name: 'Grade', width: 100 },
        { field: 'class', name: 'Class', width: 100 },
        { field: 'englishName', name: 'English Name', width: 180 },
        { field: 'chineseName', name: 'Chinese Name', width: 180 },
        { field: 'accountType', name: 'Account Type', cellRenderer: (params: any) => {
            return (
                <Badge colorScheme={params.value.color} display="inline">{params.value.name}</Badge>
            )
        }},
        { field: 'roles', name: 'Roles', cellRenderer: (params: any) => {
            return (
                <>
                {
                    params.value.map((value: any) => {
                        return (
                            <Badge colorScheme={value.color} ml="1" key={value.name} display="inline">{value.name}</Badge>
                        )
                    })
                }
                </>
            )
        }},
    ]});
    const defaultColDef = useMemo(() => ({
        sortable: true
    }), []);  
    const [dataStatus, setDataStatus] = useState(1);
    const [error, setError] = useState({} as any);
    const redirect = useNavigate();
    const { data: getAllUsersQuery, status: getAllUsersStatus } = trpc.user.all.useQuery();


    useEffect(() => {
        if (getAllUsersStatus == "success") {
            setUsers({
                row: getAllUsersQuery?.map((user) => {
                    return {
                        id: user.id,
                        grade: user.grade,
                        class: user.class,
                        chineseName: user.chineseName,
                        englishName: user.englishName,
                        accountType: user.accountType,
                        roles: user.roles
                    }
                }), col: users.col});
            setDataStatus(0);
        }
    }, [getAllUsersStatus, getAllUsersQuery, users.col])

    return (
        dataStatus != 2 ?
        <Box>
            <HStack mb="5">
                <Heading fontSize="6xl">All Members</Heading>
            </HStack>
            <HStack mb="4">
                <Link to="create">
                    <Button leftIcon={<FiPlusCircle />} colorScheme="blue">Add Person</Button>
                </Link>
            </HStack>
            <Box className="ag-theme-alpine" h="500px" w="full">
                <AgGridReact
                    rowData={users.row}
                    columnDefs={users.col}
                    animateRows={true}
                    defaultColDef={defaultColDef}
                    rowStyle={{cursor: "pointer"}}
                    onCellClicked={(event) => {
                        redirect(`/dashboard/human-resources/${event.data.id}/view`);
                    }}
                />
            </Box>
        </Box> : <ErrorPage code="500" message="Internal Server Error" />
    )
}