import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Clock, MessageSquareText, User, Plus, Lightbulb, File } from 'lucide-react';
import Sidebar from "../../components/sidebarLayout"; // <-- import Sidebar
import TopNavbar from "../../components/topbarLayout";

// Type definitions for better type safety
interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
}

interface Task {
  id: string;
  title: string;
  taskNumber: string;
  openedDays: number;
  assignee: string;
  status: 'Canceled' | 'Completed';
  timeSpent: string;
  avatar: string;
}

interface ProjectStats {
  totalTasks: number;
  totalFiles: number;
}

// Sample data - in a real app, this would come from an API or state management
const SAMPLE_TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'John Doe', avatar: '👨‍💼', isOnline: true },
  { id: '2', name: 'Jane Smith', avatar: '👩‍💼', isOnline: true },
  { id: '3', name: 'Mike Johnson', avatar: '👨‍💻', isOnline: false },
  { id: '4', name: 'Sarah Wilson', avatar: '👩‍💻', isOnline: true },
  { id: '5', name: 'Alex Brown', avatar: '👨‍🎨', isOnline: false }
];

const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Make an Automatic Payment System that enable the design',
    taskNumber: '#402235',
    openedDays: 10,
    assignee: 'Yaoh Ghori',
    status: 'Completed',
    timeSpent: '00:30:00',
    avatar: '👨‍💼'
  },
  {
    id: '2',
    title: 'Make an Automatic Payment System that enable the design',
    taskNumber: '#402235',
    openedDays: 10,
    assignee: 'Yaoh Ghori',
    status: 'Completed',
    timeSpent: '00:30:00',
    avatar: '👨‍💼'
  },
  {
    id: '3',
    title: 'Make an Automatic Payment System that enable the design',
    taskNumber: '#402235',
    openedDays: 10,
    assignee: 'Yaoh Ghori',
    status: 'Completed',
    timeSpent: '00:30:00',
    avatar: '👨‍💼'
  },
  {
    id: '4',
    title: 'Make an Automatic Payment System that enable the design',
    taskNumber: '#402235',
    openedDays: 10,
    assignee: 'Yaoh Ghori',
    status: 'Completed',
    timeSpent: '00:30:00',
    avatar: '👨‍💼'
  },
  {
    id: '5',
    title: 'Make an Automatic Payment System that enable the design',
    taskNumber: '#402235',
    openedDays: 10,
    assignee: 'Yaoh Ghori',
    status: 'Completed',
    timeSpent: '00:30:00',
    avatar: '👨‍💼'
  },
  {
    id: '6',
    title: 'Make an Automatic Payment System that enable the design',
    taskNumber: '#402235',
    openedDays: 10,
    assignee: 'Yaoh Ghori',
    status: 'Completed',
    timeSpent: '00:30:00',
    avatar: '👨‍💼'
  }
];

const SAMPLE_STATS: ProjectStats = {
  totalTasks: 50,
  totalFiles: 15
};

// Avatar Component
const Avatar: React.FC<{ member: TeamMember; size?: 'sm' | 'md' }> = ({ 
  member, 
  size = 'md' 
}) => {
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10';
  
  return (
    <div className="relative">
      <div className={`${sizeClasses} bg-gray-200 rounded-full flex items-center justify-center font-medium border-2 border-white shadow-sm`}>
        {member.avatar}
      </div>
      {member.isOnline && (
        <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};

// Team Avatars Component
const TeamAvatars: React.FC<{ members: TeamMember[] }> = ({ members }) => {
  const displayMembers = members.slice(0, 4);
  const remainingCount = Math.max(0, members.length - 4);

  return (
    <div className="flex items-center">
      {displayMembers.map((member, index) => (
        <div key={member.id} className={`relative ${index > 0 ? '-ml-2' : ''}`}>
          <Avatar member={member} size="sm" />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="relative -ml-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white shadow-sm">
            +{remainingCount}
          </div>
        </div>
      )}
    </div>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: 'Canceled' | 'Completed' }> = ({ status }) => {
  const isCompleted = status === 'Completed';
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${
      isCompleted 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700'
    }`}>
      {status}
    </span>
  );
};

// Time Display Component
const TimeDisplay: React.FC<{ time: string; label?: string }> = ({ time, label }) => {
  return (
    <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
      <Clock className="w-4 h-4 text-green-500" />
      <span>{time}</span>
      {label && <span className="text-xs text-gray-500">({label})</span>}
    </div>
  );
};

// Task Row Component
const TaskRow: React.FC<{ 
  task: Task; 
  onTaskClick?: (taskId: string) => void;
}> = ({ task, onTaskClick }) => {
  return (
    <div 
       className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => onTaskClick?.(task.id)}
    >
      {/* Left section */}
      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-grey-500" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm mb-1">{task.title}</h3>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{task.taskNumber}</span>
            <span>Opened {task.openedDays} days ago by {task.assignee}</span>
            <StatusBadge status={task.status} />
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <TimeDisplay time={task.timeSpent} />
        <Avatar 
          member={{ 
            id: task.assignee, 
            name: task.assignee, 
            avatar: task.avatar 
          }} 
          size="sm" 
        />
        <MessageSquareText className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

// Main Project Management Component
const AddodleProjectManager: React.FC = () => {
  const [tasks] = useState<Task[]>(SAMPLE_TASKS);
  const [teamMembers] = useState<TeamMember[]>(SAMPLE_TEAM_MEMBERS);
  const [stats] = useState<ProjectStats>(SAMPLE_STATS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();


  const handleTaskClick = (taskId: string) => {
    console.log('Task clicked:', taskId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-100">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
      </div>
  
      {/* ✅ Full width wrapper instead of max-w-7xl */}
      <div className="w-full p-6 pt-20">  
        {/* Header Section */}
        <header className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <h2 className="mt-5 text-2xl font-semibold text-gray-800"><span>Projects</span> / <span>Addodle</span></h2>
          </nav>
  
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-gray-900">Addodle</h1>
              <TeamAvatars members={teamMembers} />
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                OnTrack
              </span>
            </div>
  
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Time spent</span>
                  <div className="flex items-center gap-1 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-md">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>2M : 0W : 0D</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Deadline</span>
                  <div className="flex items-center gap-1 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-md">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>6M : 0W : 0D</span>
                  </div>
                </div>
              </div>
  
              <button
                onClick={() => navigate("/create")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                Assign Task
              </button>
            </div>
          </div>
        </header>
  
        {/* Tasks List */}
        <main>
          <div className="w-full space-y-3"> 
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onTaskClick={handleTaskClick} />
            ))}
          </div>
  
          {/* Footer Stats */}
          <footer className="mt-8 flex items-center justify-end gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-4 h-4" />
              <span>{stats.totalTasks} tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <File className="w-4 h-4 text-gray-500" />
              <span>{stats.totalFiles} files</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AddodleProjectManager;
