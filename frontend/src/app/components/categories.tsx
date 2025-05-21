interface prop{ 
    name: string;
    icon: string;
}

const Categories = (props: prop) => {
    return ( 
        <>
            <div className="flex justify-center flex-col bg-white rounded-xl py-2 shadow-sm hover:shadow-lg cursor-pointer flex-grow">
                <i className="text-4xl text-center">{props.icon}</i>
                <h1 className="text-center">{props.name}</h1>
            </div>
        </>
     );
}
 
export default Categories;