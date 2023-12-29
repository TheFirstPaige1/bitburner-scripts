import { NS } from "@ns";
import { masterLister } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let contractservers = masterLister(ns).filter(serv => ns.ls(serv, ".cct").length > 0);
	for (const server of contractservers) {
		let contractlist = ns.ls(server, ".cct");
		for (const contract of contractlist) {
			let contracttype = ns.codingcontract.getContractType(contract, server);
			let contractdata = ns.codingcontract.getData(contract, server);
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
				ns.tprint(server + ", " + contract + ": " + endtext);
				ns.tprint(ns.codingcontract.attempt(endtext, contract, server));
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
				ns.tprint(server + ", " + contract + ": " + endtext);
				ns.tprint(ns.codingcontract.attempt(endtext, contract, server));
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
				ns.tprint(server + ", " + contract + ": " + largestprofit);
				ns.tprint(ns.codingcontract.attempt(largestprofit, contract, server));
			}
		}
	}
}