import Image from "next/image";
import logo from "@/public/brand/kanyel-logo.jpg";

export default function Logo({ variant = "default" }: { variant?: "default" | "badge" }) {
  if (variant === "badge") {
    return (
      <div className="inline-flex items-center rounded-2xl bg-white px-3 py-2 shadow-soft">
        <Image src={logo} alt="KANYEL SARL" priority className="h-9 w-auto" />
      </div>
    );
  }

  return <Image src={logo} alt="KANYEL SARL" priority className="h-10 w-auto" />;
}
