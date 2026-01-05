const L3_TOKENS = new Set(["IP", "SIP"]);
const L2_TOKENS = new Set(["DIA", "DIAS", "PLL", "DLL", "MDIA"]);

export const circuitPattern =
  /^(?<siteA>[A-Za-z0-9]+)-(?<siteZ>[A-Za-z0-9]+)\s+(?<typeToken>[A-Za-z]+)(?<circuitId>\d+)$/;

export const parseCircuit = (input) => {
  const match = input.trim().match(circuitPattern);
  if (!match || !match.groups) {
    throw new Error(
      "Circuit name must match <SITE-A>-<SITE-Z> <TYPE><ID>, e.g., JEDDAH-MAKKAH IP263."
    );
  }

  const typeToken = match.groups.typeToken.toUpperCase();
  const circuitId = match.groups.circuitId;

  let layer = null;
  if (L3_TOKENS.has(typeToken)) {
    layer = "L3";
  }
  if (L2_TOKENS.has(typeToken)) {
    layer = layer ? null : "L2";
  }

  if (!layer) {
    throw new Error(
      `Type token ${typeToken} must map to L2 (${[...L2_TOKENS].join(
        ", "
      )}) or L3 (${[...L3_TOKENS].join(", ")}).`
    );
  }

  return {
    siteA: match.groups.siteA.toUpperCase(),
    siteZ: match.groups.siteZ.toUpperCase(),
    typeToken,
    circuitId,
    circuitToken: `${typeToken}${circuitId}`,
    layer
  };
};

export const inferLayer = (typeToken) => {
  const normalized = typeToken.toUpperCase();
  if (L3_TOKENS.has(normalized)) {
    return "L3";
  }
  if (L2_TOKENS.has(normalized)) {
    return "L2";
  }
  return null;
};
