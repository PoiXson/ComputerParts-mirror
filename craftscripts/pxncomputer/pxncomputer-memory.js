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
// pxncomputer-memory.js

// +-----+-----+
// |     |     |
// | RAM | CTL |
// |     |     |
// +-----+-----*----
// |  MEM BUS  | BUS
// +-----+-----+----
// |     |     |
// | RAM | CTL |
// |     |     |
// +-----+-----+



// find memory size
options.Memory.pages     = 0;
options.Memory.page_part = 0;
{
	let size = options.Memory.size;
	while (size > 0) {
		if (size < options.Memory.page_size) {
			options.Memory.page_part = size;
			break;
		}
		options.Memory.pages++;
		size -= options.Memory.page_size;
	}
}
options.Memory.w = (options.Bus.bits * 3) + 2;
options.Memory.d = (Math.min(options.Memory.page_size, options.Memory.size) * 4) + 6;
options.Memory.h = 10;
options.Memory.bus_d = (options.Bus.bits * 3);
options.Memory.ctl_w = (options.Bus.bits * 3) + 2;



function Stats_Memory() {
	print("Mem: "+options.Memory.size);
}



function Clear_Memory() {
	let w = 1 - options.Memory.ctl_w - options.Memory.w;
	let d = 1 - options.Memory.bus_d - options.Memory.d;
	FillXYZ(
		"air",
		0, 0, 0,
		w, options.Memory.h, d
	);
	return true;
}



function Frame_Memory() {
	const block_frame = GetBlock("frame");
	let x, y, z, d;
	let m4, m8, ns;
	let pages = (options.Memory.page_part>0 ? options.Memory.pages+1 : options.Memory.pages);
	for (let page=0; page<pages; page++) {
		m4 = page % 4;
		m8 = page % 8;
		ns = (m8 < 4);
		x = 1 - options.Memory.ctl_w - ((options.Memory.w-1) * m4);
		z = (ns ? 1-options.Memory.bus_d : 0);
		y = Math.floor(page / 8.0) * (options.Memory.h-1);
		d = (ns ? 0-options.Memory.d : options.Memory.d);
		// memory bus
		if (m8 == 0) {
			DrawFrame(
				block_frame,
				0, y, 0,
				0-options.Memory.ctl_w, options.Memory.h, 0-options.Memory.bus_d
			);
		}
		// page bus
		if (ns) {
			DrawFrame(
				block_frame,
				x, y, 0,
				0-options.Memory.w, options.Memory.h, 0-options.Memory.bus_d
			);
		}
		// memory control
		if (m4 == 0) {
			DrawFrame(
				block_frame,
				0, y, z,
				0-options.Memory.ctl_w, options.Memory.h, d
			);
		}
		// memory page
		DrawFrame(
			block_frame,
			x, y, z,
			0-options.Memory.w, options.Memory.h, d
		);
	}
	return true;
}



// ==================================================



function Build_Memory() {
	print("Building the Memory..");
	let x, y, z, d;
	let m4, m8, ns;
	let pages = (options.Memory.page_part>0 ? options.Memory.pages+1 : options.Memory.pages);
	let pageLevel = 0;
	let hasPageAbove, hasPageSouth;
	for (let page=0; page<pages; page++) {
		m4 = page % 4;
		m8 = page % 8;
		ns = (m8 < 4);
		if (m8 == 0 && page > 0)
			pageLevel++;
		x = 1 - options.Memory.ctl_w - ((options.Memory.w-1) * m4);
		z = (ns ? 1-options.Memory.bus_d : 0);
		y = Math.floor(page / 8.0) * (options.Memory.h-1);
		d = (ns ? 0-options.Memory.d : options.Memory.d);
		hasPageAbove = (Math.floor((pages-1)/8.0) > pageLevel);
//TODO
hasPageSouth = false;
		// memory bus connection
		if (m8 == 0) {
			BuildMemoryBus(y, pageLevel, hasPageAbove, hasPageSouth);
			BuildMemoryAddressRegister(x, y, z, ns);
		}
		// page bus
		if (ns)
			BuildMemoryPageBus(x, y, z, hasPageSouth);
		// memory output gates
		BuildMemoryOutGates(x, y, z, ns);
		// memory control
		if (m4 == 0)
			BuildMemoryControl(x, y, z, page);
		// memory page
		BuildMemoryPage(x, y, z, page);
	}
	return true;
}



// --------------------------------------------------
// bus



