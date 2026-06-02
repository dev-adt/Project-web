import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './database/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PagesModule } from './modules/pages/pages.module';
import { MediaModule } from './modules/media/media.module';
import { BlogModule } from './modules/blog/blog.module';
import { FormsModule } from './modules/forms/forms.module';
import { SeoModule } from './modules/seo/seo.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PluginsModule } from './modules/plugins/plugins.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    PagesModule,
    MediaModule,
    BlogModule,
    FormsModule,
    SeoModule,
    AnalyticsModule,
    PluginsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

