import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-[#EEF2F8]">
      <div className="container-page flex flex-col items-start justify-between gap-3 py-8 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <Logo size="sm" />
          <span className="ml-2 text-[12.5px] text-[#93A5C4]">
            Tu operación, en piloto automático.
          </span>
        </div>
        <span className="text-[12.5px] text-[#93A5C4]">
          hola@nubolabs.ai · © {new Date().getFullYear()} Nubolabs
        </span>
      </div>
    </footer>
  );
}
