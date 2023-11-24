import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	const fetchedfiles = ns.singularity.getOwnedSourceFiles();
	const currentnode = ns.getResetInfo().currentNode;
	let sortedfiles = Array(14).fill(0);
	for (const fileobject of fetchedfiles) { sortedfiles[fileobject.n] = (fileobject.lvl || 0); }
	sortedfiles[0] = currentnode;
	ns.rm("sourcefiles.txt");
	ns.write("sourcefiles.txt", JSON.stringify(sortedfiles));
}