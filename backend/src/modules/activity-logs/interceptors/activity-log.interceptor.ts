import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityLogsService } from '../services/activity-logs.service';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(private readonly logsService: ActivityLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;
    const userAgent = request.headers['user-agent'];

    // Log only modifying actions (POST, PUT, DELETE)
    const isWriteAction = ['POST', 'PUT', 'DELETE'].includes(method);
    const isLogsRoute = url.includes('/activity-logs');
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/refresh');

    return next.handle().pipe(
      tap({
        next: () => {
          // Verify user session context is present (indicating logged-in operator)
          if (isWriteAction && !isLogsRoute && !isAuthRoute && user?.id) {
            const action = `${method} ${url.split('?')[0]}`;
            let details = '';

            if (url.includes('/pages')) {
              details = `Thao tác ${method === 'POST' ? 'khởi tạo' : method === 'PUT' ? 'cập nhật thiết kế' : 'xóa'} Landing Page`;
            } else if (url.includes('/posts')) {
              details = `Thao tác ${method === 'POST' ? 'tạo mới' : method === 'PUT' ? 'cập nhật' : 'xóa'} bài viết Blog`;
            } else if (url.includes('/media')) {
              details = `Thao tác ${method === 'POST' ? 'tải lên' : 'xóa'} tài nguyên Media`;
            } else if (url.includes('/forms')) {
              details = `Thao tác ${method === 'POST' ? 'khởi tạo' : method === 'PUT' ? 'cập nhật' : 'xóa'} biểu mẫu Form`;
            } else if (url.includes('/blocks')) {
              details = `Thao tác ${method === 'POST' ? 'tạo mới' : method === 'PUT' ? 'cập nhật' : 'xóa'} Block dùng chung`;
            } else {
              details = `Thực hiện hành động ghi dữ liệu (${method})`;
            }

            this.logsService.logAction({
              userId: user.id,
              action,
              details,
              ipAddress: ip,
              userAgent,
            }).catch((err) => console.error('Failed to record system audit log:', err));
          }
        },
      }),
    );
  }
}
