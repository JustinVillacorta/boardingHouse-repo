import React from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Wrench, User, Circle } from "lucide-react";
import type { QuickAction } from "../../domain/entities/TenantDashboard";

interface QuickActionButtonProps {
  action: QuickAction;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ action }) => {
  const navigate = useNavigate();

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      'dollar-sign': DollarSign,
      'wrench': Wrench,
      'user': User,
    };
    return icons[iconName] || Circle;
  };

  const Icon = getIcon(action.icon);

  const handleClick = () => {
    navigate(action.path);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer w-full text-left"
    >
      <div className="flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{action.title}</p>
        <p className="text-xs text-gray-500">{action.description}</p>
      </div>
    </button>
  );
};

export default QuickActionButton;
