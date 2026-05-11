import { Link } from 'wouter';
import { Archive, CircleArrowLeft, House, Settings } from 'lucide-react';
import { APP_ROUTES, isArchivePath, isSettingsPath } from '@/app/routes';
import { BEFORE_NAV_EVENT, FORCE_HOME_ONCE_SESSION_KEY, OPEN_ADMIN_HOME_EVENT } from '@/app/events';

function canNavigateTo(href: string) {
  const evt = new CustomEvent(BEFORE_NAV_EVENT, {
    detail: { href },
    cancelable: true
  });
  return window.dispatchEvent(evt);
}

export function BottomNav({
  currentPath,
  hidden,
  adminInSubSection
}: {
  currentPath: string;
  hidden?: boolean;
  adminInSubSection?: boolean;
}) {
  if (hidden) return null;
  const isHome = currentPath === APP_ROUTES.HOME;
  const isArchive = isArchivePath(currentPath);
  const isSettings = isSettingsPath(currentPath) && !isArchive;
  const isAdminSubSection = isSettings && Boolean(adminInSubSection);

  const settingsHomeOnly = isSettings && !adminInSubSection;

  function renderRightTab() {
    if (settingsHomeOnly) return null;

    if (adminInSubSection) {
      return (
        <button
          type="button"
          className="navNavItem navNavItemBack"
          aria-label="Torna a Impostazioni"
          onClick={() => {
            window.dispatchEvent(new CustomEvent(OPEN_ADMIN_HOME_EVENT));
          }}
        >
          <CircleArrowLeft size={26} strokeWidth={1.4} />
          <span>Torna</span>
        </button>
      );
    }

    return (
      <Link
        href={APP_ROUTES.SETTINGS}
        className={`navNavItem ${isSettings ? 'navNavItemActive' : ''}`}
        aria-label="Impostazioni"
        onClick={(event) => {
          if (!canNavigateTo(APP_ROUTES.SETTINGS)) {
            event.preventDefault();
            return;
          }
          window.dispatchEvent(new CustomEvent(OPEN_ADMIN_HOME_EVENT));
        }}
      >
        <Settings size={26} strokeWidth={1.4} />
        <span>Impostazioni</span>
      </Link>
    );
  }

  return (
    <nav className="navbar">
      <div className={`navbarInner${settingsHomeOnly ? ' navbarInnerCentered' : ''}`}>
        {isAdminSubSection ? renderRightTab() : null}
        <Link
          href={APP_ROUTES.HOME}
          className={`navNavItem ${isHome ? 'navNavItemActive' : ''}`}
          aria-label="Home"
          onClick={(event) => {
            if (!canNavigateTo(APP_ROUTES.HOME)) {
              event.preventDefault();
              return;
            }
            try {
              window.sessionStorage.setItem(FORCE_HOME_ONCE_SESSION_KEY, '1');
            } catch {
              // Ignore storage failures and fallback to default routing behavior.
            }
          }}
        >
          <House size={26} strokeWidth={1.4} />
          <span>Home</span>
        </Link>
        <Link
          href={APP_ROUTES.ARCHIVE}
          className={`navNavItem navNavItemArchive ${isArchive ? 'navNavItemActive' : ''}`}
          aria-label="Archivio"
          onClick={(event) => {
            if (!canNavigateTo(APP_ROUTES.ARCHIVE)) {
              event.preventDefault();
            }
          }}
        >
          <Archive size={26} strokeWidth={1.4} />
          <span>Archivio</span>
        </Link>
        {isAdminSubSection ? null : renderRightTab()}
      </div>
    </nav>
  );
}
