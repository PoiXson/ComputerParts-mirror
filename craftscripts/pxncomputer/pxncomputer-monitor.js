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
// pxncomputer-monitor.js

//    +-------+
//    |       |
//    |  MON  |
//    |       |
// ---+-------+---
//       BUS
// ---------------



// find minimum bits needed for monitor bus
{
	let hw = Math.max(options.Monitor.size_x, options.Monitor.size_y);
	for (let i=1; i<129; i++) {
		let val = Math.pow(2, i);
		if (val >= hw) {
			options.Monitor.bits = i;
			break;
		}
	}
	if (options.Monitor.bits <= 0)
		options.Monitor.bits = 4;
}

options.Monitor.w = (options.Monitor.size_x * 2) + 2;
options.Monitor.h = (options.Monitor.size_y * 2) + 2;
options.Monitor.bus_w = (options.Monitor.bits * 3);
options.Monitor.bus_d = 30;
options.Monitor.bus_offset = getNextBusOffset(options.Monitor.w, true);



function Stats_Monitor() {
	print("Mon: "+options.Monitor.size_x+"x"+options.Monitor.size_y+" bits: "+options.Monitor.bits);
}



function Clear_Monitor() {
//TODO
	return true;
}



function Frame_Monitor() {
	const block_frame = GetBlock("frame");
	DrawFrame(
		block_frame,
		options.Monitor.bus_offset, options.Bus.h+2, -1,
		options.Monitor.w, options.Monitor.h, 0-options.Monitor.bus_d
	);
	// bus connection
	{
		const xx = Math.floor(options.Monitor.w/2) - Math.floor(options.Monitor.bus_w/2) + options.Monitor.bus_offset;
		DrawFrame(
			block_frame,
			xx, 0, 0,
			options.Monitor.bus_w, options.Bus.h, 0-options.Monitor.bus_d
		);
	}
	return true;
}



// ==================================================



function Build_Monitor() {
	print("Building the Monitor..");
	Build_Monitor_Screen(options.Monitor.bus_offset, options.Bus.h+2, -1);
	return true;
}



function Build_Monitor_Screen(x, y, z) {
	// decor frame
	if (options.Decor) {
		const mon_case_block = GetBlock("blackstone");
		// top
		FillXYZ(
			mon_case_block,
			x, y+options.Monitor.h-1, z,
			options.Monitor.w, 1, -3
		);
		// bottom
		FillXYZ(
			mon_case_block,
			x, y, z,
			options.Monitor.w, 1, -3
		);
		// west side
		FillXYZ(
			mon_case_block,
			x, y+1, z,
			1, options.Monitor.h-2, -3
		);
		// east side
		FillXYZ(
			mon_case_block,
			x+options.Monitor.w-1, y+1, z,
			1, options.Monitor.h-2, -3
		);
	} // end decor
	const blocks = {
		"|": "wire ns",
		">": "repeat n",
		"/": "torch s",
		"P": "sticky_piston[facing=south]",
		"=": "data block",
		"-": "data slab",
		"#": "snow_block",
	};
	let xxx, yyy, matrix;
	// grid of pixels
	for (let yy=0; yy<options.Monitor.size_y; yy++) {
		yyy = y + (yy * 2) + 1;
		for (let xx=0; xx<options.Monitor.size_x; xx++) {
			xxx = x + (xx * 2) + 1;
			SetBlockMatrix(
				blocks,
				[
					[  "=/P #",  "=/P #"  ],
					[  "  P #",  "  P #"  ],
				],
				xxx, yyy, z-4,
				"zxy"
			);
			if (xx % 2 == 0) {
				matrix = [
					[  "  ||",  "|>|>"  ],
					[  "  --",  "----"  ],
				];
			} else {
				matrix = [
					[  " |>|",  "||>>"  ],
					[  " ---",  "----"  ],
				];
			}
			SetBlockMatrix(
				blocks,
				matrix,
				xxx, yyy, z-8,
				"zxy"
			);
		} // end for xx
	} // end for yy
}
