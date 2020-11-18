interface ApiSuccess {
  type: "success";
  result: any;
}

interface ApiError {
  type: "error";
  error: string;
}

export function createErrorResponse(message: string): ApiError {
  return { type: "error", error: message };
}

export function createSuccessResponse(result: any): ApiSuccess {
  return { type: "success", result };
}
