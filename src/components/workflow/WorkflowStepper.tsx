import React from 'react';
import { WorkflowStep } from '../../types/erp';
import { CheckCircle2, Clock, Circle, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  currentStepId?: string;
  onStepClick?: (step: WorkflowStep) => void;
  interactive?: boolean;
}

export function WorkflowStepper({
  steps,
  currentStepId,
  onStepClick,
  interactive = false,
}: WorkflowStepperProps) {
  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-thin">
      <div className="flex items-center min-w-max space-x-1">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isInProgress = step.status === 'in_progress';
          const isPending = step.status === 'pending';
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(step)}
                disabled={!interactive}
                className={cn(
                  'group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left transition-all text-xs',
                  isCompleted && 'bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300',
                  isInProgress && 'bg-crm-brand- border-crm-brand- text-crm-brand- ring-2 ring-crm-brand-600/20 shadow-sm font-medium dark:bg-crm-brand-/40 dark:border-crm-brand-800 dark:text-crm-brand-',
                  isPending && 'bg-slate-50 border-slate-200 text-[#70665F] opacity-75 dark:bg-white dark:border-[#EBE3DB] dark:text-[#70665F]',
                  interactive && 'hover:shadow hover:border-slate-300 cursor-pointer'
                )}
              >
                <div className="flex-shrink-0">
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  {isInProgress && <Clock className="w-3.5 h-3.5 text-crm-brand-700 animate-spin dark:text-crm-brand-500" />}
                  {isPending && <Circle className="w-3.5 h-3.5 text-[#70665F]" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold leading-tight">{step.name}</span>
                  <div className="flex items-center gap-1 text-[10px] text-[#70665F]">
                    <span className="uppercase tracking-wider">{step.department}</span>
                    {step.completedAt && <span>• {step.completedAt}</span>}
                  </div>
                </div>
              </button>

              {!isLast && (
                <div className="text-[#544B45] dark:text-slate-700 px-0.5">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
