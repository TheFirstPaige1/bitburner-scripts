import { CityName, NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	const corpname = "Shurg Industries";
	const agriname = "Shurg Monocultural";
	const tobaname = "Shurg Tamacco";
	const citynames = ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven"];
	let fullapi = false;
	let selffund = true;
	if (ns.fileExists("sourcefiles.txt", "home")) {
		let bitnodes = JSON.parse(ns.read("sourcefiles.txt"));
		if (bitnodes[0] == 3 || bitnodes[3] > 2) {
			fullapi = true;
			if (bitnodes[0] == 3) { selffund = false; }
		}
	}
	let investcycle = ns.corporation.getInvestmentOffer().round;
	if (!ns.corporation.hasCorporation()) { while (!ns.corporation.createCorporation(corpname, selffund)) { await ns.sleep(60000); } }
	if (!ns.corporation.getCorporation().divisions.includes(agriname)) { ns.corporation.expandIndustry("Agriculture", agriname); }
	if (!ns.corporation.hasUnlock("Smart Supply")) { ns.corporation.purchaseUnlock("Smart Supply"); }
	if (investcycle > 1) {
		if (!ns.corporation.hasUnlock("Export")) { ns.corporation.purchaseUnlock("Export"); }
		if (!fullapi) {
			if (!ns.corporation.hasUnlock("Warehouse API")) { ns.corporation.purchaseUnlock("Warehouse API"); }
			if (!ns.corporation.hasUnlock("Office API")) { ns.corporation.purchaseUnlock("Office API"); }
		}
	}
	//let agcities = ns.corporation.getDivision(agriname).cities.map(city => city.toString());
	try {
		ns.corporation.expandCity(agriname, "Sector-12");
		ns.corporation.expandCity(agriname, "Aevum");
		ns.corporation.expandCity(agriname, "Chongqing");
		ns.corporation.expandCity(agriname, "New Tokyo");
		ns.corporation.expandCity(agriname, "Ishima");
		ns.corporation.expandCity(agriname, "Volhaven");
	} catch {}
}