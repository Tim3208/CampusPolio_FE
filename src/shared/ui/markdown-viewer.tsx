import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/shared/lib/utils";
import { MarkdownImage } from "@/shared/ui/markdown-image";

const components: Components = {
  /** GFM 표를 본문 폭 안의 가로 스크롤 영역에 표시한다. */
  table({ children }) {
    return <div className="campus-markdown-table"><table>{children}</table></div>;
  },
  /** 동적 이미지의 오류 처리만 작은 클라이언트 조각에 위임한다. */
  img({ src, alt, title }) {
    return <MarkdownImage src={typeof src === "string" ? src : undefined} alt={alt} title={title} />;
  },
};

/** 원문 저장 형식을 유지하며 일반 Markdown과 GFM을 서버에서 읽기 전용으로 표시한다. */
export function MarkdownViewer({ content, className }: { content: string; className?: string }) {
  return <div className={cn("campus-markdown min-w-0 max-w-[720px]", className)}><ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>{content}</ReactMarkdown></div>;
}
