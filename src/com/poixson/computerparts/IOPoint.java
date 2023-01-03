package com.poixson.computerparts;

import org.bukkit.Location;


public class IOPoint {

	public final IOType type;
	public final int    bit;

	public final Location locBlock;
	public final Location locSign;



	public IOPoint(final IOType type, final int bit,
	final Location locBlock, final Location locSign) {
		this.type = type;
		this.bit  = bit;
		this.locBlock = locBlock;
		this.locSign  = locSign;
	}



	public void blink(final boolean state) {
//TODO
	}
	public void blinkRestore() {
//TODO
	}



}
