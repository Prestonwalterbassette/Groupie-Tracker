document.addEventListener('DOMContentLoaded', function () {
	const listEl = document.getElementById('favoritesList');
	if (!listEl || !window.GTFavorites) return;

	function render() {
		const favorites = window.GTFavorites.getAll();
		listEl.innerHTML = '';

		if (!favorites.length) {
			const empty = document.createElement('p');
			empty.className = 'muted';
			empty.textContent = 'Aucun artiste en favori pour le moment.';
			listEl.appendChild(empty);
			return;
		}

		favorites.forEach(function (artist) {
			const card = document.createElement('article');
			card.className = 'favorite-card';

			if (artist.image) {
				const media = document.createElement('div');
				media.className = 'favorite-card__media';
				const img = document.createElement('img');
				img.src = artist.image;
				img.alt = artist.name || 'Artiste';
				img.loading = 'lazy';
				media.appendChild(img);
				card.appendChild(media);
			}

			const body = document.createElement('div');
			body.className = 'favorite-card__body';

			const title = document.createElement('h3');
			title.textContent = '⭐ ' + (artist.name || 'Artiste');
			body.appendChild(title);

			if (artist.creationDate) {
				const creation = document.createElement('p');
				creation.className = 'muted';
				creation.textContent = 'Création: ' + artist.creationDate;
				body.appendChild(creation);
			}

			if (artist.firstAlbum) {
				const album = document.createElement('p');
				album.className = 'muted';
				album.textContent = 'Premier album: ' + artist.firstAlbum;
				body.appendChild(album);
			}

			const actions = document.createElement('div');
			actions.className = 'favorite-card__actions';
			const removeBtn = document.createElement('button');
			removeBtn.type = 'button';
			removeBtn.className = 'favorite-btn is-favorite';
			removeBtn.textContent = 'Retirer des favoris';
			removeBtn.addEventListener('click', function () {
				window.GTFavorites.remove(artist.id);
				render();
			});
			actions.appendChild(removeBtn);

			body.appendChild(actions);
			card.appendChild(body);
			listEl.appendChild(card);
		});
	}

	render();
});
