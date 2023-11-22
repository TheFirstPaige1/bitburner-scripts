import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	const pservs = ns.getPurchasedServers();
	if (pservs.length > 0) {
		for (const server of pservs) {
			ns.killall(server);
			ns.scp("manshare.js", server);
			if (ns.getServerMaxRam(server) >= 4) {
				ns.exec("manshare.js", server, Math.trunc(ns.getServerMaxRam(server) / 8));
			}
		}
	}
	ns.tprint("Private server share power: " + ns.getSharePower());
}