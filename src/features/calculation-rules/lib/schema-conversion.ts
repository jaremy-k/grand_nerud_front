import {
  CalculationRuleInputs,
  CalculationRuleSchema,
  FormulaField,
} from "@/services/calculation-rules";

export const DEFAULT_INPUTS: CalculationRuleInputs = {
  deal: [
    "quantity",
    "amountPurchaseUnit",
    "amountSalesUnit",
    "amountDelivery",
    "paymentMethod",
    "addExpenses",
    "deliveredQuantity",
  ],
  config: [
    "ndsPercentConfig",
    "defaultManagerShare",
    "cashPaymentMethod",
    "nonCashPaymentMethod",
  ],
  user: ["managerShare"],
};

export function schemaToFields(schema: CalculationRuleSchema): FormulaField[] {
  return Object.entries(schema.formulas).map(([name, formula]) => {
    const meta = schema.metadata[name];
    return {
      name,
      expr: formula.expr,
      snapshot: formula.snapshot ?? false,
      label: meta?.label,
      description: meta?.description,
      group: meta?.group,
    };
  });
}

export function fieldsToSchema(
  fields: FormulaField[],
  inputs: CalculationRuleInputs = DEFAULT_INPUTS
): CalculationRuleSchema {
  const formulas: CalculationRuleSchema["formulas"] = {};
  const metadata: CalculationRuleSchema["metadata"] = {};

  for (const field of fields) {
    if (!field.name.trim()) continue;

    formulas[field.name] = {
      expr: field.expr,
      ...(field.snapshot ? { snapshot: true } : {}),
    };

    const hasMeta =
      field.label?.trim() ||
      field.description?.trim() ||
      field.group?.trim();

    if (hasMeta) {
      metadata[field.name] = {
        ...(field.label?.trim() ? { label: field.label.trim() } : {}),
        ...(field.description?.trim()
          ? { description: field.description.trim() }
          : {}),
        ...(field.group?.trim() ? { group: field.group.trim() } : {}),
      };
    }
  }

  return { inputs, formulas, metadata };
}
