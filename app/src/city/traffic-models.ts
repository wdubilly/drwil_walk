// Les modèles des figurants, isolés pour n'être chargés qu'à la demande (import dynamique de ce module) : un import statique
// avec attribut passe sous Vite comme sous Node, là où l'import dynamique d'un JSON n'est accepté que par l'un ou l'autre.
import models from "../../assets/figurants.json" with { type: "json" };

export default models;
