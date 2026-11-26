import { getCurrentUser } from "@/lib/current-user";

import { CollectionToolbarNav } from "./collection-toolbar-nav";

export async function CollectionToolbar() {
  const user = await getCurrentUser();

  return <CollectionToolbarNav role={user?.role ?? null} />;
}
