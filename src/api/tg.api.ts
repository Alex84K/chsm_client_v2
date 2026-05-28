import apiClient from "./apiClient";
import type {
  SendTelegramBroadcastRequestDto,
  SendTelegramBroadcastResponseDto,
} from "../types/tg.type";

export const sendTelegramBroadcast = async (
  orgId: string,
  payload: SendTelegramBroadcastRequestDto,
): Promise<SendTelegramBroadcastResponseDto> => {
  const response = await apiClient.post<SendTelegramBroadcastResponseDto>(
    `/organizations/${orgId}/telegram/broadcast`,
    payload,
  );
  return response.data;
};
