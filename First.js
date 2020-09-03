const nbjoueurs = 8
const tailleFenetreJeu = 800
const pol = {
	cote: 0,
	angleCentre: 0,
	angleInterieur: 0,
	angleCote: 0,
	dt: [],
	sommets: [],
	couleurBord: [],
	rayonAcceleration: 0
}
var balle = {
	rayon: 8,
	couleur: '#fff',
	x: tailleFenetreJeu / 2,
	xsuiv: this.x,
	y: tailleFenetreJeu / 2,
	ysuiv: this.y,
	v: 5,
	vStop: 0,
	angle: Math.random() * 2 * Math.PI,
	impact: [0, 0]
}
var palette = {
	milieu: [],
	taille: [],
	couleur: [],
	vitesse: []
}

function formationPolygone() {
	//cette fonction sert à déterminer toutes les variables du polygone
	//cote est la longueur d'un côté du polygone
	pol.cote = tailleFenetreJeu * Math.sin(Math.PI / nbjoueurs)
	//angleCentre est l'angle au milieu du polygone, au sommmet du triangle ayant pour base un côté du polygone.
	pol.angleCentre = 2 * Math.PI / nbjoueurs
	//rayonAcceleration est le rayon du cercle centré au milieu dans lequel la balle ne peut pas être en dehors du polygone
	pol.rayonAcceleration = tailleFenetreJeu / 2 * Math.cos(pol.angleCentre / 2) - 30
	//angleInterieur est l'angle entre 2 côtés du polygone
	pol.angleInterieur = Math.PI * (nbjoueurs - 2) / nbjoueurs
	//angleCote est l'angle entre la normale et un côté (i+1) du polygone
	pol.angleCote = [0 * [(Math.PI - pol.angleInterieur) / 2 + Math.PI - pol.angleCentre / 2]]
	//sommets sont les coordonnées en x et en y des sommets du polygone
	pol.sommets = []
	//dt est une liste telle que pour toutes les droites des côtés aient pour équation y = dtPol[i][0] * x + dtPol[i][1]
	pol.dt = []
	for (let i = 0; i <= nbjoueurs + 1; i++) {
		pol.sommets.push([
			tailleFenetreJeu / 2 * (1 + Math.sin(pol.angleCentre * i + Math.PI - pol.angleCentre / 2)),
			tailleFenetreJeu / 2 * (1 - Math.cos(pol.angleCentre * i + Math.PI - pol.angleCentre / 2))
		])
		pol.angleCote.push(Math.PI - pol.angleInterieur + pol.angleCote[i])
	}
	for (i = 0; i <= nbjoueurs; i++) {
		a = (pol.sommets[i + 1][1] - pol.sommets[i][1]) / (pol.sommets[i + 1][0] - pol.sommets[i][0])
		b = pol.sommets[i][1] - a * pol.sommets[i][0]
		pol.dt.push([a, b])
	}
	for (let i = 0; i < nbjoueurs; i++) {
		pol.couleurBord.push('#' + ((Math.random() * 0xffffff) << 0).toString(16))
		console.log('%c couleurBord:', 'background:' + pol.couleurBord[i], i)
	}
}
function formationPalette() {
	//cette fonction sert à déterminer toutes les variables relatives aux palettes
	//le milieu est le centre de la palette, donc situé à l'origine au centre de chaque côté du polygone
	for (let i = 0; i < nbjoueurs; i++) {
		palette.milieu.push(2.5)
		palette.taille.push(1)
		palette.couleur.push(pol.couleurBord[i])
		palette.vitesse.push(0.1)
	}
}
function background() {
	//cette fonction sert à former le jeu (polygone plus palettes)
	var ctx = canvas.getContext('2d')
	//affichage du polygone
	for (i = 0; i < nbjoueurs; i++) {
		ctx.beginPath()
		ctx.moveTo(pol.sommets[i][0], pol.sommets[i][1])
		ctx.lineTo(pol.sommets[i + 1][0], pol.sommets[i + 1][1])
		ctx.moveTo(pol.sommets[i + 1][0], pol.sommets[i + 1][1])
		ctx.lineTo(pol.sommets[i][0], pol.sommets[i][1])
		ctx.lineWidth = 3
		ctx.strokeStyle = '#222'
		ctx.stroke()
		ctx.closePath()
	}
	for (i = 0; i < nbjoueurs; i++) {
		ctx.beginPath()
		ctx.moveTo(pol.sommets[i][0], pol.sommets[i][1])
		ctx.lineTo((pol.sommets[i + 1][0] + 4 * pol.sommets[i][0]) / 5, (pol.sommets[i + 1][1] + 4 * pol.sommets[i][1]) / 5)
		ctx.moveTo(pol.sommets[i + 1][0], pol.sommets[i + 1][1])
		ctx.lineTo((pol.sommets[i][0] + 4 * pol.sommets[i + 1][0]) / 5, (pol.sommets[i][1] + 4 * pol.sommets[i + 1][1]) / 5)
		ctx.lineWidth = 3
		ctx.strokeStyle = pol.couleurBord[i]
		ctx.stroke()
		ctx.closePath()
	}
	//affichage des palettes
	for (i = 0; i < nbjoueurs; i++) {
		ctx.beginPath()
		ctx.moveTo(
			((palette.milieu[i] - palette.taille[i] / 2) * pol.sommets[i][0] + (5 - palette.milieu[i] + palette.taille[i] / 2) * pol.sommets[i + 1][0]) /
				5,
			((palette.milieu[i] - palette.taille[i] / 2) * pol.sommets[i][1] + (5 - palette.milieu[i] + palette.taille[i] / 2) * pol.sommets[i + 1][1]) /
				5
		)
		ctx.lineTo(
			((palette.milieu[i] + palette.taille[i] / 2) * pol.sommets[i][0] + (5 - palette.milieu[i] - palette.taille[i] / 2) * pol.sommets[i + 1][0]) /
				5,
			((palette.milieu[i] + palette.taille[i] / 2) * pol.sommets[i][1] + (5 - palette.milieu[i] - palette.taille[i] / 2) * pol.sommets[i + 1][1]) /
				5
		)
		ctx.lineWidth = 3
		ctx.strokeStyle = palette.couleur[i]
		ctx.stroke()
		ctx.closePath()
	}
}
function rebondBordPolygone(i) {
	if (
		(pol.sommets[i][0] - balle.v < balle.xsuiv && balle.xsuiv < (pol.sommets[i + 1][0] + 4 * pol.sommets[i][0]) / 5) ||
		(pol.sommets[i][0] + balle.v > balle.xsuiv && balle.xsuiv > (pol.sommets[i + 1][0] + 4 * pol.sommets[i][0]) / 5)
	) {
		return 2 * pol.angleCote[i] - balle.angle
	} else if (
		(pol.sommets[i + 1][0] - balle.v < balle.xsuiv && balle.xsuiv < (pol.sommets[i][0] + 4 * pol.sommets[i + 1][0]) / 5) ||
		(pol.sommets[i + 1][0] + balle.v > balle.xsuiv && balle.xsuiv > (pol.sommets[i][0] + 4 * pol.sommets[i + 1][0]) / 5)
	) {
		return 2 * pol.angleCote[i] - balle.angle
	} else if (
		(pol.sommets[i][1] - balle.v < balle.ysuiv && balle.ysuiv < (pol.sommets[i + 1][1] + 4 * pol.sommets[i][1]) / 5) ||
		(pol.sommets[i][1] + balle.v > balle.ysuiv && balle.ysuiv > (pol.sommets[i + 1][1] + 4 * pol.sommets[i][1]) / 5)
	) {
		return 2 * pol.angleCote[i] - balle.angle
	} else if (
		(pol.sommets[i + 1][1] - balle.v < balle.ysuiv && balle.ysuiv < (pol.sommets[i][1] + 4 * pol.sommets[i + 1][1]) / 5) ||
		(pol.sommets[i + 1][1] + balle.v > balle.ysuiv && balle.ysuiv > (pol.sommets[i][1] + 4 * pol.sommets[i + 1][1]) / 5)
	) {
		return 2 * pol.angleCote[i] - balle.angle
	} else {
		balle.x = tailleFenetreJeu / 2
		balle.y = tailleFenetreJeu / 2
		console.log('Le joueur ' + i + ' a perdu le point')
		return Math.random() * 2 * Math.PI
	}
}
function rebondPalette(i) {}
function impactBalle() {
	//cette fonction sert à déterminer le point d'impacte de la balle sur le polygone
}
function balleHorsCercleAcceleration() {
	for (let i = 0; i < nbjoueurs; i++) {
		//cas particulier des bords verticaux
		if (pol.angleCote[i] == Math.PI / 2) {
			if (balle.xsuiv < pol.sommets[i][0]) {
				balle.angle = rebondBordPolygone(i)
			}
		}
		if (pol.angleCote[i] == 3 * Math.PI / 2) {
			if (balle.xsuiv > pol.sommets[i][0]) {
				balle.angle = rebondBordPolygone(i)
			}
		}
		//cas des bords dont la balle est au dessus si elle est dans le polygone
		if (Math.PI / 2 < pol.angleCote[i] && pol.angleCote[i] < 3 * Math.PI / 2) {
			if (balle.ysuiv < pol.dt[i][0] * balle.xsuiv + pol.dt[i][1]) {
				balle.angle = rebondBordPolygone(i)
			}
		}
		//cas des bords dont la balle est en dessous si elle est dans le polygone
		if ((0 <= pol.angleCote[i] && pol.angleCote[i] < Math.PI / 2) || (3 * Math.PI / 2 < pol.angleCote[i] && pol.angleCote[i] < 2 * Math.PI)) {
			if (balle.ysuiv > pol.dt[i][0] * balle.xsuiv + pol.dt[i][1]) {
				balle.angle = rebondBordPolygone(i)
			}
		}
	}
}
function rebond() {
	if (Math.abs(balle.x - tailleFenetreJeu / 2) ** 2 + Math.abs(balle.y - tailleFenetreJeu / 2) ** 2 > pol.rayonAcceleration ** 2) {
		balleHorsCercleAcceleration()
	}
}
function deplacementBalle() {
	balle.xsuiv = balle.x + balle.v * Math.cos(balle.angle)
	balle.ysuiv = balle.y + balle.v * Math.sin(balle.angle)
	/*	if (balle.xsuiv < balle.rayon) {
		console.log('    rebond tout à gauche');
		if (balle.angle < Math.PI) {
			balle.angle -= 2 * Math.abs(balle.angle - Math.PI / 2);
		} else {
			balle.angle += 2 * Math.abs(balle.angle - 3 * Math.PI / 2);
		}
	} else if (balle.xsuiv > tailleFenetreJeu - balle.rayon) {
		console.log('     rebond tout à droite');
		if (balle.angle < Math.PI) {
			balle.angle += 2 * Math.abs(balle.angle - Math.PI / 2);
		} else {
			balle.angle -= 2 * Math.abs(balle.angle - 3 * Math.PI / 2);
		}
	} else if (balle.ysuiv < balle.rayon) {
		console.log('    rebond tout en haut');
		if (balle.angle < 3 * Math.PI / 2) {
			balle.angle = -balle.angle;
		} else {
			balle.angle = -balle.angle;
		}
	} else if (balle.ysuiv > tailleFenetreJeu - balle.rayon) {
		console.log('   rebond tout en bas');
		if (balle.angle < Math.PI / 2) {
			balle.angle = -balle.angle;
		} else {
			balle.angle = -balle.angle;
		}
	}*/
	rebond()
	balle.xsuiv = balle.x + balle.v * Math.cos(balle.angle)
	balle.ysuiv = balle.y + balle.v * Math.sin(balle.angle)
	balle.x = balle.xsuiv
	balle.y = balle.ysuiv
}

