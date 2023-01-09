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
// pxncomputer-keypad.js

// ---------------
//       BUS
// ---+-------+---
//    |  KEY  |
//    |  PAD  |
//    +-------+



options.Keypad.w = (options.Bus.bits * 3) + 4;
options.Keypad.d = 11;
options.Keypad.x = getNextBusOffset(options.Keypad.w, false);



function Clear_Keypad() {
	let x = options.Keypad.x;
	let w = options.Keypad.w;
	let h = options.Bus.h;
	let d = options.Keypad.d;
	FillXYZ(
		"air",
		x, 0, 0,
		w, h, d
	);
	return true;
}



function Frame_Keypad() {
	const block_frame = GetBlock("frame");
	let x = options.Keypad.x;
	let w = options.Keypad.w;
	let h = options.Bus.h;
	let d = options.Keypad.d;
	DrawFrame(
		block_frame,
		x, 0, 0,
		w, h, d
	);
	return true;
}



// ==================================================



function Build_Keypad() {
	print("Building the Keypad..");
	let x = options.Keypad.x;
	let y = options.Bus.h - 1;
	let z = 0;
	Build_Keypad_Panel(x, y, z);
	Build_Keypad_Bits(x, y, z);
	// data bus
	x += options.Keypad.w - 6;
	BuildBusBranch(x, false, true, "><",
		function(bit) { return (x - (bit * 3)) + (bit%2); }
	);
	// instruction bus
	BuildBusBranch(x, false, false, "<",
		function(bit) { return (x - (bit * 3)) + (bit%2); }
	);
	let xx = (x + options.Keypad.w) - 4;
//TODO
//	Build_Cycle_Counter(xx, y-6, z+16);
	return true;
}



function Build_Keypad_Panel(x, y, z) {
	// panel/floor
	for (let zz=0; zz<options.Keypad.d; zz++) {
		for (let xx=0; xx<options.Keypad.w; xx++) {
			let outline = (
				xx == 0 || xx == options.Keypad.w-1 ||
				zz == 0 || zz == options.Keypad.d-1
			);
			// leave space for lamps
			if (xx < options.Bus.bits * 3) {
				if (zz == 2 || zz == 3 || zz == 4) {
					let mod = xx % 6;
					if (mod == 2 || mod == 4) {
//						if (zz == 4) {
//							SetBlock(
//								options.Decor ? "wood slab a" : "frame",
//								x+xx, y-1, z+zz
//							);
//						}
						continue;
					}
				}
			} else
			// manual input lever
			if (zz == 3 && xx == options.Keypad.w-3) {
				SetBlockMatrix(
					{
						"|": "wire ns",
						"~": "wire ew",
						"i": "torch s",
						"/": "lever[face=floor,facing=north]",
						"L": "lamp",
						"=": "data block",
						"-": "data slab",
						"x": "cell block",
					},
					[
						"   /",
						"   L",
						"ix||",
						"----",
					],
					x+xx, y-2, z+zz+3,
					"Zy"
				);
				continue;
			}
			// floor fill
			if (options.Decor) {
				if (outline) {
					SetBlock("wood block b", x+xx, y, z+zz);
					continue;
				}
//TODO: fix this
//				if (zz == 4) {
//					SetBlock("wood block a", x+xx, y, z+zz);
//					continue;
//				}
				SetBlock("wood slab a", x+xx, y, z+zz);
				continue;
			// no decor
			} else
			if (options.Frame) {
				SetBlock("frame", x+xx, y, z+zz);
			}
		}
	}
}



function Build_Keypad_Bits(x, y, z) {
	for (let bit=0; bit<options.Bus.bits; bit+=2) {
		// manual input
		Build_Keypad_Input_Bit(x, y, z, bit);
		// instruction register
		Build_Keypad_Instr_Register_Bit(x, y, z, bit);
	}
	SetBlock("birch_wall_sign[facing=west]||Instruction|Register", x, y-3, z+9);
	SetBlock("birch_wall_sign[facing=east]||Instruction|Register", x+(options.Bus.bits*3), y-3, z+9);
}

// manual input
function Build_Keypad_Input_Bit(x, y, z, bit) {
	const tib = options.Bus.bits - bit - 2;
	const xx = x + (tib * 3) + 1;
	let matrix = [
		[ "      ",  "      ",  " / /  ",  "      ",  "      ",  "      " ],
		[ "      ",  "      ",  " x x  ",  " s S  ",  " L L  ",  "      " ],
		[ "~~~~~~",  "  |   ",  " |^|  ",  " c~c  ",  " x x  ",  " | |  " ],
		[ "------",  "  -   ",  " ---  ",  " x-x  ",  " v v  ",  " = =  " ],
		[ "      ",  " | |  ",  " | |  ",  " | |  ",  " = =  ",  "      " ],
		[ "      ",  " - -  ",  " - -  ",  " - -  ",  "      ",  "      " ],
		[ "      ",  "      ",  "      ",  "      ",  "      ",  "      " ],
		[ "      ",  "      ",  "      ",  "      ",  "      ",  "      " ],
	];
	if (tib == 0) {
		// cut end of manual input signal line
		matrix[2][0] = ReplaceAt(matrix[2][0], 0, "  ");
		matrix[3][0] = ReplaceAt(matrix[3][0], 0, "  ");
	}
	// booster
	if (bit > 0) {
		if (bit % 4 == 0) {
			matrix[2][0] = ReplaceAt(matrix[2][0], 5, "<");
		}
	}
	SetBlockMatrix(
		{
			"|": "wire ns",
			"~": "wire ew",
			"v": "repeat n",
			"^": "repeat s",
			"<": "repeat e",
			"c": "compars s",
			"/": "lever[face=floor,facing=north]",
			"L": "lamp",
			"=": "data block",
			"-": "data slab",
			"x": "cell block",
			"s": "birch_wall_sign[facing=south]|Bit "+(bit+2)+"|[+"+Math.pow(2, bit+1)+"]",
			"S": "birch_wall_sign[facing=south]|Bit "+(bit+1)+"|[+"+Math.pow(2, bit  )+"]",
		},
		matrix,
		xx, y-6, z+6,
		"xZy"
	);
}

