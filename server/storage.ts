import { promises as fs } from "fs";
import path from "path";
import { ENV } from "./_core/env";

type StorageConfig = { rootDir: string; publicBaseUrl: string };

function getStorageConfig(): StorageConfig {
  return {
    rootDir: path.resolve(process.cwd(), ENV.storageDir),
    publicBaseUrl: ENV.publicBaseUrl.replace(/\/$/, ""),
  };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

async function ensureParent(pathname: string): Promise<void> {
  await fs.mkdir(path.dirname(pathname), { recursive: true });
}

function toBuffer(data: Buffer | Uint8Array | string): Buffer {
  if (typeof data === "string") {
    return Buffer.from(data);
  }
  return Buffer.isBuffer(data) ? data : Buffer.from(data);
}

function getPublicUrl(key: string, publicBaseUrl: string): string {
  if (publicBaseUrl) {
    return `${publicBaseUrl}/uploads/${key}`;
  }
  return `/uploads/${key}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { rootDir, publicBaseUrl } = getStorageConfig();
  const key = normalizeKey(relKey);
  const destination = path.join(rootDir, key);

  await ensureParent(destination);
  await fs.writeFile(destination, toBuffer(data));

  return { key, url: getPublicUrl(key, publicBaseUrl) };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const { rootDir, publicBaseUrl } = getStorageConfig();
  const key = normalizeKey(relKey);
  const fullPath = path.join(rootDir, key);
  await fs.access(fullPath);
  return {
    key,
    url: getPublicUrl(key, publicBaseUrl),
  };
}
