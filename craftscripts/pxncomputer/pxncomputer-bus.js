/* ==============================================================================
 * Copyright (c) 2021-2023 Mattsoft/PoiXson
 * <https://mattsoft.net> <https://poixson.com>
 * Released under the AGPL 3.0
 *
 * Description: WorldEdit script to generate a redstone computer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * ==============================================================================
 */
// pxncomputer-bus.js

//   |   |dev|
//   +-------------+
//mem|     BUS     |
//   +-------------+
//   |        |dev|



options.Bus.w = 0;
options.Bus.h = 10;
options.Bus.d = Math.max(options.Bus.bits, options.Bus.inst) * 3;



function getNextBusOffset(width, side) {
	let offset = (side ? options.Bus.next_n : options.Bus.next_s);
	offset += options.Bus.spacing;
	if (side) {
		options.Bus.next_n = offset + width;
		if (options.Bus.w < options.Bus.next_n + options.Bus.spacing)
			options.Bus.w = options.Bus.next_n + options.Bus.spacing;
	} else {
		options.Bus.next_s = offset + width;
		if (options.Bus.w < options.Bus.next_s + options.Bus.spacing)
			options.Bus.w = options.Bus.next_s + options.Bus.spacing;
	}
	return offset;
}

function getBusBitZ(bit) {
	return 0 - (bit * 3) - 1;
}
function getBusY(di) {
	return (di ? 5 : 3);
}



function Stats_Bus() {
	print("Bits: "+options.Bus.bits);
	print("Inst: "+options.Bus.inst);
}



function Clear_Bus() {
	FillXYZ(
		"air",
		0, 0, 0,
		options.Bus.w+1,
		options.Bus.h,
		0-options.Bus.d
	);
	return true;
}



function Frame_Bus() {
	if (options.Bus.w <= 0)
		options.Bus.w = 50;
	const block_frame = GetBlock("frame");
	DrawFrame(
		block_frame,
		0, 0, 0,
		options.Bus.w,
		options.Bus.h,
		0-options.Bus.d
	);
	return true;
}



// ==================================================



function Build_Bus() {
	if (options.Bus.w <= 0)
		options.Bus.w = 50;
	print("Building the Bus..");
	// system bus
	const bits = Math.max(options.Bus.bits, options.Bus.inst);
	for (let bit=0; bit<bits; bit++) {
		let z = getBusBitZ(bit);
		let build_data = (bit < options.Bus.bits);
		let build_inst = (bit < options.Bus.inst);
		for (let ix=0; ix<options.Bus.w; ix++) {
			if (build_data) {
				SetBlock("data slab", ix, 5, z);
				SetBlock("wire ew",   ix, 6, z);
			}
			if (build_inst) {
				SetBlock("inst slab", ix, 3, z);
				SetBlock("wire ew",   ix, 4, z);
			}
		}
		// eastern end
		{
			let x = options.Bus.w - 1;
			if (build_data) {
				SetBlock("lamp", x, 6, z);
				let block = "birch_wall_sign[facing=east]|Data Bus||"+
					"Bit "+(bit+1)+"|[+"+Math.pow(2, bit)+"]";
				SetBlock(block, x+1, 5, z);
			}
			if (build_inst) {
				SetBlock("lamp", x, 4, z);
				let block = "birch_wall_sign[facing=east]|Instruction Bus||"+
					"Bit "+(bit+1)+"|[+"+Math.pow(2, bit)+"]";
				SetBlock(block, x+1, 3, z);
			}
		}
	} // end for bits
	return true;
}



// ==================================================
// bus branches



function BuildBusBranch(x, ns, di, booster, func_x) {
	const bits = (di ? options.Bus.bits : options.Bus.inst);
	let xx;
	let y = getBusY(di);
	for (let bit=0; bit<bits; bit++) {
		xx = x + func_x(bit);
		BuildBusBranchBit(xx, y, bit, ns, di, booster);
	}
}

function BuildBusBranchBit(x, y, bit, ns, di, booster) {
	const bits = (di ? options.Bus.bits : options.Bus.inst);
	const tib = bits - bit - 1;
	let yy = y - (di ? 0 : 2);
	let zz = getBusBitZ(bit);
	if (di) zz += (ns ? -1 : 1);
	let matrix;
	if ( (ns && tib == 0)
	||  (!ns && bit == 0) ) {
		if (di) {
			matrix = [
				" ",
				"|",
				"=",
				" ",
			];
		} else {
			matrix = [
				"~",
				"=",
				" ",
				" ",
			];
		}
	} else
	if ( (ns && tib == 1)
	||  (!ns && bit == 1) ) {
		if (di) {
			matrix = [
				"  | ",
				"||=|",
				"=- -",
				"    ",
			];
		} else {
			matrix = [
				"~   ",
				"=|  ",
				" =||",
				"  --",
			];
		}
	} else {
		if (di) {
			matrix = [
				" |",
				"|=",
				"= ",
				"  ",
			];
		} else {
			matrix = [
				"~ ",
				"=|",
				" =",
				"  ",
			];
		}
		let len = ((ns ? tib : bit) * 3) - 3;
		if (len > 0) {
			if (di) {
				matrix[0] += "|".repeat(len+1);
				matrix[1] += "-".repeat(len  ) + "=|";
				matrix[2] += " ".repeat(len+1) +  "-";
				// boosters
				if (len > 5) {
					for (let i=4; i<len; i+=12) {
						matrix[0] = ReplaceAt(matrix[0], i, booster);
					}
				}
			} else {
				matrix[2] += "|".repeat(len+2);
				matrix[3] += "-".repeat(len+2);
				// boosters
				if (len > 5) {
					for (let i=4; i<len; i+=12) {
						matrix[2] = ReplaceAt(matrix[2], i, booster);
					}
				}
			}
		}
	}
	SetBlockMatrix(
		{
			"=": (di ? "cell block" : "inst block"),
			"-": (di ? "cell slab"  : "inst slab" ),
			">": (ns ? "repeat s"   : "repeat n"  ),
			"<": (ns ? "repeat n"   : "repeat s"  ),
		},
		matrix,
		x, yy, zz,
		(ns ? "Zy" : "zy")
	);
}
