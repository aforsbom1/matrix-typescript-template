import "dotenv/config";

export const MATRIX_BASE_URL =
  process.env.MATRIX_BASE_URL ?? "https://matrix.org";
export const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN ?? "";
export const MATRIX_USER_ID = process.env.MATRIX_USER_ID ?? "";
