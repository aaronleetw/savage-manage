import { useEffect, useState } from 'react'
import { Badge, Box } from '@chakra-ui/react'
import SidebarWithHeader from '@/components/Sidebar'
import {
    FiHome,
    FiUsers,
    FiBox,
    FiDollarSign,
    FiSettings,
    FiCalendar,
} from 'react-icons/fi';
import DashHome from '@/components/Dashboard/DashHome'
import PlannerWrapper from '@/components/Dashboard/PlannerWrapper'
import HumanResourcesWrapper from '@/components/Dashboard/HumanResourcesWrapper'
import Inventory from '@/components/Dashboard/Inventory'
import Finances from '@/components/Dashboard/Finances'
import Settings from '@/components/Dashboard/Settings'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import NotFoundPage from '@/components/NotFoundPage';
import AddEvent from '@/components/Dashboard/Planner/AddEvent';
import Calendar from '@/components/Dashboard/Planner/Calendar';
import EventView from '@/components/Dashboard/Planner/EventView';
import HRList from '@/components/Dashboard/HumanResources/HRList';
import HRViewUser from '@/components/Dashboard/HumanResources/HRViewUser';
import HRCreateUser from '@/components/Dashboard/HumanResources/HRCreateUser';
import PageLoader from '@/components/PageLoader';
import ErrorPage from '@/components/ErrorPage';
import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/router';
import EditEvent from '@/components/Dashboard/Planner/EditEvent';

const linkItems = [
    { name: 'Home', icon: FiHome, href: '/dashboard/home' },
    { name: 'Planner', icon: FiCalendar, href: '/dashboard/planner' },
    { name: 'Human Resources', icon: FiUsers, href: '/dashboard/human-resources' },
    { name: 'Inventory', icon: FiBox, href: '/dashboard/inventory' },
    { name: 'Finances', icon: FiDollarSign, href: '/dashboard/finances' },
    { name: 'Settings', icon: FiSettings, href: '/dashboard/settings' },
];

export default function Home() {
    const [name, setName] = useState('');
    const [role, setRole] = useState(<></>);
    const router = useRouter();
    const { data: validQuery, status: validQueryStatus} = trpc.auth.isValid.useQuery();
    const { data: sessionQuery, status: sessionQueryStatus } = trpc.auth.getSession.useQuery();

    useEffect(() => {
        if (sessionQueryStatus === 'success' && sessionQuery) {
            setName(sessionQuery.englishName + " [" + sessionQuery.chineseName + "]");
            setRole(<>
                <Badge colorScheme={sessionQuery.accountType?.color}>{sessionQuery.accountType?.name}</Badge>
            </>)
        }
    }, [sessionQueryStatus, sessionQuery])


    useEffect(() => {
        if (validQueryStatus === 'success' && validQuery === false) {
          router.push("/")
        }
    }, [validQueryStatus, router, validQuery])

    return (
        <Router>
            <Box>
            <SidebarWithHeader linkItems={linkItems} name={name} roles={role}>
                <Routes>
                    <Route path="/dashboard/home" element={<DashHome />} />
                    <Route path="/dashboard/planner" element={<PlannerWrapper />}>
                        <Route index element={<Calendar />} />
                        <Route path="create" element={<AddEvent />} />
                        <Route path=":eventId/view" element={<EventView />} />
                        <Route path=":eventId/edit" element={<EditEvent />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                    <Route path="/dashboard/human-resources" element={<HumanResourcesWrapper />}>
                        <Route index element={<HRList />} />
                        <Route path=":userId/view" element={<HRViewUser />} />
                        <Route path="create" element={<HRCreateUser />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                    <Route path="/dashboard/inventory" element={<Inventory />} />
                    <Route path="/dashboard/finances" element={<Finances />} />
                    <Route path="/dashboard/settings" element={<Settings />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </SidebarWithHeader>
            </Box>
        </Router>
    );
}
