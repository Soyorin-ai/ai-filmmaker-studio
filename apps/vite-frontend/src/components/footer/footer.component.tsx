import {useTranslation} from 'react-i18next';
import {type JSX} from 'react';
import {LocaleSelect} from './components/LocaleSelect/locale-select.component';
import {Link} from '@/i18n/navigation.ts';

type FooterItem = {
  label: string;
  href: string;
};

type FooterItemsGroup = {
  label: string;
  items: FooterItem[];
};

export function Footer(): JSX.Element {
  const {t} = useTranslation();

  const footerItemsGroups: FooterItemsGroup[] = [
    {
      label: t('components.footer.groups.company'),
      items: [
        {label: t('components.footer.links.aboutUs'), href: '/about'},
        {label: t('components.footer.links.contact'), href: '/contact'},
      ],
    },
    {
      label: t('components.footer.groups.legal'),
      items: [
        {label: t('components.footer.links.imprint'), href: '/imprint'},
        {label: t('components.footer.links.privacyPolicy'), href: '/privacy'},
        {label: t('components.footer.links.termsOfService'), href: '/terms'},
      ],
    },
  ];

  return (
    <footer className="border-t border-cyan-500/20 bg-black/50 backdrop-blur-sm">
      {/* 顶部装饰线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
            {footerItemsGroups.map((group) => (
              <li key={group.label} className="mb-2 text-sm">
                <p className="tracking-widest text-cyan-400/50 mb-2 font-medium text-xs uppercase">{group.label}</p>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.href}
                        className="text-cyan-100/60 hover:text-cyan-100 transition-colors hover:drop-shadow-[0_0_5px_rgba(0,245,255,0.3)]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex justify-end w-full">
            <LocaleSelect />
          </div>
          <p className="text-sm text-cyan-100/30">
            &copy; {new Date().getFullYear()} {t('components.footer.copyrightNotice')}
          </p>
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
    </footer>
  );
}
