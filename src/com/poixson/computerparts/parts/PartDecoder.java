package com.poixson.computerparts.parts;

import java.util.HashMap;

import org.bukkit.Location;

import com.poixson.computerparts.ComputerPart;


public class PartDecoder extends ComputerPart {

	protected final HashMap<Integer, Location> inputs, outputs;



	public PartDecoder(
			final HashMap<Integer, Location> inputs,
			final HashMap<Integer, Location> outputs) {
		super();
		this.inputs  = inputs;
		this.outputs = outputs;
		ValidateIO(inputs);
		ValidateIO(outputs);
	}



	public static void ValidateIO(final HashMap<Integer, Location> io) {
	}



}
