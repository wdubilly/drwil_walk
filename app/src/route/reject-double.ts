// Doublure de test : une promesse qui échoue avec autre chose qu'une `Error` (une chaîne), comme peut le faire un
// fetch ou une extension de navigateur ; le code doit alors dire le motif tel quel, pas l'avaler (QUA-002).
export const rejectWith = (reason: string): Promise<never> =>
  ({ then: (_ok: unknown, fail: (r: unknown) => void) => { fail(reason); } }) as unknown as Promise<never>;
