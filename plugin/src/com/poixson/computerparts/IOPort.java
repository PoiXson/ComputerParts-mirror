package com.poixson.computerparts;

import java.util.HashMap;

import org.bukkit.Location;
import org.bukkit.entity.Player;


public class IOPort {

	public final IOType type;
	public final int    bits;

	protected final HashMap<Integer, IOPoint> points;



	public IOPort(final IOType type, final int bits,
			final HashMap<Integer, IOPoint> points) {
		this.type = type;
		this.bits = bits;
		this.points = points;
	}



	public void blink(final boolean state) {
		for (final IOPoint point : this.points.values()) {
			point.blink(state);
		}
	}
	public void blinkRestore() {
		for (final IOPoint point : this.points.values()) {
			point.blinkRestore();
		}
	}



	public double distance(final Player player) {
		final Location loc = player.getLocation();
		double lowest = Integer.MAX_VALUE;
		double distance;
		for (final IOPoint point : this.points.values()) {
			distance = loc.distance( point.locBlock );
			if (lowest > distance)
				lowest = distance;
		}
		return lowest;
	}



}
