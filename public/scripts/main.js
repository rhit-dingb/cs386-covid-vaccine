
var rhit = rhit || {};

rhit.FB_COLLECTION_MOVIEQUOTES = "MovieQuotes";
rhit.FB_KEY_QUOTE = "quote";
rhit.FB_KEY_MOVIE = "movie";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.fbMovieQuotesManager = null;
rhit.fbSingleQuoteManager = null;

//From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.ListPageController = class {
	constructor() {

		rhit.fbMovieQuotesManager.beginListening(this.updateList.bind(this));

		$("#addQuoteDialog").on("show.bs.modal", () => {
			document.querySelector("#inputQuote").value = "";
			document.querySelector("#inputMovie").value = "";
		});

		$("#addQuoteDialog").on("shown.bs.modal", () => {
			document.querySelector("#inputQuote").focus();
		});

		document.querySelector("#submitAddQuote").onclick = (event) => {
			const quote = document.querySelector("#inputQuote").value;
			const movie = document.querySelector("#inputMovie").value;
			console.log(quote, movie);
			rhit.fbMovieQuotesManager.add(quote, movie);
		};

	}
	updateList() {
		//console.log("Update the quotes list on the page.", this);
		const newList = htmlToElement("<div id='quoteListContainer'></div>")
		for (let k = 0; k < rhit.fbMovieQuotesManager.length; k++) {
			const movieQuote = rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(k);
			const newCard = this._createCard(movieQuote);
			newCard.onclick = (event) => {
				console.log(` Save the id ${movieQuote.id} then change pages`);
				// rhit.storage.setMovieQuoteId(movieQuote.id);
				window.location.href = `/moviequote.html?id=${movieQuote.id}`;
			};
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#quoteListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
	}

	_createCard(movieQuote) {
		return htmlToElement(`<div id="${movieQuote.id}" class="card">
		<div class="card-body">
			<h5 class="card-title">${movieQuote.quote}</h5>
			<h6 class="card-subtitle mb-2 text-muted">${movieQuote.movie}</h6>
		</div>
	</div>`);
	}
}

rhit.MovieQuote = class {
	constructor(id, quote, movie) {
		this.id = id;
		this.quote = quote;
		this.movie = movie;
	}
}


rhit.FbMovieQuotesManager = class {
	constructor() {
		console.log("create movieQuotesManager");
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_MOVIEQUOTES);
		this._unsubscribe = null;
	}
	add(quote, movie) {
		console.log(`add quote ${quote}`);
		console.log(`add movie ${movie}`);

		this._ref.add({
			[rhit.FB_KEY_QUOTE]: quote,
			[rhit.FB_KEY_MOVIE]: movie,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});
	}



	// Add a new document with a generated id.


	beginListening(changeListener) {
		this._unsubscribe = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50).onSnapshot((querySnapshot) => {
			console.log("movie quote update!");
			this._documentSnapshots = querySnapshot.docs;
			// querySnapshot.forEach((doc) => {
			//     console.log(doc.data());
			// });
			changeListener();
		});
	}
	stopListening() {
		this._unsubscribe();
	}
	//update(id, quote, movie) {    }
	//delete(id) { }
	get length() {
		return this._documentSnapshots.length;
	}
	getMovieQuoteAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const mq = new rhit.MovieQuote(
			docSnapshot.id, docSnapshot.get(rhit.FB_KEY_QUOTE), docSnapshot.get(rhit.FB_KEY_MOVIE)
		);
		return mq;
	}
}


