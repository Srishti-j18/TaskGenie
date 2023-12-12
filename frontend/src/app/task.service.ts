import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Observable } from 'rxjs';
import { List } from './models/list.model';
import { Task } from './models/task.model';
import { NewTaskComponent } from './pages/new-task/new-task.component';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) { }


  getLists(): Observable<List[]> {
    return this.webReqService.get<List[]>('lists');
  }

  createList(title: string): Observable<List> {
    // We want to send a web request to create a list
    return this.webReqService.post('lists', { title }) as Observable<List>;
  }

  updateList(listId: string, title: string): Observable<List> {
    // We want to send a web request to update a list
    return this.webReqService.patch(`lists/${listId}`, { title }) as Observable<List>;
  }

  deleteList(id: string): Observable<List> {
    return this.webReqService.delete<List>(`lists/${id}`);

  }

  getTasks(listId: string): Observable<Task[]> {
    return this.webReqService.get<Task[]>(`lists/${listId}/tasks`);
  }
  createTask(title: string, listId: string): Observable<Task> {
    // We want to send a web request to create a new-task
    return this.webReqService.post(`lists/${listId}/tasks`, { title }) as Observable<Task>;
  }
  updateTask(listId: string, taskId: string, title: string): Observable<Task> {
    // We want to send a web request to update a list
    return this.webReqService.patch(`lists/${listId}/tasks/${taskId}`, { title }) as Observable<Task>;
  }

  deleteTask(listId: string, taskId: string): Observable<List> {
    return this.webReqService.delete<List>(`lists/${listId}/tasks/${taskId}`);

  }

  complete(task: Task) {
    return this.webReqService.patch<Task[]>(`lists/${task._listId}/tasks/${task._id}`, {
      completed: !task.completed
    });
  }

}