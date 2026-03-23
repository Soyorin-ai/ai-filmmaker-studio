import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  Image,
  Video,
  Music,
  Heart,
  Trash2,
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckSquare,
  Square,
  X,
  FolderOpen,
} from 'lucide-react';
import { assetsApi, Asset, AssetType, AssetStats } from '../../api/assets';

const ITEMS_PER_PAGE = 24;

const typeIcons: Record<AssetType, typeof Image> = {
  IMAGE: Image,
  VIDEO: Video,
  AUDIO: Music,
};

const typeLabels: Record<AssetType, string> = {
  IMAGE: '图片',
  VIDEO: '视频',
  AUDIO: '音频',
};

const sourceLabels: Record<string, string> = {
  GENERATE: 'AI生成',
  UPLOAD: '上传',
  EDIT: '编辑',
  IMPORT: '导入',
};

export function AssetsPage() {
  const { locale } = useParams<{ locale: string }>();

  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AssetType | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Load assets
  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await assetsApi.getAssets({
        page,
        limit: ITEMS_PER_PAGE,
        type: selectedType || undefined,
        tag: selectedTag || undefined,
        search: searchQuery || undefined,
        isFavorite: showFavoritesOnly || undefined,
      });
      setAssets(result?.items || []);
      setTotalPages(result?.totalPages || 1);
    } catch (error) {
      console.error('Failed to load assets:', error);
      setAssets([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, selectedType, selectedTag, searchQuery, showFavoritesOnly]);

  // Load stats and tags
  const loadStatsAndTags = useCallback(async () => {
    try {
      const [statsResult, tagsResult] = await Promise.all([
        assetsApi.getStats(),
        assetsApi.getUserTags(),
      ]);
      setStats(statsResult);
      setTags(tagsResult || []);
    } catch (error) {
      console.error('Failed to load stats/tags:', error);
      setStats(null);
      setTags([]);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    loadStatsAndTags();
  }, [loadStatsAndTags]);

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
    setSelectedIds(new Set(assets.map((a) => a.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Toggle favorite
  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await assetsApi.toggleFavorite(id);
      setAssets(assets.map((a) => (a.id === id ? updated : a)));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Delete selected
  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除 ${selectedIds.size} 个素材吗？`)) return;

    try {
      await assetsApi.deleteAssets(Array.from(selectedIds));
      setSelectedIds(new Set());
      loadAssets();
      loadStatsAndTags();
    } catch (error) {
      console.error('Failed to delete assets:', error);
    }
  };

  // Delete single
  const deleteAsset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个素材吗？')) return;

    try {
      await assetsApi.deleteAsset(id);
      loadAssets();
      loadStatsAndTags();
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  // Download asset
  const downloadAsset = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(asset.url, '_blank');
  };

  // Format file size
  const formatFileSize = (bytes: string | number): string => {
    const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType(null);
    setSelectedTag(null);
    setShowFavoritesOnly(false);
    setPage(1);
  };

  const hasActiveFilters = searchQuery || selectedType || selectedTag || showFavoritesOnly;

  return (
    <>
      <Helmet>
        <title>素材库 - AI Filmmaker Studio</title>
        <meta name="description" content="管理你的图片和视频素材" />
        <html lang={locale || 'en'} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                <FolderOpen className="w-8 h-8 text-rose-500" style={{ filter: 'drop-shadow(0 0 10px rgba(244,63,94,0.5))' }} />
                素材库
              </h1>
              <p className="text-slate-200 mt-1" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>管理你的所有图片和视频素材</p>
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
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {isSelectMode ? '取消选择' : '批量管理'}
              </button>
              <Link
                to="../create/image"
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
              >
                生成素材
              </Link>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-300 text-sm font-medium">总素材</div>
                <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <Image className="w-4 h-4" /> 图片
                </div>
                <div className="text-2xl font-bold text-rose-400 mt-1">{stats.byType.IMAGE || 0}</div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <Video className="w-4 h-4" /> 视频
                </div>
                <div className="text-2xl font-bold text-purple-400 mt-1">{stats.byType.VIDEO || 0}</div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-300 text-sm font-medium">存储空间</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">
                  {formatFileSize(stats.storageUsed)}
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
                placeholder="搜索素材..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Type filter */}
            <select
              value={selectedType || ''}
              onChange={(e) => {
                setSelectedType(e.target.value as AssetType || null);
                setPage(1);
              }}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500"
            >
              <option value="">全部类型</option>
              <option value="IMAGE">图片</option>
              <option value="VIDEO">视频</option>
              <option value="AUDIO">音频</option>
            </select>

            {/* Tag filter */}
            {tags.length > 0 && (
              <select
                value={selectedTag || ''}
                onChange={(e) => {
                  setSelectedTag(e.target.value || null);
                  setPage(1);
                }}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500"
              >
                <option value="">全部标签</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}

            {/* Favorites toggle */}
            <button
              onClick={() => {
                setShowFavoritesOnly(!showFavoritesOnly);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                showFavoritesOnly
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              收藏
            </button>

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
              <span className="text-slate-300">
                已选择 {selectedIds.size} 项
              </span>
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

        {/* Assets Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20 text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full mx-auto mb-4" />
              加载中...
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">暂无素材</p>
              <Link
                to="../create/image"
                className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                生成素材
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {assets.map((asset) => {
                const TypeIcon = typeIcons[asset.type];
                const isSelected = selectedIds.has(asset.id);

                return (
                  <div
                    key={asset.id}
                    onClick={isSelectMode ? () => toggleSelect(asset.id) : undefined}
                    className={`group relative bg-slate-800/50 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-500/50'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square relative bg-slate-900">
                      {asset.type === 'IMAGE' ? (
                        <img
                          src={asset.thumbnail || asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : asset.type === 'VIDEO' ? (
                        asset.thumbnail ? (
                          <img
                            src={asset.thumbnail}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                            <Video className="w-12 h-12 text-slate-500" />
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-cyan-900/50">
                          <Music className="w-12 h-12 text-slate-500" />
                        </div>
                      )}

                      {/* Selection checkbox */}
                      {isSelectMode && (
                        <div className="absolute top-2 left-2">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-rose-500" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      )}

                      {/* Type badge */}
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded text-xs text-white flex items-center gap-1">
                        <TypeIcon className="w-3 h-3" />
                        {typeLabels[asset.type]}
                      </div>

                      {/* Hover actions */}
                      {!isSelectMode && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => toggleFavorite(asset.id, e)}
                            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                asset.isFavorite ? 'text-rose-500 fill-current' : 'text-white'
                              }`}
                            />
                          </button>
                          <button
                            onClick={(e) => downloadAsset(asset, e)}
                            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                          >
                            <Download className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={(e) => deleteAsset(asset.id, e)}
                            className="p-2 bg-white/20 rounded-full hover:bg-red-500/50 transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <p className="text-sm text-white truncate">{asset.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-500">
                          {formatFileSize(asset.fileSize)}
                        </span>
                        <span className="text-xs text-slate-500">{sourceLabels[asset.source]}</span>
                      </div>
                      {asset.tags && asset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {asset.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-slate-700 text-slate-400 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {asset.tags && asset.tags.length > 2 && (
                            <span className="text-xs text-slate-500">+{asset.tags.length - 2}</span>
                          )}
                        </div>
                      )}
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
      </div>
    </>
  );
}
