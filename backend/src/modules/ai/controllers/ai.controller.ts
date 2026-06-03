import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AiService } from '../services/ai.service';

@ApiTags('AI Content Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate text content from prompt' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', example: 'Viết tiêu đề cho dịch vụ khám sức khỏe gia đình' },
        context: { type: 'string', example: 'Landing page Doctor Tai', nullable: true },
      },
      required: ['prompt'],
    },
  })
  async generate(
    @Body('prompt') prompt: string,
    @Body('context') context?: string,
  ) {
    if (!prompt) {
      throw new BadRequestException('Prompt is required');
    }
    const result = await this.aiService.generateText(prompt, context);
    return { success: true, text: result };
  }

  @Post('rewrite')
  @ApiOperation({ summary: 'Rewrite existing text with different style constraints' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'Chúng tôi làm web kéo thả' },
        style: { type: 'string', enum: ['professional', 'creative', 'shorten', 'expand'], example: 'professional' },
      },
      required: ['text', 'style'],
    },
  })
  async rewrite(
    @Body('text') text: string,
    @Body('style') style: 'professional' | 'creative' | 'shorten' | 'expand',
  ) {
    if (!text || !style) {
      throw new BadRequestException('Text and style are required');
    }
    const validStyles = ['professional', 'creative', 'shorten', 'expand'];
    if (!validStyles.includes(style)) {
      throw new BadRequestException(`Style must be one of: ${validStyles.join(', ')}`);
    }
    const result = await this.aiService.rewriteText(text, style);
    return { success: true, text: result };
  }

  @Post('translate')
  @ApiOperation({ summary: 'Translate text content to target language' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'Chào mừng quý khách đến với dịch vụ' },
        targetLang: { type: 'string', example: 'English' },
      },
      required: ['text', 'targetLang'],
    },
  })
  async translate(
    @Body('text') text: string,
    @Body('targetLang') targetLang: string,
  ) {
    if (!text || !targetLang) {
      throw new BadRequestException('Text and targetLang are required');
    }
    const result = await this.aiService.translateText(text, targetLang);
    return { success: true, text: result };
  }
}
