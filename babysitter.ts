import { NS } from "@ns";
import { masterLister, quietTheBabblingThrong, thereCanBeOnlyOne } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	thereCanBeOnlyOne(ns);
	quietTheBabblingThrong(ns);
	const combatstats = ["str", "def", "dex", "agi"];
	const hackprogs = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	while (true) {
		let work = ns.singularity.getCurrentWork();
		if (work != undefined) {
			if (work.type == "COMPANY") { ns.hacknet.spendHashes("Company Favor", work.companyName); }
			else if (work.type == "CLASS") {
				if (combatstats.includes(work.classType)) { ns.hacknet.spendHashes("Improve Gym Training"); }
				else { ns.hacknet.spendHashes("Improve Studying"); }
			} else if (hackprogs.every(prog => ns.fileExists(prog, "home"))) {
				if (ns.hacknet.hashCost("Increase Maximum Money") > ns.hacknet.hashCost("Reduce Minimum Security")) {
					ns.hacknet.spendHashes("Reduce Minimum Security", masterLister(ns).sort((a, b) => {
						return ns.getServerMinSecurityLevel(b) - ns.getServerMinSecurityLevel(a);
					}).filter(serv => (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(serv)) && (ns.getServerMaxMoney(serv) > 0))[0]);
				} else {
					ns.hacknet.spendHashes("Increase Maximum Money", masterLister(ns).sort((a, b) => {
						return ns.getServerMaxMoney(b) - ns.getServerMaxMoney(a);
					}).filter(serv => ns.getHackingLevel() >= (ns.getServerRequiredHackingLevel(serv)) && (ns.getServerMaxMoney(serv) > 0))[0]);
				}
			}
		}
		await ns.sleep(1000);
	}
}