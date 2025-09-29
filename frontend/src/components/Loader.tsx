import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex justify-center items-center h-40">
      <span className="relative inline-flex">
        <span className="absolute inline-flex h-10 w-10 rounded-full bg-blue-500 opacity-20 animate-ping"></span>
        <Loader2 className="relative animate-spin text-blue-600" size={36} />
      </span>
    </div>
  );
}