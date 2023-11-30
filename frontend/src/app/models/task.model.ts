export class Task {
    _id: string;
    _listId: string;
    title: string;

    constructor(_id: string, _listId: string, title: string) {
        this._id = _id;
        this._listId = _listId;
        this.title = title;
    }
}
