import {createBrowserRouter, Navigate} from 'react-router-dom';
import {Home} from '../pages/Home.tsx';
import {ErrorBoundary} from '../pages/ErrorBoundary.tsx';
import {NotFound} from '../pages/NotFound.tsx';
import {LoginPage} from '../pages/auth/LoginPage.tsx';
import {RegisterPage} from '../pages/auth/RegisterPage.tsx';
import {ImagePage} from '../pages/create/ImagePage.tsx';
import {VideoPage} from '../pages/create/VideoPage.tsx';
import {MusicPage} from '../pages/create/MusicPage.tsx';
import {AssetsPage} from '../pages/assets/AssetsPage.tsx';
import {ProjectsPage} from '../pages/projects/ProjectsPage.tsx';
import {ProjectDetailPage} from '../pages/projects/ProjectDetailPage.tsx';
import {TimelinePage} from '../pages/timeline/TimelinePage.tsx';
import {WorkflowPage} from '../pages/workflow/WorkflowPage.tsx';
import {MainLayout} from '@/layouts/MainLayout.tsx';
import {BareLayout} from '@/layouts/BareLayout.tsx';
import {ProvidersLayout} from '@/layouts/ProvidersLayout.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to="/en" />,
  },
  {
    path: '/:locale',
    element: <ProvidersLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {index: true, element: <Home />},
          {path: 'create/image', element: <ImagePage />},
          {path: 'create/video', element: <VideoPage />},
          {path: 'create/music', element: <MusicPage />},
          {path: 'assets', element: <AssetsPage />},
          {path: 'projects', element: <ProjectsPage />},
          {path: 'projects/:id', element: <ProjectDetailPage />},
          {path: 'projects/:id/timeline', element: <TimelinePage />},
          {path: 'workflow', element: <WorkflowPage />},
          {path: 'workflow/:id', element: <WorkflowPage />},
        ],
      },
      {
        element: <BareLayout />,
        children: [
          {path: 'login', element: <LoginPage />},
          {path: 'register', element: <RegisterPage />},
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
