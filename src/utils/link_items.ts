import { FiBox, FiCalendar, FiDollarSign, FiHome, FiSettings, FiUsers } from "react-icons/fi";

export const linkItems = [
    { name: 'Home', icon: FiHome, href: '/dashboard/home', permission: "public" },
    { name: 'Planner', icon: FiCalendar, href: '/dashboard/planner', permission: "public" },
    { name: 'Human Resources', icon: FiUsers, href: '/dashboard/human-resources', permission: "allowViewAllInfo" },
    { name: 'Inventory', icon: FiBox, href: '/dashboard/inventory', permission: "allowViewInventory" },
    { name: 'Finances', icon: FiDollarSign, href: '/dashboard/finances', permission: [
        "allowViewFinances",
        "allowViewAllFinances",
    ] },
    { name: 'Settings', icon: FiSettings, href: '/dashboard/settings', permission: "allowViewSettings" },
];


export const publicLinkItems = linkItems.map((item) => {
    return {
        name: item.name,
        icon: item.icon,
        href: item.href,
    }
})