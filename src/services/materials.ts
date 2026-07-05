import { apiPath } from "@/lib/api";
import { secureGetData, securePostData } from "@/lib/fetch";
import { MaterialDto } from "@definitions/dto";
import { CreateMaterialRequest } from "@definitions/requests";

export async function getMaterials(): Promise<MaterialDto[]> {
  return secureGetData(apiPath("/materials"));
}

export async function createMaterial(
  data: CreateMaterialRequest
): Promise<MaterialDto> {
  return securePostData(apiPath("/materials"), {
    name: data.name.trim(),
  });
}
