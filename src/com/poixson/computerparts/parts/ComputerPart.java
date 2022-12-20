package com.poixson.computerparts.parts;

import java.util.concurrent.atomic.AtomicBoolean;


public abstract class ComputerPart {

	protected final AtomicBoolean removed = new AtomicBoolean(false);



	public ComputerPart() {
	}

	public void unload() {
	}



	public boolean isRemoved() {
		return this.removed.get();
	}
	public boolean setRemoved() {
		return this.removed.getAndSet(true);
	}



}