function BuildMemoryBus(y, pageLevel, hasPageAbove, hasPageSouth) {
	let xx, zz;
	for (let bit=0; bit<options.Bus.bits; bit++) {
		let tib = options.Bus.bits - bit - 1;
		// system bus links
		zz = 0 - (bit * 3) - 1;
		let ix = (
			pageLevel > 0
			? (tib * 3) + 2
			: 1
		);
		for (; ix<options.Memory.ctl_w; ix++) {
			xx = 0 - ix;
			SetBlock("data slab", xx, y+5, zz);
			// repeater
			if (tib > 0) {
				if (ix == (tib * 3) + 1) {
					SetBlock("repeat w", xx, y+6, zz);
					continue;
				}
				if (ix == (tib * 3)) {
					SetBlock("repeat e", xx, y+6, zz);
					continue;
				}
			}
			SetBlock("wire ew", xx, y+6, zz);
		}
		// memory address bus offshoots
		xx = 0 - (tib * 3) - 2;
		BuildBusBranchBit(xx, y+5, bit, true,  true);
		if (hasPageSouth)
		BuildBusBranchBit(xx, y+5, bit, false, true);
		// spiral between page levels
		if (hasPageAbove) {
			xx = 0 - (tib * 3) - 3;
			let zz = (tib * 3) - options.Memory.bus_d;
			let r = 0;
			let last = (tib == 0);
			if (last) {
				zz += 3;
				r = 3;
			}
			DrawSpiral2x2("cell block", xx, y+8, zz, options.Memory.h-4, r, !last);
			DrawSpiral2x2("wire",       xx, y+9, zz, options.Memory.h-4, r, !last);
		}
		// connect to spiral below
		if (pageLevel > 0) {
			xx = 0 - (tib * 3) - 3;
			zz = 0 - (bit * 3) - 1;
			SetBlock("cell block", xx, y+5, zz);
		}
	} // end bits
}



function BuildMemoryPageBus(x, y, z, hasPageSouth) {
	let xx, zz;
	for (let bit=0; bit<options.Bus.bits; bit++) {
		let tib = options.Bus.bits - bit - 1;
		zz = z + (bit * 3) + 1;
		for (let ix=1; ix<options.Memory.w; ix++) {
			xx = (x - ix);
			SetBlock("data slab", xx, y+5, zz);
			SetBlock("wire ew",   xx, y+6, zz);
		}
		// memory page bus offshoots
		xx = x - (tib * 3) - 2;
		BuildBusBranchBit(xx, y+5, bit, true,  true);
		if (hasPageSouth)
		BuildBusBranchBit(xx, y+5, bit, false, true);
	}
}



// --------------------------------------------------
// input/output



function BuildMemoryOutGates(x, y, z, ns) {
	let blocks = {
		"i": "torch",
		"^": "repeat " +(ns ? "n" : "s"),
		"C": "compars "+(ns ? "n" : "s"),
		"=": "byte block",
		"-": "byte slab",
		"_": "data slab",
		"+": "data block",
		"L": (options.Decor ? "lamp"        : "air"),
		"W": (options.Decor ? "lamp base"   : "lamp"),
		".": (options.Decor ? "wood slab a" : "air"),
		",": (options.Decor ? "wood slab c" : "air"),
	};
	let matrix = [
		[  "......",  ",L,,L,",  "......"  ],
		[  " C~~C ",  " W  W ",  " ^  ^ "  ],
		[  " _=-_ ",  " _  _ ",  " _  _ "  ],
		[  "  i   ",  "      ",  "      "  ],
		[  "  =   ",  "      ",  "      "  ],
	];
	let zz = (ns ? z-1 : z+1);
	for (let bit=0; bit<options.Bus.bits; bit+=2) {
		xx = (x - options.Memory.ctl_w) + (bit * 3) + 7;
		SetBlockMatrix(
			blocks,
			matrix,
			xx, y+4, zz,
			(ns ? "XZy" : "Xzy")
		);
	}
}



