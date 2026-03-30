export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  storeId: string;
}
