import { NS } from '@ns';
import ReactLib from 'react';
import { howTheTurnsTable } from './bitlib';
declare const React: typeof ReactLib;
export async function main(ns: NS): Promise<void> {
	ns.tail();
	let infillocs = ns.infiltration.getPossibleLocations();
	for (const location of infillocs) {
		let infil = ns.infiltration.getInfiltration(location.name);
		ns.print(infil.location.name + " " + infil.location.city + " " + infil.difficulty);
	}
}