// memory address register
function BuildMemoryAddressRegister(x, y, z, ns) {
	let blocks = {
		"l": "repeat s",
		"r": "repeat e",
		"R": "repeat w",
		"i": "torch",
		"/": "torch s",
		"=": "byte block",
		"-": "byte slab",
		"_": "data slab",
		"L": (options.Decor ? "lamp"        : "air"),
		"W": (options.Decor ? "lamp base"   : "lamp"),
		".": (options.Decor ? "wood slab a" : "air"),
		",": (options.Decor ? "wood slab c" : "air"),
	};
	let matrix = [
		[  "......",  "......",  "L,,,L,"  ],
		[  "||  | ",  "lR~rl ",  "W|  W "  ],
		[  "__  _ ",  "_-=-_ ",  "__.._."  ],
		[  "      ",  "  i   ",  "      "  ],
		[  "      ",  "  =   ",  "      "  ],
	];
	let xx;
	for (let bit=0; bit<options.Bus.bits; bit+=2) {
		xx = x + (bit * 3) + 6;
		SetBlockMatrix(
			blocks,
			matrix,
			xx, y+4, z-1,
			(ns ? "XZy" : "Xzy")
		);
	}
}



// --------------------------------------------------
// memory control



function BuildMemoryControl(x, y, z, page) {
	const mem_size  = options.Memory.size;
	const page_size = options.Memory.page_size;
	let ns = ((page % 8) < 4);
	let byt = page * page_size;
	let zz;
	for (let ib=0; ib<page_size; ib++) {
		if (byt > mem_size)
			break;
		zz = (
			ns
			? z - (ib * 4) - 4
			: z + (ib * 4) + 4
		);
		BuildMemoryByteRW(           x, y, zz, byt, ns);
		BuildMemoryAddressDecoderRow(x, y, zz, byt, ns);
		byt++;
	}
}



// byte read/write control lines
function BuildMemoryByteRW(x, y, z, byt, ns) {
	let blocks = {
		"i": "torch",
		"/": "torch w",
		"!": "repeat e",
		"C": "compars e",
		"L": "lamp",
		"=": "byte block",
		"-": "byte slab",
		"G": "read block",
		"g": "read slab",
		"R": "write block",
		"r": "write slab",
		"s": "birch_wall_sign[facing=east]|Byte "+byt+"|"+toHex(byt),
	};
	let matrix = [
		[  "      ",  "      ",  " sL   ",  "      "  ],
		[  "  |   ",  "  |   ",  "  L   ",  "      "  ],
		[  " |=   ",  "  -   ",  "  ~~  ",  "      "  ],
		[  " =/   ",  " |    ",  "  ==!=",  "      "  ],
		[  "      ",  " -  ~C",  "    -|",  "  ~~~C"  ],
		[  "      ",  "   ~GG",  "     -",  " ~RrrR"  ],
		[  "| |   ",  "| |G  ",  "| |   ",  "|R|   "  ],
		[  "r g   ",  "r g   ",  "r g   ",  "r g   "  ],
	];
	// first
	matrix[3][1] += "i   "; matrix[3][3] += "i   ";
	matrix[4][1] += "G   "; matrix[4][3] += "R   ";
	matrix[5][1] += "~~~~"; matrix[5][3] += "~~~~";
	matrix[6][1] += "gggg"; matrix[6][3] += "rrrr";
	matrix[7][1] += "    "; matrix[7][3] += "    ";
	for (let bit=4; bit<options.Bus.bits; bit+=2) {
		// boosted
		if (bit % 4 == 2) {
			matrix[3][1] += "  i   "; matrix[3][3] += "  i   ";
			matrix[4][1] += "~!G   "; matrix[4][3] += "~!R   ";
			matrix[5][1] += "GG~~~~"; matrix[5][3] += "RR~~~~";
			matrix[6][1] += "  gggg"; matrix[6][3] += "  rrrr";
			matrix[7][1] += "      "; matrix[7][3] += "      ";
		// normal
		} else {
			matrix[3][1] += "  i   "; matrix[3][3] += "  i   ";
			matrix[4][1] += " ~G   "; matrix[4][3] += " ~R   ";
			matrix[5][1] += "~g~~~~"; matrix[5][3] += "~r~~~~";
			matrix[6][1] += "G~Gggg"; matrix[6][3] += "R~Rrrr";
			matrix[7][1] += " g    "; matrix[7][3] += " r    ";
		}
	}
	// last
	matrix[3][1] += "  i   "; matrix[3][3] += "  i   ";
	matrix[4][1] += " ~G   "; matrix[4][3] += " ~R   ";
	matrix[5][1] += "~G    "; matrix[5][3] += "~R    ";
	matrix[6][1] += "g     "; matrix[6][3] += "r     ";
	matrix[7][1] += "      "; matrix[7][3] += "      ";
	SetBlockMatrix(
		blocks,
		matrix,
		x+2, y+1, z,
		(ns ? "XZy" : "Xzy")
	);
}



