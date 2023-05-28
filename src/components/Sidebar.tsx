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
} from '@chakra-ui/react';
import {
    FiMenu,
    FiBell,
    FiChevronDown,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { NextComponentType } from 'next';
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { trpc } from '@/utils/trpc';

export default function SidebarWithHeader({ children, linkItems=[], name, roles }: 
                                            { children: ReactNode,
                                                linkItems: Array<{name: string, icon: any, href: string}>, name:string, roles:ReactNode }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
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
            <MobileNav onOpen={onOpen} name={name} roles={roles} />
            <Box ml={{ base: 0, md: 60 }} p="4">
                {children}
            </Box>
        </Box>
    );
}

  
const SidebarContent = ({ onClose, linkItems, display }: 
        { onClose: () => void, linkItems: Array<{name: string, icon: any, href: string}>, display: any }) => {
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
            <Image src="/logo.png" w="50%" ml="25%" display={{base: 'none', md: 'block'}} mt="8" />
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                    SavageManage
                </Text>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            {linkItems.map((link) => (
                <NavLink to={link.href}>
                    {({ isActive, isPending }) => (
                        <NavItem icon={link.icon} isActive={isActive} isPending={isPending}>
                            {link.name}
                        </NavItem>
                    )}
                </NavLink>
            ))}
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

const MobileNav = ({ onOpen, name, roles }: { onOpen:()=>void, name:string, roles:ReactNode }) => {
    const router = useRouter()
    const logoutMutation = trpc.auth.logout.useMutation();

    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            bg={useColorModeValue('white', 'gray.900')}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent={{ base: 'space-between', md: 'flex-end' }}>
            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />

            <Text
                display={{ base: 'flex', md: 'none' }}
                fontSize="2xl"
                fontFamily="monospace"
                fontWeight="bold">
                SavageManage
            </Text>

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
                                router.push('/?logout=true');
                            }}>Sign out</MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            </HStack>
        </Flex>
    );
};