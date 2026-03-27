import {Outlet} from 'react-router-dom';
import {HelmetProvider} from 'react-helmet-async';
import {I18nextProvider} from 'react-i18next';
import i18n from '@/i18n/config.ts';
import {LanguageSync} from '@/i18n/LanguageSync.tsx';
import {ReactQueryProvider} from '@/providers/react-query/react-query.provider';
import {ToastProvider} from '@/providers/toast/toast.provider';
import {ConfirmProvider} from '@/providers/confirm/confirm.provider';
import {ZodErrorProvider} from '@/providers/zod-error/zod-error.provider';
import {LoadingAnimation} from '@/components/loading-animation/loading-animation.component';

export function ProvidersLayout() {
  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <LanguageSync />
        <ZodErrorProvider>
          <ToastProvider>
            <ConfirmProvider>
              <ReactQueryProvider>
                <LoadingAnimation />
                {/* 全局科幻风格背景 */}
                <div
                  className="min-h-screen relative"
                  style={{
                    background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d14 30%, #12121a 60%, #0a0a0f 100%)',
                  }}
                >
                  {/* 网格背景 */}
                  <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(0,245,255,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,245,255,0.02) 1px, transparent 1px)
                      `,
                      backgroundSize: '50px 50px',
                    }}
                  />
                  {/* 内容区域 */}
                  <div className="relative z-10">
                    <Outlet />
                  </div>
                </div>
              </ReactQueryProvider>
            </ConfirmProvider>
          </ToastProvider>
        </ZodErrorProvider>
      </I18nextProvider>
    </HelmetProvider>
  );
}
