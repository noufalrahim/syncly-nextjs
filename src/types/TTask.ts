export type TTask = {
  _id: string;
  title: string;
  description?: string;
  columnRef: string;
  projectRef: string;
  priority?: string;
  dueDate?: string;
  // assignee?: string;
  // project?: string;
  // priority?: 'low' | 'medium' | 'high';
  // organisation?: string;
  // createdBy?: string;
  labelRef?: string;
  createdAt?: string;
  // updatedAt?: string;
};
