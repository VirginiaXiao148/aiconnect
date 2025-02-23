"use client";

import Link from "next/link";
import { PowerIcon } from "@heroicons/react/24/outline";
import NavLinks from "./NavLinks";

export function NavBar() {

    return (
        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white shadow-md">
            <div className="flex items-center gap-4">
                <Link href="/" className="text-2xl font-bold">
                <span>AIBuzz</span>
                </Link>
                <NavLinks />
                <button className="hidden md:block md:ml-auto text-sm text-gray-600 hover:text-gray-900" title="Power"> <PowerIcon className="w-6 h-6" /></button>
            </div>
        </div>
    );
}