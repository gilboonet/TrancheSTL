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
