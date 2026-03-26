import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Settings,
  Play,
  Save,
  Image,
  Video,
  Music,
  Plus,
  Trash2,
  Clock,
  Edit3,
  FolderOpen,
} from 'lucide-react';
import {
  projectsApi,
  Project,
  ProjectStatus,
  getProjectStatusLabel,
  getProjectStatusColor,
} from '../../api/projects';
import { assetsApi, Asset } from '../../api/assets';

export function ProjectDetailPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const navigate = useNavigate();

  // State
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Load project
  useEffect(() => {
    if (!id) return;

    const loadProject = async () => {
      setLoading(true);
      try {
        const data = await projectsApi.getProject(id);
        setProject(data);
        setEditName(data.name);
        setEditDesc(data.description || '');
      } catch (error) {
        console.error('Failed to load project:', error);
        navigate('../projects');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  // Save project info
  const handleSave = async () => {
    if (!project || !editName.trim()) return;

    setSaving(true);
    try {
      const updated = await projectsApi.updateProject(project.id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
      });
      setProject(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setSaving(false);
    }
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{project.name} - AI Filmmaker Studio</title>
        <meta name="description" content={project.description || '项目详情'} />
        <html lang={locale || 'en'} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="../projects"
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-xl font-bold text-white bg-transparent border-b border-purple-500 focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <h1 className="text-xl font-bold text-white">{project.name}</h1>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded text-xs text-white ${getProjectStatusColor(
                      project.status,
                    )}`}
                  >
                    {getProjectStatusLabel(project.status)}
                  </span>
                  <span className="text-xs text-slate-500">
                    更新于 {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(project.name);
                      setEditDesc(project.description || '');
                    }}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!editName.trim() || saving}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? '保存中...' : '保存'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <Link
                    to={`timeline`}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    时间线
                  </Link>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    预览
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {/* Description */}
          {(isEditing || project.description) && (
            <div className="mb-6">
              {isEditing ? (
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="添加项目描述..."
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              ) : (
                <p className="text-slate-400">{project.description}</p>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
              <div className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <Image className="w-4 h-4" /> 图片素材
              </div>
              <div className="text-2xl font-bold text-rose-400 mt-1">
                {project._count?.assets || project.assetCount || 0}
              </div>
            </div>
            <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
              <div className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <Video className="w-4 h-4" /> 视频素材
              </div>
              <div className="text-2xl font-bold text-purple-400 mt-1">
                {project.tasks?.filter((t: any) => t.type?.includes('VIDEO')).length || 0}
              </div>
            </div>
            <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
              <div className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" /> 时长
              </div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {formatDuration(project.duration)}
              </div>
            </div>
            <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
              <div className="text-slate-300 text-sm font-medium">工作流版本</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">v{project.workflowVersion}</div>
            </div>
          </div>

          {/* Main content - Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assets */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-purple-500" />
                    项目素材
                  </h2>
                  <Link
                    to="../assets"
                    className="px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    添加素材
                  </Link>
                </div>
                <div className="p-4">
                  {project.assets && project.assets.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {project.assets.slice(0, 8).map((asset: any) => (
                        <div
                          key={asset.id}
                          className="aspect-square bg-slate-900 rounded-lg overflow-hidden relative group"
                        >
                          {asset.type === 'IMAGE' ? (
                            <img
                              src={asset.thumbnail || asset.url}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                            />
                          ) : asset.type === 'VIDEO' ? (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                              <Video className="w-8 h-8 text-slate-500" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-cyan-900/50">
                              <Music className="w-8 h-8 text-slate-500" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => {}}
                              className="p-2 bg-red-500/50 rounded-full hover:bg-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无素材</p>
                      <Link
                        to="../create/image"
                        className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block"
                      >
                        去生成素材
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline / Tasks */}
            <div>
              <div className="bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                  <h2 className="text-lg font-semibold text-white">最近任务</h2>
                </div>
                <div className="p-4">
                  {project.tasks && project.tasks.length > 0 ? (
                    <div className="space-y-3">
                      {project.tasks.slice(0, 5).map((task: any) => (
                        <div
                          key={task.id}
                          className="p-3 bg-slate-900 rounded-lg border border-slate-700"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white truncate">{task.type}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                task.status === 'COMPLETED'
                                  ? 'bg-green-500/20 text-green-400'
                                  : task.status === 'RUNNING'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : task.status === 'FAILED'
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {formatDate(task.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <p>暂无任务</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="mt-4 space-y-2">
                <Link
                  to="../create/image"
                  className="block w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-rose-500/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
                      <Image className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium group-hover:text-rose-400 transition-colors">
                        生成图片
                      </div>
                      <div className="text-xs text-slate-500">AI 文生图 / 图生图</div>
                    </div>
                  </div>
                </Link>
                <Link
                  to="../create/video"
                  className="block w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-purple-500/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium group-hover:text-purple-400 transition-colors">
                        生成视频
                      </div>
                      <div className="text-xs text-slate-500">AI 文生视频 / 图生视频</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
