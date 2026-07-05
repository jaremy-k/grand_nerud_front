import { apiPath } from "@/lib/api";
import {
  secureGetData,
  securePatchData,
  securePostData,
} from "@/lib/fetch";

export interface CalculationRuleInputs {
  deal: string[];
  config: string[];
  user: string[];
}

export interface FormulaDefinition {
  expr: string;
  snapshot?: boolean;
}

export interface FormulaMetadata {
  label?: string | null;
  description?: string | null;
  group?: string | null;
}

export interface CalculationRuleSchema {
  inputs: CalculationRuleInputs;
  formulas: Record<string, FormulaDefinition>;
  metadata: Record<string, FormulaMetadata>;
}

/** Плоское представление формулы для редактора UI */
export interface FormulaField {
  name: string;
  label?: string | null;
  description?: string | null;
  group?: string | null;
  expr: string;
  snapshot: boolean;
}

export interface CalculationRuleDto {
  _id: string;
  name: string;
  version: number;
  isActive: boolean;
  schema: CalculationRuleSchema;
  createdAt?: string;
  updatedAt?: string;
}

export interface DslDocs {
  variables: Array<{ name: string; description: string }>;
  functions: Array<{ name: string; description: string }>;
  syntax: string[];
}

export interface TestRulesResult {
  results: Record<string, number>;
  errors: string[];
}

export async function getDslDocs(): Promise<DslDocs> {
  return secureGetData(apiPath("/calculation-rules/dsl-docs"));
}

export async function getActiveRule(): Promise<CalculationRuleDto> {
  return secureGetData(apiPath("/calculation-rules/active"));
}

export async function listRules(): Promise<CalculationRuleDto[]> {
  return secureGetData(apiPath("/calculation-rules"));
}

export async function createRule(body: {
  name: string;
  schema: CalculationRuleSchema;
  isActive?: boolean;
}): Promise<CalculationRuleDto> {
  return securePostData(apiPath("/calculation-rules"), body);
}

export async function updateRule(
  id: string,
  body: Partial<{
    name: string;
    schema: CalculationRuleSchema;
    isActive: boolean;
  }>
): Promise<CalculationRuleDto> {
  return securePatchData(apiPath(`/calculation-rules/${id}`), body);
}

export async function activateRule(id: string): Promise<CalculationRuleDto> {
  return securePostData(apiPath(`/calculation-rules/${id}/activate`), {});
}

export async function validateRules(
  schema: CalculationRuleSchema
): Promise<{ valid: boolean; errors: string[] }> {
  return securePostData(apiPath("/calculation-rules/validate"), schema);
}

export async function testRules(body: {
  schema: CalculationRuleSchema;
  context?: Record<string, unknown> | null;
}): Promise<TestRulesResult> {
  return securePostData(apiPath("/calculation-rules/test"), body);
}
