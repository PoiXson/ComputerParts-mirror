package com.poixson.computerparts.parts;

import java.util.HashMap;

import org.bukkit.Location;

import com.poixson.computerparts.ComputerPart;


public class PartMapScreen extends ComputerPart {

	protected final HashMap<Integer, Location> maps;
	protected final HashMap<Integer, Location> inputs;



	public PartMapScreen(
			final HashMap<Integer, Location> maps,
			final HashMap<Integer, Location> inputs) {
		super();
		this.maps   = maps;
		this.inputs = inputs;
		ValidateMaps(maps);
		ValidateIO(inputs);
	}



	public static void ValidateMaps(final HashMap<Integer, Location> maps) {
	}

	public static void ValidateIO(final HashMap<Integer, Location> io) {
	}



}