rhit.DetailPageController = class {
	constructor() {
		rhit.fbSingleQuoteManager.beginListening(this.updateView.bind(this));

		$("#editQuoteDialog").on("show.bs.modal", () => {
			document.querySelector("#inputQuote").value = rhit.fbSingleQuoteManager.quote;
			document.querySelector("#inputMovie").value = rhit.fbSingleQuoteManager.movie;
		});
		$("#editQuoteDialog").on("shown.bs.modal", () => {
			document.querySelector("#inputQuote").focus();
		});
		document.querySelector("#submitEditQuote").onclick = (event) => {
			const quote = document.querySelector("#inputQuote").value;
			const movie = document.querySelector("#inputMovie").value;
			console.log(quote, movie);
			rhit.fbSingleQuoteManager.update(quote, movie);
		};

		document.querySelector("#submitDeleteQuote").onclick = (event) => {
			rhit.fbSingleQuoteManager.delete().then(() => {
				window.location.href = "/"; // Go back to the list of quotes.
		});;
		};

	}
	updateView() {
		document.querySelector("#cardQuote").innerHTML = rhit.fbSingleQuoteManager.quote;
		document.querySelector("#cardMovie").innerHTML = rhit.fbSingleQuoteManager.movie;
		//removed http so that it will auto put in the current protocol "http:"
		let apiUrl = `//www.omdbapi.com/?apikey=f60ee6e9&t=${rhit.fbSingleQuoteManager.movie}`;
		
		//console.log(promise.Response); ---> return undefined because asynchronous		
		let promise  = fetch(apiUrl).then(r => {return r.json();   }).then(jsonData=>{
			
			console.log(jsonData.Poster);
			document.querySelector(`#cardPoster`).innerHTML = `<img src = ${jsonData.Poster}>`;
			
		});
	}

	// async updatePoster() {
	// 	let apiUrl = `//www.omdbapi.com/?apikey=f60ee6e9&t=${rhit.fbSingleQuoteManager.movie}`;
	// 	let response  = await fetch(apiUrl); //force promise to complete and gives an response back
	// 	let jsonData = await JSON.parse(response);
	// 	console.log(jsonData);
	// 	console.log("end of update poster");
	// }
}

rhit.FbSingleQuoteManager = class {
	constructor(movieQuoteId) {
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_MOVIEQUOTES).doc(movieQuoteId);
		console.log(`Listing to ${this._ref.path}`);
	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				this._document = doc;
				changeListener();
			} else {
				console.log("No such element!");
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}
	update(quote, movie) {
		this._ref.update({
			[rhit.FB_KEY_QUOTE]: quote,
			[rhit.FB_KEY_MOVIE]: movie,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		}).then(() => {
			console.log("Document has been updated");
		});
	}
	delete() {
		return this._ref.delete();
	 }

	get quote() {
		return this._document.get(rhit.FB_KEY_QUOTE);
	}

	get movie() {
		return this._document.get(rhit.FB_KEY_MOVIE);
	}


}



// rhit.storage = rhit.storage || {};
// rhit.storage.MOVIEQUOTE_ID_KEY = "movieQuoteId";
// rhit.storage.getMovieQuoteId = function () {
// 	const mqID = sessionStorage.getItem(rhit.storage.MOVIEQUOTE_ID_KEY);
// 	if (!mqID) {
// 		console.log("no movie quote id in the session Storage!");
// 	}
// }

// rhit.storage.setMovieQuoteId = function (movieQuoteId) {
// 	sessionStorage.setItem(rhit.storage.MOVIEQUOTE_ID_KEY, movieQuoteId);
// }


/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	if (document.querySelector("#listPage")) {
		//console.log("you are on the list page");
		rhit.fbMovieQuotesManager = new rhit.FbMovieQuotesManager();
		new rhit.ListPageController();
	}
	if (document.querySelector("#detailPage")) {
		//console.log("you are on the detail page");
		//const movieQuoteId = rhit.storage.getMovieQuoteId();
		//console.log(`Detail page for ${movieQuoteId}`);


		const queryString = window.location.search;
		console.log(queryString);
		const urlParams = new URLSearchParams(queryString);
		const movieQuoteId = urlParams.get("id");


		if (!movieQuoteId) {
			console.log("Error! Missing moview quote Id!");
			window.location.href = "/";
		}
		rhit.fbSingleQuoteManager = new rhit.FbSingleQuoteManager(movieQuoteId);
		new rhit.DetailPageController();
	}


	//quick and dirty firestore example
	// const ref = firebase.firestore().collection("MovieQuotes");
	// ref.onSnapshot((querySnapshot) => {
	//     querySnapshot.forEach((doc) => {
	// 		console.log(doc.data());
	//     });
	// });

	// ref.add({
	// 	quote: "My first test",
	// 	movie: "My first movie"
	// });

};

rhit.main();
