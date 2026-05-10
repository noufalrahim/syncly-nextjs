export class Comment {
  constructor(
    public task: string,
    public author: string,
    public content: string,
    public parentComment?: string,
    public mentions?: string[],
    public _id?: string,
  ) {}
}

export class Label {
  constructor(
    public name: string,
    public order: string,
    public color: string,
    public project: string,
    public workspace: string,
    public _id?: string,
  ) {}
}

export class Project {
  constructor(
    public name: string,
    public workspace: string,
    public createdBy: string,
    public emoji: string,
    public _id?: string,
  ) {}
}

export class ProjectMember {
  constructor(
    public project: string,
    public user: string,
    public role: string = "member",
    public _id?: string,
  ) {}
}

export class StatusColumn {
  constructor(
    public name: string,
    public project: string,
    public color: string,
    public order: number,
    public _id?: string,
  ) {}
}

export class Task {
  constructor(
    public title: string,
    public column: string,
    public project: string,
    public workspace: string,
    public priority?: string,
    public dueDate?: string,
    public assignee?: string,
    public description?: string,
    public order?: number,
    public dependencies?: string[],
    public attachments?: string[],
    public references?: string[],
    public _id?: string,
  ) {}
}

export class TaskHistory {
  constructor(
    public task: string,
    public user: string,
    public action: string,
    public field?: string,
    public oldValue?: string,
    public newValue?: string,
    public _id?: string,
  ) {}
}

export class TaskLabel {
  constructor(
    public task: string,
    public label: string,
    public _id?: string,
  ) {}
}

export class User {
  constructor(
    public name: string,
    public email: string,
    public password: string,
    public _id?: string,
  ) {}
}

export class Workspace {
  constructor(
    public name: string,
    public createdBy: string,
    public _id?: string,
  ) {}
}

export class WorkspaceMember {
  constructor(
    public workspace: string,
    public user: string,
    public role: string,
    public approved: boolean,
    public pending: boolean,
    public userEmail: string,
    public _id?: string,
  ) {}
}
