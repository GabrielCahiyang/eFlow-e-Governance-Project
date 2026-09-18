import { useEffect, useState, type ReactNode } from 'react';
import { Bell, ChevronRight, LockKeyhole, Palette, UserRound } from 'lucide-react';
import { AppearanceSettingsPage } from './AppearanceSettingsPage';
import { NotificationSettingsPage } from './NotificationSettingsPage';
import { ProfileSettingsPage } from './ProfileSettingsPage';
import { SecuritySettingsPage } from './SecuritySettingsPage';

function resolvePage(page?: string): string {
  if (!page) return 'Profile';
  if (page.toLowerCase() === 'settings') return 'Appearance';
  if (['Profile', 'Appearance', 'Notifications', 'Security'].includes(page)) return page;
  return 'Profile';
}

export function SettingsContent({ activePage }: { activePage?: string }) {
  const [selectedPage, setSelectedPage] = useState<string>(() => resolvePage(activePage));

  useEffect(() => {
    setSelectedPage(resolvePage(activePage));
  }, [activePage]);

  const page: Record<string, ReactNode> = {
    Profile: <ProfileSettingsPage />,
    Appearance: <AppearanceSettingsPage />,
    Notifications: <NotificationSettingsPage />,
    Security: <SecuritySettingsPage />,
  };

  const tabs = [
    { id: 'Profile', label: 'Profile', icon: <UserRound size={15} /> },
    { id: 'Appearance', label: 'Appearance', icon: <Palette size={15} /> },
    { id: 'Notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'Security', label: 'Security', icon: <LockKeyhole size={15} /> },
  ];

  return (
    <div className="min-h-full bg-[#f7f8fc] px-5 py-6 dark:bg-[#0b1120] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400"><Palette size={13} /> Personal settings</div>
            <h1 className="mt-2 text-[24px] font-semibold tracking-tight text-neutral-900 dark:text-slate-100">{selectedPage}</h1>
          </div>
          <div className="hidden items-center gap-1 text-[11px] text-neutral-400 sm:flex"><span>Account</span><ChevronRight size={13} /><span className="font-medium text-neutral-600 dark:text-slate-300">{selectedPage}</span></div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="mb-6 flex border-b border-neutral-200 dark:border-slate-800 overflow-x-auto">
          {tabs.map((tab) => {
            const active = selectedPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedPage(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-[13px] font-medium transition-all duration-200 whitespace-nowrap
                  ${
                    active
                      ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-semibold'
                      : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {page[selectedPage]}
      </div>
    </div>
  );
}

export default SettingsContent;
