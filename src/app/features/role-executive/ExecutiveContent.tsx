import { Settings } from "@carbon/icons-react";
import { RolePageRouter } from "../../components/Layout/RolePageRouter";
import { executiveDefaultPages, executivePages } from "./pageRegistries";

function ExecutivePlaceholder({ section }: { section: string }) {
  return (
    <div className="flex items-center justify-center h-full text-neutral-400">
      <div className="text-center">
        <Settings size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-[14px] font-normal">Blank dashboard</p>
        <p className="text-[12px] mt-1">{section}</p>
      </div>
    </div>
  );
}

export function ExecutiveContent({ activeSection, activePage }: { activeSection: string; activePage?: string }) {
  return (
    <RolePageRouter
      sections={executivePages}
      defaults={executiveDefaultPages}
      activeSection={activeSection}
      activePage={activePage}
      fallback={(section) => <ExecutivePlaceholder section={section} />}
    />
  );
}
