import type { TTask } from "./TTask";

export type TColumn = {
  id?: string;
  project: string;
  name: string;
  color?: string;
  tasks?: TTask[];
};
