import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { PROFILE_STORAGE_KEY, loadProfile, renderProfileChoice, saveProfile, type ProfileStorage } from "./profile-choice.ts";

function memory(initial?: string): ProfileStorage & { data: Map<string, string> } {
  const data = new Map<string, string>(initial === undefined ? [] : [[PROFILE_STORAGE_KEY, initial]]);
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}
const refusing: ProfileStorage = { getItem: () => null, setItem: () => { throw new Error("stockage plein"); } };

function setup(storage?: ProfileStorage) {
  const doc = new Window().document as unknown as Document;
  const notice = doc.createElement("p");
  const choice = renderProfileChoice(doc, storage, notice);
  doc.body.append(choice.element);
  const radio = (value: string) => {
    const found = choice.element.querySelector<HTMLInputElement>(`input[value='${value}']`);
    if (!found) throw new Error(`profil « ${value} » introuvable`);
    return found;
  };
  return { choice, radio, notice };
}

describe("choix du profil graphique", () => {
  it("APP-006: propose les trois profils, équilibré coché sans rien de gardé", () => {
    const { choice, radio } = setup();
    expect([...choice.element.querySelectorAll("label")].map((l) => l.textContent.trim())).toEqual(["Performance", "Équilibré", "Qualité"]);
    expect(choice.readProfile()).toBe("equilibre");
    expect(radio("equilibre").checked).toBe(true);
  });

  it("APP-006: le choix manuel est gardé, relu à l'accueil suivant et l'emporte sur la détection", () => {
    const storage = memory();
    const first = setup(storage);
    first.radio("qualite").click();
    expect(storage.data.get(PROFILE_STORAGE_KEY)).toBe("qualite");
    expect(first.notice.textContent).toBe("");
    first.choice.propose("performance");
    expect(first.choice.readProfile()).toBe("qualite");
    const second = setup(storage);
    expect(second.choice.readProfile()).toBe("qualite");
    second.choice.propose("performance");
    expect(second.choice.readProfile()).toBe("qualite");
  });

  it("APP-006: sans choix, le profil de l'appareil est proposé et dit", () => {
    const { choice, radio } = setup(memory());
    choice.propose("performance");
    expect(choice.readProfile()).toBe("performance");
    expect(radio("equilibre").checked).toBe(false);
    expect(choice.element.querySelector(".profile-hint")?.textContent).toContain("appareil");
  });

  it("QUA-002: une valeur gardée inconnue est ignorée et dite, la détection s'applique", () => {
    const { choice, notice } = setup(memory("ultra"));
    expect(notice.textContent).toContain("« ultra »");
    expect(notice.textContent).toContain("ignoré");
    choice.propose("qualite");
    expect(choice.readProfile()).toBe("qualite");
  });

  it("QUA-002: un stockage refusé est dit, le profil sert pour la séance", () => {
    const { choice, radio, notice } = setup(refusing);
    radio("performance").click();
    expect(choice.readProfile()).toBe("performance");
    expect(notice.textContent).toContain("ne peut pas être gardé");
  });

  it("charge et garde sans stockage ou avec un stockage qui échoue", () => {
    expect(loadProfile(undefined)).toEqual({ profile: undefined, invalid: undefined });
    expect(loadProfile({ getItem: () => { throw new Error("interdit"); }, setItem: () => undefined })).toEqual({ profile: undefined, invalid: undefined });
    expect(loadProfile(memory("performance"))).toEqual({ profile: "performance" });
    expect(saveProfile(undefined, "qualite")).toBe(false);
    expect(saveProfile(refusing, "qualite")).toBe(false);
  });
});
