import type { AccountCreationRequest } from "../types/users.types"
import apiClient from "./apiClient"

export const accountCreationRequest = async (dto: AccountCreationRequest): Promise<any> => {
    const response = await apiClient.post<any>(
        `/applications`,
        dto
    )
    return response.data
}