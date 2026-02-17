import { Metadata, ResolvingMetadata } from "next";
import { getListingBySlug, getListingImages } from "@/lib/services/listingService";
import ProductClient from "./product-client";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getListingBySlug(slug);

    if (!product) {
      return {
        title: "Produto não encontrado | Sanca Brechó",
      };
    }

    let productImage = "/product_placeholder.png";
    try {
        const images = await getListingImages(product.id);
        if (images && images.length > 0) {
            productImage = images[0].src;
        }
    } catch (imageError) {
        console.error("Erro ao buscar imagem para metadados:", imageError);
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
      title: product.title,
      description: `R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - ${product.description.substring(0, 150)}...`,
      openGraph: {
        title: product.title,
        description: `Compre ${product.title} por R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no Sanca Brechó.`,
        url: `https://www.sancabrecho.com.br/produto/${slug}`,
        siteName: "Sanca Brechó",
        images: [
          {
            url: productImage,
            width: 800,
            height: 600,
            alt: product.title,
          },
          ...previousImages,
        ],
        locale: "pt_BR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: product.title,
        description: `R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - ${product.description.substring(0, 100)}`,
        images: [productImage],
      },
    };
  } catch (error) {
    console.error("Erro ao gerar metadados:", error);
    return {
      title: "Sanca Brechó",
      description: "Compre e venda produtos usados entre universitários.",
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  
  let product = null;

  try {
    product = await getListingBySlug(slug);
  } catch (error) {
    console.error("Erro ao buscar produto no server:", error);
  }

  if (!product) {
    notFound();
  }

  return <ProductClient initialProduct={product} />;
}