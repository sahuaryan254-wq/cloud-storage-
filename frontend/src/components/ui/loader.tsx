export const Loader = ({ label }: { label?: string }) => (
  <div className="flex flex-col items-center gap-2 py-10 text-sm text-zinc-500">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    {label && <span>{label}</span>}
  </div>
);

