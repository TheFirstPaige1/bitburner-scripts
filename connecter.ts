import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	const target = ns.args[0] as string;
	const networkmap = JSON.parse(ns.read("networkmap.txt"));
	let next = target;
	let netpath = [target];
	for (let i = networkmap.length - 1; i > 0; i--) {
		if (networkmap[i][0] == next) {
			next = networkmap[i][1];
			netpath.push(networkmap[i][1]);
		}
	}
	ns.tprint(netpath);
}