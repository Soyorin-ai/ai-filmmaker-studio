// 时间线编辑器页面
import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TimelineEditor } from '../../components/timeline';
import { AssetPanel } from '../../components/timeline/AssetPanel';
import type { TimelineState } from '../../components/timeline';
import { projectsApi, Project } from '../../api/projects';
import type { Asset } from '../../api/assets';
import { ArrowLeft, Clock, Save } from 'lucide-react';

export function TimelinePage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAssetPanel, setShowAssetPanel] = useState(true);

  // 加载项目数据
  useEffect(() => {
    if (!id) return;
    
    const loadProject = async () => {
      try {
        const data = await projectsApi.getProject(id);
        setProject(data);
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [id]);

  // 保存时间线状态
  const handleStateChange = useCallback(async (state: TimelineState) => {
    if (!id || saving) return;
    
    setSaving(true);
    try {
      await projectsApi.updateTimeline(id, state as Record<string, unknown>);
    } catch (error) {
      console.error('Failed to save timeline:', error);
    } finally {
      setSaving(false);
    }
  }, [id, saving]);

  // 添加素材到时间线
  const handleSelectAsset = useCallback(async (asset: Asset) => {
    console.log('Selected asset:', asset);
    // TODO: 实现添加到时间线的逻辑
    // 需要通过 TimelineEditor 暴露的方法添加片段
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">项目不存在</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <Link
            to={`/${locale}/projects/${id}`}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回项目
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <h1 className="text-lg font-semibold text-white">{project.name}</h1>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            时间线编辑器
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Save className="w-3 h-3 animate-pulse" />
              保存中...
            </span>
          )}
          <button
            onClick={() => setShowAssetPanel(!showAssetPanel)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              showAssetPanel
                ? 'bg-purple-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {showAssetPanel ? '隐藏素材' : '显示素材'}
          </button>
          <button className="px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded text-sm font-medium text-white">
            导出视频
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 时间线编辑器 */}
        <div className="flex-1">
          <TimelineEditor
            projectId={id!}
            initialState={project.timeline as TimelineState | undefined}
            onStateChange={handleStateChange}
          />
        </div>

        {/* 素材面板 */}
        {showAssetPanel && (
          <AssetPanel
            projectId={id}
            onSelectAsset={handleSelectAsset}
          />
        )}
      </div>
    </div>
  );
}
