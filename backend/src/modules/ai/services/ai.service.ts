import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private geminiApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
  }

  /**
   * Universal fetch caller for Gemini API
   */
  private async callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.geminiApiKey) {
      return ''; // Fallback indicator
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;
      
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nYêu cầu cụ thể từ người dùng:\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Gemini API returned error status: ${response.status}`);
        return '';
      }

      const json = await response.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      return text ? text.trim() : '';
    } catch (err) {
      console.error('Failed to communicate with Gemini API:', err);
      return '';
    }
  }

  /**
   * Generates new text content
   */
  async generateText(prompt: string, context?: string): Promise<string> {
    const systemPrompt = `Bạn là chuyên gia viết bài quảng cáo và tối ưu hóa nội dung Landing Page. 
Nhiệm vụ của bạn là sinh ra một đoạn nội dung hấp dẫn, ngắn gọn, thu hút người xem dựa trên mô tả của người dùng. 
${context ? `Bối cảnh/Chủ đề của Landing Page: ${context}` : ''}
Hãy viết nội dung bằng Tiếng Việt trực diện, chuyên nghiệp, không dài dòng. Không trả về thêm bất kỳ văn bản giải thích nào khác ngoài nội dung cần hiển thị.`;

    const realResult = await this.callGemini(systemPrompt, prompt);
    if (realResult) return realResult;

    // Fallback Mock System
    return `Chào mừng đến với Giải Pháp Đột Phá! Chúng tôi cung cấp công nghệ giúp bạn tối ưu hóa hoạt động doanh nghiệp, tiết kiệm đến 50% thời gian và nhân lực. Bắt đầu ngay hôm nay để đón đầu xu thế chuyển đổi số cùng hàng ngàn khách hàng tin cậy.`;
  }

  /**
   * Rewrites existing text
   */
  async rewriteText(text: string, style: 'professional' | 'creative' | 'shorten' | 'expand'): Promise<string> {
    let systemPrompt = `Bạn là trợ lý biên tập nội dung chuyên nghiệp. Hãy viết lại đoạn văn bản được cung cấp. Không giải thích gì thêm, chỉ trả về nội dung đã chỉnh sửa.`;
    
    if (style === 'professional') {
      systemPrompt += `\nPhong cách: Chuyên nghiệp, nghiêm túc, thuyết phục và mang tính doanh nghiệp cao.`;
    } else if (style === 'creative') {
      systemPrompt += `\nPhong cách: Sáng tạo, độc đáo, nhiều năng lượng, kích thích sự tò mò.`;
    } else if (style === 'shorten') {
      systemPrompt += `\nYêu cầu: Rút gọn tối đa, súc tích, chỉ giữ lại thông tin cốt lõi quan trọng nhất (như một câu tiêu đề hoặc slogan).`;
    } else if (style === 'expand') {
      systemPrompt += `\nYêu cầu: Mở rộng chi tiết hơn, thêm luận điểm thuyết phục và mô tả sâu sắc hơn.`;
    }

    const realResult = await this.callGemini(systemPrompt, text);
    if (realResult) return realResult;

    // Fallback Mock
    if (style === 'shorten') {
      return text.length > 50 ? text.substring(0, 47) + '...' : text;
    }
    if (style === 'expand') {
      return `${text} - Đồng hành cùng bạn trên mọi hành trình phát triển doanh nghiệp bền vững, tối ưu hóa nguồn lực nội bộ và nâng cao năng lực cạnh tranh vượt trội trên thị trường toàn cầu.`;
    }
    if (style === 'creative') {
      return `✨ Đột phá giới hạn cùng chúng tôi! ${text} - Giải pháp thế hệ mới đánh thức mọi tiềm năng ẩn giấu của bạn!`;
    }
    return `[Chuyên nghiệp] Chúng tôi cam kết cung cấp giải pháp tối ưu nhất cho quý đối tác: ${text}`;
  }

  /**
   * Translates text to target languages
   */
  async translateText(text: string, targetLang: string): Promise<string> {
    const systemPrompt = `Bạn là chuyên gia dịch thuật đa ngôn ngữ. Hãy dịch đoạn văn bản được cung cấp sang ngôn ngữ: "${targetLang}". 
Chỉ trả về bản dịch chuẩn xác nhất, giữ nguyên ngữ cảnh tiếp thị của landing page, không thêm lời chào hay giải thích gì thêm.`;

    const realResult = await this.callGemini(systemPrompt, text);
    if (realResult) return realResult;

    // Fallback Mock
    const lang = targetLang.toLowerCase();
    if (lang.includes('english') || lang.includes('en')) {
      return `Welcome to the future of landing page creation. Optimize your workflow and maximize your conversion rates starting today.`;
    }
    if (lang.includes('japanese') || lang.includes('ja')) {
      return `ランディングページ作成の未来へようこそ。今日からワークフローを最適化し、コンバージョン率を最大化しましょう。`;
    }
    return `[Dịch sang ${targetLang}]: ${text}`;
  }
}
