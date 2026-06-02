import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FormsService } from '../services/forms.service';
import { CreateFormDto } from '../dto/create-form.dto';
import { UpdateFormDto } from '../dto/update-form.dto';
import { SaveFormFieldsDto } from '../dto/save-form-fields.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Forms & Custom Form Builder')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @Permissions('forms.create')
  @ApiOperation({ summary: 'Register a new dynamic form design template' })
  @ApiResponse({ status: 201, description: 'Form successfully registered' })
  async create(@Body() createFormDto: CreateFormDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.formsService.create(createFormDto, userId);
  }

  @Get()
  @Permissions('forms.view')
  @ApiOperation({ summary: 'List paginated custom form templates' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '20') {
    return this.formsService.findAll(parseInt(page, 10), parseInt(limit, 10));
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Fetch a single form structure for dynamic rendering by slug (Publicly accessible)' })
  @ApiResponse({ status: 200, description: 'Form layout details and fields' })
  @ApiResponse({ status: 404, description: 'Form slug not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.formsService.findBySlug(slug);
  }

  @Get(':id')
  @Permissions('forms.view')
  @ApiOperation({ summary: 'Get details and fields of a single custom form' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.findOne(id);
  }

  @Put(':id')
  @Permissions('forms.edit')
  @ApiOperation({ summary: 'Modify form meta settings' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFormDto: UpdateFormDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.formsService.update(id, updateFormDto, userId);
  }

  @Put(':id/fields')
  @Permissions('forms.edit')
  @ApiOperation({ summary: 'Overwrite custom Elementor Form fields layout' })
  async saveFields(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() saveFormFieldsDto: SaveFormFieldsDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.formsService.saveFields(id, saveFormFieldsDto, userId);
  }

  @Delete(':id')
  @Permissions('forms.delete')
  @ApiOperation({ summary: 'Soft-delete a form builder template' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.remove(id);
  }
}
