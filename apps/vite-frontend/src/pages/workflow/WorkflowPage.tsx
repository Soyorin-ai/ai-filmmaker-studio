import {useState, useCallback} from 'react';
import {Link, useParams} from 'react-router-dom';
import {ArrowLeft, Play, Save, FolderOpen, Plus} from 'lucide-react';
import type {Node, Edge} from '@xyflow/react';
import {Button} from '@/components/ui/button';
import {WorkflowEditor} from '@/components/workflow';
import {WORKFLOW_TEMPLATES, type WorkflowNodeData} from '@/components/workflow/types';

export function WorkflowPage() {
  const {projectId} = useParams<{projectId: string}>();
  const [nodes, setNodes] = useState<Array<Node<WorkflowNodeData>>>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // 保存工作流
  const handleSave = useCallback(() => {
    const workflow = {nodes, edges};
    localStorage.setItem(`workflow-${projectId ?? 'default'}`, JSON.stringify(workflow));
    // TODO: 保存到后端
  }, [nodes, edges, projectId]);

  // 运行工作流
  const handleRun = useCallback(() => {
    // TODO: 实现工作流执行
  }, []);

  // 加载模板
  const loadTemplate = useCallback((templateId: string) => {
    const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      const templateNodes: Array<Node<WorkflowNodeData>> = template.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: 'idle',
        },
      }));

      const templateEdges = template.edges.map((e) => ({
        ...e,
        type: 'smoothstep',
        animated: false,
        style: {stroke: '#64748B', strokeWidth: 2},
      })) as Edge[];

      setNodes(templateNodes);
      setEdges(templateEdges);
    }
  }, []);

  // 监听工作流变化
  const handleWorkflowChange = useCallback(
    (newNodes: Array<Node<WorkflowNodeData>>, newEdges: Edge[]) => {
      setNodes(newNodes);
      setEdges(newEdges);
    },
    [],
  );

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
      }}
    >
      {/* Header */}
      <header
        className="border-b border-white/10 flex-shrink-0"
        style={{background: 'rgba(15, 23, 42, 0.8)'}}
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={projectId ? `/projects/${projectId}` : '/'}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </Link>
            <div className="w-px h-6 bg-white/20" />
            <h1 className="text-lg font-semibold text-white">
              工作流编辑器
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* 模板选择 */}
            <div className="relative">
              <select
                className="appearance-none bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 pr-8 cursor-pointer hover:bg-white/10 transition-colors"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    loadTemplate(e.target.value);
                  }
                }}
              >
                <option disabled value="" className="bg-slate-900">选择模板</option>
                {WORKFLOW_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900">
                    {t.name}
                  </option>
                ))}
              </select>
              <FolderOpen className="w-4 h-4 text-white/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
              onClick={handleSave}
            >
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
            <Button
              size="sm"
              className="cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
              }}
              onClick={handleRun}
            >
              <Play className="w-4 h-4 mr-2" />
              运行
            </Button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {nodes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-10 h-10 text-white/30" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                开始创建工作流
              </h2>
              <p className="text-white/50 mb-6">
                选择一个模板快速开始，或从左侧面板添加节点
              </p>
              <div className="flex gap-3 justify-center">
                {WORKFLOW_TEMPLATES.slice(0, 3).map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className="px-4 py-3 rounded-lg border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all text-left cursor-pointer"
                    onClick={() => { loadTemplate(template.id); }}
                  >
                    <div className="text-sm font-medium text-white">
                      {template.name}
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <WorkflowEditor
            initialNodes={nodes}
            initialEdges={edges}
            onChange={handleWorkflowChange}
          />
        )}
      </div>
    </div>
  );
}
