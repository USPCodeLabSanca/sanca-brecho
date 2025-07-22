"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ProductCard from "@/app/components/productCard";
import { FaWhatsapp } from 'react-icons/fa';
import { Navbar } from "@/app/components";
import { EditProfileForm } from "@/app/components/editProfile";
import {
  MapPin,
  Calendar,
  Star,
  Package,
  Search,
  Trash2,
  Settings,
  Plus,
  Edit,
  BadgeCheck
} from "lucide-react";


const Edit_Perfil = () => {
    const { id } = useParams<{ id: string }>();

    const users = [
    {
        id: '1',
        name: 'João Silva',
        email: 'joao@ufscar.br',
        avatar: 'https://i.pravatar.cc/150?img=1',
        university: 'UFSCar',
        rating: 4.5,
        joinedDate: '2023-03-15',
        isAdmin: true,
        verified: true,
    },
    {
        id: '2',
        name: 'Ana Souza',
        email: 'ana@usp.br',
        avatar: 'https://i.pravatar.cc/150?img=5',
        university: 'USP São Carlos',
        rating: 4.8,
        joinedDate: '2023-05-20',
        isAdmin: false,
        verified: false,
    },
    ];

    const currentUser = users[0];
    const userId = id;

    const products = [
    {
        id: '101',
        userId: '1',
        title: 'Livro de Cálculo',
        description: 'Livro em ótimo estado, pouco usado.',
        price: 50,
        images: ['https://picsum.photos/id/0/1280/900', 'https://picsum.photos/id/2/1280/900', 'https://picsum.photos/id/9/1280/900'],
        createdAt: '2023-06-01',
        category: 'Livros',
        location: 'Ufscar',
        userName: 'João Silva',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        sellerHandlesDelivery: true,
        isNegotiable: true
    },
    {
        id: '102',
        userId: '2',
        title: 'Microscópio',
        description: 'Microscópio usado, funcionando perfeitamente.',
        price: 200,
        images: ['https://picsum.photos/id/0/1280/900', 'https://picsum.photos/id/2/1280/900', 'https://picsum.photos/id/9/1280/900'],
        createdAt: '2023-06-10',
        category: 'Equipamentos',
        location: 'Ufscar',
        userName: 'João Silva',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        sellerHandlesDelivery: true,
        isNegotiable: true
    },
    ];

    const lookingFor = [
        {
        id: '201',
        userId: '1',
        title: 'Livro de Álgebra Linear',
        description: 'Procuro livro em bom estado para estudar para as provas.',
        createdAt: '2023-07-01',
        category: 'Livros',
        },
        {
        id: '202',
        userId: '1',
        title: 'Lupa de Mão',
        description: 'Preciso de uma lupa para laboratório.',
        createdAt: '2023-07-05',
        category: 'Equipamentos',
        },
    ];

    const reviews = [
    {
        id: '1',
        userId: '1',
        reviewerId: '2',
        userName: 'Ana Souza',
        userAvatar: 'https://i.pravatar.cc/150?img=5',
        rating: 5,
        comment: 'Produto em ótimo estado, como descrito. Entrega rápida e vendedor atencioso.',
        date: '2023-08-10',
    },
    {
        id: '2',
        userId: '1',
        reviewerId: '3',
        userName: 'Carlos Mendes',
        userAvatar: 'https://i.pravatar.cc/150?img=8',
        rating: 4,
        comment: 'Ótima negociação, recomendo.',
        date: '2023-07-22',
    },
    ];

    const user = users.find((u) => u.id === userId);
    const userProducts = products.filter((product) => product.userId === userId);
    const userLookingFor = lookingFor.filter((item) => item.userId === userId);
    const userReviews = reviews.filter((review) => review.userId === user?.id);
    const isOwnProfile = currentUser?.id === user?.id;

    if (!user) {
    return (
        <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
        <h1 className="text-xl font-bold mb-4">Usuário não encontrado</h1>
        <Link href="/">
            <button className=" cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-sanca hover:bg-sanca/90">
            Voltar a página inicial
            </button>
        </Link>
        </div>
        </div>
        </div>
    );
    }

    return(
        <div className="min-h-screen flex flex-col">
        <main className="flex-grow py-10 bg-gray-50">
            <div className="container mx-auto px-4">
            <EditProfileForm />
            </div>
        </main>
        </div>

    );
}

export default Edit_Perfil;