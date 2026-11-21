export interface TaskItem {
  taskId: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | string;
  status: 'Pending' | 'InProgress' | 'Completed' | string;
  createdAt: string;
  dueDate?: string | null;
  userId: number;
}

export interface UserItem {
  userId: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'User' | string;
}