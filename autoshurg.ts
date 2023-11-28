import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	let fullapi = false;
	let selffund = true;
	if (ns.fileExists("sourcefiles.txt", "home")) {
		let bitnodes = JSON.parse(ns.read("sourcefiles.txt"));
		if (bitnodes[0] == 3 || bitnodes[3] > 2) {
			fullapi = true;
			if (bitnodes[0] == 3) { selffund = false; }
		}
	}
	if (!ns.corporation.hasCorporation()) { while (!ns.corporation.createCorporation("Shurg Industries", selffund)) { await ns.sleep(60000); } }
	if (!ns.corporation.getCorporation().divisions.includes("Shurg Monocultural")) { ns.corporation.expandIndustry("Agriculture", "Shurg Monocultural"); }
	if (!ns.corporation.hasUnlock("SmartSupply")) { ns.corporation.purchaseUnlock("SmartSupply"); }
	if (!ns.corporation.hasUnlock("Export")) { ns.corporation.purchaseUnlock("Export"); }
	if (!fullapi) {
		if (!ns.corporation.hasUnlock("WarehouseAPI")) { ns.corporation.purchaseUnlock("WarehouseAPI"); }
		if (!ns.corporation.hasUnlock("OfficeAPI")) { ns.corporation.purchaseUnlock("OfficeAPI"); }
	}
}