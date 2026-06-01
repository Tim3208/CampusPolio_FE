import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Eye,
  FileText,
  Users,
} from "lucide-react";

import type { ProjectDetail } from "@/entities/project";
import { ProjectLikeButton } from "@/features/project-like";
import { appRoutes } from "@/shared/config";

type ProjectDetailPageProps = {
  project: ProjectDetail;
};

/**
 * 프로젝트 상세 화면을 피그마 시안에 맞는 본문 중심 레이아웃으로 렌더링한다.
 * @param project 화면에 표시할 프로젝트 상세 데이터
 */
export function ProjectDetailPage({ project }: ProjectDetailPageProps) {
  return (
    <main className="min-h-screen bg-[#F4F7FA] text-slate-950">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0">
          <Link
            href={appRoutes.home}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#005E9C] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            이전으로 돌아가기
          </Link>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm bg-[#DCEBFF] px-2 py-1 text-[10px] font-bold uppercase text-[#005E9C]"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.02] tracking-normal text-[#151B23] md:text-5xl">
            {project.title}
          </h1>

          <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-5 border-b border-slate-200 pb-6 text-[11px] uppercase text-slate-500 md:grid-cols-4">
            <div>
              <dt className="font-bold text-slate-400">Author</dt>
              <dd className="mt-1 normal-case text-slate-950">
                {project.author.name}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-400">Members</dt>
              <dd className="mt-1 normal-case text-slate-950">
                {project.members.map((member) => member.name).join(", ")}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-400">Published</dt>
              <dd className="mt-1 normal-case text-slate-950">
                {project.createdAt}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-400">Updated</dt>
              <dd className="mt-1 normal-case text-slate-950">
                {project.updatedAt}
              </dd>
            </div>
          </dl>

          <div className="relative mt-8 aspect-[16/8.5] w-full overflow-hidden rounded-md bg-slate-200 shadow-sm">
            <Image
              src={project.thumbnailUrl}
              alt={project.title}
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
              priority
            />
          </div>

          <p className="mt-8 max-w-3xl text-sm leading-7 text-slate-600">
            {project.content}
          </p>

          <div className="mt-8 space-y-10">
            {project.sections.map((section, index) => (
              <section key={section.sectionId}>
                <h2 className="text-base font-black text-[#151B23]">
                  {index + 1}. {section.title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  {section.content}
                </p>
                {section.imageUrl && (
                  <div className="relative mt-5 aspect-[16/5] w-full max-w-3xl overflow-hidden rounded-sm bg-[#151B23]">
                    <Image
                      src={section.imageUrl}
                      alt={section.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 760px"
                      className="object-cover opacity-90"
                    />
                  </div>
                )}
              </section>
            ))}
          </div>

          <section className="mt-14">
            <h2 className="text-base font-black text-[#151B23]">
              Related Scholastic Works
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {project.relatedWorks.map((relatedProject) => (
                <Link
                  key={relatedProject.projectId}
                  href={appRoutes.projectDetail(relatedProject.projectId)}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-slate-200">
                    <Image
                      src={relatedProject.imageUrl}
                      alt={relatedProject.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 260px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-3 text-sm font-black leading-snug text-[#151B23]">
                    {relatedProject.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {relatedProject.authorName} / 2026
                  </p>
                </Link>
              ))}
            </div>
          </section>

        </article>

        <aside className="lg:pt-24">
          <div className="sticky top-20 space-y-4">
            <section className="rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-[11px] font-black uppercase tracking-wide text-[#151B23]">
                Resources & Links
              </h2>
              <div className="mt-4 space-y-2">
                {project.resources.map((resource) => (
                  <a
                    key={resource.resourceId}
                    href={resource.href}
                    className="flex items-center justify-between rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#005E9C] hover:text-[#005E9C]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      {resource.title}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </section>

            <section className="rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <Image
                  src={project.author.profileImage}
                  alt={project.author.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-black text-[#151B23]">
                    {project.author.name}
                  </p>
                  <p className="text-xs text-slate-500">프로젝트 작성자</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {project.views}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {project.updatedAt}
                </span>
                <span className="col-span-2 inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {project.members.map((member) => member.name).join(", ")}
                </span>
              </div>

              <div className="mt-4">
                <ProjectLikeButton
                  initialLiked={project.isLiked}
                  initialLikeCount={project.likes}
                />
              </div>
            </section>
          </div>
        </aside>
      </section>

      <footer className="border-t border-slate-200 px-6 py-5 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p>COPYRIGHT 2026. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-4">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
