import { WifiOff, RefreshCw } from "lucide-react";
import type { FriendlyError } from "@/lib/errors";

export default function ErrorState({ error, onRetry }: { error: FriendlyError; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
      <WifiOff className="h-10 w-10 text-gray-400" />
      <h2 className="text-lg font-semibold text-gray-900">{error.title}</h2>
      <p className="max-w-md text-sm text-gray-600">{error.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-sanca px-4 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </button>
      )}
    </div>
  );
}