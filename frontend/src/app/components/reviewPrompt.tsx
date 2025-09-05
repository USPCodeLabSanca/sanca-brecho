import { SaleType } from "@/lib/types/api";
import { RiUserStarLine } from "react-icons/ri";

interface ReviewPromptProps {
  sale: SaleType;
  onEvaluateClick: () => void;
}

const ReviewPrompt = ({ sale, onEvaluateClick }: ReviewPromptProps) => {
  return (
    !sale.review ? <>
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Avalie esta compra</h2>
        <p>Sua opinião ajuda muito quem usa o Sanca Brechó. E é bem rapido!</p>
        <button onClick={onEvaluateClick} className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-sanca hover:bg-sanca-dark">
          <RiUserStarLine /> Avaliar {sale.seller.display_name}
        </button>
      </div>
      <hr className="my-4 border-t border-gray-300" />
    </>
    : <>
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Agradecemos sua avaliação!</h2>
        <p>Sua opinião ajuda a melhorar o Sanca Brechó</p>
      </div>
      <hr className="my-4 border-t border-gray-300" />
    </>
  );
}

export default ReviewPrompt;