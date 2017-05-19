var _ = window._;
var AFRAME = window.AFRAME;
var THREE = window.THREE;

AFRAME.registerSystem('boid', {
  init: function() {
    this.entities = [];
  },
  registerBoid: function(el) { this.entities.push(el); },
  tick: function() {
    _.each(this.entities, function(boid) {
      var oldPosition = boid.getAttribute('position');

      var separation = getAwayFromOtherBoids(boid, this.entities);
            
      var convergence = moveTowardsOtherBoids(boid, this.entities);

      var velocity = separation
        .add(convergence)
        .clampScalar(-.3, .3);

      boid.setAttribute('position', {
        x: oldPosition.x + velocity.x,
        y: oldPosition.y + velocity.y,
        z: oldPosition.z + velocity.z
      })
    }.bind(this));
  },
})

function getAwayFromOtherBoids(boid, otherBoids) {
  var separation = new THREE.Vector3();
  var boidPosition = positionFromBoidElement(boid);

  var neighbors = _.filter(otherBoids, function(otherBoid) {
    return(otherBoid !== boid &&
      positionFromBoidElement(otherBoid).distanceTo(boidPosition) < 2)
  })

  _.each(neighbors, function(otherBoid) {
    var otherBoidPosition = positionFromBoidElement(otherBoid);
    separation.add(
      new THREE.Vector3(1, 1, 1).divide(
        boidPosition.sub(otherBoidPosition)
      )
    );
  });

  return separation;
}

function moveTowardsOtherBoids(boid, allBoids) {
  var convergence = new THREE.Vector3();
  var boidPosition = positionFromBoidElement(boid);
  var center = new THREE.Vector3();
  _.each(allBoids, function(boid) {
    var boidPosition = positionFromBoidElement(boid);
    center.add(boidPosition.divideScalar(allBoids.length));
  });

  return (center.sub(boidPosition)).divideScalar(allBoids.length);
}

function positionFromBoidElement(boid) {
  var elementPosition = boid.getAttribute('position');
  return new THREE.Vector3(
    elementPosition.x,
    elementPosition.y,
    elementPosition.z
  );
}

AFRAME.registerComponent('boid', {
  init: function() {
    this.system.registerBoid(this.el);
  }
})

AFRAME.registerComponent('boid-generator', {
  init: function () {
    var sceneEl = document.querySelector('a-scene');

    _.times(50, function() {
      var boidEl = document.createElement("a-entity");

      boidEl.setAttribute('boid', '');
      boidEl.setAttribute('geometry', { primitive: 'box' });
      boidEl.setAttribute( 'position', {
        x: Math.random() * 5,
        y: Math.random() * 5,
        z: Math.random() * 5
      });

      sceneEl.appendChild(boidEl);
    });
  }
});