// instruction register
function Build_Keypad_Instr_Register_Bit(x, y, z, bit) {
	const tib = options.Bus.bits - bit - 2;
	const xx = x + (tib * 3) + 1;
	matrix = [
		[ "      ",  "      ",  " L L  ",  "      ",  "      " ],
		[ "      ",  " | |  ",  " x x  ",  "      ",  "      " ],
		[ " | |  ",  " = =  ",  "      ",  "      ",  "      " ],
		[ "~= =~ ",  "x   x ",  "v<~>v ",  "|| || ",  " c~c  " ],
		[ "=   = ",  "|   | ",  "--=-- ",  "-- -- ",  " -=-  " ],
		[ "      ",  "+   + ",  "| i | ",  "|   | ",  "| i | ",  "|   | ",  "|| || ",  "      ",  "      ",  "      ",  "      " ],
		[ "      ",  "  |   ",  "_ = _ ",  "_   _ ",  "_ = _ ",  "_ | _ ",  "_+ +_ ",  " | |  ",  "      ",  "      ",  "      " ],
		[ "~~~~~~",  "  =   ",  "      ",  "      ",  "      ",  "  =   ",  "~~~~~~",  " + +  ",  " | |  ",  " | |  ",  " ^ ^  " ],
		[ "------",  "      ",  "      ",  "      ",  "      ",  "      ",  "------",  "      ",  " _ _  ",  " _ _  ",  " _ _  " ],
	];
	// fix first bit
	if (bit == 0) {
		matrix[7][9]  = ReplaceAt(matrix[7][9],  3, "^");
		matrix[6][10] = ReplaceAt(matrix[6][10], 3, "|");
		matrix[7][10] = ReplaceAt(matrix[7][10], 3, "+");
		matrix[8][10] = ReplaceAt(matrix[8][10], 3, " ");
	}
	// cut end of signal lines
	if (tib == 0) {
		matrix[7][0] = ReplaceAt(matrix[7][0], 0, "  ");
		matrix[8][0] = ReplaceAt(matrix[8][0], 0, "  ");
		matrix[7][6] = ReplaceAt(matrix[7][6], 0, "  ");
		matrix[8][6] = ReplaceAt(matrix[8][6], 0, "  ");
	}
	// control line boosters
	if (bit > 0 && bit % 4 == 0) {
		matrix[7][0] = ReplaceAt(matrix[7][0], 5, "<");
		matrix[7][6] = ReplaceAt(matrix[7][6], 5, "<");
	}
	SetBlockMatrix(
		{
			"|": "wire ns",
			"~": "wire ew",
			"i": "torch",
			"/": "torch n",
			"v": "repeat n",
			"^": "repeat s",
			"<": "repeat e",
			">": "repeat w",
			"c": "compars n",
			"L": "lamp",
			"=": "data block",
			"-": "data slab",
			"x": "cell block",
			"+": "inst block",
			"_": "inst slab",
		},
		matrix,
		xx, y-8, z+10,
		"xZy"
	);
}



function Build_Cycle_Counter(x, y, z) {
	SetBlockMatrix(
		{
			"~": "wire ew",
			"i": "torch",
			"/": "torch s",
			"7": "torch n",
			"^": "repeat s",
			">": "repeat e",
			"<": "repeat w",
			"c": "compars w",
			"C": "compars e",
			"L": "lamp",
			"=": "data block",
			"-": "data slab",
			"x": "inst block",
		},
		[
			[ "            ",  "  ~~c~~c~   ",  "    |  |    " ],
			[ "            ",  " ~=--=--=   ",  "    -  -    " ],
			[ "  x  x  x   ",  "~=/  /  /   ",  "            " ],
			[ "7 i  i  i   ",  "=           ",  "            " ],
			[ "~>x~>x>Cx>Cx",  " ^  ^ ^| ^| ",  " ~<~~<~<~~  " ],
			[ "--|--|--|--|",  " -  - -- -- ",  " ---------  " ],
			[ "  =  =  =  =",  "            ",  "            " ],
		],
		x, y, z,
		"Xzy"
	);
}
