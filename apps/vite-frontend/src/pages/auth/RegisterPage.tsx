import {type JSX} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Helmet} from 'react-helmet-async';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {UserPlus, Clapperboard, Sparkles} from 'lucide-react';
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </Helmet>
      <div 
        className="min-h-screen flex flex-col items-center justify-center px-4 relative font-['Inter',sans-serif] overflow-hidden"
        style={{ 
          background: 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)'
        }}
      >
        {/* 背景效果 */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(96, 165, 250, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(96, 165, 250, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
        />
        
        {/* 光晕装饰 */}
        <div 
          className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <Link to={`/${locale ?? 'en'}`} className="flex items-center gap-4 mb-8 relative z-10">
          <div 
            className="p-3 rounded-2xl border border-white/20 backdrop-blur-sm"
            style={{ 
              background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8), rgba(15, 23, 42, 0.8))',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            <Clapperboard className="w-10 h-10" style={{ color: '#60A5FA' }} />
          </div>
          <div 
            className="p-2.5 rounded-xl"
            style={{ 
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.4)'
            }}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </Link>

        {/* Register Card */}
        <div className="w-full max-w-md relative z-10">
          <div 
            className="rounded-2xl p-8 border border-white/10 backdrop-blur-sm"
            style={{ 
              background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(15, 23, 42, 0.6))',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="p-2 rounded-lg"
                style={{ background: 'rgba(249, 115, 22, 0.1)' }}
              >
                <UserPlus className="w-5 h-5" style={{ color: '#F97316' }} />
              </div>
              <h1 
                className="text-2xl font-bold tracking-tight"
                style={{ 
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: 'white'
                }}
              >
                {t('auth.register')}
              </h1>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white/70">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-orange-400/50 focus:ring-4 focus:ring-orange-500/20 transition-all duration-200"
                />
                {Boolean(errors.email) && <p className="text-sm text-red-400">{errors.email?.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-white/70">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-orange-400/50 focus:ring-4 focus:ring-orange-500/20 transition-all duration-200"
                />
                {Boolean(errors.password) && <p className="text-sm text-red-400">{errors.password?.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-white/70">{t('auth.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-orange-400/50 focus:ring-4 focus:ring-orange-500/20 transition-all duration-200"
                />
                {Boolean(errors.confirmPassword) && (
                  <p className="text-sm text-red-400">{errors.confirmPassword?.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full text-white font-semibold py-3.5 mt-2 rounded-xl transition-all duration-200 cursor-pointer"
                style={{ 
                  background: 'linear-gradient(135deg, #F97316, #EA580C)',
                  boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)'
                }}
              >
                {isPending ? t('common.loading') : t('auth.register')}
              </Button>
            </form>

            <p className="text-sm text-white/40 text-center mt-6">
              {t('auth.haveAccount')}{' '}
              <Link className="text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer" to={`/${locale ?? 'en'}/login`}>
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
