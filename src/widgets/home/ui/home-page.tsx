"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
} from "lucide-react";

import { appRoutes } from "@/shared/config";

const categories = ["전체", "건축", "도예", "AI", "UX/UI", "Capstone"];

const featuredProjects = [
  {
    title: "지속 가능한 도시주의 2026",
    category: "건축",
    author: "김민지",
    likes: 128,
    views: "1.2k",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "식물 두루미리",
    category: "도예",
    author: "이서연",
    likes: 92,
    views: "842",
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "뉴럴 네트워크",
    category: "AI",
    author: "박정우",
    likes: 211,
    views: "2.4k",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "인터랙티브 캠퍼스 아카이브",
    category: "UX/UI",
    author: "윤소영",
    likes: 156,
    views: "1.7k",
    image:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "감정 기반 음악 추천 서비스",
    category: "Capstone",
    author: "최하린",
    likes: 184,
    views: "1.9k",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop",
  },
];

const projects = [
  {
    title: "일곱 컴퍼스의 컬러 자극",
    category: "미디어 아트",
    author: "정유진",
    likes: 77,
    views: "603",
    image:
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "기도로서의 고요: 현대적 명상",
    category: "조형",
    author: "한지우",
    likes: 64,
    views: "488",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "분산형 학습 실험",
    category: "공학",
    author: "강도윤",
    likes: 139,
    views: "1.1k",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
  },
];

export function HomePage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filteredFeaturedProjects =
    selectedCategory === "전체"
      ? featuredProjects
      : featuredProjects.filter(
          (project) => project.category === selectedCategory
        );

  const maxSlideIndex = Math.max(filteredFeaturedProjects.length - 3, 0);

  const handlePrev = () => {
    setSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setSlideIndex((prev) => Math.min(prev + 1, maxSlideIndex));
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSlideIndex(0);
  };

  return (
    <main className="min-h-screen bg-[#F5F8FB]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <section className="mb-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-950">주요 전시</h2>
              <p className="mt-2 text-sm text-slate-500">
                실시간으로 주목받는 학생들의 멋진 작품들을 살펴보세요.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={appRoutes.home}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#005E9C]"
              >
                전체 컬렉션 보기
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={handlePrev}
                disabled={slideIndex === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={handleNext}
                disabled={slideIndex === maxSlideIndex}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  selectedCategory === category
                    ? "bg-[#005E9C] text-white"
                    : "bg-white text-slate-500 hover:bg-slate-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredFeaturedProjects.length > 0 ? (
            <div className="overflow-hidden">
              <div
                className="flex gap-4 transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(calc(-${slideIndex} * (33.333% + 1rem)))`,
                }}
              >
                {filteredFeaturedProjects.map((project) => (
                  <FeaturedCard
                    key={project.title + project.category}
                    {...project}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-white p-10 text-center text-sm text-slate-500">
              해당 카테고리의 프로젝트가 없습니다.
            </div>
          )}
        </section>

        <section className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-950">
              프로젝트 모음
            </h2>

            <p className="mt-2 max-w-xl text-sm text-slate-500">
              여러 학생들의 프로젝트 작품을 볼 수 있는 공간입니다.
              오늘의 전시 보기나 주기별 큐레이션을 통해 새로운 영감을
              얻어보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg bg-[#006DAA] px-10 py-10 text-white shadow-sm">
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-center">
            <div>
              <p className="mb-3 text-xs font-semibold text-blue-100">
                모집 중인 프로젝트
              </p>

              <h2 className="text-3xl font-bold">
                2026-1학기 캡스톤디자인
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-blue-50">
                교과과정 중 습득한 전공 지식을 바탕으로 학생들이 스스로
                과제를 기획하고 수행하는 프로젝트입니다.
              </p>

              <div className="mt-7 flex gap-3">
                <button className="rounded-md bg-white px-5 py-2 text-xs font-semibold text-[#006DAA]">
                  작품 등록하기
                </button>

                <button className="rounded-md bg-white/15 px-5 py-2 text-xs font-semibold text-white">
                  자세히 보기
                </button>
              </div>
            </div>

            <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-white/10">
              <div className="absolute h-32 w-32 rounded-full bg-white/10" />

              <div className="z-10 text-center">
                <p className="text-3xl font-bold">14</p>
                <p className="text-xs text-blue-100">NEW</p>

                <div className="my-4 h-px bg-white/30" />

                <p className="text-3xl font-bold">250+</p>
                <p className="text-xs text-blue-100">TOTAL</p>
              </div>
            </div>
          </div>
        </section>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-xs text-slate-400">
          <p>© COPYRIGHT 2026. ALL RIGHTS RESERVED.</p>

          <div className="flex gap-6">
            <span>이용약관</span>
            <span>개인정보 처리방침</span>
            <span>문의하기</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

type FeaturedCardProps = {
  title: string;
  category: string;
  author: string;
  likes: number;
  views: string;
  image: string;
};

function FeaturedCard({
  title,
  category,
  author,
  likes,
  views,
  image,
}: FeaturedCardProps) {
  return (
    <article className="group relative min-w-[calc((100%-2rem)/3)] overflow-hidden rounded-lg bg-slate-900 shadow-sm">
      <div
        className="h-72 bg-cover bg-center transition duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${image})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <span className="w-fit rounded bg-[#005E9C] px-2 py-1 text-[10px] font-bold">
          {category}
        </span>

        <h3 className="mt-3 text-xl font-bold">{title}</h3>

        <p className="mt-1 text-xs text-white/70">by {author}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-white/80">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {likes}
          </span>

          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {views}
          </span>
        </div>

        <div className="mt-5 translate-y-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900">
            자세히 보기
          </button>
        </div>
      </div>
    </article>
  );
}

type ProjectCardProps = {
  title: string;
  category: string;
  author: string;
  likes: number;
  views: string;
  image: string;
};

function ProjectCard({
  title,
  category,
  author,
  likes,
  views,
  image,
}: ProjectCardProps) {
  return (
    <article className="group overflow-hidden rounded-md bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative overflow-hidden">
        <div
          className="h-48 bg-cover bg-center transition duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />

        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/35" />

        <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900 opacity-0 transition group-hover:opacity-100">
          자세히 보기
        </button>
      </div>

      <div className="p-5">
        <span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#005E9C]">
          {category}
        </span>

        <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>

        <p className="mt-1 text-xs text-slate-400">by {author}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {likes}
          </span>

          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {views}
          </span>
        </div>
      </div>
    </article>
  );
}