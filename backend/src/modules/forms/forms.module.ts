import { Module } from '@nestjs/common';
import { FormsService } from './services/forms.service';
import { SubmissionsService } from './services/submissions.service';
import { FormsController } from './controllers/forms.controller';
import { SubmissionsController } from './controllers/submissions.controller';
import { FormRepository } from './repositories/form.repository';
import { FormSubmissionRepository } from './repositories/form-submission.repository';

@Module({
  controllers: [FormsController, SubmissionsController],
  providers: [
    FormsService,
    SubmissionsService,
    FormRepository,
    FormSubmissionRepository,
  ],
  exports: [
    FormsService,
    SubmissionsService,
    FormRepository,
    FormSubmissionRepository,
  ],
})
export class FormsModule {}
