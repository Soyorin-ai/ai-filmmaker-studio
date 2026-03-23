import {type JSX} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Helmet} from 'react-helmet-async';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {LogIn, Film, Sparkles} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useLogin} from '@/hooks/use-auth/use-auth.hook';
import {useToast} from '@/hooks/use-toast/use-toast.hook';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage(): JSX.Element {
  const {t} = useTranslation();
  const {locale} = useParams<{locale: string}>();
  const navigate = useNavigate();
  const {showToast} = useToast();
  const {login, isPending} = useLogin();

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<LoginFormData>({resolver: zodResolver(loginSchema)});

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      await login(data.email, data.password);
      void navigate(`/${locale ?? 'en'}`);
    } catch {
      showToast({severity: 'error', summary: t('auth.loginFailed')});
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('auth.login')} - AI Filmmaker Studio</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <Link to={`/${locale ?? 'en'}`} className="flex items-center gap-3 mb-8">
          <Film className="w-10 h-10 text-rose-500" />
          <Sparkles className="w-8 h-8 text-purple-500" />
        </Link>

        {/* Login Card */}
        <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <LogIn className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">{t('auth.login')}</h1>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-300">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500"
              />
              {Boolean(errors.email) && <p className="text-sm text-rose-400">{errors.email?.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-300">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500"
              />
              {Boolean(errors.password) && <p className="text-sm text-rose-400">{errors.password?.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 mt-2"
            >
              {isPending ? t('common.loading') : t('auth.login')}
            </Button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            {t('auth.noAccount')}{' '}
            <Link className="text-purple-400 hover:text-purple-300 underline" to={`/${locale ?? 'en'}/register`}>
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
