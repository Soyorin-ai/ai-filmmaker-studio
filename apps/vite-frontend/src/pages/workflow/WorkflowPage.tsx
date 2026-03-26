import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type OnConnect,
  BackgroundVariant,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Save, Download, Upload, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  nodeTypes,
  NodePanel,
  NodeConfigPanel,
  type WorkflowNode,
  type WorkflowEdge,
  type WorkflowNodeType,
} from '@/components/workflow';

// 初始节点
const initialNodes: WorkflowNode[] = [
  {
    id: 'input-1',
    type: 'input',
    position: { x: 100, y: 200 },
    data: { label: '创意输入', prompt: '' },
  },
  {
    id: 'image-1',
    type: 'imageGen',
    position: { x: 350, y: 100 },
    data: {
      label: '场景1',
      prompt: '一个繁华的城市街道',
      imageSize: '1K',
      aspectRatio: '16:9',
    },
  },
  {
    id: 'image-2',
    type: 'imageGen',
    position: { x: 350, y: 300 },
    data: {
      label: '场景2',
      prompt: '宁静的乡村风景',
      imageSize: '1K',
      aspectRatio: '16:9',
    },
  },
  {
    id: 'video-1',
    type: 'videoGen',
    position: { x: 600, y: 100 },
    data: {
      label: '视频1',
      prompt: '',
      type: 'image2video',
      resolution: '720p',
      duration: 5,
      generateAudio: false,
    },
  },
  {
    id: 'video-2',
    type: 'videoGen',
    position: { x: 600, y: 300 },
    data: {
      label: '视频2',
      prompt: '',
      type: 'image2video',
      resolution: '720p',
      duration: 5,
      generateAudio: false,
    },
  },
  {
    id: 'merge-1',
    type: 'merge',
    position: { x: 850, y: 200 },
    data: { label: '合并视频', mode: 'sequence' },
  },
  {
    id: 'export-1',
    type: 'export',
    position: { x: 1100, y: 200 },
    data: { label: '导出', format: 'mp4', resolution: '1080p' },
  },
];

// 初始边
const initialEdges: WorkflowEdge[] = [
  { id: 'e-input-image1', source: 'input-1', target: 'image-1' },
  { id: 'e-input-image2', source: 'input-1', target: 'image-2' },
  { id: 'e-image1-video1', source: 'image-1', target: 'video-1' },
  { id: 'e-image2-video2', source: 'image-2', target: 'video-2' },
  { id: 'e-video1-merge', source: 'video-1', target: 'merge-1' },
  { id: 'e-video2-merge', source: 'video-2', target: 'merge-1' },
  { id: 'e-merge-export', source: 'merge-1', target: 'export-1' },
];

export function WorkflowPage() {
  const { id } = useParams();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [draggedNodeType, setDraggedNodeType] = useState<WorkflowNodeType | null>(null);

  // 连接节点
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  // 拖拽开始
  const onDragStart = useCallback((type: WorkflowNodeType) => {
    setDraggedNodeType(type);
  }, []);

  // 拖拽放置
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!draggedNodeType || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 80,
        y: event.clientY - bounds.top - 24,
      };

      const newNode: WorkflowNode = {
        id: `${draggedNodeType}-${Date.now()}`,
        type: draggedNodeType,
        position,
        data: getDefaultNodeData(draggedNodeType),
      };

      setNodes((nds) => [...nds, newNode]);
      setDraggedNodeType(null);
    },
    [draggedNodeType, setNodes],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 点击节点
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode(node as WorkflowNode);
  }, []);

  // 点击空白区域
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // 更新节点数据
  const handleUpdateNode = useCallback(
    (nodeId: string, data: Partial<WorkflowNode['data']>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node,
        ),
      );
    },
    [setNodes],
  );

  // 运行工作流
  const handleRunWorkflow = () => {
    toast.info('工作流运行功能开发中...');
  };

  // 保存工作流
  const handleSaveWorkflow = () => {
    const workflow = {
      id: id ?? 'new',
      name: '我的工作流',
      nodes,
      edges,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`workflow-${id ?? 'new'}`, JSON.stringify(workflow));
    toast.success('工作流已保存');
  };

  // 导出工作流
  const handleExportWorkflow = () => {
    const workflow = {
      id,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${id ?? 'new'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('工作流已导出');
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
      }}
    >
      {/* Header */}
      <header
        className="border-b border-white/10 shrink-0"
        style={{ background: 'rgba(15, 23, 42, 0.8)' }}
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-px h-6 bg-white/20" />
            <h1 className="text-lg font-semibold text-white">
              工作流编辑器
              {id && <span className="text-white/40 ml-2">#{id}</span>}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportWorkflow}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-1" />
              导出
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Upload className="w-4 h-4 mr-1" />
              导入
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveWorkflow}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Save className="w-4 h-4 mr-1" />
              保存
            </Button>
            <Button
              size="sm"
              onClick={handleRunWorkflow}
              className="cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
              }}
            >
              <Play className="w-4 h-4 mr-1" />
              运行
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Node Library */}
        <div className="p-4 shrink-0">
          <NodePanel onDragStart={onDragStart} />
        </div>

        {/* Center - Canvas */}
        <div
          className="flex-1 relative"
          ref={reactFlowWrapper}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: 'transparent' }}
          >
            <Controls className="!bg-slate-900/80 !border-white/10 [&_button]:!bg-slate-800 [&_button]:!border-white/10 [&_button]:!text-white [&_button:hover]:!bg-slate-700" />
            <MiniMap
              className="!bg-slate-900/80 !border-white/10"
              nodeColor={(node) => {
                const colors: Record<string, string> = {
                  input: '#3B82F6',
                  imageGen: '#8B5CF6',
                  videoGen: '#EC4899',
                  musicGen: '#F97316',
                  merge: '#10B981',
                  export: '#06B6D4',
                };
                return colors[node.type ?? ''] ?? '#64748B';
              }}
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.1)" />
          </ReactFlow>
        </div>

        {/* Right Panel - Node Config */}
        <div className="p-4 shrink-0">
          <NodeConfigPanel
            node={selectedNode}
            onClose={() => {
              setSelectedNode(null);
            }}
            onUpdate={handleUpdateNode}
          />
        </div>
      </div>
    </div>
  );
}

// 获取节点默认数据
function getDefaultNodeData(type: WorkflowNodeType): WorkflowNode['data'] {
  const defaults: Record<WorkflowNodeType, WorkflowNode['data']> = {
    input: { label: '输入', prompt: '' },
    imageGen: {
      label: '图片生成',
      prompt: '',
      imageSize: '1K',
      aspectRatio: '16:9',
    },
    videoGen: {
      label: '视频生成',
      prompt: '',
      type: 'text2video',
      resolution: '720p',
      duration: 5,
      generateAudio: false,
    },
    musicGen: {
      label: '音乐生成',
      prompt: '',
      mode: 'simple',
      model: 'suno-v4',
      duration: 90,
    },
    merge: { label: '合并', mode: 'sequence' },
    export: { label: '导出', format: 'mp4', resolution: '1080p' },
  };
  return defaults[type];
}
