import { SaleType } from "@/lib/types/api";
import { RiUserStarLine } from "react-icons/ri";
import { Button } from "./button";

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
        <Button onClick={onEvaluateClick}>
          <RiUserStarLine className="w-4 h-4" /> Avaliar {sale.seller.display_name}
        </Button>
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