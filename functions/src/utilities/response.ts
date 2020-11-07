interface ApiSuccess {
  type: "success";
  data: any;
}

interface ApiError {
  type: "error";
  message: string;
  data?: any;
}

export function createErrorResponse(message: string, data?: any): ApiError {
  return { type: "error", message, data };
}

export function createSuccessResponse(data: any): ApiSuccess {
  return { type: "success", data };
}
