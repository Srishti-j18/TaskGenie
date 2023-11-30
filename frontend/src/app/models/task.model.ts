export class Task {
    _id: string;
    _listId: string;
    title: string;
    completed: boolean;

    constructor(_id: string, _listId: string, title: string, completed: boolean) {
        this._id = _id;
        this._listId = _listId;
        this.title = title;
        this.completed = completed;
    }
}
