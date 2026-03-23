import {type JSX} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Helmet} from 'react-helmet-async';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {UserPlus, Film, Sparkles} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useRegister} from '@/hooks/use-auth/use-auth.hook';
import {useToast} from '@/hooks/use-toast/use-toast.hook';

const registerSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8).max(64),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage(): JSX.Element {
  const {t} = useTranslation();
  const {locale} = useParams<{locale: string}>();
  const navigate = useNavigate();
  const {showToast} = useToast();
  const {register: registerUser, isPending} = useRegister();

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<RegisterFormData>({resolver: zodResolver(registerSchema)});

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    try {
      await registerUser(data.email, data.password);
      void navigate(`/${locale ?? 'en'}`);
    } catch {
      showToast({severity: 'error', summary: t('auth.registerFailed')});
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('auth.register')} - AI Filmmaker Studio</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <Link to={`/${locale ?? 'en'}`} className="flex items-center gap-3 mb-8">
          <Film className="w-10 h-10 text-rose-500" />
          <Sparkles className="w-8 h-8 text-purple-500" />
        </Link>

        {/* Register Card */}
        <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-bold text-white">{t('auth.register')}</h1>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-300">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-rose-500"
              />
              {Boolean(errors.email) && <p className="text-sm text-rose-400">{errors.email?.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-300">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className="bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-rose-500"
              />
              {Boolean(errors.password) && <p className="text-sm text-rose-400">{errors.password?.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className="bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-rose-500"
              />
              {Boolean(errors.confirmPassword) && (
                <p className="text-sm text-rose-400">{errors.confirmPassword?.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 mt-2"
            >
              {isPending ? t('common.loading') : t('auth.register')}
            </Button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            {t('auth.haveAccount')}{' '}
            <Link className="text-rose-400 hover:text-rose-300 underline" to={`/${locale ?? 'en'}/login`}>
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
