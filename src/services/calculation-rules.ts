import { apiPath } from "@/lib/api";
import {
  secureGetData,
  securePatchData,
  securePostData,
} from "@/lib/fetch";

export interface FormulaField {
  name: string;
  label?: string | null;
  description?: string | null;
  expression: string;
  store: boolean;
}

export interface CalculationRuleDto {
  _id: string;
  name: string;
  version: number;
  isActive: boolean;
  fields: FormulaField[];
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
  fields: FormulaField[];
  isActive?: boolean;
}): Promise<CalculationRuleDto> {
  return securePostData(apiPath("/calculation-rules"), body);
}

export async function updateRule(
  id: string,
  body: Partial<{
    name: string;
    fields: FormulaField[];
    isActive: boolean;
  }>
): Promise<CalculationRuleDto> {
  return securePatchData(apiPath(`/calculation-rules/${id}`), body);
}

export async function activateRule(id: string): Promise<CalculationRuleDto> {
  return securePostData(apiPath(`/calculation-rules/${id}/activate`), {});
}

export async function validateRules(
  fields: FormulaField[]
): Promise<{ valid: boolean; errors: string[] }> {
  return securePostData(apiPath("/calculation-rules/validate"), fields);
}

export async function testRules(body: {
  fields: FormulaField[];
  context?: Record<string, unknown>;
}): Promise<TestRulesResult> {
  return securePostData(apiPath("/calculation-rules/test"), body);
}
