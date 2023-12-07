import { CityName, NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	const corpname = "Shurg Industries";
	const agriname = "Shurg Monocultural";
	const tobaname = "Shurg Tamacco";
	const citynames = ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven"] as CityName[];
	const fullapi = (ns.corporation.hasUnlock("Warehouse API") && ns.corporation.hasUnlock("Office API"));
	const selffund = ns.getResetInfo().currentNode != 3;
	let investcycle = ns.corporation.getInvestmentOffer().round;
	if (!ns.corporation.hasCorporation()) { while (!ns.corporation.createCorporation(corpname, selffund)) { await ns.sleep(60000); } }
	if (!ns.corporation.getCorporation().divisions.includes(agriname)) { ns.corporation.expandIndustry("Agriculture", agriname); }
	if (!ns.corporation.hasUnlock("Smart Supply")) { ns.corporation.purchaseUnlock("Smart Supply"); }
	if (!ns.corporation.hasUnlock("Export")) { ns.corporation.purchaseUnlock("Export"); }
	if (!fullapi) {
		if (!ns.corporation.hasUnlock("Warehouse API")) { ns.corporation.purchaseUnlock("Warehouse API"); }
		if (!ns.corporation.hasUnlock("Office API")) { ns.corporation.purchaseUnlock("Office API"); }
	}
	citynames.map(city => { if (!ns.corporation.getDivision(agriname).cities.includes(city)) { ns.corporation.expandCity(agriname, city); } });
}