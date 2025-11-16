export interface ApiResponse {
  message: string;
  statusCode: number;
  reasonPhrase: string;
  metadata?: unknown;
  errors?: unknown[];
  errorCode?: string
}
