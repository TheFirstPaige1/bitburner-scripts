import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.scriptKill("hackman.js", "home");
	let scanpid = ns.exec("netscanner.js", "home", 1);
	while (ns.isRunning(scanpid)) {
		await ns.sleep(1000);
	}
	const masterlist = ns.read("masterlist.txt").split(",");
	for (let i = 0; i < masterlist.length; i++) {
		let target = masterlist[i];
		ns.scriptKill("manhack.js", target);
		ns.scriptKill("mangrow.js", target);
		ns.scriptKill("manweaken.js", target);
	}
	for (let j = 0; j < masterlist.length; j++) {
		let target = masterlist[j];
		if (ns.getServerMoneyAvailable(target) > 0) {
			ns.exec("hackman.js", "home", 1, target);
		}
	}
}