import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	let masterlist = ["home"];
	let contracts = [] as Array<string>;
	for (const scantarg of masterlist) {
		let workinglist = ns.scan(scantarg);
		for (const target of workinglist) {
			if (!masterlist.includes(target)) {
				for (const fn of [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject, ns.nuke]) try { fn(target) } catch { }
				if (ns.hasRootAccess(target)) { masterlist.push(target); }
			}
		}
	}
	masterlist = masterlist.slice(1);
	ns.rm("masterlist.txt");
	ns.write("masterlist.txt", masterlist.toString());
	ns.rm("contracts.txt");
	ns.write("contracts.txt", contracts.toString());
}