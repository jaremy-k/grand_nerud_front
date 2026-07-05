"use client";

import { Page } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useAuthContext from "@/contexts/auth-context";
import {
  createUser,
  DEFAULT_USER_PROFIT,
  getUsers,
  updateUser,
  UserProfit,
} from "@/services/users";
import { UserDto } from "@definitions/dto";
import { KeyRoundIcon, PencilIcon, PlusIcon, UsersIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type UserFormState = {
  email: string;
  password: string;
  name: string;
  lastName: string;
  fatherName: string;
  admin: boolean;
  manager: boolean;
  profit: UserProfit;
};

function emptyForm(): UserFormState {
  return {
    email: "",
    password: "",
    name: "",
    lastName: "",
    fatherName: "",
    admin: false,
    manager: false,
    profit: profitToPercents({ ...DEFAULT_USER_PROFIT }),
  };
}

function userToForm(user: UserDto): UserFormState {
  return {
    email: user.email ?? "",
    password: "",
    name: user.name ?? "",
    lastName: user.lastName ?? "",
    fatherName: user.fatherName ?? "",
    admin: Boolean(user.admin),
    manager: Boolean(user.manager),
    profit: user.profit ?? { ...DEFAULT_USER_PROFIT },
  };
}

function displayName(user: UserDto): string {
  const parts = [user.lastName, user.name, user.fatherName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "—";
}

function canManageUsers(user: UserDto | null): boolean {
  return Boolean(user?.admin || user?.manager);
}

function RoleBadges({ user }: { user: UserDto }) {
  const roles: Array<{ label: string; className: string }> = [];
  if (user.admin) {
    roles.push({
      label: "Админ",
      className: "bg-primary/10 text-primary",
    });
  }
  if (user.manager) {
    roles.push({
      label: "Руководитель",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    });
  }
  if (roles.length === 0) {
    return <span className="text-muted-foreground text-sm">Пользователь</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <span
          key={role.label}
          className={`rounded px-2 py-0.5 text-xs font-medium ${role.className}`}
        >
          {role.label}
        </span>
      ))}
    </div>
  );
}

function profitFromPercents(form: UserFormState): UserProfit {
  const pct = (value: string) => Number(value) / 100;
  return {
    cash: {
      alone: pct(String(form.profit.cash.alone)),
      withPartners: pct(String(form.profit.cash.withPartners)),
    },
    nonCash: {
      alone: pct(String(form.profit.nonCash.alone)),
      withPartners: pct(String(form.profit.nonCash.withPartners)),
    },
  };
}

function profitToPercents(profit: UserProfit): UserProfit {
  const pct = (value: number) => Math.round(value * 1000) / 10;
  return {
    cash: {
      alone: pct(profit.cash.alone),
      withPartners: pct(profit.cash.withPartners),
    },
    nonCash: {
      alone: pct(profit.nonCash.alone),
      withPartners: pct(profit.nonCash.withPartners),
    },
  };
}

