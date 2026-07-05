"use client";

import { Page } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DslReferencePanel } from "@/features/calculation-rules/components/dsl-reference-panel";
import { FormulaFieldCard } from "@/features/calculation-rules/components/formula-field-card";
import { TestResultsPanel } from "@/features/calculation-rules/components/test-results-panel";
import {
  buildLabelMap,
  toNamedLabels,
} from "@/features/calculation-rules/lib/formula-display";
import useAuthContext from "@/contexts/auth-context";
import {
  activateRule,
  CalculationRuleDto,
  createRule,
  FormulaField,
  getActiveRule,
  getDslDocs,
  listRules,
  testRules,
  updateRule,
  validateRules,
} from "@/services/calculation-rules";
import {
  CalculatorIcon,
  CheckCircle2Icon,
  PlusIcon,
  SaveIcon,
  ZapIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function emptyField(): FormulaField {
  return {
    name: "newField",
    label: "Новое поле",
    expression: "0",
    store: true,
  };
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function CalculationRulesAdminPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [rules, setRules] = useState<CalculationRuleDto[]>([]);
  const [activeRule, setActiveRule] = useState<CalculationRuleDto | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [fields, setFields] = useState<FormulaField[]>([]);
  const [dslDocs, setDslDocs] = useState<
    Awaited<ReturnType<typeof getDslDocs>> | null
  >(null);
  const [testOutput, setTestOutput] = useState<Record<string, number> | null>(
    null
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);
  const insertHandlerRef = useRef<
    ((text: string, cursorOffset?: number) => void) | null
  >(null);

  const load = useCallback(async (preserveId?: string | null) => {
    setLoading(true);
    try {
      const [rulesList, active, docs] = await Promise.all([
        listRules(),
        getActiveRule(),
        getDslDocs(),
      ]);
      setRules(rulesList);
      setActiveRule(active);
      setDslDocs(docs);
      const pickId = preserveId ?? selectedId;
      const current = rulesList.find((r) => r._id === pickId) || active;
      setSelectedId(current._id);
      setName(current.name);
      setFields(current.fields.map((f) => ({ ...f })));
    } catch (err) {
      setErrors([
        err instanceof Error ? err.message : "Не удалось загрузить правила",
      ]);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    if (!user?.admin) {
      navigate("/deals", { replace: true });
      return;
    }
    void load(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.admin, navigate]);

  const selectRule = (rule: CalculationRuleDto) => {
    setSelectedId(rule._id);
    setName(rule.name);
    setFields(rule.fields.map((f) => ({ ...f })));
    setActiveFieldIndex(0);
    setTestOutput(null);
    setErrors([]);
    setMessage("");
  };

  const updateField = (index: number, patch: Partial<FormulaField>) => {
    setFields((prev) =>
      prev.map((field, i) => (i === index ? { ...field, ...patch } : field))
    );
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
    setActiveFieldIndex((prev) =>
      prev >= index && prev > 0 ? prev - 1 : prev
    );
  };

  const handleValidate = async () => {
    setMessage("");
    const result = await validateRules(fields);
    setErrors(result.errors);
    setMessage(result.valid ? "Формулы корректны" : "Есть ошибки в формулах");
  };

  const handleTest = async () => {
    setMessage("");
    const result = await testRules({ fields });
    setErrors(result.errors);
    setTestOutput(result.results);
    setMessage(result.errors.length ? "Ошибка теста" : "Тест выполнен");
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setMessage("");
    try {
      const updated = await updateRule(selectedId, { name, fields });
      setMessage("Сохранено");
      setErrors([]);
      await load(selectedId);
      selectRule(updated);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Ошибка сохранения"]);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNewVersion = async () => {
    setSaving(true);
    setMessage("");
    try {
      const created = await createRule({
        name: `${name} (копия)`,
        fields,
        isActive: false,
      });
      setMessage(`Создана версия v${created.version}`);
      await load(selectedId);
      selectRule(created);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Ошибка создания"]);
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await activateRule(selectedId);
      setMessage("Набор активирован");
      await load(selectedId);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Ошибка активации"]);
    } finally {
      setSaving(false);
    }
  };

  const handleDslInsert = (text: string, cursorOffset?: number) => {
    insertHandlerRef.current?.(text, cursorOffset);
  };

  const activeField = fields[activeFieldIndex];
  const activeFieldLabel =
    activeField?.label?.trim() || activeField?.name || undefined;

  const labelByName = useMemo(
    () => buildLabelMap(fields, dslDocs?.variables),
    [fields, dslDocs?.variables]
  );

  const ruleFieldLabels = useMemo(
    () =>
      fields.map((f) => ({
        name: f.name,
        label: f.label?.trim() || f.name,
      })),
    [fields]
  );

  if (loading) {
    return (
      <Page
        breadcrumbLinks={[
          { label: "Сделки", href: "/deals" },
          { label: "Конструктор формул", href: "/admin/calculation-rules" },
        ]}
      >
        <div className="py-10 text-center text-muted-foreground">Загрузка…</div>
      </Page>
    );
  }

  const selectedRule = rules.find((r) => r._id === selectedId);

  return (
    <Page
      breadcrumbLinks={[
        { label: "Сделки", href: "/deals" },
        { label: "Конструктор формул", href: "/admin/calculation-rules" },
      ]}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <CalculatorIcon className="h-6 w-6" />
            Конструктор формул
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Python-подобный DSL. Расчёт выполняется на сервере; сделки сохраняют
            версию правил и записанный НДС.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleValidate}>
            <CheckCircle2Icon className="mr-2 h-4 w-4" />
            Проверить
          </Button>
          <Button variant="outline" onClick={handleTest}>
            <ZapIcon className="mr-2 h-4 w-4" />
            Тест
          </Button>
          <Button onClick={handleSave} disabled={saving || !selectedId}>
            <SaveIcon className="mr-2 h-4 w-4" />
            Сохранить
          </Button>
          <Button
            variant="secondary"
            onClick={handleSaveNewVersion}
            disabled={saving}
          >
            Новая версия
          </Button>
          {selectedRule && !selectedRule.isActive && (
            <Button variant="default" onClick={handleActivate} disabled={saving}>
              Активировать
            </Button>
          )}
        </div>
      </div>

      {message && <p className="mb-4 text-sm text-primary">{message}</p>}
      {errors.length > 0 && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {errors.map((err) => (
            <div key={err}>{err}</div>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[240px_1fr_300px]">
        <aside className="space-y-2 rounded-xl border bg-card p-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Версии
          </p>
          {rules.map((rule) => (
            <button
              key={rule._id}
              type="button"
              onClick={() => selectRule(rule)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                selectedId === rule._id
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:bg-muted/50"
              }`}
            >
              <div className="font-medium">{rule.name}</div>
              <div className="text-xs text-muted-foreground">
                v{rule.version}
                {rule.isActive && " · активна"}
                {activeRule?._id === rule._id && " ✓"}
              </div>
            </button>
          ))}
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <Label htmlFor="rule-name">Название набора</Label>
            <Input
              id="rule-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {fields.length}{" "}
              {fields.length === 1
                ? "поле"
                : fields.length < 5
                  ? "поля"
                  : "полей"}
              {selectedRule?.isActive && " · активный набор"}
            </p>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <FormulaFieldCard
                key={`${field.name}-${index}`}
                field={field}
                index={index}
                total={fields.length}
                siblingFields={toNamedLabels(fields, field.name)}
                labelByName={labelByName}
                testValue={testOutput?.[field.name]}
                isActive={activeFieldIndex === index}
                onFocus={() => setActiveFieldIndex(index)}
                onRegisterInsert={(handler) => {
                  if (activeFieldIndex === index) {
                    insertHandlerRef.current = handler;
                  }
                }}
                onChange={(patch) => updateField(index, patch)}
                onRemove={() => removeField(index)}
                onMoveUp={() =>
                  setFields((prev) => {
                    const next = moveItem(prev, index, index - 1);
                    setActiveFieldIndex((i) =>
                      i === index ? index - 1 : i === index - 1 ? index : i
                    );
                    return next;
                  })
                }
                onMoveDown={() =>
                  setFields((prev) => {
                    const next = moveItem(prev, index, index + 1);
                    setActiveFieldIndex((i) =>
                      i === index ? index + 1 : i === index + 1 ? index : i
                    );
                    return next;
                  })
                }
              />
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              setFields((prev) => [...prev, emptyField()]);
              setActiveFieldIndex(fields.length);
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Добавить поле
          </Button>
        </section>

        <aside className="space-y-4">
          {testOutput && (
            <TestResultsPanel results={testOutput} labelByName={labelByName} />
          )}

          {dslDocs && (
            <DslReferencePanel
              docs={dslDocs}
              ruleFields={ruleFieldLabels}
              activeFieldName={activeField?.name}
              onInsert={handleDslInsert}
              activeFieldLabel={activeFieldLabel}
            />
          )}
        </aside>
      </div>
    </Page>
  );
}
