"use client"

import Link from "next/link"

export default function AdminPage() {
    return (
        <Link href={"/admin/denuncias"} className="text-blue-500 hover:underline">
            Painel de Denúncias
        </Link>
    );
}