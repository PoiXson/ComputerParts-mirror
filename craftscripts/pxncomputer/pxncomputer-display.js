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
// pxncomputer-display.js

//    +-------+
//    |       |
//    |  DSP  |
//    |       |
// ---+-------+---
//       BUS
// ---------------



options.Display.digits = Math.ceil(options.Bus.bits / 4);
options.Display.w     = (options.Display.digits * 12) + 1;
options.Display.d     = 39;
options.Display.dig_h = 15;
options.Display.h     = options.Bus.h + (options.Display.dig_h * 2) - 1;
options.Display.bus_w = (options.Bus.bits * 2) + 1;
options.Display.x = getNextBusOffset(options.Keypad.w, true);



function Stats_Display() {
	print("Dsp: " + options.Display.digits + " digits");
}



function Clear_Display() {
	let x = options.Display.x;
	let z = 1 - options.Bus.d;
	let w = options.Display.w;
	let h = options.Display.h + 1;
	let d = 0 - options.Display.d - 2;
	FillXYZ(
		"stone",
		x, 0, z,
		w, h, d
	);
	return true;
}



function Frame_Display() {
	const block_frame = GetBlock("frame");
	let x = options.Display.x;
	let y = options.Bus.h;
	let z = 1 - options.Bus.d;
	let w = options.Display.w;
	let h = options.Display.h;
	let d = 0 - options.Display.d;
	// display frame
	DrawFrame(
		block_frame,
		x, 0,   z,
		w, h+1, d
	);
	// frame under display
	for (let ix=0; ix<w; ix++) {
		SetBlock(block_frame, x+ix, y+1, z);
	}
	// decor frame
	if (options.Decor) {
		const dsp_case_block = GetBlock("blackstone");
		// top
		FillXYZ(
			dsp_case_block,
			x, h,  z,
			w, 1, -4
		);
		// bottom
		FillXYZ(
			dsp_case_block,
			x, y+1, z,
			w, 1,  -4
		);
		// west side
		FillXYZ(
			dsp_case_block,
			x, y+2,    z,
			1, h-y-2, -4
		);
		// east side
		FillXYZ(
			dsp_case_block,
			x+w-1, y+2,  z,
			1,   h-y-2, -4
		);
	}
	return true;
}



// ==================================================



function Build_Display() {
	print("Building the Display..");
	let x, y, z;
	let h, w;
	// fill screen
	z = 1 - options.Bus.d;
	h = options.Display.h - options.Bus.h - 2;
	w = options.Display.w - 2;
	const block_frame = GetBlock(options.Decor ? "blackstone" : "frame");
	let block;
	for (let iy=0; iy<h; iy++) {
		y = iy + options.Bus.h + 2;
		for (let ix=0; ix<w; ix++) {
			x = ix + options.Display.x + 1;
			if (iy > 10 &&  iy < 16) block = block_frame;
			else                     block = "snow_block";
			SetBlock(block, x, y, z);
		}
	}
	// display digits
	x = options.Display.x;
	y = options.Bus.h;
	z = 1 - options.Bus.d;
	// data display (bottom)
	BuildDisplayDigits(x, y, z);
	// instruct display (top)
	y += options.Display.dig_h + 1;
	BuildDisplayDigits(x, y, z);
	// data bus decoder
	x = options.Display.x + 1;
	y = 6;
	z = 0 - options.Bus.d - 6;
	BuildDisplayDecoder(x, y, z);
	// instruction bus decoder
	y += options.Display.dig_h + 1;
	BuildDisplayDecoder(x, y, z);
	// data bus
	x = options.Display.x + options.Display.w - 2;
	let func_x = function(bit) { return x - (bit * 3); };
	BuildBusBranch(x, true, true, ">", func_x);
	// instruction bus
	BuildBusBranch(x, true, false, ">", func_x);
	return true;
}



function BuildDisplayDecoder(x, y, z) {
	let xx, zz, io;
	let matrix;
	for (let num=0; num<16; num++) {
		zz = z - (num * 2);
		for (let bit=0; bit<options.Bus.bits; bit++) {
			xx = (x + options.Display.w) - (bit * 3) - 3;
			io = (num & Math.pow(2, bit%4));
			if (io) {
				matrix = [
					[  "~~~",  "   "  ],
					[  "--G",  "   "  ],
					[  "  i",  "   "  ],
					[  " ~G",  "   "  ],
					[  "|= ",  "|  "  ],
					[  "-  ",  "-  "  ],
				];
			} else {
				matrix = [
					[  "~~~",  "   "  ],
					[  "--R",  "   "  ],
					[  "  /",  "  R"  ],
					[  " ~R",  "  \\" ],
					[  "|= ",  "|  "  ],
					[  "-  ",  "-  "  ],
				];
			}
			// split decoder outputs for digits
			if (bit % 4 == 0) {
				matrix[0][0] = ReplaceAt(matrix[0][0], 0, "  ");
				matrix[1][0] = ReplaceAt(matrix[1][0], 0, "  ");
			}
			if (num == 0) {
				matrix[4][1] = ReplaceAt(matrix[4][1], 0, " ");
				matrix[5][1] = ReplaceAt(matrix[5][1], 0, " ");
			}
			// boosters
			if (num % 7 == 5) {
				matrix[4][1] = ReplaceAt(matrix[4][1], 0, "^");
			}
			SetBlockMatrix(
				{
					"i": "torch",
					"^": (di ? "repeat s" : "repeat n"),
					"/": "torch n",
					"\\":"torch s",
					"=": "data block",
					"-": "data slab",
					"G": "read tower",
					"R": "write tower",
				},
				matrix,
				xx, y, zz,
				"Xzy"
			);
			// decoder to bcd
			if (bit % 4 == 0) {
				if (bit % 8 == 0) {
					matrix = [
						"       ~",
						"SL~~~~~G",
						" iggggg ",
						" =      ",
					];
				} else {
					matrix = [
						"   ~ ",
						" G~LS",
						" ig  ",
						" =   ",
					];
				}
				SetBlockMatrix(
					{
						"=": "data block",
						"-": "data slab",
						"G": "read block",
						"g": "read slab",
						"i": "torch",
						"L": "lamp",
						"S": "birch_wall_sign[facing=" +
							(bit%8==0 ? "east" : "west") + "]||" + toHexChar(num),
					},
					matrix,
					xx, y+5, zz,
					"Xy"
				);
			}
		} // end bits
	} // end nums
	let line_block;
	for (let bit=0; bit<options.Bus.bits; bit++) {
		xx = (x + options.Display.w) - (bit * 3) - 3;
		// data bus connections
		for (let iz=0; iz<6; iz++) {
			zz = 0 - options.Bus.d - iz;
			if (iz == 0) line_block = "repeat s";
			else         line_block = "|";
			SetBlock("data slab", xx, 6, zz);
			SetBlock(line_block,  xx, 7, zz);
		}
	}
}



