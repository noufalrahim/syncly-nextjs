export class Project {
  constructor(
    public name: string,
    public workspace: string,
    public createdBy: string,
    public emoji: string,
    public _id?: string,
  ) {}
}
