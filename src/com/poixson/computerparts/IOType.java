package com.poixson.computerparts;


public enum IOType {
	INPUT_CLOCK   (false),
	INPUT_ADDRESS (false),
	INPUT_DATA    (false),
	OUTPUT_SIGNAL (true),
	OUTPUT_ADDRESS(true),
	OUTPUT_DATA   (true);

	public final boolean isOutput;
	public final boolean isInput;



	IOType(final boolean isOutput) {
		this.isOutput = isOutput;
		this.isInput = !isOutput;
	}



}
