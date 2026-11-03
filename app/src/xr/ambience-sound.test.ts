import { describe, expect, it, vi } from "vitest";
import { MAX_SOUND_GAIN, soundGain, startAmbienceSound, type AudioContextLike, type SoundWindow } from "./ambience-sound.ts";

function fakeWindow() {
  const calls = { started: 0, stopped: 0, closed: 0, loops: [] as boolean[], gains: [] as number[], samples: [] as number[] };
  const context: AudioContextLike = {
    destination: {},
    sampleRate: 100,
    createGain: () => ({ gain: { set value(v: number) { calls.gains.push(v); }, get value() { return calls.gains[calls.gains.length - 1] ?? 0; } }, connect: vi.fn() }),
    createBufferSource: () => ({
      buffer: null,
      set loop(v: boolean) { calls.loops.push(v); },
      get loop() { return true; },
      connect: vi.fn(),
      start: () => { calls.started += 1; },
      stop: () => { calls.stopped += 1; },
    }),
    createBuffer: (_channels: number, length: number) => {
      calls.samples.push(length);
      return { getChannelData: () => new Float32Array(length) };
    },
    close: () => { calls.closed += 1; return Promise.resolve(); },
  };
  const win: SoundWindow = { AudioContext: function AudioContextDouble() { return context; } as unknown as new () => AudioContextLike };
  return { win, calls };
}

describe("sons d'ambiance", () => {
  it("APP-011: aucun son n'est joué sans choix de l'utilisateur : volume nul, aucun contexte audio ouvert", () => {
    const { win, calls } = fakeWindow();
    startAmbienceSound(win, 0).stop();
    expect(calls).toMatchObject({ started: 0, closed: 0 });
  });

  it("APP-011: un volume choisi joue un murmure bouclé, sous le plafond qui laisse entendre le réel", () => {
    const { win, calls } = fakeWindow();
    const sound = startAmbienceSound(win, 100);
    expect(calls.started).toBe(1);
    expect(calls.loops).toEqual([true]);
    expect(calls.gains).toEqual([MAX_SOUND_GAIN]);
    expect(MAX_SOUND_GAIN).toBeLessThanOrEqual(0.2);
    expect(calls.samples).toEqual([400]);
    sound.stop();
    expect(calls).toMatchObject({ stopped: 1, closed: 1 });
  });

  it("APP-011: le volume se règle entre 0 et le plafond, une valeur illisible coupe le son", () => {
    expect(soundGain(50)).toBeCloseTo(MAX_SOUND_GAIN / 2);
    expect(soundGain(-10)).toBe(0);
    expect(soundGain(400)).toBe(MAX_SOUND_GAIN);
    expect(soundGain(Number.NaN)).toBe(0);
  });

  it("APP-011: un navigateur sans audio reste muet, sans erreur", () => {
    expect(() => { startAmbienceSound({}, 50).stop(); }).not.toThrow();
    expect(() => { startAmbienceSound(undefined, 50).stop(); }).not.toThrow();
  });
});
