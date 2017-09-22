volume = function () {
	var thing = thingTwisted(params.rayon, params.hautVase, params.rot);
	return thing.subtract(cylinder({r:params.largVerre, h:params.hautVase}).translate([0,0,0.2]));
};

function thingTwisted(radius, height, twistangle) {
  twistangle = twistangle || 0;

	var cag = CAG.circle({r: 10, resolution: params.nbC});

	var flatBottom = CSG.Polygon.createFromPoints(
		cag.getOutlinePaths()[0].points);
	
  var thing = flatBottom.solidFromSlices({
	numslices: params.nbPas+1
	,callback: function(t) {
		var coef = 1 - t;
		if (coef < 0.01) coef = 0.01;//must not collapse polygon
		var h = height * t;

		var c = cag.rotate([0,0,0], [0,0, (twistangle <0) ? -1 : 1], Math.abs(twistangle) * t).scale((params.diffHB -t)/2);
			

		return CSG.Polygon.createFromPoints(
			c.getOutlinePaths()[0].points
		).translate([0, 0, h]);
	}
  });
   return thing;
}

function getParameterDefinitions() {
  return [
	 { name: 't2',		type: 'group',	caption: "Vase"}
	,{ name: 'nbC',		type: 'float',	initial: 5,		caption: "Nb. Côtés:" }
	,{ name: 'rayon',	type: 'float',	initial: 10,	caption: "Rayon:" }
	,{ name: 'hautVase',type: 'float',	initial: 5,		caption: "Hauteur du vase:"}
	,{ name: 'rot',		type: 'float',	initial: 45,	caption: "Rotation (°):" }
 	,{ name: 'largVerre',type:'float',	initial: 0.5,	caption: "Largeur du verre(0-1):" }
 	,{ name: 'nbPas',   type: 'float',  initial: 4,     caption: "Nb. de pas" }
 	,{ name: 'diffHB',  type: 'float',  initial:3,      caption: "Différence largeur:" }
 	
 	,{ name: 't1',		type:'group',	caption: "Tranchage"}
	,{ name: 'hauteur',	type: 'float', 	initial: 20,	caption: "Hauteur du volume (cm):" }
	,{ name: 'epCarton', type: 'float', 	initial: 0.6,	caption: "Epaisseur du carton (cm):" }
	,{ name: 'mode', 	type: 'choice', initial: 3,		caption: "Mode:", 
		values:[3,2], captions:['vue 3D', 'vue 2D'] }
	];
}

function main(params) {
	var V, b, B, nbT, pas, T, i, n, c, l, d, T2, C;
	
    // 1) Récupère le volume
    V = volume();

    // 2) Création de sa boite englobante
    
    // 2a) Récupère ses coordonnées min et max
    b = V.getBounds(); // b[0]= coord. min et b[1]= coord. max de l'objet
    
    // 2b) Création de la boite englobante avec les coord. récupérées
    B = CSG.cube({corner1:b[0], corner2:b[1]});
    
    // 3) Tranchage selon les dimensions voulues (Hauteur, épaisseur carton)
    
    nbT = Math.ceil(params.hauteur / params.epCarton); // nb de tranches
    pas =  (b[1].z - b[0].z) / params.hauteur * params.epCarton; // hauteur d'une tranche
    
    T = []; // liste des tranches
    for(i = 0; i <= nbT; i++){
		B = CSG.cube({
			corner1:[b[0].x, b[0].y, b[0].z + i * pas],
			corner2:[b[1].x, b[1].y, b[0].z + (i+1) * pas]});
    
		B = B.intersect(V); // tranchage proprement dit
		B = color(i%2 ? "black": "tan", B); // mise en couleur
		// les paramètres de color() sont [Rouge, Vert, Bleu, Transparence] (allant de 0 à 1)
		T.push(B); // ajout à la liste des tranches
	}
 
  
    // pour afficher on retourne les objets voulus
    if(params.mode == 3){
		return T; // en 3D on retourne les tranches colorées
	}else{
		// en 2D on place les tranches sur le même plan
		n = Math.sqrt(nbT);
		c=0; l= 0;
		d = b[1].minus(b[0]);
		T2 = [];
		for(i in T){					
			// transforme la tranche en 2D
			C = cutY(T[i].lieFlat().rotateX(90));
			C = cutY(C,-1.0,true);
			C = projectY(C);			
			T2.push(C.translate([(c-n/2)*d.x, (l-n/2)*d.y]));
			if(c<n){
				c++;
			}else{
				c=0;
				l++;
			}
		}
		return T2;
	}
}

cutY = function (o,y,r) { // retourne une coupe de o
    if (y === undefined) y = 0;
    if (r === undefined) r = false;
    var p = CSG.Plane.fromPoints([100,y,0],[0,y,-100],[-100,y,100]);
    if (r === true) p = p.flipped();
    return o.cutByPlane(p);
}
projectY = function (o) {
    var p = CSG.OrthoNormalBasis.GetCartesian("X","Z");
    return o.projectToOrthoNormalBasis(p);
}
