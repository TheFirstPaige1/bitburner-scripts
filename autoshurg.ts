import { CityName, NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	const corp = ns.corporation;
	const h4ck = ns.hacknet;
	const corpname = "Shurg Industries";
	const agriname = "Shurg Monocultural";
	const tobaname = "Shurg Tamacco";
	const citynames = ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven"] as CityName[];
	const selffund = ns.getResetInfo().currentNode != 3;
	if (!corp.hasCorporation()) { while (!corp.createCorporation(corpname, selffund)) { await ns.sleep(60000); } }
	if (!corp.getCorporation().divisions.includes(agriname)) { corp.expandIndustry("Agriculture", agriname); }
	let investcycle = corp.getInvestmentOffer().round;
	if (!corp.hasUnlock("Smart Supply")) {
		while (corp.getUnlockCost("Smart Supply") > corp.getCorporation().funds) {
			h4ck.spendHashes("Sell for Corporation Funds");
			await ns.sleep(1000);
		}
		corp.purchaseUnlock("Smart Supply");
	}
	if (!corp.hasUnlock("Export")) {
		while (corp.getUnlockCost("Export") > corp.getCorporation().funds) {
			h4ck.spendHashes("Sell for Corporation Funds");
			await ns.sleep(1000);
		}
		corp.purchaseUnlock("Export");
	}
	citynames.map(city => { if (!corp.getDivision(agriname).cities.includes(city)) { corp.expandCity(agriname, city); } });
	citynames.map(city => { if (!corp.hasWarehouse(agriname, city)) { corp.purchaseWarehouse(agriname, city); } });
	//citynames.map(city => { while (corp.getOffice(agriname, city).size < 3) { corp.upgradeOfficeSize(agriname, city, 3); } });
	citynames.map(city => {
		while (corp.getOffice(agriname, city).size > corp.getOffice(agriname, city).numEmployees) {
			corp.hireEmployee(agriname, city);
		}
	});
}