package com.poixson.computerparts;

import java.util.Iterator;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicReference;

import org.bukkit.ChatColor;
import org.bukkit.entity.Player;

import com.poixson.commonmc.tools.plugin.xJavaPlugin;
import com.poixson.commonmc.tools.wizards.Wizard;
import com.poixson.computerparts.commands.Commands;
import com.poixson.computerparts.parts.ChatConsoleListener;


public class ComputerPartsPlugin extends xJavaPlugin {
	public static final String LOG_PREFIX  = "[Computer] ";
	public static final String CHAT_PREFIX = ChatColor.AQUA + LOG_PREFIX + ChatColor.WHITE;

	// listeners
	protected final AtomicReference<Commands>         commandListener = new AtomicReference<Commands>(null);
	protected final AtomicReference<ChatConsoleListener> chatListener = new AtomicReference<ChatConsoleListener>(null);

	protected final CopyOnWriteArraySet<ComputerPart> parts   = new CopyOnWriteArraySet<ComputerPart>();
	protected final CopyOnWriteArraySet<Wizard>       wizards = new CopyOnWriteArraySet<Wizard>();
	protected final ConcurrentHashMap<UUID, Blinker> blinkers = new ConcurrentHashMap<UUID, Blinker>();

	@Override public int getSpigotPluginID() { return 108149; }
	@Override public int getBStatsID() {       return 17232;  }



	public ComputerPartsPlugin() {
		super(ComputerPartsPlugin.class);
	}



	@Override
	public void onEnable() {
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



}
