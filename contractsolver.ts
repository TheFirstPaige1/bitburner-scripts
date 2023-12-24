import { NS } from "@ns";
import { masterLister } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let firstcontract = masterLister(ns).find(serv => ns.ls(serv, ".cct").length > 0);
	if (ns.args.length > 0) { firstcontract = ns.args[0] as string; }
	if (firstcontract != undefined) {
		let contract = ns.ls(firstcontract, ".cct")[0];
		if (ns.args.length > 0) { contract = ns.args[1] as string; }
		let contracttype = ns.codingcontract.getContractType(contract, firstcontract);
		let contractdata = ns.codingcontract.getData(contract, firstcontract);
		ns.tprint(firstcontract);
		ns.tprint(contract);
		ns.tprint(contracttype);
		ns.tprint(ns.codingcontract.getDescription(contract, firstcontract));
		ns.tprint(contractdata);
		ns.tprint(ns.codingcontract.getNumTriesRemaining(contract, firstcontract));
		if (contracttype == "Encryption I: Caesar Cipher") {
			let starttext = contractdata[0];
			let leftshift = contractdata[1];
			let endtext = "";
			for (const letter of starttext) {
				if (letter != " ") {
					let alphdex = alphabet.indexOf(letter) - leftshift;
					while (alphdex < 0) { alphdex = alphdex + alphabet.length; }
					endtext = endtext + alphabet.charAt(alphdex);
				} else {
					endtext = endtext + " ";
				}
			}
			ns.tprint(endtext);
			ns.tprint(ns.codingcontract.attempt(endtext, contract, firstcontract));
		}
		if (contracttype == "Encryption II: Vigenère Cipher") {
			let starttext = contractdata[0];
			let ciphertext = contractdata[1];
			while (ciphertext.length < starttext.length) { ciphertext = ciphertext + ciphertext; }
			let endtext = "";
			for (let i = 0; i < starttext.length; i++) {
				let rightshift = alphabet.indexOf(ciphertext[i]);
				let alphdex = alphabet.indexOf(starttext[i]) + rightshift;
				while (alphdex >= alphabet.length) { alphdex = alphdex - alphabet.length; }
				endtext = endtext + alphabet.charAt(alphdex);
			}
			ns.tprint(endtext);
			ns.tprint(ns.codingcontract.attempt(endtext, contract, firstcontract));
		}
		if (contracttype == "Algorithmic Stock Trader I") {
			let largestprofit = 0;
			for (let i = 0; i < contractdata.length; i++) {
				let buyprice = contractdata[i];
				for (let j = i + 1; j < contractdata.length; j++) {
					let saleprice = contractdata[j];
					let profit = saleprice - buyprice;
					if (profit > largestprofit) { largestprofit = profit; }
				}
			}
			ns.tprint(largestprofit);
			ns.tprint(ns.codingcontract.attempt(largestprofit, contract, firstcontract));
		}
	}
}