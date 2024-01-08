import { NS } from '@ns';
import ReactLib from 'react';
declare const React: typeof ReactLib;
export async function main(ns: NS): Promise<void> {
	ns.tail();
	ns.clearLog();
}