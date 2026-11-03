// Profil graphique choisi à l'accueil (APP-006) : trois boutons radio, comme le côté du panneau. Le choix manuel est gardé
// dans ce navigateur seulement et l'emporte sur la détection ; sans choix gardé, le profil proposé par l'appareil s'applique.
import { FALLBACK_PROFILE, PROFILES, isProfileId, type ProfileId } from "../render/profiles.ts";

export const PROFILE_STORAGE_KEY = "drwil_walk.profil-graphique";

export type ProfileStorage = Pick<Storage, "getItem" | "setItem">;

export type LoadedProfile = { profile: ProfileId } | { profile: undefined; invalid: string | undefined };

/** Le profil gardé ; une valeur inconnue ou corrompue est rendue pour être dite (QUA-002), jamais avalée. */
export function loadProfile(storage: ProfileStorage | undefined): LoadedProfile {
  try {
    const value = storage?.getItem(PROFILE_STORAGE_KEY) ?? undefined;
    if (value === undefined) return { profile: undefined, invalid: undefined };
    return isProfileId(value) ? { profile: value } : { profile: undefined, invalid: value };
  } catch {
    return { profile: undefined, invalid: undefined };
  }
}

/** Garde le profil ; faux si le navigateur refuse, à dire à l'utilisateur. */
export function saveProfile(storage: ProfileStorage | undefined, profile: ProfileId): boolean {
  try {
    if (!storage) return false;
    storage.setItem(PROFILE_STORAGE_KEY, profile);
    return true;
  } catch {
    return false;
  }
}

export interface ProfileChoice {
  element: HTMLElement;
  readProfile: () => ProfileId;
  /** Le profil proposé par l'appareil : appliqué seulement si personne n'a choisi (ni gardé, ni cliqué). */
  propose: (profile: ProfileId) => void;
}

/** `notice` reçoit la raison d'une valeur gardée illisible ou d'un choix qui ne peut pas être gardé (QUA-002). */
export function renderProfileChoice(doc: Document, storage: ProfileStorage | undefined, notice: HTMLElement): ProfileChoice {
  const element = doc.createElement("fieldset");
  element.className = "profile";
  const legend = doc.createElement("legend");
  legend.textContent = "Profil graphique";
  element.append(legend);
  const loaded = loadProfile(storage);
  let chosen = loaded.profile !== undefined;
  const initial = loaded.profile ?? FALLBACK_PROFILE;
  const radios = PROFILES.map((profile) => {
    const label = doc.createElement("label");
    const radio = doc.createElement("input");
    radio.type = "radio";
    radio.name = "profil";
    radio.value = profile.id;
    radio.checked = profile.id === initial;
    label.append(radio, ` ${profile.label}`);
    element.append(label);
    return radio;
  });
  const hint = doc.createElement("p");
  hint.className = "profile-hint";
  element.append(hint);
  if (!loaded.profile && loaded.invalid !== undefined) {
    notice.textContent = `Le profil graphique gardé dans ce navigateur (« ${loaded.invalid} ») est illisible : il est ignoré, le profil de l'appareil s'applique.`;
  }
  let current: ProfileId = initial;
  element.addEventListener("change", (event) => {
    current = (event.target as HTMLInputElement).value as ProfileId;
    chosen = true;
    hint.textContent = "";
    notice.textContent = saveProfile(storage, current)
      ? ""
      : "Le profil graphique ne peut pas être gardé dans ce navigateur : il sert seulement pour cette séance.";
  });
  return {
    element,
    readProfile: () => current,
    propose: (profile) => {
      if (chosen) return;
      current = profile;
      for (const radio of radios) radio.checked = radio.value === profile;
      hint.textContent = "Proposé d'après votre appareil.";
    },
  };
}
