import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { 
  Wand2, 
  Sparkles, 
  FolderOpen, 
  LogIn, 
  UserPlus, 
  LogOut, 
  User,
  ChevronRight,
  Play,
  Music,
  Clapperboard,
  GitBranch
} from 'lucide-react';
import { useMe, useLogout } from '@/hooks/use-auth/use-auth.hook';

export function Home() {
  const { locale } = useParams<{ locale: string }>();
  const { user, isLoading } = useMe();
  const { logout } = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <Helmet>
        <title>AI Filmmaker Studio</title>
        <meta name="description" content="AI 短片制作平台 - 从创意到成片" />
        <html lang={locale || 'en'} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="px-6 py-4 flex justify-end gap-3">
          {isLoading ? (
            <div className="w-24 h-10 bg-white/10 animate-pulse rounded-lg" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <User className="w-4 h-4" style={{ color: '#60A5FA' }} />
                <span className="text-white/90 font-medium">{user.email}</span>
              </div>
              <button
                type="button"
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center gap-2 border border-transparent hover:border-white/20 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                to="login"
                className="px-5 py-2.5 text-white/80 hover:text-white transition-all duration-200 flex items-center gap-2 border border-white/20 hover:border-white/40 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                登录
              </Link>
              <Link
                to="register"
                className="px-5 py-2.5 text-white font-medium rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-lg cursor-pointer"
                style={{ 
                  background: 'linear-gradient(135deg, #F97316, #EA580C)',
                  boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3)'
                }}
              >
                <UserPlus className="w-4 h-4" />
                注册
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div 
        className="min-h-screen relative overflow-hidden"
        style={{ 
          fontFamily: "'Inter', sans-serif",
          background: 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)'
        }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Grid */}
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
          
          {/* Floating Orbs */}
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{ 
              background: 'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%)',
              animation: 'float 8s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
            style={{ 
              background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 70%)',
              animation: 'float 10s ease-in-out infinite reverse'
            }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
            style={{ 
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 60%)'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-32">
          
          {/* Logo & Title */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div 
                className="relative p-4 rounded-2xl border border-white/20 backdrop-blur-sm"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8), rgba(15, 23, 42, 0.8))',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <Clapperboard className="w-12 h-12" style={{ color: '#60A5FA' }} />
              </div>
              <div 
                className="relative p-3 rounded-xl"
                style={{ 
                  background: 'linear-gradient(135deg, #F97316, #EA580C)',
                  boxShadow: '0 8px 24px rgba(249, 115, 22, 0.4)'
                }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 
              className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
              style={{ 
                fontFamily: "'Space Grotesk', sans-serif",
                background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 50%, #F97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 60px rgba(96, 165, 250, 0.3)'
              }}
            >
              AI Filmmaker Studio
            </h1>
            
            <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed font-light">
              从创意到成片，<span className="text-white font-medium">AI</span> 全程助力。
              <br />
              打造属于你的短片作品。
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-5 gap-6 max-w-7xl w-full mb-16">
            {/* AI 生图 */}
            <Link
              to="create/image"
              className="group relative rounded-2xl p-6 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(15, 23, 42, 0.6))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1), transparent)' }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <Wand2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="min-h-[3.5rem] flex flex-col justify-center">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 whitespace-nowrap transition-colors duration-300 group-hover:text-blue-400">
                      AI 生图
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </h2>
                    <p className="text-white/40 text-xs font-mono tracking-wider">IMAGE_GENERATION</p>
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed min-h-[2.5rem]">
                  文生图、图生图，支持多种分辨率
                </p>
              </div>
            </Link>

            {/* AI 生视频 */}
            <Link
              to="create/video"
              className="group relative rounded-2xl p-6 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(15, 23, 42, 0.6))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1), transparent)' }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    <Play className="w-7 h-7 text-white" />
                  </div>
                  <div className="min-h-[3.5rem] flex flex-col justify-center">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 whitespace-nowrap transition-colors duration-300 group-hover:text-purple-400">
                      AI 生视频
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </h2>
                    <p className="text-white/40 text-xs font-mono tracking-wider">VIDEO_GENERATION</p>
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed min-h-[2.5rem]">
                  文生视频、图生视频、首尾帧生视频
                </p>
              </div>
            </Link>

            {/* AI 音乐 */}
            <Link
              to="create/music"
              className="group relative rounded-2xl p-6 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(15, 23, 42, 0.6))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), transparent)' }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      background: 'linear-gradient(135deg, #F97316, #EA580C)',
                      boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)'
                    }}
                  >
                    <Music className="w-7 h-7 text-white" />
                  </div>
                  <div className="min-h-[3.5rem] flex flex-col justify-center">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 whitespace-nowrap transition-colors duration-300 group-hover:text-orange-400">
                      AI 音乐
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </h2>
                    <p className="text-white/40 text-xs font-mono tracking-wider">MUSIC_GENERATION</p>
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed min-h-[2.5rem]">
                  AI 生成歌曲、背景音乐、自定义歌词
                </p>
              </div>
            </Link>

            {/* 项目管理 */}
            <Link
              to="projects"
              className="group relative rounded-2xl p-6 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(15, 23, 42, 0.6))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1), transparent)' }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <FolderOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="min-h-[3.5rem] flex flex-col justify-center">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 whitespace-nowrap transition-colors duration-300 group-hover:text-emerald-400">
                      项目管理
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </h2>
                    <p className="text-white/40 text-xs font-mono tracking-wider">PROJECT_MANAGEMENT</p>
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed min-h-[2.5rem]">
                  管理你的创作项目和时间线
                </p>
              </div>
            </Link>

            {/* 工作流编排 */}
            <Link
              to="workflow"
              className="group relative rounded-2xl p-6 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(15, 23, 42, 0.6))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), transparent)' }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      background: 'linear-gradient(135deg, #EC4899, #DB2777)',
                      boxShadow: '0 8px 24px rgba(236, 72, 153, 0.3)'
                    }}
                  >
                    <GitBranch className="w-7 h-7 text-white" />
                  </div>
                  <div className="min-h-[3.5rem] flex flex-col justify-center">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 whitespace-nowrap transition-colors duration-300 group-hover:text-pink-400">
                      工作流编排
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </h2>
                    <p className="text-white/40 text-xs font-mono tracking-wider">WORKFLOW_EDITOR</p>
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed min-h-[2.5rem]">
                  可视化工作流，自动化创作流程
                </p>
              </div>
            </Link>
          </div>

          {/* Bottom Actions */}
          <div className="flex gap-4">
            <Link
              to="projects"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              <FolderOpen className="w-5 h-5" />
              我的项目
            </Link>
            <Link
              to="create/image"
              className="flex items-center gap-2 px-6 py-3 text-white font-medium rounded-xl transition-all duration-200 cursor-pointer"
              style={{ 
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)'
              }}
            >
              <Sparkles className="w-5 h-5" />
              开始创作
            </Link>
            <Link
              to="assets"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              素材库
            </Link>
          </div>
        </div>

        {/* CSS Animation */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    </>
  );
}
