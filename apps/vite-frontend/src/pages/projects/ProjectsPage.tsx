import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Folder,
  Trash2,
  Archive,
  MoreVertical,
  CheckSquare,
  Square,
  X,
  Film,
  Image,
  Clock,
} from 'lucide-react';
import {
  projectsApi,
  Project,
  ProjectStatus,
  getProjectStatusLabel,
  getProjectStatusColor,
} from '../../api/projects';

const ITEMS_PER_PAGE = 12;

export function ProjectsPage() {
  const { locale } = useParams<{ locale: string }>();
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<{ total: number; byStatus: Record<ProjectStatus, number> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | null>(null);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Load projects
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const result = await projectsApi.getProjects({
        page,
        limit: ITEMS_PER_PAGE,
        status: selectedStatus || undefined,
        search: searchQuery || undefined,
      });
      setProjects(result?.items || []);
      setTotalPages(result?.totalPages || 1);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, searchQuery]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsResult = await projectsApi.getStats();
      setStats({
        total: statsResult?.total || 0,
        byStatus: statsResult?.byStatus || {},
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(null);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Toggle selection
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    setSelectedIds(new Set(projects.map((p) => p.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Create project
  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    try {
      const project = await projectsApi.createProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || undefined,
      });
      setShowCreateModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      navigate(`../projects/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreating(false);
    }
  };

  // Delete selected
  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除 ${selectedIds.size} 个项目吗？`)) return;

    try {
      await projectsApi.deleteProjects(Array.from(selectedIds));
      setSelectedIds(new Set());
      loadProjects();
      loadStats();
    } catch (error) {
      console.error('Failed to delete projects:', error);
    }
  };

  // Delete single
  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      await projectsApi.deleteProject(id);
      loadProjects();
      loadStats();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  // Archive project
  const archiveProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await projectsApi.archiveProject(id);
      loadProjects();
      loadStats();
    } catch (error) {
      console.error('Failed to archive project:', error);
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`;
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus(null);
    setPage(1);
  };

  const hasActiveFilters = searchQuery || selectedStatus;

  return (
    <>
      <Helmet>
        <title>项目管理 - AI Filmmaker Studio</title>
        <meta name="description" content="管理你的短片项目" />
        <html lang={locale || 'en'} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                <Folder className="w-8 h-8 text-purple-500" style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.5))' }} />
                项目管理
              </h1>
              <p className="text-slate-200 mt-1" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>管理你的所有短片项目</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  if (isSelectMode) {
                    setSelectedIds(new Set());
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isSelectMode
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {isSelectMode ? '取消选择' : '批量管理'}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                新建项目
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-300 text-sm font-medium">总项目</div>
                <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-300 text-sm font-medium">草稿</div>
                <div className="text-2xl font-bold text-slate-400 mt-1">
                  {stats.byStatus.DRAFT || 0}
                </div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-300 text-sm font-medium">进行中</div>
                <div className="text-2xl font-bold text-blue-400 mt-1">
                  {stats.byStatus.IN_PROGRESS || 0}
                </div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-300 text-sm font-medium">已完成</div>
                <div className="text-2xl font-bold text-green-400 mt-1">
                  {stats.byStatus.COMPLETED || 0}
                </div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-300 text-sm font-medium">已归档</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">
                  {stats.byStatus.ARCHIVED || 0}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索项目..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Status filter */}
            <select
              value={selectedStatus || ''}
              onChange={(e) => {
                setSelectedStatus((e.target.value as ProjectStatus) || null);
                setPage(1);
              }}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">全部状态</option>
              <option value="DRAFT">草稿</option>
              <option value="IN_PROGRESS">进行中</option>
              <option value="COMPLETED">已完成</option>
              <option value="ARCHIVED">已归档</option>
            </select>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                清除筛选
              </button>
            )}
          </div>

          {/* Selection actions */}
          {isSelectMode && (
            <div className="mt-4 flex items-center gap-4 p-3 bg-slate-800/80 rounded-lg border border-slate-700">
              <span className="text-slate-300">已选择 {selectedIds.size} 项</span>
              <button
                onClick={selectAll}
                className="px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
              >
                全选
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
              >
                取消全选
              </button>
              {selectedIds.size > 0 && (
                <button
                  onClick={deleteSelected}
                  className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  删除选中
                </button>
              )}
            </div>
          )}
        </div>

        {/* Projects Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20 text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
              加载中...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <Folder className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">暂无项目</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                创建项目
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const isSelected = selectedIds.has(project.id);

                return (
                  <div
                    key={project.id}
                    onClick={() => {
                      if (isSelectMode) {
                        toggleSelect(project.id);
                      } else {
                        navigate(`../projects/${project.id}`);
                      }
                    }}
                    className={`group relative bg-slate-800/50 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/50'
                        : 'border-slate-700 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10'
                    }`}
                  >
                    {/* Cover */}
                    <div className="aspect-video relative bg-slate-900">
                      {project.cover ? (
                        <img
                          src={project.cover}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-pink-900/30">
                          <Film className="w-16 h-16 text-slate-600" />
                        </div>
                      )}

                      {/* Selection checkbox */}
                      {isSelectMode && (
                        <div className="absolute top-3 left-3">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-purple-500" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      )}

                      {/* Status badge */}
                      <div
                        className={`absolute top-3 right-3 px-2 py-0.5 rounded text-xs text-white ${getProjectStatusColor(
                          project.status,
                        )}`}
                      >
                        {getProjectStatusLabel(project.status)}
                      </div>

                      {/* Hover actions */}
                      {!isSelectMode && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => archiveProject(project.id, e)}
                            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                            title="归档"
                          >
                            <Archive className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={(e) => deleteProject(project.id, e)}
                            className="p-2 bg-white/20 rounded-full hover:bg-red-500/50 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Image className="w-3 h-3" />
                          {project._count?.assets || project.assetCount || 0} 素材
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(project.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              >
                上一页
              </button>
              <span className="text-slate-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              >
                下一页
              </button>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">新建项目</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">项目名称 *</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="输入项目名称"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">项目描述</label>
                  <textarea
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="输入项目描述（可选）"
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewProjectName('');
                    setNewProjectDesc('');
                  }}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newProjectName.trim() || creating}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? '创建中...' : '创建'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
