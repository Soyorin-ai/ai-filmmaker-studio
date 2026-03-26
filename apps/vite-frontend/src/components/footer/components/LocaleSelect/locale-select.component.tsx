import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import {Languages} from 'lucide-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select.tsx';

const SUPPORTED_LOCALES = ['en', 'zh'];

export function LocaleSelect(): JSX.Element {
  const {t} = useTranslation();
  const {locale} = useParams<{locale: string}>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPending, setIsPending] = useState(false);

  const onLocaleChange = (value: string): void => {
    setIsPending(true);
    const currentPath = location.pathname.replace(/^\/[^/]+/, `/${value}`);
    navigate(currentPath);
    setTimeout(() => {
      setIsPending(false);
    }, 100);
  };

  return (
    <Select disabled={isPending} value={locale || 'en'} onValueChange={onLocaleChange}>
      <SelectTrigger className="w-[140px] bg-black/50 border-cyan-500/30 text-cyan-100 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors">
        <Languages className="mr-2 h-4 h-4 text-cyan-400" />
        <SelectValue className="text-cyan-100" />
      </SelectTrigger>
      <SelectContent className="bg-slate-900 border-cyan-500/30">
        {SUPPORTED_LOCALES.map((localeOption) => (
          <SelectItem 
            key={localeOption} 
            value={localeOption}
            className="text-cyan-100 hover:bg-cyan-500/10 hover:text-cyan-50 focus:bg-cyan-500/20 focus:text-cyan-50"
          >
            {t(`components.footer.localeSelect.languages.${localeOption}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