function ProfitFields({
  profit,
  onChange,
}: {
  profit: UserProfit;
  onChange: (profit: UserProfit) => void;
}) {
  const update = (
    group: "cash" | "nonCash",
    field: "alone" | "withPartners",
    value: string
  ) => {
    onChange({
      ...profit,
      [group]: {
        ...profit[group],
        [field]: value === "" ? 0 : Number(value),
      },
    });
  };

  const rows: Array<{
    group: "cash" | "nonCash";
    field: "alone" | "withPartners";
    label: string;
  }> = [
    { group: "cash", field: "alone", label: "Наличные, один" },
    { group: "cash", field: "withPartners", label: "Наличные, с партнёрами" },
    { group: "nonCash", field: "alone", label: "Безнал, один" },
    { group: "nonCash", field: "withPartners", label: "Безнал, с партнёрами" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map(({ group, field, label }) => (
        <div key={`${group}-${field}`} className="space-y-1">
          <Label>{label}, %</Label>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={profit[group][field]}
            onChange={(e) => update(group, field, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const isAdmin = Boolean(user?.admin);
  const canManage = canManageUsers(user);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [newPassword, setNewPassword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await getUsers());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить пользователей"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canManage) {
      navigate("/deals", { replace: true });
      return;
    }
    void load();
  }, [canManage, navigate, load]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm());
    setMessage("");
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (selected: UserDto) => {
    const formState = userToForm(selected);
    setEditingUser(selected);
    setForm({
      ...formState,
      profit: profitToPercents(formState.profit),
    });
    setMessage("");
    setError("");
    setDialogOpen(true);
  };

  const openResetPassword = (selected: UserDto) => {
    setEditingUser(selected);
    setNewPassword("");
    setMessage("");
    setError("");
    setResetPasswordOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const profit = profitFromPercents(form);
      if (editingUser) {
        const id = editingUser.id ?? editingUser._id ?? "";
        const payload = {
          email: form.email,
          name: form.name || undefined,
          lastName: form.lastName || undefined,
          fatherName: form.fatherName || undefined,
          admin: form.admin,
          profit,
        };
        await updateUser(id, payload);
        setMessage("Пользователь обновлён");
      } else {
        if (!form.password || form.password.length < 6) {
          throw new Error("Пароль должен быть не короче 6 символов");
        }
        await createUser({
          email: form.email,
          password: form.password,
          name: form.name || undefined,
          lastName: form.lastName || undefined,
          fatherName: form.fatherName || undefined,
          admin: form.admin,
          profit,
        });
        setMessage("Пользователь создан");
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!editingUser) return;
    if (newPassword.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const id = editingUser.id ?? editingUser._id ?? "";
      await updateUser(id, { password: newPassword });
      setResetPasswordOpen(false);
      setMessage("Пароль обновлён");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сменить пароль");
    } finally {
      setSaving(false);
    }
  };

  if (!user?.admin) {
    return null;
  }

  return (
    <Page
      breadcrumbLinks={[
        { label: "Сделки", href: "/deals" },
        { label: "Пользователи", href: "/admin/users" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <UsersIcon className="h-6 w-6" />
            Пользователи
          </h1>
          <Button onClick={openCreate}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Создать
          </Button>
        </div>

        {error && !dialogOpen && !resetPasswordOpen && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {message && (
          <p className="text-sm text-green-600">{message}</p>
        )}

        <div className="rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>ФИО</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Пользователей пока нет
                  </TableCell>
                </TableRow>
              ) : (
                users.map((item) => {
                  const id = item.id ?? item._id ?? item.email;
                  return (
                    <TableRow key={id}>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{displayName(item)}</TableCell>
                      <TableCell>
                        {item.admin ? (
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Админ
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Менеджер
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(item)}
                          >
                            <PencilIcon className="mr-1 h-3.5 w-3.5" />
                            Изменить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openResetPassword(item)}
                          >
                            <KeyRoundIcon className="mr-1 h-3.5 w-3.5" />
                            Пароль
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Редактирование пользователя" : "Новый пользователь"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {!editingUser && (
              <div className="space-y-1">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fatherName">Отчество</Label>
                <Input
                  id="fatherName"
                  value={form.fatherName}
                  onChange={(e) =>
                    setForm({ ...form, fatherName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Администратор</p>
                <p className="text-muted-foreground text-xs">
                  Доступ к админ-разделам и управлению пользователями
                </p>
              </div>
              <Switch
                checked={form.admin}
                onCheckedChange={(checked) =>
                  setForm({ ...form, admin: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Доля менеджера, %</p>
              <ProfitFields
                profit={form.profit}
                onChange={(profit) => setForm({ ...form, profit })}
              />
            </div>

            {error && dialogOpen && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Сброс пароля</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-muted-foreground text-sm">
              {editingUser?.email}
            </p>
            <div className="space-y-1">
              <Label htmlFor="newPassword">Новый пароль</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
              />
            </div>
            {error && resetPasswordOpen && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetPasswordOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleResetPassword} disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить пароль"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
