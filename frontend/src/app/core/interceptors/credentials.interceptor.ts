import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const CredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Add withCredentials: true to all requests to our API
  if (req.url.includes(environment.apiBaseUrl)) {
    const credentialsReq = req.clone({
      withCredentials: true
    });
    return next(credentialsReq);
  }
  
  return next(req);
};