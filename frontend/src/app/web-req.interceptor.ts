import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, empty, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  refreshingAccessToken: boolean = false;

  accessTokenRefreshed: Subject<void> = new Subject<void>();

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {

    // Handle the request

    request = this.addAuthHeader(request);

    // Call next() and handle the response
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);

        if (error.status === 401) {
          // 401 error so we are unauthorize
          this.authService.logout();
          // refresh the access token
          return this.refreshAccessToken()
            .pipe(
              switchMap(() => {
                request = this.addAuthHeader(request);
                return next.handle(request);
              }),
              catchError((err: any) => {
                console.log(err);

                return empty();

              })
            )

        }

        return throwError(error);
      })
    )
  }

  refreshAccessToken() {
    if (this.refreshingAccessToken) {
      return new Observable(observer => {
        this.accessTokenRefreshed.subscribe(() => {
          // this code will run when the access token has been refreshed
          observer.next();
          observer.complete();

        })
      })
    } else {

      this.refreshingAccessToken = true;
      // we want to call a method in the auth service to send a request to refresh the access token

      return this.authService.getNewAccessToken().pipe(
        tap(() => {

          console.log("Access Token Refreshed!");
          this.refreshingAccessToken = false;
          this.accessTokenRefreshed.next();

        })
      )
    }
  }

  addAuthHeader(request: HttpRequest<any>) {

    // get the access token
    const token = this.authService.getAccessToken();

    if (token) {
      // apend the access token to the request header

      return request.clone({
        setHeaders: {
          'x-access-token': token
        }
      })
    }
    return request;
  }

}
