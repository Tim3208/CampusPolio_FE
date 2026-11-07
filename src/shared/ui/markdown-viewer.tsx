import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Element, ElementContent, Root, RootContent } from "hast";
import { cn } from "@/shared/lib/utils";
import { MarkdownImage } from "@/shared/ui/markdown-image";

/** 읽기 전용 작업 목록의 체크박스에 해당 항목의 텍스트를 이름으로 연결한다. */
function labelTaskListItems() {
  /** 중첩 목록은 별도 항목이므로 부모 항목의 이름에서 제외한다. */
  function labelItem(item: Element) {
    const result: { checkbox?: Element } = {};
    const parts: string[] = [];

    /** 항목의 표시 텍스트와 GFM 체크박스를 찾는다. */
    function collect(node: ElementContent) {
      if (node.type === "text") {
        parts.push(node.value);
      } else if (node.type === "element") {
        if (node.tagName === "ul" || node.tagName === "ol") return;
        if (node.tagName === "input" && node.properties.type === "checkbox") {
          result.checkbox ??= node;
          return;
        }
        if (node.tagName === "img" && typeof node.properties.alt === "string") {
          parts.push(node.properties.alt);
        }
        node.children.forEach(collect);
      }
    }

    item.children.forEach(collect);
    if (result.checkbox) result.checkbox.properties.ariaLabel = parts.join("").replace(/\s+/g, " ").trim() || "내용 없는 작업 항목";
  }

  return (tree: Root) => {
    /** 트리에서 GFM 작업 목록 항목을 찾는다. */
    function visit(children: RootContent[] | ElementContent[]) {
      children.forEach((node) => {
        if (node.type !== "element") return;
        if (node.tagName === "li" && Array.isArray(node.properties.className) && node.properties.className.includes("task-list-item")) {
          labelItem(node);
        }
        visit(node.children);
      });
    }

    visit(tree.children);
  };
}

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
  return <div className={cn("campus-markdown min-w-0 max-w-[720px]", className)}><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[labelTaskListItems]} components={components} skipHtml>{content}</ReactMarkdown></div>;
}
