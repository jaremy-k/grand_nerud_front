import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserDto } from "@definitions/dto";
import type { CrmOwnerScope } from "./owner-scope";
import { userName } from "./utils";

export default function OwnerScopeSelect({ scope, onChange, owners, id }: {
  scope: CrmOwnerScope;
  onChange: (value: string) => void;
  owners: UserDto[];
  id: string;
}) {
  const hasSelected = owners.some((owner) => `owner:${owner.id || owner._id}` === scope.value);
  return (
    <div className="grid min-w-0 gap-1.5">
      <Label htmlFor={id}>Ответственный</Label>
      <Select value={scope.value} onValueChange={onChange} disabled={!scope.elevated}>
        <SelectTrigger id={id}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="mine">Мои</SelectItem>
          {scope.elevated && <SelectItem value="team">Вся команда</SelectItem>}
          {scope.elevated && owners.filter((owner) => owner.id || owner._id).map((owner) => (
            <SelectItem key={owner.id || owner._id} value={`owner:${owner.id || owner._id}`}>{userName(owner)}</SelectItem>
          ))}
          {scope.value.startsWith("owner:") && !hasSelected && <SelectItem value={scope.value}>Выбранный сотрудник</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );
}
