import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SubmissionsService } from '../services/submissions.service';
import { SubmitFormDto } from '../dto/submit-form.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Request, Response } from 'express';

@ApiTags('Form Submissions Management')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Public()
  @Post('slug/:slug/submit')
  @ApiOperation({ summary: 'Submit dynamic form values publicly' })
  @ApiResponse({ status: 201, description: 'Form submission logged successfully' })
  async submit(
    @Param('slug') slug: string,
    @Body() submitFormDto: SubmitFormDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.submissionsService.submit(slug, submitFormDto, ipAddress, userAgent);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('form/:formId')
  @Permissions('submissions.view')
  @ApiOperation({ summary: 'List paginated submission logs for a form' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async getSubmissions(
    @Param('formId', ParseUUIDPipe) formId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.submissionsService.getSubmissions(formId, parseInt(page, 10), parseInt(limit, 10));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('form/:formId/export')
  @Permissions('submissions.view')
  @ApiOperation({ summary: 'Export submissions spreadsheet as CSV attachment download' })
  async exportCSV(
    @Param('formId', ParseUUIDPipe) formId: string,
    @Res() res: Response,
  ) {
    const { filename, csv } = await this.submissionsService.exportCSV(formId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Add BOM character to enable Excel to automatically read UTF-8 columns perfectly!
    res.write('\uFEFF');
    res.write(csv);
    res.end();
  }
}
