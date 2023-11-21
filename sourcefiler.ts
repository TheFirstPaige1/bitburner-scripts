import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	const fetchedfiles = ns.singularity.getOwnedSourceFiles();
	let sortedfiles = [];
	for (let i = 0; i < fetchedfiles.length; i++) {
		sortedfiles.push(0);
	}
	for (let i = 0; i < fetchedfiles.length; i++) {
		let fileobject = fetchedfiles[i];
		sortedfiles[fileobject.n] = "BN" + fileobject.n + "." + fileobject.lvl;
	}
	sortedfiles = sortedfiles.slice(1);
	ns.rm("sourcefiles.txt");
	ns.write("sourcefiles.txt", sortedfiles.toString());
}