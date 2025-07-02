
import api from '../api/axiosConfig';
import { ListingImageType, ListingType } from '../types/api';


// Buscar todos os listings
export const getListings = async():Promise<ListingType[]> => {
    const response = await api.get('/listings');
    return response.data;
}

// Buscar um listing específico pelo ID
export const getListingById = async(id: string): Promise<ListingType> => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
}

// Criar um novo listing
export const createListing = async(listing: Partial<ListingType>): Promise<ListingType> => {
    const response = await api.post('/listings', listing);
    return response.data;
}

// Atualizar um listing existente
export const updateListing = async(id: string, listing: Partial<ListingType>): Promise<ListingType> => {
    const response = await api.put(`/listings/${id}`, listing);
    return response.data;
}

// Deletar um listing
export const deleteListing = async(id: string): Promise<void> => {
    await api.delete(`/listings/${id}`);
}

// Criar uma imagem de listing
export const createListingImage = async(image: Partial<ListingImageType>): Promise<ListingImageType> => {
    const response = await api.post('/listing-images', image);
    return response.data;
}



// Buscar uma imagem de listing específica pelo ID
export const getListingImageById = async (id: string): Promise<ListingImageType> => {
    const response = await api.get(`/listing-images/${id}`);
    return response.data;
};

// Buscar todas as imagens de listings
export const getListingImages = async (): Promise<ListingImageType[]> => {
    const response = await api.get('/listing-images');
    return response.data;
};

// Atualizar uma imagem de listing
export const updateListingImage = async (id: string, updates: Partial<ListingImageType>): Promise<ListingImageType> => {
    const response = await api.put(`/listing-images/${id}`, updates);
    return response.data;
};

// Deletar uma imagem de listing
export const deleteListingImage = async (id: string): Promise<void> => {
    await api.delete(`/listing-images/${id}`);
};