import { describe, expect, it } from "vitest";
import { openZip } from "./zip-read.ts";
import { makeZip } from "./zip-double.ts";

describe("lecture d'une archive zip", () => {
  it("APP-003: lit les entrées stockées comme les entrées compressées, sans rien écrire", () => {
    const zip = openZip(makeZip({ "a.txt": "bonjour", "dossier/b.bin": Uint8Array.from([1, 2, 3]) }, ["dossier/b.bin"]));
    expect(zip.has("a.txt")).toBe(true);
    expect(zip.has("absent")).toBe(false);
    expect(zip.read("a.txt").toString()).toBe("bonjour");
    expect([...zip.read("dossier/b.bin")]).toEqual([1, 2, 3]);
  });

  it("APP-003: refuse ce qui n'est pas une archive, une entrée absente, un en-tête abîmé ou une méthode inconnue", () => {
    expect(() => openZip(Buffer.alloc(40))).toThrow("fin du répertoire introuvable");
    expect(() => openZip(Buffer.alloc(3))).toThrow("fin du répertoire introuvable");
    const bytes = makeZip({ "a.txt": "bonjour" });
    expect(() => openZip(bytes).read("b.txt")).toThrow("« b.txt » absent");
    const broken = Buffer.from(bytes);
    broken.writeUInt32LE(0, 0);
    expect(() => openZip(broken).read("a.txt")).toThrow("en-tête de « a.txt » invalide");
    const noEntry = Buffer.from(bytes);
    noEntry.writeUInt32LE(0, noEntry.length - 22 - 46 - 5);
    expect(() => openZip(noEntry)).toThrow("entrée du répertoire invalide");
    expect(() => openZip(makeZip({ "a.txt": "bonjour" }, [], 99)).read("a.txt")).toThrow("méthode 99 non gérée");
  });

  it("APP-003: refuse une entrée dont la taille annoncée n'est pas celle du contenu", () => {
    const bytes = Buffer.from(makeZip({ "a.txt": "bonjour" }));
    bytes.writeUInt32LE(3, bytes.length - 22 - 46 - 5 + 24);
    expect(() => openZip(bytes).read("a.txt")).toThrow("taille de « a.txt » inattendue");
  });
});
