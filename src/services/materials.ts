import { apiPath } from "@/lib/api";
import { secureGetData } from "@/lib/fetch";
import { MaterialDto } from "@definitions/dto";

export async function getMaterials(): Promise<MaterialDto[]> {
  return secureGetData(apiPath("/materials"));
}
