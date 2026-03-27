import {useState, useCallback, useMemo} from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {nodeTypes} from './nodes';
import {NodePanel} from './NodePanel';
import {ConfigPanel} from './ConfigPanel';
import type {WorkflowNodeData} from './types';

interface WorkflowEditorProps {
  initialNodes?: Node<WorkflowNodeData>[];
  initialEdges?: Edge[];
  onChange?: (nodes: Node<WorkflowNodeData>[], edges: Edge[]) => void;
}

export function WorkflowEditor({initialNodes = [], initialEdges = [], onChange}: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<WorkflowNodeData> | null>(null);

  // 连接节点
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  // 选中节点
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<WorkflowNodeData>) => {
    setSelectedNode(node);
  }, []);

  // 点击空白处取消选中
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // 添加节点
  const onAddNode = useCallback(
    (type: string, label: string) => {
      const newNode: Node<WorkflowNodeData> = {
        id: `${type}-${Date.now()}`,
        type,
        position: {
          x: Math.random() * 400 + 200,
          y: Math.random() * 300 + 100,
        },
        data: {
          label,
          status: 'idle',
          // 根据类型设置默认数据
          ...(type === 'input' && {type: 'input', prompt: ''}),
          ...(type === 'imageGen' && {
            type: 'imageGen',
            prompt: '',
            imageSize: '1K',
            aspectRatio: '16:9',
          }),
          ...(type === 'videoGen' && {
            type: 'videoGen',
            prompt: '',
            genType: 'text2video',
            resolution: '720p',
            duration: 5,
            generateAudio: false,
          }),
          ...(type === 'musicGen' && {
            type: 'musicGen',
            prompt: '',
            mode: 'simple',
            model: 'suno-v4',
            duration: 90,
          }),
          ...(type === 'merge' && {type: 'merge', mode: 'sequence'}),
          ...(type === 'output' && {type: 'output', format: 'mp4', resolution: '720p'}),
        } as WorkflowNodeData,
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  // 更新节点数据
  const onUpdateNode = useCallback(
    (nodeId: string, data: Partial<WorkflowNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {...node.data, ...data} as WorkflowNodeData,
            };
          }
          return node;
        }),
      );
      // 更新选中节点
      if (selectedNode?.id === nodeId) {
        setSelectedNode((prev) => (prev ? {...prev, data: {...prev.data, ...data} as WorkflowNodeData} : null));
      }
    },
    [setNodes, selectedNode],
  );

  // 删除节点
  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [setNodes, setEdges, selectedNode],
  );

  // 通知父组件变化
  const handleChange = useCallback(() => {
    onChange?.(nodes as Node<WorkflowNodeData>[], edges);
  }, [nodes, edges, onChange]);

  // MiniMap 节点颜色
  const nodeColor = useCallback((node: Node) => {
    switch (node.type) {
      case 'input': {
        return '#3B82F6';
      }

      case 'imageGen': {
        return '#8B5CF6';
      }

      case 'videoGen': {
        return '#EC4899';
      }

      case 'musicGen': {
        return '#F59E0B';
      }

      case 'merge': {
        return '#06B6D4';
      }

      case 'output': {
        return '#10B981';
      }

      default: {
        return '#64748B';
      }
    }
  }, []);

  const proOptions = useMemo(() => ({hideAttribution: true}), []);

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChange(changes);
          handleChange();
        }}
        onEdgesChange={(changes) => {
          onEdgesChange(changes);
          handleChange();
        }}
        onConnect={(params) => {
          onConnect(params);
          handleChange();
        }}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
        proOptions={proOptions}
        className="bg-slate-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1E293B" />
        <Controls className="!bg-slate-800 !border-white/10" />
        <MiniMap nodeColor={nodeColor} className="!bg-slate-800 !border-white/10" maskColor="rgba(0, 0, 0, 0.8)" />

        {/* 左侧节点面板 */}
        <Panel position="top-left" className="m-2">
          <NodePanel onAddNode={onAddNode} />
        </Panel>

        {/* 右侧配置面板 */}
        {selectedNode && (
          <Panel position="top-right" className="m-2">
            <ConfigPanel
              node={selectedNode}
              onUpdate={(data) => onUpdateNode(selectedNode.id, data)}
              onDelete={() => onDeleteNode(selectedNode.id)}
              onClose={() => setSelectedNode(null)}
            />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
