import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '../services/htpp-error-service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);
  
  return next(req).pipe(
    catchError((error) => errorHandler.handleError(error))
  );
};
