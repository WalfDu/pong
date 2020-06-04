const tailleFenetreJeu = 800;
const nbjoueurs = 6;
var pol = {
	cote: 0,
	angleCentre: 0,
	angleCote: 0,
	beta: 0,
	dt: [],
	sommets: [],
	ptx: [],
	pty: [],
	couleurBord: []
};
const cercle = {
	Ox: tailleFenetreJeu / 2,
	Oy: tailleFenetreJeu / 2,
	rayon: tailleFenetreJeu / 2,
	couleur: '#151515'
};

function polygone(tailleFenetreJeu, nbjoueurs) {
	//cote est la longueur d'un côté du polygone
	pol.cote = tailleFenetreJeu * Math.sin(Math.PI / nbjoueurs);
	//angleCentre est l'angle au milieu du polygone, au sommmet du triangle ayant pour base un côté du polygone.
	pol.angleCentre = 2 * Math.PI / nbjoueurs;
	//anglePol est l'angle entre 2 côtés du polygone
	pol.angleCote = Math.PI * (nbjoueurs - 2) / nbjoueurs;
	//beta est l'angle entre la normale et un côté (i+1) du polygone
	pol.beta = [(Math.PI - pol.angleCote) / 2 + Math.PI - pol.angleCentre / 2];
	//dtPol est une liste telle que pour toutes les droites des côtés aient pour équation y = dtPol[i][0] * x + dtPol[i][1]
	pol.dt = [];
	//ptpolx et ptpoly sont les coordonnées en x et en y des sommets du polygone
	pol.sommets = [
		//[tailleFenetreJeu / 2 + pol.cote / 2, tailleFenetreJeu - Math.sqrt(tailleFenetreJeu ** 2 - pol.cote ** 2) / 2]
	];
	pol.ptx = [tailleFenetreJeu / 2 + pol.cote / 2];
	pol.pty = [tailleFenetreJeu - Math.sqrt(tailleFenetreJeu ** 2 - pol.cote ** 2) / 2];
	for (let i = 0; i <= nbjoueurs; i++) {
		pol.ptx.push(tailleFenetreJeu / 2 * (1 + Math.sin(pol.angleCentre * i + Math.PI - pol.angleCentre / 2)));
		pol.pty.push(tailleFenetreJeu / 2 * (1 - Math.cos(pol.angleCentre * i + Math.PI - pol.angleCentre / 2)));
		pol.sommets.push([
			tailleFenetreJeu / 2 * (1 + Math.sin(pol.angleCentre * i + Math.PI - pol.angleCentre / 2)),
			tailleFenetreJeu / 2 * (1 - Math.cos(pol.angleCentre * i + Math.PI - pol.angleCentre / 2))
		]);
		pol.beta.push(Math.PI - pol.angleCote + pol.beta[i - 1]);
	}
	for (i = 2; i <= nbjoueurs; i++) {
		pol.sommets.push([
			tailleFenetreJeu / 2 * (1 + Math.sin(pol.angleCentre * i + Math.PI - pol.angleCentre / 2)),
			tailleFenetreJeu / 2 * (1 - Math.cos(pol.angleCentre * i + Math.PI - pol.angleCentre / 2))
		]);
	}
	for (let i = 0; i < nbjoueurs; i++) {
		pol.couleurBord.push('#' + ((Math.random() * 0xffffff) << 0).toString(16));
		console.log('%c couleurBord:', 'background:' + pol.couleurBord[i]);
	}
}
polygone(tailleFenetreJeu, nbjoueurs);

//dtPol
for (i = 0; i < nbjoueurs - 1; i++) {
	a = (pol.sommets[i + 1][1] - pol.sommets[i][1]) / (pol.sommets[i + 1][0] - pol.sommets[i][0]);
	b = pol.sommets[i][1] - a * pol.sommets[i][0];
	pol.dt.push([a, b]);
}

function initialisation() {
	setInterval(affichage, 20);
	//creation du canvas
	canvas.width = tailleFenetreJeu;
	canvas.height = tailleFenetreJeu;
	canvas.style = 'position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border:2px solid';

	//affichage du polygone
	var ctx = canvas.getContext('2d');
	/*ctx.beginPath();
	for (i = 1; i <= nbjoueurs; i++) {
		ctx.moveTo(pol.sommets[i][0], pol.sommets[i][1]);
		ctx.lineTo(
			pol.sommets[i][0] - pol.cote * Math.cos(pol.beta[i - 1]) / 5,
			pol.sommets[i][1] - pol.cote * Math.sin(pol.beta[i - 1]) / 5
		);
		ctx.moveTo(pol.sommets[i][0], pol.sommets[i][1]);
		ctx.lineTo(
			pol.sommets[i][0] + pol.cote * Math.cos(pol.beta[i]) / 5,
			pol.sommets[i][1] + pol.cote * Math.sin(pol.beta[i]) / 5
		);
		ctx.strokeStyle = 'white';
		ctx.stroke();
	}
	ctx.closePath();*/

	// affichage cercle
	ctx.beginPath();
	ctx.arc(cercle.Ox, cercle.Oy, cercle.rayon, Math.PI * 2, false);
	ctx.closePath();
	ctx.fillStyle = cercle.couleur;
	ctx.fill();

	//dtPol
	for (i = 0; i <= nbjoueurs; i++) {
		a = (pol.sommets[i + 1][1] - pol.sommets[i][1]) / (pol.sommets[i + 1][0] - pol.sommets[i][0]);
		b = pol.sommets[i][1] - a * pol.sommets[i][0];
		pol.dt.push([a, b]);
	}
}

function affichage() {
	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		//creation du canvas
		/*canvas.width = largeur;
        canvas.height = hauteur;
        canvas.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border:2px solid";
        */

		//affichage du polygone
		for (i = 0; i < nbjoueurs; i++) {
			ctx.beginPath();
			ctx.moveTo(pol.sommets[i][0], pol.sommets[i][1]);
			ctx.lineTo(
				(pol.sommets[i + 1][0] + 4 * pol.sommets[i][0]) / 5,
				(pol.sommets[i + 1][1] + 4 * pol.sommets[i][1]) / 5
			);
			ctx.moveTo(pol.sommets[i + 1][0], pol.sommets[i + 1][1]);
			ctx.lineTo(
				(pol.sommets[i][0] + 4 * pol.sommets[i + 1][0]) / 5,
				(pol.sommets[i][1] + 4 * pol.sommets[i + 1][1]) / 5
			);
			ctx.lineWidth = 2;
			ctx.strokeStyle = pol.couleurBord[i];
			ctx.stroke();
			ctx.closePath();
		}
	}
}

document.addEventListener('keydown', function(event) {
	//fleche gauche
	if (event.keyCode === 32) {
		if (balle.vx !== 0) {
			ballx = balle.vx;
			bally = balle.vy;
			balle.vx = 0;
			balle.vy = 0;
		} else {
			balle.vx = ballx;
			balle.vy = bally;
		}
	}
});
