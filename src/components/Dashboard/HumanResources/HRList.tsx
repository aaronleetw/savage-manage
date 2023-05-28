import { Box, Heading, Badge, ChakraProvider, HStack, Button } from "@chakra-ui/react";
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material";
import { chakraTheme, muiTheme } from "@/theme";
import { Link, useNavigate } from "react-router-dom";
import { FiPlusCircle } from "react-icons/fi";
import ErrorPage from "@/components/ErrorPage";
import { trpc } from "@/utils/trpc";

export default function HRList() {
    const [users, setUsers] = useState<{row: any[], col: any[]}>({row: [], col: [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'grade', headerName: 'Grade', width: 70 },
        { field: 'class', headerName: 'Class', width: 70 },
        { field: 'englishName', headerName: 'English Name', width: 130 },
        { field: 'chineseName', headerName: 'Chinese Name', width: 130 },
        { field: 'accountType', headerName: 'Account Type', width: 130, renderCell: (params: any) => {
            return (
                <ChakraProvider theme={chakraTheme}>
                    <Badge colorScheme={params.value.color}>{params.value.name}</Badge>
                </ChakraProvider>
            )
        }},
        { field: 'roles', headerName: 'Roles', width: 200, renderCell: (params: any) => {
            return (
                <ChakraProvider theme={chakraTheme}>
                    {
                        params.value.map((value: any) => {
                            return (
                                <Badge colorScheme={value.color} ml="1">{value.name}</Badge>
                            )
                        })
                    }
                </ChakraProvider>
            )
        }},
    ]});
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
    }, [getAllUsersStatus])

    return (
        dataStatus != 2 ?
        <Box>
            <Heading size="lg" mb="4">All Members</Heading>
            <HStack mb="4">
                <Link to="create">
                    <Button leftIcon={<FiPlusCircle />} colorScheme="blue">Add Person</Button>
                </Link>
            </HStack>
            <ThemeProvider theme={muiTheme}>
                <DataGrid
                    rows={users.row}
                    columns={users.col}
                    loading={dataStatus == 1}
                    autoHeight
                    disableRowSelectionOnClick
                    onRowClick={(params) => {
                        redirect(`/dashboard/human-resources/${params.row.id}/view`)
                    }}
                />
            </ThemeProvider>
        </Box> : <ErrorPage code="500" message="Internal Server Error" />
    )
}