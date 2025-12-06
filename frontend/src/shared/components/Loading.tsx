import { LoaderCircle } from "lucide-react";

export default function Loading({ text }: { text?: string }) {
  return (
    <div className="h-screen flex items-center justify-center">
      <LoaderCircle className="animate-spin h-10 w-10 text-primary" />
      {text && <span className="ml-4 text-lg text-gray-600">{text}</span>}
    </div>
  );
}
