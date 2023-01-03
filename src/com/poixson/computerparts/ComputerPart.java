package com.poixson.computerparts;

import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicBoolean;


public abstract class ComputerPart {

	protected final AtomicBoolean removed = new AtomicBoolean(false);

	public final CopyOnWriteArraySet<IOPort> ports = new CopyOnWriteArraySet<IOPort>();



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
