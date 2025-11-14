import { HttpInterceptorFn } from '@angular/common/http';

export const jenkinsInterceptor: HttpInterceptorFn = (req, context) => {
  // Only intercept Jenkins API calls
  if (req.url.includes('/jenkins/') || req.url.includes('localhost:8080')) {
    const auth = btoa('admin:eyaelouni');
    const clonedRequest = req.clone({
      setHeaders: {
        'Authorization': `Basic ${auth}`
      }
    });
    return context(clonedRequest);
  }

  return context(req);
};
