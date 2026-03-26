// 素材面板 - 用于拖拽素材到时间线
import { useState, useEffect } from 'react';
import { Image, Video, Music, Search, Loader2 } from 'lucide-react';
import { assetsApi, Asset, AssetType, AssetsListResult } from '../../api/assets';

interface AssetPanelProps {
  projectId?: string;
  onSelectAsset: (asset: Asset) => void;
}

export function AssetPanel({ projectId, onSelectAsset }: AssetPanelProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | AssetType>('all');

  // 加载素材
  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      try {
        const result = await assetsApi.getAssets({
          projectId,
          type: typeFilter === 'all' ? undefined : typeFilter,
          search: searchQuery || undefined,
          limit: 50,
        });
        setAssets(result.items);
      } catch (error) {
        console.error('Failed to load assets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, [projectId, typeFilter, searchQuery]);

  // 获取素材图标
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <Image className="w-4 h-4" />;
      case 'VIDEO':
        return <Video className="w-4 h-4" />;
      case 'AUDIO':
        return <Music className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-64 bg-slate-800 border-l border-slate-700 flex flex-col h-full">
      {/* 头部 */}
      <div className="p-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-2">素材库</h3>
        
        {/* 搜索 */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="搜索素材..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        
        {/* 类型筛选 */}
        <div className="flex gap-1 mt-2">
          {(['all', 'IMAGE', 'VIDEO', 'AUDIO'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`flex-1 px-2 py-1 text-xs rounded ${
                typeFilter === type
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {type === 'all' ? '全部' : type === 'IMAGE' ? '图片' : type === 'VIDEO' ? '视频' : '音频'}
            </button>
          ))}
        </div>
      </div>

      {/* 素材列表 */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无素材</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="aspect-square bg-slate-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all group relative"
                onClick={() => onSelectAsset(asset)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('asset', JSON.stringify(asset));
                }}
              >
                {asset.type === 'IMAGE' ? (
                  <img
                    src={asset.thumbnail || asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : asset.type === 'VIDEO' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                    <Video className="w-6 h-6 text-slate-500" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-900/50 to-cyan-900/50">
                    <Music className="w-6 h-6 text-slate-500" />
                  </div>
                )}
                
                {/* 名称 */}
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-0.5">
                  <p className="text-[10px] text-white truncate">{asset.name}</p>
                </div>
                
                {/* 类型图标 */}
                <div className="absolute top-1 right-1 bg-black/50 rounded p-0.5">
                  {getAssetIcon(asset.type)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="p-2 border-t border-slate-700 text-xs text-slate-500 text-center">
        点击或拖拽素材到时间线
      </div>
    </div>
  );
}
