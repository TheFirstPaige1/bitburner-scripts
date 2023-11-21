import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	let masterlist = ["home"];
	let contracts = [] as Array<string>;
	for (let i = 0; i < masterlist.length; i++) {
		let workinglist = ns.scan(masterlist[i]);
		for (let j = 0; j < workinglist.length; j++) {
			let target = workinglist[j];
			if (!masterlist.includes(target)) {
				let portsbusted = 0
				if (ns.fileExists("BruteSSH.exe", "home")) {
					ns.brutessh(target);
					portsbusted++;
				}
				if (ns.fileExists("FTPCrack.exe", "home")) {
					ns.ftpcrack(target);
					portsbusted++;
				}
				if (ns.fileExists("relaySMTP.exe", "home")) {
					ns.relaysmtp(target);
					portsbusted++;
				}
				if (ns.fileExists("HTTPWorm.exe", "home")) {
					ns.httpworm(target);
					portsbusted++;
				}
				if (ns.fileExists("SQLInject.exe", "home")) {
					ns.sqlinject(target);
					portsbusted++;
				}
				if (ns.getServerNumPortsRequired(target) <= portsbusted) {
					ns.nuke(target);
				}
				if (ns.hasRootAccess(target)) {
					masterlist.push(target);
				}
			}
			let targdocs = ns.ls(target, ".lit");
			if (targdocs.length > 0) {
				ns.scp(targdocs, "home", target);
			}
			if (ns.ls(target, ".cct").length > 0) {
				if (!contracts.includes(target)) {
					contracts.push(target);
				}
			}
		}
	}
	masterlist = masterlist.slice(1);
	ns.rm("masterlist.txt");
	ns.write("masterlist.txt", masterlist.toString());
	ns.rm("contracts.txt");
	ns.write("contracts.txt", contracts.toString());
}