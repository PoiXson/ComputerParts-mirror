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
// pxncomputer-progcount.js

// ---------------
//       BUS
// ---+-------+---
//    | PROG  |
//    | COUNT |
//    +-------+



options.ProgCount.w = (options.Bus.bits * 3);
options.ProgCount.d = 11;
options.ProgCount.bus_offset = getNextBusOffset(options.ProgCount.w, false);



function Clear_ProgCount() {
//TODO
	return true;
}



function Frame_ProgCount() {
	const block_frame = GetBlock("frame");
	DrawFrame(
		block_frame,
		options.ProgCount.bus_offset, 0, options.Bus.d-1,
		options.ProgCount.w, options.Bus.h, options.ProgCount.d+1
	);
	return true;
}



// ==================================================



function Build_ProgCount() {
	print("Building the Program Counter..");
	const x = options.ProgCount.bus_offset;
	const y = options.Bus.h - 1;
	const z = options.Bus.d;
//TODO
	// bus branch feeds
	Build_Inst_Bus_Branch_South(x+1);
	Build_Data_Bus_Branch_South(x+1);
	return true;
}
