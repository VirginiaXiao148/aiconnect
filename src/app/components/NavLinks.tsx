'use client';

import {
    UserIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    BellIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';


// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.

const links = [
    {
        label: 'Home',
        icon: <HomeIcon className="w-6 h-6" />,
        href: '/AIBuzz',
    },
    {
        label: 'Explorar',
        icon: <MagnifyingGlassIcon className="w-6 h-6" />,
        href: '/AIBuzz/explorar',
    },
    {
        label: 'Notificaciones',
        icon: <BellIcon className="w-6 h-6" />,
        href: '/AIBuzz/notificaciones',
    },
    {
        label: 'Perfil',
        icon: <UserIcon className="w-6 h-6" />,
        href: '/AIBuzz/perfil',
    },
];


export default function NavLinks() {
    const pathname = usePathname();

    return (
        <nav>
            {links.map((link) => (
                <Link key={link.href} href={link.href}
                    className={clsx(
                        'flex items-center gap-2 p-2 rounded-md text-sm font-medium',
                        {
                            'bg-blue-500 text-white': pathname === link.href,
                            'text-gray-700 hover:bg-gray-100': pathname !== link.href,
                        }
                    )}
                >
                    {link.icon}
                    <span>{link.label}</span>
                </Link>
            ))}
        </nav>
    );
}



