import {
    IconButton,
    Avatar,
    Box,
    CloseButton,
    Flex,
    HStack,
    VStack,
    Icon,
    useColorModeValue,
    Link,
    Drawer,
    DrawerContent,
    Text,
    useDisclosure,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Image,
    Spinner,
    Heading,
} from '@chakra-ui/react';
import {
    FiMenu,
    FiBell,
    FiChevronDown,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { trpc } from '@/utils/trpc';
import { useQueryClient } from '@tanstack/react-query';

export default function SidebarWithHeader({ children, linkItems=[], name, roles }: 
                                            { children: ReactNode,
                                                linkItems: Array<{name: string, icon: any, href: string, show: boolean}>, name:string, roles:ReactNode }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const location = useLocation();

    return (
        <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
            <SidebarContent
                onClose={() => onClose}
                linkItems={linkItems}
                display={{ base: 'none', md: 'block' }}
            />
            <Drawer
                autoFocus={false}
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full">
                <DrawerContent>
                    <SidebarContent onClose={onClose} linkItems={linkItems} display={{base: 'block'}} />
                </DrawerContent>
            </Drawer>
            {/* mobilenav */}
            <MobileNav onOpen={onOpen} name={name} roles={roles} pageTitle={location.pathname.split("/")[2].replace("-", " ")} linkItems={linkItems} />
            <Box ml={{ base: 0, md: 60 }} p="4" pt="90px">
                {children}
            </Box>
        </Box>
    );
}

  
const SidebarContent = ({ onClose, linkItems, display }: 
        { onClose: () => void, linkItems: Array<{name: string, icon: any, href: string, show: boolean}>, display: any }) => {
    return (
        <Box
            transition="3s ease"
            bg={useColorModeValue('white', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            display={display}
        >
            <HStack m="4" justifyContent={"center"}>
                <Image src="/logo.png" w="65px" display="block" alt="Company Logo" />
                <Flex h="20" alignItems="center" mx="8" justifyItems="space-between" m="0">
                    <Text fontSize="2xl" fontWeight="bold" textAlign="left" lineHeight="1.3">
                        Savage<br></br>Manage
                    </Text>
                    <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
                </Flex>
            </HStack>
            {linkItems.map((link) => {
                if (link.show == false) return <Box key={link.name}></Box>
                return (
                    <NavLink to={link.href} key={link.name}>
                        {({ isActive, isPending }) => (
                            <NavItem icon={link.icon} isActive={isActive} isPending={isPending}>
                                {link.name}
                            </NavItem>
                        )}
                    </NavLink>
            )})}
        </Box>
    );
};

const NavItem = ({ icon, children, isActive, isPending, ...rest }: { icon:any, children:string, isActive:boolean, isPending:boolean }) => {
    return (
        <Flex
            align="center"
            p="4"
            mx="4"
            borderRadius="lg"
            role="group"
            cursor="pointer"
            transition="0.3s ease"
            bg={isActive ? 'blue.100' : (isPending ? 'gray.400' : 'white')}
            {...rest}>
            {isPending ? (
                <Icon
                    mr="4"
                    fontSize="16"
                    as={Spinner}
                />
            ) : (
                <Icon
                    mr="4"
                    fontSize="16"   
                    as={icon}
                />
            )}
            {children}
        </Flex>
    );
};

const MobileNav = ({ onOpen, name, roles, pageTitle, linkItems }: { onOpen:()=>void, name:string, roles:ReactNode, pageTitle: string, linkItems: any[] }) => {
    const router = useRouter()
    const logoutMutation = trpc.auth.logout.useMutation();
    const queryClient = useQueryClient();

    return (
        <Box w="full" position="fixed" zIndex="999">
            <Flex
                ml={{ base: 0, md: 60 }}
                px={{ base: 4, md: 4 }}
                height="20"
                alignItems="center"
                bg={useColorModeValue('white', 'gray.900')}
                borderBottomWidth="1px"
                borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
                justifyContent={{ base: 'space-between' }}>
                <HStack>
                    <IconButton
                        display={{ base: 'flex', md: 'none' }}
                        onClick={onOpen}
                        variant="outline"
                        aria-label="open menu"
                        icon={<FiMenu />}
                    />

                    <HStack>
                        <Icon as={linkItems.find(element => element.name.toLowerCase().trim() === pageTitle.trim()).icon} fontSize="4xl" />
                        <Heading
                            display={{ base: 'flex' }}
                            fontSize="4xl"
                            fontWeight="bold"
                            textTransform="capitalize">
                            {pageTitle}
                        </Heading>
                    </HStack>
                </HStack>
                <HStack spacing={{ base: '0', md: '6' }}>
                    <IconButton
                        size="lg"
                        variant="ghost"
                        aria-label="open menu"
                        icon={<FiBell />}
                    />
                    <Flex alignItems={'center'}>
                        <Menu>
                            <MenuButton
                                py={2}
                                transition="all 0.3s"
                                _focus={{ boxShadow: 'none' }}>
                                <HStack>
                                    <Avatar
                                        size={'sm'}
                                        src={
                                            '/logo.png'
                                        }
                                    />
                                    <VStack
                                        display={{ base: 'none', md: 'flex' }}
                                        alignItems="flex-start"
                                        spacing="1px"
                                        ml="2">
                                        <Text fontSize="sm">{name}</Text>
                                        <Text fontSize="xs" color="gray.600">
                                            {roles}
                                        </Text>
                                    </VStack>
                                    <Box display={{ base: 'none', md: 'flex' }}>
                                        <FiChevronDown />
                                    </Box>
                                </HStack>
                            </MenuButton>
                            <MenuList
                                bg={useColorModeValue('white', 'gray.900')}
                                borderColor={useColorModeValue('gray.200', 'gray.700')}>
                                <MenuItem>Profile</MenuItem>
                                <MenuItem>Settings</MenuItem>
                                <MenuItem>Billing</MenuItem>
                                <MenuDivider />
                                <MenuItem onClick={async () => {
                                    await logoutMutation.mutateAsync();
                                    queryClient.clear();
                                    router.push('/?logout=true');
                                }}>Sign out</MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex>
                </HStack>
            </Flex>
        </Box>
    );
};