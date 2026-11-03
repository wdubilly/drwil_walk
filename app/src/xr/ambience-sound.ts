// Les sons d'ambiance (APP-011) : coupés par défaut, jamais joués sans un choix de l'utilisateur, et d'un volume
// plafonné pour ne jamais couvrir les bruits du réel (tapis, pièce, personne qui appelle) — risque de chute.

/** Gain maximal du murmure de ville, même à 100 % : il reste derrière les bruits du réel. */
export const MAX_SOUND_GAIN = 0.2;
/** Longueur du murmure bouclé, en secondes. */
const LOOP_S = 4;

interface BufferLike {
  getChannelData(channel: number): Float32Array;
}

interface SourceLike {
  buffer: BufferLike | null;
  loop: boolean;
  connect(node: unknown): void;
  start(): void;
  stop(): void;
}

export interface AudioContextLike {
  destination: unknown;
  sampleRate: number;
  createGain(): { gain: { value: number }; connect(node: unknown): void };
  createBufferSource(): SourceLike;
  createBuffer(channels: number, length: number, sampleRate: number): BufferLike;
  close(): Promise<void>;
}

export interface SoundWindow {
  AudioContext?: new () => AudioContextLike;
}

export interface AmbienceSound {
  stop(): void;
}

const SILENT: AmbienceSound = { stop: () => undefined };

/** Le gain appliqué : 0 coupe tout, 100 % reste sous le plafond, une valeur illisible coupe. */
export function soundGain(volumePct: number): number {
  if (!Number.isFinite(volumePct)) return 0;
  return Math.min(1, Math.max(0, volumePct / 100)) * MAX_SOUND_GAIN;
}

/** Un murmure de ville : un souffle grave de quelques secondes, bouclé (aucun fichier son embarqué). */
function murmur(context: AudioContextLike): BufferLike {
  const length = Math.round(context.sampleRate * LOOP_S);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let value = 0;
  for (let i = 0; i < length; i += 1) {
    // Moyenne glissante d'un bruit : un souffle sourd, sans sifflement ni sursaut.
    value = value * 0.98 + (Math.random() * 2 - 1) * 0.02;
    data[i] = value * 4;
  }
  return buffer;
}

/** Démarre le son d'ambiance ; volume nul ou navigateur sans audio : aucun contexte n'est même ouvert. */
export function startAmbienceSound(win: SoundWindow | null | undefined, volumePct: number): AmbienceSound {
  const gain = soundGain(volumePct);
  if (gain <= 0 || !win?.AudioContext) return SILENT;
  const context = new win.AudioContext();
  const volume = context.createGain();
  volume.gain.value = gain;
  volume.connect(context.destination);
  const source = context.createBufferSource();
  source.buffer = murmur(context);
  source.loop = true;
  source.connect(volume);
  source.start();
  return {
    stop: () => {
      source.stop();
      void context.close();
    },
  };
}
