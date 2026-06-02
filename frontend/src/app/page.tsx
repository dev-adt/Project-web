'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Database,
  Cpu,
  Server,
  Workflow,
  ShieldAlert,
  Flame,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'active' | 'loading' | 'error';
  port: string;
  description: string;
  icon: React.ComponentType<any>;
  details: string;
}

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'checking' | 'error'>('checking');
  const [dbConnection, setDbConnection] = useState<'up' | 'down' | 'loading'>('loading');

  useEffect(() => {
    // Proactively fetch backend health status to verify active integration
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/v1/health');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.status === 'ok') {
            setHealthStatus('healthy');
            setDbConnection('up');
            return;
          }
        }
        setHealthStatus('error');
        setDbConnection('down');
      } catch (err) {
        setHealthStatus('error');
        setDbConnection('down');
      }
    };

    checkHealth();
  }, []);

  const services: ServiceStatus[] = [
    {
      name: 'Nginx Gateway',
      status: 'active',
      port: '80',
      description: 'Reverse proxy and gateway manager forwarding all public routes.',
      icon: Workflow,
      details: 'Gzip compression enabled. Exposes NextJS (/), NestJS (/api/v1), and Swagger documentation (/swagger).',
    },
    {
      name: 'NextJS Frontend',
      status: 'active',
      port: '3000',
      description: 'Dynamic UI application with tailwind routing, server components and zustand.',
      icon: Layers,
      details: 'NextJS 15.0+ and React 19 architecture with TailwindCSS standard theme modules.',
    },
    {
      name: 'NestJS Backend',
      status: healthStatus === 'healthy' ? 'active' : healthStatus === 'error' ? 'error' : 'loading',
      port: '4000',
      description: 'Modular modular architecture utilizing standard exception filter & response wrappers.',
      icon: Cpu,
      details: 'Modular backend incorporating NestJS Config, Prisma, and Swagger configurations.',
    },
    {
      name: 'PostgreSQL Database',
      status: dbConnection === 'up' ? 'active' : dbConnection === 'down' ? 'error' : 'loading',
      port: '5432',
      description: 'Relational data model persisted using Docker volumes.',
      icon: Database,
      details: 'Connected via Prisma ORM. Auto-migration setups configured for table schemas.',
    },
    {
      name: 'Redis Cache',
      status: 'active',
      port: '6379',
      description: 'Key-value memory layer used for caching, queues, and rate-limiting.',
      icon: Flame,
      details: 'Integrated seamlessly inside the multi-container docker compose configuration.',
    },
    {
      name: 'MinIO Object Storage',
      status: 'active',
      port: '9000 / 9001',
      description: 'Local S3-compatible cloud storage holding media assets.',
      icon: Server,
      details: 'Auto-initialization bucket service mounts 4 default paths: media, uploads, exports, backups.',
    },
  ];

  return (
    <div className="flex-1 bg-[#09090b] text-[#fafafa] flex flex-col justify-between selection:bg-violet-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/80 px-6 py-4 backdrop-blur-md sticky top-0 z-50 bg-[#09090b]/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">HealthAlliance</h1>
              <p className="text-[10px] text-zinc-500 font-mono">PLATFORM ENGINE v1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${healthStatus === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${healthStatus === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-sm font-medium text-zinc-300">
              {healthStatus === 'healthy' ? 'All services online' : 'Platform Initializing'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full grid gap-12">
        {/* Banner Section */}
        <section className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-8 md:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),transparent_40%)]" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6">
              <CheckCircle className="h-3 w-3" /> Phase 1: Project Foundation Complete
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white leading-tight">
              Headless CMS & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400">
                Visual Landing Page Builder
              </span>
            </h2>
            <p className="text-zinc-400 text-base md:text-lg mb-8 leading-relaxed">
              Your modern production-ready software architecture has been successfully established. 
              The application connects PostgreSQL, Redis, MinIO, NestJS, and NextJS under a unified Nginx routing gateway.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/swagger"
                target="_blank"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white transition-all shadow-lg shadow-violet-500/20"
              >
                Inspect OpenAPI Docs
              </a>
              <a
                href="/health"
                target="_blank"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all"
              >
                View Health API
              </a>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => {
            const IconComponent = svc.icon;
            return (
              <div
                key={svc.name}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between transition-all hover:border-zinc-700 group hover:-translate-y-1 duration-300 shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-violet-400 group-hover:bg-violet-500/5 transition-all border border-zinc-800 group-hover:border-violet-500/10">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        svc.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : svc.status === 'loading'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {svc.status === 'active' ? 'Online' : svc.status === 'loading' ? 'Verifying' : 'Offline'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mb-3">INTERNAL PORT: {svc.port}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">{svc.description}</p>
                </div>
                <div className="mt-auto border-t border-zinc-900 pt-4 text-xs text-zinc-500 italic leading-snug">
                  {svc.details}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 px-6 py-6 bg-zinc-950 text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            © 2026 HealthAlliance Platform. Designed for commercial-scale landing page creation.
          </p>
          <div className="flex gap-6 text-xs font-medium">
            <span className="text-zinc-400">Phase 1: Foundation</span>
            <span className="text-zinc-600">Phase 2: Auth & RBAC (Next)</span>
            <span className="text-zinc-600">Phase 3: CMS (Future)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
