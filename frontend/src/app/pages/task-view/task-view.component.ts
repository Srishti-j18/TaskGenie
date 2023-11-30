import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TaskService } from 'src/app/task.service';
import { List } from 'src/app/models/list.model';
import { Task } from 'src/app/models/task.model';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  lists: List[] = [];
  tasks: Task[] = [];

  constructor(private taskService: TaskService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {

        // Check if listId is defined before making the request
        if (params['listId']) {
          this.taskService.getTasks(params['listId']).subscribe((tasks: Task[]) => {
            this.tasks = tasks;
          });
        }
      }
    )

    this.taskService.getLists().subscribe((lists: List[]) => {
      this.lists = lists;

    });

  }

  onTaskClick(task: Task) {
    // we want to set the task is completed
    this.taskService.complete(task).subscribe(() => {
      // Task is completed successfully.
      console.log("completed");
      task.completed = !task.completed;
    });
  }
}
