import { Button } from "@/components/ui";
import { markCapexOrderedAction, revertCapexToPlannedAction } from "./actions";

export function MarkOrderedButton({ id }: { id: string }) {
  return (
    <form action={markCapexOrderedAction.bind(null, id)}>
      <Button type="submit" variant="secondary">
        Mark ordered
      </Button>
    </form>
  );
}

export function UndoPurchaseButton({ id }: { id: string }) {
  return (
    <form action={revertCapexToPlannedAction.bind(null, id)}>
      <Button type="submit" variant="ghost">
        Undo purchase
      </Button>
    </form>
  );
}
