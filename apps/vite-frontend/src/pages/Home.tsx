import {Helmet} from 'react-helmet-async';
import {useParams, Link} from 'react-router-dom';
import {Wand2, Film, Sparkles, FolderOpen, Folder, LogIn, UserPlus, LogOut, User} from 'lucide-react';
import {useMe, useLogout} from '@/hooks/use-auth/use-auth.hook';

export function Home() {
  const {locale} = useParams<{locale: string}>();
  const {user, isLoading} = useMe();
  const {logout} = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <Helmet>
        <title>AI Filmmaker Studio</title>
        <meta name="description" content="AI 短片制作平台 - 从创意到成片" />
        <html lang={locale || 'en'} />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-end gap-3">
            {isLoading ? (
              <div className="w-24 h-10 bg-slate-800 animate-pulse rounded-lg" />
            ) : user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-lg border border-slate-700">
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-200">{user.nickname || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  退出
                </button>
              </>
            ) : (
              <>
                <Link
                  to="login"
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  登录
                </Link>
                <Link
                  to="register"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  注册
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
          {/* Logo & Title */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Film className="w-16 h-16 text-rose-500" style={{ filter: 'drop-shadow(0 0 15px rgba(244,63,94,0.5))' }} />
              <Sparkles className="w-12 h-12 text-purple-500" style={{ filter: 'drop-shadow(0 0 15px rgba(168,85,247,0.5))' }} />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              AI Filmmaker Studio
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
              从创意到成片，AI 全程助力。打造属于你的短片作品。
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
            {/* 生图卡片 */}
            <Link
              to="create/image"
              className="group bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-xl p-6 hover:border-rose-500 transition-all hover:shadow-lg hover:shadow-rose-500/20"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">
                    AI 生图
                  </h2>
                  <p className="text-slate-400 text-xs">Image Generation</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                文生图、图生图，支持多种分辨率和宽高比
              </p>
            </Link>

            {/* 生视频卡片 */}
            <Link
              to="create/video"
              className="group bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-xl p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    AI 生视频
                  </h2>
                  <p className="text-slate-400 text-xs">Video Generation</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                文生视频、图生视频、首尾帧生视频
              </p>
            </Link>

            {/* 项目管理卡片 */}
            <Link
              to="projects"
              className="group bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-xl p-6 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    项目管理
                  </h2>
                  <p className="text-slate-400 text-xs">Projects</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                管理你的短片项目，组织素材和工作流
              </p>
            </Link>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="projects"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 transition-all"
            >
              我的项目
            </Link>
            <Link
              to="create/image"
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg shadow-rose-500/30 transition-all"
            >
              开始创作
            </Link>
            <Link
              to="assets"
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <FolderOpen className="w-5 h-5" />
              素材库
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
