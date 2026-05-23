import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { appRoutes } from "@/shared/config";
import { Button } from "@/shared/ui/button";

export function HomePage() {
  return (
    <main className="flex flex-1 bg-background">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:px-10">
        <Button asChild className="w-full md:w-auto">
          <Link href={appRoutes.login}>
            <ArrowRight aria-hidden="true" />
            로그인하기
          </Link>
        </Button>
      </section>
    </main>
  );
}
