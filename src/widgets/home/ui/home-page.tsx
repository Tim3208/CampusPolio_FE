import Link from "next/link"
import { ArrowRight, CheckCircle2, Layers3 } from "lucide-react"

import { appRoutes } from "@/shared/config"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"

const stackItems = [
  "Next.js App Router",
  "Tailwind CSS v4",
  "shadcn/ui in shared/ui",
  "Practical FSD layers",
]

const layerItems = [
  { name: "app", detail: "Routing and providers" },
  { name: "widgets", detail: "Page composition" },
  { name: "features", detail: "User actions" },
  { name: "entities", detail: "Domain models" },
  { name: "shared", detail: "Reusable primitives" },
]

export function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 md:px-10">
        <header className="flex flex-col gap-5 border-b pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4">
              FSD starter
            </Badge>
            <h1 className="text-4xl font-semibold text-foreground md:text-6xl">
              CampusPolio
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
              Next.js, Tailwind CSS, shadcn/ui, and practical FSD boundaries are
              ready in one workspace.
            </p>
          </div>
          <Button asChild className="w-full md:w-auto">
            <Link href={appRoutes.login}>
              <ArrowRight aria-hidden="true" />
              로그인하기
            </Link>
          </Button>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="self-start">
            <CardHeader>
              <div>
                <CardTitle>Project foundation</CardTitle>
                <CardDescription>
                  Core tools are installed and wired for the first feature.
                </CardDescription>
              </div>
              <CardAction>
                <Badge>Ready</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {stackItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="size-4 shrink-0 text-emerald-600"
                    />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <p className="text-sm leading-6 text-muted-foreground">
                Keep route files thin, compose screens in widgets, and expose
                each slice through its public index.
              </p>
            </CardContent>
          </Card>

          <Card className="self-start">
            <CardHeader>
              <div>
                <CardTitle>Layer map</CardTitle>
                <CardDescription>
                  The starter structure follows an AI-readable FSD layout.
                </CardDescription>
              </div>
              <CardAction>
                <Layers3 aria-hidden="true" className="size-5 text-sky-600" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="divide-y rounded-md border">
                {layerItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <code className="rounded bg-muted px-2 py-1 text-sm">
                      src/{item.name}
                    </code>
                    <span className="text-right text-sm text-muted-foreground">
                      {item.detail}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
