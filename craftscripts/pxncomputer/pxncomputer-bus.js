/* ==============================================================================
 * Copyright (c) 2021-2022 Mattsoft/PoiXson
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
		options.Bus.w,
		options.Bus.h,
		options.Bus.d
	);
	return true;
}



function Frame_Bus() {
	if (options.Bus.w <= 0) options.Bus.w = 50;
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
				let block = "birch_wall_sign[facing=east]|Data Bus||Bit "+(bit+1)+"|[+"+Math.pow(2, bit)+"]";
				SetBlock(block, x+1, 5, z);
			}
			if (build_inst) {
				SetBlock("lamp", x, 4, z);
				let block = "birch_wall_sign[facing=east]|Instruction Bus||Bit "+(bit+1)+"|[+"+Math.pow(2, bit)+"]";
				SetBlock(block, x+1, 3, z);
			}
		}
	} // end for bits

	BuildDataBusBranchNorth(2);

	return true;
}



// ==================================================
// bus branches



function BuildDataBusBranchNorth(x) {
	BuildBusBranch(x, true,  true);
}
function BuildDataBusBranchSouth(x) {
	BuildBusBranch(x, false, true);
}
function BuildInstBusBranchNorth(x) {
	BuildBusBranch(x, true,  false);
}
function BuildInstBusBranchSouth(x) {
	BuildBusBranch(x, false, false);
}

function BuildBusBranch(x, ns, di) {
//TODO
//	const bits = (di ? options.Bus.bits : options.Bus.inst);
//	let xx;
//	let y = getBusY(di);
//	for (let bit=0; bit<bits; bit++) {
//TODO: fix xx bit order
//		xx = x + (tib * 3);
//		BuildBusBranchBit(xx, y, ns, di);
//	}
}

function BuildBusBranchBit(x, y, bit, ns, di) {
	const bits = (di ? options.Bus.bits : options.Bus.inst);
	const tib = bits - bit - 1;
	let z = getBusBitZ(bit) + (ns ? -1 : 1);
	let matrix;
	if ( (ns && tib == 0)
	||  (!ns && bit == 0) ) {
		matrix = [
			"  ",
			"| ",
			"= ",
			"  ",
		];
	} else
	if ( (ns && tib == 1)
	||  (!ns && bit == 1) ) {
		matrix = [
			" || ",
			"|==|",
			"=  -",
			"    ",
		];
	} else {
		matrix = [
			" |",
			"|=",
			"= ",
			"  ",
		];
		let len = ((ns ? tib : bit) * 3) - 3;
		if (len > 0) {
			matrix[0] += "|".repeat(len+1);
			matrix[1] += "-".repeat(len) + "=|";
			matrix[2] += " ".repeat(len+1) + "-";
		}
	}
	SetBlockMatrix(
		{
			"=": "cell block",
			"-": "cell slab",
		},
	   matrix,
		x, y, z,
		(ns ? "Zy" : "zy")
	);
}



/*
function Build_Bus_Branch_Bit(x, ns, di, bit) {
	const z = getBusBitZ(bit);
	// data bus
	if (di) {
		// north branch
		if (ns) {
			SetBlock("data block", x, 6, z-1); SetBlock("wire ns", x, 7, z-1);
			if (bit > 0) {
				SetBlock("data block", x, 7, z-2); SetBlock("wire ns", x, 8, z-2);
			}
			for (let zz=0; zz<z-2; zz++) {
				SetBlock("data slab", x, 7, zz);
				SetBlock("wire ns",   x, 8, zz);
			}
		// south branch
		} else {
			SetBlock("data block", x, 6, z+1); SetBlock("wire ns", x, 7, z+1);
			if (bit < options.Bus.bits-1) {
				SetBlock("data block", x, 7, z+2); SetBlock("wire ns", x, 8, z+2);
			}
			for (let zz=z+3; zz<options.Bus.d; zz++) {
				SetBlock("data slab", x, 7, zz);
				SetBlock("wire ns",   x, 8, zz);
			}
		} // end ns
	// instruction bus
	} else {
		// north branch
		if (ns) {
			SetBlock("inst block", x, 3, z  );
			SetBlock("inst block", x, 2, z-1); SetBlock("wire ns", x, 3, z-1);
			for (let zz=0; zz<z-1; zz++) {
				SetBlock("inst slab", x, 1, zz);
				SetBlock("wire ns",   x, 2, zz);
			}
		// south branch
		} else {
			SetBlock("inst block", x, 3, z  );
			if (bit < options.Bus.inst-1) {
				SetBlock("inst block", x, 2, z+1); SetBlock("wire ns", x, 3, z+1);
			}
			for (let zz=z+2; zz<options.Bus.d; zz++) {
				SetBlock("inst slab", x, 1, zz);
				SetBlock("wire ns",   x, 2, zz);
			}
		} // end ns
	}
}
*/
