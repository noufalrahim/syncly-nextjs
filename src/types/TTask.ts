import type { TColumn } from "./TColumn";
import { TLabel } from "./TLabel";
import { TProject } from "./TProject";

export type TTask = {
  id: string;
  title: string;
  description?: string;
  column?: TColumn;
  project?: TProject;
  label?: TLabel;
  priority?: string;
  dueDate?: string;
  assignee?: string;
  // project?: string;
  // priority?: 'low' | 'medium' | 'high';
  // organisation?: string;
  // createdBy?: string;
  createdAt?: string;
  // updatedAt?: string;
};
