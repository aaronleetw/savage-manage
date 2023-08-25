import { Box, Heading, Badge, ChakraProvider, HStack, Button } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlusCircle, FiUsers } from "react-icons/fi";
import ErrorPage from "@/components/ErrorPage";
import { trpc } from "@/utils/trpc";

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles//ag-grid.css';
import 'ag-grid-community/styles//ag-theme-alpine.css';

export default function HRList() {
    const [users, setUsers] = useState<{row: any[], col: any[]}>({row: [], col: [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'grade', headerName: 'Grade', width: 110, sort: "asc" },
        { field: 'class', headerName: 'Class', width: 110, sort: "asc" },
        { field: 'number', headerName: 'Num', width: 110, sort: "asc" },
        { field: 'englishName', headerName: 'English Name', width: 180 },
        { field: 'chineseName', headerName: 'Chinese Name', width: 180 },
        { field: 'accountType', headerName: 'Account Type', cellRenderer: (params: any) => {
            return (
                <Badge colorScheme={params.value.color} display="inline">{params.value.name}</Badge>
            )
        }, width: 130, comparator: (valueA: any, valueB: any) => {
            if (valueA.name === valueB.name) return 0;
            if (valueA.name < valueB.name) return -1;
            if (valueA.name > valueB.name) return 1;
        }},
        { field: 'roles', headerName: 'Roles', cellRenderer: (params: any) => {
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
        }, comparator: (valueA: any, valueB: any) => {
            const a = valueA.length == 0 ? Number.MAX_SAFE_INTEGER : valueA[0].priority;
            const b = valueB.length == 0 ? Number.MAX_SAFE_INTEGER : valueB[0].priority;
            return a-b;
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
                        number: user.number,
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
                <Link to="roles">
                    <Button leftIcon={<FiUsers />} colorScheme="blackAlpha">Roles and Account Types</Button>
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