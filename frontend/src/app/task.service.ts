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

  getTasks(listId: string): Observable<Task[]> {
    return this.webReqService.get<Task[]>(`lists/${listId}/tasks`);
  }
  createTask(title: string, listId: string): Observable<Task> {
    // We want to send a web request to create a new-task
    return this.webReqService.post(`lists/${listId}/tasks`, { title }) as Observable<Task>;
  }

  complete(task: Task) {
    return this.webReqService.patch<Task[]>(`lists/${task._listId}/tasks/${task._id}`, {
      completed: !task.completed
    });
  }

}