import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
    if (ns.scriptRunning("totalhack.js", "home")) {
        ns.spawn("totalhack.js", 1, 500);
    } else {
        ns.run("totalhack.js");
    }
}
