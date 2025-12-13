export class WorkspaceMember {
  constructor(
    public workspace: string,
    public user: string,
    public role: string,
    public _id?: string,
  ) {}
}
