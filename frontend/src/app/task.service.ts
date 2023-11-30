import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Observable } from 'rxjs';
import { List } from './models/list.model';
import { Task } from './models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) { }

  createList(title: string): Observable<List> {
    // We want to send a web request to create a list
    return this.webReqService.post('lists', { title }) as Observable<List>;
  }


  getLists(): Observable<List[]> {
    return this.webReqService.get<List[]>('lists');
  }



  getTasks(listId: string): Observable<Task[]> {
    return this.webReqService.get<Task[]>(`lists/${listId}/tasks`);
  }
}