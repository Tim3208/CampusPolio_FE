import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { appRoutes } from "@/shared/config";
import { Button } from "@/shared/ui/button";

export function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 md:px-10">
        <section className="rounded-3xl bg-muted px-8 py-14">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            CampusPolio
          </p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
            캠퍼스 안의 다양한 프로젝트를 한눈에 둘러보세요
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">
            전공, 관심사, 팀 프로젝트를 기반으로 만들어진 작품과 레퍼런스를 확인할 수 있습니다.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href={appRoutes.login}>
                로그인하기
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">주요 전시</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                지금 주목받는 대표 프로젝트를 확인해보세요.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <ProjectCard title="양자 컴퓨팅의 결정 격자" category="Featured" />
            <ProjectCard title="캠퍼스 폴리오 메인 전시" category="Exhibition" />
            <ProjectCard title="AI 기반 추천 프로젝트" category="Reference" />
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">프로젝트 모음</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                다양한 학생 프로젝트와 참고 자료를 둘러보세요.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ProjectCard title="서비스 기획 포트폴리오" category="Project" />
            <ProjectCard title="UX/UI 디자인 사례" category="Design" />
            <ProjectCard title="웹 프론트엔드 프로젝트" category="Frontend" />
            <ProjectCard title="캡스톤 디자인 결과물" category="Capstone" />
          </div>
        </section>
      </section>
    </main>
  );
}

type ProjectCardProps = {
  title: string;
  category: string;
};

function ProjectCard({ title, category }: ProjectCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{category}</p>
        <h3 className="mt-2 text-base font-semibold">{title}</h3>
      </div>
    </article>
  );
}