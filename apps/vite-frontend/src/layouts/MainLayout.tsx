import {Outlet} from 'react-router-dom';
import {Header} from '@/components/header/header.component';
import {Footer} from '@/components/footer/footer.component';

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-2 py-6 md:px-4 md:py-8 lg:py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
