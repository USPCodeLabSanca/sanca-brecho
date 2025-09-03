export default function Spinner() {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
			<div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sanca" />
		</div>
	);
}