(function () {
	const STORAGE_KEY = 'groupie_tracker_favorites_v1';

	function read() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		} catch (_) {
			return [];
		}
	}

	function write(items) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	}

	function normalizeArtist(artist) {
		return {
			id: Number(artist.id),
			name: artist.name || 'Artiste',
			image: artist.image || '',
			creationDate: artist.creationDate || '',
			firstAlbum: artist.firstAlbum || '',
			members: Array.isArray(artist.members) ? artist.members : []
		};
	}

	function getAll() {
		return read();
	}

	function isFavorite(artistId) {
		const id = Number(artistId);
		return read().some(function (a) { return Number(a.id) === id; });
	}

	function add(artist) {
		const next = read();
		const normalized = normalizeArtist(artist);
		if (!next.some(function (a) { return Number(a.id) === normalized.id; })) {
			next.push(normalized);
			write(next);
		}
		return next;
	}

	function remove(artistId) {
		const id = Number(artistId);
		const next = read().filter(function (a) { return Number(a.id) !== id; });
		write(next);
		return next;
	}

	function toggle(artist) {
		if (isFavorite(artist.id)) {
			return { favorite: false, list: remove(artist.id) };
		}
		return { favorite: true, list: add(artist) };
	}

	window.GTFavorites = {
		getAll: getAll,
		isFavorite: isFavorite,
		add: add,
		remove: remove,
		toggle: toggle
	};
})();