// byte select decoder
function BuildMemoryAddressDecoderRow(x, y, z, byt, ns) {
//TODO: const last = (byt >= options.Memory.size-1);
	let zz = z - 3;
	let blocks = {
		"!": "repeat s",
		"/": "torch w",
		"=": "data block",
		"-": "data slab",
		"G": "read tower",
		"R": "write tower",
		"X": "byte block",
		"x": "byte slab",
		".": (options.Decor ? "wood slab a" : "air"),
		",": (options.Decor ? "wood slab b" : "air"),
	};
	const num_bits = Math.min(4, options.Bus.bits);
	let matrix;
	let xx, io;
	for (let bit=0; bit<num_bits; bit++) {
		xx = x + (bit * 3) + 1;
		io = (byt & Math.pow(2, bit));
		if (io) {
			matrix = [
				[  "    ",  "    ",  "    "  ],
				[  "    ",  "||||",  "    "  ],
				[  ".,..",  "-G--",  ".,.."  ],
				[  " ~  ",  " ~  ",  " ~  "  ],
				[  " x  ",  " x  ",  " x  "  ],
			];
		} else {
			matrix = [
				[  "    ",  " || ",  "    "  ],
				[  "    ",  "|R=|",  "    "  ],
				[  ".,..",  "-R!=",  ".,.."  ],
				[  " ~  ",  " ~- ",  " ~  "  ],
				[  " x  ",  " x  ",  " x  "  ],
			];
		}
		// torch on side
		if (io) {
			matrix[2][0] = ReplaceAt(matrix[2][0], 1, "/");
		}
		// booster
		if (byt%4 == 3) {
			if (io) {
				matrix[1][1] = ReplaceAt(matrix[1][1], 2, "!");
			} else {
				matrix[0][1] = ReplaceAt(matrix[0][1], 1, " ");
				matrix[1][1] = ReplaceAt(matrix[1][1], 1, "|");
				matrix[0][1] = ReplaceAt(matrix[0][1], 2, " ");
				matrix[1][1] = ReplaceAt(matrix[1][1], 2, " ");
			}
		}
		SetBlockMatrix(
			blocks,
			matrix,
			xx, y+4, zz,
			"zxy"
		);
	}
}



// --------------------------------------------------
// memory page



function BuildMemoryPage(x, y, z, page) {
	const mem_size  = options.Memory.size;
	const page_size = options.Memory.page_size;
	let ns = ((page % 8) < 4);
	let byt = page * page_size;
	let zz;
	for (let ib=0; ib<page_size; ib++) {
		byt++;
		if (byt > mem_size)
			break;
		zz = (
			ns
			? z - (ib * 4) - 4
			: z + (ib * 4) + 4
		);
		BuildMemoryByteRow(x, y+6, zz, byt, ns);
	}
}

// memory row (1 byte)
function BuildMemoryByteRow(x, y, z, byt, ns) {
	let xx;
	for (let bit=0; bit<options.Bus.bits; bit+=2) {
		xx = x - ((bit * 3) + 1);
		// memory cell (2 bits)
		BuildMemoryCell(xx, y, z, byt, bit, ns);
	}
}

// memory cell (2 bits)
function BuildMemoryCell(x, y, z, byt, bit, ns) {
	const islast  = (bit >= options.Bus.bits-2);
	const blocks = {
		"r": "repeat e",
		"R": "repeat w",
		"l": "repeat " +(ns ? "n" : "s"),
		"C": "compars "+(ns ? "n" : "s"),
		"-": "cell slab",
		"=": "cell block",
		"_": "byte slab",
		"+": "byte block",
		"L": (options.Decor ? "lamp"        : "air" ),
		"x": (options.Decor ? "lamp base"   : "lamp"),
		".": (options.Decor ? "wood slab a" : "air" ),
		",": (options.Decor ? "wood slab b" : "air" ),
		":": (options.Decor ? "wood block a" : "cell block" ),
		";": (options.Decor ? "wood slab b"  : "cell slab"  ),
	};
	let matrix = [
		[  "      ",  "  | | ",  "  | | ",  "  | | "  ],
		[  "..|.|.",  "..:.:.",  ",L;,;L",  "..:.:."  ],
		[  " |= =|",  " CR~rC",  " x   x",  " lR~rl"  ],
		[  " -- --",  " --+--",  " -   -",  " --+--"  ],
	];
	SetBlockMatrix(
		blocks,
		matrix,
		x, y, z,
		(ns ? "XZy" : "Xzy")
	);
}
