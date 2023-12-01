import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private webService: WebRequestService, private router: Router) { }

  login(email: string, password: string) {
    return this.webService.login(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // the auth tokens will be in the header of this response
        const userId = res.body._id;
        const accessToken = res.headers.get('x-access-token');
        const refreshToken = res.headers.get('x-refresh-token');

        if (userId && accessToken && refreshToken) {
          this.setSession(userId, accessToken, refreshToken);
          console.log("LoggedIn");


        } else {
          // Handle the case when one of the tokens is null
          console.error("Invalid response format");
        }
      })
    )
  }
  logout() {
    this.removeSession();
  }

  private setSession(userId: string, accessToken: string, refreshToken: string) {
    localStorage.setItem('userId', userId);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
  private removeSession() {
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }


}