function BuildDisplayDigits(x, y, z) {
	let xx;
	for (let digit=0; digit<options.Display.digits; digit++) {
		xx = x + (digit * 8) + (Math.floor(digit/2) * 8) + 5;
		BuildDisplayDigit(xx, y+2, z);
	}
}



function BuildDisplayDigit(x, y, z) {
	SetBlockMatrix(
		{
			"X": "air",
			"x": "smooth_quartz",
			"~": "wire ew",
			"i": "torch",
			"/": "torch s",
			"^": "repeat n",
			"<": "repeat e",
			"=": "byte block",
			"-": "byte slab",
			".": "snow_block",
			"P": "sticky_piston[facing=south]",
		},
		[
			[  ".......",  "       ",  "       ",  "       ",  "  ~~~  ",  "    |~ ",  "     ~ "  ],
			[  "..XXX..",  "  xxx  ",  "  PPP  ",  "  ///  ",  "  ===  ",  "    -- ",  "     =|"  ],
			[  ".X...X.",  " x   x ",  " P   P ",  " /   / ",  " =   = ",  " |   | ",  " |   |-"  ],
			[  ".X...X.",  " x   x ",  " P   P ",  " |   | ",  "       ",  " -   - ",  " -   =~"  ],
			[  ".X...X.",  " x   x ",  " P   P ",  " =   = ",  "  ~~~  ",  " |~    ",  " ~    -"  ],
			[  "..XXX..",  "  xxx  ",  "  PPP  ",  "  ///  ",  "  ===  ",  " --    ",  " -    |"  ],
			[  ".X...X.",  " x   x ",  " P   P ",  " /   / ",  " =   = ",  " |   | ",  " |   |="  ],
			[  ".X...X.",  " x   x ",  " P   P ",  " |   | ",  "       ",  " -   - ",  " -   -|"  ],
			[  ".X...X.",  " x   x ",  " P   P ",  " =   = ",  "  ~~~  ",  "    |~|",  "      ="  ],
			[  "..XXX..",  "  xxx  ",  "  PPP  ",  "  ///  ",  "  ===  ",  "    ---",  "       "  ],
			[  ".......",  "       ",  "       ",  "       ",  "       ",  "       ",  "       "  ],
		],
		x, y, z,
		"xZy"
	);
	// segment signal lines
	let xx, yy, zz;
	let block;
	for (let seg=0; seg<7; seg++) {
		xx = x + 1;
		if (seg % 2 == 0)
			xx += 5;
		yy = y + seg + 2;
		for (let iz=0; iz<31; iz++) {
			zz = z - iz - 7;
			SetBlock("byte slab", xx, yy, zz);
			if (iz % 14 == 7) block = "repeat n";
			else              block = "wire ns";
			SetBlock(block, xx, yy+1, zz);
		}
	}
	// segment signal towers
	const segments = {
		"0": "abcdef",
		"1": "bc",
		"2": "abdeg",
		"3": "abcdg",
		"4": "bcfg",
		"5": "acdfg",
		"6": "acdefg",
		"7": "abc",
		"8": "abcdefg",
		"9": "abcdfg",
		"a": "abcefg",
		"b": "cdefg",
		"c": "adef",
		"d": "bcdeg",
		"e": "adefg",
		"f": "aefg",
	};
	let seg, seg_key;
	let repeater;
	for (let digit=0; digit<16; digit++) {
		zz = z - (digit * 2) - 7;
		seg_key = digit.toString(16);
		seg = segments[seg_key];
		for (let iy=0; iy<7; iy++) {
			xx = x + 3;
			if (iy % 2 == 0)
				xx++;
			yy = iy + y + 2;
			SetBlock("read slab", xx, yy,   zz);
			SetBlock("~",         xx, yy+1, zz);
			switch (iy) {
			case 0: if (!seg.includes("d")) continue; break;
			case 1: if (!seg.includes("e")) continue; break;
			case 2: if (!seg.includes("c")) continue; break;
			case 3: if (!seg.includes("g")) continue; break;
			case 4: if (!seg.includes("b")) continue; break;
			case 5: if (!seg.includes("f")) continue; break;
			case 6: if (!seg.includes("a")) continue; break;
			default: continue;
			}
			if (iy % 2 == 0) { xx++; repeater = "repeat w";
			} else {           xx--; repeater = "repeat e"; }
			SetBlock("read slab", xx, yy,   zz);
			SetBlock(repeater,    xx, yy+1, zz);
		}
	}
}
