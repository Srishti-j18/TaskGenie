import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { List } from 'src/app/models/list.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {
  constructor(private taskService: TaskService, private router: Router) { }

  ngOnInit() {


  }
  createList(title: string) {
    this.taskService.createList(title).subscribe((lists: List) => {
      console.log(lists);
      // Now we navigate to /lists/response._id
      this.router.navigate(['/lists', lists._id]);
    });
  }
}
