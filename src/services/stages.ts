import { apiPath } from "@/lib/api";
import {
  secureDeleteData,
  secureGetData,
  securePatchData,
  securePostData,
} from "@/lib/fetch";
import { StageDto } from "@definitions/dto";

export async function getStages(): Promise<StageDto[]> {
  return secureGetData(apiPath("/stages"));
}

export async function createStage(data: {
  name: string;
  order?: number;
}): Promise<StageDto> {
  return securePostData(apiPath("/stages"), data);
}

export async function updateStage(
  id: string,
  data: Partial<Pick<StageDto, "name" | "order">>
): Promise<StageDto> {
  return securePatchData(apiPath(`/stages/${id}`), data);
}

export async function deleteStage(id: string): Promise<void> {
  return secureDeleteData(apiPath(`/stages/${id}`));
}
