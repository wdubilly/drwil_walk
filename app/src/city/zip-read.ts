// Lecture d'une archive zip, en mémoire et sans rien écrire : l'archive du pack est une donnée non fiable (rien n'est
// extrait sur disque, rien n'est exécuté). Utilisée par le script de préparation du pack d'arbres.
import { inflateRawSync } from "node:zlib";

const END_OF_DIRECTORY = 0x06054b50;
const CENTRAL_ENTRY = 0x02014b50;
const LOCAL_ENTRY = 0x04034b50;
const STORED = 0;
const DEFLATED = 8;

interface Entry {
  method: number;
  compressedSize: number;
  size: number;
  headerOffset: number;
}

export interface Zip {
  has(name: string): boolean;
  read(name: string): Buffer;
}

/** Ouvre une archive : l'index des entrées est lu d'avance, le contenu d'une entrée seulement quand on le demande. */
export function openZip(bytes: Uint8Array): Zip {
  const data = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // Le répertoire central finit l'archive : on cherche sa fin, à reculons (un éventuel commentaire la suit).
  let end = data.length - 22;
  while (end >= 0 && data.readUInt32LE(end) !== END_OF_DIRECTORY) end -= 1;
  if (end < 0) throw new Error("archive zip illisible : fin du répertoire introuvable");
  const count = data.readUInt16LE(end + 10);
  let at = data.readUInt32LE(end + 16);
  const entries = new Map<string, Entry>();
  for (let i = 0; i < count; i += 1) {
    if (data.readUInt32LE(at) !== CENTRAL_ENTRY) throw new Error("archive zip illisible : entrée du répertoire invalide");
    const nameLength = data.readUInt16LE(at + 28);
    const extraLength = data.readUInt16LE(at + 30);
    const commentLength = data.readUInt16LE(at + 32);
    entries.set(data.toString("utf8", at + 46, at + 46 + nameLength), {
      method: data.readUInt16LE(at + 10),
      compressedSize: data.readUInt32LE(at + 20),
      size: data.readUInt32LE(at + 24),
      headerOffset: data.readUInt32LE(at + 42),
    });
    at += 46 + nameLength + extraLength + commentLength;
  }
  return {
    has: (name) => entries.has(name),
    read(name) {
      const entry = entries.get(name);
      if (!entry) throw new Error(`archive zip : « ${name} » absent`);
      const header = entry.headerOffset;
      if (data.readUInt32LE(header) !== LOCAL_ENTRY) throw new Error(`archive zip : en-tête de « ${name} » invalide`);
      const start = header + 30 + data.readUInt16LE(header + 26) + data.readUInt16LE(header + 28);
      const packed = data.subarray(start, start + entry.compressedSize);
      if (entry.method === STORED) return Buffer.from(packed);
      if (entry.method !== DEFLATED) throw new Error(`archive zip : méthode ${String(entry.method)} non gérée pour « ${name} »`);
      const out = inflateRawSync(packed);
      if (out.length !== entry.size) throw new Error(`archive zip : taille de « ${name} » inattendue`);
      return out;
    },
  };
}