function initialisation() {
	setInterval(affichage, 20)
	//creation du canvas
	canvas.width = tailleFenetreJeu
	canvas.height = tailleFenetreJeu
	canvas.style = 'position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border:2px solid'
	formationPolygone()
	formationPalette()
	background()
}
function affichage() {
	var canvas = document.getElementById('canvas')
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d')
		//creation du canvas
		canvas.width = tailleFenetreJeu
		canvas.height = tailleFenetreJeu
		canvas.style = 'position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border:2px solid'
		background()

		//Déplacement de la balle
		balle.x += balle.v * Math.cos(balle.angle)
		balle.y += balle.v * Math.sin(balle.angle)

		ctx.beginPath()
		ctx.arc(balle.x, balle.y, balle.rayon, 0, Math.PI * 2)
		ctx.closePath()
		ctx.fillStyle = balle.couleur
		ctx.fill()
	}
	deplacementBalle()
}

document.addEventListener('keydown', function(event) {
	//fleche gauche
	if (event.keyCode === 32) {
		if (balle.v !== 0) {
			balle.vStop = balle.v
			balle.v = 0
		} else {
			balle.v = balle.vStop
		}
	}
})

//Déplacement des palettes
document.addEventListener('keydown', function(event) {
	for (i = 0; i < nbjoueurs; i++) {
		if (event.keyCode == 37) {
			if (palette.milieu[i] - palette.taille[i] / 2 > 1) {
				palette.milieu[i] -= palette.vitesse[i]
			}
			if (palette.milieu[i] - palette.taille[i] / 2 < 1) {
				palette.milieu[i] = palette.taille[i] / 2 + 1
			}
		}
		if (event.keyCode == 39) {
			if (palette.milieu[i] + palette.taille[i] / 2 < 4) {
				palette.milieu[i] += palette.vitesse[i]
			}
			if (palette.milieu[i] - palette.taille[i] / 2 > 4) {
				palette.milieu[i] = 4 - palette.taille[i] / 2
			}
		}
	}
})
