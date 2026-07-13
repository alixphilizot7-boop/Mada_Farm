"use client";

import { Button } from "@/components/ui";
import { markCapexOrderedAction, revertCapexToPlannedAction } from "./actions";
import { useI18n } from "@/components/i18n-provider";

export function MarkOrderedButton({ id }: { id: string }) {
  const { t } = useI18n();
  return (
    <form action={markCapexOrderedAction.bind(null, id)}>
      <Button type="submit" variant="secondary">
        {t.capex.markOrdered}
      </Button>
    </form>
  );
}

export function UndoPurchaseButton({ id }: { id: string }) {
  const { t } = useI18n();
  return (
    <form
      action={revertCapexToPlannedAction.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(t.capex.undoConfirm)) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="ghost">
        {t.capex.undoPurchase}
      </Button>
    </form>
  );
}
