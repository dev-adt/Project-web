import { Injectable, NotFoundException } from '@nestjs/common';
import { SeoRepository } from '../repositories/seo.repository';
import { UpdateSeoDto } from '../dto/update-seo.dto';
import { UpdateRobotsDto } from '../dto/update-robots.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeoService {
  private readonly configPath = path.join(__dirname, '..', 'config', 'robots-settings.json');

  constructor(private readonly seoRepository: SeoRepository) {
    // Ensure config directory exists
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async getSitemap() {
    const { pages, posts } = await this.seoRepository.getSitemapData();
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost';

    const sitemapLinks: Array<{ url: string; lastmod: string }> = [];

    // Map active pages
    pages.forEach((page) => {
      sitemapLinks.push({
        url: `${APP_URL}/${page.slug === 'home' ? '' : page.slug}`,
        lastmod: page.updatedAt.toISOString(),
      });
    });

    // Map published blog posts
    posts.forEach((post) => {
      sitemapLinks.push({
        url: `${APP_URL}/blog/${post.slug}`,
        lastmod: post.updatedAt.toISOString(),
      });
    });

    return { links: sitemapLinks };
  }

  async getRobots() {
    if (fs.existsSync(this.configPath)) {
      try {
        const raw = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse robots config:', err);
      }
    }

    // Default configuration rules
    return {
      rules: [
        {
          userAgent: '*',
          disallow: ['/api/v1/auth', '/admin'],
          allow: ['/'],
        },
      ],
      sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost'}/sitemap.xml`,
    };
  }

  async updateRobots(updateRobotsDto: UpdateRobotsDto) {
    fs.writeFileSync(this.configPath, JSON.stringify(updateRobotsDto, null, 2), 'utf8');
    return this.getRobots();
  }

  async updateMetadata(id: string, updateSeoDto: UpdateSeoDto) {
    const existing = await this.seoRepository.findSeoById(id);
    if (!existing) {
      throw new NotFoundException(`SEO metadata record with ID ${id} not found.`);
    }

    return this.seoRepository.updateSeo(id, {
      metaTitle: updateSeoDto.metaTitle,
      metaDescription: updateSeoDto.metaDescription,
      metaKeywords: updateSeoDto.metaKeywords,
      ogTitle: updateSeoDto.ogTitle,
      ogDescription: updateSeoDto.ogDescription,
      ogImage: updateSeoDto.ogImage,
      canonicalUrl: updateSeoDto.canonicalUrl,
      schemaJson: updateSeoDto.schemaJson !== undefined ? updateSeoDto.schemaJson : undefined,
    });
  }
}
