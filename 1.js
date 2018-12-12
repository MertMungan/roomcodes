var createScene = function() {
    var scene = new BABYLON.Scene(engine);
  
    // camera
    var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, Math.PI / 3, 25, new BABYLON.Vector3(0, 0, 4.5), scene);
      camera.attachControl(canvas, true);
  
      var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(5, 10, 0), scene);
      
      
      var corner = function (x, y) {
          return new BABYLON.Vector3(x, 0, y);
      }
      
      
      var wall = function(corner) {
          this.corner = corner;
      }
      
      var map = function(walls, ply, height, scene) {
      
          var outerData = [];
          var angle = 0;
          var direction = 0;
          var line = BABYLON.Vector3.Zero();
          walls[1].corner.subtractToRef(walls[0].corner, line);
          var nextLine = BABYLON.Vector3.Zero();
          walls[2].corner.subtractToRef(walls[1].corner, nextLine);
          var nbWalls = walls.length;
          for(var w = 0; w <= nbWalls; w++) {	
              angle = Math.acos(BABYLON.Vector3.Dot(line, nextLine)/(line.length() * nextLine.length()));
              direction = BABYLON.Vector3.Cross(nextLine, line).normalize().y;
              lineNormal = new BABYLON.Vector3(line.z, 0, -1 * line.x).normalize();
              line.normalize();
              outerData[(w + 1) % nbWalls] = walls[(w + 1) % nbWalls].corner.add(lineNormal.scale(ply)).add(line.scale(direction * ply/Math.tan(angle/2)));		
              line = nextLine.clone();		
              walls[(w + 3) % nbWalls].corner.subtractToRef(walls[(w + 2) % nbWalls].corner, nextLine);	
          }
      
          var positions = [];
          var indices = [];
      
          for(var w = 0; w < nbWalls; w++) {
              positions.push(walls[w].corner.x, walls[w].corner.y, walls[w].corner.z); // iç alt köşeleri
          }
      
          for(var w = 0; w < nbWalls; w++) {
              positions.push(outerData[w].x, outerData[w].y, outerData[w].z); // dış alt köşeleri
          }
      
          for(var w = 0; w <nbWalls; w++) {
              indices.push(w, (w + 1) % nbWalls, nbWalls + (w + 1) % nbWalls, w, nbWalls + (w + 1) % nbWalls, w + nbWalls); // alt indisler
          }
  
          var currentLength = positions.length;  // iç ve dış üst köşeleri
          for(var w = 0; w < currentLength/3; w++) {
              positions.push(positions[3*w]);
              positions.push(height);
              positions.push(positions[3*w + 2]);
          }
      
          currentLength = indices.length;
          for(var i = 0; i <currentLength/3; i++) {
              indices.push(indices[3*i + 2] + 2*nbWalls, indices[3*i + 1] + 2*nbWalls, indices[3*i] + 2*nbWalls ); // üst indisleri
          }
      
          for(var w = 0; w <nbWalls; w++) {
              indices.push(w, w + 2 *nbWalls, (w + 1) % nbWalls + 2*nbWalls, w, (w + 1) % nbWalls + 2*nbWalls, (w + 1) % nbWalls); // iç duvar indisleri
              indices.push((w + 1) % nbWalls + 3*nbWalls, w + 3 *nbWalls, w + nbWalls, (w + 1) % nbWalls + nbWalls, (w + 1) % nbWalls + 3*nbWalls, w + nbWalls); // dış duvar indisleri
          }		
      
          var normals = [];
          var uvs = [];
      
          BABYLON.VertexData.ComputeNormals(positions, indices, normals);
          BABYLON.VertexData._ComputeSides(BABYLON.Mesh.FRONTSIDE, positions, indices, normals, uvs);
      
          
          //Custom mesh yarat
          var customMesh = new BABYLON.Mesh("custom", scene);
  
          // vertexData(tepeData) nesnesi yarat
          var vertexData = new BABYLON.VertexData();
  
          //Pozisyonları ve indisleri vertexData'ya ata
          vertexData.positions = positions;
          vertexData.indices = indices;
          vertexData.normals = normals;
          vertexData.uvs = uvs;	
  
          // vertexData'yı custom mesh'e uygula 
          vertexData.applyToMesh(customMesh);
          
          return customMesh;
          
      }
      
      var baseData = [-5, 0, 5, 0, 5, 6, 2, 6, 2, 9, -5, 9];
      
      var corners = [];
      for(b = 0; b < baseData.length/2; b++) {
          corners.push(new corner(baseData[2*b], baseData[2*b + 1]));
      }
      
      var walls = [];
      for(c=0; c<corners.length; c++) {
          walls.push(new wall(corners[c]));
      }
      
      var ply = 0.3;
      var height = 5;
                
     map(walls, ply, height, scene)
      
      return scene;
  
  }