import Link  from "next/link";

interface prop{ 
    name: string;
    icon: string;
    id: number;
}

const Categories = (props: prop) => {
    return ( 
        <Link href={`/categorias?category=${props.id}`} className="py-2">
            <div className="flex justify-center flex-col gap-2 bg-white rounded-xl shadow-xs hover:shadow-md cursor-pointer flex-grow w-auto h-23">
                <span className="text-4xl text-center">{props.icon}</span>
                <h1 className="text-sm text-center font-medium">{props.name}</h1>
            </div>
        </Link>
     );
}
 
export default Categories;