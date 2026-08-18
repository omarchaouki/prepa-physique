/**
 * Configuration Babel.
 *
 * Le greffon `react-native-worklets/plugin` est indispensable a Reanimated 4 :
 * c'est lui qui transforme les fonctions marquees comme worklets en code
 * executable sur le fil d'interface. Sans lui, l'application compile, se lance,
 * puis echoue a la premiere animation avec une erreur qui ne nomme jamais la
 * cause reelle.
 *
 * Verifie avant de l'ecrire : `babel-preset-expo` ne le pose pas tout seul dans
 * cette version. Il ne fait donc pas double emploi.
 *
 * Il doit rester le DERNIER greffon de la liste. Sa transformation doit voir le
 * code deja traite par les autres, sans quoi elle manque une partie des
 * fonctions a convertir.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-worklets/plugin"],
  };
};
