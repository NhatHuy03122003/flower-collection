import { Suspense } from "react";
import { HelpCircle, Shield } from "lucide-react";

import { CollectionHeader } from "@/components/navigation/collection-header";
import { CollectionToolbar } from "@/components/navigation/collection-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import {
  ADMIN_FAQ_ITEMS,
  FAQ_ITEMS,
  GUEST_FAQ_ITEMS,
  type GuideFaqItem,
} from "@/lib/guide-content";

export const metadata = {
  title: "Câu hỏi thường gặp — Hội ROSE Flower Collection",
};

function FaqSection({
  id,
  title,
  items,
  isAdminSection = false,
}: {
  id: string;
  title: string;
  items: GuideFaqItem[];
  isAdminSection?: boolean;
}) {
  const Icon = isAdminSection ? Shield : HelpCircle;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={
        isAdminSection
          ? "scroll-mt-32 space-y-3 border-t border-rose-200/80 pt-6"
          : "scroll-mt-32 space-y-3"
      }
    >
      <div className="flex items-center gap-2">
        <Icon aria-hidden="true" className="size-5 text-rose-700" />
        <h2
          id={`${id}-heading`}
          className="text-base font-bold tracking-tight text-rose-950 sm:text-lg"
        >
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Card
            key={item.question}
            className="gap-0 rounded-xl border border-rose-200/80 bg-white p-0 shadow-sm ring-0"
          >
            <CardContent className="space-y-1.5 p-4">
              <h3 className="text-sm font-semibold text-rose-950">
                {item.question}
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                {item.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

async function RoleBasedFaqContent() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <FaqSection
        id="faq-guest"
        title="Câu hỏi thường gặp"
        items={GUEST_FAQ_ITEMS}
      />
    );
  }

  return (
    <>
      <FaqSection
        id="faq-user"
        title={
          user.role === "ADMIN"
            ? "Câu hỏi thường gặp (Dành cho người dùng)"
            : "Câu hỏi thường gặp"
        }
        items={FAQ_ITEMS}
      />

      {user.role === "ADMIN" ? (
        <FaqSection
          id="faq-admin"
          title="Câu hỏi thường gặp (Dành cho Admin)"
          items={ADMIN_FAQ_ITEMS}
          isAdminSection
        />
      ) : null}
    </>
  );
}

export default function GuidePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6d8e1] font-sans text-slate-800">
      <CollectionHeader />
      <Suspense fallback={null}>
        <CollectionToolbar />
      </Suspense>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-3 py-5 sm:px-5 sm:py-6">
        <section className="rounded-2xl border border-rose-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <HelpCircle aria-hidden="true" className="size-5" />
            </span>
            <div className="space-y-1">
              <h1 className="text-lg font-bold tracking-tight text-rose-950 sm:text-xl">
                Câu hỏi thường gặp (FAQ)
              </h1>
              <p className="text-sm leading-relaxed text-slate-600">
                Giải đáp nhanh các thắc mắc thường gặp khi sử dụng Hội ROSE
                Flower Collection theo đúng quyền tài khoản của bạn.
              </p>
            </div>
          </div>
        </section>

        <Suspense fallback={null}>
          <RoleBasedFaqContent />
        </Suspense>
      </main>
    </div>
  );
}
