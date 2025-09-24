import Link from "next/link";

interface Action {
  href: string;
  text: string;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

interface ActionPromptProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions: Action[];
}

const ActionPrompt: React.FC<ActionPromptProps> = ({ icon, title, description, actions }) => {
  const getButtonClass = (variant: Action['variant']) => {
    if (variant === 'primary') {
      return "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-sanca text-white rounded-md hover:bg-sanca/90 transition-colors";
    }
    return "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50";
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <div className="h-12 w-12 text-sanca mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="max-w-md mb-6 text-gray-600">
        {description}
      </p>
      <div className="flex gap-4">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <button className={getButtonClass(action.variant)}>
              {action.icon}
              {action.text}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ActionPrompt;