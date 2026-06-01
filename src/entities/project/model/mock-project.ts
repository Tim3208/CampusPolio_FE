import type { ProjectDetail } from "./types";

export const mockProjectDetail: ProjectDetail = {
  projectId: 1,
  title: "지속 가능한 도시주의 2026",
  description:
    "노후 도심 속 유휴 공간을 친환경 커뮤니티 공간으로 전환하는 건축 캡스톤 프로젝트입니다.",
  content:
    "지속 가능한 도시주의 2026은 대학가 주변의 오래된 골목과 비어 있는 건축 자원을 다시 활용하는 방법을 제안합니다. 팀은 보행 동선, 일조량, 녹지 접근성, 지역 주민의 이용 패턴을 분석해 누구나 머물 수 있는 작은 공공 거점과 순환형 보행 네트워크를 설계했습니다.",
  thumbnailUrl:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1400&auto=format&fit=crop",
  author: {
    userId: 10,
    name: "박민지",
    profileImage:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=200&auto=format&fit=crop",
  },
  tags: ["건축", "도시재생", "Capstone", "지속가능성"],
  members: [
    {
      userId: 11,
      name: "이은서",
    },
    {
      userId: 12,
      name: "박지훈",
    },
  ],
  likes: 120,
  views: 540,
  isLiked: false,
  isPublic: true,
  createdAt: "2026-05-01",
  updatedAt: "2026-05-05",
  sections: [
    {
      sectionId: 1,
      title: "도시 맥락 조사와 공간 분석",
      content:
        "대상지는 캠퍼스와 주거지가 만나는 경계부로, 보행량은 많지만 머물 수 있는 공공 공간이 부족했습니다. 팀은 시간대별 유동 인구, 건물 그림자, 기존 녹지 위치를 조사하고 이를 바탕으로 열린 광장, 휴식 데크, 커뮤니티 프로그램이 연결되는 공간 구성을 도출했습니다.",
      imageUrl:
        "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1200&auto=format&fit=crop",
    },
    {
      sectionId: 2,
      title: "지속 가능한 재료와 순환 구조",
      content:
        "기존 건물의 일부 구조를 보존하고 재활용 목재, 저탄소 콘크리트, 모듈형 차양 시스템을 적용했습니다. 계절에 따라 빛과 바람을 조절할 수 있도록 입면을 계획해 에너지 사용을 줄이고, 향후 다른 장소에도 이전 가능한 구조를 목표로 설계했습니다.",
      imageUrl:
        "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop",
    },
  ],
  resources: [
    {
      resourceId: 1,
      title: "프로젝트 발표 PDF",
      href: "#",
    },
    {
      resourceId: 2,
      title: "GitHub Repository",
      href: "#",
    },
  ],
  relatedWorks: [
    {
      projectId: 2,
      title: "골목 정원을 통한 마을 회복 프로젝트",
      authorName: "이연우",
      imageUrl:
        "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=800&auto=format&fit=crop",
    },
    {
      projectId: 3,
      title: "지역 기억을 기록하는 도시 아카이브",
      authorName: "한지우",
      imageUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    },
  ],
};

/**
 * 프로젝트 상세 mock 데이터를 조회한다.
 * @param projectId 조회할 프로젝트 ID
 * @returns 프로젝트 상세 mock 데이터
 */
export function getMockProjectDetail(projectId: number): ProjectDetail {
  return {
    ...mockProjectDetail,
    projectId,
  };
}
