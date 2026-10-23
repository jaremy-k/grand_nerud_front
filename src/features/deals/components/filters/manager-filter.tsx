import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useAuthContext from "@/contexts/auth-context";
import { usersService } from "@/services";
import { useLatestRequest } from "@/hooks/use-latest-request";
import { userName } from "@/features/crm/utils";
import { Button } from "@/components/ui/button";
import { RotateCwIcon } from "lucide-react";

const loadOwners = (elevated: boolean) => elevated ? usersService.getUsers() : Promise.resolve([]);
export default function ManagerFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { user } = useAuthContext();
  const elevated = Boolean(user?.admin || user?.manager);
  const request = useLatestRequest(elevated, loadOwners);
  const owners = elevated ? request.data ?? [] : user ? [user] : [];
  return <div className="flex min-w-0 items-center gap-1"><Select value={value} onValueChange={onChange}>
    <SelectTrigger aria-label="Ответственный" className="w-full min-w-0 shadow-none"><SelectValue placeholder="Ответственный" /></SelectTrigger>
    <SelectContent><SelectItem value="all">{elevated ? "Все сотрудники" : "Мои сделки"}</SelectItem>{owners.filter((owner) => !owner.is_deleted && !owner.isDeleted).map((owner) => {
      const id = owner.id ?? owner._id; return id ? <SelectItem key={id} value={id}>{userName(owner)}</SelectItem> : null;
    })}</SelectContent>
  </Select>{request.error && <Button type="button" size="icon-sm" variant="ghost" title="Повторить загрузку сотрудников" aria-label="Повторить загрузку сотрудников" onClick={request.retry}><RotateCwIcon /></Button>}</div>;
}
