import { parseCircuit } from "./parseCircuit";

const forbiddenKeywords = [
  "conf t",
  "configure",
  "commit",
  "set ",
  "edit",
  "delete",
  "undo",
  "ip route",
  "router bgp",
  "policy-options",
  "vlan create",
  "write memory"
];

const isForbidden = (command) => {
  const lower = command.toLowerCase();
  if (lower.startsWith("interface ")) {
    return true;
  }
  return forbiddenKeywords.some((keyword) => lower.includes(keyword));
};

export const generateCommands = (values) => {
  const parsed = parseCircuit(values.circuitName);

  if (parsed.layer !== "L3" || values.aggregatorVendor !== "Cisco") {
    return {
      status: "unsupported",
      message: "Command template not yet implemented for this combination."
    };
  }

  if (!values.interfaceName) {
    return {
      status: "blocked",
      message: "Required field missing: Interface"
    };
  }

  if (!values.instanceName || !values.customerIp) {
    return {
      status: "blocked",
      message: "Required field missing: VRF name or Customer IP"
    };
  }

  const commands = [
    `show interface description | i ${parsed.circuitToken}`,
    `show run interface ${values.interfaceName}`,
    `show l2vpn bridge-domain interface ${values.interfaceName} brief`,
    `show arp vrf ${values.instanceName} ${values.customerIp}`,
    `ping vrf ${values.instanceName} ${values.customerIp} count 100`,
    `show bgp vrf ${values.instanceName} summary | i ${values.customerIp}`
  ];

  if (commands.some(isForbidden)) {
    return {
      status: "blocked",
      message: "Generated output contains forbidden keywords."
    };
  }

  return {
    status: "ready",
    commands,
    explanations: [
      "Confirms the circuit token appears on interface descriptions.",
      "Displays the full interface configuration for inspection.",
      "Checks the bridge-domain attachment for the interface.",
      "Looks up the customer IP in the VRF ARP table.",
      "Pings the customer IP within the VRF to validate reachability.",
      "Verifies BGP summary entries filtered by the customer IP."
    ]
  };
};
