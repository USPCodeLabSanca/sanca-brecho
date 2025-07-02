import { UUID } from "crypto";

type Condition = 'new' | 'used' | 'refurbished' | 'broken';

const Condition = {
  New: 'new' as Condition,
  Used: 'used' as Condition,
  Refurbished: 'refurbished' as Condition,
  Broken: 'broken' as Condition,
}

type UserRole = "user" | "admin";

const UserRole = {
    User: "user" as UserRole,
    Admin: "admin" as UserRole,
}

export interface UserType{
    id: string;
    displayName: string;
    slug: string;
    email: string;
    photoURL: string | null;
    university: string | null;
    whatsapp: string | null;
    telegram: string | null;
    verified: boolean;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}



export interface CategoryType{
    id: number;
    name: string;
    parentId: number | null;
    parent: CategoryType | null;
    children: CategoryType[];
}


export interface ListingType{
    Id: UUID;
    userID: string;
    user: UserType;
    categoryID: number;
    category: CategoryType;
    title: string;
    slug: string;
    description: string;
    price: number;
    condition: Condition;
    acceptTrade: boolean;
    location: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ListingImageType{
    id: UUID;
    listingID: UUID;
    listing: ListingType;
    src: string;
    isPrimary: boolean;
}

//inutilizado no backend
export interface Profile{
    displayName: string;
    slug: string;
    email: string;
    photoURL: string | null;
    university: string | null;
    whatsApp: string | null;
    telegram: string | null;
    verified: boolean;
    role: UserRole;
}


export interface FavoriteType{
    userID: string;
    user: UserType;
    listingID: UUID;
    listing: ListingType;
    createdAt: Date;
}