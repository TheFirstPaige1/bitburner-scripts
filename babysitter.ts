import { NS } from "@ns";
import { quietTheBabblingThrong } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	quietTheBabblingThrong(ns);
	const combatstats = ["str", "def", "dex", "agi"];
	while (true) {
		let work = ns.singularity.getCurrentWork();
		if (work.type == "COMPANY") { while (ns.hacknet.spendHashes("Company Favor", work.companyName)) { await ns.sleep(1); } }
		else if (work.type == "CLASS") {
			if (combatstats.includes(work.classType)) { while (ns.hacknet.spendHashes("Improve Gym Training")) { await ns.sleep(1); } }
			else { while (ns.hacknet.spendHashes("Improve Studying")) { await ns.sleep(1); } }
		}
		else if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel("ecorp")) {
			if (ns.hacknet.hashCost("Increase Maximum Money") > ns.hacknet.hashCost("Reduce Minimum Security")) {
				while (ns.hacknet.spendHashes("Reduce Minimum Security", "ecorp")) { await ns.sleep(1); }
			} else {
				while (ns.hacknet.spendHashes("Increase Maximum Money", "ecorp")) { await ns.sleep(1); }
			}
		}
		await ns.sleep(10000);
	}
}