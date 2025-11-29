export class Task {
  constructor(
    public title: string,
    public column: string,
    public project: string,
    public workspace: string,
    public priority?: string,
    public dueDate?: string,
    public assignee?: string,
    public label?: string,
    public description?: string,
    public _id?: string,
  ) { }
}
