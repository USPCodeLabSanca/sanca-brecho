import { Search } from "lucide-react";

export default function Categorias() {
  return (
    <section className="mx-auto px-4 py-20 max-w-[1200px]">
      <div className="md:flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0">Categorias</h1>
         <div
              className={
                "relative w-full " +
                "md:max-w-md "
              }
            >
              <Search className="absolute right-7 inset-y-0 my-auto w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 pr-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sanca focus-visible:ring-offset-2 md:text-sm"
              />
            </div>
      </div>
    </section>
  );
}
