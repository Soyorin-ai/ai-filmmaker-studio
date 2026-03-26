import {Handle, Position, type NodeProps} from '@xyflow/react';
import {Loader2, CheckCircle, XCircle, Clock} from 'lucide-react';
import type {BaseNodeData, NodeStatus} from '../types';

interface BaseNodeProps extends NodeProps {
  data: BaseNodeData;
  icon: React.ReactNode;
  color: string;
  children?: React.ReactNode;
  inputs?: Array<{id: string; label?: string}>;
  outputs?: Array<{id: string; label?: string}>;
}

function getStatusIcon(status: NodeStatus) {
  switch (status) {
    case 'pending':
    case 'running': {
      return <Loader2 className="w-3 h-3 animate-spin text-orange-400" />;
    }

    case 'completed': {
      return <CheckCircle className="w-3 h-3 text-green-400" />;
    }

    case 'failed': {
      return <XCircle className="w-3 h-3 text-red-400" />;
    }

    default: {
      return <Clock className="w-3 h-3 text-white/40" />;
    }
  }
}

export function BaseNode({
  data,
  icon,
  color,
  children,
  inputs = [],
  outputs = [],
  selected,
}: BaseNodeProps) {
  return (
    <div
      className={`
        rounded-lg border-2 bg-slate-900/95 backdrop-blur-sm
        min-w-[200px] shadow-lg transition-all
        ${selected ? 'ring-2 ring-white/30' : ''}
      `}
      style={{borderColor: selected ? color : `${color}80`}}
    >
      {/* Header */}
      <div
        className="px-3 py-2 rounded-t-md flex items-center gap-2"
        style={{backgroundColor: `${color}20`}}
      >
        <div style={{color}}>{icon}</div>
        <span className="text-sm font-medium text-white flex-1">{data.label}</span>
        {getStatusIcon(data.status)}
      </div>

      {/* Content */}
      {children && (
        <div className="px-3 py-2 border-t border-white/10">
          {children}
        </div>
      )}

      {/* Progress Bar */}
      {data.status === 'running' && typeof data.progress === 'number' && (
        <div className="px-3 pb-2">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
              style={{width: `${Math.min(100, Math.max(0, data.progress))}%`}}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {data.error && (
        <div className="px-3 pb-2 text-xs text-red-400">
          {data.error}
        </div>
      )}

      {/* Input Handles */}
      {inputs.map((input, index) => (
        <Handle
          key={`input-${input.id}`}
          type="target"
          position={Position.Left}
          id={input.id}
          className="!w-3 !h-3 !bg-slate-700 !border-2"
          style={{
            borderColor: color,
            top: inputs.length === 1 ? '50%' : `${((index + 1) / (inputs.length + 1)) * 100}%`,
          }}
        />
      ))}

      {/* Output Handles */}
      {outputs.map((output, index) => (
        <Handle
          key={`output-${output.id}`}
          type="source"
          position={Position.Right}
          id={output.id}
          className="!w-3 !h-3 !bg-slate-700 !border-2"
          style={{
            borderColor: color,
            top: outputs.length === 1 ? '50%' : `${((index + 1) / (outputs.length + 1)) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
