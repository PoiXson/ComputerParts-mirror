package com.poixson.computerparts;

import java.util.Iterator;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicReference;

import org.bukkit.entity.Player;

import com.poixson.commonmc.tools.plugin.xJavaPlugin;
import com.poixson.commonmc.tools.wizards.Wizard;
import com.poixson.computerparts.commands.Commands;
import com.poixson.computerparts.parts.ChatConsoleListener;


public class ComputerPartsPlugin extends xJavaPlugin {
	protected static final String LOG_PREFIX  = "[Computer] ";
//TODO
	protected static final int SPIGOT_PLUGIN_ID = 0;
	protected static final int BSTATS_PLUGIN_ID = 17232;

	protected static final AtomicReference<ComputerPartsPlugin> instance = new AtomicReference<ComputerPartsPlugin>(null);

	// listeners
	protected final AtomicReference<Commands>         commandListener = new AtomicReference<Commands>(null);
	protected final AtomicReference<ChatConsoleListener> chatListener = new AtomicReference<ChatConsoleListener>(null);

	protected final CopyOnWriteArraySet<ComputerPart> parts   = new CopyOnWriteArraySet<ComputerPart>();
	protected final CopyOnWriteArraySet<Wizard>       wizards = new CopyOnWriteArraySet<Wizard>();
	protected final ConcurrentHashMap<UUID, Blinker> blinkers = new ConcurrentHashMap<UUID, Blinker>();



	public ComputerPartsPlugin() {
		super(ComputerPartsPlugin.class);
	}



	@Override
	public void onEnable() {
		if (!instance.compareAndSet(null, this))
			throw new RuntimeException("Plugin instance already enabled?");
		super.onEnable();
		// commands listener
		{
			final Commands listener = new Commands(this);
			final Commands previous = this.commandListener.getAndSet(listener);
			if (previous != null)
				previous.unregister();
			listener.register();
		}
	}

	@Override
	public void onDisable() {
		super.onDisable();
		// unload emulators
		{
			final Iterator<ComputerPart> it = this.parts.iterator();
			while (it.hasNext()) {
				final ComputerPart part = it.next();
				part.unload();
				it.remove();
			}
		}
		// commands listener
		{
			final Commands listener = this.commandListener.getAndSet(null);
			if (listener != null)
				listener.unregister();
		}
		// stop blinkers
		for (final Blinker blink : this.blinkers.values()) {
			blink.unload();
		}
		// listeners
		{
			final ChatConsoleListener listener = this.chatListener.getAndSet(null);
			if (listener != null)
				listener.unregister();
		}
		if (!instance.compareAndSet(this, null))
			(new RuntimeException("Disable wrong instance of plugin?")).printStackTrace();
	}



	// -------------------------------------------------------------------------------



	public boolean toggleBlink(final Player player) {
		final UUID uuid = player.getUniqueId();
		final Blinker blink = this.blinkers.remove(uuid);
		if (blink != null) {
			blink.unload();
			return false;
		} else {
			final Blinker b = new Blinker(this, player);
			this.blinkers.put(uuid, b);
			return true;
		}
	}



	// -------------------------------------------------------------------------------



	@Override
	protected int getSpigotPluginID() {
		return SPIGOT_PLUGIN_ID;
	}
	@Override
	protected int getBStatsID() {
		return BSTATS_PLUGIN_ID;
	}



}
