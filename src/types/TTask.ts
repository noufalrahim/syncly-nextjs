import { TColumn } from "./TColumn";

export type TTask = {
  id: string;
  title: string;
  description?: string;
  columnRef?: TColumn;
  projectRef?: string;
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
